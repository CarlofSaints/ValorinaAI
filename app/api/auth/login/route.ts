import { NextRequest, NextResponse } from "next/server";
import { verifyLogin } from "@/lib/users-store";
import { signSession, SESSION_COOKIE } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    const user = await verifyLogin(String(email), String(password));
    if (!user) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }
    const token = await signSession({ email: user.email, name: user.name, role: user.role });
    const res = NextResponse.json({ ok: true, user: { name: user.name, role: user.role } });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Login failed" },
      { status: 500 }
    );
  }
}
