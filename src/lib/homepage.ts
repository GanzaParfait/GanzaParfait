import { projects, siteConfig, speakingEngagements } from "@/data/site-data";
import type { SiteSettings } from "@/lib/supabase";

export type HomePoint = { title: string; body: string; tag?: string };
export type WorkStory = {
  id: string;
  title: string;
  organization: string;
  line: string;
  support: string;
  challenge: string;
  contribution: string;
  status: string;
  href: string;
  tags: string[];
  images: string[];
  role?: string;
  period?: string;
  client?: string;
};

export type HomepageContent = {
  manifesto: {
    label: string;
    title: string;
    body: string;
    image: string;
    points: HomePoint[];
    quote: string;
    attribution: string;
    roles: string;
    script: string;
    rail: string[];
    chip: string;
  };
  work: {
    label: string;
    title: string;
    intro: string;
    cta: string;
    flourish: string;
    moreLabel: string;
    moreTitle: string;
    moreBody: string;
    stories: WorkStory[];
  };
  knowledge: { label: string; title: string; items: HomePoint[] };
  journey: { label: string; title: string; note: string; cta: string };
  ventures: { label: string; title: string; body: string };
  principles: { label: string; title: string; items: { n: string; title: string; body: string }[] };
  speaking: { label: string; title: string; body: string; image: string; cta: string };
  booking: { label: string; title: string; body: string; items: { title: string; time: string; body: string }[] };
  closing: { title: string; roles: string };
};

function project(id: string) {
  return projects.find((item) => item.id === id);
}

function story(id: string, extra: { line: string; support: string; tags: string[]; images: string[]; status?: string; role?: string; period?: string; client?: string }): WorkStory {
  const item = project(id);
  return {
    id,
    title: item?.title || id,
    organization: item?.organization || "",
    line: extra.line,
    support: extra.support,
    challenge: item?.challenge || item?.problem || "",
    contribution: item?.whatIBuilt || item?.myRole || "",
    status: extra.status || item?.outcome || item?.result || "Documented as built. No public metric is claimed.",
    href: `/projects/${id}`,
    tags: extra.tags,
    images: extra.images,
    role: extra.role,
    period: extra.period,
    client: extra.client,
  };
}

const training = speakingEngagements[0];

