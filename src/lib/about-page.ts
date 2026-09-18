import type { SiteSettings } from "@/lib/supabase";

export type AboutFactIcon = "pin" | "briefcase" | "grad" | "bolt" | "target" | "globe";
export type AboutFocusIcon = "code" | "data" | "bulb" | "people" | "rocket" | "book";
export type AboutValueIcon = "diamond" | "gear" | "person" | "chart";

export type AboutFact = {
  icon: AboutFactIcon;
  label: string;
  value: string;
};

export type AboutFocus = {
  icon: AboutFocusIcon;
  title: string;
  body: string;
};

export type AboutValue = {
  icon: AboutValueIcon;
  title: string;
  body: string;
};

export type AboutFactCard = {
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

export type AboutPageContent = {
  hero: {
    label: string;
    title: string;
    body: string;
    portrait: string;
    roles: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    facts: AboutFact[];
  };
  focus: {
    label: string;
    title: string;
    items: AboutFocus[];
  };
  story: {
    label: string;
    title: string;
    paragraphs: string[];
    quote: string;
  };
  work: {
    label: string;
    title: string;
    items: AboutFocus[];
  };
  facts: {
    label: string;
    title: string;
    items: AboutFactCard[];
  };
  values: {
    label: string;
    title: string;
    items: AboutValue[];
  };
  strengths: {
    label: string;
    title: string;
    items: string[];
  };
  cta: {
    label: string;
    title: string;
    body: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
};

export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  hero: {
    label: "About me",
    title: "Founder, entrepreneur, and the person who builds the system.",
    body: "Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist based in Kigali. He leads LERONY Ltd and builds technology, digital products and ventures that help organizations turn ambitious ideas into reliable solutions.",
    portrait: "/images/profile/prince-parfait-ganza-kigali-rwanda.webp",
    roles: "Founder · Entrepreneur · Technologist",
    primaryCtaLabel: "Work with me",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "View my work",
    secondaryCtaHref: "/projects",
    facts: [
      { icon: "pin", label: "Location", value: "Kigali, Rwanda" },
      { icon: "briefcase", label: "Current role", value: "Founder & CEO, LERONY Ltd · 2025–Present" },
      { icon: "grad", label: "Education", value: "Bachelor of Computer Science in Software Engineering, ULK · 2025–Present (ongoing)" },
      { icon: "bolt", label: "Focus", value: "Software · Data · AI · Impact" },
      { icon: "target", label: "Status", value: "Open to collaborations & opportunities" },
    ],
  },
  focus: {
    label: "Focus",
    title: "What I focus on",
    items: [
      { icon: "code", title: "Software development", body: "Products and systems people can run day to day." },
      { icon: "data", title: "Data systems", body: "Structures that keep operations and reporting clear." },
      { icon: "bulb", title: "Ventures & innovation", body: "Ideas with a commercial path, not unfinished tasks." },
      { icon: "people", title: "Training & collaboration", body: "Practical sessions that transfer real capability." },
    ],
  },
  story: {
    label: "My story",
    title: "Person, then systems.",
    paragraphs: [
      "The public identity is founder, entrepreneur, and technologist. Software engineering, systems, data, and practical AI sit underneath that identity as capabilities and evidence.",
      "In 2025 I founded LERONY Ltd, a technology and innovation company in Kigali. This site is about the person and the work. The company brand lives at lerony.com.",
    ],
    quote: "Technology is more meaningful when it solves real problems and improves people's lives.",
  },
  work: {
    label: "What I do",
    title: "How the craft shows up",
    items: [
      { icon: "code", title: "Software development", body: "Interfaces, APIs, and operational tools for real teams." },
      { icon: "data", title: "Data and AI", body: "Practical systems for collection, insight, and delivery." },
      { icon: "rocket", title: "Ventures and innovation", body: "Building and leading through LERONY Ltd." },
      { icon: "people", title: "Training and collaboration", body: "Clear technical training with measurable cohorts." },
    ],
  },
  facts: {
    label: "Key facts",
    title: "Evidence, not adjectives",
    items: [
      {
        title: "LERONY Ltd",
        subtitle: "Founder & CEO",
        meta: "2025–Present · Kigali",
        href: "https://lerony.com",
      },
      {
        title: "Education",
        subtitle: "ULK · Bachelor of Computer Science in Software Engineering",
        meta: "SJITC Nyamirambo · Software Development (SOD) · Distinction",
        href: "/experience",
      },
      {
        title: "ALX Africa",
        subtitle: "Data Analytics · Founder Academy · Professional Foundations",
        meta: "2025 · Verified certificates",
        href: "/experience",
      },
      {
        title: "Selected systems",
        subtitle: "Client and product work",
        meta: "AskField, Caritas, and more",
        href: "/projects",
      },
    ],
  },
  values: {
    label: "Values",
    title: "How the work is judged",
    items: [
      { icon: "diamond", title: "Evidence over claims", body: "Named organizations and clear contribution." },
      { icon: "gear", title: "Ship what operations need", body: "Tools staff can log into and run." },
      { icon: "person", title: "Person and company apart", body: "This site is the person; Lerony is the firm." },
      { icon: "chart", title: "Keep learning visible", body: "The Bachelor of Computer Science in Software Engineering at ULK is ongoing — stated plainly." },
    ],
  },
  strengths: {
    label: "Strengths",
    title: "How I tend to work",
    items: [
      "Problem solving",
      "Fast learner",
      "Adaptable",
      "Attention to detail",
      "Team collaboration",
      "Product thinking",
      "Curiosity",
      "Consistency",
    ],
  },
  cta: {
    label: "Next step",
    title: "See the work, or start a conversation.",
    body: "Have a project, an idea, or just want to say hello? A clear brief is enough to start.",
    primaryCtaLabel: "Get in touch",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "View my work",
    secondaryCtaHref: "/projects",
  },
};

function mergeList<T>(saved: T[] | undefined, fallback: T[]) {
  return saved?.length ? saved : fallback;
}

type FactItem = { title: string; subtitle: string; meta: string; href: string };

/** Prefer a balanced 4-card Key Facts set when older 5-card education splits are saved. */
function normalizeKeyFacts(items: FactItem[]): FactItem[] {
  const hasUlk = items.some((item) => /ULK|Kigali Independent University/i.test(item.title));
  const hasSjitc = items.some((item) => /SJITC/i.test(item.title));
  const hasAlx = items.some((item) => /ALX/i.test(item.title));
  const hasEducationCard = items.some((item) => /^Education$/i.test(item.title));
  if (items.length === 5 && hasUlk && hasSjitc && hasAlx && !hasEducationCard) {
    return DEFAULT_ABOUT_PAGE.facts.items;
  }
  return items;
}

const FULL_ULK_PROGRAM = "Bachelor of Computer Science in Software Engineering";
const FULL_SJITC_PROGRAM = "Software Development (SOD)";

/** Upgrade legacy short education labels saved in dashboard/settings. */
function upgradeEducationCopy<T extends Record<string, unknown>>(item: T): T {
  const next = { ...item } as T & {
    value?: string;
    subtitle?: string;
    body?: string;
    title?: string;
  };
  const replace = (text: string | undefined) => {
    if (!text) return text;
    return text
      .replace(/\bUniversity Computer Science\b/gi, FULL_ULK_PROGRAM)
      .replace(/\bComputer Science, ULK\b/gi, `${FULL_ULK_PROGRAM}, ULK`)
      .replace(/^Computer Science$/i, FULL_ULK_PROGRAM)
      .replace(/\bUndergraduate Computer Science studies\b/gi, `studies toward a ${FULL_ULK_PROGRAM}`)
      .replace(/\bSoftware Engineering\b/g, (match, offset, full) => {
        // Only rewrite SJITC secondary-school labels, not ULK bachelor wording.
        const window = full.slice(Math.max(0, offset - 40), offset + match.length + 40);
        if (/ULK|Bachelor of Computer Science/i.test(window)) return match;
        if (/SJITC|Nyamirambo|secondary/i.test(window) || /^Software Engineering$/i.test(text)) {
          return FULL_SJITC_PROGRAM;
        }
        return match;
      });
  };
  if (typeof next.value === "string") next.value = replace(next.value);
  if (typeof next.subtitle === "string") {
    next.subtitle =
      /^Software Engineering$/i.test(next.subtitle) ? FULL_SJITC_PROGRAM : replace(next.subtitle);
  }
  if (typeof next.body === "string") next.body = replace(next.body);
  if (typeof next.title === "string" && /^Computer Science$/i.test(next.title)) {
    next.title = FULL_ULK_PROGRAM;
  }
  return next;
}

export function aboutPageFrom(settings: SiteSettings): AboutPageContent {
  const saved = settings.aboutPage;
  if (!saved) {
    return {
      ...DEFAULT_ABOUT_PAGE,
      hero: {
        ...DEFAULT_ABOUT_PAGE.hero,
        portrait: settings.heroImageUrl || DEFAULT_ABOUT_PAGE.hero.portrait,
        roles:
          settings.siteSubtitle?.split("·").slice(0, 3).join(" · ").trim() || DEFAULT_ABOUT_PAGE.hero.roles,
      },
    };
  }

  return {
    ...DEFAULT_ABOUT_PAGE,
    ...saved,
    hero: {
      ...DEFAULT_ABOUT_PAGE.hero,
      ...saved.hero,
      portrait: saved.hero?.portrait || settings.heroImageUrl || DEFAULT_ABOUT_PAGE.hero.portrait,
      roles:
        saved.hero?.roles ||
        settings.siteSubtitle?.split("·").slice(0, 3).join(" · ").trim() ||
        DEFAULT_ABOUT_PAGE.hero.roles,
      facts: mergeList(saved.hero?.facts, DEFAULT_ABOUT_PAGE.hero.facts).map(upgradeEducationCopy),
    },
    focus: {
      ...DEFAULT_ABOUT_PAGE.focus,
      ...saved.focus,
      items: mergeList(saved.focus?.items, DEFAULT_ABOUT_PAGE.focus.items),
    },
    story: {
      ...DEFAULT_ABOUT_PAGE.story,
      ...saved.story,
      paragraphs: mergeList(saved.story?.paragraphs, DEFAULT_ABOUT_PAGE.story.paragraphs),
    },
    work: {
      ...DEFAULT_ABOUT_PAGE.work,
      ...saved.work,
      items: mergeList(saved.work?.items, DEFAULT_ABOUT_PAGE.work.items),
    },
    facts: {
      ...DEFAULT_ABOUT_PAGE.facts,
      ...saved.facts,
      items: normalizeKeyFacts(
        mergeList(saved.facts?.items, DEFAULT_ABOUT_PAGE.facts.items).map(upgradeEducationCopy),
      ),
    },
    values: {
      ...DEFAULT_ABOUT_PAGE.values,
      ...saved.values,
      items: mergeList(saved.values?.items, DEFAULT_ABOUT_PAGE.values.items).map(upgradeEducationCopy),
    },
    strengths: {
      ...DEFAULT_ABOUT_PAGE.strengths,
      ...saved.strengths,
      items: mergeList(saved.strengths?.items, DEFAULT_ABOUT_PAGE.strengths.items),
    },
    cta: { ...DEFAULT_ABOUT_PAGE.cta, ...saved.cta },
  };
}
