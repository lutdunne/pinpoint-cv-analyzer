import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is a developer
    const developerEmails = process.env.DEVELOPER_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
    const isDeveloper = developerEmails.includes(session.user.email.toLowerCase());

    if (!isDeveloper) {
      return NextResponse.json(
        { error: "Only developers can reset usage" },
        { status: 403 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Reset today's usage count to 0
    const today = new Date().toISOString().split('T')[0];
    
    await prisma.dailyUsage.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      update: {
        count: 0,
      },
      create: {
        userId: user.id,
        date: today,
        count: 0,
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Daily usage reset to 0" 
    });
  } catch (error) {
    console.error("[ERROR in /api/reset-usage]", error);
    return NextResponse.json(
      { error: "Failed to reset usage" },
      { status: 500 }
    );
  }
}
