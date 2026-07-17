import { NextRequest, NextResponse } from "next/server";
import { getItem } from "@/lib/monday";
import { MONDAY_MAP } from "@/lib/monday-map";
import { createLead, getLeadByMondayItem } from "@/lib/assessment-store";
import { sendAssessmentInviteEmail } from "@/lib/email";
import { ASSESSMENT } from "@/lib/assessment";

export const runtime = "nodejs";

function baseUrl(req: NextRequest) {
  return process.env.APP_BASE_URL || new URL(req.url).origin;
}

// Build assessment pre-fill from monday column text, only keeping values that
// map cleanly (exact option match for radios; free text for text fields).
function buildPrefill(company: string, columns: Record<string, string>) {
  const prefill: Record<string, string | string[]> = { company_name: company };
  const fieldById = Object.fromEntries(ASSESSMENT.sections.flatMap((s) => s.fields).map((f) => [f.id, f]));
  for (const [fieldId, colId] of Object.entries(MONDAY_MAP.prefill)) {
    const val = columns[colId];
    const field = fieldById[fieldId];
    if (!val || !field) continue;
    if (field.type === "radio" || field.type === "checkbox") {
      const match = field.options?.find((o) => o.toLowerCase() === val.toLowerCase());
      if (match) prefill[fieldId] = field.type === "checkbox" ? [match] : match;
    } else if (field.type === "text" || field.type === "textarea") {
      prefill[fieldId] = val;
    }
  }
  return prefill;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  // 1) Registration handshake — monday sends { challenge } and wants it echoed.
  if (typeof body.challenge === "string") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // 2) Secret check (unguessable ?secret= on the registered URL).
  const secret = new URL(req.url).searchParams.get("secret");
  if (!process.env.MONDAY_WEBHOOK_SECRET || secret !== process.env.MONDAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3) Event: only act on the trigger status column reaching the trigger label.
  const event = body.event as
    | { pulseId?: number | string; columnId?: string; value?: { label?: { text?: string } } }
    | undefined;
  if (!event?.pulseId) {
    return NextResponse.json({ ok: true, skipped: "no pulseId" });
  }
  if (event.columnId && event.columnId !== MONDAY_MAP.statusColumnId) {
    return NextResponse.json({ ok: true, skipped: "not the trigger column" });
  }
  const label = event.value?.label?.text;
  if (label && label !== MONDAY_MAP.triggerLabel) {
    return NextResponse.json({ ok: true, skipped: `label "${label}" is not the trigger` });
  }

  const itemId = String(event.pulseId);

  try {
    // Dedupe — don't create a second assessment for the same monday item.
    const existing = await getLeadByMondayItem(itemId);
    if (existing) {
      return NextResponse.json({ ok: true, skipped: "already created", leadId: existing.id });
    }

    const item = await getItem(itemId);
    if (!item) return NextResponse.json({ ok: true, skipped: "item not found" });

    const company = MONDAY_MAP.companyColumnId ? item.columns[MONDAY_MAP.companyColumnId] || item.name : item.name;
    const contactName = MONDAY_MAP.contactNameColumnId ? item.columns[MONDAY_MAP.contactNameColumnId] || "" : "";
    const contactEmail = MONDAY_MAP.contactEmailColumnId ? item.columns[MONDAY_MAP.contactEmailColumnId] || "" : "";
    const website = MONDAY_MAP.websiteColumnId ? item.columns[MONDAY_MAP.websiteColumnId] || "" : "";

    const lead = await createLead({
      company,
      contactName,
      contactEmail,
      website,
      createdBy: "Monday.com (auto)",
      source: "monday",
      mondayItemId: itemId,
      prefill: buildPrefill(company, item.columns),
    });

    const link = `${baseUrl(req)}/assessment/${lead.id}`;
    let emailStatus: string | null = null;
    if (contactEmail) {
      const r = await sendAssessmentInviteEmail({ to: contactEmail, company, contactName, link });
      emailStatus = r.ok ? (r.redirected ? `sent to test inbox (${r.to})` : `sent to ${contactEmail}`) : `failed: ${r.error}`;
    } else {
      emailStatus = "no contact email on the monday item — link created, not emailed";
    }

    return NextResponse.json({ ok: true, leadId: lead.id, link, emailStatus });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Webhook handling failed" },
      { status: 500 }
    );
  }
}
