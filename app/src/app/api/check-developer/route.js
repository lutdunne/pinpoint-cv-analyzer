import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ isDeveloper: false });
        }

        // Get allowed developer emails from environment variable
        const developerEmails = process.env.DEVELOPER_EMAILS?.split(",").map(email => email.trim().toLowerCase()) || [];

        // Check if user's email is in the allowed list
        const isDeveloper = developerEmails.includes(session.user.email.toLowerCase());

        return NextResponse.json({ isDeveloper });
    } catch (error) {
        console.error("Error checking developer status:", error);
        return NextResponse.json({ isDeveloper: false });
    }
}
