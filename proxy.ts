import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
    const pathName = request.nextUrl.pathname;
    const sessionCookie = getSessionCookie(request);

    const publicRoutes = [
        "/login",
        "/accept",
        "/setup",
        "/forgot-password",
        "/reset-password",
    ];

    const isPublicRoute = publicRoutes.some((route) =>
        pathName.startsWith(route)
    );

    // Public routes - allow through
    if (isPublicRoute) {
        // But redirect to dashboard if logged in and on login/setup
        if (sessionCookie && (pathName === "/login" || pathName === "/setup")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
    }

    // Protected route - no cookie
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Protected route - verify session
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("better-auth.session_token");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};