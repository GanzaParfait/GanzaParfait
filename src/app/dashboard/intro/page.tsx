"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiDraggable,
  RiEyeLine,
  RiSaveLine,
} from "react-icons/ri";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import SiteIntroOverlay from "@/components/intro/SiteIntroOverlay";
import {
  DEFAULT_INTRO_EXPERIENCE,
  introExperienceFrom,
  type IntroExperience,
  type IntroFrequency,
  type IntroGreeting,
  type IntroTransition,
} from "@/lib/intro-experience";
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  getLocalSettings,
  saveLocalSettings,
  type SiteSettings,
} from "@/lib/supabase";

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

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.85rem",
  padding: "1rem 1.1rem",
} as const;

export default function DashboardIntroPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [previewing, setPreviewing] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteSettings();
      if (cancelled) return;
      setSettings(remote || getLocalSettings());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const config = useMemo(() => introExperienceFrom(settings), [settings]);

  const patch = (partial: Partial<IntroExperience>) => {
    setSettings((prev) => ({
      ...prev,
      introExperience: { ...introExperienceFrom(prev), ...partial },
    }));
  };

  const setGreetings = (greetings: IntroGreeting[]) => {
    patch({
      greetings: greetings.map((g, index) => ({ ...g, sortOrder: index })),
    });
  };

  const updateGreeting = (id: string, partial: Partial<IntroGreeting>) => {
    setGreetings(config.greetings.map((g) => (g.id === id ? { ...g, ...partial } : g)));
  };

  const moveGreeting = (from: number, to: number) => {
    if (to < 0 || to >= config.greetings.length || from === to) return;
    const next = [...config.greetings];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setGreetings(next);
  };

  const addGreeting = () => {
    const id = `g-${Date.now()}`;
    setGreetings([
      ...config.greetings,
      {
        id,
        text: "Hello.",
        language: "English",
        locale: "en",
        direction: "auto",
        enabled: true,
        sortOrder: config.greetings.length,
      },
    ]);
  };

  const removeGreeting = (id: string) => {
    if (config.greetings.length <= 1) return;
    setGreetings(config.greetings.filter((g) => g.id !== id));
  };

  const persist = () =>
    void runSave(async () => {
      const next = introExperienceFrom({ ...settings, introExperience: config });
      const updated = await saveLocalSettings({ introExperience: next });
      setSettings(updated);
    }, "Intro experience saved.");

  const resetDefaults = () => {
    patch({
      ...DEFAULT_INTRO_EXPERIENCE,
      greetings: DEFAULT_INTRO_EXPERIENCE.greetings.map((g) => ({ ...g })),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
            Control center
          </p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c", margin: 0 }}>Intro Experience</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "40rem", margin: "0.35rem 0 0" }}>
            Short multilingual greeting overlay on first homepage visit. Homepage loads behind it — this is not a loading screen.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-outline" onClick={() => setPreviewing(true)}>
            <RiEyeLine size={16} /> Preview Intro
          </button>
          <button type="button" className="btn btn-outline" onClick={resetDefaults}>
            Reset defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void persist()} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(16rem, 0.85fr)", gap: "0.85rem", flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "1rem" }}>
          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Status</h2>
            <label className="ann-check" style={{ marginBottom: "0.75rem" }}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => patch({ enabled: e.target.checked })}
              />
              Enabled on homepage
            </label>

            <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", margin: "0 0 0.4rem" }}>Show</p>
            {(
              [
                ["first_visit", "First visit only"],
                ["session", "Once per session"],
                ["every_visit", "Every visit"],
              ] as [IntroFrequency, string][]
            ).map(([value, label]) => (
              <label key={value} style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem" }}>
                <input
                  type="radio"
                  name="intro-freq"
                  checked={config.frequency === value}
                  onChange={() => patch({ frequency: value })}
                />
                {label}
              </label>
            ))}
          </section>

          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Appearance & timing</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Background
                <input
                  type="color"
                  style={{ ...inputStyle, marginTop: "0.35rem", padding: "0.2rem", height: "2.4rem" }}
                  value={config.background}
                  onChange={(e) => patch({ background: e.target.value })}
                />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Text
                <input
                  type="color"
                  style={{ ...inputStyle, marginTop: "0.35rem", padding: "0.2rem", height: "2.4rem" }}
                  value={config.textColor}
                  onChange={(e) => patch({ textColor: e.target.value })}
                />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Total duration (sec)
                <input
                  type="number"
                  min={0.8}
                  max={8}
                  step={0.1}
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={(config.totalDurationMs / 1000).toFixed(1)}
                  onChange={(e) => patch({ totalDurationMs: Math.round(Number(e.target.value) * 1000) })}
                />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Max greetings / visit
                <input
                  type="number"
                  min={1}
                  max={12}
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={config.maxGreetings}
                  onChange={(e) => patch({ maxGreetings: Number(e.target.value) || 1 })}
                />
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                Transition
                <select
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={config.transition}
                  onChange={(e) => patch({ transition: e.target.value as IntroTransition })}
                >
                  <option value="fade_slide">Fade + vertical slide</option>
                  <option value="fade">Fade only</option>
                  <option value="slide">Vertical slide</option>
                </select>
              </label>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#334155", gridColumn: "1 / -1" }}>
                Intro version (bump to re-show for returning visitors)
                <input
                  type="number"
                  min={1}
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={config.version}
                  onChange={(e) => patch({ version: Number(e.target.value) || 1 })}
                />
              </label>
            </div>
          </section>

          <section style={panelStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0 }}>Greetings</h2>
              <button type="button" className="btn btn-outline" onClick={addGreeting} style={{ padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}>
                <RiAddLine size={15} /> Add greeting
              </button>
            </div>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              {config.greetings.map((greeting, index) => (
                <div
                  key={greeting.id}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex === null) return;
                    moveGreeting(dragIndex, index);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto auto minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.55fr) auto auto",
                    gap: "0.4rem",
                    alignItems: "center",
                    padding: "0.55rem",
                    borderRadius: "0.65rem",
                    border: "1px solid #e2e8f0",
                    background: greeting.enabled ? "#fff" : "#f8fafc",
                    opacity: greeting.enabled ? 1 : 0.72,
                  }}
                >
                  <span aria-hidden style={{ color: "#94a3b8", cursor: "grab", display: "grid", placeItems: "center" }}>
                    <RiDraggable size={16} />
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94a3b8", width: "1.4rem" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <input
                    style={inputStyle}
                    value={greeting.text}
                    dir={greeting.direction === "rtl" ? "rtl" : "ltr"}
                    onChange={(e) => updateGreeting(greeting.id, { text: e.target.value })}
                    aria-label="Greeting text"
                  />
                  <input
                    style={inputStyle}
                    value={greeting.language}
                    onChange={(e) => updateGreeting(greeting.id, { language: e.target.value })}
                    aria-label="Language name"
                    placeholder="Language"
                  />
                  <input
                    style={inputStyle}
                    value={greeting.locale}
                    onChange={(e) => updateGreeting(greeting.id, { locale: e.target.value })}
                    aria-label="Locale"
                    placeholder="en"
                  />
                  <label className="ann-check" style={{ margin: 0, whiteSpace: "nowrap" }}>
                    <input
                      type="checkbox"
                      checked={greeting.enabled}
                      onChange={(e) => updateGreeting(greeting.id, { enabled: e.target.checked })}
                    />
                    On
                  </label>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "0.3rem", color: "#b91c1c" }}
                    onClick={() => removeGreeting(greeting.id)}
                    aria-label="Delete greeting"
                    disabled={config.greetings.length <= 1}
                  >
                    <RiDeleteBinLine size={15} />
                  </button>
                  <select
                    style={{ ...inputStyle, gridColumn: "3 / 6" }}
                    value={greeting.direction}
                    onChange={(e) =>
                      updateGreeting(greeting.id, {
                        direction: e.target.value as IntroGreeting["direction"],
                      })
                    }
                  >
                    <option value="auto">Direction: Auto</option>
                    <option value="ltr">Direction: LTR</option>
                    <option value="rtl">Direction: RTL</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside style={{ ...panelStyle, alignSelf: "start" }}>
          <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.55rem" }}>Notes</h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.55 }}>
            <li>Only the homepage shows the intro. Deep links skip it.</li>
            <li>Preview never sets the visitor first-visit flag.</li>
            <li>Arabic and other RTL locales use automatic direction when set to Auto.</li>
            <li>Max greetings caps how many enabled lines play in one visit.</li>
          </ul>
          <div
            style={{
              marginTop: "1rem",
              borderRadius: "0.85rem",
              background: config.background,
              color: config.textColor,
              minHeight: "10rem",
              display: "grid",
              placeItems: "center",
              fontSize: "1.6rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {config.greetings.find((g) => g.enabled)?.text || "Hello."}
          </div>
        </aside>
      </div>

      {previewing ? (
        <SiteIntroOverlay force previewConfig={config} onComplete={() => setPreviewing(false)} />
      ) : null}
    </div>
  );
}
