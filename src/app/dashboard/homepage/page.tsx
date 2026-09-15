"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiCompass3Line,
  RiComputerLine,
  RiDatabase2Line,
  RiDeleteBin6Line,
  RiDragMove2Line,
  RiImageAddLine,
  RiLayoutGridLine,
  RiSaveLine,
  RiSmartphoneLine,
  RiTabletLine,
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import ManifestoSection from "@/components/home/ManifestoSection";
import SelectedWork from "@/components/home/SelectedWork";
import KnowledgeSection from "@/components/home/KnowledgeSection";
import JourneySection from "@/components/home/JourneySection";
import {
  DEFAULT_HOMEPAGE,
  homepageFrom,
  type HomepageContent,
  type KnowledgeIcon,
  type KnowledgeItem,
  type WorkStory,
} from "@/lib/homepage";
import { getLocalSettings, saveLocalSettings } from "@/lib/supabase";
import { siteConfig } from "@/data/site-data";

type SectionId = "manifesto" | "work" | "knowledge" | "journey" | "ventures" | "principles" | "speaking" | "booking" | "closing";
type EditorTab = "content" | "style" | "display";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "manifesto", label: "Manifesto" },
  { id: "work", label: "Evidence" },
  { id: "knowledge", label: "Knowledge" },
  { id: "journey", label: "Journey" },
  { id: "ventures", label: "Ventures" },
  { id: "principles", label: "Principles" },
  { id: "speaking", label: "Speaking" },
  { id: "booking", label: "Booking" },
  { id: "closing", label: "Closing" },
];

const ICON_OPTIONS: { value: KnowledgeIcon; label: string; Icon: typeof RiCompass3Line }[] = [
  { value: "strategy", label: "Strategy", Icon: RiCompass3Line },
  { value: "product", label: "Product", Icon: RiLayoutGridLine },
  { value: "technology", label: "Technology", Icon: RiDatabase2Line },
  { value: "data", label: "Data", Icon: RiBarChartBoxLine },
];

const DEVICES: { id: PreviewDevice; label: string; width: string; Icon: typeof RiComputerLine }[] = [
  { id: "desktop", label: "Desktop · 1440px", width: "100%", Icon: RiComputerLine },
  { id: "tablet", label: "Tablet", width: "820px", Icon: RiTabletLine },
  { id: "mobile", label: "Mobile", width: "390px", Icon: RiSmartphoneLine },
];

