// Exact encoding of Valora's "Operational & ESG Pre-Kickoff Assessment"
// (Doc ID: VAL-S1-FORM1.1). This schema drives both the public client form
// and the admin submission view — one source of truth.

export type FieldType = "text" | "textarea" | "radio" | "checkbox" | "file";

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  options?: string[];
  allowOther?: boolean; // adds an "Other" free-text alongside the options
  otherLabel?: string; // label for the other box (e.g. "Any other key stakeholders")
  maxSelect?: number; // checkbox: cap selections (e.g. "select top 3")
  multiple?: boolean; // file: allow multiple
}

export interface Section {
  id: string;
  title: string;
  note?: string;
  fields: Field[];
}

export interface Assessment {
  docId: string;
  title: string;
  intro: string;
  sections: Section[];
}

export const ASSESSMENT: Assessment = {
  docId: "VAL-S1-FORM1.1",
  title: "Operational & ESG Pre-Kickoff Assessment",
  intro:
    "This assessment acts as a pre-workshop data-ingestion gate to capture critical inputs regarding your operational structures, technology and ESG data. It establishes the baseline metrics for operational optimization, cost auditing and procurement strategy — so your Discovery Workshop starts with the groundwork already done. Please complete all fields as accurately as possible.",
  sections: [
    {
      id: "s1",
      title: "General Company Profile",
      fields: [
        { id: "company_name", label: "Company Registered Name", type: "text", required: true },
        {
          id: "industry",
          label: "Primary Industry",
          type: "radio",
          required: true,
          allowOther: true,
          options: [
            "Logistics & Supply chain",
            "Manufacturing & Production",
            "Agriculture/Agribusiness",
            "Professional Services",
            "Mining",
          ],
        },
        {
          id: "headcount",
          label: "Total Employee Headcount (Group)",
          type: "radio",
          required: true,
          options: ["1 – 50 employees", "51 – 200 employees", "201 – 500 employees", "501+ employees"],
        },
        { id: "hq", label: "Primary Operational Headquarters", type: "text", required: true },
      ],
    },
    {
      id: "s2",
      title: "Technology & Software Ecosystem",
      fields: [
        {
          id: "erp",
          label: "What is your primary Core ERP and/or Financial Accounting platform?",
          type: "radio",
          required: true,
          allowOther: true,
          options: [
            "Sage (Evolution / 300 / Business Cloud)",
            "SAP (S/4HANA / Business One)",
            "Microsoft Dynamics 365",
            "Oracle / NetSuite",
            "Syspro",
          ],
        },
        {
          id: "crm_platforms",
          label: "What Operational/CRM platforms do your front-line team use?",
          help: "Select all that apply.",
          type: "checkbox",
          allowOther: true,
          options: [
            "Salesforce",
            "HubSpot",
            "Microsoft Dynamics CRM",
            "Zoho CRM",
            "Industry-specific proprietary platform",
            "None (We use Excel/Manual tracking)",
          ],
        },
        {
          id: "architecture_upload",
          label: "System Architecture",
          type: "file",
          multiple: true,
          help: "Please upload your current IT landscape map, software ecosystem diagram and high-level corporate organogram, if available.",
        },
      ],
    },
    {
      id: "s3",
      title: "Workflow Bottlenecks & Manual Process Identification",
      fields: [
        {
          id: "bottlenecks",
          label: "Which manual processes create the biggest bottlenecks?",
          help: "Select your top 3.",
          type: "checkbox",
          maxSelect: 3,
          allowOther: true,
          options: [
            "Supplier Invoice Processing & Reconciliations",
            "Purchase Order (PO) Creation & Internal Approval Routing",
            "Customer Onboarding & KYC Documentation",
            "Inventory Tracking & Warehouse Dispatch Logs",
            "ESG / Carbon Footprint Data Aggregation & Compliance Reporting",
            "Multi-currency / Cross-border Transaction Settlements",
          ],
        },
        {
          id: "invoice_time",
          label:
            "Estimate the average time your team spends manually handling a single supplier invoice or purchase order:",
          type: "radio",
          options: ["Less than 10 minutes", "10 – 30 minutes", "31 – 60 minutes", "Over 60 minutes per document"],
        },
        {
          id: "staff_cost",
          label:
            "What is the estimated fully loaded average cost (hourly salary rate) of the administrative/operational staff handling these manual tasks in ZAR?",
          type: "radio",
          options: ["R80 – R150 / hour", "R151 – R250 / hour", "R251 – R400 / hour", "R401+ / hour"],
        },
      ],
    },
    {
      id: "s4",
      title: "Supply Chain & Procurement Parameters",
      fields: [
        {
          id: "vendor_count",
          label: "How many active suppliers/vendors are currently managed in your database?",
          type: "radio",
          options: ["1 – 50", "51 – 200", "201 – 500", "500+ active vendors"],
        },
        {
          id: "payment_terms",
          label: "What are your standard vendor payment terms?",
          type: "radio",
          options: [
            "Cash on Delivery (COD)",
            "30 Days from Statement",
            "60 Days + from Statement",
            "Inconsistent / Varies significantly by vendors",
          ],
        },
        {
          id: "vendor_list_upload",
          label: "Vendor List Export",
          type: "file",
          multiple: true,
          help: "Please upload an export of your vendor list including payment terms and total spend per vendor over the last 12 months. No banking details required.",
        },
      ],
    },
    {
      id: "s5",
      title: "Sustainability, ESG & Carbon Tax Readiness",
      fields: [
        {
          id: "emissions_tracking",
          label:
            "Does your organization currently track Scope 1 (Direct Fuel) and Scope 2 (Electricity) carbon emissions?",
          type: "radio",
          options: [
            "Yes, we track this systematically via specialized software",
            "Partially, we track this manually using spreadsheets",
            "No, we do not currently track emissions",
          ],
        },
        {
          id: "carbon_tax_exposure",
          label:
            "Is your business directly exposed to South African Carbon Tax compliance or international ESG reporting mandates (e.g., CBAM)?",
          type: "radio",
          options: [
            "Yes, we are fully exposed and actively paying/reporting",
            "We are approaching the compliance threshold but not yet reporting",
            "No, we are currently exempt",
            "Unsure / Require Valora Advisory diagnostics to assess exposure",
          ],
        },
        {
          id: "utility_uploads",
          label: "Utility & Fuel Records",
          type: "file",
          multiple: true,
          help: "Please upload PDF/digital copies of your utility bills (Eskom/Municipal electricity logs) and fleet fuel card expenditure summaries spanning the last 12 consecutive months.",
        },
      ],
    },
    {
      id: "s6",
      title: "Workshop Logistics & Executive Alignment",
      fields: [
        {
          id: "attendees",
          label:
            "To ensure the Discovery Workshop is successful, please confirm the attendance of the following key decision-makers:",
          type: "checkbox",
          allowOther: true,
          otherLabel: "Any other key stakeholders",
          options: [
            "Operations Manager",
            "Manufacturing/Production Manager",
            "Procurement/Supply Chain Lead",
            "IT/System Manager",
          ],
        },
        {
          id: "strategic_objective",
          label:
            "Please share the primary strategic objective you want Valora Advisory to deliver through this engagement:",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
};

// Flat lookup helpers for rendering submissions.
export function allFields(): Field[] {
  return ASSESSMENT.sections.flatMap((s) => s.fields);
}
