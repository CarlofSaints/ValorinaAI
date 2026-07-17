"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { TEAM_NAMES } from "@/lib/team";

interface Lead {
  id: string;
  company: string;
  contactName: string;
  contactEmail: string;
  website: string;
  createdBy: string;
  createdAt: string;
  status: "sent" | "submitted";
  submittedAt: string | null;
}

export default function AssessmentsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; link?: string; msg: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [createdBy, setCreatedBy] = useState(TEAM_NAMES[0]);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/assessments");
      const json = await res.json();
      setLeads(json.leads || []);
    } finally {
      setLoading(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ company, contactName, contactEmail, website, createdBy }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setResult({
        ok: true,
        link: json.link,
        msg: json.emailStatus || "Assessment link created.",
      });
      setCompany("");
      setContactName("");
      setContactEmail("");
      setWebsite("");
      refresh();
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(link);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  }

  async function remove(lead: Lead) {
    if (!confirm(`Delete the assessment for "${lead.company}"? This removes the link, submission and files.`)) return;
    await fetch(`/api/assessments/${lead.id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
  }

  const submitted = leads.filter((l) => l.status === "submitted").length;

  return (
    <>
      <Topbar title="Assessments" crumb="Workspace / Assessments" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Client Assessments</h2>
            <p>
              Send a lead the Operational &amp; ESG Pre-Kickoff Assessment, capture
              their answers and documents, then turn it into a sales brief. Based on
              Valora&apos;s form <strong>VAL-S1-FORM1.1</strong>.
            </p>
          </div>
          <button className="btn btn-gold" onClick={() => setOpen((o) => !o)}>
            + New assessment
          </button>
        </div>

        <div className="stat-row">
          <div className="stat">
            <div className="label">Assessments sent</div>
            <div className="value">{leads.length}</div>
          </div>
          <div className="stat">
            <div className="label">Completed</div>
            <div className="value">{submitted}</div>
            <div className="delta">{leads.length - submitted} awaiting response</div>
          </div>
          <div className="stat">
            <div className="label">Response rate</div>
            <div className="value">{leads.length ? Math.round((submitted / leads.length) * 100) : 0}%</div>
          </div>
        </div>

        {open && (
          <form className="card" style={{ padding: 22, marginBottom: 20 }} onSubmit={create}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>New client assessment</h3>
            <div className="two-col">
              <div className="field">
                <label>Company / lead name *</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Acme Manufacturing (Pty) Ltd" />
              </div>
              <div className="field">
                <label>Lead website</label>
                <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.co.za" />
              </div>
            </div>
            <div className="two-col">
              <div className="field">
                <label>Contact name</label>
                <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Thandi Nkosi" />
              </div>
              <div className="field">
                <label>Contact email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="thandi@acme.co.za" />
              </div>
            </div>
            <div className="field" style={{ maxWidth: 260 }}>
              <label>Owner (Valora)</label>
              <select value={createdBy} onChange={(e) => setCreatedBy(e.target.value)}>
                {TEAM_NAMES.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 12 }}>
              If you enter a contact email, the assessment link is emailed automatically
              (currently redirected to the test inbox until go-live).
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create & get link"}
            </button>

            {result && (
              <div
                style={{
                  marginTop: 14,
                  fontSize: 12.5,
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: result.ok ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.08)",
                  color: result.ok ? "#157f3b" : "#b91c1c",
                  border: `1px solid ${result.ok ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"}`,
                }}
              >
                <div>{result.ok ? "✓ " : "⚠ "}{result.msg}</div>
                {result.link && (
                  <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <code style={{ background: "#fff", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, wordBreak: "break-all" }}>
                      {result.link}
                    </code>
                    <button type="button" className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => copy(result.link!)}>
                      {copied === result.link ? "Copied!" : "Copy link"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        )}

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ color: "var(--ink-faint)" }}>Loading…</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} style={{ color: "var(--ink-faint)", textAlign: "center", padding: 30 }}>No assessments yet — create your first one.</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <div className="user-name">{l.company}</div>
                      {l.website && <div className="user-email">{l.website}</div>}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {l.contactName || "—"}
                      {l.contactEmail && <div className="user-email">{l.contactEmail}</div>}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--ink-soft)" }}>{l.createdBy ? l.createdBy.split(" ")[0] : "—"}</td>
                    <td>
                      <span className={`badge ${l.status === "submitted" ? "badge-green" : "badge-gray"}`}>
                        <span className="dot" /> {l.status === "submitted" ? "Submitted" : "Sent"}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                      {new Date(l.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
                    </td>
                    <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                      <button className="btn btn-ghost" style={{ padding: "6px 10px", marginRight: 6 }} onClick={() => copy(`${location.origin}/assessment/${l.id}`)}>
                        {copied === `${location.origin}/assessment/${l.id}` ? "Copied!" : "Copy link"}
                      </button>
                      <Link className="btn btn-ghost" style={{ padding: "6px 10px", marginRight: 6 }} href={`/assessments/${l.id}`}>
                        View
                      </Link>
                      <button className="del-idea" style={{ padding: "6px 8px" }} onClick={() => remove(l)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
