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

        await prisma.user.delete({
            where: { id: user.id },
        });

        return NextResponse.json(
            { message: "Account deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: "Failed to delete account" },
            { status: 500 }
        );
    }
}
