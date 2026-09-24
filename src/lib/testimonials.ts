/**
 * Testimonials — shared types, validation and row mapping.
 *
 * Lifecycle: draft → submitted → confirmed → published | declined
 *
 * Public visibility (hard rule): status = published AND is_public AND verified
 * AND source <> 'placeholder'. Placeholders must never appear in public APIs.
 *
 * Private columns (submitter_email, moderation_notes, original_body,
 * verification_method, notify_on_publish) never leave toPublicTestimonial.
 */

export const TESTIMONIAL_STATUSES = [
  "draft",
  "submitted",
  "confirmed",
  "published",
  "declined",
] as const;
export type TestimonialStatus = (typeof TESTIMONIAL_STATUSES)[number];

export const TESTIMONIAL_SOURCES = ["visitor", "placeholder", "admin"] as const;
export type TestimonialSource = (typeof TESTIMONIAL_SOURCES)[number];

export const TESTIMONIAL_BODY_MIN = 40;
export const TESTIMONIAL_BODY_MAX = 1200;

/** Shown to the visitor after a successful submit. */
export const TESTIMONIAL_SUCCESS_MESSAGE =
  "Thank you for sharing your experience. Your testimonial has been received and will be reviewed before publication.";

export const PLACEHOLDER_BANNER =
  "Draft testimonial — replace attribution and verify before publishing";

export type PublicTestimonial = {
  id: string;
  personName: string;
  personTitle: string | null;
  organization: string | null;
  body: string;
  shortBody: string | null;
  photoUrl: string | null;
  profileUrl: string | null;
  relationship: string | null;
  projectId: string | null;
  projectTitleOther: string | null;
  location: string | null;
  testifiedOn: string | null;
  featured: boolean;
  displayOrder: number;
  shareToken: string | null;
};

export type AdminTestimonial = PublicTestimonial & {
  status: TestimonialStatus;
  source: TestimonialSource;
  isPublic: boolean;
  verified: boolean;
  verificationMethod: string | null;
  notifyOnPublish: boolean;
  submitterEmail: string | null;
  moderationNotes: string | null;
  originalBody: string | null;
  submittedAt: string;
  approvedAt: string | null;
  updatedAt: string | null;
  consentAccepted: boolean;
};

/** Columns safe to select for an unauthenticated reader. */
export const PUBLIC_TESTIMONIAL_COLUMNS =
  "id, person_name, person_title, organization, body, short_body, photo_url, profile_url, relationship, project_id, project_title_other, location, testified_on, featured, display_order, share_token";

type Row = Record<string, unknown>;

