"use client";

import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiSaveLine,
} from "react-icons/ri";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import CustomSelect from "@/components/ui/CustomSelect";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
import {
  DEFAULT_SERVICES_PAGE,
  SERVICE_FOCUS_IDS,
  servicesPageFrom,
  type ServiceFocus,
  type ServiceItem,
  type ServicesPageContent,
} from "@/lib/services-page";
import { useSectionHash } from "@/hooks/useSectionHash";

type SectionId = "hero" | "families" | "items" | "audiences" | "process" | "cta" | "seo";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "families", label: "Families" },
  { id: "items", label: "Services" },
  { id: "audiences", label: "Audiences" },
  { id: "process", label: "Process" },
  { id: "cta", label: "CTA" },
  { id: "seo", label: "SEO" },
];

const FOCUS_OPTIONS = SERVICE_FOCUS_IDS.map((id) => ({
  value: id,
  label: id[0].toUpperCase() + id.slice(1),
}));

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
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function linesToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function listToLines(value: string[]) {
  return value.join("\n");
}

export default function ServicesEditorPage() {
  const [content, setContent] = useState<ServicesPageContent>(DEFAULT_SERVICES_PAGE);
  const [section, setSection] = useState<SectionId>("hero");
  const [itemIndex, setItemIndex] = useState(0);
  const { runSave, saving } = useDashboardFeedback();
  const selectSection = useSectionHash(SECTIONS, setSection);
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const currentItem = content.items[itemIndex] || content.items[0];

  useEffect(() => {
    setContent(servicesPageFrom(getLocalSettings(), { includeUnpublished: true }));
    void fetchRemoteSettings().then((remote) => {
      if (remote) setContent(servicesPageFrom(remote, { includeUnpublished: true }));
    });
  }, []);

  const save = () => {
    void runSave(async () => {
      await saveLocalSettings({ servicesPage: content });
    }, "Services page saved.");
  };

  const patch = (next: Partial<ServicesPageContent>) => {
    setContent((current) => ({ ...current, ...next }));
  };

  const patchItem = (index: number, next: Partial<ServiceItem>) => {
    setContent((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)),
    }));
  };

  const addItem = () => {
    const category = (SERVICE_FOCUS_IDS[content.items.length % SERVICE_FOCUS_IDS.length] || "build") as ServiceFocus;
    const id = `service-${Date.now()}`;
    setContent((current) => ({
      ...current,
      items: [
        ...current.items,
        {
          id,
          slug: id,
          title: "New service",
          shortTitle: "New",
          category,
          summary: "Short summary of the capability.",
          description: "Clear description of what is included. Keep claims verified.",
          icon: "compass",
          capabilities: ["Capability one"],
          technologies: [],
          relatedProjects: [],
          relatedExperience: [],
          audiences: ["Organizations"],
          engagementType: ["Build"],
          featured: false,
          published: true,
          sortOrder: current.items.length + 1,
        },
      ],
    }));
    setItemIndex(content.items.length);
  };

  return (
    <div className="hp-board">
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>Services</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </nav>
          <h1>Services page</h1>
          <p>Manage Build / Grow / Transform / Support families and the public capabilities page.</p>
        </div>
        <div className="hp-board-actions">
          <div className="hp-section-pills" role="tablist" aria-label="Services editor sections">
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
          <button type="button" className="btn btn-primary hp-top-save" onClick={save} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="hp-workspace" style={{ gridTemplateColumns: "minmax(22rem, 34rem) minmax(0, 1fr)" }}>
        <aside className="hp-editor">
          <div className="hp-editor-body">
            {section === "hero" ? (
              <>
                <Field label="Eyebrow" value={content.hero.label} onChange={(label) => patch({ hero: { ...content.hero, label } })} />
                <Field label="Title" value={content.hero.title} area onChange={(title) => patch({ hero: { ...content.hero, title } })} />
                <Field label="Body" value={content.hero.body} area onChange={(body) => patch({ hero: { ...content.hero, body } })} />
              </>
            ) : null}

            {section === "families" ? (
              <>
                {content.families.map((family, index) => (
                  <div key={family.id} className="hp-mini-card">
                    <p className="hp-note" style={{ marginBottom: "0.4rem" }}>{family.label}</p>
                    <Field
                      label="Title"
                      value={family.title}
                      onChange={(title) => {
                        const families = content.families.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, title } : entry,
                        );
                        patch({ families });
                      }}
                    />
                    <Field
                      label="Summary"
                      value={family.summary}
                      area
                      onChange={(summary) => {
                        const families = content.families.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, summary } : entry,
                        );
                        patch({ families });
                      }}
                    />
                    <label className="hp-field">
                      <span>Layout</span>
                      <CustomSelect
                        value={family.layout}
                        options={[
                          { value: "modules", label: "Modules" },
                          { value: "feature", label: "Feature" },
                          { value: "workflow", label: "Workflow" },
                          { value: "assist", label: "Assist" },
                        ]}
                        onChange={(layout) => {
                          const families = content.families.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, layout: layout as typeof family.layout } : entry,
                          );
                          patch({ families });
                        }}
                      />
                    </label>
                  </div>
                ))}
              </>
            ) : null}

            {section === "items" && currentItem ? (
              <>
                <div className="hp-list-head">
                  <p>Service items ({content.items.length})</p>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                <label className="hp-field">
                  <span>Editing</span>
                  <CustomSelect
                    value={String(itemIndex)}
                    options={content.items.map((item, index) => ({
                      value: String(index),
                      label: `${item.category.toUpperCase()} — ${item.title}`,
                    }))}
                    onChange={(value) => setItemIndex(Number(value))}
                  />
                </label>
                <Field label="Title" value={currentItem.title} onChange={(title) => patchItem(itemIndex, { title })} />
                <Field label="Short title" value={currentItem.shortTitle} onChange={(shortTitle) => patchItem(itemIndex, { shortTitle })} />
                <Field label="Slug" value={currentItem.slug} onChange={(slug) => patchItem(itemIndex, { slug })} />
                <label className="hp-field">
                  <span>Family</span>
                  <CustomSelect
                    value={currentItem.category}
                    options={FOCUS_OPTIONS}
                    onChange={(category) => patchItem(itemIndex, { category: category as ServiceFocus })}
                  />
                </label>
                <Field label="Summary" value={currentItem.summary} area onChange={(summary) => patchItem(itemIndex, { summary })} />
                <Field label="Description" value={currentItem.description} area onChange={(description) => patchItem(itemIndex, { description })} />
                <Field label="Icon key" value={currentItem.icon} onChange={(icon) => patchItem(itemIndex, { icon })} hint="code, globe, puzzle, layers, box, store, radar, share, cart, palette, search, flow, chart, link, bolt, brain, compass, guide, globe-people, wrench, book, settings" />
                <Field
                  label="Capabilities (one per line)"
                  value={listToLines(currentItem.capabilities)}
                  area
                  onChange={(value) => patchItem(itemIndex, { capabilities: linesToList(value) })}
                />
                <Field
                  label="Technologies (one per line)"
                  value={listToLines(currentItem.technologies)}
                  area
                  onChange={(value) => patchItem(itemIndex, { technologies: linesToList(value) })}
                />
                <Field
                  label="Related project ids (one per line)"
                  value={listToLines(currentItem.relatedProjects)}
                  area
                  onChange={(value) => patchItem(itemIndex, { relatedProjects: linesToList(value) })}
                />
                <Field
                  label="Related experience ids (one per line)"
                  value={listToLines(currentItem.relatedExperience)}
                  area
                  onChange={(value) => patchItem(itemIndex, { relatedExperience: linesToList(value) })}
                />
                <label className="hp-toggle">
                  <input
                    type="checkbox"
                    checked={currentItem.featured}
                    onChange={(event) => patchItem(itemIndex, { featured: event.target.checked })}
                  />
                  <span>Featured</span>
                </label>
                <label className="hp-toggle">
                  <input
                    type="checkbox"
                    checked={currentItem.published}
                    onChange={(event) => patchItem(itemIndex, { published: event.target.checked })}
                  />
                  <span>Published</span>
                </label>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={content.items.length <= 1}
                  onClick={() => {
                    setContent((current) => ({
                      ...current,
                      items: current.items.filter((_, index) => index !== itemIndex),
                    }));
                    setItemIndex(0);
                  }}
                >
                  <RiDeleteBin6Line size={15} /> Remove service
                </button>
              </>
            ) : null}

            {section === "audiences" ? (
              <>
                <Field label="Label" value={content.audiences.label} onChange={(label) => patch({ audiences: { ...content.audiences, label } })} />
                <Field label="Title" value={content.audiences.title} onChange={(title) => patch({ audiences: { ...content.audiences, title } })} />
                <Field label="Body" value={content.audiences.body} area onChange={(body) => patch({ audiences: { ...content.audiences, body } })} />
                {content.audiences.items.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="hp-mini-card">
                    <Field
                      label="Audience"
                      value={item.title}
                      onChange={(title) => {
                        const items = content.audiences.items.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, title } : entry,
                        );
                        patch({ audiences: { ...content.audiences, items } });
                      }}
                    />
                    <Field
                      label="Note"
                      value={item.body}
                      area
                      onChange={(body) => {
                        const items = content.audiences.items.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, body } : entry,
                        );
                        patch({ audiences: { ...content.audiences, items } });
                      }}
                    />
                  </div>
                ))}
              </>
            ) : null}

            {section === "process" ? (
              <>
                <Field label="Label" value={content.process.label} onChange={(label) => patch({ process: { ...content.process, label } })} />
                <Field label="Title" value={content.process.title} onChange={(title) => patch({ process: { ...content.process, title } })} />
                {content.process.steps.map((step, index) => (
                  <div key={step.n} className="hp-mini-card">
                    <Field
                      label={`${step.n} title`}
                      value={step.title}
                      onChange={(title) => {
                        const steps = content.process.steps.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, title } : entry,
                        );
                        patch({ process: { ...content.process, steps } });
                      }}
                    />
                    <Field
                      label="Body"
                      value={step.body}
                      area
                      onChange={(body) => {
                        const steps = content.process.steps.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, body } : entry,
                        );
                        patch({ process: { ...content.process, steps } });
                      }}
                    />
                  </div>
                ))}
                <Field label="LERONY note" value={content.leronyNote} area onChange={(leronyNote) => patch({ leronyNote })} />
              </>
            ) : null}

            {section === "cta" ? (
              <>
                <Field label="Title" value={content.cta.title} onChange={(title) => patch({ cta: { ...content.cta, title } })} />
                <Field label="Body" value={content.cta.body} area onChange={(body) => patch({ cta: { ...content.cta, body } })} />
                <Field label="Primary label" value={content.cta.primaryLabel} onChange={(primaryLabel) => patch({ cta: { ...content.cta, primaryLabel } })} />
                <Field label="Primary href" value={content.cta.primaryHref} onChange={(primaryHref) => patch({ cta: { ...content.cta, primaryHref } })} />
                <Field label="Email label" value={content.cta.secondaryLabel} onChange={(secondaryLabel) => patch({ cta: { ...content.cta, secondaryLabel } })} />
                <Field label="Email href" value={content.cta.secondaryHref} onChange={(secondaryHref) => patch({ cta: { ...content.cta, secondaryHref } })} />
                <Field label="WhatsApp label" value={content.cta.whatsappLabel} onChange={(whatsappLabel) => patch({ cta: { ...content.cta, whatsappLabel } })} />
              </>
            ) : null}

            {section === "seo" ? (
              <>
                <Field label="SEO title" value={content.seo.title} onChange={(title) => patch({ seo: { ...content.seo, title } })} />
                <Field label="SEO description" value={content.seo.description} area onChange={(description) => patch({ seo: { ...content.seo, description } })} />
                <p className="hp-note">Filtered URLs like /services?focus=build canonicalize to /services.</p>
              </>
            ) : null}
          </div>
          <div className="hp-editor-foot">
            <button type="button" className="btn btn-primary hp-save" onClick={save} disabled={saving}>
              <RiSaveLine size={16} /> {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </aside>

        <section className="hp-preview" aria-label="Services summary">
          <div className="hp-preview-top">
            <p>Live structure</p>
          </div>
          <div className="hp-preview-stage" style={{ padding: "1rem" }}>
            <p className="section-label">{content.hero.label}</p>
            <h2 style={{ margin: "0.35rem 0", fontSize: "1.25rem" }}>{content.hero.title}</h2>
            <p style={{ color: "#64748b", fontSize: "0.86rem", marginBottom: "1rem" }}>{content.hero.body}</p>
            {content.families.map((family) => (
              <div key={family.id} style={{ marginBottom: "0.85rem" }}>
                <strong style={{ color: "#0e52a8" }}>{family.label}</strong>
                <div style={{ fontSize: "0.84rem", fontWeight: 700 }}>{family.title}</div>
                <ul style={{ margin: "0.35rem 0 0", paddingLeft: "1rem", color: "#475569", fontSize: "0.78rem" }}>
                  {content.items
                    .filter((item) => item.category === family.id && item.published)
                    .map((item) => (
                      <li key={item.id}>{item.title}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
