import { DEFAULT_PORTRAIT_WEBP, IDENTITY_ROLE_LINE, PORTRAIT_PATHS, SPECIALIZATIONS } from "@/lib/identity";
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

/**
 * About page order: who → specializations → path → evidence → toolkit → principles → contact.
 * Identity line only: Software Engineer · Technology Entrepreneur · Founder.
 * Exactly three specializations — entrepreneurship belongs in the founder story, not as a fourth card.
 */
export const DEFAULT_ABOUT_PAGE: AboutPageContent = {
  hero: {
    label: "About me",
    title: "Software engineer and technology entrepreneur.",
    body: "Prince Parfait GANZA is a software engineer and technology entrepreneur based in Kigali, Rwanda. He designs and develops software systems, research technology and data platforms for organizations and businesses. He is also the Founder & CEO of LERONY Ltd.",
    // DEFAULT_PORTRAIT_WEBP is a string binding — safe under circular module init.
    portrait: DEFAULT_PORTRAIT_WEBP,
    roles: IDENTITY_ROLE_LINE,
    primaryCtaLabel: "Work with me",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "View my work",
    secondaryCtaHref: "/projects",
    facts: [
      { icon: "pin", label: "Location", value: "Kigali, Rwanda" },
      { icon: "briefcase", label: "Company role", value: "Founder & CEO, LERONY Ltd · 2025–Present" },
      {
        icon: "grad",
        label: "Education",
        value: "Bachelor of Computer Science in Software Engineering, ULK · ongoing",
      },
      {
        icon: "bolt",
        label: "Specializations",
        value: "Software Engineering · Research Technology · Data Systems",
      },
      { icon: "target", label: "Status", value: "Open to collaborations & opportunities" },
    ],
  },
  focus: {
    label: "Specializations",
    title: "Areas of specialization",
    items: [
      {
        icon: "code",
        title: SPECIALIZATIONS[0].title,
        body: "Production software, business platforms, integrations and operational systems.",
      },
      {
        icon: "data",
        title: SPECIALIZATIONS[1].title,
        body: "Digital surveys, research workflows, field data collection and systems supporting CAPI, CATI and CAWI operations.",
      },
      {
        icon: "bulb",
        title: SPECIALIZATIONS[2].title,
        body: "Structured data, indicators, reporting, dashboards and systems that turn operational information into usable insight.",
      },
    ],
  },
  story: {
    label: "Background",
    title: "My journey",
    paragraphs: [
      "Formal software foundations came through secondary Software Development training at SJITC, then continued into undergraduate study toward a Bachelor of Computer Science in Software Engineering at ULK, still in progress.",
      "ALX Africa deepened data and analysis habits. That path led into research technology at Ethical Research Solutions on AskField, as Frontend Integrator: survey programming, digital collection workflows and research-data handling across CAPI, CATI and CAWI modes.",
      "The same systems thinking carried into broader software engineering: inventory and sales operations in StockPro, ticket accounting work associated with PSTA, and organizational indicator and reporting systems for Caritas Rwanda.",
      "In 2025 I founded LERONY Ltd in Kigali to deliver practical technology with organizations and businesses. This site is about the person and the work. The company lives at lerony.com.",
    ],
    quote: "",
  },
  work: {
    label: "Practice",
    title: "Where the work shows up",
    items: [
      {
        icon: "code",
        title: "Software systems",
        body: "Web applications, business platforms and operational tools for real teams.",
      },
      {
        icon: "data",
        title: "Research technology",
        body: "Survey programming, digital collection and research-data workflows, evidenced through AskField.",
      },
      {
        icon: "book",
        title: "Data & reporting",
        body: "Indicators, dashboards and structured reporting for monitoring and decisions.",
      },
    ],
  },
  facts: {
    label: "Evidence",
    title: "Selected experience",
    items: [
      {
        title: "AskField",
        subtitle: "Frontend Integrator · Ethical Research Solutions",
        meta: "Research technology & digital data collection",
        href: "/projects/askfield",
      },
      {
        title: "Caritas Rwanda · CRNIS",
        subtitle: "Information & indicator systems",
        meta: "Data systems & decision support",
        href: "/projects/caritas-systems",
      },
      {
        title: "APN African Marketplace",
        subtitle: "Lead Developer · LERONY Ltd",
        meta: "E-commerce web platform",
        href: "/projects/apn-african-marketplace",
      },
      {
        title: "GOA+",
        subtitle: "Co-Founder & CTO",
        meta: "VR education · Products & ventures",
        href: "/projects/goa-plus",
      },
      {
        title: "Julia Foundation",
        subtitle: "Lead Developer · NGO platform",
        meta: "Nonprofit site & donation enablement",
        href: "/projects/julia-foundation",
      },
      {
        title: "LERONY Ltd",
        subtitle: "Founder & CEO",
        meta: "2025–Present · Kigali",
        href: "https://lerony.com",
      },
    ],
  },
  values: {
    label: "Principles",
    title: "How I work",
    items: [
      {
        icon: "gear",
        title: "Start from the real workflow",
        body: "Understand how people already work before choosing tools or architecture.",
      },
      {
        icon: "diamond",
        title: "Ship systems teams can run",
        body: "Prefer dependable products staff can use day to day over unfinished demos.",
      },
      {
        icon: "person",
        title: "Credit the work accurately",
        body: "Say clearly what I built, what a team built, and what was delivered through LERONY Ltd.",
      },
    ],
  },
  strengths: {
    label: "Technologies",
    title: "Engineering toolkit",
    items: [],
  },
  cta: {
    label: "Contact",
    title: "Start a conversation",
    body: "Share a brief about the system, research workflow or product you need. A clear problem is enough to begin.",
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

const LEGACY_PORTRAIT_PATHS = new Set([
  "/images/profile/prince-parfait-ganza-kigali-rwanda.webp",
  "/images/profile/prince-parfait-ganza-kigali-rwanda.png",
  "/images/profile/prince-parfait-ganza-kigali-casual.webp",
]);

function resolveEntityPortrait(path: string | undefined): string {
  const v = (path || "").trim();
  if (!v || LEGACY_PORTRAIT_PATHS.has(v)) {
    return PORTRAIT_PATHS?.webp || DEFAULT_PORTRAIT_WEBP;
  }
  return v;
}

/** Old About copy that contradicts Software Engineer · Technology Entrepreneur · Founder. */
const LEGACY_HERO_TITLES = new Set([
  "Founder, entrepreneur, and the person who builds the system.",
  "Founder, entrepreneur, and the person who builds the system",
  "Person, then systems.",
  "Prince Parfait GANZA",
  "Building software, research technology and data systems around real problems.",
  "Building software, research technology and data systems around real problems",
]);

const LEGACY_HERO_BODY_SNIPPETS = [
  /Rwandan founder, entrepreneur and technologist/i,
  /public identity is founder, entrepreneur, and technologist/i,
  /founder, entrepreneur and technologist based in Kigali/i,
  /^Software engineer and technology entrepreneur based in Kigali\. I design and build/i,
  /His work spans software systems, research technology, digital data collection and data-driven platforms/i,
  /where he works with organizations and businesses on practical technology solutions/i,
  /company role, not a fourth/i,
  /sit underneath that identity/i,
  /canonical identity/i,
  /public brand line/i,
];

const LEGACY_SECTION_TITLES = new Set([
  "Person, then systems.",
  "Person, then systems",
  "How the craft shows up",
  "How the craft shows up.",
  "Evidence, not adjectives",
  "Evidence, not adjectives.",
  "How the work is judged",
  "How the work is judged.",
  "What I focus on",
  "What I work on",
  "What I specialize in",
  "Profession first. Company role clear.",
  "Profession first. Company role clear",
  "How I prefer to work",
  "How I like to work",
  "How I got here",
  "Selected record",
  "Tools I use often",
  "Three areas of work",
  "Three areas of work.",
]);

const LEGACY_STORY_SNIPPETS = [
  /public identity is founder, entrepreneur, and technologist/i,
  /founder, entrepreneur, and technologist/i,
  /I started with data foundations through ALX, then moved into research technology/i,
  /sit underneath that identity/i,
  /company role, not a fourth/i,
  /canonical identity/i,
];

const LEGACY_FOCUS_TITLES = new Set([
  "Software development",
  "Data systems",
  "Ventures & innovation",
  "Training & collaboration",
  "Technology entrepreneurship",
  "Technology Entrepreneurship",
]);

const META_PUBLIC_COPY = [
  /public identity is/i,
  /canonical identity/i,
  /sit underneath that identity/i,
  /company role, not a fourth/i,
  /fourth technical specialization/i,
  /not a fourth technical/i,
  /evidence, not more job titles/i,
  /evidence first, titles second/i,
  /not only websites/i,
  /Profession first\.?\s*Company role clear/i,
  /identity layer/i,
  /public brand line/i,
  /not a public identity title/i,
  /not a specialization/i,
  /global public identity line/i,
];

function containsMetaPublicCopy(value: string | undefined): boolean {
  if (!value) return false;
  return META_PUBLIC_COPY.some((re) => re.test(value));
}

function isLegacyHeroTitle(value: string | undefined): boolean {
  return Boolean(value && LEGACY_HERO_TITLES.has(value.trim()));
}

function isLegacyHeroBody(value: string | undefined): boolean {
  if (!value) return true;
  return LEGACY_HERO_BODY_SNIPPETS.some((re) => re.test(value)) || containsMetaPublicCopy(value);
}

function isLegacySectionTitle(value: string | undefined): boolean {
  return Boolean(value && LEGACY_SECTION_TITLES.has(value.trim()));
}

function isLegacyStoryParagraphs(paragraphs: string[] | undefined): boolean {
  if (!paragraphs?.length) return false;
  return paragraphs.some(
    (p) => LEGACY_STORY_SNIPPETS.some((re) => re.test(p)) || containsMetaPublicCopy(p),
  );
}

function needsFocusReset(items: AboutFocus[] | undefined): boolean {
  if (!items?.length) return true;
  if (items.length !== 3) return true;
  if (items.some((item) => LEGACY_FOCUS_TITLES.has(item.title) || /entrepreneurship/i.test(item.title))) {
    return true;
  }
  const expected = SPECIALIZATIONS.map((item) => item.title);
  return !items.every((item, index) => item.title === expected[index]);
}

/**
 * When dashboard/settings still hold old slogan / dual-identity / four-pillar About packs,
 * replace those fields with the canonical defaults so the public page stays consistent.
 */
function upgradeAboutIdentity(content: AboutPageContent): AboutPageContent {
  const next = { ...content };

  next.hero = {
    ...next.hero,
    roles: IDENTITY_ROLE_LINE,
    title: isLegacyHeroTitle(next.hero.title) ? DEFAULT_ABOUT_PAGE.hero.title : next.hero.title,
    body: isLegacyHeroBody(next.hero.body) ? DEFAULT_ABOUT_PAGE.hero.body : next.hero.body,
    label:
      next.hero.label === "About me" || next.hero.label === "About" || !next.hero.label
        ? DEFAULT_ABOUT_PAGE.hero.label
        : next.hero.label,
    facts: (() => {
      const facts = next.hero.facts?.length ? next.hero.facts : DEFAULT_ABOUT_PAGE.hero.facts;
      return facts.map((fact) => {
        if (fact.label === "Focus" && /AI|Impact/i.test(fact.value) && !/Research/i.test(fact.value)) {
          return DEFAULT_ABOUT_PAGE.hero.facts.find((f) => f.label === "Specializations") || fact;
        }
        if (fact.label === "Current role") {
          return { ...fact, label: "Company role" };
        }
        return fact;
      });
    })(),
  };

  next.focus = {
    ...next.focus,
    label:
      isLegacySectionTitle(next.focus.title) ||
      next.focus.label === "Focus" ||
      /three areas/i.test(next.focus.label || "")
        ? DEFAULT_ABOUT_PAGE.focus.label
        : next.focus.label,
    title:
      isLegacySectionTitle(next.focus.title) || /three areas/i.test(next.focus.title || "")
        ? DEFAULT_ABOUT_PAGE.focus.title
        : next.focus.title,
    items: needsFocusReset(next.focus.items) ? DEFAULT_ABOUT_PAGE.focus.items : next.focus.items,
  };

  next.story = {
    ...next.story,
    label:
      next.story.label === "My story" || !next.story.label
        ? DEFAULT_ABOUT_PAGE.story.label
        : next.story.label,
    title: isLegacySectionTitle(next.story.title) ? DEFAULT_ABOUT_PAGE.story.title : next.story.title,
    paragraphs:
      isLegacyStoryParagraphs(next.story.paragraphs) || isLegacySectionTitle(next.story.title)
        ? DEFAULT_ABOUT_PAGE.story.paragraphs
        : next.story.paragraphs,
    quote: next.story.quote && /more meaningful when it solves/i.test(next.story.quote)
      ? ""
      : next.story.quote,
  };

  next.work = {
    ...next.work,
    label:
      next.work.label === "What I do" || !next.work.label
        ? DEFAULT_ABOUT_PAGE.work.label
        : next.work.label,
    title: isLegacySectionTitle(next.work.title) ? DEFAULT_ABOUT_PAGE.work.title : next.work.title,
    items:
      next.work.items?.some((item) =>
        /Ventures and innovation|Data and AI|Training and collaboration|Technology entrepreneurship/i.test(
          item.title,
        ),
      )
        ? DEFAULT_ABOUT_PAGE.work.items
        : next.work.items,
  };

  next.facts = {
    ...next.facts,
    label:
      next.facts.label === "Key facts" || !next.facts.label
        ? DEFAULT_ABOUT_PAGE.facts.label
        : next.facts.label,
    title: isLegacySectionTitle(next.facts.title) ? DEFAULT_ABOUT_PAGE.facts.title : next.facts.title,
    items:
      next.facts.items?.some((item) => /^Education & training$/i.test(item.title)) &&
      !next.facts.items?.some((item) => /APN|Julia Foundation|GOA\+/i.test(item.title))
        ? DEFAULT_ABOUT_PAGE.facts.items
        : next.facts.items,
  };

  next.values = {
    ...next.values,
    label:
      next.values.label === "Values" || !next.values.label
        ? DEFAULT_ABOUT_PAGE.values.label
        : next.values.label,
    title: isLegacySectionTitle(next.values.title) ? DEFAULT_ABOUT_PAGE.values.title : next.values.title,
    items:
      next.values.items?.some((item) =>
        /Evidence over claims|Ship what operations need|Keep learning visible|Profession first/i.test(
          item.title,
        ),
      )
        ? DEFAULT_ABOUT_PAGE.values.items
        : next.values.items,
  };

  next.strengths = {
    ...next.strengths,
    label:
      next.strengths.label === "Strengths" || !next.strengths.label
        ? DEFAULT_ABOUT_PAGE.strengths.label
        : next.strengths.label,
    title:
      next.strengths.title === "How I tend to work" || isLegacySectionTitle(next.strengths.title)
        ? DEFAULT_ABOUT_PAGE.strengths.title
        : next.strengths.title,
    items:
      next.strengths.items?.includes("Problem solving") && next.strengths.items?.includes("Curiosity")
        ? DEFAULT_ABOUT_PAGE.strengths.items
        : next.strengths.items,
  };

  next.cta = {
    ...next.cta,
    label: next.cta.label === "Next step" ? DEFAULT_ABOUT_PAGE.cta.label : next.cta.label,
    title:
      next.cta.title === "See the work, or start a conversation."
        ? DEFAULT_ABOUT_PAGE.cta.title
        : next.cta.title,
  };

  return next;
}

export function aboutPageFrom(settings: SiteSettings): AboutPageContent {
  const saved = settings.aboutPage;
  if (!saved) {
    return upgradeAboutIdentity({
      ...DEFAULT_ABOUT_PAGE,
      hero: {
        ...DEFAULT_ABOUT_PAGE.hero,
        portrait: resolveEntityPortrait(settings.heroImageUrl || DEFAULT_ABOUT_PAGE.hero.portrait),
        roles: IDENTITY_ROLE_LINE,
      },
    });
  }

  const merged: AboutPageContent = {
    ...DEFAULT_ABOUT_PAGE,
    ...saved,
    hero: {
      ...DEFAULT_ABOUT_PAGE.hero,
      ...saved.hero,
      portrait: resolveEntityPortrait(
        saved.hero?.portrait || settings.heroImageUrl || DEFAULT_ABOUT_PAGE.hero.portrait,
      ),
      roles: IDENTITY_ROLE_LINE,
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

  return upgradeAboutIdentity(merged);
}
