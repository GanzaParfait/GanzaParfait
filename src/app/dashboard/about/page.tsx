"use client";

import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiCloseLine,
  RiComputerLine,
  RiDeleteBin6Line,
  RiEyeLine,
  RiImageAddLine,
  RiSaveLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiUser3Line,
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import AboutPageView from "@/components/about/AboutPageView";
import {
  DEFAULT_ABOUT_PAGE,
  aboutPageFrom,
  type AboutFactIcon,
  type AboutFocusIcon,
  type AboutPageContent,
  type AboutValueIcon,
} from "@/lib/about-page";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSectionHash } from "@/hooks/useSectionHash";

type SectionId = "hero" | "focus" | "facts" | "values" | "strengths" | "cta";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "focus", label: "Specializations" },
  { id: "facts", label: "Evidence" },
  { id: "values", label: "Principles" },
  { id: "strengths", label: "Toolkit note" },
  { id: "cta", label: "CTA" },
];

const FACT_ICONS: AboutFactIcon[] = ["pin", "building", "briefcase", "grad", "sparkle", "bolt", "target", "globe"];
const FOCUS_ICONS: AboutFocusIcon[] = ["code", "data", "bulb", "people", "rocket", "book"];
const VALUE_ICONS: AboutValueIcon[] = ["diamond", "gear", "person", "chart"];

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

