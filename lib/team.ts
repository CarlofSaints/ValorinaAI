// Single source of truth for the Valora team.
// Used by the Users page, the Idea Canvas owner dropdown, and email lookups
// so names/emails can never drift between them.

export type RoleName =
  | "Administrator"
  | "Consultant"
  | "Sales"
  | "Analyst"
  | "Client (Read-only)";

export interface TeamMember {
  name: string;
  email: string;
  role: RoleName;
  initials: string;
  color: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Jerome Sagathevan",
    email: "jerome@valoraadvisory.co.za",
    role: "Administrator",
    initials: "JS",
    color: "#0f2542",
  },
  {
    name: "Kerrelisa",
    email: "kerrelisa@valoraadvisory.co.za",
    role: "Consultant",
    initials: "KE",
    color: "#8a6d1f",
  },
  {
    name: "Omar",
    email: "omar@valoraadvisory.co.za",
    role: "Sales",
    initials: "OM",
    color: "#157f3b",
  },
  {
    name: "Jihane",
    email: "jihane@valoraadvisory.co.za",
    role: "Analyst",
    initials: "JI",
    color: "#7c3aed",
  },
];

export const TEAM_NAMES = TEAM.map((m) => m.name);

export function memberByName(name: string): TeamMember | undefined {
  return TEAM.find((m) => m.name === name);
}
