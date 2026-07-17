"use server";

import { sendIdeaCreatedEmail, sendUserInviteEmail } from "@/lib/email";
import { memberByName } from "@/lib/team";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function inviteUserAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "Consultant").trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const res = await sendUserInviteEmail({ name, email, role });
  if (!res.ok) {
    return { ok: false, message: `Could not send invite: ${res.error}` };
  }
  return {
    ok: true,
    message: res.redirected
      ? `Invite for ${email} sent to the test inbox (${res.to}).`
      : `Invite sent to ${email}.`,
  };
}

export async function notifyIdeaCreatedAction(payload: {
  ownerName: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
}): Promise<ActionResult> {
  const owner = memberByName(payload.ownerName);
  const to = owner?.email;
  if (!to) {
    // No known owner email — skip silently, idea is still saved client-side.
    return { ok: true, message: "Idea saved." };
  }

  const res = await sendIdeaCreatedEmail({
    to,
    ownerName: payload.ownerName,
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    tags: payload.tags,
  });

  if (!res.ok) {
    return { ok: false, message: `Idea saved, but notification failed: ${res.error}` };
  }
  return {
    ok: true,
    message: res.redirected
      ? `Idea saved · notification for ${to} sent to test inbox.`
      : `Idea saved · ${payload.ownerName.split(" ")[0]} notified.`,
  };
}
