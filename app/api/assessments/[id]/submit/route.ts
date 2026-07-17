import { NextRequest, NextResponse } from "next/server";
import { getLead, saveSubmission, saveSubmissionFile, SubmittedFile } from "@/lib/assessment-store";

export const runtime = "nodejs";

// Vercel request bodies cap ~4.5MB; the whole multipart (answers + files) must
// fit. Keep a margin. Phase B moves large uploads to direct client upload.
const MAX_TOTAL = 4 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lead = await getLead(id);
    if (!lead) {
      return NextResponse.json({ error: "This assessment link is not valid." }, { status: 404 });
    }

    const form = await req.formData();
    const answersRaw = form.get("answers");
    let answers: Record<string, string | string[]> = {};
    if (typeof answersRaw === "string") {
      try {
        answers = JSON.parse(answersRaw);
      } catch {
        return NextResponse.json({ error: "Malformed answers." }, { status: 400 });
      }
    }

    // Collect file entries (keyed "file__<fieldId>"), enforce total size.
    let total = 0;
    const fileEntries: { fieldId: string; file: File }[] = [];
    for (const [key, val] of form.entries()) {
      if (key.startsWith("file__") && val instanceof File && val.size > 0) {
        total += val.size;
        fileEntries.push({ fieldId: key.slice("file__".length), file: val });
      }
    }
    if (total > MAX_TOTAL) {
      return NextResponse.json(
        { error: "Uploaded files are too large for now (keep the total under ~4MB). You can email large files separately." },
        { status: 413 }
      );
    }

    const files: SubmittedFile[] = [];
    for (const { fieldId, file } of fileEntries) {
      files.push(await saveSubmissionFile(id, fieldId, file));
    }

    await saveSubmission(id, answers, files);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Submission failed." },
      { status: 500 }
    );
  }
}
