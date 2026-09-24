import { DEFAULT_PORTRAIT_WEBP, IDENTITY_ROLE_LINE, PORTRAIT_PATHS } from "@/lib/identity";
import type { SiteSettings } from "@/lib/supabase";

export type ContactTopicIcon = "chat" | "bulb" | "handshake" | "plane";

export type ContactTopic = {
  icon: ContactTopicIcon;
  label: string;
};

export type ContactFaq = {
  q: string;
  a: string;
};

export type ContactPageContent = {
  hero: {
    label: string;
    title: string;
    body: string;
    script: string;
    portrait: string;
    roles: string;
    topics: ContactTopic[];
  };
  cards: {
    emailNote: string;
    phoneLabel: string;
    phoneNote: string;
    locationNote: string;
    followNote: string;
    showPhone: boolean;
    /** Social ids from site settings to show on the Follow card (max 6). Empty = contact-placement defaults. */
    followSocialIds: string[];
    followSocialLimit: number;
  };
  form: {
    label: string;
    title: string;
    subtitle: string;
    privacyNote: string;
    subjects: string[];
  };
  media: {
    cityImage: string;
    cityCaption: string;
    cityTagline: string;
    mapsUrl: string;
    mapsLabel: string;
  };
  faq: {
    label: string;
    title: string;
    viewAllLabel: string;
    viewAllHref: string;
    items: ContactFaq[];
  };
};

export const DEFAULT_CONTACT_PAGE: ContactPageContent = {
  hero: {
    label: "Get in touch",
    title: "Let's build something great together.",
    body: "Have a project, a partnership idea, or just want to say hello? I'd love to hear from you. Use the form, email, or any of the channels below.",
    script: "Let's connect!",
    portrait: DEFAULT_PORTRAIT_WEBP,
    roles: IDENTITY_ROLE_LINE,
    topics: [
      { icon: "chat", label: "Project Collaboration" },
      { icon: "bulb", label: "Speaking Engagements" },
      { icon: "handshake", label: "Partnerships & Ventures" },
      { icon: "plane", label: "General Inquiries" },
    ],
  },
  cards: {
    emailNote: "I usually reply within 24–48 hours.",
    phoneLabel: "Phone",
    phoneNote: "General contact availability · Mon–Fri, 8AM–5PM (EAT)",
    locationNote: "Available for remote & on-site meetings.",
    followNote: "Let's stay connected.",
    showPhone: true,
    followSocialIds: ["linkedin", "github", "twitter", "instagram"],
    followSocialLimit: 4,
  },
  form: {
    label: "Send a message",
    title: "Start a conversation",
    subtitle: "Fill in the form below and I'll get back to you as soon as possible.",
    privacyNote: "Your information is safe and will never be shared.",
    subjects: [
      "Project Collaboration",
      "Speaking Engagement",
      "Partnership / Venture",
      "Technical Consulting",
      "General Inquiry",
      "Other",
    ],
  },
  media: {
    cityImage: "",
    cityCaption: "Kigali, Rwanda",
    cityTagline: "Innovation thrives here.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kigali%2C%20Rwanda",
    mapsLabel: "View on Google Maps",
  },
  faq: {
    label: "Quick questions",
    title: "Frequently asked questions",
    viewAllLabel: "",
    viewAllHref: "",
    items: [
      {
        q: "How long does it take to get a response?",
        a: "Most serious inquiries receive a reply within 24–48 hours on business days (Kigali, EAT).",
      },
      {
        q: "Can we schedule a call instead of email?",
        a: "Yes. Use Book a conversation when the calendar is connected, or reach out on WhatsApp for a quick intro.",
      },
      {
        q: "Do you offer freelance or consulting services?",
        a: "Project and systems work is possible when the brief is a fit. Share context in the form and we can decide next steps.",
      },
      {
        q: "Where are you based?",
        a: "Kigali, Rwanda. Remote collaboration is welcome.",
      },
    ],
  },
};

export function contactPageFrom(settings: SiteSettings): ContactPageContent {
  const saved = settings.contactPage;
  if (!saved) return DEFAULT_CONTACT_PAGE;
  return {
    ...DEFAULT_CONTACT_PAGE,
    ...saved,
    hero: {
      ...DEFAULT_CONTACT_PAGE.hero,
      ...saved.hero,
      topics: saved.hero?.topics?.length ? saved.hero.topics : DEFAULT_CONTACT_PAGE.hero.topics,
      portrait: (() => {
        const raw = saved.hero?.portrait || DEFAULT_CONTACT_PAGE.hero.portrait;
        if (
          !raw ||
          raw === "/images/profile/prince-parfait-ganza-kigali-rwanda.webp" ||
          raw === "/images/profile/prince-parfait-ganza-kigali-rwanda.png"
        ) {
          return PORTRAIT_PATHS?.webp || DEFAULT_PORTRAIT_WEBP;
        }
        return raw;
      })(),
      roles: saved.hero?.roles || settings.siteSubtitle?.split("·").slice(0, 3).join(" · ").trim() || DEFAULT_CONTACT_PAGE.hero.roles,
    },
    cards: {
      ...DEFAULT_CONTACT_PAGE.cards,
      ...saved.cards,
      phoneNote: (() => {
        const note = (saved.cards?.phoneNote || "").trim();
        if (!note || /^Mon\s*[–-]\s*Fri,?\s*8AM\s*[–-]\s*5PM\s*\(EAT\)$/i.test(note)) {
          return DEFAULT_CONTACT_PAGE.cards.phoneNote;
        }
        return note;
      })(),
      followSocialIds: Array.isArray(saved.cards?.followSocialIds)
        ? saved.cards.followSocialIds.slice(0, 6)
        : DEFAULT_CONTACT_PAGE.cards.followSocialIds,
      followSocialLimit: Math.min(
        6,
        Math.max(1, saved.cards?.followSocialLimit ?? DEFAULT_CONTACT_PAGE.cards.followSocialLimit),
      ),
    },
    form: {
      ...DEFAULT_CONTACT_PAGE.form,
      ...saved.form,
      subjects: saved.form?.subjects?.length ? saved.form.subjects : DEFAULT_CONTACT_PAGE.form.subjects,
    },
    media: { ...DEFAULT_CONTACT_PAGE.media, ...saved.media },
    faq: {
      ...DEFAULT_CONTACT_PAGE.faq,
      ...saved.faq,
      viewAllLabel: "",
      viewAllHref: "",
      items: saved.faq?.items?.length ? saved.faq.items : DEFAULT_CONTACT_PAGE.faq.items,
    },
  };
}
