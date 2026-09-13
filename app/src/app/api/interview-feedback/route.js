import { NextResponse } from "next/server";
import { client } from "@/lib/openai";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { isDeveloperEmail, checkAndIncrementDailyUsage } from "@/lib/serverAuth";
import { DAILY_LIMIT, DEFAULT_MODEL } from "@/lib/constants";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isDeveloper = isDeveloperEmail(session.user.email);
        if (!isDeveloper) {
            const usageResult = await checkAndIncrementDailyUsage(user.id);
            if (!usageResult.allowed) {
                return NextResponse.json(
                    {
                        error: `Daily limit reached. You've used all ${DAILY_LIMIT} AI requests today. Try again tomorrow!`,
                        limitReached: true,
                        used: usageResult.currentCount,
                        limit: DAILY_LIMIT
                    },
                    { status: 429 }
                );
            }
        }

        const { question, answer, questionContext } = await req.json();

        // Validate and sanitize inputs
        if (!question || typeof question !== 'string' || !answer || typeof answer !== 'string') {
            return NextResponse.json(
                { error: "Question and answer are required and must be strings" },
                { status: 400 }
            );
        }

        // Sanitize inputs
        const sanitizedQuestion = question.replace(/[<>]/g, '').trim().slice(0, 5000);
        const sanitizedAnswer = answer.replace(/[<>]/g, '').trim().slice(0, 10000);

        if (sanitizedQuestion.length < 5 || sanitizedAnswer.length < 5) {
            return NextResponse.json(
                { error: "Question and answer must be at least 5 characters" },
                { status: 400 }
            );
        }

        console.log("[DEBUG] Analyzing interview answer...");

        const response = await client.chat.completions.create({
            model: DEFAULT_MODEL,
            response_format: { type: "json_object" },
            messages: [
                {
                    role: "system",
                    content: `You are an expert interview coach analyzing candidate answers.
Provide constructive feedback on interview responses.

You must respond with valid JSON matching this structure:
{
  "score": number (1-10, where 10 is excellent),
  "strengths": [list of 2-4 specific things done well],
  "improvements": [list of 2-4 specific areas to improve],
  "reframedAnswer": "string (brief example of how to improve the answer)"
}

Consider:
- Clarity and structure (STAR method if applicable)
- Relevance to the question
- Specific examples and metrics
- Confidence and professionalism
- Addressing all parts of the question
- Length and depth appropriate to question type`,
                },
                {
                    role: "user",
                    content: `Analyze this interview answer and provide constructive feedback.

Question: ${sanitizedQuestion}

Candidate's Answer:
${sanitizedAnswer}

${questionContext?.tips ? `Answering Tips Context:\n${questionContext.tips.slice(0, 10).join('\n')}` : ''}

${questionContext?.keyPoints ? `Key Points to Cover:\n${questionContext.keyPoints.join('\n')}` : ''}`,
                },
            ],
        });

        let raw = response.choices[0].message.content.trim();

        // Clean up potential markdown formatting
        if (raw.startsWith("```")) {
            raw = raw.replace(/```(json)?/g, "").trim();
        }

        console.log("[DEBUG] Raw AI feedback:", raw.substring(0, 500));

        let feedback;
        try {
            feedback = JSON.parse(raw);
        } catch (parseErr) {
            console.error("[ERROR] JSON Parse failed:", parseErr.message);
            console.error("[ERROR] Attempted to parse:", raw.substring(0, 1000));
            throw new Error(`Failed to parse AI response: ${parseErr.message}`);
        }

        console.log("[AI Feedback Parsed]", feedback);

        return NextResponse.json(feedback);
    } catch (err) {
        console.error("[ERROR in /api/interview-feedback]", err);
        return NextResponse.json(
            { error: "Failed to analyze answer" },
            { status: 500 }
        );
    }
}
