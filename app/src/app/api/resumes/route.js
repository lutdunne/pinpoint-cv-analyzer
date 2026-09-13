import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { fileName, fileData, parsedText, feedback } = body;

        if (!fileName || !fileData || !parsedText) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Save résumé
        const resume = await prisma.resume.create({
            data: {
                userId: user.id,
                fileName,
                fileData,
                parsedText,
                score: feedback?.resume?.score || null,
                strengths: feedback?.resume?.strengths ? JSON.stringify(feedback.resume.strengths) : null,
                improvements: feedback?.resume?.improvements ? JSON.stringify(feedback.resume.improvements) : null,
                actionPlan: feedback?.resume?.action_plan ? JSON.stringify(feedback.resume.action_plan) : null,
                feedback: feedback ? JSON.stringify(feedback) : null,
            },
        });

        // Update usage count
        const today = new Date().toISOString().split('T')[0];
        await prisma.dailyUsage.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
            update: {
                count: {
                    increment: 1,
                },
            },
            create: {
                userId: user.id,
                date: today,
                count: 1,
            },
        });

        return NextResponse.json({
            success: true,
            resumeId: resume.id,
            message: "Résumé saved successfully"
        });
    } catch (error) {
        console.error("Error saving résumé:", error);
        return NextResponse.json(
            { error: "Failed to save résumé" },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get all résumés for this user
        const resumes = await prisma.resume.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileName: true,
                score: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error("Error fetching résumés:", error);
        return NextResponse.json(
            { error: "Failed to fetch résumés" },
            { status: 500 }
        );
    }
}
