import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { requirePermission } from "@/lib/auth-server";
import { adminResetPassword, findUser } from "@/lib/users-store";
import { sendCredentialsEmail } from "@/lib/email";

export const runtime = "nodejs";

function generatePassword(): string {
  return "Valora-" + randomBytes(4).toString("hex") + "-" + randomBytes(2).toString("hex");
}

// Admin resets a user's password. If no password supplied, auto-generates one.
// Always forces the user to change it on next login. Emails the new credentials.
export async function POST(req: NextRequest) {
  const admin = await requirePermission("invite_users");
  if (!admin) return NextResponse.json({ error: "You don't have permission to manage users." }, { status: 403 });

  const body = await req.json();
  const email = String(body.email || "");
  const user = await findUser(email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const password = String(body.password || "").trim() || generatePassword();
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const ok = await adminResetPassword(email, password);
  if (!ok) return NextResponse.json({ error: "Reset failed" }, { status: 500 });

  const loginUrl = `${new URL(req.url).origin}/login`;
  const mail = await sendCredentialsEmail({ to: user.email, name: user.name, role: user.role, password, loginUrl });
  const emailStatus = mail.ok
    ? mail.redirected
      ? `New password emailed to the test inbox (${mail.to}) — not yet live to real addresses.`
      : `New password emailed to ${user.email}.`
    : `Password reset, but email failed: ${mail.error}`;

  return NextResponse.json({ ok: true, password, emailStatus });
}
