import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware — Admin Route Guard
 *
 * Cookie names set by the BE (token.service.ts):
 *   - dev  (HTTP) : "refresh"
 *   - prod (HTTPS): "__Host-refresh"
 *
 * Protects /admin/* routes. If the refresh cookie is absent → redirect to
 * /admin/login. If present → AdminAuthGuard does the real silent-refresh.
 */
const DEV_COOKIE = "refresh";
const PROD_COOKIE = "__Host-refresh";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/recover"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (!pathname.startsWith("/admin")) return NextResponse.next();

    if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieName = isProduction ? PROD_COOKIE : DEV_COOKIE;

    // Also accept both cookie names in dev — BE may set either depending on env
    const hasSession =
        req.cookies.has(cookieName) ||
        (!isProduction && req.cookies.has(PROD_COOKIE));

    if (!hasSession) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.search = "";
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
