import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "digital-warehouse-palm-oil-secret-key-2026-secure-jwt-token"
);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/scan",
  "/materials",
  "/bincards",
  "/transactions",
  "/reports",
  "/users",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("warehouse_session")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // Jika belum login dan mengakses halaman terproteksi
  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Khusus route /users: Hanya boleh diakses oleh ADMIN
  if (pathname.startsWith("/users") && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Jika sudah login dan mencoba mengakses /login, arahkan langsung ke /dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",
    "/materials/:path*",
    "/bincards/:path*",
    "/transactions/:path*",
    "/reports/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/login",
  ],
};
