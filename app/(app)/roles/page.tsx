"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/Topbar";

interface Permission { id: string; label: string; hint: string }
interface Role { name: string; color: string; desc: string }
type Matrix = Record<string, Record<string, boolean>>;

export default function RolesPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [matrix, setMatrix] = useState<Matrix>({});
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [save, setSave] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/roles");
        const json = await res.json();
        setPermissions(json.permissions || []);
        setRoles(json.roles || []);
        setMatrix(json.matrix || {});
        setCanEdit(Boolean(json.canEdit));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next: Matrix) {
    setSave("saving");
    try {
      const res = await fetch("/api/roles", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matrix: next }),
      });
      if (!res.ok) throw new Error();
      setSave("saved");
      setTimeout(() => setSave("idle"), 1500);
    } catch {
      setSave("error");
    }
  }

  function toggle(roleName: string, permId: string) {
    if (!canEdit) return;
    const next: Matrix = {
      ...matrix,
      [roleName]: { ...matrix[roleName], [permId]: !matrix[roleName]?.[permId] },
    };
    setMatrix(next);
    persist(next);
  }

  return (
    <>
      <Topbar title="Roles & Permissions" crumb="Workspace / Roles & Permissions" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Roles &amp; Permissions</h2>
            <p>
              Switch each capability on or off per role. Access stays aligned with
              Valora&apos;s delivery and sales workflow — and client data stays protected.
              {canEdit ? " Changes save automatically." : " Only administrators can change these."}
            </p>
          </div>
          <div style={{ fontSize: 12, minWidth: 90, textAlign: "right", color: "var(--ink-faint)" }}>
            {save === "saving" && "Saving…"}
            {save === "saved" && <span style={{ color: "#157f3b" }}>✓ Saved</span>}
            {save === "error" && <span style={{ color: "#b91c1c" }}>⚠ Save failed</span>}
          </div>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 24, color: "var(--ink-faint)" }}>Loading…</div>
        ) : (
          <div className="card" style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th style={{ minWidth: 240 }}>Permission</th>
                  {roles.map((r) => (
                    <th key={r.name} style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 3, background: r.color, display: "inline-block" }} />
                        {r.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{p.hint}</div>
                    </td>
                    {roles.map((r) => {
                      const on = Boolean(matrix[r.name]?.[p.id]);
                      return (
                        <td key={r.name} style={{ textAlign: "center" }}>
                          <button
                            role="switch"
                            aria-checked={on}
                            aria-label={`${p.label} for ${r.name}`}
                            disabled={!canEdit}
                            onClick={() => toggle(r.name, p.id)}
                            style={{
                              width: 40,
                              height: 22,
                              borderRadius: 999,
                              border: "none",
                              position: "relative",
                              cursor: canEdit ? "pointer" : "default",
                              background: on ? "var(--gold)" : "var(--border-strong)",
                              transition: "background .15s",
                              opacity: canEdit ? 1 : 0.7,
                              verticalAlign: "middle",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: 2,
                                left: on ? 20 : 2,
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                background: "#fff",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                                transition: "left .15s",
                              }}
                            />
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Role descriptions */}
        <div className="role-grid" style={{ marginTop: 20 }}>
          {roles.map((r) => (
            <div className="role-card" key={r.name} style={{ gap: 8 }}>
              <h3>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: r.color, display: "inline-block" }} />
                {r.name}
              </h3>
              <div className="role-desc">{r.desc}</div>
              <div className="count">
                {permissions.filter((p) => matrix[r.name]?.[p.id]).length} of {permissions.length} permissions
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