export default function AboutEditorPage() {
  const [content, setContent] = useState<AboutPageContent>(DEFAULT_ABOUT_PAGE);
  const [section, setSection] = useState<SectionId>("hero");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();
  const selectSection = useSectionHash(SECTIONS, setSection);
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const previewWidth = DEVICES.find((item) => item.id === device)?.width || "100%";

  useEffect(() => {
    setContent(aboutPageFrom(getLocalSettings()));
    void fetchRemoteSettings().then((remote) => {
      if (remote) setContent(aboutPageFrom(remote));
    });
  }, []);

  const save = () => {
    void runSave(async () => {
      await saveLocalSettings({ aboutPage: content });
    }, "About page saved.");
  };

  const patchHero = (next: Partial<AboutPageContent["hero"]>) => {
    setContent((current) => ({ ...current, hero: { ...current.hero, ...next } }));
  };
  const patchFocus = (next: Partial<AboutPageContent["focus"]>) => {
    setContent((current) => ({ ...current, focus: { ...current.focus, ...next } }));
  };
  const patchFacts = (next: Partial<AboutPageContent["facts"]>) => {
    setContent((current) => ({ ...current, facts: { ...current.facts, ...next } }));
  };
  const patchValues = (next: Partial<AboutPageContent["values"]>) => {
    setContent((current) => ({ ...current, values: { ...current.values, ...next } }));
  };
  const patchStrengths = (next: Partial<AboutPageContent["strengths"]>) => {
    setContent((current) => ({ ...current, strengths: { ...current.strengths, ...next } }));
  };
  const patchCta = (next: Partial<AboutPageContent["cta"]>) => {
    setContent((current) => ({ ...current, cta: { ...current.cta, ...next } }));
  };

  return (
    <div className={previewOpen ? "hp-board is-preview-open" : "hp-board"}>
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>About</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </nav>
          <h1>About page</h1>
          <p>Hero, specializations and evidence are editable. Journey lives on the homepage — not duplicated here.</p>
        </div>
        <div className="hp-board-actions">
          <div className="hp-section-pills" role="tablist" aria-label="About sections">
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
            {section === "hero" && (
              <>
                <Field label="Section label" value={content.hero.label} onChange={(label) => patchHero({ label })} />
                <Field label="Title" value={content.hero.title} area onChange={(title) => patchHero({ title })} />
                <Field label="Body" value={content.hero.body} area onChange={(body) => patchHero({ body })} />
                <Field label="Primary CTA label" value={content.hero.primaryCtaLabel} onChange={(primaryCtaLabel) => patchHero({ primaryCtaLabel })} />
                <Field label="Primary CTA href" value={content.hero.primaryCtaHref} onChange={(primaryCtaHref) => patchHero({ primaryCtaHref })} />
                <Field label="Secondary CTA label" value={content.hero.secondaryCtaLabel} onChange={(secondaryCtaLabel) => patchHero({ secondaryCtaLabel })} />
                <Field label="Secondary CTA href" value={content.hero.secondaryCtaHref} onChange={(secondaryCtaHref) => patchHero({ secondaryCtaHref })} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}>
                  <RiImageAddLine size={15} /> Change portrait
                </button>
                <div className="hp-list-head">
                  <p>Fact cards</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchHero({
                        facts: [...content.hero.facts, { icon: "pin", label: "New", value: "Detail" }],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.hero.facts.map((fact, index) => (
                  <div key={`${fact.label}-${index}`} className="hp-mini-card">
                    <CustomSelect
                      id={`about-fact-icon-${index}`}
                      value={fact.icon}
                      options={FACT_ICONS.map((icon) => ({ value: icon, label: icon }))}
                      onChange={(icon) => {
                        const facts = content.hero.facts.map((entry, i) =>
                          i === index ? { ...entry, icon: icon as AboutFactIcon } : entry,
                        );
                        patchHero({ facts });
                      }}
                    />
                    <Field
                      label="Label"
                      value={fact.label}
                      onChange={(label) => {
                        const facts = content.hero.facts.map((entry, i) => (i === index ? { ...entry, label } : entry));
                        patchHero({ facts });
                      }}
                    />
                    <Field
                      label="Value"
                      value={fact.value}
                      onChange={(value) => {
                        const facts = content.hero.facts.map((entry, i) => (i === index ? { ...entry, value } : entry));
                        patchHero({ facts });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={content.hero.facts.length <= 1}
                      onClick={() => patchHero({ facts: content.hero.facts.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
              </>
            )}

            {section === "focus" && (
              <>
                <Field label="Section label" value={content.focus.label} onChange={(label) => patchFocus({ label })} />
                <Field label="Title" value={content.focus.title} onChange={(title) => patchFocus({ title })} />
                <div className="hp-list-head">
                  <p>Focus items</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchFocus({
                        items: [...content.focus.items, { icon: "code", title: "New focus", body: "Short description." }],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.focus.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="hp-mini-card">
                    <CustomSelect
                      id={`about-focus-icon-${index}`}
                      value={item.icon}
                      options={FOCUS_ICONS.map((icon) => ({ value: icon, label: icon }))}
                      onChange={(icon) => {
                        const items = content.focus.items.map((entry, i) =>
                          i === index ? { ...entry, icon: icon as AboutFocusIcon } : entry,
                        );
                        patchFocus({ items });
                      }}
                    />
                    <Field
                      label="Title"
                      value={item.title}
                      onChange={(title) => {
                        const items = content.focus.items.map((entry, i) => (i === index ? { ...entry, title } : entry));
                        patchFocus({ items });
                      }}
                    />
                    <Field
                      label="Body"
                      value={item.body}
                      area
                      onChange={(body) => {
                        const items = content.focus.items.map((entry, i) => (i === index ? { ...entry, body } : entry));
                        patchFocus({ items });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => patchFocus({ items: content.focus.items.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
              </>
            )}

            {section === "facts" && (
              <>
                <Field label="Section label" value={content.facts.label} onChange={(label) => patchFacts({ label })} />
                <Field label="Title" value={content.facts.title} onChange={(title) => patchFacts({ title })} />
                <div className="hp-list-head">
                  <p>Evidence cards</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchFacts({
                        items: [...content.facts.items, { title: "New", subtitle: "Detail", meta: "Meta", href: "/projects" }],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.facts.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="hp-mini-card">
                    <Field
                      label="Title"
                      value={item.title}
                      onChange={(title) => {
                        const items = content.facts.items.map((entry, i) => (i === index ? { ...entry, title } : entry));
                        patchFacts({ items });
                      }}
                    />
                    <Field
                      label="Subtitle"
                      value={item.subtitle}
                      onChange={(subtitle) => {
                        const items = content.facts.items.map((entry, i) => (i === index ? { ...entry, subtitle } : entry));
                        patchFacts({ items });
                      }}
                    />
                    <Field
                      label="Meta"
                      value={item.meta}
                      onChange={(meta) => {
                        const items = content.facts.items.map((entry, i) => (i === index ? { ...entry, meta } : entry));
                        patchFacts({ items });
                      }}
                    />
                    <Field
                      label="Href"
                      value={item.href}
                      onChange={(href) => {
                        const items = content.facts.items.map((entry, i) => (i === index ? { ...entry, href } : entry));
                        patchFacts({ items });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => patchFacts({ items: content.facts.items.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
              </>
            )}

            {section === "values" && (
              <>
                <Field label="Section label" value={content.values.label} onChange={(label) => patchValues({ label })} />
                <Field label="Title" value={content.values.title} onChange={(title) => patchValues({ title })} />
                <div className="hp-list-head">
                  <p>Principles</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchValues({
                        items: [...content.values.items, { icon: "diamond", title: "New principle", body: "Short line." }],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.values.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="hp-mini-card">
                    <CustomSelect
                      id={`about-value-icon-${index}`}
                      value={item.icon}
                      options={VALUE_ICONS.map((icon) => ({ value: icon, label: icon }))}
                      onChange={(icon) => {
                        const items = content.values.items.map((entry, i) =>
                          i === index ? { ...entry, icon: icon as AboutValueIcon } : entry,
                        );
                        patchValues({ items });
                      }}
                    />
                    <Field
                      label="Title"
                      value={item.title}
                      onChange={(title) => {
                        const items = content.values.items.map((entry, i) => (i === index ? { ...entry, title } : entry));
                        patchValues({ items });
                      }}
                    />
                    <Field
                      label="Body"
                      value={item.body}
                      area
                      onChange={(body) => {
                        const items = content.values.items.map((entry, i) => (i === index ? { ...entry, body } : entry));
                        patchValues({ items });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => patchValues({ items: content.values.items.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
              </>
            )}

            {section === "strengths" && (
              <>
                <Field label="Toolkit label" value={content.strengths.label} onChange={(label) => patchStrengths({ label })} />
                <Field label="Toolkit title" value={content.strengths.title} onChange={(title) => patchStrengths({ title })} />
                <p className="hp-field">
                  <small>
                    The Engineering Toolkit section on the public About page is driven by project evidence, not these tags.
                    Keep this empty unless you need a custom note list later.
                  </small>
                </p>
              </>
            )}

            {section === "cta" && (
              <>
                <Field label="Section label" value={content.cta.label} onChange={(label) => patchCta({ label })} />
                <Field label="Title" value={content.cta.title} onChange={(title) => patchCta({ title })} />
                <Field label="Body" value={content.cta.body} area onChange={(body) => patchCta({ body })} />
                <Field label="Primary CTA label" value={content.cta.primaryCtaLabel} onChange={(primaryCtaLabel) => patchCta({ primaryCtaLabel })} />
                <Field label="Primary CTA href" value={content.cta.primaryCtaHref} onChange={(primaryCtaHref) => patchCta({ primaryCtaHref })} />
                <Field label="Secondary CTA label" value={content.cta.secondaryCtaLabel} onChange={(secondaryCtaLabel) => patchCta({ secondaryCtaLabel })} />
                <Field label="Secondary CTA href" value={content.cta.secondaryCtaHref} onChange={(secondaryCtaHref) => patchCta({ secondaryCtaHref })} />
              </>
            )}
          </div>
          <div className="hp-editor-foot">
            <button type="button" className="btn btn-primary hp-save" onClick={save} disabled={saving}>
              <RiSaveLine size={16} /> {saving ? "Saving…" : "Save about page"}
            </button>
          </div>
        </aside>

        <section className="hp-preview">
          <div className="hp-preview-top">
            <strong>Live preview</strong>
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
                    <Icon size={14} /> {item.label}
                  </button>
                );
              })}
            </div>
            <button type="button" className="btn btn-ghost btn-sm hp-preview-close" onClick={() => setPreviewOpen(false)}>
              <RiCloseLine size={16} /> Close
            </button>
          </div>
          <div className="hp-preview-stage">
            <div className="hp-preview-frame" data-device={device} style={{ width: previewWidth }}>
              <AboutPageView content={content} embedded />
            </div>
          </div>
        </section>
      </div>

      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (!url.startsWith("blob:")) patchHero({ portrait: url });
          setMediaOpen(false);
        }}
      />
    </div>
  );
}
