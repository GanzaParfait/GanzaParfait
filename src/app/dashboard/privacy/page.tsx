"use client";

import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiComputerLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiSaveLine,
  RiSmartphoneLine,
  RiTabletLine,
} from "react-icons/ri";
import PrivacyPageView from "@/components/privacy/PrivacyPageView";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import {
  DEFAULT_PRIVACY_PAGE,
  privacyPageFrom,
  type PrivacyCollectIcon,
  type PrivacyPageContent,
  type PrivacyPromiseIcon,
  type PrivacySectionIcon,
} from "@/lib/privacy-page";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSectionHash } from "@/hooks/useSectionHash";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

type SectionId = "hero" | "promises" | "sections" | "cta";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "promises", label: "Promises" },
  { id: "sections", label: "Sections" },
  { id: "cta", label: "CTA" },
];

const PROMISE_ICONS: PrivacyPromiseIcon[] = ["lock", "user", "shield", "clock"];
const SECTION_ICONS: PrivacySectionIcon[] = [
  "person",
  "folder",
  "check",
  "cloud",
  "cookie",
  "archive",
  "choice",
  "refresh",
];
const COLLECT_ICONS: PrivacyCollectIcon[] = ["mail", "news", "cv", "chart"];

const DEVICES: { id: PreviewDevice; label: string; width: string; Icon: typeof RiComputerLine }[] = [
  { id: "desktop", label: "Desktop", width: "100%", Icon: RiComputerLine },
  { id: "tablet", label: "Tablet", width: "820px", Icon: RiTabletLine },
  { id: "mobile", label: "Mobile", width: "390px", Icon: RiSmartphoneLine },
];

