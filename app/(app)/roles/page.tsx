import Topbar from "@/components/Topbar";
import { TEAM } from "@/lib/team";

const memberCount = (roleName: string) =>
  TEAM.filter((m) => m.role === roleName).length;

const perms = [
  "View Idea Canvas",
  "Create & edit ideas",
  "Run client diagnostics",
  "Draft proposals & reports",
  "Manage knowledge base",
  "Invite users",
  "Manage roles & billing",
];

const roles = [
  {
    name: "Administrator",
    color: "var(--gold)",
    desc: "Full control of the workspace, users, roles and billing.",
    members: memberCount("Administrator"),
    grants: [true, true, true, true, true, true, true],
  },
  {
    name: "Consultant",
    color: "#0f2542",
    desc: "Delivery team — runs diagnostics and drafts client-facing work.",
    members: memberCount("Consultant"),
    grants: [true, true, true, true, true, false, false],
  },
  {
    name: "Sales",
    color: "#b45309",
    desc: "Pitch support — proposals, follow-ups and meeting prep.",
    members: memberCount("Sales"),
    grants: [true, true, false, true, false, false, false],
  },
  {
    name: "Analyst",
    color: "#7c3aed",
    desc: "Supports diagnostics and idea capture, no external drafts.",
    members: memberCount("Analyst"),
    grants: [true, true, true, false, false, false, false],
  },
  {
    name: "Client (Read-only)",
    color: "#64748b",
    desc: "Guest access to shared boards and approved deliverables only.",
    members: memberCount("Client (Read-only)"),
    grants: [true, false, false, false, false, false, false],
  },
];

export default function RolesPage() {
  return (
    <>
      <Topbar title="Roles & Permissions" crumb="Workspace / Roles & Permissions" />
      <div className="content">
        <div className="page-head">
          <div>
            <h2>Roles &amp; Permissions</h2>
            <p>
              Define what each type of user can do. Permissions are grouped by
              capability so access stays aligned with Valora&apos;s delivery and
              sales workflow — and client data stays protected.
            </p>
          </div>
          <button className="btn btn-gold">+ New role</button>
        </div>

        <div className="role-grid">
          {roles.map((r) => (
            <div key={r.name} className="role-card">
              <div>
                <h3>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: r.color,
                      display: "inline-block",
                    }}
                  />
                  {r.name}
                </h3>
                <div className="role-desc" style={{ marginTop: 6 }}>
                  {r.desc}
                </div>
                <div className="count" style={{ marginTop: 8 }}>
                  {r.members} member{r.members === 1 ? "" : "s"}
                </div>
              </div>
              <div className="perm-list">
                {perms.map((p, i) => (
                  <div className="perm-row" key={p}>
                    <span>{p}</span>
                    {r.grants[i] ? (
                      <span className="check">✓</span>
                    ) : (
                      <span className="cross">—</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost" style={{ justifyContent: "center" }}>
                Edit permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
