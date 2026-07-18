import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { email: s.email, name: s.name, role: s.role } });
}
