import { NextRequest, NextResponse } from "next/server";
import { displayIp, pagePathToName } from "@/lib/analytics";
import { createServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

function isAdmin(request: NextRequest) {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(headers: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasServiceRoleKey()) {
    return NextResponse.json({ error: "Analytics service is not configured." }, { status: 503 });
  }

  const params = request.nextUrl.searchParams;
  const fromParam = params.get("from");
  const toParam = params.get("to");
  const now = new Date();
  const to = toParam ? new Date(toParam) : now;
  const from = fromParam
    ? new Date(fromParam)
    : new Date(now.getTime() - 14 * 86_400_000);

  const supabase = createServerSupabase(true);
  const { data, error } = await supabase
    .from("page_views")
    .select(
      "id, page_path, referrer, country_name, country_flag, city, region, latitude, longitude, device, device_type, ip_address, visitor_id, session_id, user_agent, utm_source, utm_medium, utm_campaign, created_at"
    )
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString())
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data || [];
  const generated = new Date().toISOString();
  const owner = "Prince Parfait GANZA";
  const site = "princeparfait.com";

  const pageviewsCsv = toCsv(
    [
      "owner",
      "site",
      "view_id",
      "page_path",
      "page_name",
      "referrer",
      "country",
      "city",
      "region",
      "device",
      "ip",
      "visitor_id",
      "session_id",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "created_at",
    ],
    rows.map((row) => [
      owner,
      site,
      row.id,
      row.page_path,
      pagePathToName(row.page_path),
      row.referrer || "",
      row.country_name || "",
      row.city || "",
      row.region || "",
      row.device_type || row.device || "",
      displayIp(row.ip_address),
      row.visitor_id || "",
      row.session_id || "",
      row.utm_source || "",
      row.utm_medium || "",
      row.utm_campaign || "",
      row.created_at,
    ])
  );

  const pageCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();

  for (const row of rows) {
    pageCounts.set(row.page_path, (pageCounts.get(row.page_path) || 0) + 1);
    const country = row.country_name || "Unknown";
    countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    const device = row.device_type || row.device || "Unknown";
    deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    const source = row.utm_source || "Direct";
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
  }

  const pagesCsv = toCsv(
    ["owner", "site", "page_path", "page_name", "views"],
    Array.from(pageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([path, views]) => [owner, site, path, pagePathToName(path), views])
  );

  const countriesCsv = toCsv(
    ["owner", "site", "country", "views"],
    Array.from(countryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, views]) => [owner, site, country, views])
  );

  const devicesCsv = toCsv(
    ["owner", "site", "device", "views"],
    Array.from(deviceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([device, views]) => [owner, site, device, views])
  );

  const sourcesCsv = toCsv(
    ["owner", "site", "source", "views"],
    Array.from(sourceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([source, views]) => [owner, site, source, views])
  );

  const body = [
    `# Prince Parfait GANZA — Analytics export`,
    `# Site: ${site}`,
    `# Generated: ${generated}`,
    `# Range: ${from.toISOString()} → ${to.toISOString()}`,
    `# Rows: ${rows.length}`,
    ``,
    `## pageviews`,
    pageviewsCsv,
    ``,
    `## pages`,
    pagesCsv,
    ``,
    `## countries`,
    countriesCsv,
    ``,
    `## devices`,
    devicesCsv,
    ``,
    `## sources`,
    sourcesCsv,
    ``,
  ].join("\n");

  const stamp = generated.slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prince-parfait-ganza-analytics-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
