import { projects, siteConfig, speakingEngagements, timeline } from "@/data/site-data";
import type { SiteSettings } from "@/lib/supabase";

export type HomePoint = { title: string; body: string; tag?: string };
export type KnowledgeIcon = "strategy" | "product" | "technology" | "data";
export type KnowledgeItem = {
  title: string;
  body: string;
  href?: string;
  icon?: KnowledgeIcon;
};
export type KnowledgeStat = { value: string; label: string };
export type JourneyType = "education" | "work" | "leadership" | "milestone";
export type JourneyEntry = {
  id: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  type: JourneyType;
  location?: string;
  summary?: string;
  highlights?: string[];
  website?: string;
  industry?: string;
  team?: string;
  status?: string;
  relatedHref?: string;
  showDetails: boolean;
  detailsBlocked: boolean;
};
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
    rail: string[];
    stories: WorkStory[];
  };
  knowledge: {
    label: string;
    title: string;
    body: string;
    script: string;
    rail: string[];
    items: KnowledgeItem[];
    learnMore: string;
    statement: string;
    statementMark: string;
    stats: KnowledgeStat[];
    quote: string;
    attribution: string;
    display: {
      showScript: boolean;
      showRail: boolean;
      showStatement: boolean;
      showStats: boolean;
      showQuote: boolean;
      showIndex: boolean;
      showGo: boolean;
    };
  };
  journey: {
    label: string;
    title: string;
    note: string;
    cta: string;
    moreTitle: string;
    moreBody: string;
    moreCta: string;
    stats: KnowledgeStat[];
    entries: JourneyEntry[];
    display: {
      showStats: boolean;
      showMoreCard: boolean;
      showFilters: boolean;
      showSort: boolean;
    };
  };
  ventures: { label: string; title: string; body: string };
  principles: { label: string; title: string; items: { n: string; title: string; body: string }[] };
  speaking: { label: string; title: string; body: string; image: string; cta: string };
  booking: { label: string; title: string; body: string; items: { title: string; time: string; body: string }[] };
  closing: { title: string; roles: string };
};

function project(id: string) {
  return projects.find((item) => item.id === id);
}