export const DEFAULT_HOMEPAGE: HomepageContent = {
  manifesto: {
    label: "The work",
    title: "I work where ideas, technology and execution meet.",
    body: "From digital systems and client platforms to products and new ventures, the work is turning a complex need into something useful and dependable.",
    image: "/images/profile/hero-split-portrait.webp",
    points: [
      { title: "Think clearly", body: "Understand the real challenge.", tag: "Define" },
      { title: "Build purposefully", body: "Create technology around actual needs.", tag: "Create" },
      { title: "Deliver reliably", body: "Turn the concept into something people can use.", tag: "Impact" },
    ],
    quote: "Ideas gain value when they are built and used by real people.",
    attribution: "Prince Parfait GANZA",
    roles: "Founder · Entrepreneur · Technologist",
    script: "Build What's Next",
    rail: ["Ideas", "Systems", "Impact"],
    chip: "Technology · People · Real impact",
  },
  work: {
    label: "03 / Selected work",
    title: "Real work. Real impact.",
    intro: "A selection of systems, products and digital solutions I have built or contributed to — solving real problems for organizations, businesses and communities.",
    cta: "View all projects",
    flourish: "Data People Impact",
    moreLabel: "More projects",
    moreTitle: "Explore more of my work.",
    moreBody: "Systems, web applications, data solutions, and ventures — each built to solve a real problem.",
    stories: [
      story("caritas-systems", {
        line: "Organizational reporting, held in one dependable system.",
        support: "A role-based management system for indicators, departmental data, reports and administrative workflows.",
        tags: ["Systems"],
        images: ["/images/projects/caritas-systems.webp"],
        role: "Lead Developer",
        period: "Sep 2025 – Oct 2026",
        client: "Caritas Rwanda",
      }),
      story("askfield", {
        line: "Survey platform for data collection, organization management, and connected workflows.",
        support: "Frontend integration for a survey and data-collection platform.",
        tags: ["Web app"],
        images: ["/images/projects/askfield.webp"],
        status: "Team contribution. No public metric is claimed.",
        role: "Frontend Integrator",
        period: "2024 – 2026",
      }),
      story("stockpro", {
        line: "Inventory and sales management for businesses, with invoices, stock tracking and reporting.",
        support: "Products, stock, invoices, clients, suppliers, and reporting in one system.",
        tags: ["Product"],
        images: ["/images/projects/stockpro.webp"],
        role: "Product Developer",
        period: "2024 – 2026",
      }),
      story("gotallnews", {
        line: "News and media platform with publishing, video, and engagement features.",
        support: "Independent product work across content, video, and accounts.",
        tags: ["Web app"],
        images: ["/images/projects/gotallnews.webp"],
        status: "Independent product work. No traffic or audience metric is claimed.",
        role: "Full-Stack Developer",
        period: "2024 – 2025",
      }),
    ],
  },
  knowledge: {
    label: "Knowledge",
    title: "How ideas become working systems.",
    items: [
      { title: "Strategy & Discovery", body: "Requirements, problem framing, and solution planning before a line of interface is treated as the answer." },
      { title: "Product & Experience", body: "Product thinking, workflows, and interfaces people can actually follow." },
      { title: "Technology & Systems", body: "React, Next.js, PHP, APIs, integrations, and databases already used in the documented work." },
      { title: "Data & Operations", body: "SQL, reporting systems, dashboards, and operational records." },
    ],
  },
  journey: {
    label: "Journey",
    title: "How the work developed.",
    note: "The exact employers and dates live on Experience. This is the public path.",
    cta: "Explore this record",
  },
  ventures: {
    label: "Ventures",
    title: "Building beyond individual projects.",
    body: `Through ${siteConfig.company.name}, organizational challenges and ambitious ideas are turned into digital solutions. This site remains the person. The company lives at lerony.com.`,
  },
  principles: {
    label: "Principles",
    title: "How the work is actually done.",
    items: [
      { n: "01", title: "Understand before building", body: "The strongest solution begins with the right problem." },
      { n: "02", title: "Make complexity useful", body: "Technology matters when people can depend on it." },
      { n: "03", title: "Build for progress", body: "Every product should create a meaningful next step." },
    ],
  },
  speaking: {
    label: "Speaking and training",
    title: "Knowledge becomes more valuable when it moves.",
    body: training
      ? `${training.topic} The engagement is ${training.event}. Exact session dates are not published until they are verified. No conference or keynote is claimed.`
      : "",
    image: "/images/profile/prince-parfait-ganza-kigali-casual.webp",
    cta: "Explore speaking and training",
  },
  booking: {
    label: "A conversation",
    title: "Have an ambitious idea worth discussing?",
    body: "A focused introduction about a product, partnership, venture, or digital challenge.",
    items: [
      { title: "Introductory conversation", time: "20 minutes", body: "An idea, or a first introduction." },
      { title: "Project discovery", time: "30 minutes", body: "Requirements and whether a collaboration fits." },
      { title: "Partnership discussion", time: "45 minutes", body: "Lerony, a venture, or an institutional brief." },
    ],
  },
  closing: {
    title: "The next meaningful product starts with a clear conversation.",
    roles: "Founder · Entrepreneur · Technologist",
  },
};

export function imagesForStory(story: WorkStory, records?: { id: string; image?: string; screenshots?: string[] }[]) {
  const match = records?.find((item) => item.id === story.id) || projects.find((item) => item.id === story.id);
  const fromProject = [
    ...(match?.screenshots || []),
    ...(match?.image ? [match.image] : []),
  ].filter((src, index, list) => src && !src.includes("placeholder") && list.indexOf(src) === index);
  const extras = (story.images || []).filter((src) => src && !fromProject.includes(src));
  return [...fromProject, ...extras];
}

