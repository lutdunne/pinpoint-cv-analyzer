import { getAuthenticatedUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        const { session, user } = await getAuthenticatedUser();

        if (!session?.user?.email || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await prisma.resume.deleteMany({
            where: { userId: user.id },
        });

        await prisma.jobAnalysis.deleteMany({
            where: { userId: user.id },
        });

        return NextResponse.json(
            { message: "All analysis data deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting all data:", error);
        return NextResponse.json(
            { error: "Failed to delete data" },
            { status: 500 }
        );
    }
}
