import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get all job analyses for the user
        const jobAnalyses = await prisma.jobAnalysis.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                companyName: true,
                position: true,
                matchScore: true,
                createdAt: true
            }
        });

        return NextResponse.json({ jobAnalyses });
    } catch (error) {
        console.error("[ERROR in /api/job-analyses]", error.message);
        return NextResponse.json(
            { error: "Failed to fetch job analyses", details: error.message },
            { status: 500 }
        );
    }
}