function Field({
  label,
  value,
  onChange,
  area = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
  hint?: string;
}) {
  return (
    <label className="hp-field">
      <span>{label}</span>
      {area ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export default function PrivacyEditorPage() {
  const [content, setContent] = useState<PrivacyPageContent>(DEFAULT_PRIVACY_PAGE);
  const [section, setSection] = useState<SectionId>("hero");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [previewOpen, setPreviewOpen] = useState(false);
  useHistoryBackClose(previewOpen, () => setPreviewOpen(false));
  const { runSave, saving } = useDashboardFeedback();
  const selectSection = useSectionHash(SECTIONS, setSection);
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const previewWidth = DEVICES.find((item) => item.id === device)?.width || "100%";

  useEffect(() => {
    setContent(privacyPageFrom(getLocalSettings()));
    void fetchRemoteSettings().then((remote) => {
      if (remote) setContent(privacyPageFrom(remote));
    });
  }, []);

  const save = () => {
    void runSave(async () => {
      await saveLocalSettings({ privacyPage: content });
    }, "Privacy page saved.");
  };

  const updateSection = (index: number, patch: Partial<PrivacyPageContent["sections"][number]>) => {
    const sections = content.sections.map((entry, entryIndex) =>
      entryIndex === index ? { ...entry, ...patch } : entry,
    );
    setContent({ ...content, sections });
  };

  const addPolicySection = () => {
    const n = String(content.sections.length + 1).padStart(2, "0");
    setContent({
      ...content,
      sections: [
        ...content.sections,
        {
          n,
          icon: "refresh",
          title: "New section",
          body: "",
          bullets: [],
        },
      ],
    });
  };

  const removePolicySection = (index: number) => {
    if (content.sections.length <= 1) return;
    setContent({
      ...content,
      sections: content.sections
        .filter((_, i) => i !== index)
        .map((entry, i) => ({ ...entry, n: String(i + 1).padStart(2, "0") })),
    });
  };

  return (
    <div className={previewOpen ? "hp-board is-preview-open" : "hp-board"}>
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>Pages</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </nav>
          <h1>Privacy</h1>
          <p>Edit the public privacy policy. Preview matches the live page layout.</p>
        </div>
        <div className="hp-board-actions">
          <div className="hp-section-pills" role="tablist" aria-label="Privacy sections">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={section === item.id}
                className={section === item.id ? "is-on" : undefined}
                onClick={() => selectSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-outline hp-mobile-preview-btn" onClick={() => setPreviewOpen(true)}>
            <RiEyeLine size={16} /> Preview
          </button>
          <button type="button" className="btn btn-primary hp-top-save" onClick={save} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="hp-workspace">
        <aside className="hp-editor">
          <div className="hp-editor-body">
            {section === "hero" ? (
              <>
                <Field label="Label" value={content.label} onChange={(label) => setContent({ ...content, label })} />
                <Field label="Title" value={content.title} onChange={(title) => setContent({ ...content, title })} />
                <Field
                  label="Subtitle"
                  value={content.subtitle}
                  onChange={(subtitle) => setContent({ ...content, subtitle })}
                />
                <Field label="Lead" value={content.lead} area onChange={(lead) => setContent({ ...content, lead })} />
                <Field
                  label="Updated label"
                  value={content.updatedLabel}
                  onChange={(updatedLabel) => setContent({ ...content, updatedLabel })}
                />
                <Field
                  label="Updated date"
                  value={content.updatedDate}
                  onChange={(updatedDate) => setContent({ ...content, updatedDate })}
                />
                <Field
                  label="Aside title"
                  value={content.asideTitle}
                  onChange={(asideTitle) => setContent({ ...content, asideTitle })}
                />
                <Field
                  label="Aside body"
                  value={content.asideBody}
                  area
                  onChange={(asideBody) => setContent({ ...content, asideBody })}
                />
              </>
            ) : null}

            {section === "promises" ? (
              <>
                <div className="hp-list-head">
                  <p>Promise cards</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      setContent({
                        ...content,
                        promises: [...content.promises, { icon: "lock", text: "New promise" }],
                      })
                    }
                  >
                    <RiAddLine size={14} /> Add
                  </button>
                </div>
                {content.promises.map((item, index) => (
                  <div key={`${item.icon}-${index}`} className="hp-mini-card">
                    <label className="hp-field">
                      <span>Icon</span>
                      <CustomSelect
                        aria-label={`Promise ${index + 1} icon`}
                        value={item.icon}
                        options={PROMISE_ICONS.map((icon) => ({ value: icon, label: icon }))}
                        onChange={(icon) => {
                          const promises = content.promises.map((entry, i) =>
                            i === index ? { ...entry, icon: icon as PrivacyPromiseIcon } : entry,
                          );
                          setContent({ ...content, promises });
                        }}
                      />
                    </label>
                    <Field
                      label={`Promise ${index + 1}`}
                      value={item.text}
                      area
                      onChange={(text) => {
                        const promises = content.promises.map((entry, i) =>
                          i === index ? { ...entry, text } : entry,
                        );
                        setContent({ ...content, promises });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={content.promises.length <= 1}
                      onClick={() =>
                        setContent({
                          ...content,
                          promises: content.promises.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <RiDeleteBin6Line size={14} /> Remove
                    </button>
                  </div>
                ))}
              </>
            ) : null}

            {section === "sections" ? (
              <>
                <div className="hp-list-head">
                  <p>Policy sections</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addPolicySection}>
                    <RiAddLine size={14} /> Add section
                  </button>
                </div>
                {content.sections.map((item, index) => (
                  <div key={`${item.n}-${index}`} className="hp-mini-card">
                    <Field label="Number" value={item.n} onChange={(n) => updateSection(index, { n })} />
                    <label className="hp-field">
                      <span>Icon</span>
                      <CustomSelect
                        aria-label={`Section ${item.n} icon`}
                        value={item.icon}
                        options={SECTION_ICONS.map((icon) => ({ value: icon, label: icon }))}
                        onChange={(icon) => updateSection(index, { icon: icon as PrivacySectionIcon })}
                      />
                    </label>
                    <Field label="Title" value={item.title} onChange={(title) => updateSection(index, { title })} />
                    <Field
                      label="Body"
                      value={item.body || ""}
                      area
                      onChange={(body) => updateSection(index, { body })}
                    />
                    <Field
                      label="Bullets (one per line)"
                      value={(item.bullets || []).join("\n")}
                      area
                      onChange={(value) => {
                        const bullets = value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        updateSection(index, { bullets });
                      }}
                    />
                    <Field
                      label="Pills (one per line)"
                      value={(item.pills || []).join("\n")}
                      area
                      onChange={(value) => {
                        const pills = value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        updateSection(index, { pills });
                      }}
                    />

                    <div className="hp-list-head">
                      <p>Collect cards</p>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          const collectCards = [
                            ...(item.collectCards || []),
                            { icon: "mail" as PrivacyCollectIcon, title: "New card", body: "" },
                          ];
                          updateSection(index, { collectCards });
                        }}
                      >
                        <RiAddLine size={14} /> Add card
                      </button>
                    </div>
                    {(item.collectCards || []).map((card, cardIndex) => (
                      <div key={`${card.title}-${cardIndex}`} className="hp-mini-card">
                        <label className="hp-field">
                          <span>Card icon</span>
                          <CustomSelect
                            aria-label={`Collect card ${cardIndex + 1} icon`}
                            value={card.icon}
                            options={COLLECT_ICONS.map((icon) => ({ value: icon, label: icon }))}
                            onChange={(icon) => {
                              const collectCards = (item.collectCards || []).map((entry, i) =>
                                i === cardIndex ? { ...entry, icon: icon as PrivacyCollectIcon } : entry,
                              );
                              updateSection(index, { collectCards });
                            }}
                          />
                        </label>
                        <Field
                          label="Card title"
                          value={card.title}
                          onChange={(title) => {
                            const collectCards = (item.collectCards || []).map((entry, i) =>
                              i === cardIndex ? { ...entry, title } : entry,
                            );
                            updateSection(index, { collectCards });
                          }}
                        />
                        <Field
                          label="Card body"
                          value={card.body}
                          area
                          onChange={(body) => {
                            const collectCards = (item.collectCards || []).map((entry, i) =>
                              i === cardIndex ? { ...entry, body } : entry,
                            );
                            updateSection(index, { collectCards });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            const collectCards = (item.collectCards || []).filter((_, i) => i !== cardIndex);
                            updateSection(index, { collectCards });
                          }}
                        >
                          <RiDeleteBin6Line size={14} /> Remove card
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={content.sections.length <= 1}
                      onClick={() => removePolicySection(index)}
                    >
                      <RiDeleteBin6Line size={14} /> Remove section
                    </button>
                  </div>
                ))}
              </>
            ) : null}

            {section === "cta" ? (
              <>
                <Field
                  label="Eyebrow"
                  value={content.ctaEyebrow}
                  onChange={(ctaEyebrow) => setContent({ ...content, ctaEyebrow })}
                />
                <Field
                  label="Title"
                  value={content.ctaTitle}
                  onChange={(ctaTitle) => setContent({ ...content, ctaTitle })}
                />
                <Field
                  label="Body"
                  value={content.ctaBody}
                  area
                  onChange={(ctaBody) => setContent({ ...content, ctaBody })}
                />
                <Field
                  label="Button label"
                  value={content.ctaLabel}
                  onChange={(ctaLabel) => setContent({ ...content, ctaLabel })}
                />
                <Field
                  label="Button href"
                  value={content.ctaHref}
                  onChange={(ctaHref) => setContent({ ...content, ctaHref })}
                />
              </>
            ) : null}
          </div>
          <div className="hp-editor-foot">
            <button type="button" className="btn btn-primary hp-save" onClick={save} disabled={saving}>
              <RiSaveLine size={16} /> {saving ? "Saving…" : "Save privacy page"}
            </button>
          </div>
        </aside>

        <section className="hp-preview">
          <div className="hp-preview-top">
            <p>Live preview</p>
            <div className="hp-devices">
              {DEVICES.map((item) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={device === item.id ? "is-on" : undefined}
                    onClick={() => setDevice(item.id)}
                  >
                    <Icon size={15} /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hp-preview-stage">
            <div className="hp-preview-frame" data-device={device} style={{ width: previewWidth }}>
              <PrivacyPageView content={content} embedded />
            </div>
          </div>
        </section>
      </div>

      {previewOpen ? (
        <div className="hp-preview-layer" role="presentation" onClick={() => setPreviewOpen(false)}>
          <div className="hp-preview-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="hp-preview-toolbar">
              <div className="hp-preview-devices">
                {DEVICES.map((item) => {
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={device === item.id ? "is-on" : undefined}
                      onClick={() => setDevice(item.id)}
                    >
                      <Icon size={15} /> {item.label}
                    </button>
                  );
                })}
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </div>
            <div className="hp-preview-frame" data-device={device} style={{ width: previewWidth }}>
              <PrivacyPageView content={content} embedded />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
