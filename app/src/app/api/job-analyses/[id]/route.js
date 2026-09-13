import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
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

        const { id } = params;

        // Get specific job analysis
        const jobAnalysis = await prisma.jobAnalysis.findUnique({
            where: { id }
        });

        if (!jobAnalysis) {
            return NextResponse.json({ error: "Job analysis not found" }, { status: 404 });
        }

        // Verify ownership
        if (jobAnalysis.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Parse the JSON analysis
        const analysis = JSON.parse(jobAnalysis.analysis);

        return NextResponse.json({
            id: jobAnalysis.id,
            companyName: jobAnalysis.companyName,
            position: jobAnalysis.position,
            matchScore: jobAnalysis.matchScore,
            jobDescription: jobAnalysis.jobDescription,
            analysis,
            createdAt: jobAnalysis.createdAt
        });
    } catch (error) {
        console.error("[ERROR in /api/job-analyses/[id]]", error.message);
        return NextResponse.json(
            { error: "Failed to fetch job analysis", details: error.message },
            { status: 500 }
        );
    }
}
