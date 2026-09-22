import { projects, siteConfig, timeline } from "@/data/site-data";
import {
  careerFrom,
  careerRecordToJourneyEntry,
  journeySelectedRecords,
} from "@/lib/career";
import type { SiteSettings } from "@/lib/supabase";

export type HomePoint = { title: string; body: string; tag?: string };
export type KnowledgeIcon = "strategy" | "product" | "technology" | "data";
export type KnowledgeItem = {
  title: string;
  body: string;
  href?: string;
  icon?: KnowledgeIcon;
  tags?: string[];
};
export type KnowledgeStat = { value: string; label: string };
export type PrincipleIcon = "search" | "cube" | "trend";
export type SpeakingStatIcon = "people" | "book" | "pin";
export type SpeakingTopicIcon = "data" | "tools" | "hands" | "teams";
export type BookingItemIcon = "chat" | "doc" | "people";
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
  logo?: string;
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
    /** Career record ids to show on homepage Journey. Empty = records with showOnJourney. */
    selectedIds: string[];
    entries: JourneyEntry[];
    display: {
      showStats: boolean;
      showMoreCard: boolean;
      showFilters: boolean;
      showSort: boolean;
    };
  };
  principles: {
    label: string;
    title: string;
    subtitle: string;
    quote: string;
    quoteAttribution: string;
    rails: string[];
    footNote: string;
    ctaLabel: string;
    ctaHref: string;
    items: { n: string; title: string; body: string; icon: PrincipleIcon }[];
  };
  speaking: {
    label: string;
    title: string;
    body: string;
    image: string;
    brandName: string;
    brandTagline: string;
    brandNote: string;
    brandLogo: string;
    quote: string;
    visualCaption: string;
    coverTitle: string;
    coverSubtitle: string;
    footQuote: string;
    stats: { icon: SpeakingStatIcon; label: string }[];
    topics: { icon: SpeakingTopicIcon; title: string; body: string }[];
  };
  booking: {
    label: string;
    title: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    emailLabel: string;
    whatsappLabel: string;
    rails: string[];
    items: { title: string; time: string; body: string; icon: BookingItemIcon; href?: string }[];
  };
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
    intro: "Systems, products, and digital solutions built for organizations, businesses, and communities.",
    cta: "View all projects",
    flourish: "",
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
    title: "Different challenges. Practical ways forward.",
    body: "From building digital products to growing an online presence, improving operations or providing hands-on support.",
    script: "From ideas to impact",
    rail: ["Build", "Grow", "Transform", "Support"],
    learnMore: "Learn more",
    items: [
      {
        title: "Build digital products",
        body: "Software, websites, digital platforms, e-commerce experiences and practical technology built around real needs.",
        href: "/services?focus=build",
        icon: "product",
        tags: ["Products", "Websites", "Software", "Commerce"],
      },
      {
        title: "Grow a digital presence",
        body: "Digital branding, social platforms, marketplace support, product publishing and stronger online business presence.",
        href: "/services?focus=grow",
        icon: "strategy",
        tags: ["Social Media", "Marketplaces", "Branding", "E-commerce"],
      },
      {
        title: "Improve how work gets done",
        body: "Business systems, data, integrations, automation and practical AI that improve everyday operations.",
        href: "/services?focus=transform",
        icon: "technology",
        tags: ["Systems", "Data", "Automation", "AI"],
      },
      {
        title: "Support ideas and operations",
        body: "Technology guidance, international client assistance, Rwanda-based digital/process support, training and ongoing technical help.",
        href: "/services?focus=support",
        icon: "data",
        tags: ["Consulting", "International Support", "Training", "Technical Support"],
      },
    ],
    statement: "BUILD · GROW · TRANSFORM · SUPPORT",
    statementMark: "",
    stats: [],
    quote: "Technology is one tool. The goal is useful progress.",
    attribution: "",
    display: {
      showScript: false,
      showRail: true,
      showStatement: true,
      showStats: false,
      showQuote: true,
      showIndex: false,
      showGo: false,
    },
  },
  journey: {
    label: "Journey",
    title: "A journey of continuous building.",
    note: "From learning to leading — a timeline of the key places, roles, and milestones that shaped this work.",
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
    selectedIds: ["lerony", "edu-ulk", "psta", "edu-sjitc"],
    entries: [],
    display: {
      showStats: true,
      showMoreCard: true,
      showFilters: true,
      showSort: true,
    },
  },
  principles: {
    label: "Principles",
    title: "How the work is actually done.",
    subtitle: "Three principles guide how I choose problems, build solutions, and measure success.",
    quote: "Ideas are common. Useful work takes discipline.",
    quoteAttribution: "Prince Parfait GANZA",
    rails: ["People", "Systems", "Progress"],
    footNote:
      "These principles show up in the projects I build, the teams I work with, and the way I approach new opportunities.",
    ctaLabel: "See the work",
    ctaHref: "/projects",
    items: [
      {
        n: "01",
        icon: "search",
        title: "Understand before building",
        body: "The strongest solution begins with the right problem.",
      },
      {
        n: "02",
        icon: "cube",
        title: "Make complexity useful",
        body: "Technology matters when people can depend on it.",
      },
      {
        n: "03",
        icon: "trend",
        title: "Build for progress",
        body: "Every product should create a meaningful next step.",
      },
    ],
  },
  speaking: {
    label: "Speaking and training",
    title: "Practical knowledge for real-world impact.",
    body: "I deliver hands-on training and speaking sessions through Eshuri Learning, focused on data systems, practical tools, and skills that help students and teams solve real problems.",
    image: "/images/profile/prince-parfait-ganza-kigali-casual.webp",
    brandName: "Eshuri Learning",
    brandTagline: "Learn. Practice. Apply.",
    brandNote: "Practical training for students, professionals and organizations.",
    brandLogo: "/brand/partners/eshuri-learning.png",
    quote: "Technology is more powerful when people can use it.",
    visualCaption: "Skills today. Opportunities tomorrow.",
    coverTitle: "What I cover",
    coverSubtitle: "Hands-on, practical, and focused on what people can apply.",
    footQuote: "Good training doesn't just transfer information — it builds confidence to solve real problems.",
    stats: [
      { icon: "people", label: "~85 Trainees" },
      { icon: "book", label: "Data Systems Training Focus" },
      { icon: "pin", label: "Kigali, Rwanda" },
    ],
    topics: [
      { icon: "data", title: "Data Systems", body: "Working with data, databases, and useful reporting." },
      { icon: "tools", title: "Practical Tools", body: "From spreadsheets to modern data tools." },
      { icon: "hands", title: "Hands-on Learning", body: "Real examples, guided practice and support." },
      { icon: "teams", title: "For Students & Teams", body: "Helping individuals and organizations build capacity." },
    ],
  },
  booking: {
    label: "A conversation",
    title: "Have an ambitious idea worth discussing?",
    body: "Let's explore how we can turn it into a meaningful product, partnership, or solution.",
    primaryCta: "Start a conversation",
    primaryHref: "/contact",
    emailLabel: "Email",
    whatsappLabel: "WhatsApp",
    rails: ["Ideas", "People", "Impact"],
    items: [
      {
        icon: "chat",
        title: "Introduction",
        time: "20 min",
        body: "An idea, or a first introduction.",
        href: "/contact",
      },
      {
        icon: "doc",
        title: "Project discovery",
        time: "30 min",
        body: "Requirements and whether a collaboration fits.",
        href: "/contact",
      },
      {
        icon: "people",
        title: "Partnership discussion",
        time: "45 min",
        body: "Lerony, a venture, or an institutional brief.",
        href: "/contact",
      },
    ],
  },
};

