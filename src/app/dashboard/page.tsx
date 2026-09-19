"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiGroupLine,
  RiUser3Line,
  RiEyeLine,
  RiTimeLine,
  RiGlobalLine,
  RiRefreshLine,
  RiArrowRightSLine,
  RiCalendarLine,
  RiFolderLine,
  RiToolsLine,
  RiBriefcaseLine,
  RiArticleLine,
  RiSmartphoneLine,
  RiComputerLine,
  RiTabletLine,
  RiChromeLine,
  RiSafariLine,
  RiFirefoxLine,
  RiEdgeLine,
  RiMore2Fill,
  RiArrowRightLine,
  RiMicLine,
  RiDownloadLine,
  RiDeleteBin6Line,
  RiCloseLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import type { AnalyticsMetrics } from "@/lib/supabase";
import { projects, services, experience, speakingEngagements, blogPosts, education } from "@/data/site-data";
import { DonutChart, LineChart, Sparkline } from "@/components/dashboard/Charts";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import "./analytics.css";

type RangePreset = "7d" | "14d" | "30d" | "90d" | "1y";

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "14d", label: "14D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "1y", label: "1Y" },
];

const EMPTY_ANALYTICS: AnalyticsMetrics = {
  totalVisitors: 0,
  uniqueVisitors: 0,
  totalPageviews: 0,
  avgDuration: "0s",
  bounceRate: "0%",
  countryBreakdown: [],
  pageBreakdown: [],
  deviceBreakdown: [],
  recentSessions: [],
  utmBreakdown: [],
  series: [],
  previousSeries: [],
  sparklines: { sessions: [], visitors: [], pageviews: [], duration: [] },
  range: { preset: "14d", from: "", to: "", label: "" },
  telemetryActive: false,
  changes: {
    totalVisitors: "Loading...",
    uniqueVisitors: "Loading...",
    totalPageviews: "Loading...",
    engagement: "Loading...",
  },
};

const STAT_CARDS = [
  { key: "totalVisitors", label: "Total Sessions", icon: RiGroupLine, color: "#0e52a8", spark: "sessions" as const },
  { key: "uniqueVisitors", label: "Unique Visitors", icon: RiUser3Line, color: "#6366f1", spark: "visitors" as const },
  { key: "totalPageviews", label: "Pageviews", icon: RiEyeLine, color: "#0891b2", spark: "pageviews" as const },
  { key: "avgDuration", label: "Avg. Session Duration", icon: RiTimeLine, color: "#16a34a", spark: "duration" as const },
] as const;

function toInputDate(iso: string) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function changeTone(text: string): "up" | "down" | "flat" {
  if (text.startsWith("+")) return "up";
  if (text.startsWith("-")) return "down";
  return "flat";
}

function DeviceIcon({ device }: { device: string }) {
  const value = device.toLowerCase();
  if (value.includes("mobile")) return <RiSmartphoneLine size={15} />;
  if (value.includes("tablet")) return <RiTabletLine size={15} />;
  return <RiComputerLine size={15} />;
}

