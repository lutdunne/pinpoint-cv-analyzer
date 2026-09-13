import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DAILY_LIMIT } from "@/lib/constants";

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

        // Get today's date string (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];

        // Get or create today's usage
        const usage = await prisma.dailyUsage.findUnique({
            where: {
                userId_date: {
                    userId: user.id,
                    date: today,
                },
            },
        });

        const currentCount = usage?.count || 0;
        const remaining = Math.max(0, DAILY_LIMIT - currentCount);

        return NextResponse.json({
            limit: DAILY_LIMIT,
            used: currentCount,
            remaining,
            canAnalyze: remaining > 0,
        });
    } catch (error) {
        console.error("Error checking usage:", error);
        return NextResponse.json(
            { error: "Failed to check usage" },
            { status: 500 }
        );
    }
}
