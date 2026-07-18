import { NextRequest, NextResponse } from "next/server";
import { getMatrix, saveMatrix, PERMISSIONS, ROLES } from "@/lib/roles-store";
import { getSession, requireAdmin } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const matrix = await getMatrix();
  return NextResponse.json({
    permissions: PERMISSIONS,
    roles: ROLES,
    matrix,
    canEdit: s.role === "Administrator",
  });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  if (!body || typeof body.matrix !== "object") {
    return NextResponse.json({ error: "Missing matrix" }, { status: 400 });
  }
  const matrix = await saveMatrix(body.matrix);
  return NextResponse.json({ ok: true, matrix });
}
