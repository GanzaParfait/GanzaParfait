import { NextRequest, NextResponse } from "next/server";
import {
  countryCodeToFlag,
  displayIp,
  formatDuration,
  formatPercentChange,
  formatRelativeTime,
  pagePathToName,
} from "@/lib/analytics";
import { createServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";
import type { AnalyticsMetrics } from "@/lib/supabase";

interface PageViewRow {
  id: string;
  page_path: string;
  country_name: string | null;
  country_flag: string | null;
  device: string | null;
  device_type?: string | null;
  ip_address: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  user_agent?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  created_at: string;
}

function inferDeviceType(device: string | null, userAgent?: string | null): "Mobile" | "Desktop" | "Tablet" {
  const source = `${device || ""} ${userAgent || ""}`.toLowerCase();
  if (/tablet|ipad/.test(source)) return "Tablet";
  if (/mobile|iphone|android/.test(source)) return "Mobile";
  return "Desktop";
}

function getVisitorKey(row: PageViewRow): string {
  return row.visitor_id || row.ip_address || row.id;
}

function getSessionKey(row: PageViewRow): string {
  return row.session_id || `${row.ip_address || "unknown"}-${row.created_at.slice(0, 10)}`;
}

function monthStart(offsetMonths = 0): string {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() + offsetMonths);
  return date.toISOString();
}

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

