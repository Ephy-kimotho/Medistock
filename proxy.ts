import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies"

export async function proxy(request: NextRequest) {

    const pathName = request.nextUrl.pathname
    const sessionCookie = getSessionCookie(request)

    // define public routes
    const publicRoutes = [
        "/login",
        "/accept",
        "/setup",
        "/forgot-password",
        "/reset-password",
        "/api/auth",
        "/api/better-auth",
    ]

    // check if the pathName is a public route
    const isPublicRoute = publicRoutes.some((route) => pathName.startsWith(route))

    // If user is not authenticated and trying to access a protected route
    if (!sessionCookie && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", request.url))
    }


    // If user is authenticated and trying to access login or setup page
    // Only redirect if they're exactly on these pages, not sub-routes
    if (sessionCookie && (pathName === "/login" || pathName === "/setup")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow all other requests to proceed
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api routes (handled by better-auth)
         */
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};
