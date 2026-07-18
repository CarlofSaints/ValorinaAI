import { NextRequest, NextResponse } from "next/server";
import { listUsers, addUser, deleteUser, updateUser } from "@/lib/users-store";
import { getSession, requireAdmin } from "@/lib/auth-server";
import { sendCredentialsEmail } from "@/lib/email";

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
  const email = String(body.email || "");
  const name = String(body.name || "");
  const role = String(body.role || "Consultant");
  const password = String(body.password || "");
  const mustChangePassword = Boolean(body.mustChangePassword);

  const res = await addUser({ email, name, role, password, mustChangePassword });
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });

  // Email the new user their login (gated to the test inbox unless EMAIL_GO_LIVE=true).
  const loginUrl = `${new URL(req.url).origin}/login`;
  const mail = await sendCredentialsEmail({ to: email, name, role, password, loginUrl });
  const emailStatus = mail.ok
    ? mail.redirected
      ? `Welcome email redirected to the test inbox (${mail.to}) — not yet live to real addresses.`
      : `Welcome email sent to ${email}.`
    : `User created, but the welcome email failed: ${mail.error}`;

  return NextResponse.json({ ok: true, emailStatus });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const email = String(body.email || "");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  const res = await updateUser(email, { name: body.name, role: body.role });
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
