import { NextRequest, NextResponse } from "next/server";
import { put, list, del } from "@vercel/blob";
import { requirePermission } from "@/lib/auth-server";

export const runtime = "nodejs";

const DENY_KB = NextResponse.json(
  { error: "You don't have permission to manage the knowledge base." },
  { status: 403 }
);

const PREFIX = "documents/";
// Vercel serverless request bodies are capped ~4.5MB. Phase 1 uploads go
// through this route, so gate below that. Phase 2 switches to client-side
// multipart upload for large files.
const MAX_BYTES = 4 * 1024 * 1024;

// Recover the original filename from our "<id>__<name>" pathname convention.
function originalName(pathname: string) {
  const base = pathname.slice(PREFIX.length);
  const i = base.indexOf("__");
  return i >= 0 ? base.slice(i + 2) : base;
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    const docs = blobs
      .filter((b) => b.pathname !== PREFIX && !b.pathname.endsWith("/"))
      .map((b) => ({
        pathname: b.pathname,
        name: originalName(b.pathname),
        url: b.url,
        size: b.size,
        uploadedAt: b.uploadedAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    return NextResponse.json({ docs });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to list documents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!(await requirePermission("manage_kb"))) return DENY_KB;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `"${file.name}" is ${(file.size / 1048576).toFixed(1)}MB — over the 4MB Phase 1 limit. Larger files land with the client-upload path next.` },
        { status: 413 }
      );
    }
    const id = Date.now().toString(36);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${PREFIX}${id}__${safe}`;
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return NextResponse.json({
      doc: {
        pathname: blob.pathname,
        name: file.name,
        url: blob.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requirePermission("manage_kb"))) return DENY_KB;
  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return NextResponse.json({ error: "Missing url." }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed." },
      { status: 500 }
    );
  }
}
