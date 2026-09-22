"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiImageAddLine,
  RiSaveLine,
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import {
  DEFAULT_CAREER,
  careerFrom,
  newCareerId,
  type CareerCategory,
  type CareerContent,
  type CareerKind,
  type CareerRecord,
  type CareerRoleType,
} from "@/lib/career";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";

const KINDS: { value: CareerKind; label: string }[] = [
  { value: "role", label: "Role / work" },
  { value: "education", label: "Education" },
  { value: "certification", label: "Certification" },
];

const CATEGORIES: { value: CareerCategory; label: string }[] = [
  { value: "leadership", label: "Leadership" },
  { value: "work", label: "Work" },
  { value: "education", label: "Education" },
  { value: "other", label: "Other" },
];

const ROLE_TYPES: { value: CareerRoleType; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "training", label: "Training" },
  { value: "education", label: "Education" },
];

function Field({
  label,
  value,
  onChange,
  area = false,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="hp-field">
      <span>{label}</span>
      {area ? (
        <textarea rows={3} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function blankRecord(kind: CareerKind): CareerRecord {
  const id = newCareerId(kind);
  const year = new Date().getFullYear();
  return {
    id,
    kind,
    category: kind === "role" ? "work" : "education",
    roleType: kind === "role" ? "work" : undefined,
    title: kind === "certification" ? "New certificate" : kind === "education" ? "New program" : "New role",
    organization: "",
    period: String(year),
    sortYear: year,
    description: "",
    summary: "",
    highlights: [],
    showOnExperience: true,
    showOnJourney: false,
  };
}

export default function ExperienceEditorPage() {
  const [content, setContent] = useState<CareerContent>(DEFAULT_CAREER);
  const [activeId, setActiveId] = useState<string | null>(DEFAULT_CAREER.records[0]?.id || null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    setContent(careerFrom(getLocalSettings()));
    void fetchRemoteSettings().then((remote) => {
      if (remote) {
        const next = careerFrom(remote);
        setContent(next);
        setActiveId((current) => current || next.records[0]?.id || null);
      }
    });
  }, []);

  const active = useMemo(
    () => content.records.find((item) => item.id === activeId) || content.records[0] || null,
    [content.records, activeId],
  );

  const patchRecord = (id: string, next: Partial<CareerRecord>) => {
    setContent((current) => ({
      ...current,
      records: current.records.map((item) => (item.id === id ? { ...item, ...next } : item)),
    }));
  };

  const moveRecord = (id: string, dir: -1 | 1) => {
    setContent((current) => {
      const index = current.records.findIndex((item) => item.id === id);
      const target = index + dir;
      if (index < 0 || target < 0 || target >= current.records.length) return current;
      const records = [...current.records];
      const [row] = records.splice(index, 1);
      records.splice(target, 0, row);
      return { ...current, records };
    });
  };

  const addRecord = (kind: CareerKind) => {
    const row = blankRecord(kind);
    setContent((current) => ({ ...current, records: [row, ...current.records] }));
    setActiveId(row.id);
  };

  const removeRecord = (id: string) => {
    setContent((current) => {
      const records = current.records.filter((item) => item.id !== id);
      return { ...current, records };
    });
    setActiveId((current) => (current === id ? null : current));
  };

  const save = () => {
    void runSave(async () => {
      await saveLocalSettings({ career: content });
    }, "Experience records saved.");
  };

  return (
    <div className="hp-board">
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>Pages</span>
            <span>/</span>
            <strong>Experience</strong>
          </nav>
          <h1>Experience</h1>
          <p>
            Canonical roles, education, and certifications. Homepage Journey picks which records to show. CV selects
            which records appear on each format.
          </p>
        </div>
        <div className="hp-board-actions">
          <Link href="/experience" className="btn btn-outline btn-sm" target="_blank">
            <RiEyeLine size={15} /> View live
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            <RiSaveLine size={15} /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="hp-editor-grid" style={{ gridTemplateColumns: "minmax(14rem, 0.85fr) minmax(0, 1.35fr)" }}>
        <section className="hp-editor-card">
          <div className="hp-list-head">
            <p>Page copy</p>
          </div>
          <Field
            label="Section label"
            value={content.page.label}
            onChange={(label) => setContent({ ...content, page: { ...content.page, label } })}
          />
          <Field
            label="Title"
            value={content.page.title}
            onChange={(title) => setContent({ ...content, page: { ...content.page, title } })}
          />
          <Field
            label="Intro body"
            value={content.page.body}
            area
            onChange={(body) => setContent({ ...content, page: { ...content.page, body } })}
          />
          <Field
            label="Aside line"
            value={content.page.asideLine}
            onChange={(asideLine) => setContent({ ...content, page: { ...content.page, asideLine } })}
            hint="e.g. Ideas · People · Systems · Impact"
          />
          <Field
            label="Side label"
            value={content.page.sideLabel}
            onChange={(sideLabel) => setContent({ ...content, page: { ...content.page, sideLabel } })}
          />
          <Field
            label="Side title"
            value={content.page.sideTitle}
            onChange={(sideTitle) => setContent({ ...content, page: { ...content.page, sideTitle } })}
          />
          <Field
            label="Side body"
            value={content.page.sideBody}
            area
            onChange={(sideBody) => setContent({ ...content, page: { ...content.page, sideBody } })}
          />
          <Field
            label="Timeline CTA"
            value={content.page.sideCta}
            onChange={(sideCta) => setContent({ ...content, page: { ...content.page, sideCta } })}
          />

          <div className="hp-list-head" style={{ marginTop: "1rem" }}>
            <p>Records</p>
            <span>{content.records.length}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.55rem" }}>
            {KINDS.map((kind) => (
              <button key={kind.value} type="button" className="btn btn-outline btn-sm" onClick={() => addRecord(kind.value)}>
                <RiAddLine size={14} /> {kind.label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gap: "0.3rem", maxHeight: "28rem", overflow: "auto" }}>
            {content.records.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={item.id === active?.id ? "hp-record-row is-on" : "hp-record-row"}
                onClick={() => setActiveId(item.id)}
              >
                <span>
                  <strong>{item.title || "Untitled"}</strong>
                  <em>
                    {item.organization || "No organization"} · {item.kind}
                  </em>
                </span>
                <span className="hp-record-actions" onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="dash-icon-btn" aria-label="Move up" onClick={() => moveRecord(item.id, -1)} disabled={index === 0}>
                    <RiArrowUpSLine size={15} />
                  </button>
                  <button
                    type="button"
                    className="dash-icon-btn"
                    aria-label="Move down"
                    onClick={() => moveRecord(item.id, 1)}
                    disabled={index === content.records.length - 1}
                  >
                    <RiArrowDownSLine size={15} />
                  </button>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="hp-editor-card">
          {active ? (
            <>
              <div className="hp-list-head">
                <p>Edit record</p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeRecord(active.id)}>
                  <RiDeleteBin6Line size={14} /> Remove
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.45rem" }}>
                <label className="hp-field">
                  <span>Kind</span>
                  <CustomSelect
                    value={active.kind}
                    options={KINDS}
                    onChange={(value) => patchRecord(active.id, { kind: value as CareerKind })}
                  />
                </label>
                <label className="hp-field">
                  <span>Category</span>
                  <CustomSelect
                    value={active.category}
                    options={CATEGORIES}
                    onChange={(value) => patchRecord(active.id, { category: value as CareerCategory })}
                  />
                </label>
              </div>

              {active.kind === "role" ? (
                <label className="hp-field">
                  <span>Role type</span>
                  <CustomSelect
                    value={active.roleType || "work"}
                    options={ROLE_TYPES}
                    onChange={(value) => patchRecord(active.id, { roleType: value as CareerRoleType })}
                  />
                </label>
              ) : null}

              <Field label="Title / role / program" value={active.title} onChange={(title) => patchRecord(active.id, { title })} />
              <Field
                label="Organization / institution / issuer"
                value={active.organization}
                onChange={(organization) => patchRecord(active.id, { organization })}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.45rem" }}>
                <Field label="Period" value={active.period} onChange={(period) => patchRecord(active.id, { period })} />
                <Field
                  label="Sort year"
                  value={String(active.sortYear)}
                  onChange={(value) => patchRecord(active.id, { sortYear: Number(value) || active.sortYear })}
                />
                <Field
                  label="Location"
                  value={active.location || ""}
                  onChange={(location) => patchRecord(active.id, { location })}
                />
              </div>
              <Field
                label="Short description (Journey)"
                value={active.description}
                area
                onChange={(description) => patchRecord(active.id, { description })}
              />
              <Field
                label="Summary (Experience / CV)"
                value={active.summary}
                area
                onChange={(summary) => patchRecord(active.id, { summary })}
              />
              <Field
                label="Highlights (one per line)"
                value={(active.highlights || []).join("\n")}
                area
                onChange={(value) =>
                  patchRecord(active.id, {
                    highlights: value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  })
                }
              />
              <Field
                label="Skills (comma separated)"
                value={(active.skills || []).join(", ")}
                onChange={(value) =>
                  patchRecord(active.id, {
                    skills: value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />

              <div className="hp-logo-row">
                {active.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.logo} alt="" className="hp-logo-thumb" />
                ) : (
                  <span className="hp-logo-empty">No logo</span>
                )}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}>
                  <RiImageAddLine size={15} /> {active.logo ? "Change logo" : "Upload logo"}
                </button>
                {active.logo ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => patchRecord(active.id, { logo: "" })}>
                    Remove
                  </button>
                ) : null}
              </div>

              <Field label="Website" value={active.website || ""} onChange={(website) => patchRecord(active.id, { website })} />
              <Field
                label="Related link"
                value={active.relatedHref || ""}
                onChange={(relatedHref) => patchRecord(active.id, { relatedHref })}
              />
              <Field
                label="Related link label"
                value={active.relatedLabel || ""}
                onChange={(relatedLabel) => patchRecord(active.id, { relatedLabel })}
              />

              {active.kind === "education" || active.kind === "role" ? (
                <>
                  <Field label="Status" value={active.status || ""} onChange={(status) => patchRecord(active.id, { status })} />
                  <Field label="Note" value={active.note || ""} area onChange={(note) => patchRecord(active.id, { note })} />
                </>
              ) : null}

              {active.kind === "certification" ? (
                <>
                  <Field
                    label="Completed on"
                    value={active.completedOn || ""}
                    onChange={(completedOn) => patchRecord(active.id, { completedOn })}
                  />
                  <Field
                    label="Issued on"
                    value={active.issuedOn || ""}
                    onChange={(issuedOn) => patchRecord(active.id, { issuedOn })}
                  />
                  <Field
                    label="Verify URL"
                    value={active.verifyUrl || ""}
                    onChange={(verifyUrl) => patchRecord(active.id, { verifyUrl })}
                    hint="Required for public verified certificates"
                  />
                </>
              ) : null}

              <label className="hp-toggle">
                <input
                  type="checkbox"
                  checked={active.showOnExperience !== false}
                  onChange={(e) => patchRecord(active.id, { showOnExperience: e.target.checked })}
                />
                <span>Show on Experience page</span>
              </label>
              <label className="hp-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(active.showOnJourney)}
                  onChange={(e) => patchRecord(active.id, { showOnJourney: e.target.checked })}
                />
                <span>Default for Journey (when homepage has no explicit selection)</span>
              </label>
              <p className="hp-note">
                Homepage → Journey lets you choose exactly which records appear there. CV → Records picks which ones
                appear on each CV format.
              </p>
            </>
          ) : (
            <p className="hp-note">Add a role, education, or certification to start editing.</p>
          )}
        </section>
      </div>

      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (url.startsWith("blob:") || !active) return;
          patchRecord(active.id, { logo: url });
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
