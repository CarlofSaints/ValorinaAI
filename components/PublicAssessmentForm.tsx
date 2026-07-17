"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ASSESSMENT, Field } from "@/lib/assessment";

type Answers = Record<string, string | string[]>;

export default function PublicAssessmentForm({ token }: { token: string }) {
  const [company, setCompany] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "invalid" | "done" | "already">("loading");
  const [answers, setAnswers] = useState<Answers>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/assessments/${token}/public`);
        const json = await res.json();
        if (!res.ok) return setState("invalid");
        setCompany(json.company || "");
        if (json.alreadySubmitted) return setState("already");
        setAnswers((a) => ({
          ...a,
          company_name: json.company || "",
          ...(json.prefill || {}),
        }));
        setState("ready");
      } catch {
        setState("invalid");
      }
    })();
  }, [token]);

  function setText(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }
  function setRadio(id: string, v: string) {
    setAnswers((a) => ({ ...a, [id]: v }));
  }
  function toggleCheck(field: Field, v: string) {
    setAnswers((a) => {
      const cur = Array.isArray(a[field.id]) ? [...(a[field.id] as string[])] : [];
      const i = cur.indexOf(v);
      if (i >= 0) cur.splice(i, 1);
      else {
        if (field.maxSelect && cur.length >= field.maxSelect) return a;
        cur.push(v);
      }
      return { ...a, [field.id]: cur };
    });
  }
  const isChecked = (id: string, v: string) =>
    Array.isArray(answers[id]) && (answers[id] as string[]).includes(v);

  function validate(): string | null {
    for (const s of ASSESSMENT.sections) {
      for (const f of s.fields) {
        if (!f.required) continue;
        const v = answers[f.id];
        if (f.type === "checkbox") {
          if (!Array.isArray(v) || v.length === 0) return `Please answer: ${f.label}`;
        } else if (f.type !== "file") {
          if (!v || (typeof v === "string" && !v.trim())) return `Please answer: ${f.label}`;
        }
      }
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("answers", JSON.stringify(answers));
      for (const [fieldId, list] of Object.entries(files)) {
        for (const file of list) fd.append(`file__${fieldId}`, file);
      }
      const res = await fetch(`/api/assessments/${token}/submit`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (state === "loading") return <Shell><p style={{ color: "var(--ink-faint)" }}>Loading assessment…</p></Shell>;
  if (state === "invalid")
    return <Shell><h2>Link not valid</h2><p style={{ color: "var(--ink-soft)" }}>This assessment link is invalid or has expired. Please contact your Valora Advisory representative.</p></Shell>;
  if (state === "already")
    return <Shell><div style={{ fontSize: 46 }}>✓</div><h2>Already submitted</h2><p style={{ color: "var(--ink-soft)" }}>Thank you — {company}&apos;s assessment has already been received. Reach out to Valora Advisory if you need to make changes.</p></Shell>;
  if (state === "done")
    return <Shell><div style={{ fontSize: 46 }}>🎉</div><h2>Thank you!</h2><p style={{ color: "var(--ink-soft)" }}>Your Operational &amp; ESG Pre-Kickoff Assessment has been submitted to Valora Advisory. We&apos;ll be in touch to confirm your Discovery Workshop.</p></Shell>;

  return (
    <Shell wide>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 700 }}>
            {ASSESSMENT.docId}
          </div>
          <h1 style={{ fontSize: 26, letterSpacing: "-0.02em", margin: "6px 0 10px" }}>{ASSESSMENT.title}</h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>{ASSESSMENT.intro}</p>
          <div className="notice" style={{ marginTop: 14 }}>
            🔒 All data and documents are covered under Valora Advisory&apos;s NDA and stored securely.
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 18, fontSize: 13, padding: "11px 14px", borderRadius: 8, background: "rgba(220,38,38,0.08)", color: "#b91c1c", border: "1px solid rgba(220,38,38,0.25)" }}>
            ⚠ {error}
          </div>
        )}

        {ASSESSMENT.sections.map((section, si) => (
          <div className="card" key={section.id} style={{ padding: 24, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--navy-800)", color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>{si + 1}</span>
              <h2 style={{ fontSize: 17 }}>{section.title}</h2>
            </div>
            {section.note && <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 8 }}>{section.note}</div>}
            <div style={{ marginTop: 12 }}>
              {section.fields.map((field) => (
                <FieldView
                  key={field.id}
                  field={field}
                  answers={answers}
                  files={files[field.id] || []}
                  onText={setText}
                  onRadio={setRadio}
                  onToggle={toggleCheck}
                  isChecked={isChecked}
                  onFiles={(list) => setFiles((f) => ({ ...f, [field.id]: list }))}
                />
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 50 }}>
          <button type="submit" className="btn btn-gold" disabled={submitting} style={{ fontSize: 15, padding: "12px 28px" }}>
            {submitting ? "Submitting…" : "Submit assessment"}
          </button>
        </div>
      </form>
    </Shell>
  );
}

function FieldView({
  field, answers, files, onText, onRadio, onToggle, isChecked, onFiles,
}: {
  field: Field;
  answers: Answers;
  files: File[];
  onText: (id: string, v: string) => void;
  onRadio: (id: string, v: string) => void;
  onToggle: (f: Field, v: string) => void;
  isChecked: (id: string, v: string) => boolean;
  onFiles: (list: File[]) => void;
}) {
  const otherId = `${field.id}_other`;
  const fileRef = useRef<HTMLInputElement>(null);
  const otherSelected =
    field.type === "radio" ? answers[field.id] === "__other__" : isChecked(field.id, "__other__");

  return (
    <div className="field" style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13.5 }}>
        {field.label} {field.required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {field.help && <div style={{ fontSize: 12, color: "var(--ink-faint)", marginBottom: 8, marginTop: -2 }}>{field.help}</div>}

      {field.type === "text" && (
        <input type="text" value={(answers[field.id] as string) || ""} onChange={(e) => onText(field.id, e.target.value)} />
      )}

      {field.type === "textarea" && (
        <textarea value={(answers[field.id] as string) || ""} onChange={(e) => onText(field.id, e.target.value)} />
      )}

      {field.type === "radio" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {field.options?.map((opt) => (
            <Choice key={opt} type="radio" checked={answers[field.id] === opt} label={opt} onClick={() => onRadio(field.id, opt)} />
          ))}
          {field.allowOther && (
            <>
              <Choice type="radio" checked={otherSelected} label="Other" onClick={() => onRadio(field.id, "__other__")} />
              {otherSelected && (
                <input type="text" placeholder="Please specify" value={(answers[otherId] as string) || ""} onChange={(e) => onText(otherId, e.target.value)} style={{ marginLeft: 26, width: "calc(100% - 26px)" }} />
              )}
            </>
          )}
        </div>
      )}

      {field.type === "checkbox" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {field.options?.map((opt) => (
            <Choice key={opt} type="checkbox" checked={isChecked(field.id, opt)} label={opt} onClick={() => onToggle(field, opt)} />
          ))}
          {field.allowOther && (
            <>
              <Choice type="checkbox" checked={otherSelected} label={field.otherLabel || "Other"} onClick={() => onToggle(field, "__other__")} />
              {otherSelected && (
                <input type="text" placeholder="Please specify" value={(answers[otherId] as string) || ""} onChange={(e) => onText(otherId, e.target.value)} style={{ marginLeft: 26, width: "calc(100% - 26px)" }} />
              )}
            </>
          )}
          {field.maxSelect && (
            <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>
              {Array.isArray(answers[field.id]) ? (answers[field.id] as string[]).length : 0} / {field.maxSelect} selected
            </div>
          )}
        </div>
      )}

      {field.type === "file" && (
        <div>
          <div className="dropzone" onClick={() => fileRef.current?.click()}>
            ⬆ Click to upload {field.multiple ? "files" : "a file"}
            <input ref={fileRef} type="file" multiple={field.multiple} hidden onChange={(e) => onFiles(Array.from(e.target.files || []))} />
          </div>
          {files.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {files.map((f, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>📎 {f.name} <span style={{ color: "var(--ink-faint)" }}>({(f.size / 1024).toFixed(0)} KB)</span></div>
              ))}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 6 }}>Optional · keep total under ~4MB for now.</div>
        </div>
      )}
    </div>
  );
}

function Choice({ type, checked, label, onClick }: { type: "radio" | "checkbox"; checked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9,
        border: `1px solid ${checked ? "var(--gold)" : "var(--border-strong)"}`,
        background: checked ? "var(--gold-soft)" : "#fff", cursor: "pointer", textAlign: "left",
        fontSize: 13.5, color: "var(--ink)", width: "100%",
      }}
    >
      <span style={{
        width: 18, height: 18, flexShrink: 0, borderRadius: type === "radio" ? "50%" : 5,
        border: `2px solid ${checked ? "var(--gold)" : "var(--border-strong)"}`,
        background: checked ? "var(--gold)" : "#fff", display: "grid", placeItems: "center",
        color: "var(--navy-900)", fontSize: 11, fontWeight: 800,
      }}>
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ background: "linear-gradient(180deg, var(--navy-900), var(--navy-850))", padding: "20px 0", borderBottom: "3px solid var(--gold)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 14 }}>
          <Image src="/valora-logo.png" alt="Valora Advisory" width={46} height={47} style={{ borderRadius: 8 }} />
          <div>
            <div style={{ color: "#fff", fontWeight: 700, letterSpacing: "0.1em", fontSize: 16 }}>VALORA ADVISORY</div>
            <div style={{ color: "var(--gold)", fontSize: 11, letterSpacing: "0.08em" }}>Turning Insight into Impact</div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: wide ? 760 : 620, margin: "0 auto", padding: "32px 20px" }}>{children}</div>
    </div>
  );
}
