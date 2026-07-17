"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "@/components/Topbar";
import { notifyIdeaCreatedAction } from "@/app/actions";
import {
  Attachment,
  Idea,
  Priority,
  colorForName,
  initialsFor,
  loadIdeas,
  saveIdeas,
} from "@/lib/ideas";
import { TEAM_NAMES } from "@/lib/team";

const TEAM = TEAM_NAMES;

const PRIO_LABEL: Record<Priority, string> = {
  high: "High",
  med: "Medium",
  low: "Low",
};

function uid() {
  return Math.random().toString(36).slice(2) + "-" + performance.now().toString(36);
}

export default function IdeaCanvasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loaded, setLoaded] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState(TEAM[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<Priority>("med");
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // board filter
  const [filter, setFilter] = useState<"all" | Priority>("all");
  const [search, setSearch] = useState("");

  // submit status
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setIdeas(loadIdeas());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveIdeas(ideas);
  }, [ideas, loaded]);

  function addTag() {
    const t = tagDraft.trim().replace(/,$/, "").toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: uid(),
            name: file.name,
            type: file.type,
            dataUrl: isImage ? (reader.result as string) : "",
            isImage,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("med");
    setTags([]);
    setTagDraft("");
    setAttachments([]);
    setDate(new Date().toISOString().slice(0, 10));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const idea: Idea = {
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      owner,
      ownerInitials: initialsFor(owner),
      ownerColor: colorForName(owner),
      date,
      createdAt: Date.now(),
      priority,
      tags,
      attachments,
    };
    setIdeas([idea, ...ideas]);

    // Notify the assigned owner by email (gated to the test inbox until go-live).
    setSending(true);
    setStatus(null);
    try {
      const res = await notifyIdeaCreatedAction({
        ownerName: idea.owner,
        title: idea.title,
        description: idea.description,
        priority: PRIO_LABEL[idea.priority],
        tags: idea.tags,
      });
      setStatus({ ok: res.ok, msg: res.message });
    } catch {
      setStatus({ ok: false, msg: "Idea saved, but the notification could not be sent." });
    } finally {
      setSending(false);
    }

    resetForm();
  }

  function remove(id: string) {
    setIdeas(ideas.filter((i) => i.id !== id));
  }

  const filtered = useMemo(() => {
    return ideas
      .filter((i) => (filter === "all" ? true : i.priority === filter))
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.includes(q)) ||
          i.owner.toLowerCase().includes(q)
        );
      });
  }, [ideas, filter, search]);

  const counts = useMemo(
    () => ({
      all: ideas.length,
      high: ideas.filter((i) => i.priority === "high").length,
      med: ideas.filter((i) => i.priority === "med").length,
      low: ideas.filter((i) => i.priority === "low").length,
    }),
    [ideas]
  );

  return (
    <>
      <Topbar title="Idea Canvas" crumb="Workspace / Idea Canvas" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Idea Canvas</h2>
            <p>
              Capture every idea, feature request and client insight in one
              place — with an owner, priority, custom tags and supporting files.
              This becomes the raw material Valorian turns into diagnostics and
              proposals.
            </p>
          </div>
        </div>

        <div className="notice">
          💡 Prototype note: ideas are saved to this browser so the board stays
          populated during the demo. The production build persists to Valora&apos;s
          secure workspace with full audit history.
        </div>

        <div className="canvas-layout">
          {/* ---- Capture form ---- */}
          <form className="card form-card" onSubmit={submit}>
            <h3>Capture an idea</h3>
            <div className="sub">Fill in the details and add it to the board.</div>

            <div className="field">
              <label>Idea title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Auto-summarise client onboarding docs"
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's the idea, and what problem does it solve?"
              />
            </div>

            <div className="two-col">
              <div className="field">
                <label>Owner</label>
                <select value={owner} onChange={(e) => setOwner(e.target.value)}>
                  {TEAM.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label>Priority</label>
              <div className="prio-row">
                {(["high", "med", "low"] as Priority[]).map((p) => (
                  <div
                    key={p}
                    className={`prio-opt${priority === p ? ` sel-${p}` : ""}`}
                    onClick={() => setPriority(p)}
                  >
                    {PRIO_LABEL[p]}
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Custom tags</label>
              <div className="tag-input-wrap">
                {tags.map((t) => (
                  <span className="tag-chip" key={t}>
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  placeholder={tags.length ? "" : "Type a tag, press Enter"}
                />
              </div>
            </div>

            <div className="field">
              <label>Images &amp; files</label>
              <div className="dropzone" onClick={() => fileRef.current?.click()}>
                ⬆ Click to upload images or documents
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => onFiles(e.target.files)}
                />
              </div>
              {attachments.length > 0 && (
                <div className="attach-preview">
                  {attachments.map((a) => (
                    <div className="attach-thumb" key={a.id} title={a.name}>
                      {a.isImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.dataUrl} alt={a.name} />
                      ) : (
                        <span>{a.name.slice(0, 12)}</span>
                      )}
                      <button
                        type="button"
                        className="rm"
                        onClick={() =>
                          setAttachments(attachments.filter((x) => x.id !== a.id))
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              disabled={sending}
              style={{ width: "100%", justifyContent: "center", marginTop: 6, opacity: sending ? 0.7 : 1 }}
            >
              {sending ? "Saving…" : "+ Add to board"}
            </button>

            {status && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12,
                  padding: "9px 12px",
                  borderRadius: 8,
                  background: status.ok ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
                  color: status.ok ? "#157f3b" : "#b91c1c",
                  border: `1px solid ${status.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
                }}
              >
                {status.ok ? "✓ " : "⚠ "}
                {status.msg}
              </div>
            )}
          </form>

          {/* ---- Board ---- */}
          <div>
            <div className="board-head">
              <div className="filter-row">
                <button
                  className={`chip-filter${filter === "all" ? " active" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  All ({counts.all})
                </button>
                <button
                  className={`chip-filter${filter === "high" ? " active" : ""}`}
                  onClick={() => setFilter("high")}
                >
                  High ({counts.high})
                </button>
                <button
                  className={`chip-filter${filter === "med" ? " active" : ""}`}
                  onClick={() => setFilter("med")}
                >
                  Medium ({counts.med})
                </button>
                <button
                  className={`chip-filter${filter === "low" ? " active" : ""}`}
                  onClick={() => setFilter("low")}
                >
                  Low ({counts.low})
                </button>
              </div>
              <input
                className="chip-filter"
                style={{ minWidth: 200, borderRadius: 9 }}
                type="text"
                placeholder="Search ideas…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="card empty">
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8L12 2z" />
                </svg>
                <div>No ideas yet — capture your first one on the left.</div>
              </div>
            ) : (
              <div className="idea-grid">
                {filtered.map((i) => (
                  <div className={`idea-card p-${i.priority}`} key={i.id}>
                    <div className="idea-meta">
                      <span
                        className={`badge ${
                          i.priority === "high"
                            ? "badge-gold"
                            : i.priority === "med"
                            ? "badge-navy"
                            : "badge-green"
                        }`}
                        style={{ fontSize: 10 }}
                      >
                        {PRIO_LABEL[i.priority]} priority
                      </span>
                      <span>·</span>
                      <span>{new Date(i.date).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
                    </div>

                    <h4>{i.title}</h4>
                    {i.description && <div className="desc">{i.description}</div>}

                    {i.attachments.length > 0 && (
                      <div className="idea-attach">
                        {i.attachments
                          .filter((a) => a.isImage)
                          .slice(0, 4)
                          .map((a) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={a.id} src={a.dataUrl} alt={a.name} />
                          ))}
                        {i.attachments.some((a) => !a.isImage) && (
                          <span className="idea-tag">
                            📎 {i.attachments.filter((a) => !a.isImage).length} file(s)
                          </span>
                        )}
                      </div>
                    )}

                    {i.tags.length > 0 && (
                      <div className="idea-tags">
                        {i.tags.map((t) => (
                          <span className="idea-tag" key={t}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="idea-foot">
                      <div className="idea-owner">
                        <div className="mini-avatar" style={{ background: i.ownerColor }}>
                          {i.ownerInitials}
                        </div>
                        {i.owner.split(" ")[0]}
                      </div>
                      <button className="del-idea" onClick={() => remove(i.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
