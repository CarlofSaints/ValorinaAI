export type Priority = "high" | "med" | "low";

export interface Attachment {
  id: string;
  name: string;
  type: string;
  dataUrl: string; // base64 data URL (image) or empty for generic file
  isImage: boolean;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  date: string; // ISO date (YYYY-MM-DD)
  createdAt: number;
  priority: Priority;
  tags: string[];
  attachments: Attachment[];
}

const KEY = "valorina.ideas.v1";

const AVATAR_COLORS = [
  "#0f2542",
  "#8a6d1f",
  "#157f3b",
  "#b45309",
  "#7c3aed",
  "#0e7490",
];

export function colorForName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function loadIdeas(): Idea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as Idea[];
  } catch {
    return seed();
  }
}

export function saveIdeas(ideas: Idea[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(ideas));
  } catch {
    /* quota — ignore for demo */
  }
}

function mk(
  title: string,
  description: string,
  owner: string,
  priority: Priority,
  tags: string[],
  daysAgo: number
): Idea {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const iso = d.toISOString().slice(0, 10);
  return {
    id: `seed-${title.slice(0, 6)}-${daysAgo}`,
    title,
    description,
    owner,
    ownerInitials: initialsFor(owner),
    ownerColor: colorForName(owner),
    date: iso,
    createdAt: d.getTime(),
    priority,
    tags,
    attachments: [],
  };
}

export function seed(): Idea[] {
  return [
    mk(
      "Meeting Agent that listens & answers live",
      "An AI participant that sits in on client meetings, transcribes in real time and answers questions when asked — turning conversation directly into diagnostic notes and follow-up actions.",
      "Jerome Sagathevan",
      "high",
      ["meeting-agent", "flagship", "delivery"],
      1
    ),
    mk(
      "One-click client diagnostic pack",
      "Upload a client's documents and generate a background summary, pain-point map and a tailored diagnostic questionnaire in minutes.",
      "Priya Naidoo",
      "high",
      ["diagnostics", "automation"],
      2
    ),
    mk(
      "Proposal draft generator (Valora templates)",
      "First-draft proposals, pricing explanations and follow-up emails built on Valora's own templates and methodology — IP stays ours.",
      "Amina Patel",
      "med",
      ["proposals", "sales"],
      3
    ),
    mk(
      "Sector pain-point knowledge base",
      "A searchable library of sector-specific pain points, case studies and quick-win recommendations to speed up every engagement.",
      "Thabo Molefe",
      "low",
      ["knowledge-base", "research"],
      5
    ),
  ];
}
