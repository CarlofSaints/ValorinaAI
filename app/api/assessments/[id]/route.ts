import { NextRequest, NextResponse } from "next/server";
import { getLead, getSubmission, deleteLead } from "@/lib/assessment-store";
import { requirePermission } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const submission = await getSubmission(id);
  return NextResponse.json({ lead, submission });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requirePermission("manage_assessments"))) {
    return NextResponse.json({ error: "You don't have permission to delete assessments." }, { status: 403 });
  }
  const { id } = await params;
  await deleteLead(id);
  return NextResponse.json({ ok: true });
}