export function imagesForStory(story: WorkStory, records?: { id: string; image?: string; screenshots?: string[]; pinnedMedia?: string[] }[]) {
  const match = records?.find((item) => item.id === story.id) || projects.find((item) => item.id === story.id);
  const fromProject = [
    ...(match?.pinnedMedia || []),
    ...(match?.screenshots || []),
    ...(match?.image ? [match.image] : []),
  ].filter((src, index, list) => src && !src.includes("placeholder") && list.indexOf(src) === index);
  const extras = (story.images || []).filter((src) => src && !fromProject.includes(src));
  return [...fromProject, ...extras];
}

export function homepageFrom(settings: SiteSettings): HomepageContent {
  const career = careerFrom(settings);
  const buildJourneyEntries = (selectedIds?: string[]) =>
    journeySelectedRecords(career, selectedIds?.length ? selectedIds : DEFAULT_HOMEPAGE.journey.selectedIds).map(
      careerRecordToJourneyEntry,
    );

  const saved = settings.homepage;
  if (!saved) {
    return {
      ...DEFAULT_HOMEPAGE,
      journey: {
        ...DEFAULT_HOMEPAGE.journey,
        entries: buildJourneyEntries(DEFAULT_HOMEPAGE.journey.selectedIds),
      },
    };
  }
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
      intro: (() => {
        const raw = saved.work?.intro?.trim() || DEFAULT_HOMEPAGE.work.intro;
        return /contributed to\s*[—–-]\s*solving/i.test(raw) ? DEFAULT_HOMEPAGE.work.intro : raw;
      })(),
      cta: saved.work?.cta || DEFAULT_HOMEPAGE.work.cta,
      flourish: "",
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
    knowledge: (() => {
      const savedKnowledge = saved.knowledge || {};
      const staleTitle = "How ideas become working systems.";
      const staleFirst = "Strategy & Discovery";
      const isStale =
        !savedKnowledge.title ||
        savedKnowledge.title === staleTitle ||
        savedKnowledge.items?.[0]?.title === staleFirst;

      if (isStale) {
        return { ...DEFAULT_HOMEPAGE.knowledge };
      }

      return {
        ...DEFAULT_HOMEPAGE.knowledge,
        ...savedKnowledge,
        rail: savedKnowledge.rail?.length ? savedKnowledge.rail : DEFAULT_HOMEPAGE.knowledge.rail,
        stats: savedKnowledge.stats?.length ? savedKnowledge.stats : DEFAULT_HOMEPAGE.knowledge.stats,
        display: { ...DEFAULT_HOMEPAGE.knowledge.display, ...savedKnowledge.display },
        items: (savedKnowledge.items?.length ? savedKnowledge.items : DEFAULT_HOMEPAGE.knowledge.items).map((item, index) => {
          const fallback = DEFAULT_HOMEPAGE.knowledge.items[index];
          const href =
            item.href && item.href !== "/services"
              ? item.href
              : fallback?.href || "/services";
          return {
            ...fallback,
            ...item,
            icon: item.icon || fallback?.icon || "strategy",
            href,
            tags: item.tags?.length ? item.tags : fallback?.tags || [],
          };
        }),
      };
    })(),
    journey: (() => {
      const selectedIds =
        saved.journey?.selectedIds?.length
          ? saved.journey.selectedIds
          : DEFAULT_HOMEPAGE.journey.selectedIds;
      const entries = buildJourneyEntries(selectedIds);

      return {
        ...DEFAULT_HOMEPAGE.journey,
        ...saved.journey,
        selectedIds,
        stats: saved.journey?.stats?.length ? saved.journey.stats : DEFAULT_HOMEPAGE.journey.stats,
        display: { ...DEFAULT_HOMEPAGE.journey.display, ...saved.journey?.display },
        entries,
      };
    })(),
    principles: {
      ...DEFAULT_HOMEPAGE.principles,
      ...saved.principles,
      rails: saved.principles?.rails?.length ? saved.principles.rails : DEFAULT_HOMEPAGE.principles.rails,
      items: (saved.principles?.items?.length ? saved.principles.items : DEFAULT_HOMEPAGE.principles.items).map(
        (item, index) => {
          const fallback = DEFAULT_HOMEPAGE.principles.items[index];
          return {
            n: item.n || fallback?.n || String(index + 1).padStart(2, "0"),
            title: item.title || fallback?.title || "",
            body: item.body || fallback?.body || "",
            icon: item.icon || fallback?.icon || "search",
          };
        },
      ),
    },
    speaking: (() => {
      const savedSpeaking = saved.speaking || {};
      const staleTitle = "Knowledge becomes more valuable when it moves.";
      return {
        ...DEFAULT_HOMEPAGE.speaking,
        ...savedSpeaking,
        title:
          !savedSpeaking.title || savedSpeaking.title === staleTitle
            ? DEFAULT_HOMEPAGE.speaking.title
            : savedSpeaking.title,
        quote: savedSpeaking.quote?.trim() || DEFAULT_HOMEPAGE.speaking.quote,
        visualCaption: savedSpeaking.visualCaption || DEFAULT_HOMEPAGE.speaking.visualCaption,
        stats: savedSpeaking.stats?.length ? savedSpeaking.stats : DEFAULT_HOMEPAGE.speaking.stats,
        topics: savedSpeaking.topics?.length ? savedSpeaking.topics : DEFAULT_HOMEPAGE.speaking.topics,
      };
    })(),
    booking: {
      ...DEFAULT_HOMEPAGE.booking,
      ...saved.booking,
      rails: saved.booking?.rails?.length ? saved.booking.rails : DEFAULT_HOMEPAGE.booking.rails,
      items: (saved.booking?.items?.length ? saved.booking.items : DEFAULT_HOMEPAGE.booking.items).map((item, index) => {
        const fallback = DEFAULT_HOMEPAGE.booking.items[index];
        return {
          title: item.title || fallback?.title || "",
          time: item.time || fallback?.time || "",
          body: item.body || fallback?.body || "",
          icon: item.icon || fallback?.icon || "chat",
          href: item.href || fallback?.href || "/contact",
        };
      }),
    },
  };
}
