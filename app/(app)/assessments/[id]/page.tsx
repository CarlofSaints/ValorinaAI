"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { ASSESSMENT } from "@/lib/assessment";

interface Lead {
  id: string; company: string; contactName: string; contactEmail: string;
  website: string; createdBy: string; createdAt: string;
  status: "sent" | "submitted"; submittedAt: string | null;
}
interface SubFile { fieldId: string; name: string; url: string; size: number; type: string }
interface Submission { leadId: string; submittedAt: string; answers: Record<string, string | string[]>; files: SubFile[] }

function fileHref(f: SubFile) {
  return `/api/documents/view?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(f.name)}`;
}

export default function AssessmentDetail() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/assessments/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Not found");
        setLead(json.lead);
        setSubmission(json.submission);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const answers = submission?.answers || {};

  return (
    <>
      <Topbar title="Assessment" crumb="Workspace / Assessments / Detail" />
      <div className="content">
        <Link href="/assessments" style={{ fontSize: 13, color: "var(--ink-soft)" }}>← Back to assessments</Link>

        {loading ? (
          <div style={{ marginTop: 20, color: "var(--ink-faint)" }}>Loading…</div>
        ) : error ? (
          <div className="notice" style={{ marginTop: 16, background: "rgba(220,38,38,0.08)", color: "#b91c1c", borderColor: "rgba(220,38,38,0.25)" }}>⚠ {error}</div>
        ) : lead ? (
          <>
            <div className="page-head" style={{ marginTop: 14 }}>
              <div>
                <h2>{lead.company}</h2>
                <p>
                  {lead.contactName && <>{lead.contactName} · </>}
                  {lead.contactEmail && <>{lead.contactEmail} · </>}
                  {lead.website && (
                    <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={{ color: "var(--navy-800)", textDecoration: "underline" }}>
                      {lead.website}
                    </a>
                  )}
                </p>
              </div>
              <span className={`badge ${lead.status === "submitted" ? "badge-green" : "badge-gray"}`}>
                <span className="dot" /> {lead.status === "submitted" ? "Submitted" : "Awaiting response"}
              </span>
            </div>

            {/* Phase B teaser */}
            <div className="card" style={{ padding: 18, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                <strong style={{ color: "var(--ink)" }}>Generate a sales brief</strong> — combine these answers with {lead.company}&apos;s website and public information into a custom client document.
              </div>
              <button className="btn btn-gold" disabled style={{ opacity: 0.55, cursor: "not-allowed" }} title="Coming in Phase B">
                Generate sales brief · Soon
              </button>
            </div>

            {!submission ? (
              <div className="card empty">
                <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
                <div>No response yet. The client hasn&apos;t completed the assessment.</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  Share link: <code style={{ background: "#f5f6f8", padding: "2px 6px", borderRadius: 4 }}>/assessment/{lead.id}</code>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 14 }}>
                  Submitted {new Date(submission.submittedAt).toLocaleString("en-ZA")}
                </div>
                {ASSESSMENT.sections.map((section) => (
                  <div className="card" key={section.id} style={{ padding: 22, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 14 }}>{section.title}</h3>
                    {section.fields.map((field) => {
                      const raw = answers[field.id];
                      const other = answers[`${field.id}_other`];
                      const files = submission.files.filter((f) => f.fieldId === field.id);
                      let display: React.ReactNode = <span style={{ color: "var(--ink-faint)" }}>—</span>;
                      if (field.type === "file") {
                        display = files.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {files.map((f) => (
                              <a key={f.url} href={fileHref(f)} target="_blank" rel="noreferrer" style={{ color: "var(--navy-800)", textDecoration: "underline", fontSize: 13 }}>
                                📎 {f.name}
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "var(--ink-faint)" }}>No files uploaded</span>
                        );
                      } else if (Array.isArray(raw)) {
                        const vals = [...raw];
                        if (other) vals.push(`Other: ${other}`);
                        display = vals.length ? (
                          <div className="idea-tags">{vals.map((v) => <span className="idea-tag" key={v}>{v}</span>)}</div>
                        ) : display;
                      } else if (raw) {
                        display = <span>{raw}{other ? ` — ${other}` : ""}</span>;
                      }
                      return (
                        <div key={field.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                          <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 4 }}>{field.label}</div>
                          <div style={{ fontSize: 13.5 }}>{display}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