function text(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function nullableText(value: unknown): string | null {
  const next = text(value).trim();
  return next || null;
}

export function isTestimonialStatus(value: unknown): value is TestimonialStatus {
  return TESTIMONIAL_STATUSES.includes(text(value) as TestimonialStatus);
}

export function isTestimonialSource(value: unknown): value is TestimonialSource {
  return TESTIMONIAL_SOURCES.includes(text(value) as TestimonialSource);
}

/**
 * Hard public-visibility gate. Use before returning any row to an unauthenticated
 * client — never rely on status alone.
 */
export function isPubliclyVisibleRow(row: Row): boolean {
  return (
    text(row.status) === "published" &&
    Boolean(row.is_public) &&
    Boolean(row.verified) &&
    text(row.source) !== "placeholder"
  );
}

/** Guards publishing from the dashboard: placeholders cannot go live until rewritten. */
export function canPublishTestimonial(row: {
  source?: string | null;
  verified?: boolean;
  personName?: string | null;
}): { ok: true } | { ok: false; error: string } {
  if (text(row.source) === "placeholder") {
    return {
      ok: false,
      error:
        "Change the source away from placeholder, replace the dummy name, and mark verified before publishing.",
    };
  }
  if (!row.verified) {
    return { ok: false, error: "Mark the testimonial as verified before publishing." };
  }
  const name = text(row.personName).trim();
  if (/^[A-Z][a-z]+\s+[A-Z]\.?$/.test(name) || /\b(Example|Dummy|Placeholder)\b/i.test(name)) {
    return {
      ok: false,
      error: "Replace the placeholder attribution name before publishing.",
    };
  }
  return { ok: true };
}

export function toPublicTestimonial(row: Row): PublicTestimonial {
  return {
    id: text(row.id),
    personName: text(row.person_name),
    personTitle: nullableText(row.person_title),
    organization: nullableText(row.organization),
    body: text(row.body),
    shortBody: nullableText(row.short_body),
    photoUrl: nullableText(row.photo_url),
    profileUrl: nullableText(row.profile_url),
    relationship: nullableText(row.relationship),
    projectId: nullableText(row.project_id),
    projectTitleOther: nullableText(row.project_title_other),
    location: nullableText(row.location),
    testifiedOn: nullableText(row.testified_on),
    featured: Boolean(row.featured),
    displayOrder: Number(row.display_order ?? 0),
    shareToken: nullableText(row.share_token),
  };
}

export function toAdminTestimonial(row: Row): AdminTestimonial {
  return {
    ...toPublicTestimonial(row),
    status: isTestimonialStatus(row.status) ? row.status : "draft",
    source: isTestimonialSource(row.source) ? row.source : "visitor",
    isPublic: Boolean(row.is_public),
    verified: Boolean(row.verified),
    verificationMethod: nullableText(row.verification_method),
    notifyOnPublish: Boolean(row.notify_on_publish),
    submitterEmail: nullableText(row.submitter_email),
    moderationNotes: nullableText(row.moderation_notes),
    originalBody: nullableText(row.original_body),
    submittedAt: text(row.submitted_at),
    approvedAt: nullableText(row.approved_at),
    updatedAt: nullableText(row.updated_at),
    consentAccepted: Boolean(row.consent_accepted),
  };
}

/** Featured first, then the manual order, then newest. */
export function sortTestimonials<T extends Pick<PublicTestimonial, "featured" | "displayOrder" | "testifiedOn">>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return (b.testifiedOn || "").localeCompare(a.testifiedOn || "");
  });
}

export function isValidTestimonialEmail(value: string): boolean {
  const email = value.trim();
  return email.length > 4 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Keep only http(s) links so a submitted URL can never become a `javascript:` href. */
export function safeExternalUrl(value: unknown): string | null {
  const raw = text(value).trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().slice(0, 500);
  } catch {
    return null;
  }
}

