import { NextRequest, NextResponse } from "next/server";
import { getMatrix, saveMatrix, PERMISSIONS, ROLES, can } from "@/lib/roles-store";
import { getSession, requirePermission } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const matrix = await getMatrix();
  return NextResponse.json({
    permissions: PERMISSIONS,
    roles: ROLES,
    matrix,
    canEdit: await can(s.role, "manage_roles"),
  });
}

export async function PUT(req: NextRequest) {
  const admin = await requirePermission("manage_roles");
  if (!admin) return NextResponse.json({ error: "You don't have permission to manage roles." }, { status: 403 });
  const body = await req.json();
  if (!body || typeof body.matrix !== "object") {
    return NextResponse.json({ error: "Missing matrix" }, { status: 400 });
  }
  const matrix = await saveMatrix(body.matrix);
  return NextResponse.json({ ok: true, matrix });
}