export default function HomepageEditorPage() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [section, setSection] = useState<SectionId>("knowledge");
  const [tab, setTab] = useState<EditorTab>("content");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [storyIndex, setStoryIndex] = useState(0);
  const [focusIndex, setFocusIndex] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();
  const settings = getLocalSettings();
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const previewWidth = DEVICES.find((item) => item.id === device)?.width || "100%";

  useEffect(() => {
    setContent(homepageFrom(getLocalSettings()));
  }, []);

  useEffect(() => {
    setTab("content");
    setFocusIndex(0);
  }, [section]);

  const save = () => {
    void runSave(() => {
      saveLocalSettings({ homepage: content });
    }, "Homepage saved.");
  };

  const patchKnowledge = (next: Partial<HomepageContent["knowledge"]>) => {
    setContent((current) => ({ ...current, knowledge: { ...current.knowledge, ...next } }));
  };

  const patchKnowledgeDisplay = (key: keyof HomepageContent["knowledge"]["display"], value: boolean) => {
    patchKnowledge({ display: { ...content.knowledge.display, [key]: value } });
  };

  const patchItem = (index: number, next: Partial<KnowledgeItem>) => {
    const items = content.knowledge.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item));
    patchKnowledge({ items });
  };

  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= content.knowledge.items.length || from === to) return;
    const items = [...content.knowledge.items];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    patchKnowledge({ items });
    setFocusIndex(to);
  };

  const addItem = () => {
    const icons: KnowledgeIcon[] = ["strategy", "product", "technology", "data"];
    const item: KnowledgeItem = {
      title: "New focus area",
      body: "Describe how this area shows up in the work.",
      href: "/services",
      icon: icons[content.knowledge.items.length % icons.length],
    };
    patchKnowledge({ items: [...content.knowledge.items, item] });
    setFocusIndex(content.knowledge.items.length);
  };

  const removeItem = (index: number) => {
    if (content.knowledge.items.length <= 1) return;
    patchKnowledge({ items: content.knowledge.items.filter((_, itemIndex) => itemIndex !== index) });
    setFocusIndex((current) => Math.max(0, Math.min(current, content.knowledge.items.length - 2)));
  };

  const story = content.work.stories[storyIndex];
  const patchStory = (next: Partial<WorkStory>) => {
    setContent((current) => ({
      ...current,
      work: {
        ...current.work,
        stories: current.work.stories.map((item, index) => (index === storyIndex ? { ...item, ...next } : item)),
      },
    }));
  };

  return (
    <div className="hp-board">
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>Homepage</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </nav>
          <h1>Homepage</h1>
          <p>Edit the public story section by section. The preview updates as you type.</p>
        </div>
        <div className="hp-section-pills" role="tablist" aria-label="Homepage sections">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
              role="tab"
              aria-selected={section === item.id}
              className={section === item.id ? "is-on" : undefined}
            onClick={() => setSection(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      </div>

      <div className="hp-workspace">
        <aside className="hp-editor">
          <div className="hp-tabs" role="tablist" aria-label="Editor panels">
            {(["content", "style", "display"] as EditorTab[]).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={tab === item}
                className={tab === item ? "is-on" : undefined}
                onClick={() => setTab(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          <div className="hp-editor-body">
            {section === "knowledge" && tab === "content" && (
              <>
                <Field label="Section label" value={content.knowledge.label} onChange={(label) => patchKnowledge({ label })} />
                <Field label="Title" value={content.knowledge.title} onChange={(title) => patchKnowledge({ title })} />
                <Field label="Subtitle" value={content.knowledge.body} area onChange={(body) => patchKnowledge({ body })} />
                <Field
                  label="Right side labels"
                  value={content.knowledge.rail.join(", ")}
                  onChange={(value) => patchKnowledge({ rail: value.split(",").map((item) => item.trim()).filter(Boolean) })}
                  hint="Comma-separated. Shown as the vertical rail."
                />

                <div className="hp-list-head">
                  <p>Focus areas</p>
                  <span>{content.knowledge.items.length}</span>
                </div>
                <div className="hp-focus-list">
                  {content.knowledge.items.map((item, index) => {
                    const meta = ICON_OPTIONS.find((option) => option.value === (item.icon || "strategy")) || ICON_OPTIONS[0];
                    const Icon = meta.Icon;
                    const open = focusIndex === index;
                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className={open ? "hp-focus-item is-open" : "hp-focus-item"}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => {
                          if (dragIndex === null) return;
                          moveItem(dragIndex, index);
                          setDragIndex(null);
                        }}
                        onDragEnd={() => setDragIndex(null)}
                      >
                        <button type="button" className="hp-focus-row" onClick={() => setFocusIndex(index)}>
                          <span className="hp-drag" aria-hidden="true"><RiDragMove2Line size={16} /></span>
                          <span className="hp-focus-icon"><Icon size={16} /></span>
                          <span className="hp-focus-copy">
                            <strong>{item.title}</strong>
                            <small>{item.body}</small>
                          </span>
                        </button>
                        <button
                          type="button"
                          className="hp-icon-btn"
                          aria-label={`Remove ${item.title}`}
                          disabled={content.knowledge.items.length <= 1}
                          onClick={() => removeItem(index)}
                        >
                          <RiDeleteBin6Line size={15} />
                        </button>
                        {open ? (
                          <div className="hp-focus-edit">
                            <Field label="Title" value={item.title} onChange={(title) => patchItem(index, { title })} />
                            <Field label="Description" value={item.body} area onChange={(body) => patchItem(index, { body })} />
                            <Field label="Learn more link" value={item.href || ""} onChange={(href) => patchItem(index, { href })} />
                            <label className="hp-field">
                              <span>Icon</span>
                              <select
                                value={item.icon || meta.value}
                                onChange={(event) => patchItem(index, { icon: event.target.value as KnowledgeIcon })}
                              >
                                {ICON_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="hp-add-btn" onClick={addItem}>
                  <RiAddLine size={16} /> Add Focus Area
                </button>
              </>
            )}

            {section === "knowledge" && tab === "style" && (
              <>
                <Field label="Learn more label" value={content.knowledge.learnMore} onChange={(learnMore) => patchKnowledge({ learnMore })} />
                <Field label="Script line" value={content.knowledge.script} onChange={(script) => patchKnowledge({ script })} hint="Optional handwritten accent when enabled in Display." />
                <Field label="Statement" value={content.knowledge.statement} area onChange={(statement) => patchKnowledge({ statement })} />
                <Field label="Underlined phrase" value={content.knowledge.statementMark} onChange={(statementMark) => patchKnowledge({ statementMark })} />
                <div className="hp-list-head"><p>Stats strip</p></div>
                {content.knowledge.stats.map((stat, index) => (
                  <div key={index} className="hp-stat-row">
                    <Field
                      label="Value"
                      value={stat.value}
                      onChange={(value) => {
                        const stats = content.knowledge.stats.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value } : entry));
                        patchKnowledge({ stats });
                      }}
                    />
                    <Field
                      label="Label"
                      value={stat.label}
                      onChange={(label) => {
                        const stats = content.knowledge.stats.map((entry, entryIndex) => (entryIndex === index ? { ...entry, label } : entry));
                        patchKnowledge({ stats });
                      }}
                    />
                  </div>
                ))}
                <p className="hp-note">Keep values honest. Prefer focus counts and documented systems over invented metrics.</p>
                <Field label="Quote" value={content.knowledge.quote} area onChange={(quote) => patchKnowledge({ quote })} />
                <Field label="Attribution" value={content.knowledge.attribution} onChange={(attribution) => patchKnowledge({ attribution })} />
              </>
            )}

            {section === "knowledge" && tab === "display" && (
              <div className="hp-toggles">
                {(
                  [
                    ["showRail", "Right side labels"],
                    ["showScript", "Handwritten script"],
                    ["showStatement", "Statement bar"],
                    ["showStats", "Stats strip"],
                    ["showQuote", "Quote"],
                    ["showIndex", "Card numbers"],
                    ["showGo", "Circular arrow button"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="hp-toggle">
                    <input
                      type="checkbox"
                      checked={content.knowledge.display[key]}
                      onChange={(event) => patchKnowledgeDisplay(key, event.target.checked)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}

            {section === "journey" && tab === "content" && (
              <>
                <Field label="Section label" value={content.journey.label} onChange={(label) => setContent({ ...content, journey: { ...content.journey, label } })} />
                <Field label="Title" value={content.journey.title} onChange={(title) => setContent({ ...content, journey: { ...content.journey, title } })} />
                <Field label="Subtitle" value={content.journey.note} area onChange={(note) => setContent({ ...content, journey: { ...content.journey, note } })} />
                <Field label="More card title" value={content.journey.moreTitle} onChange={(moreTitle) => setContent({ ...content, journey: { ...content.journey, moreTitle } })} />
                <Field label="More card body" value={content.journey.moreBody} area onChange={(moreBody) => setContent({ ...content, journey: { ...content.journey, moreBody } })} />
                <Field label="Timeline CTA" value={content.journey.moreCta} onChange={(moreCta) => setContent({ ...content, journey: { ...content.journey, moreCta, cta: moreCta } })} hint="Used by the Need more details card and timeline footer. Links to /experience." />
                <div className="hp-list-head">
                  <p>Timeline entries</p>
                  <span>{content.journey.entries.length}</span>
                </div>
                {content.journey.entries.map((entry, index) => (
                  <div key={entry.id} className="hp-mini-card">
                    <Field
                      label="Title"
                      value={entry.title}
                      onChange={(title) => {
                        const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, title } : item));
                        setContent({ ...content, journey: { ...content.journey, entries } });
                      }}
                    />
                    <Field
                      label="Year"
                      value={entry.year}
                      onChange={(year) => {
                        const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, year } : item));
                        setContent({ ...content, journey: { ...content.journey, entries } });
                      }}
                    />
                    <Field
                      label="Organization"
                      value={entry.organization}
                      onChange={(organization) => {
                        const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, organization } : item));
                        setContent({ ...content, journey: { ...content.journey, entries } });
                      }}
                    />
                    <Field
                      label="Short description"
                      value={entry.description}
                      area
                      onChange={(description) => {
                        const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, description } : item));
                        setContent({ ...content, journey: { ...content.journey, entries } });
                      }}
                    />
                    <Field
                      label="Detail summary"
                      value={entry.summary || ""}
                      area
                      onChange={(summary) => {
                        const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, summary } : item));
                        setContent({ ...content, journey: { ...content.journey, entries } });
                      }}
                    />
                    <label className="hp-toggle">
                      <input
                        type="checkbox"
                        checked={entry.showDetails}
                        onChange={(event) => {
                          const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, showDetails: event.target.checked } : item));
                          setContent({ ...content, journey: { ...content.journey, entries } });
                        }}
                      />
                      <span>Show further details link</span>
                    </label>
                    <label className="hp-toggle">
                      <input
                        type="checkbox"
                        checked={entry.detailsBlocked}
                        onChange={(event) => {
                          const entries = content.journey.entries.map((item, itemIndex) => (itemIndex === index ? { ...item, detailsBlocked: event.target.checked } : item));
                          setContent({ ...content, journey: { ...content.journey, entries } });
                        }}
                      />
                      <span>Block view details for visitors</span>
                    </label>
                  </div>
                ))}
                <p className="hp-note">Do not invent employers, dates, or results. Keep entries aligned with the verified Experience record.</p>
              </>
            )}

            {section === "journey" && tab === "style" && (
              <>
                <div className="hp-list-head"><p>Intro stats</p></div>
                {content.journey.stats.map((stat, index) => (
                  <div key={index} className="hp-stat-row">
                    <Field
                      label="Value"
                      value={stat.value}
                      onChange={(value) => {
                        const stats = content.journey.stats.map((entry, entryIndex) => (entryIndex === index ? { ...entry, value } : entry));
                        setContent({ ...content, journey: { ...content.journey, stats } });
                      }}
                    />
                    <Field
                      label="Label"
                      value={stat.label}
                      onChange={(label) => {
                        const stats = content.journey.stats.map((entry, entryIndex) => (entryIndex === index ? { ...entry, label } : entry));
                        setContent({ ...content, journey: { ...content.journey, stats } });
                      }}
                    />
                  </div>
                ))}
                <p className="hp-note">Keep stats honest — role counts and start year only, no invented metrics.</p>
              </>
            )}

            {section === "journey" && tab === "display" && (
              <div className="hp-toggles">
                {(
                  [
                    ["showStats", "Intro stats"],
                    ["showMoreCard", "Need more details card"],
                    ["showFilters", "Timeline filters"],
                    ["showSort", "Sort control"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="hp-toggle">
                    <input
                      type="checkbox"
                      checked={content.journey.display[key]}
                      onChange={(event) => setContent({
                        ...content,
                        journey: {
                          ...content.journey,
                          display: { ...content.journey.display, [key]: event.target.checked },
                        },
                      })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}

            {section !== "knowledge" && section !== "journey" && tab === "content" && (
              <OtherSectionFields
                section={section}
                content={content}
                setContent={setContent}
                story={story}
                storyIndex={storyIndex}
                setStoryIndex={setStoryIndex}
                patchStory={patchStory}
                onMedia={() => setMediaOpen(true)}
              />
            )}

            {section !== "knowledge" && section !== "journey" && tab !== "content" && (
              <p className="hp-note">
                {tab === "style"
                  ? "Style controls for this section stay with the shared design system. Use Content to edit the copy."
                  : "Display toggles are available on Knowledge and Journey. Other sections follow the public layout as designed."}
              </p>
            )}
          </div>

          <div className="hp-editor-foot">
            <button type="button" className="btn btn-primary hp-save" onClick={save} disabled={saving}>
              <RiSaveLine size={16} /> Save Changes
            </button>
          </div>
        </aside>

        <section className="hp-preview" aria-label="Live preview">
          <div className="hp-preview-top">
            <p>Live preview</p>
            <div className="hp-devices" role="group" aria-label="Preview width">
              {DEVICES.map((item) => {
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={device === item.id ? "is-on" : undefined}
                    onClick={() => setDevice(item.id)}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="hp-preview-stage">
            <div className="hp-preview-frame" data-device={device} style={{ width: previewWidth, maxWidth: "100%" }}>
              {section === "manifesto" && <ManifestoSection manifesto={content.manifesto} embedded />}
              {section === "work" && <SelectedWork work={content.work} records={settings.projectRecords} embedded />}
              {section === "knowledge" && <KnowledgeSection knowledge={content.knowledge} embedded />}
              {section === "journey" && <JourneySection journey={content.journey} embedded />}
              {section === "ventures" && (
                <PreviewBlock label={content.ventures.label} title={content.ventures.title}>
                  <p>{content.ventures.body}</p>
                  <small>{siteConfig.company.name} · {siteConfig.company.role}</small>
                </PreviewBlock>
              )}
              {section === "principles" && (
                <PreviewBlock label={content.principles.label} title={content.principles.title}>
                  <div className="hp-preview-stack">
                    {content.principles.items.map((item) => (
                      <article key={item.n}>
                        <span>{item.n}</span>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </PreviewBlock>
              )}
              {section === "speaking" && (
                <PreviewBlock label={content.speaking.label} title={content.speaking.title}>
                  {content.speaking.image ? <img src={content.speaking.image} alt="" /> : null}
                  <p>{content.speaking.body}</p>
                  <strong className="hp-linkish">{content.speaking.cta}</strong>
                </PreviewBlock>
              )}
              {section === "booking" && (
                <PreviewBlock label={content.booking.label} title={content.booking.title}>
                  <p>{content.booking.body}</p>
                  <div className="hp-preview-stack">
                    {content.booking.items.map((item) => (
                      <article key={item.title}>
                        <div className="hp-preview-row">
                          <strong>{item.title}</strong>
                          <span>{item.time}</span>
                        </div>
                        <p>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </PreviewBlock>
              )}
              {section === "closing" && (
                <PreviewBlock label="Closing" title={content.closing.title}>
                  <p>{content.closing.roles}</p>
                  <small>{settings.siteTitle || siteConfig.name} · {settings.location || "Kigali, Rwanda"}</small>
                </PreviewBlock>
          )}
        </div>
          </div>
        </section>
      </div>

      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (url.startsWith("blob:")) return;
          if (section === "manifesto") setContent({ ...content, manifesto: { ...content.manifesto, image: url } });
          else if (section === "speaking") setContent({ ...content, speaking: { ...content.speaking, image: url } });
          setMediaOpen(false);
        }}
      />
            </div>
  );
}

function OtherSectionFields({
  section,
  content,
  setContent,
  story,
  storyIndex,
  setStoryIndex,
  patchStory,
  onMedia,
}: {
  section: SectionId;
  content: HomepageContent;
  setContent: (value: HomepageContent | ((current: HomepageContent) => HomepageContent)) => void;
  story?: WorkStory;
  storyIndex: number;
  setStoryIndex: (value: number) => void;
  patchStory: (next: Partial<WorkStory>) => void;
  onMedia: () => void;
}) {
  if (section === "manifesto") {
    return (
            <>
              <Field label="Label" value={content.manifesto.label} onChange={(label) => setContent({ ...content, manifesto: { ...content.manifesto, label } })} />
              <Field label="Title" value={content.manifesto.title} onChange={(title) => setContent({ ...content, manifesto: { ...content.manifesto, title } })} />
              <Field label="Body" value={content.manifesto.body} area onChange={(body) => setContent({ ...content, manifesto: { ...content.manifesto, body } })} />
        <button type="button" className="btn btn-outline btn-sm" onClick={onMedia}><RiImageAddLine size={15} /> Change portrait</button>
              <Field label="Quote" value={content.manifesto.quote} area onChange={(quote) => setContent({ ...content, manifesto: { ...content.manifesto, quote } })} />
              <Field label="Name" value={content.manifesto.attribution} onChange={(attribution) => setContent({ ...content, manifesto: { ...content.manifesto, attribution } })} />
              <Field label="Roles" value={content.manifesto.roles} onChange={(roles) => setContent({ ...content, manifesto: { ...content.manifesto, roles } })} />
              <Field label="Script line" value={content.manifesto.script} onChange={(script) => setContent({ ...content, manifesto: { ...content.manifesto, script } })} />
              <Field label="Side labels" value={content.manifesto.rail.join(", ")} onChange={(value) => setContent({ ...content, manifesto: { ...content.manifesto, rail: value.split(",").map((item) => item.trim()).filter(Boolean) } })} />
              <Field label="Bottom line" value={content.manifesto.chip} onChange={(chip) => setContent({ ...content, manifesto: { ...content.manifesto, chip } })} />
              {content.manifesto.points.map((point, index) => (
          <div key={index} className="hp-mini-card">
                  <Field label={`Point ${index + 1}`} value={point.title} onChange={(title) => {
              const points = content.manifesto.points.map((item, itemIndex) => (itemIndex === index ? { ...item, title } : item));
                    setContent({ ...content, manifesto: { ...content.manifesto, points } });
                  }} />
                  <Field label="Detail" value={point.body} onChange={(body) => {
              const points = content.manifesto.points.map((item, itemIndex) => (itemIndex === index ? { ...item, body } : item));
                    setContent({ ...content, manifesto: { ...content.manifesto, points } });
                  }} />
                  <Field label="Tag" value={point.tag || ""} onChange={(tag) => {
              const points = content.manifesto.points.map((item, itemIndex) => (itemIndex === index ? { ...item, tag } : item));
                    setContent({ ...content, manifesto: { ...content.manifesto, points } });
                  }} />
                </div>
              ))}
            </>
    );
  }

  if (section === "work" && story) {
    return (
            <>
              <Field label="Section label" value={content.work.label} onChange={(label) => setContent({ ...content, work: { ...content.work, label } })} />
              <Field label="Section title" value={content.work.title} onChange={(title) => setContent({ ...content, work: { ...content.work, title } })} />
              <Field label="Intro" value={content.work.intro} area onChange={(intro) => setContent({ ...content, work: { ...content.work, intro } })} />
              <Field label="Button" value={content.work.cta} onChange={(cta) => setContent({ ...content, work: { ...content.work, cta } })} />
              <Field label="Script line" value={content.work.flourish} onChange={(flourish) => setContent({ ...content, work: { ...content.work, flourish } })} />
              <Field label="More label" value={content.work.moreLabel} onChange={(moreLabel) => setContent({ ...content, work: { ...content.work, moreLabel } })} />
              <Field label="More title" value={content.work.moreTitle} onChange={(moreTitle) => setContent({ ...content, work: { ...content.work, moreTitle } })} />
              <Field label="More body" value={content.work.moreBody} area onChange={(moreBody) => setContent({ ...content, work: { ...content.work, moreBody } })} />
              <Field label="Side labels" value={content.work.rail.join(", ")} onChange={(value) => setContent({ ...content, work: { ...content.work, rail: value.split(",").map((item) => item.trim()).filter(Boolean) } })} />
        <label className="hp-field">
          <span>Case</span>
          <select value={storyIndex} onChange={(event) => setStoryIndex(Number(event.target.value))}>
                  {content.work.stories.map((item, index) => <option key={item.id} value={index}>{item.title}</option>)}
                </select>
              </label>
              <Field label="Title" value={story.title} onChange={(title) => patchStory({ title })} />
              <Field label="Line" value={story.line} onChange={(line) => patchStory({ line })} />
              <Field label="Support" value={story.support} onChange={(support) => patchStory({ support })} />
              <Field label="Tags" value={story.tags.join(", ")} onChange={(value) => patchStory({ tags: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
              <Field label="Challenge" value={story.challenge} area onChange={(challenge) => patchStory({ challenge })} />
              <Field label="Contribution" value={story.contribution} area onChange={(contribution) => patchStory({ contribution })} />
              <Field label="Status" value={story.status} area onChange={(status) => patchStory({ status })} />
        <p className="hp-note">Images are managed on Projects so the same screenshot is not uploaded twice.</p>
      </>
    );
  }

  if (section === "journey") {
    return null;
  }

  if (section === "ventures") {
    return (
            <>
              <Field label="Label" value={content.ventures.label} onChange={(label) => setContent({ ...content, ventures: { ...content.ventures, label } })} />
              <Field label="Title" value={content.ventures.title} onChange={(title) => setContent({ ...content, ventures: { ...content.ventures, title } })} />
              <Field label="Body" value={content.ventures.body} area onChange={(body) => setContent({ ...content, ventures: { ...content.ventures, body } })} />
            </>
    );
  }

  if (section === "principles") {
    return (
            <>
              <Field label="Label" value={content.principles.label} onChange={(label) => setContent({ ...content, principles: { ...content.principles, label } })} />
              <Field label="Title" value={content.principles.title} onChange={(title) => setContent({ ...content, principles: { ...content.principles, title } })} />
              {content.principles.items.map((item, index) => (
          <div key={item.n} className="hp-mini-card">
                  <Field label={item.n} value={item.title} onChange={(title) => {
              const items = content.principles.items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, title } : entry));
                    setContent({ ...content, principles: { ...content.principles, items } });
                  }} />
                  <Field label="Body" value={item.body} onChange={(body) => {
              const items = content.principles.items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, body } : entry));
                    setContent({ ...content, principles: { ...content.principles, items } });
                  }} />
                </div>
              ))}
            </>
    );
  }

  if (section === "speaking") {
    return (
            <>
              <Field label="Label" value={content.speaking.label} onChange={(label) => setContent({ ...content, speaking: { ...content.speaking, label } })} />
              <Field label="Title" value={content.speaking.title} onChange={(title) => setContent({ ...content, speaking: { ...content.speaking, title } })} />
              <Field label="Body" value={content.speaking.body} area onChange={(body) => setContent({ ...content, speaking: { ...content.speaking, body } })} />
              <Field label="Button" value={content.speaking.cta} onChange={(cta) => setContent({ ...content, speaking: { ...content.speaking, cta } })} />
        <button type="button" className="btn btn-outline btn-sm" onClick={onMedia}><RiImageAddLine size={15} /> Change image</button>
      </>
    );
  }

  if (section === "booking") {
    return (
            <>
              <Field label="Label" value={content.booking.label} onChange={(label) => setContent({ ...content, booking: { ...content.booking, label } })} />
              <Field label="Title" value={content.booking.title} onChange={(title) => setContent({ ...content, booking: { ...content.booking, title } })} />
              <Field label="Body" value={content.booking.body} area onChange={(body) => setContent({ ...content, booking: { ...content.booking, body } })} />
              {content.booking.items.map((item, index) => (
          <div key={index} className="hp-mini-card">
                  <Field label="Title" value={item.title} onChange={(title) => {
              const items = content.booking.items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, title } : entry));
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                  <Field label="Time" value={item.time} onChange={(time) => {
              const items = content.booking.items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, time } : entry));
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                  <Field label="Body" value={item.body} onChange={(body) => {
              const items = content.booking.items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, body } : entry));
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                </div>
              ))}
        <p className="hp-note">The calendar address stays in Site Settings → Public contact.</p>
      </>
    );
  }

  return (
            <>
              <Field label="Title" value={content.closing.title} onChange={(title) => setContent({ ...content, closing: { ...content.closing, title } })} />
              <Field label="Roles" value={content.closing.roles} onChange={(roles) => setContent({ ...content, closing: { ...content.closing, roles } })} />
      <p className="hp-note">Name, location, and email follow Site Settings → Identity and Public contact.</p>
    </>
  );
}

function PreviewBlock({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <div className="hp-simple-preview">
      <p className="section-label">{label}</p>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

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
        <textarea value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}
