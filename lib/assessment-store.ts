import "server-only";
import { put, list, del, get } from "@vercel/blob";
import { randomUUID } from "node:crypto";

// Blob-backed store (Phase A — no DB yet).
//   assessments/leads/<id>.json          – the lead + link + status
//   assessments/submissions/<id>.json    – the client's answers
//   assessments/files/<id>/<field>__name – uploaded files (private)
// The lead id doubles as the unguessable share token.

const LEADS = "assessments/leads/";
const SUBS = "assessments/submissions/";
const FILES = "assessments/files/";

export interface Lead {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  website: string;
  createdBy: string;
  createdAt: string;
  status: "sent" | "submitted";
  submittedAt: string | null;
  source?: "manual" | "monday";
  mondayItemId?: string | null;
  prefill?: Record<string, string | string[]>;
}

export interface SubmittedFile {
  fieldId: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Submission {
  leadId: string;
  submittedAt: string;
  answers: Record<string, string | string[]>;
  files: SubmittedFile[];
}

async function putJson(pathname: string, obj: unknown) {
  await put(pathname, JSON.stringify(obj, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
}

async function getJson<T>(pathname: string): Promise<T | null> {
  try {
    const res = await get(pathname, { access: "private" });
    if (!res || res.statusCode !== 200) return null;
    const text = await new Response(res.stream).text();
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function createLead(input: {
  company: string;
  contactName: string;
  contactEmail: string;
  website: string;
  createdBy: string;
  source?: "manual" | "monday";
  mondayItemId?: string | null;
  prefill?: Record<string, string | string[]>;
}): Promise<Lead> {
  const id = randomUUID();
  const lead: Lead = {
    id,
    company: input.company.trim(),
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim(),
    website: input.website.trim(),
    createdBy: input.createdBy.trim(),
    createdAt: new Date().toISOString(),
    status: "sent",
    submittedAt: null,
    source: input.source || "manual",
    mondayItemId: input.mondayItemId || null,
    prefill: input.prefill || {},
  };
  await putJson(`${LEADS}${id}.json`, lead);
  return lead;
}

export async function getLead(id: string): Promise<Lead | null> {
  return getJson<Lead>(`${LEADS}${id}.json`);
}

export async function getLeadByMondayItem(itemId: string): Promise<Lead | null> {
  const leads = await listLeads();
  return leads.find((l) => l.mondayItemId === itemId) || null;
}

export async function listLeads(): Promise<Lead[]> {
  const { blobs } = await list({ prefix: LEADS });
  const leads = await Promise.all(
    blobs
      .filter((b) => b.pathname.endsWith(".json"))
      .map((b) => getJson<Lead>(b.pathname))
  );
  return leads
    .filter((l): l is Lead => Boolean(l))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSubmission(id: string): Promise<Submission | null> {
  return getJson<Submission>(`${SUBS}${id}.json`);
}

export async function saveSubmission(
  leadId: string,
  answers: Record<string, string | string[]>,
  files: SubmittedFile[]
): Promise<Submission> {
  const submission: Submission = {
    leadId,
    submittedAt: new Date().toISOString(),
    answers,
    files,
  };
  await putJson(`${SUBS}${leadId}.json`, submission);
  // Flip the lead to submitted.
  const lead = await getLead(leadId);
  if (lead) {
    lead.status = "submitted";
    lead.submittedAt = submission.submittedAt;
    await putJson(`${LEADS}${leadId}.json`, lead);
  }
  return submission;
}

export async function saveSubmissionFile(
  leadId: string,
  fieldId: string,
  file: File
): Promise<SubmittedFile> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `${FILES}${leadId}/${fieldId}__${Date.now().toString(36)}__${safe}`;
  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: false,
    contentType: file.type || undefined,
  });
  return { fieldId, name: file.name, url: blob.url, size: file.size, type: file.type };
}

export async function deleteLead(id: string): Promise<void> {
  // Remove lead, submission and any uploaded files. del() ignores missing keys.
  const { blobs } = await list({ prefix: `${FILES}${id}/` });
  const targets = [`${LEADS}${id}.json`, `${SUBS}${id}.json`, ...blobs.map((b) => b.url)];
  await del(targets).catch(() => {});
}
