import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { userChangePassword, verifyLogin } from "@/lib/users-store";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();
  if (!newPassword || String(newPassword).length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }
  // Confirm the current/temporary password before changing.
  const ok = await verifyLogin(session.email, String(currentPassword || ""));
  if (!ok) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (String(newPassword) === String(currentPassword)) {
    return NextResponse.json({ error: "Please choose a different password." }, { status: 400 });
  }

  await userChangePassword(session.email, String(newPassword));

  // Re-issue the session WITHOUT the force-change flag so the redirect stops
  // immediately (no dependence on any store read — avoids the loop entirely).
  const token = await signSession({
    email: session.email,
    name: session.name,
    role: session.role,
    mustChange: false,
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
