"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RiGroupLine,
  RiUser3Line,
  RiEyeLine,
  RiTimeLine,
  RiGlobalLine,
  RiRefreshLine,
  RiArrowDownSLine,
} from "react-icons/ri";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import type { AnalyticsMetrics } from "@/lib/supabase";
import "./analytics.css";

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
  telemetryActive: false,
  changes: {
    totalVisitors: "Loading...",
    uniqueVisitors: "Loading...",
    totalPageviews: "Loading...",
    engagement: "Loading...",
  },
};

const STAT_CARDS = [
  { key: "totalVisitors", label: "Total Sessions", icon: RiGroupLine, color: "#0e52a8" },
  { key: "uniqueVisitors", label: "Unique Visitors", icon: RiUser3Line, color: "#6366f1" },
  { key: "totalPageviews", label: "Total Pageviews", icon: RiEyeLine, color: "#0891b2" },
  { key: "avgDuration", label: "Avg. Session Duration", icon: RiTimeLine, color: "#16a34a", isDuration: true },
] as const;

export default function DashboardOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/metrics", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load analytics");
      const data = (await res.json()) as AnalyticsMetrics;
      setAnalytics(data);
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
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

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

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1>Analytics & Performance</h1>
          <p>
            Live visitor intelligence — geo capture, session journeys, device mix, and page performance in one view.
          </p>
          {analytics.error && <p className="analytics-error">{analytics.error}</p>}
        </div>

        <div className="analytics-header-actions">
          <button type="button" className="analytics-btn" onClick={loadAnalytics} disabled={loading}>
            <RiRefreshLine size={15} />
            Refresh
          </button>
          <div className={`analytics-status ${analytics.telemetryActive ? "analytics-status--live" : "analytics-status--offline"}`}>
            <span className="analytics-status-dot" />
            {analytics.telemetryActive ? "Live Telemetry" : "Telemetry Offline"}
          </div>
        </div>
      </div>

      <div className="analytics-stats">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="analytics-stat" style={{ ["--stat-accent" as string]: stat.color }}>
              <div className="analytics-stat-top">
                <span className="analytics-stat-label">{stat.label}</span>
                <div className="analytics-stat-icon">
                  <Icon size={18} />
                </div>
              </div>
              <p className="analytics-stat-value">{getStatValue(stat.key)}</p>
              <p className="analytics-stat-change">{getStatChange(stat.key)}</p>
            </div>
          );
        })}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <div className="analytics-panel-title">
            <RiGlobalLine style={{ color: "#0e52a8" }} />
            Geographic Distribution
          </div>
          <p className="analytics-panel-subtitle">Resolved from CDN edge headers and IP geolocation APIs</p>

          {analytics.countryBreakdown.length === 0 ? (
            <div className="analytics-empty" style={{ marginTop: "1rem" }}>
              No geography recorded yet. Visit the public site to start capturing country-level traffic.
            </div>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {analytics.countryBreakdown.map((country) => (
                <div key={country.country} className="analytics-bar-row">
                  <div className="analytics-bar-meta">
                    <strong>
                      <span>{country.flag}</span> {country.country}
                    </strong>
                    <span style={{ color: "#64748b", fontWeight: 700 }}>
                      {country.count.toLocaleString()} ({country.percentage}%)
                    </span>
                  </div>
                  <div className="analytics-bar-track">
                    <div
                      className="analytics-bar-fill"
                      style={{
                        width: `${country.percentage}%`,
                        background:
                          country.country === "Rwanda"
                            ? "linear-gradient(90deg, #0e52a8, #1a6dd4)"
                            : undefined,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="analytics-panel">
          <div className="analytics-panel-title">Device Mix</div>
          <p className="analytics-panel-subtitle">Hardware categories parsed from user-agent data</p>

          {analytics.deviceBreakdown.length === 0 ? (
            <div className="analytics-empty" style={{ marginTop: "1rem" }}>No device data yet.</div>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {analytics.deviceBreakdown.map((device) => {
                const DeviceIcon =
                  device.icon === "mobile" ? Smartphone : device.icon === "desktop" ? Monitor : Tablet;
                const color =
                  device.icon === "mobile" ? "#0e52a8" : device.icon === "desktop" ? "#6366f1" : "#0ea5e9";

                return (
                  <div key={device.device} className="analytics-device-row">
                    <div className="analytics-device-left">
                      <div
                        className="analytics-device-icon"
                        style={{ background: `${color}14`, color }}
                      >
                        <DeviceIcon size={17} strokeWidth={2.2} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 800, color: "#0b192c" }}>{device.device}</p>
                        <p style={{ fontSize: "0.68rem", color: "#64748b" }}>{device.percentage}% of traffic</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color }}>{device.percentage}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {analytics.pageBreakdown.length > 0 && (
        <section className="analytics-panel">
          <div className="analytics-panel-title">Top Pages</div>
          <p className="analytics-panel-subtitle">Most visited routes ranked by total pageviews</p>
          <div className="analytics-pages-list" style={{ marginTop: "1rem" }}>
            {analytics.pageBreakdown.map((page, index) => (
              <div key={page.path} className="analytics-page-row">
                <div className="analytics-page-rank">{index + 1}</div>
                <div>
                  <div className="analytics-page-name">{page.name}</div>
                  <div className="analytics-page-path">{page.path}</div>
                </div>
                <div className="analytics-page-views">{page.views.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="analytics-panel">
        <div className="analytics-panel-title">Visitor Sessions</div>
        <p className="analytics-panel-subtitle">
          Grouped by session — expand to see the full page journey instead of duplicate rows
        </p>

        {analytics.recentSessions.length === 0 ? (
          <div className="analytics-empty" style={{ marginTop: "1rem" }}>
            No sessions recorded yet. Browse the public site to generate your first tracked journey.
          </div>
        ) : (
          <div className="analytics-sessions" style={{ marginTop: "1rem" }}>
            {analytics.recentSessions.map((session) => {
              const isOpen = expandedSession === session.id;
              return (
                <div key={session.id} className={`analytics-session ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="analytics-session-trigger"
                    onClick={() => setExpandedSession(isOpen ? null : session.id)}
                    aria-expanded={isOpen}
                  >
                    <span style={{ fontSize: "1.25rem" }}>{session.flag}</span>
                    <div className="analytics-session-meta">
                      <span className="analytics-session-title">
                        {session.country} · {session.device}
                      </span>
                      <span className="analytics-session-sub">
                        {session.time} · {session.ip} · {session.duration} on site
                      </span>
                    </div>
                    <div className="analytics-session-badges">
                      <span className="analytics-badge">{session.pageCount} pages</span>
                    </div>
                    <RiArrowDownSLine size={18} className="analytics-session-chevron" />
                  </button>

                  {isOpen && (
                    <div className="analytics-session-details">
                      <div className="analytics-session-pages">
                        {session.pages.map((page, index) => (
                          <div key={`${session.id}-${page.path}-${index}`} className="analytics-session-page">
                            <div>
                              <div className="analytics-session-page-path">{page.path}</div>
                              <div className="analytics-session-page-name">{page.name}</div>
                            </div>
                            <div className="analytics-session-page-time">{page.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
