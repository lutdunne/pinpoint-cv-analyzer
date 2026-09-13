import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ hasAnalysis: false });
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                resumes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
        });

        // Check if user has any completed analyses
        const hasAnalysis = user?.resumes && user.resumes.length > 0;

        return NextResponse.json({
            hasAnalysis,
            latestResume: hasAnalysis ? user.resumes[0] : null
        });
    } catch (error) {
        console.error("Error checking user analysis:", error);
        return NextResponse.json({ hasAnalysis: false }, { status: 500 });
    }
}
