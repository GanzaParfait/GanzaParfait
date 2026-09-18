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
  referrer?: string | null;
  country_name: string | null;
  country_flag: string | null;
  city?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

type RangePreset = "7d" | "14d" | "30d" | "90d" | "1y" | "custom";

function inferBrowser(userAgent?: string | null): string {
  const ua = (userAgent || "").toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("opera") || ua.includes("opr/")) return "Opera";
  return "Browser";
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

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setUTCHours(23, 59, 59, 999);
  return next;
}

function daysBetween(from: Date, to: Date): number {
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1);
}

function parseRange(request: NextRequest): {
  preset: RangePreset;
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
} {
  const params = request.nextUrl.searchParams;
  const now = new Date();
  const toParam = params.get("to");
  const fromParam = params.get("from");
  const range = (params.get("range") || "14d").toLowerCase();

  let to = toParam ? endOfDay(new Date(toParam)) : endOfDay(now);
  if (Number.isNaN(to.getTime())) to = endOfDay(now);

  let from: Date;
  let preset: RangePreset = "14d";

  if (fromParam) {
    from = startOfDay(new Date(fromParam));
    preset = "custom";
    if (Number.isNaN(from.getTime())) {
      from = startOfDay(new Date(to.getTime() - 13 * 86_400_000));
      preset = "14d";
    }
  } else {
    const map: Record<string, number> = { "7d": 6, "14d": 13, "30d": 29, "90d": 89, "1y": 364 };
    const offset = map[range] ?? 13;
    preset = (map[range] != null ? range : "14d") as RangePreset;
    from = startOfDay(new Date(to.getTime() - offset * 86_400_000));
  }

  if (from > to) {
    const swap = from;
    from = startOfDay(to);
    to = endOfDay(swap);
  }

  const span = daysBetween(from, to);
  const previousTo = endOfDay(new Date(from.getTime() - 86_400_000));
  const previousFrom = startOfDay(new Date(previousTo.getTime() - (span - 1) * 86_400_000));

  return { preset, from, to, previousFrom, previousTo };
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDayLabel(key: string): string {
  const date = new Date(`${key}T12:00:00.000Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function buildSeries(
  rows: PageViewRow[],
  from: Date,
  to: Date
): { date: string; label: string; sessions: number; visitors: number; pageviews: number }[] {
  const days = daysBetween(from, to);
  const buckets = new Map<string, { sessions: Set<string>; visitors: Set<string>; pageviews: number }>();

  for (let i = 0; i < days; i += 1) {
    const key = new Date(from.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(key, { sessions: new Set(), visitors: new Set(), pageviews: 0 });
  }

  for (const row of rows) {
    const key = dayKey(row.created_at);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.pageviews += 1;
    bucket.sessions.add(getSessionKey(row));
    bucket.visitors.add(getVisitorKey(row));
  }

  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    label: formatDayLabel(date),
    sessions: value.sessions.size,
    visitors: value.visitors.size,
    pageviews: value.pageviews,
  }));
}

function isAuthorized(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

function emptyMetrics(rangeMeta: AnalyticsMetrics["range"]): AnalyticsMetrics {
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
    series: [],
    previousSeries: [],
    sparklines: {
      sessions: [],
      visitors: [],
      pageviews: [],
      duration: [],
    },
    range: rangeMeta,
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

  const { preset, from, to, previousFrom, previousTo } = parseRange(request);
  const rangeMeta: AnalyticsMetrics["range"] = {
    preset,
    from: from.toISOString(),
    to: to.toISOString(),
    label: `${formatDayLabel(from.toISOString().slice(0, 10))} – ${formatDayLabel(to.toISOString().slice(0, 10))}`,
  };

  const supabase = createServerSupabase(true);
  const fetchFrom = previousFrom.toISOString();

  let rows: PageViewRow[] | null = null;
  let error: { message: string } | null = null;

  const geoQuery = await supabase
    .from("page_views")
    .select(
      "id, page_path, referrer, country_name, country_flag, city, region, latitude, longitude, device, device_type, ip_address, visitor_id, session_id, user_agent, utm_source, utm_medium, utm_campaign, utm_term, utm_content, created_at"
    )
    .gte("created_at", fetchFrom)
    .lte("created_at", to.toISOString())
    .order("created_at", { ascending: false })
    .limit(8000);

  if (geoQuery.error && /column|schema cache/i.test(geoQuery.error.message)) {
    const extendedQuery = await supabase
      .from("page_views")
      .select(
        "id, page_path, country_name, country_flag, device, device_type, ip_address, visitor_id, session_id, user_agent, utm_source, utm_medium, utm_campaign, utm_term, utm_content, created_at"
      )
      .gte("created_at", fetchFrom)
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: false })
      .limit(8000);

    if (extendedQuery.error && /column|schema cache/i.test(extendedQuery.error.message)) {
      const basicQuery = await supabase
        .from("page_views")
        .select("id, page_path, country_name, country_flag, device, ip_address, created_at")
        .gte("created_at", fetchFrom)
        .lte("created_at", to.toISOString())
        .order("created_at", { ascending: false })
        .limit(8000);
      rows = basicQuery.data as PageViewRow[] | null;
      error = basicQuery.error;
    } else {
      rows = extendedQuery.data as PageViewRow[] | null;
      error = extendedQuery.error;
    }
  } else {
    rows = geoQuery.data as PageViewRow[] | null;
    error = geoQuery.error;
  }

  if (error) {
    console.error("Analytics metrics query failed:", error.message);
    return NextResponse.json(
      {
        ...emptyMetrics(rangeMeta),
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

  const allFetched = (rows || []) as PageViewRow[];
  const currentRows = allFetched.filter((row) => row.created_at >= from.toISOString() && row.created_at <= to.toISOString());
  const previousRows = allFetched.filter(
    (row) => row.created_at >= previousFrom.toISOString() && row.created_at <= previousTo.toISOString()
  );

  if (currentRows.length === 0) {
    return NextResponse.json({
      ...emptyMetrics(rangeMeta),
      telemetryActive: true,
      series: buildSeries([], from, to),
      previousSeries: buildSeries([], previousFrom, previousTo),
    });
  }

  const uniqueVisitors = new Set(currentRows.map(getVisitorKey)).size;
  const uniqueSessions = new Set(currentRows.map(getSessionKey)).size;
  const totalPageviews = currentRows.length;

  const sessionMap = new Map<string, { count: number; first: number; last: number }>();
  for (const row of currentRows) {
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
      ? sessionStats.reduce((sum, session) => sum + (session.last - session.first) / 1000, 0) / sessionStats.length
      : 0;

  const prevSessionMap = new Map<string, { count: number; first: number; last: number }>();
  for (const row of previousRows) {
    const sessionKey = getSessionKey(row);
    const ts = new Date(row.created_at).getTime();
    const current = prevSessionMap.get(sessionKey);
    if (!current) {
      prevSessionMap.set(sessionKey, { count: 1, first: ts, last: ts });
    } else {
      current.count += 1;
      current.first = Math.min(current.first, ts);
      current.last = Math.max(current.last, ts);
    }
  }
  const prevSessionStats = Array.from(prevSessionMap.values());
  const prevAvgDuration =
    prevSessionStats.length > 0
      ? prevSessionStats.reduce((sum, session) => sum + (session.last - session.first) / 1000, 0) / prevSessionStats.length
      : 0;

  const countryCounts = new Map<string, { count: number; flag: string }>();
  for (const row of currentRows) {
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
  const sessionDevices = new Map<string, "Mobile" | "Desktop" | "Tablet">();
  for (const row of currentRows) {
    const key = getSessionKey(row);
    if (sessionDevices.has(key)) continue;
    sessionDevices.set(key, (row.device_type || inferDeviceType(row.device, row.user_agent)) as keyof typeof deviceCounts);
  }
  for (const type of sessionDevices.values()) deviceCounts[type] += 1;
  const deviceTotal = Math.max(sessionDevices.size, 1);

  const deviceBreakdown = (Object.entries(deviceCounts) as [keyof typeof deviceCounts, number][])
    .filter(([, count]) => count > 0)
    .map(([device, count]) => ({
      device,
      icon: device.toLowerCase(),
      percentage: Math.round((count / deviceTotal) * 100),
      count,
    }));

  const pageCounts = new Map<string, number>();
  for (const row of currentRows) {
    pageCounts.set(row.page_path, (pageCounts.get(row.page_path) || 0) + 1);
  }

  const pageBreakdown = Array.from(pageCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, views]) => ({
      path,
      name: pagePathToName(path),
      views,
      percentage: Math.round((views / totalPageviews) * 100),
    }));

  const previousSessions = prevSessionMap.size;
  const previousUnique = new Set(previousRows.map(getVisitorKey)).size;

  const sessionGroups = new Map<string, PageViewRow[]>();
  for (const row of currentRows) {
    const key = getSessionKey(row);
    const group = sessionGroups.get(key) || [];
    group.push(row);
    sessionGroups.set(key, group);
  }

  const recentSessions = Array.from(sessionGroups.entries())
    .map(([sessionKey, groupRows]) => {
      const sorted = [...groupRows].sort(
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
        city: first.city || undefined,
        region: first.region || undefined,
        latitude: first.latitude ?? null,
        longitude: first.longitude ?? null,
        device: first.device_type || first.device || "Unknown",
        browser: inferBrowser(first.user_agent),
        ip: displayIp(first.ip_address),
        pageCount: sorted.length,
        duration: formatDuration(durationSeconds),
        utmSource: first.utm_source || undefined,
        utmCampaign: first.utm_campaign || undefined,
        pages: sorted.map((row, index) => {
          const prev = index > 0 ? sorted[index - 1] : null;
          const arrivedFrom = prev?.page_path || null;
          const arrivedFromName = prev ? pagePathToName(prev.page_path) : null;
          const isLanding = index === 0;
          const name = pagePathToName(row.page_path);
          let summary = isLanding ? `Landed on ${name}` : `Moved from ${arrivedFromName} to ${name}`;
          if (prev && prev.page_path === row.page_path) {
            summary = `Viewed ${name} again`;
          }
          return {
            path: row.page_path,
            name,
            time: formatRelativeTime(row.created_at),
            at: row.created_at,
            arrivedFrom,
            arrivedFromName,
            isLanding,
            summary,
          };
        }),
      };
    })
    .sort((a, b) => b.lastSeen - a.lastSeen)
    .slice(0, 8)
    .map(({ lastSeen: _lastSeen, ...session }) => session);

  const sourceCounts = new Map<string, { source: string; medium: string; campaign: string; visits: number }>();
  let directVisits = 0;
  for (const row of currentRows) {
    if (!row.utm_source) {
      directVisits += 1;
      continue;
    }
    const key = `${row.utm_source}|${row.utm_medium || "—"}|${row.utm_campaign || "—"}`;
    const existing = sourceCounts.get(key) || {
      source: row.utm_source,
      medium: row.utm_medium || "—",
      campaign: row.utm_campaign || "—",
      visits: 0,
    };
    existing.visits += 1;
    sourceCounts.set(key, existing);
  }

  const utmBreakdown = Array.from(sourceCounts.values())
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)
    .map((entry) => ({
      ...entry,
      percentage: Math.round((entry.visits / totalPageviews) * 100),
    }));

  if (directVisits > 0) {
    utmBreakdown.unshift({
      source: "Direct",
      medium: "none",
      campaign: "—",
      visits: directVisits,
      percentage: Math.round((directVisits / totalPageviews) * 100),
    });
    utmBreakdown.sort((a, b) => b.visits - a.visits);
    if (utmBreakdown.length > 6) utmBreakdown.length = 6;
  }

  const series = buildSeries(currentRows, from, to);
  const previousSeries = buildSeries(previousRows, previousFrom, previousTo);

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
    series,
    previousSeries,
    sparklines: {
      sessions: series.map((point) => point.sessions),
      visitors: series.map((point) => point.visitors),
      pageviews: series.map((point) => point.pageviews),
      duration: series.map((point) => Math.round((point.sessions ? avgDurationSeconds : 0) / 60)),
    },
    range: rangeMeta,
    telemetryActive: true,
    changes: {
      totalVisitors: formatPercentChange(uniqueSessions, previousSessions),
      uniqueVisitors: formatPercentChange(uniqueVisitors, previousUnique),
      totalPageviews: formatPercentChange(currentRows.length, previousRows.length),
      engagement: formatPercentChange(avgDurationSeconds, prevAvgDuration),
    },
  };

  return NextResponse.json(metrics);
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasServiceRoleKey()) {
    return NextResponse.json({ error: "Analytics service is not configured." }, { status: 503 });
  }

  const supabase = createServerSupabase(true);
  const { error, count } = await supabase
    .from("page_views")
    .delete({ count: "exact" })
    .gte("created_at", "1970-01-01T00:00:00.000Z");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
