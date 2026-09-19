"use client";

import { useEffect, useState } from "react";
import {
  RiComputerLine,
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
  type PrivacyPageContent,
} from "@/lib/privacy-page";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
}) {
  return (
    <label className="hp-field">
      <span>{label}</span>
      {area ? (
        <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
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

  return (
    <div className="hp-editor">
      <div className="hp-editor-top">
        <div>
          <p className="section-label">Pages</p>
          <h1>Privacy</h1>
          <p>Edit the public privacy policy. Preview matches the live page layout.</p>
        </div>
        <div className="hp-editor-actions">
          <button type="button" className="btn btn-outline" onClick={() => setPreviewOpen(true)}>
            <RiEyeLine size={16} /> Preview
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="hp-editor-layout">
        <aside className="hp-editor-nav">
          {SECTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === section ? "is-on" : undefined}
              onClick={() => selectSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="hp-editor-main">
          <h2>{active.label}</h2>

          {section === "hero" ? (
            <div className="hp-fields">
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
            </div>
          ) : null}

          {section === "promises" ? (
            <div className="hp-fields">
              {content.promises.map((item, index) => (
                <Field
                  key={`${item.icon}-${index}`}
                  label={`Promise ${index + 1}`}
                  value={item.text}
                  onChange={(text) => {
                    const promises = content.promises.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, text } : entry,
                    );
                    setContent({ ...content, promises });
                  }}
                />
              ))}
            </div>
          ) : null}

          {section === "sections" ? (
            <div className="hp-fields">
              {content.sections.map((item, index) => (
                <div key={item.n} className="hp-card-block">
                  <Field
                    label={`${item.n} Title`}
                    value={item.title}
                    onChange={(title) => {
                      const sections = content.sections.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, title } : entry,
                      );
                      setContent({ ...content, sections });
                    }}
                  />
                  <Field
                    label={`${item.n} Body`}
                    value={item.body || ""}
                    area
                    onChange={(body) => {
                      const sections = content.sections.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, body } : entry,
                      );
                      setContent({ ...content, sections });
                    }}
                  />
                  {item.bullets?.length ? (
                    <Field
                      label={`${item.n} Bullets (one per line)`}
                      value={item.bullets.join("\n")}
                      area
                      onChange={(value) => {
                        const bullets = value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        const sections = content.sections.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, bullets } : entry,
                        );
                        setContent({ ...content, sections });
                      }}
                    />
                  ) : null}
                  {item.pills?.length ? (
                    <Field
                      label={`${item.n} Pills (one per line)`}
                      value={item.pills.join("\n")}
                      area
                      onChange={(value) => {
                        const pills = value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean);
                        const sections = content.sections.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, pills } : entry,
                        );
                        setContent({ ...content, sections });
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {section === "cta" ? (
            <div className="hp-fields">
              <Field
                label="Eyebrow"
                value={content.ctaEyebrow}
                onChange={(ctaEyebrow) => setContent({ ...content, ctaEyebrow })}
              />
              <Field label="Title" value={content.ctaTitle} onChange={(ctaTitle) => setContent({ ...content, ctaTitle })} />
              <Field label="Body" value={content.ctaBody} area onChange={(ctaBody) => setContent({ ...content, ctaBody })} />
              <Field
                label="Button label"
                value={content.ctaLabel}
                onChange={(ctaLabel) => setContent({ ...content, ctaLabel })}
              />
              <Field label="Button href" value={content.ctaHref} onChange={(ctaHref) => setContent({ ...content, ctaHref })} />
            </div>
          ) : null}
        </div>
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
