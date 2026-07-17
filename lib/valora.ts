// Digested from valoraadvisory.co.za (home, /services, /about, /approach,
// /ai-automation). This is the grounding profile for Valorian — the same
// source that will later feed the AI's context/RAG. Keep it factual to their
// site so the tool speaks in Valora's own language.

export const VALORA = {
  tagline: "Turning Insight into Impact",
  secondaryTagline: "Turning Operational Challenges Into Measurable Business Value",
  positioning:
    "A consulting and implementation firm — built to close the gap between strategy and execution. Most firms hand you a strategy and leave; Valora combines senior advisory with hands-on implementation, working alongside your team to translate operational insight into repeatable results.",
  reach: "Sector-agnostic · 10+ industries served · custom AI delivered through a global network of ~1,000 AI engineers",

  // Diagnose → Design → Implement → Measure ("A disciplined cycle, executed in the open")
  cycle: [
    {
      step: "Diagnose",
      text: "Establish the operational baseline — cost, process, systems, data, people — and where value is leaking.",
    },
    {
      step: "Design",
      text: "Blueprints, target operating models and prioritised initiatives sized to your business and maturity.",
    },
    {
      step: "Implement",
      text: "Configure, integrate, automate, roll out — with your teams, not around them.",
    },
    {
      step: "Measure",
      text: "Track KPI movement, report to the executive, iterate. Value isn't real until it's on the scorecard.",
    },
  ],

  services: [
    {
      name: "Business Process Optimization",
      text: "Map, streamline and re-engineer the workflows that shape cost, quality and speed. Fewer handoffs, less rework, measurable throughput gains.",
    },
    {
      name: "Workflow Automation & Optimization",
      text: "Automate the repetitive, orchestrate the complex. Free capacity for the work that actually needs judgement.",
    },
    {
      name: "Systems Integration & Implementation",
      text: "Connect the tools you already have and deploy the ones you're missing — ERPs, CRMs, operational platforms — as a single working stack.",
    },
    {
      name: "Data Analytics & Reporting",
      text: "Turn scattered operational data into a single source of truth. Executive dashboards, forecasting and reporting your teams actually trust.",
    },
    {
      name: "Cost Optimization Strategies",
      text: "Structural cost reviews across operations, procurement and systems — targeting durable savings, not one-off cuts.",
    },
    {
      name: "Carbon Footprint & ESG Reporting Support",
      text: "Instrument, measure and report your environmental and governance data — audit-ready and integrated with operational data.",
    },
    {
      name: "AI Integration & Automation",
      text: "Custom AI designed and built for your operations. Every client receives a bespoke AI Roadmap.",
    },
  ],

  // Valora's own published AI-agent catalogue — the shape Valorian can grow into.
  agentCatalogue: [
    { name: "AI Receptionist", text: "Lead capture and meeting booking." },
    { name: "Sales AI Agent", text: "Lead qualification and proposal generation." },
    { name: "Finance AI Agent", text: "Invoice processing and collections management." },
    { name: "HR AI Agent", text: "Recruitment, onboarding and employee support." },
    { name: "Operations AI Agent", text: "Operations monitoring and workflow optimization." },
    { name: "Knowledge AI Agent", text: "Business data retrieval for instant answers." },
    { name: "Document AI Agent", text: "Document extraction, classification and processing." },
    { name: "Executive AI Agent", text: "Daily insights and performance alerts." },
  ],

  differentiators: [
    "Implementation-Focused — delivering beyond recommendations",
    "Measurable Results — tracking cost, cycle time and decision quality",
    "Integrated Approach — processes, systems, data and AI as one",
    "Practical & Agile — right-sized solutions delivered iteratively",
    "Cross-Industry Capability — transferable frameworks across sectors",
  ],

  proofPoints: [
    { value: "40%+", label: "Average process improvement" },
    { value: "30%", label: "Average cost reduction" },
    { value: "24/7", label: "AI agents working for the business" },
    { value: "10+", label: "Industries served" },
  ],

  // Systems Valorian must integrate with (their CRMs / systems of record).
  integrations: [
    {
      name: "Jira",
      role: "CRM / system of record",
      text: "Valorian integrates via the Jira API and lives in Jira as its own user — reading and creating issues, commenting, and syncing ideas/tickets both ways.",
    },
    {
      name: "Monday.com",
      role: "CRM / work management",
      text: "Two-way sync with Monday.com boards via API — items, updates and status mapped to Valorian ideas/tickets so both stay in step.",
    },
  ],

  source: "valoraadvisory.co.za — home, /services, /about, /approach, /ai-automation",
};
