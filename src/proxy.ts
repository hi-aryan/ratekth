import { auth } from "@/services/auth";
import { NextResponse } from "next/server";

/**
 * Middleware: Route protection using Auth.js v5.
 * Runs at Edge before page load.
 */

// Routes that require authentication
const protectedPaths = ["/account", "/review/new", "/review/"];

// Routes only for guests (redirect logged-in users away)  
const authPaths = ["/login", "/register", "/reset-password"];

export const proxy = auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isProtectedPath = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
    );
    const isAuthPath = authPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
    );

    // Guests trying to access protected routes → login
    if (isProtectedPath && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Logged-in users on auth pages → home
    if (isAuthPath && isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