function isoDate(value: unknown): string | null {
  const raw = text(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  return Number.isNaN(new Date(raw).getTime()) ? null : raw;
}

export type TestimonialSubmission = {
  person_name: string;
  person_title: string | null;
  organization: string | null;
  location: string | null;
  body: string;
  photo_url: string | null;
  profile_url: string | null;
  relationship: string | null;
  project_id: string | null;
  project_title_other: string | null;
  testified_on: string | null;
  submitter_email: string;
  notify_on_publish: boolean;
};

export type ValidationResult =
  | { ok: true; value: TestimonialSubmission }
  | { ok: false; error: string };

const OTHER_PROJECT = "other";

/** Validate a public submission. Returns visitor-facing error copy on failure. */
export function validateTestimonialSubmission(input: Record<string, unknown>): ValidationResult {
  const personName = text(input.person_name ?? input.name).trim();
  if (personName.length < 2 || personName.length > 120) {
    return { ok: false, error: "Please enter your full name." };
  }

  const email = text(input.submitter_email ?? input.email).trim().toLowerCase();
  if (!isValidTestimonialEmail(email)) {
    return { ok: false, error: "Enter a valid email address so your testimonial can be verified." };
  }

  const body = text(input.body ?? input.message).trim();
  if (body.length < TESTIMONIAL_BODY_MIN) {
    return {
      ok: false,
      error: `Please write at least ${TESTIMONIAL_BODY_MIN} characters about what we worked on.`,
    };
  }
  if (body.length > TESTIMONIAL_BODY_MAX) {
    return { ok: false, error: `Please keep your testimonial under ${TESTIMONIAL_BODY_MAX} characters.` };
  }

  if (input.consent !== true && input.consent_accepted !== true) {
    return { ok: false, error: "Please confirm you agree to have this published with your name." };
  }

  const rawProject = nullableText(input.project_id)?.slice(0, 120) || null;
  const isOther = rawProject === OTHER_PROJECT || Boolean(nullableText(input.project_title_other));
  const projectTitleOther = isOther
    ? nullableText(input.project_title_other)?.slice(0, 160) || null
    : null;
  if (isOther && !projectTitleOther) {
    return { ok: false, error: "Enter a short title for the related work." };
  }

  return {
    ok: true,
    value: {
      person_name: personName,
      person_title: nullableText(input.person_title)?.slice(0, 160) || null,
      organization: nullableText(input.organization)?.slice(0, 160) || null,
      location: nullableText(input.location)?.slice(0, 160) || null,
      body,
      photo_url: safeExternalUrl(input.photo_url),
      profile_url: safeExternalUrl(input.profile_url),
      relationship: nullableText(input.relationship)?.slice(0, 160) || null,
      project_id: isOther ? null : rawProject,
      project_title_other: projectTitleOther,
      testified_on: isoDate(input.testified_on),
      submitter_email: email,
      notify_on_publish: Boolean(input.notify_on_publish),
    },
  };
}

/** Public columns an admin may edit through PATCH, mapped to DB column names. */
export type TestimonialPublicPatch = Partial<{
  person_name: string;
  person_title: string | null;
  organization: string | null;
  location: string | null;
  body: string;
  short_body: string | null;
  photo_url: string | null;
  profile_url: string | null;
  relationship: string | null;
  project_id: string | null;
  project_title_other: string | null;
  testified_on: string | null;
  featured: boolean;
  display_order: number;
  is_public: boolean;
  verified: boolean;
  verification_method: string | null;
  source: TestimonialSource;
  notify_on_publish: boolean;
}>;

/** Build the update payload for an admin edit, ignoring keys that were not sent. */
export function buildAdminPatch(input: Record<string, unknown>): TestimonialPublicPatch {
  const patch: TestimonialPublicPatch = {};

  if ("person_name" in input) {
    const name = text(input.person_name).trim();
    if (name) patch.person_name = name.slice(0, 120);
  }
  if ("person_title" in input) patch.person_title = nullableText(input.person_title)?.slice(0, 160) || null;
  if ("organization" in input) patch.organization = nullableText(input.organization)?.slice(0, 160) || null;
  if ("location" in input) patch.location = nullableText(input.location)?.slice(0, 160) || null;
  if ("relationship" in input) patch.relationship = nullableText(input.relationship)?.slice(0, 160) || null;
  if ("project_id" in input) patch.project_id = nullableText(input.project_id)?.slice(0, 120) || null;
  if ("project_title_other" in input) {
    patch.project_title_other = nullableText(input.project_title_other)?.slice(0, 160) || null;
  }
  if ("photo_url" in input) patch.photo_url = safeExternalUrl(input.photo_url);
  if ("profile_url" in input) patch.profile_url = safeExternalUrl(input.profile_url);
  if ("testified_on" in input) patch.testified_on = isoDate(input.testified_on);
  if ("featured" in input) patch.featured = Boolean(input.featured);
  if ("is_public" in input) patch.is_public = Boolean(input.is_public);
  if ("verified" in input) patch.verified = Boolean(input.verified);
  if ("notify_on_publish" in input) patch.notify_on_publish = Boolean(input.notify_on_publish);
  if ("verification_method" in input) {
    patch.verification_method = nullableText(input.verification_method)?.slice(0, 500) || null;
  }
  if ("source" in input && isTestimonialSource(input.source)) {
    patch.source = input.source;
  }
  if ("display_order" in input) {
    const order = Number(input.display_order);
    if (Number.isFinite(order)) patch.display_order = Math.trunc(order);
  }
  if ("body" in input) {
    const body = text(input.body).trim();
    if (body) patch.body = body.slice(0, TESTIMONIAL_BODY_MAX);
  }
  if ("short_body" in input) {
    patch.short_body = nullableText(input.short_body)?.slice(0, 280) || null;
  }

  return patch;
}

/** Deep-link helpers — mirror announcement auto-open style. */
export function shouldAutoOpenTestimonial(search: string): { token?: string; id?: string } | null {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
    const token = (params.get("testimonial") || params.get("t") || "").trim();
    if (token) return { token };
    const id = (params.get("tm") || "").trim();
    if (id) return { id };
    return null;
  } catch {
    return null;
  }
}

export function testimonialSharePath(token: string): string {
  return `/?testimonial=${encodeURIComponent(token)}`;
}

export function testimonialShareUrl(origin: string, token: string): string {
  const base = origin.replace(/\/+$/, "") || "https://www.princeparfait.com";
  return `${base}${testimonialSharePath(token)}`;
}
