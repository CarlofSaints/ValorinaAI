import { NextRequest } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

// Proxy a PRIVATE blob back to the browser. The file stays private in the
// store; it is only readable through this authenticated server route.
export async function GET(req: NextRequest) {
  const params = new URL(req.url).searchParams;
  const url = params.get("url");
  const name = params.get("name") || "document";
  const download = params.get("download") === "1";

  if (!url) return new Response("Missing url", { status: 400 });

  try {
    const result = await get(url, { access: "private" });
    if (!result || result.statusCode !== 200) {
      return new Response("Not found", { status: 404 });
    }
    const contentType =
      String((result as { contentType?: string }).contentType || "") ||
      "application/octet-stream";
    const disposition = download ? "attachment" : "inline";
    return new Response(result.stream, {
      headers: {
        "content-type": contentType,
        "content-disposition": `${disposition}; filename="${name.replace(/"/g, "")}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (e) {
    return new Response(
      e instanceof Error ? e.message : "Failed to read document",
      { status: 500 }
    );
  }
}
