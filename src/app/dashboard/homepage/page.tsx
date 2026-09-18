"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  RiAddLine,
  RiBarChartBoxLine,
  RiCloseLine,
  RiCompass3Line,
  RiComputerLine,
  RiDatabase2Line,
  RiDeleteBin6Line,
  RiDragMove2Line,
  RiEyeLine,
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
import PrinciplesSection from "@/components/home/PrinciplesSection";
import SpeakingSection from "@/components/home/SpeakingSection";
import BookingSection from "@/components/home/BookingSection";
import {
  DEFAULT_HOMEPAGE,
  homepageFrom,
  type HomepageContent,
  type KnowledgeIcon,
  type KnowledgeItem,
  type PrincipleIcon,
  type WorkStory,
} from "@/lib/homepage";
import { getLocalSettings, saveLocalSettings, fetchRemoteSettings } from "@/lib/supabase";
import CustomSelect from "@/components/ui/CustomSelect";
import { useSectionHash } from "@/hooks/useSectionHash";

type SectionId = "manifesto" | "work" | "knowledge" | "journey" | "principles" | "speaking" | "booking";
type EditorTab = "content" | "style" | "display";
type PreviewDevice = "desktop" | "tablet" | "mobile";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "manifesto", label: "Manifesto" },
  { id: "work", label: "Evidence" },
  { id: "knowledge", label: "Knowledge" },
  { id: "journey", label: "Journey" },
  { id: "principles", label: "Principles" },
  { id: "speaking", label: "Speaking" },
  { id: "booking", label: "Conversation" },
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();
  const selectSection = useSectionHash(SECTIONS, setSection);
  const settings = getLocalSettings();
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const previewWidth = DEVICES.find((item) => item.id === device)?.width || "100%";

  useEffect(() => {
    setContent(homepageFrom(getLocalSettings()));
    void fetchRemoteSettings().then((remote) => {
      if (remote) setContent(homepageFrom(remote));
    });
  }, []);

  useEffect(() => {
    setTab("content");
    setFocusIndex(0);
  }, [section]);

  const save = () => {
    void runSave(async () => {
      await saveLocalSettings({ homepage: content });
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
    <div className={previewOpen ? "hp-board is-preview-open" : "hp-board"}>
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
        <div className="hp-board-actions">
          <div className="hp-section-pills" role="tablist" aria-label="Homepage sections">
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
                              <CustomSelect
                                value={item.icon || meta.value}
                                options={ICON_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
                                onChange={(value) => patchItem(index, { icon: value as KnowledgeIcon })}
                              />
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
              <RiSaveLine size={16} /> {saving ? "Saving…" : "Save Changes"}
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
            <button type="button" className="btn btn-ghost btn-sm hp-preview-close" onClick={() => setPreviewOpen(false)}>
              <RiCloseLine size={16} /> Close
            </button>
          </div>
          <div className="hp-preview-stage">
            <div className="hp-preview-frame" data-device={device} style={{ width: previewWidth, maxWidth: "100%" }}>
              {section === "manifesto" && <ManifestoSection manifesto={content.manifesto} embedded />}
              {section === "work" && <SelectedWork work={content.work} records={settings.projectRecords} embedded />}
              {section === "knowledge" && <KnowledgeSection knowledge={content.knowledge} embedded />}
              {section === "journey" && <JourneySection journey={content.journey} embedded />}
              {section === "principles" && (
                <PrinciplesSection principles={content.principles} attribution="Prince Parfait GANZA" embedded />
              )}
              {section === "speaking" && (
                <SpeakingSection speaking={content.speaking} attribution="Prince Parfait GANZA" embedded />
              )}
              {section === "booking" && <BookingSection booking={content.booking} embedded />}
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
          <CustomSelect
            value={String(storyIndex)}
            options={content.work.stories.map((item, index) => ({ value: String(index), label: item.title }))}
            onChange={(value) => setStoryIndex(Number(value))}
          />
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

  if (section === "principles") {
    return (
      <>
        <Field
          label="Label"
          value={content.principles.label}
          onChange={(label) => setContent({ ...content, principles: { ...content.principles, label } })}
        />
        <Field
          label="Title"
          value={content.principles.title}
          onChange={(title) => setContent({ ...content, principles: { ...content.principles, title } })}
        />
        <Field
          label="Subtitle"
          value={content.principles.subtitle}
          area
          onChange={(subtitle) => setContent({ ...content, principles: { ...content.principles, subtitle } })}
        />
        <Field
          label="Quote"
          value={content.principles.quote}
          area
          onChange={(quote) => setContent({ ...content, principles: { ...content.principles, quote } })}
        />
        <Field
          label="Quote attribution"
          value={content.principles.quoteAttribution}
          onChange={(quoteAttribution) =>
            setContent({ ...content, principles: { ...content.principles, quoteAttribution } })
          }
        />
        <Field
          label="Orbit labels (one per line)"
          value={content.principles.rails.join("\n")}
          area
          onChange={(value) =>
            setContent({
              ...content,
              principles: {
                ...content.principles,
                rails: value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        <Field
          label="Footer note"
          value={content.principles.footNote}
          area
          onChange={(footNote) => setContent({ ...content, principles: { ...content.principles, footNote } })}
        />
        <Field
          label="CTA label"
          value={content.principles.ctaLabel}
          onChange={(ctaLabel) => setContent({ ...content, principles: { ...content.principles, ctaLabel } })}
        />
        <Field
          label="CTA href"
          value={content.principles.ctaHref}
          onChange={(ctaHref) => setContent({ ...content, principles: { ...content.principles, ctaHref } })}
        />
        {content.principles.items.map((item, index) => (
          <div key={item.n} className="hp-mini-card">
            <label className="hp-field">
              <span>Icon</span>
              <CustomSelect
                value={item.icon || "search"}
                onChange={(icon) => {
                  const items = content.principles.items.map((entry, entryIndex) =>
                    entryIndex === index ? { ...entry, icon: icon as PrincipleIcon } : entry,
                  );
                  setContent({ ...content, principles: { ...content.principles, items } });
                }}
                options={[
                  { value: "search", label: "Search" },
                  { value: "cube", label: "Cube" },
                  { value: "trend", label: "Trend" },
                ]}
              />
            </label>
            <Field
              label={item.n}
              value={item.title}
              onChange={(title) => {
                const items = content.principles.items.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, title } : entry,
                );
                setContent({ ...content, principles: { ...content.principles, items } });
              }}
            />
            <Field
              label="Body"
              value={item.body}
              onChange={(body) => {
                const items = content.principles.items.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, body } : entry,
                );
                setContent({ ...content, principles: { ...content.principles, items } });
              }}
            />
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
        <Field
          label="Photo quote"
          value={content.speaking.quote}
          area
          onChange={(quote) => setContent({ ...content, speaking: { ...content.speaking, quote } })}
        />
        <Field
          label="Photo caption"
          value={content.speaking.visualCaption}
          onChange={(visualCaption) => setContent({ ...content, speaking: { ...content.speaking, visualCaption } })}
        />
        <Field label="Brand name" value={content.speaking.brandName} onChange={(brandName) => setContent({ ...content, speaking: { ...content.speaking, brandName } })} />
        <Field label="Brand tagline" value={content.speaking.brandTagline} onChange={(brandTagline) => setContent({ ...content, speaking: { ...content.speaking, brandTagline } })} />
        <Field label="Brand note" value={content.speaking.brandNote} onChange={(brandNote) => setContent({ ...content, speaking: { ...content.speaking, brandNote } })} />
        <Field label="Cover title" value={content.speaking.coverTitle} onChange={(coverTitle) => setContent({ ...content, speaking: { ...content.speaking, coverTitle } })} />
        <Field label="Cover subtitle" value={content.speaking.coverSubtitle} onChange={(coverSubtitle) => setContent({ ...content, speaking: { ...content.speaking, coverSubtitle } })} />
        <Field label="Footer quote" value={content.speaking.footQuote} area onChange={(footQuote) => setContent({ ...content, speaking: { ...content.speaking, footQuote } })} />
        <button type="button" className="btn btn-outline btn-sm" onClick={onMedia}><RiImageAddLine size={15} /> Change image</button>
        {content.speaking.stats.map((stat, index) => (
          <div key={`${stat.label}-${index}`} className="hp-mini-card">
            <Field
              label={`Stat ${index + 1}`}
              value={stat.label}
              onChange={(label) => {
                const stats = content.speaking.stats.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, label } : entry,
                );
                setContent({ ...content, speaking: { ...content.speaking, stats } });
              }}
            />
          </div>
        ))}
        {content.speaking.topics.map((topic, index) => (
          <div key={`${topic.title}-${index}`} className="hp-mini-card">
            <Field
              label={`Topic ${index + 1}`}
              value={topic.title}
              onChange={(title) => {
                const topics = content.speaking.topics.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, title } : entry,
                );
                setContent({ ...content, speaking: { ...content.speaking, topics } });
              }}
            />
            <Field
              label="Body"
              value={topic.body}
              onChange={(body) => {
                const topics = content.speaking.topics.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, body } : entry,
                );
                setContent({ ...content, speaking: { ...content.speaking, topics } });
              }}
            />
          </div>
        ))}
      </>
    );
  }

  if (section === "booking") {
    return (
      <>
        <Field
          label="Label"
          value={content.booking.label}
          onChange={(label) => setContent({ ...content, booking: { ...content.booking, label } })}
        />
        <Field
          label="Title"
          value={content.booking.title}
          onChange={(title) => setContent({ ...content, booking: { ...content.booking, title } })}
        />
        <Field
          label="Body"
          value={content.booking.body}
          area
          onChange={(body) => setContent({ ...content, booking: { ...content.booking, body } })}
        />
        <Field
          label="Primary CTA"
          value={content.booking.primaryCta}
          onChange={(primaryCta) => setContent({ ...content, booking: { ...content.booking, primaryCta } })}
        />
        <Field
          label="Primary href"
          value={content.booking.primaryHref}
          onChange={(primaryHref) => setContent({ ...content, booking: { ...content.booking, primaryHref } })}
        />
        <Field
          label="Email label"
          value={content.booking.emailLabel}
          onChange={(emailLabel) => setContent({ ...content, booking: { ...content.booking, emailLabel } })}
        />
        <Field
          label="WhatsApp label"
          value={content.booking.whatsappLabel}
          onChange={(whatsappLabel) => setContent({ ...content, booking: { ...content.booking, whatsappLabel } })}
        />
        <Field
          label="Orbit labels (one per line)"
          value={content.booking.rails.join("\n")}
          area
          onChange={(value) =>
            setContent({
              ...content,
              booking: {
                ...content.booking,
                rails: value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        {content.booking.items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="hp-mini-card">
            <Field
              label="Title"
              value={item.title}
              onChange={(title) => {
                const items = content.booking.items.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, title } : entry,
                );
                setContent({ ...content, booking: { ...content.booking, items } });
              }}
            />
            <Field
              label="Time"
              value={item.time}
              onChange={(time) => {
                const items = content.booking.items.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, time } : entry,
                );
                setContent({ ...content, booking: { ...content.booking, items } });
              }}
            />
            <Field
              label="Body"
              value={item.body}
              onChange={(body) => {
                const items = content.booking.items.map((entry, entryIndex) =>
                  entryIndex === index ? { ...entry, body } : entry,
                );
                setContent({ ...content, booking: { ...content.booking, items } });
              }}
            />
          </div>
        ))}
        <p className="hp-note">Calendar URL stays in Site Settings → Public contact. CTAs fall back to Contact.</p>
      </>
    );
  }

  return null;
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
