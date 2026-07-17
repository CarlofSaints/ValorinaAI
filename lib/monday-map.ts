// Field mapping between the monday.com lead board and our assessment.
// The column IDs below are filled in AFTER introspecting the real board via
// GET /api/monday/board?id=<board>&secret=<secret>. Until then the webhook
// still works — it just pre-fills less.

export const MONDAY_MAP = {
  // The board leads are created on (also set MONDAY_BOARD_ID env for setup).
  boardId: process.env.MONDAY_BOARD_ID || "",

  // Trigger: fire when this status column changes to this label.
  statusColumnId: process.env.MONDAY_STATUS_COLUMN || "status",
  triggerLabel: process.env.MONDAY_TRIGGER_LABEL || "Send Assessment",

  // Lead fields ← monday column id. Empty string = "use the item name".
  companyColumnId: "", // "" → item name is the company
  contactNameColumnId: "", // TODO after introspection
  contactEmailColumnId: "", // TODO after introspection
  websiteColumnId: "", // TODO after introspection

  // Assessment pre-fill: our assessment field id → monday column id.
  // Only add ones whose monday value maps cleanly to our field.
  prefill: {
    // hq: "text_mkxxxx",
    // industry: "dropdown_mkxxxx",
  } as Record<string, string>,
};
