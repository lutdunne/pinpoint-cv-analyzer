import { NextResponse } from "next/server";
import PDFParser from "pdf2json";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000; // 50KB of text

// Rate limiting should be implemented via Upstash Redis or Vercel KV in production.
// In-memory Maps do not work in Serverless environments.

// Helper to separate words fused by PDF font rendering without spaces
function fixFusedPdfWords(text) {
    if (!text) return "";
    return text
        // Add space after commas, colons, semicolons, and periods if missing
        .replace(/([a-zA-Z0-9])([,:;])([a-zA-Z0-9])/g, "$1$2 $3")
        .replace(/([a-z])\.([A-Z])/g, "$1. $2")
        // Separate camelCase words: "SoftwareTesting" -> "Software Testing"
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        // Separate letters and numbers: "Feb2024" -> "Feb 2024" (removed because it breaks emails like name2024@email.com)
        // Clean up dashes
        .replace(/([a-zA-Z0-9])([–—-])([a-zA-Z0-9])/g, "$1 $2 $3")
        // Normalize multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}

export async function POST(req) {
    try {
        console.log("[DEBUG] /api/upload route hit");

        const session = await getServerSession(authOptions);
        console.log("Session:", session ? `User: ${session.user.email}` : "Anonymous");

        const ip = req.headers.get("x-forwarded-for") || req.ip || "unknown_ip";

        const formData = await req.formData();
        const file = formData.get("uploaded_file");

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            }, { status: 400 });
        }

        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
        console.log("Processing file:", sanitizedFilename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Strict MIME-type checking using Magic Bytes
        const header = buffer.toString('hex', 0, 4);
        let isPdf = false;
        let isTxt = false;

        // Check for PDF magic bytes: %PDF (25 50 44 46)
        if (header.toUpperCase() === '25504446') {
            isPdf = true;
        } 
        // We will assume it might be a valid txt if it isn't a PDF, though PDFs are preferred
        else if (file.type === 'text/plain' || sanitizedFilename.toLowerCase().endsWith('.txt')) {
            isTxt = true;
        }

        if (!isPdf && !isTxt) {
            return NextResponse.json({
                error: "Invalid file type or corrupted file. Only valid PDF and TXT files are allowed."
            }, { status: 400 });
        }

        let text = "";

        if (isPdf) {
            const pdfParser = new PDFParser();

            const parsePromise = new Promise((resolve, reject) => {
                pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
                pdfParser.on("pdfParser_dataReady", pdfData => {
                    let fullText = "";

                    if (pdfData.Pages) {
                        pdfData.Pages.forEach(page => {
                            if (page.Texts) {
                                let lastY = -1;
                                page.Texts.forEach(t => {
                                    // New line if vertical position changed significantly
                                    if (lastY !== -1 && Math.abs(t.y - lastY) > 0.4) {
                                        fullText += "\n";
                                    }
                                    lastY = t.y;

                                    if (t.R) {
                                        t.R.forEach(r => {
                                            if (r.T) {
                                                try {
                                                    const decoded = decodeURIComponent(r.T);
                                                    fullText += decoded + " ";
                                                } catch {
                                                    fullText += unescape(r.T) + " ";
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }

                    // Fallback to getRawTextContent if empty
                    if (!fullText.trim()) {
                        fullText = pdfParser.getRawTextContent() || "";
                    }

                    resolve(fullText);
                });
            });

            pdfParser.parseBuffer(buffer);
            text = await parsePromise;
        } else if (isTxt) {
            text = buffer.toString('utf-8');
        }

        let cleanText = fixFusedPdfWords(text)
            .replace(/[<>]/g, '')
            .trim();

        if (cleanText.length > MAX_TEXT_LENGTH) {
            cleanText = cleanText.substring(0, MAX_TEXT_LENGTH);
            console.warn("[Security] Text truncated to maximum length");
        }

        // Prompt Injection Sanitization
        const injectionPattern = /(ignore previous|disregard previous|system prompt|new instructions|you are now|bypass)/i;
        if (injectionPattern.test(cleanText)) {
            console.warn(`[Security] Potential prompt injection detected from ${session?.user?.email || 'Anonymous'}. Redacting payload.`);
            cleanText = "[REDACTED DUE TO SECURITY POLICY]";
            text = "[REDACTED DUE TO SECURITY POLICY]";
        }

        if (cleanText.length < 50 && cleanText !== "[REDACTED DUE TO SECURITY POLICY]") {
            return NextResponse.json({
                error: "PDF appears to be empty or could not be read properly."
            }, { status: 400 });
        }

        return NextResponse.json({
            text: cleanText,
            rawText: text,
        });
    } catch (err) {
        console.error("[ERROR in /api/upload]", err);
        return NextResponse.json(
            { error: "Failed to parse PDF. Please ensure it's a valid PDF file." },
            { status: 500 }
        );
    }
}