function story(id: string, extra: { line: string; support: string; tags: string[]; images: string[]; status?: string }): WorkStory {
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
    rail: ["Ideas", "Systems", "Impact"],
    stories: [
      story("caritas-systems", {
        line: "Organizational reporting, held in one dependable system.",
        support: "Organizational digital systems for indicator tracking, reporting, and information management.",
        tags: ["Systems", "Data"],
        images: ["/images/projects/caritas-systems.webp"],
      }),
      story("askfield", {
        line: "Survey workflows, connected through the interface.",
        support: "Frontend development and API integration for a survey and data-collection platform.",
        tags: ["Product", "Data"],
        images: ["/images/projects/askfield.webp"],
        status: "Team contribution. No public metric is claimed.",
      }),
      story("stockpro", {
        line: "Inventory and sales, without a pile of separate records.",
        support: "Inventory and sales management system covering stock, invoicing, clients, suppliers, and reporting.",
        tags: ["Product", "Systems"],
        images: ["/images/projects/stockpro.webp"],
      }),
      story("gotallnews", {
        line: "An independent publishing product, still in progress.",
        support: "Independent digital media product covering publishing, articles, video, accounts, and engagement.",
        tags: ["Product", "Ventures"],
        images: ["/images/projects/gotallnews.webp"],
        status: "Independent product work. No traffic or audience metric is claimed.",
      }),
    ],
  },
  knowledge: {
    label: "Knowledge",
    title: "How ideas become working systems.",
    body: "A practical approach that turns complex problems into useful, scalable and people-centered solutions.",
    script: "From ideas to impact",
    rail: ["People", "Process", "Technology", "Impact"],
    learnMore: "Learn more",
    items: [
      {
        title: "Strategy & Discovery",
        body: "Requirements, problem framing, and solution planning before a line of interface is treated as the answer.",
        href: "/services",
        icon: "strategy",
      },
      {
        title: "Product & Experience",
        body: "Product thinking, workflows, and interfaces people can actually follow.",
        href: "/services",
        icon: "product",
      },
      {
        title: "Technology & Systems",
        body: "React, Next.js, PHP, APIs, integrations, and databases already used in the documented work.",
        href: "/services",
        icon: "technology",
      },
      {
        title: "Data & Operations",
        body: "SQL, reporting systems, dashboards, and operational records.",
        href: "/services",
        icon: "data",
      },
    ],
    statement: "Knowledge matters most when it creates real value.",
    statementMark: "real value",
    stats: [
      { value: "4+", label: "Focus Areas" },
      { value: `${projects.length}+`, label: "Projects Applied" },
      { value: "Real World", label: "Impact" },
      { value: "Continuous", label: "Learning" },
    ],
    quote: "Better systems create brighter opportunities.",
    attribution: "Prince Parfait GANZA",
    display: {
      showScript: false,
      showRail: true,
      showStatement: false,
      showStats: true,
      showQuote: true,
      showIndex: false,
      showGo: false,
    },
  },
  journey: {
    label: "Journey",
    title: "A journey of continuous building.",
    note: "From learning to leading — a timeline of the key places, roles, and milestones that shaped the path.",
    cta: "Open full timeline",
    moreTitle: "Need more details?",
    moreBody: "View the complete record on Experience, including roles, education, and training with verified context.",
    moreCta: "Open full timeline",
    stats: [
      { value: `${timeline.length}+`, label: "Roles" },
      { value: `${new Set(timeline.map((item) => item.organization)).size}`, label: "Organizations" },
      { value: "2021", label: "Started" },
      { value: "Ongoing", label: "Building" },
    ],
    entries: timeline.map((item) => ({
      id: item.id,
      year: item.year,
      title: item.title,
      organization: item.organization,
      description: item.description,
      type: item.type,
      location: item.location,
      summary: item.summary,
      highlights: item.highlights,
      website: item.website,
      industry: item.industry,
      team: item.team,
      status: item.status,
      relatedHref: item.relatedHref || "/experience",
      showDetails: true,
      detailsBlocked: false,
    })),
    display: {
      showStats: true,
      showMoreCard: true,
      showFilters: true,
      showSort: true,
    },
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
      rail: saved.work?.rail?.length ? saved.work.rail : DEFAULT_HOMEPAGE.work.rail,
      label: !saved.work?.label || saved.work.label === "01 / Selected work" || saved.work.label === "Selected work" ? DEFAULT_HOMEPAGE.work.label : saved.work.label,
      title: !saved.work?.title || saved.work.title === "Evidence, one case at a time." ? DEFAULT_HOMEPAGE.work.title : saved.work.title,
      stories: DEFAULT_HOMEPAGE.work.stories.map((fallback) => {
        const story = saved.work?.stories?.find((item) => item.id === fallback.id);
        if (!story) return fallback;
        return { ...fallback, ...story, images: story.images?.length ? story.images : fallback.images };
      }),
    },
    knowledge: {
      ...DEFAULT_HOMEPAGE.knowledge,
      ...saved.knowledge,
      rail: saved.knowledge?.rail?.length ? saved.knowledge.rail : DEFAULT_HOMEPAGE.knowledge.rail,
      stats: saved.knowledge?.stats?.length ? saved.knowledge.stats : DEFAULT_HOMEPAGE.knowledge.stats,
      display: { ...DEFAULT_HOMEPAGE.knowledge.display, ...saved.knowledge?.display },
      items: (saved.knowledge?.items?.length ? saved.knowledge.items : DEFAULT_HOMEPAGE.knowledge.items).map((item, index) => ({
        ...DEFAULT_HOMEPAGE.knowledge.items[index],
        ...item,
        icon: item.icon || DEFAULT_HOMEPAGE.knowledge.items[index]?.icon || "strategy",
        href: item.href || DEFAULT_HOMEPAGE.knowledge.items[index]?.href || "/services",
      })),
    },
    journey: {
      ...DEFAULT_HOMEPAGE.journey,
      ...saved.journey,
      stats: saved.journey?.stats?.length ? saved.journey.stats : DEFAULT_HOMEPAGE.journey.stats,
      display: { ...DEFAULT_HOMEPAGE.journey.display, ...saved.journey?.display },
      entries: (saved.journey?.entries?.length ? saved.journey.entries : DEFAULT_HOMEPAGE.journey.entries).map((entry) => {
        const fallback = DEFAULT_HOMEPAGE.journey.entries.find((item) => item.id === entry.id);
        return {
          ...fallback,
          ...entry,
          type: entry.type || fallback?.type || "work",
          highlights: entry.highlights?.length ? entry.highlights : fallback?.highlights || [],
          showDetails: entry.showDetails ?? fallback?.showDetails ?? true,
          detailsBlocked: entry.detailsBlocked ?? fallback?.detailsBlocked ?? false,
        };
      }),
    },
    ventures: { ...DEFAULT_HOMEPAGE.ventures, ...saved.ventures },
    principles: { ...DEFAULT_HOMEPAGE.principles, ...saved.principles, items: saved.principles?.items?.length ? saved.principles.items : DEFAULT_HOMEPAGE.principles.items },
    speaking: { ...DEFAULT_HOMEPAGE.speaking, ...saved.speaking },
    booking: { ...DEFAULT_HOMEPAGE.booking, ...saved.booking, items: saved.booking?.items?.length ? saved.booking.items : DEFAULT_HOMEPAGE.booking.items },
    closing: { ...DEFAULT_HOMEPAGE.closing, ...saved.closing },
  };
}