function emptyMetrics(): AnalyticsMetrics {
  return {
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
      totalVisitors: "No data yet",
      uniqueVisitors: "No data yet",
      totalPageviews: "No data yet",
      engagement: "No data yet",
    },
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase(true);
  const thisMonthStart = monthStart(0);
  const lastMonthStart = monthStart(-1);

  let rows: PageViewRow[] | null = null;
  let error: { message: string } | null = null;

  const extendedQuery = await supabase
    .from("page_views")
    .select(
      "id, page_path, country_name, country_flag, device, device_type, ip_address, visitor_id, session_id, user_agent, utm_source, utm_medium, utm_campaign, utm_term, utm_content, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(5000);

  if (extendedQuery.error && /column|schema cache/i.test(extendedQuery.error.message)) {
    const basicQuery = await supabase
      .from("page_views")
      .select("id, page_path, country_name, country_flag, device, ip_address, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);
    rows = basicQuery.data as PageViewRow[] | null;
    error = basicQuery.error;
  } else {
    rows = extendedQuery.data as PageViewRow[] | null;
    error = extendedQuery.error;
  }

  if (error) {
    console.error("Analytics metrics query failed:", error.message);
    return NextResponse.json(
      {
        ...emptyMetrics(),
        telemetryActive: false,
        error: hasServiceRoleKey()
          ? /permission denied|does not exist/i.test(error.message)
            ? "Analytics table not configured. Run supabase_analytics.sql in Supabase."
            : "Failed to load analytics from database."
          : "Set SUPABASE_SERVICE_ROLE_KEY to read analytics securely from the dashboard API.",
      },
      { status: 200 }
    );
  }

  const allRows = (rows || []) as PageViewRow[];
  if (allRows.length === 0) {
    return NextResponse.json({ ...emptyMetrics(), telemetryActive: true });
  }

  const thisMonthRows = allRows.filter((row) => row.created_at >= thisMonthStart);
  const lastMonthRows = allRows.filter(
    (row) => row.created_at >= lastMonthStart && row.created_at < thisMonthStart
  );

  const uniqueVisitors = new Set(allRows.map(getVisitorKey)).size;
  const uniqueSessions = new Set(allRows.map(getSessionKey)).size;
  const totalPageviews = allRows.length;

  const sessionMap = new Map<string, { count: number; first: number; last: number }>();
  for (const row of allRows) {
    const sessionKey = getSessionKey(row);
    const ts = new Date(row.created_at).getTime();
    const current = sessionMap.get(sessionKey);
    if (!current) {
      sessionMap.set(sessionKey, { count: 1, first: ts, last: ts });
    } else {
      current.count += 1;
      current.first = Math.min(current.first, ts);
      current.last = Math.max(current.last, ts);
    }
  }

  const sessionStats = Array.from(sessionMap.values());
  const bounceSessions = sessionStats.filter((session) => session.count === 1).length;
  const bounceRate = sessionStats.length
    ? `${Math.round((bounceSessions / sessionStats.length) * 100)}%`
    : "0%";

  const avgDurationSeconds =
    sessionStats.length > 0
      ? sessionStats.reduce((sum, session) => sum + (session.last - session.first) / 1000, 0) /
        sessionStats.length
      : 0;

  const countryCounts = new Map<string, { count: number; flag: string }>();
  for (const row of allRows) {
    const country = row.country_name || "Unknown";
    const existing = countryCounts.get(country) || {
      count: 0,
      flag: row.country_flag || countryCodeToFlag(null),
    };
    existing.count += 1;
    countryCounts.set(country, existing);
  }

  const sortedCountries = Array.from(countryCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const topCountries = sortedCountries.slice(0, 5);
  const othersCount = sortedCountries.slice(5).reduce((sum, [, value]) => sum + value.count, 0);

  const countryBreakdown = topCountries.map(([country, value]) => ({
    country,
    flag: value.flag,
    count: value.count,
    percentage: Math.round((value.count / totalPageviews) * 100),
  }));

  if (othersCount > 0) {
    countryBreakdown.push({
      country: "Others",
      flag: "🌍",
      count: othersCount,
      percentage: Math.round((othersCount / totalPageviews) * 100),
    });
  }

  const deviceCounts: Record<"Mobile" | "Desktop" | "Tablet", number> = {
    Mobile: 0,
    Desktop: 0,
    Tablet: 0,
  };
  for (const row of allRows) {
    const type = (row.device_type || inferDeviceType(row.device, row.user_agent)) as keyof typeof deviceCounts;
    deviceCounts[type] += 1;
  }

  const deviceBreakdown = (Object.entries(deviceCounts) as [keyof typeof deviceCounts, number][])
    .filter(([, count]) => count > 0)
    .map(([device, count]) => ({
      device,
      icon: device.toLowerCase(),
      percentage: Math.round((count / totalPageviews) * 100),
    }));

  const pageCounts = new Map<string, number>();
  for (const row of allRows) {
    pageCounts.set(row.page_path, (pageCounts.get(row.page_path) || 0) + 1);
  }

  const pageBreakdown = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, views]) => ({
      path,
      name: pagePathToName(path),
      views,
    }));

  const thisMonthSessions = new Set(thisMonthRows.map(getSessionKey)).size;
  const lastMonthSessions = new Set(lastMonthRows.map(getSessionKey)).size;
  const thisMonthUnique = new Set(thisMonthRows.map(getVisitorKey)).size;
  const lastMonthUnique = new Set(lastMonthRows.map(getVisitorKey)).size;

  const sessionGroups = new Map<string, PageViewRow[]>();
  for (const row of allRows) {
    const key = getSessionKey(row);
    const group = sessionGroups.get(key) || [];
    group.push(row);
    sessionGroups.set(key, group);
  }

  const recentSessions = Array.from(sessionGroups.entries())
    .map(([sessionKey, rows]) => {
      const sorted = [...rows].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const durationSeconds =
        (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / 1000;

      return {
        id: sessionKey,
        lastSeen: new Date(last.created_at).getTime(),
        time: formatRelativeTime(last.created_at),
        country: first.country_name || "Unknown",
        flag: first.country_flag || "🌍",
        device: first.device || "Unknown",
        ip: displayIp(first.ip_address),
        pageCount: sorted.length,
        duration: formatDuration(durationSeconds),
        utmSource: first.utm_source || undefined,
        utmCampaign: first.utm_campaign || undefined,
        pages: sorted.map((row) => ({
          path: row.page_path,
          name: pagePathToName(row.page_path),
          time: formatRelativeTime(row.created_at),
        })),
      };
    })
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 12)
    .map(({ lastSeen: _lastSeen, ...session }) => session);

  const utmCounts = new Map<string, { source: string; medium: string; campaign: string; visits: number }>();
  for (const row of allRows) {
    if (!row.utm_source) continue;
    const key = `${row.utm_source}|${row.utm_medium || "—"}|${row.utm_campaign || "—"}`;
    const existing = utmCounts.get(key) || {
      source: row.utm_source,
      medium: row.utm_medium || "—",
      campaign: row.utm_campaign || "—",
      visits: 0,
    };
    existing.visits += 1;
    utmCounts.set(key, existing);
  }

  const utmBreakdown = Array.from(utmCounts.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
    .map((entry) => ({
      ...entry,
      percentage: Math.round((entry.visits / totalPageviews) * 100),
    }));

  const metrics: AnalyticsMetrics = {
    totalVisitors: uniqueSessions,
    uniqueVisitors,
    totalPageviews,
    avgDuration: formatDuration(avgDurationSeconds),
    bounceRate,
    countryBreakdown,
    pageBreakdown,
    deviceBreakdown,
    recentSessions,
    utmBreakdown,
    telemetryActive: true,
    changes: {
      totalVisitors: formatPercentChange(thisMonthSessions, lastMonthSessions),
      uniqueVisitors: formatPercentChange(thisMonthUnique, lastMonthUnique),
      totalPageviews: formatPercentChange(thisMonthRows.length, lastMonthRows.length),
      engagement: `Bounce rate ${bounceRate}`,
    },
  };

  return NextResponse.json(metrics);
}
