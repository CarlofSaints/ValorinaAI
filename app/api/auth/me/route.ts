import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { permissionsForRole } from "@/lib/roles-store";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null, permissions: {} });
  return NextResponse.json({
    user: { email: s.email, name: s.name, role: s.role },
    permissions: await permissionsForRole(s.role),
  });
}
