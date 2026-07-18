import { NextRequest, NextResponse } from "next/server";
import { addUser, findUser, countUsers } from "@/lib/users-store";

export const runtime = "nodejs";

// Seed the first admin. Open only on true first-run (zero users); once any user
// exists it requires AUTH_BOOTSTRAP_SECRET, so it auto-closes after the first admin.
export async function POST(req: NextRequest) {
  try {
    const { secret, email, name, password } = await req.json();
    const isFirstRun = (await countUsers()) === 0;
    if (!isFirstRun) {
      if (!process.env.AUTH_BOOTSTRAP_SECRET || secret !== process.env.AUTH_BOOTSTRAP_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
