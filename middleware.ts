import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

// Paths reachable WITHOUT a session (public client form, auth, secret-guarded
// webhooks, and the public assessment sub-APIs).
function isPublic(path: string): boolean {
  if (path === "/login") return true;
  if (path.startsWith("/assessment/")) return true; // public client form
  if (path === "/api/auth/login" || path === "/api/auth/bootstrap") return true;
  if (path.startsWith("/api/monday/")) return true; // secret-guarded
  // public assessment endpoints: /api/assessments/<id>/public and /submit
  if (/^\/api\/assessments\/[^/]+\/(public|submit)$/.test(path)) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (isPublic(path)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);
  if (session) return NextResponse.next();

  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", path);
  return NextResponse.redirect(url);
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|valora-logo.png|valora-signature.png).*)"],
};
