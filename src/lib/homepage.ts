import { projects, siteConfig, speakingEngagements } from "@/data/site-data";
import type { SiteSettings } from "@/lib/supabase";

export type HomePoint = { title: string; body: string };
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
  };
  work: {
    label: string;
    title: string;
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
      { title: "Think clearly", body: "Understand the real challenge." },
      { title: "Build purposefully", body: "Create technology around actual needs." },
      { title: "Deliver reliably", body: "Turn the concept into something people can use." },
    ],
  },
  work: {
    label: "01 / Selected work",
    title: "Evidence, one case at a time.",
    stories: [
      story("caritas-systems", {
        line: "Organizational reporting, held in one dependable system.",
        support: "Product delivery · Systems · Data",
        tags: ["Systems", "Data"],
        images: ["/images/projects/caritas-systems.webp"],
      }),
      story("stockpro", {
        line: "Inventory and sales, without a pile of separate records.",
        support: "Product · Business systems",
        tags: ["Product", "Systems"],
        images: ["/images/projects/stockpro.webp"],
      }),
      story("askfield", {
        line: "Survey workflows, connected through the interface.",
        support: "Frontend integration · Product experience",
        tags: ["Product", "Data"],
        images: ["/images/projects/askfield.webp"],
        status: "Team contribution. No public metric is claimed.",
      }),
      story("caritas-website", {
        line: "A public site, kept apart from the internal systems.",
        support: "Website · Public presence",
        tags: ["Product"],
        images: ["/images/projects/caritas-website.webp"],
        status: "Public website work. No live address is claimed until the approved domain is published.",
      }),
      story("gotallnews", {
        line: "An independent publishing product, still in progress.",
        support: "Product · Independent",
        tags: ["Product", "Ventures"],
        images: ["/images/projects/gotallnews.webp"],
        status: "Independent product work. No traffic or audience metric is claimed.",
      }),
      story("psta-accounting", {
        line: "Ticket accounting with a record someone can trace.",
        support: "Automation · Financial workflows",
        tags: ["Systems"],
        images: ["/images/projects/psta.webp"],
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

export function homepageFrom(settings: SiteSettings): HomepageContent {
  const saved = settings.homepage;
  if (!saved) return DEFAULT_HOMEPAGE;
  return {
    ...DEFAULT_HOMEPAGE,
    ...saved,
    manifesto: { ...DEFAULT_HOMEPAGE.manifesto, ...saved.manifesto, points: saved.manifesto?.points?.length ? saved.manifesto.points : DEFAULT_HOMEPAGE.manifesto.points },
    work: {
      ...DEFAULT_HOMEPAGE.work,
      ...saved.work,
      stories: saved.work?.stories?.length
        ? saved.work.stories.map((story) => {
            const fallback = DEFAULT_HOMEPAGE.work.stories.find((item) => item.id === story.id);
            return { ...fallback, ...story, images: story.images?.length ? story.images : fallback?.images || [] };
          })
        : DEFAULT_HOMEPAGE.work.stories,
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
