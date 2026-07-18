import { NextRequest, NextResponse } from "next/server";
import { listUsers, addUser, deleteUser } from "@/lib/users-store";
import { getSession, requireAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ users: await listUsers(), me: { email: s.email, role: s.role } });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const res = await addUser({
    email: String(body.email || ""),
    name: String(body.name || ""),
    role: String(body.role || "Consultant"),
    password: String(body.password || ""),
  });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  if (email.toLowerCase() === admin.email.toLowerCase()) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }
  await deleteUser(email);
  return NextResponse.json({ ok: true });
}