function BrowserIcon({ browser }: { browser?: string }) {
  const value = (browser || "").toLowerCase();
  if (value.includes("safari")) return <RiSafariLine size={15} />;
  if (value.includes("firefox")) return <RiFirefoxLine size={15} />;
  if (value.includes("edge")) return <RiEdgeLine size={15} />;
  return <RiChromeLine size={15} />;
}

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [openPathIndex, setOpenPathIndex] = useState<number | null>(0);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<"reset" | "export" | null>(null);
  const [preset, setPreset] = useState<RangePreset>("14d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [rangeSheetOpen, setRangeSheetOpen] = useState(false);
  const [draftPreset, setDraftPreset] = useState<RangePreset>("14d");
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const [draftUseCustom, setDraftUseCustom] = useState(false);

  const query = useMemo(() => {
    if (useCustom && customFrom && customTo) return `from=${customFrom}&to=${customTo}`;
    return `range=${preset}`;
  }, [useCustom, customFrom, customTo, preset]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/metrics?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = (await res.json()) as AnalyticsMetrics;
      setAnalytics(data);
      if (!useCustom && data.range?.from && data.range?.to) {
        setCustomFrom(toInputDate(data.range.from));
        setCustomTo(toInputDate(data.range.to));
      }
    } catch {
      setAnalytics({
        ...EMPTY_ANALYTICS,
        telemetryActive: false,
        error: "Could not load analytics data.",
        changes: {
          totalVisitors: "Unavailable",
          uniqueVisitors: "Unavailable",
          totalPageviews: "Unavailable",
          engagement: "Unavailable",
        },
      });
    } finally {
      setLoading(false);
    }
  }, [query, useCustom]);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 60000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const applyPreset = (next: RangePreset) => {
    setPreset(next);
    setUseCustom(false);
  };

  const openSessionDrawer = (sessionId: string) => {
    setExpandedSession(sessionId);
    setOpenPathIndex(0);
  };

  const closeSessionDrawer = () => {
    setExpandedSession(null);
    setOpenPathIndex(null);
  };

  const selectedSession = useMemo(
    () => analytics.recentSessions.find((session) => session.id === expandedSession) || null,
    [analytics.recentSessions, expandedSession]
  );

  useHistoryBackClose(resetConfirmOpen, () => setResetConfirmOpen(false));
  useHistoryBackClose(rangeSheetOpen, () => setRangeSheetOpen(false));
  useHistoryBackClose(Boolean(selectedSession), closeSessionDrawer);

  const exportCsv = async () => {
    setBusyAction("export");
    try {
      const res = await fetch(`/api/analytics/export?${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `prince-parfait-ganza-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setAnalytics((prev) => ({ ...prev, error: "Could not export analytics CSV." }));
    } finally {
      setBusyAction(null);
    }
  };

  const resetMetrics = async () => {
    setBusyAction("reset");
    try {
      const res = await fetch("/api/analytics/metrics", { method: "DELETE" });
      if (!res.ok) throw new Error("Reset failed");
      setResetConfirmOpen(false);
      closeSessionDrawer();
      await loadAnalytics();
    } catch {
      setAnalytics((prev) => ({ ...prev, error: "Could not reset analytics metrics." }));
    } finally {
      setBusyAction(null);
    }
  };

  const openRangeSheet = () => {
    setDraftPreset(preset);
    setDraftFrom(customFrom);
    setDraftTo(customTo);
    setDraftUseCustom(useCustom);
    setRangeSheetOpen(true);
  };

  const applyRangeSheet = () => {
    if (draftUseCustom) {
      if (!draftFrom || !draftTo) return;
      setCustomFrom(draftFrom);
      setCustomTo(draftTo);
      setUseCustom(true);
    } else {
      setPreset(draftPreset);
      setUseCustom(false);
    }
    setRangeSheetOpen(false);
  };

  const getStatValue = (key: (typeof STAT_CARDS)[number]["key"]) => {
    if (loading) return "...";
    const value = analytics[key];
    return typeof value === "number" ? value.toLocaleString() : value;
  };

  const getStatChange = (key: (typeof STAT_CARDS)[number]["key"]) => {
    if (key === "avgDuration") return analytics.changes.engagement;
    if (key === "totalVisitors") return analytics.changes.totalVisitors;
    if (key === "uniqueVisitors") return analytics.changes.uniqueVisitors;
    return analytics.changes.totalPageviews;
  };

  const contentItems = [
    {
      label: "Projects",
      value: `${projects.length} total`,
      detail: `${projects.filter((item) => item.featured).length} featured`,
      href: "/dashboard/projects",
      Icon: RiFolderLine,
      tone: "green" as const,
      badge: true,
    },
    {
      label: "Services",
      value: `${services.length} offerings`,
      detail: "",
      href: "/services",
      Icon: RiToolsLine,
      tone: "blue" as const,
    },
    {
      label: "Experience",
      value: `${experience.length} records`,
      detail: `${education.length} education`,
      href: "/experience",
      Icon: RiBriefcaseLine,
      tone: "indigo" as const,
    },
    {
      label: "Blog Articles",
      value: blogPosts.length ? `${blogPosts.length} published` : "0 published",
      detail: "",
      href: "/dashboard/blogs",
      Icon: RiArticleLine,
      tone: "slate" as const,
    },
    {
      label: "Speaking",
      value: speakingEngagements.length
        ? `${speakingEngagements.length} record${speakingEngagements.length === 1 ? "" : "s"}`
        : "No records yet",
      detail: "",
      href: "/dashboard/homepage",
      Icon: RiMicLine,
      tone: "cyan" as const,
    },
  ];

  const maxPageViews = Math.max(...analytics.pageBreakdown.map((page) => page.views), 1);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Welcome back, Prince!</h1>
          <p>Here&apos;s what&apos;s happening with your portfolio.</p>
          {analytics.error ? <p className="analytics-error">{analytics.error}</p> : null}
        </div>

        <div className="analytics-header-actions">
          <label className="analytics-date-range analytics-date-range-desktop">
            <RiCalendarLine size={15} />
            <input
              type="date"
              value={customFrom}
              onChange={(event) => {
                setCustomFrom(event.target.value);
                setUseCustom(true);
              }}
              aria-label="From date"
            />
            <span>–</span>
            <input
              type="date"
              value={customTo}
              onChange={(event) => {
                setCustomTo(event.target.value);
                setUseCustom(true);
              }}
              aria-label="To date"
            />
          </label>

          <div className="analytics-presets" role="group" aria-label="Date range presets">
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={!useCustom && preset === item.id ? "is-on" : undefined}
                onClick={() => applyPreset(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button type="button" className="analytics-btn" onClick={loadAnalytics} disabled={loading} title="Refresh">
            <RiRefreshLine size={15} />
            <span className="analytics-btn-label">Refresh</span>
          </button>

          <button
            type="button"
            className="analytics-btn analytics-range-more"
            onClick={openRangeSheet}
            aria-label="Custom date range"
            title="Custom date range"
          >
            <RiMore2Fill size={16} />
          </button>

          <div className="analytics-tools">
            <button type="button" className="analytics-btn" onClick={() => void exportCsv()} disabled={busyAction === "export"}>
              <RiDownloadLine size={15} />
              <span className="analytics-btn-label">{busyAction === "export" ? "Exporting…" : "Export CSV"}</span>
            </button>
            <button type="button" className="analytics-btn" onClick={() => setResetConfirmOpen(true)} disabled={busyAction === "reset"}>
              <RiDeleteBin6Line size={15} />
              <span className="analytics-btn-label">Reset data</span>
            </button>
          </div>
        </div>
      </div>

      {rangeSheetOpen ? (
        <div className="analytics-sheet-layer" role="presentation">
          <button
            type="button"
            className="analytics-sheet-backdrop"
            aria-label="Close date range"
            onClick={() => setRangeSheetOpen(false)}
          />
          <div className="analytics-sheet" role="dialog" aria-modal="true" aria-labelledby="analytics-range-title">
            <div className="analytics-sheet-handle" aria-hidden="true" />
            <h2 id="analytics-range-title">Date range</h2>
            <p>Choose a preset or custom dates, then apply.</p>

            <div className="analytics-sheet-presets" role="group" aria-label="Preset ranges">
              {PRESETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={!draftUseCustom && draftPreset === item.id ? "is-on" : undefined}
                  onClick={() => {
                    setDraftPreset(item.id);
                    setDraftUseCustom(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <label className="analytics-sheet-dates">
              <span>From</span>
              <input
                type="date"
                value={draftFrom}
                onChange={(event) => {
                  setDraftFrom(event.target.value);
                  setDraftUseCustom(true);
                }}
              />
            </label>
            <label className="analytics-sheet-dates">
              <span>To</span>
              <input
                type="date"
                value={draftTo}
                onChange={(event) => {
                  setDraftTo(event.target.value);
                  setDraftUseCustom(true);
                }}
              />
            </label>

            <div className="analytics-sheet-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setRangeSheetOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={applyRangeSheet}
                disabled={draftUseCustom && (!draftFrom || !draftTo)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="analytics-stats">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          const change = getStatChange(stat.key);
          return (
            <div key={stat.key} className="analytics-stat" style={{ ["--stat-accent" as string]: stat.color }}>
              <div className="analytics-stat-top">
                <span className="analytics-stat-label">{stat.label}</span>
                <div className="analytics-stat-icon">
                  <Icon size={18} />
                </div>
              </div>
              <p className="analytics-stat-value">{getStatValue(stat.key)}</p>
              <div className="analytics-stat-foot">
                <p className={`analytics-stat-change is-${changeTone(change)}`}>{change}</p>
                <Sparkline values={analytics.sparklines[stat.spark]} color={stat.color} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Traffic overview</div>
              <p className="analytics-panel-subtitle">Sessions over time · {analytics.range.label || "Selected range"}</p>
            </div>
            <div className={`analytics-status ${analytics.telemetryActive ? "analytics-status--live" : "analytics-status--offline"}`}>
              <span className="analytics-status-dot" />
              {analytics.telemetryActive ? "Live" : "Offline"}
            </div>
          </div>
          {analytics.series.length === 0 ? (
            <div className="analytics-empty">No sessions in this range.</div>
          ) : (
            <LineChart
              current={analytics.series.map((point) => ({ label: point.label, value: point.sessions }))}
              previous={analytics.previousSeries.map((point) => ({ label: point.label, value: point.sessions }))}
            />
          )}
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-title">Device mix</div>
          <p className="analytics-panel-subtitle">Visitors by device type</p>
          {analytics.deviceBreakdown.length === 0 ? (
            <div className="analytics-empty">No device data yet.</div>
          ) : (
            <DonutChart
              items={analytics.deviceBreakdown.map((device, index) => ({
                label: device.device,
                value: device.count ?? device.percentage,
                color: ["#0e52a8", "#6366f1", "#0ea5e9"][index] || "#94a3b8",
              }))}
              centerValue={analytics.totalVisitors}
              centerLabel="Sessions"
            />
          )}
        </section>
      </div>

      <div className="analytics-grid analytics-grid-3">
        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Top pages</div>
              <p className="analytics-panel-subtitle">Most visited routes</p>
            </div>
          </div>
          {analytics.pageBreakdown.length === 0 ? (
            <div className="analytics-empty">No pageviews yet.</div>
          ) : (
            <div className="analytics-rank-list">
              {analytics.pageBreakdown.map((page, index) => (
                <div key={page.path} className="analytics-rank-row">
                  <span className="analytics-rank-index">{index + 1}</span>
                  <div className="analytics-rank-copy">
                    <strong>{page.name}</strong>
                    <span>{page.path}</span>
                  </div>
                  <div className="analytics-rank-meter">
                    <div style={{ width: `${Math.max((page.views / maxPageViews) * 100, 8)}%` }} />
                  </div>
                  <em>{page.views.toLocaleString()}</em>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Traffic sources</div>
              <p className="analytics-panel-subtitle">Where visitors come from</p>
            </div>
          </div>
          {analytics.utmBreakdown.length === 0 ? (
            <div className="analytics-empty">No sources recorded yet.</div>
          ) : (
            <div className="analytics-rank-list">
              {analytics.utmBreakdown.map((entry) => (
                <div key={`${entry.source}-${entry.medium}-${entry.campaign}`} className="analytics-rank-row">
                  <div className="analytics-rank-copy">
                    <strong>{entry.source}</strong>
                    <span>{entry.medium === "none" ? "Direct / none" : `${entry.medium} · ${entry.campaign}`}</span>
                  </div>
                  <div className="analytics-rank-meter">
                    <div style={{ width: `${Math.max(entry.percentage, 8)}%` }} />
                  </div>
                  <em>
                    {entry.visits} <small>({entry.percentage}%)</small>
                  </em>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">
                <RiGlobalLine style={{ color: "#0e52a8" }} />
                Geographic distribution
              </div>
              <p className="analytics-panel-subtitle">Visitors by country</p>
            </div>
          </div>
          {analytics.countryBreakdown.length === 0 ? (
            <div className="analytics-skeleton-list" aria-hidden="true">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="analytics-skeleton-row">
                  <div className="analytics-skeleton-bar is-mid" />
                  <div className="analytics-skeleton-bar is-meter" />
                  <div className="analytics-skeleton-bar is-num" />
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-rank-list">
              {analytics.countryBreakdown.map((country) => (
                <div key={country.country} className="analytics-rank-row">
                  <div className="analytics-rank-copy">
                    <strong>
                      {country.flag} {country.country}
                    </strong>
                  </div>
                  <div className="analytics-rank-meter">
                    <div style={{ width: `${Math.max(country.percentage, 8)}%` }} />
                  </div>
                  <em>
                    {country.count} <small>({country.percentage}%)</small>
                  </em>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="analytics-grid analytics-grid-bottom">
        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Recent visitor sessions</div>
              <p className="analytics-panel-subtitle">Latest traffic in the selected range</p>
            </div>
          </div>

          <div className="analytics-panel-body">
          {analytics.recentSessions.length === 0 ? (
            <div className="analytics-empty">No sessions in this range.</div>
          ) : (
            <>
              <div className="analytics-table-wrap analytics-table-desktop">
                <table className="analytics-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Location</th>
                      <th>Device</th>
                      <th>Browser</th>
                      <th>Pages</th>
                      <th>Duration</th>
                      <th>Last seen</th>
                      <th aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentSessions.map((session, index) => {
                      const isOpen = expandedSession === session.id;
                      const place = [session.city, session.country].filter(Boolean).join(", ") || session.country;
                      return (
                        <tr key={session.id} className={isOpen ? "is-open" : undefined}>
                          <td className="analytics-index">{String(index + 1).padStart(2, "0")}</td>
                          <td>
                            <span className="analytics-loc">
                              <span className="analytics-flag">{session.flag}</span>
                              <span>
                                <strong>{place}</strong>
                                <small>{session.region || "—"}</small>
                              </span>
                            </span>
                          </td>
                          <td>
                            <span className="analytics-chip">
                              <DeviceIcon device={session.device} />
                              {session.device}
                            </span>
                          </td>
                          <td>
                            <span className="analytics-chip">
                              <BrowserIcon browser={session.browser} />
                              {session.browser || "—"}
                            </span>
                          </td>
                          <td>{session.pageCount}</td>
                          <td>{session.duration}</td>
                          <td>{session.time}</td>
                          <td>
                            <button
                              type="button"
                              className="analytics-more"
                              aria-label="Open session details"
                              onClick={() => openSessionDrawer(session.id)}
                            >
                              <RiMore2Fill size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="analytics-session-cards">
                {analytics.recentSessions.map((session, index) => {
                  const isOpen = expandedSession === session.id;
                  const place = [session.city, session.country].filter(Boolean).join(", ") || session.country;
                  return (
                    <article
                      key={`card-${session.id}`}
                      className={isOpen ? "analytics-session-card is-open" : "analytics-session-card"}
                    >
                      <header>
                        <span className="analytics-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="analytics-loc">
                          <span className="analytics-flag">{session.flag}</span>
                          <span>
                            <strong>{place}</strong>
                            <small>{session.time}</small>
                          </span>
                        </span>
                        <button
                          type="button"
                          className="analytics-more"
                          aria-label="Open session details"
                          onClick={() => openSessionDrawer(session.id)}
                        >
                          <RiMore2Fill size={16} />
                        </button>
                      </header>
                      <div className="analytics-session-card-grid">
                        <div>
                          <span>Device</span>
                          <strong>
                            <DeviceIcon device={session.device} /> {session.device}
                          </strong>
                        </div>
                        <div>
                          <span>Browser</span>
                          <strong>
                            <BrowserIcon browser={session.browser} /> {session.browser || "—"}
                          </strong>
                        </div>
                        <div>
                          <span>Pages</span>
                          <strong>{session.pageCount}</strong>
                        </div>
                        <div>
                          <span>Duration</span>
                          <strong>{session.duration}</strong>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
          </div>
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-head">
            <div>
              <div className="analytics-panel-title">Content overview</div>
              <p className="analytics-panel-subtitle">Manage your site content</p>
            </div>
            <Link href="/dashboard/homepage" className="analytics-panel-link">
              Go to Content <RiArrowRightLine size={14} />
            </Link>
          </div>
          <div className="analytics-panel-body">
          <div className="analytics-content-list">
            {contentItems.map((item) => {
              const Icon = item.Icon;
              return (
                <Link key={item.label} href={item.href} className={`analytics-content-row is-${item.tone}`}>
                  <span className="analytics-content-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>
                      {item.label}
                      {"badge" in item && item.badge && item.detail ? <em className="analytics-badge">{item.detail}</em> : null}
                    </strong>
                    <span>{item.value}</span>
                  </div>
                  <RiArrowRightSLine size={18} />
                </Link>
              );
            })}
          </div>
          </div>
        </section>
      </div>

      {selectedSession ? (
        <div className="analytics-session-drawer-layer" role="presentation">
          <button type="button" className="analytics-session-drawer-backdrop" aria-label="Close session details" onClick={closeSessionDrawer} />
          <aside className="analytics-session-drawer" role="dialog" aria-modal="true" aria-label="Session details">
            <div className="analytics-session-drawer-head">
              <div>
                <h3>
                  {selectedSession.flag} {[selectedSession.city, selectedSession.country].filter(Boolean).join(", ") || selectedSession.country}
                </h3>
                <p>
                  {selectedSession.device} · {selectedSession.browser || "Browser"} · {selectedSession.time}
                </p>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={closeSessionDrawer} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </div>
            <div className="analytics-session-drawer-body">
              <div className="analytics-session-facts">
                <div>
                  <span>Pages</span>
                  <strong>{selectedSession.pageCount}</strong>
                </div>
                <div>
                  <span>Duration</span>
                  <strong>{selectedSession.duration}</strong>
                </div>
                <div>
                  <span>IP</span>
                  <strong>{selectedSession.ip}</strong>
                </div>
                <div>
                  <span>Source</span>
                  <strong>{selectedSession.utmSource || "Direct"}</strong>
                </div>
              </div>

              <p style={{ margin: "0 0 0.55rem", fontSize: "0.74rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Path journey
              </p>
              <div className="analytics-path-list">
                {selectedSession.pages.map((page, pageIndex) => {
                  const open = openPathIndex === pageIndex;
                  return (
                    <div key={`${selectedSession.id}-${page.path}-${pageIndex}-${page.at || page.time}`} className="analytics-path-item">
                      <button type="button" onClick={() => setOpenPathIndex(open ? null : pageIndex)} aria-expanded={open}>
                        <div>
                          <strong>{page.summary || page.name}</strong>
                          <span>{page.path}</span>
                        </div>
                        <em>{page.time}</em>
                        <RiArrowDownSLine size={16} style={{ transform: open ? "rotate(180deg)" : undefined, color: "#94a3b8" }} />
                      </button>
                      {open ? (
                        <div className="analytics-path-detail">
                          <div>
                            <strong>Page:</strong> {page.name} ({page.path})
                          </div>
                          <div>
                            <strong>When:</strong> {page.time}
                          </div>
                          {page.isLanding ? (
                            <div>
                              <strong>Entry:</strong> First page in this session
                            </div>
                          ) : (
                            <div>
                              <strong>Arrived from:</strong> {page.arrivedFromName || "Previous page"} ({page.arrivedFrom || "—"})
                            </div>
                          )}
                          {pageIndex < selectedSession.pages.length - 1 ? (
                            <div>
                              <strong>Next:</strong> {selectedSession.pages[pageIndex + 1].name} ({selectedSession.pages[pageIndex + 1].path})
                            </div>
                          ) : (
                            <div>
                              <strong>Exit:</strong> Last recorded page in this session
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {resetConfirmOpen ? (
        <div className="dash-sheet-layer" role="presentation">
          <button type="button" className="dash-sheet-backdrop" aria-label="Cancel reset" onClick={() => setResetConfirmOpen(false)} />
          <div className="dash-sheet" role="dialog" aria-modal="true" aria-labelledby="analytics-reset-title">
            <div className="dash-sheet-handle" aria-hidden="true" />
            <h2 id="analytics-reset-title">Reset all metrics?</h2>
            <p>
              This permanently deletes every recorded page view for Prince Parfait GANZA analytics so you can start from scratch. Export a CSV first if you need a backup.
            </p>
            <div className="dash-sheet-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setResetConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary dash-logout-confirm" onClick={() => void resetMetrics()} disabled={busyAction === "reset"}>
                {busyAction === "reset" ? "Deleting…" : "Delete all"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
