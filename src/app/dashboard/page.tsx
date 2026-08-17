"use client";

import { useState } from "react";
import { RiGroupLine, RiUser3Line, RiEyeLine, RiTimeLine, RiGlobalLine } from "react-icons/ri";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import { MOCK_ANALYTICS, AnalyticsMetrics } from "@/lib/supabase";

export default function DashboardOverviewPage() {
  const [analytics] = useState<AnalyticsMetrics>(MOCK_ANALYTICS);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.01em" }}>
            Analytics & Performance Index
          </h1>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
            Real-time visitor telemetry, geographic country capture, and traffic streams.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", padding: "0.375rem 0.875rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }}>
          <span style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Database Telemetry Active
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Site Visitors", value: analytics.totalVisitors.toLocaleString(), icon: RiGroupLine, change: "+14.2% this month", color: "#1d4ed8" },
          { label: "Unique Visitors", value: analytics.uniqueVisitors.toLocaleString(), icon: RiUser3Line, change: "+8.5% new audience", color: "#6366f1" },
          { label: "Total Pageviews", value: analytics.totalPageviews.toLocaleString(), icon: RiEyeLine, change: "+22.4% engagement", color: "#0891b2" },
          { label: "Avg. Session Duration", value: analytics.avgDuration, icon: RiTimeLine, change: "Low bounce rate (34%)", color: "#16a34a" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
                padding: "1.125rem",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.625rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>{s.label}</span>
                <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", background: "#f1f5f9", color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} />
                </div>
              </div>
              <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "0.7rem", color: "#16a34a", marginTop: "0.35rem", fontWeight: 700 }}>{s.change}</p>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.25rem" }} className="grid-cols-1 lg:grid-cols-[1.6fr_1fr]">
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <RiGlobalLine style={{ color: "#1d4ed8" }} /> Geographic Visitor Capture by Country
            </h3>
            <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
              Real-time country telemetry originating web traffic to princeparfait.com
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {analytics.countryBreakdown.map((c) => (
              <div key={c.country}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <span style={{ fontSize: "1rem" }}>{c.flag}</span> {c.country}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                    {c.count.toLocaleString()} visits ({c.percentage}%)
                  </span>
                </div>
                <div style={{ width: "100%", height: "0.375rem", borderRadius: "0.25rem", background: "#f1f5f9", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${c.percentage}%`,
                      height: "100%",
                      borderRadius: "0.25rem",
                      background: c.country === "Rwanda" ? "#1d4ed8" : "linear-gradient(90deg, #6366f1, #0891b2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.1rem" }}>
            Device Distribution
          </h3>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "1rem" }}>
            Traffic split across hardware platforms
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {analytics.deviceBreakdown.map((d) => {
              const DeviceIcon = d.icon === "mobile" ? Smartphone
                : d.icon === "desktop" ? Monitor
                : Tablet;
              const color = d.icon === "mobile" ? "#0e52a8"
                : d.icon === "desktop" ? "#6366f1"
                : "#0ea5e9";
              return (
                <div key={d.device} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0.875rem", borderRadius: "0.375rem", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <DeviceIcon size={16} color={color} strokeWidth={2} />
                    </div>
                    <div>
                      <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a" }}>{d.device}</p>
                      <p style={{ fontSize: "0.65rem", color: "#64748b" }}>Responsive view</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.125rem" }}>
                    <span style={{ fontSize: "1.125rem", fontWeight: 800, color }}>{d.percentage}%</span>
                    <div style={{ width: "4rem", height: "4px", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden" }}>
                      <div style={{ width: `${d.percentage}%`, height: "100%", background: color, borderRadius: "9999px" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "0.375rem", padding: "1.25rem", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.875rem" }}>
          Real-Time Visitor Activity Stream
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <th style={{ padding: "0.625rem 0.875rem" }}>Time</th>
                <th style={{ padding: "0.625rem 0.875rem" }}>Location</th>
                <th style={{ padding: "0.625rem 0.875rem" }}>Page Visited</th>
                <th style={{ padding: "0.625rem 0.875rem" }}>Device / User Agent</th>
                <th style={{ padding: "0.625rem 0.875rem" }}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "0.75rem 0.875rem", color: "#64748b", fontSize: "0.75rem" }}>{log.time}</td>
                  <td style={{ padding: "0.75rem 0.875rem", fontWeight: 700, color: "#0f172a" }}>
                    {log.flag} {log.country}
                  </td>
                  <td style={{ padding: "0.75rem 0.875rem", color: "#1d4ed8", fontWeight: 600 }}>{log.page}</td>
                  <td style={{ padding: "0.75rem 0.875rem", color: "#334155" }}>{log.device}</td>
                  <td style={{ padding: "0.75rem 0.875rem", color: "#64748b", fontFamily: "monospace", fontSize: "0.75rem" }}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
