import { NextRequest, NextResponse } from "next/server";
import { addUser, findUser } from "@/lib/users-store";

export const runtime = "nodejs";

// One-time seed of the first admin. Secret-guarded (AUTH_BOOTSTRAP_SECRET).
export async function POST(req: NextRequest) {
  try {
    const { secret, email, name, password } = await req.json();
    if (!process.env.AUTH_BOOTSTRAP_SECRET || secret !== process.env.AUTH_BOOTSTRAP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (await findUser(String(email || ""))) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }
    const res = await addUser({
      email: String(email),
      name: String(name || ""),
      role: "Administrator",
      password: String(password),
    });
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Bootstrap failed" },
      { status: 500 }
    );
  }
}
