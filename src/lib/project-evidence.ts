/** Project evidence / impact items (verified-only; never invent numbers). */

export type ProjectEvidenceType =
  | "metric"
  | "outcome"
  | "operational"
  | "scale"
  | "adoption"
  | "delivery"
  | "other";

export type ProjectEvidenceVerification =
  | "verified"
  | "self-reported"
  | "client-confirmed"
  | "pending";

export type ProjectEvidenceItem = {
  id: string;
  type: ProjectEvidenceType;
  /** Optional numeric or short display value — leave empty when not quantified. */
  value?: string;
  label: string;
  description?: string;
  verificationStatus: ProjectEvidenceVerification;
  public: boolean;
  /** Admin-only note — never render on the public site. */
  sourceNote?: string;
  sortOrder?: number;
};

export const PROJECT_EVIDENCE_TYPES: { id: ProjectEvidenceType; label: string }[] = [
  { id: "metric", label: "Metric" },
  { id: "outcome", label: "Outcome" },
  { id: "operational", label: "Operational" },
  { id: "scale", label: "Scale" },
  { id: "adoption", label: "Adoption" },
  { id: "delivery", label: "Delivery" },
  { id: "other", label: "Other" },
];

export const PROJECT_EVIDENCE_VERIFICATION: { id: ProjectEvidenceVerification; label: string }[] = [
  { id: "verified", label: "Verified" },
  { id: "client-confirmed", label: "Client-confirmed" },
  { id: "self-reported", label: "Self-reported" },
  { id: "pending", label: "Pending" },
];

export function newEvidenceId() {
  return `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Public, non-pending evidence sorted for case studies. */
export function publicEvidence(items?: ProjectEvidenceItem[] | null): ProjectEvidenceItem[] {
  if (!items?.length) return [];
  return items
    .filter((item) => item.public && item.verificationStatus !== "pending" && item.label?.trim())
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * One meaningful card metric: prefer verified/client-confirmed with a value,
 * else a short verified operational/outcome label — never invent numbers.
 */
export function featuredEvidenceMetric(items?: ProjectEvidenceItem[] | null): ProjectEvidenceItem | null {
  const list = publicEvidence(items).filter(
    (item) => item.verificationStatus === "verified" || item.verificationStatus === "client-confirmed",
  );
  if (!list.length) return null;
  const withValue = list.find((item) => (item.value || "").trim());
  return withValue || list[0] || null;
}
