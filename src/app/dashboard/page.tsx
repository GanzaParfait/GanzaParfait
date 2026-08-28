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
import type { AnalyticsMetrics } from "@/lib/supabase";
import { projects, services, experience, speakingEngagements, blogPosts, education } from "@/data/site-data";
import { BarChart, ColumnChart, DonutChart } from "@/components/dashboard/Charts";
import { HERO_LAYOUTS } from "@/lib/hero";
import { useSiteSettings } from "@/hooks/useSiteSettings";
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
  utmBreakdown: [],
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
  const settings = useSiteSettings();

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
          <h1>Dashboard</h1>
          <p>
            Traffic, content inventory, and the live homepage layout in one place.
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
        {[
          { label: "Projects", value: projects.length, detail: `${projects.filter((item) => item.featured).length} featured` },
          { label: "Services", value: services.length, detail: "Public offerings" },
          { label: "Experience", value: experience.length, detail: `${education.length} education records` },
          { label: "Writing", value: blogPosts.length, detail: speakingEngagements.length ? `${speakingEngagements.length} speaking record` : "No public articles yet" },
        ].map((item) => (
          <div key={item.label} className="analytics-stat" style={{ ["--stat-accent" as string]: "#0e52a8" }}>
            <div className="analytics-stat-top">
              <span className="analytics-stat-label">{item.label}</span>
            </div>
            <p className="analytics-stat-value">{item.value}</p>
            <p className="analytics-stat-change">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <div className="analytics-panel-title">Traffic volume</div>
          <p className="analytics-panel-subtitle">Sessions, unique visitors, and pageviews compared on one scale</p>
          <ColumnChart
            items={[
              { label: "Sessions", value: analytics.totalVisitors },
              { label: "Unique", value: analytics.uniqueVisitors },
              { label: "Views", value: analytics.totalPageviews },
            ]}
          />
        </section>
        <section className="analytics-panel">
          <div className="analytics-panel-title">Live homepage layout</div>
          <p className="analytics-panel-subtitle">
            {HERO_LAYOUTS.find((layout) => layout.id === settings.bannerLayout)?.name || "Split Portrait"} is currently active.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, marginTop: "0.75rem" }}>
            {settings.siteTitle} · {settings.location}
          </p>
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.4rem" }}>{settings.bio}</p>
        </section>
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
              <BarChart
                items={analytics.countryBreakdown.map((country) => ({
                  label: `${country.flag} ${country.country}`,
                  value: country.count,
                }))}
              />
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
              <DonutChart
                items={analytics.deviceBreakdown.map((device, index) => ({
                  label: device.device,
                  value: device.percentage,
                  color: ["#0e52a8", "#6366f1", "#0ea5e9"][index] || "#94a3b8",
                }))}
              />
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

      {analytics.utmBreakdown.length > 0 && (
        <section className="analytics-panel">
          <div className="analytics-panel-title">Campaign Attribution (UTM)</div>
          <p className="analytics-panel-subtitle">
            Traffic sources from shared links — utm_source, utm_medium, and utm_campaign
          </p>
          <div style={{ marginTop: "1rem" }}>
            {analytics.utmBreakdown.map((entry) => (
              <div key={`${entry.source}-${entry.medium}-${entry.campaign}`} className="analytics-bar-row">
                <div className="analytics-bar-meta">
                  <strong>
                    {entry.source} / {entry.medium}
                  </strong>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>
                    {entry.visits} visits ({entry.percentage}%)
                  </span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "0.35rem" }}>
                  campaign: {entry.campaign}
                </p>
                <div className="analytics-bar-track">
                  <div className="analytics-bar-fill" style={{ width: `${Math.max(entry.percentage, 4)}%` }} />
                </div>
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
                        {session.utmSource ? ` · via ${session.utmSource}` : ""}
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