export function homepageFrom(settings: SiteSettings): HomepageContent {
  const saved = settings.homepage;
  if (!saved) return DEFAULT_HOMEPAGE;
  return {
    ...DEFAULT_HOMEPAGE,
    ...saved,
    manifesto: {
      ...DEFAULT_HOMEPAGE.manifesto,
      ...saved.manifesto,
      rail: saved.manifesto?.rail?.length ? saved.manifesto.rail : DEFAULT_HOMEPAGE.manifesto.rail,
      points: (saved.manifesto?.points?.length ? saved.manifesto.points : DEFAULT_HOMEPAGE.manifesto.points).map((point, index) => ({
        ...DEFAULT_HOMEPAGE.manifesto.points[index],
        ...point,
        tag: point.tag || DEFAULT_HOMEPAGE.manifesto.points[index]?.tag,
      })),
    },
    work: {
      ...DEFAULT_HOMEPAGE.work,
      ...saved.work,
      intro: saved.work?.intro || DEFAULT_HOMEPAGE.work.intro,
      cta: saved.work?.cta || DEFAULT_HOMEPAGE.work.cta,
      flourish: saved.work?.flourish || DEFAULT_HOMEPAGE.work.flourish,
      moreLabel: saved.work?.moreLabel || DEFAULT_HOMEPAGE.work.moreLabel,
      moreTitle: saved.work?.moreTitle || DEFAULT_HOMEPAGE.work.moreTitle,
      moreBody: saved.work?.moreBody || DEFAULT_HOMEPAGE.work.moreBody,
      label: !saved.work?.label || saved.work.label === "01 / Selected work" || saved.work.label === "Selected work" ? DEFAULT_HOMEPAGE.work.label : saved.work.label,
      title: !saved.work?.title || saved.work.title === "Evidence, one case at a time." ? DEFAULT_HOMEPAGE.work.title : saved.work.title,
      stories: DEFAULT_HOMEPAGE.work.stories.map((fallback) => {
        const savedStory = saved.work?.stories?.find((item) => item.id === fallback.id);
        const staleLine = new Set([
          "Inventory and sales, without a pile of separate records.",
          "Survey workflows, connected through the interface.",
          "An independent publishing product, still in progress.",
          "A public site, kept apart from the internal systems.",
          "Ticket accounting with a record someone can trace.",
        ]);
        return {
          ...fallback,
          ...savedStory,
          line: !savedStory?.line || staleLine.has(savedStory.line) ? fallback.line : savedStory.line,
          support: savedStory?.support && !savedStory.support.includes(" · ") ? savedStory.support : fallback.support,
          role: savedStory?.role || fallback.role,
          period: savedStory?.period || fallback.period,
          client: savedStory?.client || fallback.client,
          tags: fallback.tags,
          images: savedStory?.images?.length ? savedStory.images : fallback.images,
        };
      }),
    },
    knowledge: { ...DEFAULT_HOMEPAGE.knowledge, ...saved.knowledge, items: saved.knowledge?.items?.length ? saved.knowledge.items : DEFAULT_HOMEPAGE.knowledge.items },
    journey: { ...DEFAULT_HOMEPAGE.journey, ...saved.journey },
    ventures: { ...DEFAULT_HOMEPAGE.ventures, ...saved.ventures },
    principles: { ...DEFAULT_HOMEPAGE.principles, ...saved.principles, items: saved.principles?.items?.length ? saved.principles.items : DEFAULT_HOMEPAGE.principles.items },
    speaking: { ...DEFAULT_HOMEPAGE.speaking, ...saved.speaking },
    booking: { ...DEFAULT_HOMEPAGE.booking, ...saved.booking, items: saved.booking?.items?.length ? saved.booking.items : DEFAULT_HOMEPAGE.booking.items },
    closing: { ...DEFAULT_HOMEPAGE.closing, ...saved.closing },
  };
}
