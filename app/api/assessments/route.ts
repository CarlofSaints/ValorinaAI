import { NextRequest, NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/assessment-store";
import { sendAssessmentInviteEmail } from "@/lib/email";

export const runtime = "nodejs";

function linkFor(req: NextRequest, id: string) {
  const base = process.env.APP_BASE_URL || new URL(req.url).origin;
  return `${base}/assessment/${id}`;
}

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list assessments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const company = String(body.company || "").trim();
    const contactEmail = String(body.contactEmail || "").trim();
    if (!company) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }
    if (contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail)) {
      return NextResponse.json({ error: "Contact email looks invalid." }, { status: 400 });
    }

    const lead = await createLead({
      company,
      contactName: String(body.contactName || ""),
      contactEmail,
      website: String(body.website || ""),
      createdBy: String(body.createdBy || ""),
    });

    const link = linkFor(req, lead.id);

    let emailStatus: string | null = null;
    if (contactEmail) {
      const res = await sendAssessmentInviteEmail({
        to: contactEmail,
        company: lead.company,
        contactName: lead.contactName,
        link,
      });
      emailStatus = res.ok
        ? res.redirected
          ? `Invite sent to test inbox (${res.to}) instead of ${contactEmail}.`
          : `Invite emailed to ${contactEmail}.`
        : `Link created, but email failed: ${res.error}`;
    }

    return NextResponse.json({ lead, link, emailStatus });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create assessment" },
      { status: 500 }
    );
  }
}
