import { NextRequest, NextResponse } from "next/server";
import { getLead } from "@/lib/assessment-store";

export const runtime = "nodejs";

// Public endpoint used by the client-facing form. Returns only what the form
// needs to render — never the internal lead metadata (createdBy, contact, etc).
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) {
    return NextResponse.json({ error: "This assessment link is not valid." }, { status: 404 });
  }
  return NextResponse.json({
    company: lead.company,
    alreadySubmitted: lead.status === "submitted",
    prefill: lead.prefill || {},
  });
}
