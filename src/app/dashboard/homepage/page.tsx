"use client";

import { useEffect, useState } from "react";
import { RiImageAddLine, RiSaveLine } from "react-icons/ri";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import StoryVisual from "@/components/home/StoryVisual";
import { DEFAULT_HOMEPAGE, homepageFrom, type HomepageContent, type WorkStory } from "@/lib/homepage";
import { getLocalSettings, saveLocalSettings } from "@/lib/supabase";

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8125rem",
  color: "#0f172a",
  outline: "none",
} as const;

type SectionId = "manifesto" | "work" | "knowledge" | "journey" | "ventures" | "principles" | "speaking" | "booking" | "closing";

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

export default function HomepageEditorPage() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE);
  const [section, setSection] = useState<SectionId>("manifesto");
  const [storyIndex, setStoryIndex] = useState(0);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    setContent(homepageFrom(getLocalSettings()));
  }, []);

  const save = () => {
    void runSave(() => {
      saveLocalSettings({ homepage: content });
    }, "Homepage saved.");
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
    <div style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>Control center</p>
          <h1 style={{ margin: "0.15rem 0 0", fontSize: "1.35rem" }}>Homepage</h1>
        </div>
        <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
          <RiSaveLine size={16} /> Save
        </button>
      </div>
      <p style={{ margin: 0, maxWidth: "46rem", color: "#64748b", fontSize: "0.85rem" }}>
        These fields update the public homepage after you save. Do not add visitor counts, revenue, or other numbers that are not already verified.
      </p>
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            style={{
              border: 0,
              borderRadius: "999px",
              padding: "0.4rem 0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              background: section === item.id ? "#0e52a8" : "#e2e8f0",
              color: section === item.id ? "#fff" : "#0f172a",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="homepage-editor" style={{ display: "grid", gridTemplateColumns: "minmax(0, 24rem) minmax(0, 1fr)", gap: "1.25rem", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "0.7rem" }}>
          {section === "manifesto" && (
            <>
              <Field label="Label" value={content.manifesto.label} onChange={(label) => setContent({ ...content, manifesto: { ...content.manifesto, label } })} />
              <Field label="Title" value={content.manifesto.title} onChange={(title) => setContent({ ...content, manifesto: { ...content.manifesto, title } })} />
              <Field label="Body" value={content.manifesto.body} area onChange={(body) => setContent({ ...content, manifesto: { ...content.manifesto, body } })} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}><RiImageAddLine size={15} /> Change portrait</button>
              {content.manifesto.points.map((point, index) => (
                <div key={index} style={{ display: "grid", gap: "0.35rem" }}>
                  <Field label={`Point ${index + 1}`} value={point.title} onChange={(title) => {
                    const points = content.manifesto.points.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item);
                    setContent({ ...content, manifesto: { ...content.manifesto, points } });
                  }} />
                  <Field label="Detail" value={point.body} onChange={(body) => {
                    const points = content.manifesto.points.map((item, itemIndex) => itemIndex === index ? { ...item, body } : item);
                    setContent({ ...content, manifesto: { ...content.manifesto, points } });
                  }} />
                </div>
              ))}
            </>
          )}
          {section === "work" && story && (
            <>
              <Field label="Section label" value={content.work.label} onChange={(label) => setContent({ ...content, work: { ...content.work, label } })} />
              <Field label="Section title" value={content.work.title} onChange={(title) => setContent({ ...content, work: { ...content.work, title } })} />
              <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Case
                <select style={inputStyle} value={storyIndex} onChange={(event) => setStoryIndex(Number(event.target.value))}>
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
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}><RiImageAddLine size={15} /> Add image</button>
              <div style={{ display: "grid", gap: "0.4rem" }}>
                {story.images.map((src, index) => (
                  <div key={`${src}-${index}`} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <img src={src} alt="" style={{ width: "4.5rem", height: "2.8rem", objectFit: "cover", borderRadius: "0.35rem" }} />
                    <span style={{ flex: 1, fontSize: "0.72rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" }}>{src}</span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => patchStory({ images: story.images.filter((_, imageIndex) => imageIndex !== index) })}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          )}
          {section === "knowledge" && (
            <>
              <Field label="Label" value={content.knowledge.label} onChange={(label) => setContent({ ...content, knowledge: { ...content.knowledge, label } })} />
              <Field label="Title" value={content.knowledge.title} onChange={(title) => setContent({ ...content, knowledge: { ...content.knowledge, title } })} />
              {content.knowledge.items.map((item, index) => (
                <div key={index} style={{ display: "grid", gap: "0.35rem" }}>
                  <Field label={`Item ${index + 1}`} value={item.title} onChange={(title) => {
                    const items = content.knowledge.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, title } : entry);
                    setContent({ ...content, knowledge: { ...content.knowledge, items } });
                  }} />
                  <Field label="Body" value={item.body} area onChange={(body) => {
                    const items = content.knowledge.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, body } : entry);
                    setContent({ ...content, knowledge: { ...content.knowledge, items } });
                  }} />
                </div>
              ))}
            </>
          )}
          {section === "journey" && (
            <>
              <Field label="Label" value={content.journey.label} onChange={(label) => setContent({ ...content, journey: { ...content.journey, label } })} />
              <Field label="Title" value={content.journey.title} onChange={(title) => setContent({ ...content, journey: { ...content.journey, title } })} />
              <Field label="Note" value={content.journey.note} area onChange={(note) => setContent({ ...content, journey: { ...content.journey, note } })} />
              <Field label="Button" value={content.journey.cta} onChange={(cta) => setContent({ ...content, journey: { ...content.journey, cta } })} />
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>The dated path itself stays on Experience so a homepage edit cannot invent employers.</p>
            </>
          )}
          {section === "ventures" && (
            <>
              <Field label="Label" value={content.ventures.label} onChange={(label) => setContent({ ...content, ventures: { ...content.ventures, label } })} />
              <Field label="Title" value={content.ventures.title} onChange={(title) => setContent({ ...content, ventures: { ...content.ventures, title } })} />
              <Field label="Body" value={content.ventures.body} area onChange={(body) => setContent({ ...content, ventures: { ...content.ventures, body } })} />
            </>
          )}
          {section === "principles" && (
            <>
              <Field label="Label" value={content.principles.label} onChange={(label) => setContent({ ...content, principles: { ...content.principles, label } })} />
              <Field label="Title" value={content.principles.title} onChange={(title) => setContent({ ...content, principles: { ...content.principles, title } })} />
              {content.principles.items.map((item, index) => (
                <div key={item.n} style={{ display: "grid", gap: "0.35rem" }}>
                  <Field label={item.n} value={item.title} onChange={(title) => {
                    const items = content.principles.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, title } : entry);
                    setContent({ ...content, principles: { ...content.principles, items } });
                  }} />
                  <Field label="Body" value={item.body} onChange={(body) => {
                    const items = content.principles.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, body } : entry);
                    setContent({ ...content, principles: { ...content.principles, items } });
                  }} />
                </div>
              ))}
            </>
          )}
          {section === "speaking" && (
            <>
              <Field label="Label" value={content.speaking.label} onChange={(label) => setContent({ ...content, speaking: { ...content.speaking, label } })} />
              <Field label="Title" value={content.speaking.title} onChange={(title) => setContent({ ...content, speaking: { ...content.speaking, title } })} />
              <Field label="Body" value={content.speaking.body} area onChange={(body) => setContent({ ...content, speaking: { ...content.speaking, body } })} />
              <Field label="Button" value={content.speaking.cta} onChange={(cta) => setContent({ ...content, speaking: { ...content.speaking, cta } })} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setMediaOpen(true)}><RiImageAddLine size={15} /> Change image</button>
            </>
          )}
          {section === "booking" && (
            <>
              <Field label="Label" value={content.booking.label} onChange={(label) => setContent({ ...content, booking: { ...content.booking, label } })} />
              <Field label="Title" value={content.booking.title} onChange={(title) => setContent({ ...content, booking: { ...content.booking, title } })} />
              <Field label="Body" value={content.booking.body} area onChange={(body) => setContent({ ...content, booking: { ...content.booking, body } })} />
              {content.booking.items.map((item, index) => (
                <div key={index} style={{ display: "grid", gap: "0.35rem" }}>
                  <Field label="Title" value={item.title} onChange={(title) => {
                    const items = content.booking.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, title } : entry);
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                  <Field label="Time" value={item.time} onChange={(time) => {
                    const items = content.booking.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, time } : entry);
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                  <Field label="Body" value={item.body} onChange={(body) => {
                    const items = content.booking.items.map((entry, entryIndex) => entryIndex === index ? { ...entry, body } : entry);
                    setContent({ ...content, booking: { ...content.booking, items } });
                  }} />
                </div>
              ))}
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>The calendar address stays in Site Settings → Public contact.</p>
            </>
          )}
          {section === "closing" && (
            <>
              <Field label="Title" value={content.closing.title} onChange={(title) => setContent({ ...content, closing: { ...content.closing, title } })} />
              <Field label="Roles" value={content.closing.roles} onChange={(roles) => setContent({ ...content, closing: { ...content.closing, roles } })} />
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Name, location, and email follow Site Settings → Identity and Public contact.</p>
            </>
          )}
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: "1rem", overflow: "hidden", background: "#fff" }}>
          <p style={{ margin: 0, padding: "0.7rem 1rem", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>Preview</p>
          <div style={{ padding: "1.1rem" }}>
            {section === "manifesto" && (
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.7fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <p style={{ color: "#0e52a8", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{content.manifesto.label}</p>
                  <h2 style={{ margin: "0.3rem 0", fontSize: "1.6rem", lineHeight: 1.1 }}>{content.manifesto.title}</h2>
                  <p style={{ color: "#475569" }}>{content.manifesto.body}</p>
                </div>
                {content.manifesto.image ? <img src={content.manifesto.image} alt="" style={{ width: "100%", maxHeight: "16rem", objectFit: "contain" }} /> : null}
              </div>
            )}
            {section === "work" && story && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
                <div>
                  <h3 style={{ marginTop: 0 }}>{story.title}</h3>
                  <p style={{ fontWeight: 700 }}>{story.line}</p>
                  <p style={{ color: "#64748b" }}>{story.status}</p>
                </div>
                <StoryVisual images={story.images} title={story.title} organization={story.organization} />
              </div>
            )}
            {section !== "manifesto" && section !== "work" && (
              <p style={{ margin: 0, color: "#334155" }}>
                {section === "knowledge" && content.knowledge.title}
                {section === "journey" && content.journey.title}
                {section === "ventures" && content.ventures.title}
                {section === "principles" && content.principles.title}
                {section === "speaking" && content.speaking.title}
                {section === "booking" && content.booking.title}
                {section === "closing" && content.closing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      <MediaManagerModal
        isOpen={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (url.startsWith("blob:")) return;
          if (section === "manifesto") setContent({ ...content, manifesto: { ...content.manifesto, image: url } });
          else if (section === "speaking") setContent({ ...content, speaking: { ...content.speaking, image: url } });
          else if (section === "work" && story && !story.images.includes(url)) patchStory({ images: [...story.images, url] });
          setMediaOpen(false);
        }}
      />
    </div>
  );
}

function Field({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
  return (
    <label style={{ display: "grid", gap: "0.3rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
      {label}
      {area ? (
        <textarea style={{ ...inputStyle, minHeight: "4.5rem" }} value={value} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input style={inputStyle} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
