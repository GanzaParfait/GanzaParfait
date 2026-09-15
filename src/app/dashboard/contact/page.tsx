"use client";

import { useEffect, useState } from "react";
import {
  RiAddLine,
  RiComputerLine,
  RiDeleteBin6Line,
  RiImageAddLine,
  RiSaveLine,
  RiSmartphoneLine,
  RiTabletLine,
} from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import ContactForm from "@/app/contact/ContactForm";
import {
  DEFAULT_CONTACT_PAGE,
  contactPageFrom,
  type ContactPageContent,
  type ContactTopicIcon,
} from "@/lib/contact-page";
import { getLocalSettings, saveLocalSettings } from "@/lib/supabase";
import { resolvedSocials, socialIcon } from "@/lib/socials";
import CustomSelect from "@/components/ui/CustomSelect";

type SectionId = "hero" | "cards" | "form" | "media" | "faq";
type PreviewDevice = "desktop" | "tablet" | "mobile";
type MediaTarget = "portrait" | "city";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "hero", label: "Hero" },
  { id: "cards", label: "Cards" },
  { id: "form", label: "Form" },
  { id: "media", label: "Media" },
  { id: "faq", label: "FAQ" },
];

const TOPIC_ICONS: ContactTopicIcon[] = ["chat", "bulb", "handshake", "plane"];

const DEVICES: { id: PreviewDevice; label: string; width: string; Icon: typeof RiComputerLine }[] = [
  { id: "desktop", label: "Desktop · 1440px", width: "100%", Icon: RiComputerLine },
  { id: "tablet", label: "Tablet", width: "820px", Icon: RiTabletLine },
  { id: "mobile", label: "Mobile", width: "390px", Icon: RiSmartphoneLine },
];

