import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { checkPremiumAccess, filterFeedbackForPreview } from "@/lib/serverAuth";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get specific résumé
        const resume = await prisma.resume.findFirst({
            where: {
                id,
                userId: user.id, // Ensure user owns this résumé
            },
        });

        if (!resume) {
            return NextResponse.json({ error: "Résumé not found" }, { status: 404 });
        }

        // Parse JSON fields
        const fullFeedback = resume.feedback ? JSON.parse(resume.feedback) : null;
        const premium = await checkPremiumAccess(session.user.email, id);
        const feedback = premium.isPremium
            ? fullFeedback
            : filterFeedbackForPreview(fullFeedback);

        const resumeData = {
            ...resume,
            strengths: resume.strengths ? JSON.parse(resume.strengths) : null,
            improvements: resume.improvements ? JSON.parse(resume.improvements) : null,
            actionPlan: resume.actionPlan ? JSON.parse(resume.actionPlan) : null,
            feedback,
            isPaid: premium.isPaid,
            isPreview: !premium.isPremium,
        };

        return NextResponse.json({ resume: resumeData });
    } catch (error) {
        console.error("Error fetching résumé:", error);
        return NextResponse.json(
            { error: "Failed to fetch résumé" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete résumé (only if user owns it)
        await prisma.resume.deleteMany({
            where: {
                id,
                userId: user.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Résumé deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting résumé:", error);
        return NextResponse.json(
            { error: "Failed to delete résumé" },
            { status: 500 }
        );
    }
}
