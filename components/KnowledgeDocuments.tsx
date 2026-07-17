"use client";

import { useEffect, useRef, useState } from "react";
import { TEAM_NAMES } from "@/lib/team";

interface Doc {
  pathname: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface LocalMeta {
  uploader?: string;
  tags?: string[];
}

const META_KEY = "valorina.docmeta.v1";

function loadMeta(): Record<string, LocalMeta> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveMeta(m: Record<string, LocalMeta>) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "📕";
  if (["doc", "docx"].includes(ext || "")) return "📘";
  if (["xls", "xlsx", "csv"].includes(ext || "")) return "📗";
  if (["ppt", "pptx"].includes(ext || "")) return "📙";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return "🖼️";
  return "📄";
}

export default function KnowledgeDocuments() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [meta, setMeta] = useState<Record<string, LocalMeta>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploader, setUploader] = useState(TEAM_NAMES[0]);
  const [tagDraft, setTagDraft] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMeta(loadMeta());
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load");
      setDocs(json.docs || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    const tags = tagDraft
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    setUploading(true);
    setError(null);
    for (const file of list) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/documents", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Upload failed");
        const doc: Doc = json.doc;
        setDocs((prev) => [doc, ...prev.filter((d) => d.pathname !== doc.pathname)]);
        setMeta((prev) => {
          const next = { ...prev, [doc.pathname]: { uploader, tags } };
          saveMeta(next);
          return next;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    setUploading(false);
    setTagDraft("");
  }

  async function remove(doc: Doc) {
    if (!confirm(`Delete "${doc.name}"? This removes it from the store.`)) return;
    try {
      const res = await fetch(`/api/documents?url=${encodeURIComponent(doc.url)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Delete failed");
      }
      setDocs((prev) => prev.filter((d) => d.pathname !== doc.pathname));
      setMeta((prev) => {
        const next = { ...prev };
        delete next[doc.pathname];
        saveMeta(next);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const viewUrl = (doc: Doc, dl = false) =>
    `/api/documents/view?url=${encodeURIComponent(doc.url)}&name=${encodeURIComponent(
      doc.name
    )}${dl ? "&download=1" : ""}`;

  return (
    <div className="card" style={{ padding: 22, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15 }}>Valora documents</h3>
          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 2 }}>
            Load Valora&apos;s templates, proposals, case studies and methodology —
            the source material Valorian will digest. Stored privately.
          </div>
        </div>
        <span className="badge badge-navy">{docs.length} file{docs.length === 1 ? "" : "s"}</span>
      </div>

      {/* uploader controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0 12px", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Uploading as</div>
        <select
          value={uploader}
          onChange={(e) => setUploader(e.target.value)}
          style={{ padding: "7px 10px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13, background: "#fff" }}
        >
          {TEAM_NAMES.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <input
          type="text"
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          placeholder="tags, comma-separated (optional)"
          style={{ flex: 1, minWidth: 160, padding: "7px 10px", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 13 }}
        />
      </div>

      {/* dropzone */}
      <div
        className="dropzone"
        style={drag ? { borderColor: "var(--gold)", background: "var(--gold-soft)" } : undefined}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          uploadFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? "Uploading…" : "⬆ Drop files here, or click to browse (PDF, Word, Excel, images · max 4MB each)"}
        <input
          ref={fileRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <div style={{ marginTop: 12, fontSize: 12, padding: "9px 12px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.25)" }}>
          ⚠ {error}
        </div>
      )}

      {/* list */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ fontSize: 13, color: "var(--ink-faint)", padding: "16px 0" }}>Loading documents…</div>
        ) : docs.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--ink-faint)", padding: "20px 0", textAlign: "center" }}>
            No documents yet — drop Valora&apos;s files above to start the knowledge base.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((doc) => {
              const m = meta[doc.pathname] || {};
              return (
                <div
                  key={doc.pathname}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}
                >
                  <span style={{ fontSize: 22 }}>{iconFor(doc.name)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-faint)", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                      <span>{fmtSize(doc.size)}</span>
                      <span>·</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</span>
                      {m.uploader && (<><span>·</span><span>{m.uploader.split(" ")[0]}</span></>)}
                    </div>
                    {m.tags && m.tags.length > 0 && (
                      <div className="idea-tags" style={{ marginTop: 5 }}>
                        {m.tags.map((t) => (
                          <span className="idea-tag" key={t}>#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <a className="btn btn-ghost" style={{ padding: "6px 12px" }} href={viewUrl(doc)} target="_blank" rel="noreferrer">
                    View
                  </a>
                  <a className="btn btn-ghost" style={{ padding: "6px 12px" }} href={viewUrl(doc, true)}>
                    Download
                  </a>
                  <button className="del-idea" onClick={() => remove(doc)} style={{ padding: "6px 8px" }}>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: "var(--ink-faint)", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        Phase 1: files are stored privately in Vercel Blob. Next: Valorian extracts
        text and embeds these so it can answer grounded in Valora&apos;s own material
        (uploader &amp; tags become shared once the database lands).
      </div>
    </div>
  );
}