export default function ContactEditorPage() {
  const [content, setContent] = useState<ContactPageContent>(DEFAULT_CONTACT_PAGE);
  const [section, setSection] = useState<SectionId>("hero");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget>("portrait");
  const { runSave, saving } = useDashboardFeedback();
  const active = SECTIONS.find((item) => item.id === section) || SECTIONS[0];
  const previewWidth = DEVICES.find((item) => item.id === device)?.width || "100%";
  const availableSocials = resolvedSocials(getLocalSettings()).filter((link) => link.enabled && link.url);
  const followLimit = Math.min(6, Math.max(1, content.cards.followSocialLimit || 4));
  const selectedFollow = content.cards.followSocialIds || [];

  useEffect(() => {
    setContent(contactPageFrom(getLocalSettings()));
  }, []);

  const save = () => {
    void runSave(() => {
      saveLocalSettings({ contactPage: content });
    }, "Contact page saved.");
  };

  const patchHero = (next: Partial<ContactPageContent["hero"]>) => {
    setContent((current) => ({ ...current, hero: { ...current.hero, ...next } }));
  };

  const patchCards = (next: Partial<ContactPageContent["cards"]>) => {
    setContent((current) => ({ ...current, cards: { ...current.cards, ...next } }));
  };

  const patchForm = (next: Partial<ContactPageContent["form"]>) => {
    setContent((current) => ({ ...current, form: { ...current.form, ...next } }));
  };

  const patchMedia = (next: Partial<ContactPageContent["media"]>) => {
    setContent((current) => ({ ...current, media: { ...current.media, ...next } }));
  };

  const patchFaq = (next: Partial<ContactPageContent["faq"]>) => {
    setContent((current) => ({ ...current, faq: { ...current.faq, ...next } }));
  };

  const openMedia = (target: MediaTarget) => {
    setMediaTarget(target);
    setMediaOpen(true);
  };

  return (
    <div className="hp-board">
      <div className="hp-board-top">
        <div>
          <nav className="hp-crumb" aria-label="Breadcrumb">
            <span>Contact</span>
            <span>/</span>
            <strong>{active.label}</strong>
          </nav>
          <h1>Contact page</h1>
          <p>Edit the public contact story section by section. The preview updates as you type.</p>
        </div>
        <div className="hp-section-pills" role="tablist" aria-label="Contact sections">
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
          <div className="hp-editor-body">
            {section === "hero" && (
              <>
                <Field label="Section label" value={content.hero.label} onChange={(label) => patchHero({ label })} />
                <Field label="Title" value={content.hero.title} onChange={(title) => patchHero({ title })} />
                <Field label="Body" value={content.hero.body} area onChange={(body) => patchHero({ body })} />
                <Field label="Script note" value={content.hero.script} onChange={(script) => patchHero({ script })} />
                <Field label="Roles line" value={content.hero.roles} onChange={(roles) => patchHero({ roles })} />
                <div className="hp-list-head">
                  <p>Topics</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchHero({
                        topics: [
                          ...content.hero.topics,
                          { icon: TOPIC_ICONS[content.hero.topics.length % TOPIC_ICONS.length], label: "New topic" },
                        ],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.hero.topics.map((topic, index) => (
                  <div key={`${topic.label}-${index}`} className="hp-mini-card">
                    <Field
                      label="Label"
                      value={topic.label}
                      onChange={(label) => {
                        const topics = content.hero.topics.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, label } : entry,
                        );
                        patchHero({ topics });
                      }}
                    />
                    <label className="hp-field">
                      <span>Icon</span>
                      <CustomSelect
                        value={topic.icon}
                        options={TOPIC_ICONS.map((icon) => ({ value: icon, label: icon }))}
                        onChange={(value) => {
                          const topics = content.hero.topics.map((entry, entryIndex) =>
                            entryIndex === index ? { ...entry, icon: value as ContactTopicIcon } : entry,
                          );
                          patchHero({ topics });
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={content.hero.topics.length <= 1}
                      onClick={() => patchHero({ topics: content.hero.topics.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => openMedia("portrait")}>
                  <RiImageAddLine size={15} /> Change portrait
                </button>
              </>
            )}

            {section === "cards" && (
              <>
                <Field label="Email note" value={content.cards.emailNote} onChange={(emailNote) => patchCards({ emailNote })} />
                <Field label="Phone label" value={content.cards.phoneLabel} onChange={(phoneLabel) => patchCards({ phoneLabel })} />
                <Field label="Phone note" value={content.cards.phoneNote} onChange={(phoneNote) => patchCards({ phoneNote })} />
                <Field
                  label="Location note"
                  value={content.cards.locationNote}
                  onChange={(locationNote) => patchCards({ locationNote })}
                />
                <Field label="Follow note" value={content.cards.followNote} onChange={(followNote) => patchCards({ followNote })} />
                <label className="hp-toggle">
                  <input
                    type="checkbox"
                    checked={content.cards.showPhone}
                    onChange={(event) => patchCards({ showPhone: event.target.checked })}
                  />
                  <span>Show phone / WhatsApp card</span>
                </label>
                <div className="hp-list-head">
                  <p>Follow socials (max {followLimit})</p>
                  <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className={followLimit === num ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                        onClick={() =>
                          patchCards({
                            followSocialLimit: num,
                            followSocialIds: selectedFollow.slice(0, num),
                          })
                        }
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hp-chip-grid" style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {availableSocials.map((link) => {
                    const on = selectedFollow.includes(link.id);
                    const Icon = socialIcon(link.platform);
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className={on ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                        onClick={() => {
                          if (on) {
                            patchCards({ followSocialIds: selectedFollow.filter((id) => id !== link.id) });
                            return;
                          }
                          if (selectedFollow.length >= followLimit) return;
                          patchCards({ followSocialIds: [...selectedFollow, link.id].slice(0, followLimit) });
                        }}
                      >
                        <Icon size={14} /> {link.label}
                      </button>
                    );
                  })}
                </div>
                <p className="hp-note">Pick up to 6 socials from Site Settings. Email, phone, and location use Public contact values.</p>
              </>
            )}

            {section === "form" && (
              <>
                <Field label="Section label" value={content.form.label} onChange={(label) => patchForm({ label })} />
                <Field label="Title" value={content.form.title} onChange={(title) => patchForm({ title })} />
                <Field label="Subtitle" value={content.form.subtitle} area onChange={(subtitle) => patchForm({ subtitle })} />
                <Field
                  label="Privacy note"
                  value={content.form.privacyNote}
                  onChange={(privacyNote) => patchForm({ privacyNote })}
                />
                <Field
                  label="Subjects"
                  value={content.form.subjects.join("\n")}
                  area
                  hint="One subject per line."
                  onChange={(value) =>
                    patchForm({
                      subjects: value
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </>
            )}

            {section === "media" && (
              <>
                <Field
                  label="City caption"
                  value={content.media.cityCaption}
                  onChange={(cityCaption) => patchMedia({ cityCaption })}
                />
                <Field
                  label="City tagline"
                  value={content.media.cityTagline}
                  onChange={(cityTagline) => patchMedia({ cityTagline })}
                />
                <Field label="Maps button label" value={content.media.mapsLabel} onChange={(mapsLabel) => patchMedia({ mapsLabel })} />
                <Field label="Maps URL" value={content.media.mapsUrl} onChange={(mapsUrl) => patchMedia({ mapsUrl })} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => openMedia("city")}>
                  <RiImageAddLine size={15} /> Change city image
                </button>
                {content.media.cityImage ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => patchMedia({ cityImage: "" })}>
                    <RiDeleteBin6Line size={15} /> Clear city image
                  </button>
                ) : null}
              </>
            )}

            {section === "faq" && (
              <>
                <Field label="Section label" value={content.faq.label} onChange={(label) => patchFaq({ label })} />
                <Field label="Title" value={content.faq.title} onChange={(title) => patchFaq({ title })} />
                <div className="hp-list-head">
                  <p>Questions</p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      patchFaq({
                        items: [...content.faq.items, { q: "New question?", a: "Add a clear, verified answer." }],
                      })
                    }
                  >
                    <RiAddLine size={15} /> Add
                  </button>
                </div>
                {content.faq.items.map((item, index) => (
                  <div key={`${item.q}-${index}`} className="hp-mini-card">
                    <Field
                      label="Question"
                      value={item.q}
                      onChange={(q) => {
                        const items = content.faq.items.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, q } : entry,
                        );
                        patchFaq({ items });
                      }}
                    />
                    <Field
                      label="Answer"
                      value={item.a}
                      area
                      onChange={(a) => {
                        const items = content.faq.items.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, a } : entry,
                        );
                        patchFaq({ items });
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={content.faq.items.length <= 1}
                      onClick={() => patchFaq({ items: content.faq.items.filter((_, i) => i !== index) })}
                    >
                      <RiDeleteBin6Line size={15} /> Remove
                    </button>
                  </div>
                ))}
              </>
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
              <ContactForm content={content} embedded />
            </div>
          </div>
        </section>
      </div>

      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (url.startsWith("blob:")) return;
          if (mediaTarget === "portrait") patchHero({ portrait: url });
          else patchMedia({ cityImage: url });
          setMediaOpen(false);
        }}
      />
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
