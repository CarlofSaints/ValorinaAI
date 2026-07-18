import "server-only";
import { put, get } from "@vercel/blob";

// Role × permission matrix, persisted as private JSON in Blob.
const PATH = "auth/roles.json";

export interface Permission {
  id: string;
  label: string;
  hint: string;
}
export interface Role {
  name: string;
  color: string;
  desc: string;
}

export const PERMISSIONS: Permission[] = [
  { id: "view_ideas", label: "View Idea Canvas", hint: "See ideas and boards" },
  { id: "edit_ideas", label: "Create & edit ideas", hint: "Add and change ideas" },
  { id: "run_diagnostics", label: "Run client diagnostics", hint: "Use the diagnostic tools" },
  { id: "draft_proposals", label: "Draft proposals & reports", hint: "Generate client-facing drafts" },
  { id: "manage_kb", label: "Manage knowledge base", hint: "Upload and organise Valora docs" },
  { id: "manage_assessments", label: "Send & view assessments", hint: "Issue and read client assessments" },
  { id: "invite_users", label: "Invite & manage users", hint: "Add, remove and reset users" },
  { id: "manage_roles", label: "Manage roles & billing", hint: "Edit this matrix and billing" },
];

export const ROLES: Role[] = [
  { name: "Administrator", color: "#c8a24c", desc: "Full control of the workspace, users, roles and billing." },
  { name: "Consultant", color: "#0f2542", desc: "Delivery team — runs diagnostics and drafts client work." },
  { name: "Sales", color: "#b45309", desc: "Pitch support — proposals, follow-ups and meeting prep." },
  { name: "Analyst", color: "#7c3aed", desc: "Supports diagnostics and idea capture; no external drafts." },
  { name: "Client (Read-only)", color: "#64748b", desc: "Guest access to shared boards and approved deliverables." },
];

export type Matrix = Record<string, Record<string, boolean>>;

// Sensible starting grants.
function defaultMatrix(): Matrix {
  const g = (perms: string[]): Record<string, boolean> =>
    Object.fromEntries(PERMISSIONS.map((p) => [p.id, perms.includes(p.id)]));
  return {
    Administrator: g(PERMISSIONS.map((p) => p.id)), // all
    Consultant: g(["view_ideas", "edit_ideas", "run_diagnostics", "draft_proposals", "manage_kb", "manage_assessments"]),
    Sales: g(["view_ideas", "edit_ideas", "draft_proposals", "manage_assessments"]),
    Analyst: g(["view_ideas", "edit_ideas", "run_diagnostics"]),
    "Client (Read-only)": g(["view_ideas"]),
  };
}

// Merge stored values over defaults so newly-added roles/permissions always appear.
function normalise(stored: Matrix | null): Matrix {
  const base = defaultMatrix();
  const out: Matrix = {};
  for (const role of ROLES) {
    out[role.name] = {};
    for (const perm of PERMISSIONS) {
      out[role.name][perm.id] =
        stored?.[role.name]?.[perm.id] ?? base[role.name]?.[perm.id] ?? false;
    }
  }
  return out;
}

export async function getMatrix(): Promise<Matrix> {
  try {
    const res = await get(PATH, { access: "private", useCache: false });
    if (!res || res.statusCode !== 200) return normalise(null);
    const text = await new Response(res.stream).text();
    return normalise(JSON.parse(text) as Matrix);
  } catch {
    return normalise(null);
  }
}

export async function saveMatrix(matrix: Matrix): Promise<Matrix> {
  const clean = normalise(matrix);
  await put(PATH, JSON.stringify(clean, null, 2), {
    access: "private",
    addRandomSuffix: false,
    contentType: "application/json",
    allowOverwrite: true,
  });
  return clean;
}
