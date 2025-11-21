import NextAuth from "next-auth";

import {
    DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, protectedRoutes, publicRoutes
} from "@/routes";

import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    console.log(req);
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    console.log(`is logged in ${isLoggedIn}`);
    console.log(nextUrl.pathname);
    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    console.log(isApiAuthRoute);
    if (isApiAuthRoute) {
        return null;
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return null;
    }

    if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
        return Response.redirect(new URL("/auth/sign-in", nextUrl));
    }
    return null;
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};