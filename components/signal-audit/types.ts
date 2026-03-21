export interface ValueEntry {
  name: string;
  category: string;
  strength: "hard" | "strong" | "moderate";
  locationGuess: string;
  corroborationGuess: string;
}

export const CATEGORIES = [
  "Environmental/Sustainability",
  "Human Oversight/Governance",
  "Data Privacy/Security",
  "Ethical Sourcing/Supply Chain",
  "Inclusion/Equity",
  "Quality/Safety Standards",
  "Pricing/Commercial Ethics",
  "Customer Protection",
  "Other",
] as const;

export const STRENGTHS = [
  { value: "hard", label: "Hard Constraint" },
  { value: "strong", label: "Strong Preference" },
  { value: "moderate", label: "Moderate" },
] as const;

export const LOCATIONS = [
  { value: "schema", label: "Schema markup / structured data", machineReadable: true },
  { value: "llms", label: "llms.txt or agent-readable file", machineReadable: true },
  { value: "api", label: "Public API / machine-readable endpoint", machineReadable: true },
  { value: "product-page", label: "Structured crawlable page", machineReadable: true },
  { value: "human-pdf", label: "PDF / document (human-readable only)", machineReadable: false },
  { value: "human-deck", label: "Brand guidelines / deck (human-readable only)", machineReadable: false },
  { value: "human-web", label: "Website prose / marketing copy only", machineReadable: false },
  { value: "not-documented", label: "Not formally documented", machineReadable: false },
] as const;

export const CORROBORATIONS = [
  { value: "cert-strong", label: "Third-party certification (ISO, B Corp)", strong: true },
  { value: "analyst", label: "Analyst / research report citation", strong: true },
  { value: "wikipedia", label: "Wikipedia / reference source", strong: true },
  { value: "earned-media", label: "Major earned media", strong: true },
  { value: "reviews", label: "Verified customer reviews", strong: false },
  { value: "industry-body", label: "Industry association membership", strong: false },
  { value: "case-study", label: "Published named case study", strong: false },
  { value: "own-site", label: "Own website / self-declared only", strong: false },
  { value: "none", label: "No independent evidence", strong: false },
] as const;

export interface ConditionalRule {
  when: string;
  then: string;
}

export const MACHINE_READABLE_LOCATIONS = ["schema", "llms", "api", "product-page"];
export const STRONG_CORROBORATIONS = ["cert-strong", "analyst", "wikipedia", "earned-media"];
