import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
    const token = await getToken({ req: request });
    const isAuthPage = request.nextUrl.pathname === "/signin";
    const isDashboard = request.nextUrl.pathname === "/dashboard";

    // Redirect to dashboard if already signed in and trying to access sign-in page
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // For dashboard access, check if user has analysis data
    if (isDashboard && token) {
        // Check if coming from a fresh sign-in (has callbackUrl param)
        const isFromSignIn = request.nextUrl.searchParams.has("callbackUrl");

        if (isFromSignIn) {
            // Let the dashboard component handle the redirect logic
            return NextResponse.next();
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/signin", "/dashboard"],
};
