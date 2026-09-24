import {
  certifications,
  education,
  experience,
  primaryNav,
  projects,
  services,
  speakingEngagements,
  blogPosts,
  siteConfig,
} from "@/data/site-data";
import {
  bookingOptionMeta,
  primaryBookingOption,
  type BookingSettingsSlice,
} from "@/lib/booking";

export type SiteSearchGroup =
  | "Quick"
  | "Navigate"
  | "Work"
  | "Experience"
  | "Education"
  | "Certifications"
  | "Services"
  | "Writing"
  | "Speaking";

export type SiteSearchItem = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  group: SiteSearchGroup;
  keywords: string;
  action?: "navigate" | "mailto" | "tel" | "external" | "booking";
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@+.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function reverseWords(value: string) {
  return value.split(/\s+/).reverse().join(" ");
}

export function buildSiteSearchIndex(bookingSettings?: BookingSettingsSlice | null): SiteSearchItem[] {
  const email = siteConfig.contact.email;
  const emailSecondary = siteConfig.contact.emailSecondary || "";
  const phone = "+250 792 054 846";
  const phoneDigits = "250792054846";
  const booking = bookingSettings ? primaryBookingOption(bookingSettings) : null;

  const items: SiteSearchItem[] = [
    {
      id: "quick-about",
      title: siteConfig.name,
      subtitle: "About · software engineer and technology entrepreneur in Kigali",
      href: "/about",
      group: "Quick",
      keywords: [
        siteConfig.name,
        reverseWords(siteConfig.name),
        "prince",
        "parfait",
        "ganza",
        "prince parfait",
        "parfait ganza",
        "ganza parfait",
        "ppg",
        "who is",
        "about",
        "bio",
        "profile",
        "name",
      ].join(" "),
    },
    {
      id: "quick-email",
      title: email,
      subtitle: "Email Prince Parfait GANZA",
      href: `mailto:${email}`,
      group: "Quick",
      action: "mailto",
      keywords: `email mail hello contact ${email}`,
    },
    ...(emailSecondary
      ? [
          {
            id: "quick-email-secondary",
            title: emailSecondary,
            subtitle: "Secondary professional email",
            href: `mailto:${emailSecondary}`,
            group: "Quick" as const,
            action: "mailto" as const,
            keywords: `email mail gmail secondary contact ${emailSecondary}`,
          },
        ]
      : []),
    {
      id: "quick-phone",
      title: phone,
      subtitle: "Call or WhatsApp",
      href: `tel:${phoneDigits}`,
      group: "Quick",
      action: "tel",
      keywords: `phone call whatsapp mobile number tel ${phone} ${phoneDigits} 250792054846 0792054846`,
    },
    {
      id: "quick-contact",
      title: "Contact",
      subtitle: "Start a conversation",
      href: "/contact",
      group: "Quick",
      keywords: "contact reach out message book meeting conversation hello hi",
    },
  ];

  if (booking) {
    items.push({
      id: "quick-booking",
      title: "Book a meeting",
      subtitle: `${booking.durationMinutes}-minute ${booking.meetingType} with Prince Parfait GANZA`,
      href: booking.url,
      group: "Quick",
      action: "booking",
      keywords: [
        "book",
        "booking",
        "meeting",
        "meet",
        "calendar",
        "appointment",
        "call",
        "google meet",
        "schedule",
        "schedule a conversation",
        "video meeting",
        booking.label,
        bookingOptionMeta(booking),
      ].join(" "),
    });
  }

  items.push(
    {
      id: "quick-cv",
      title: "CV / Resume",
      subtitle: "Download or request the résumé",
      href: "/cv",
      group: "Quick",
      keywords: "cv resume curriculum vitae download",
    },
    {
      id: "quick-lerony",
      title: "LERONY Ltd",
      subtitle: "Technology & innovation · Founder & CEO",
      href: "/projects/lerony",
      group: "Quick",
      keywords: "lerony company venture founder ceo business kigali technology innovation",
    },
    {
      id: "nav-home",
      title: "Home",
      subtitle: "Introduction and selected work",
      href: "/",
      group: "Navigate",
      keywords: "home intro portfolio",
    },
    ...primaryNav.map((item) => ({
      id: `nav-${item.href}`,
      title: item.label,
      subtitle: item.href,
      href: item.href,
      group: "Navigate" as const,
      keywords: `${item.label} ${item.href}`,
    })),
    {
      id: "nav-privacy",
      title: "Privacy",
      subtitle: "How information is collected and used",
      href: "/privacy",
      group: "Navigate",
      keywords: "privacy policy data cookies newsletter",
    },
    {
      id: "nav-blog",
      title: "Insights",
      subtitle: "Writing and notes",
      href: "/blog",
      group: "Writing",
      keywords: "blog insights articles writing",
    },
  );

  for (const project of projects) {
    items.push({
      id: `project-${project.id}`,
      title: project.title,
      subtitle: [project.organization, project.myRole].filter(Boolean).join(" · ") || "Case study",
      href: `/projects/${project.id}`,
      group: "Work",
      keywords: [
        project.title,
        project.organization,
        project.description,
        project.technologies?.join(" "),
        project.category,
        project.myRole,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  for (const item of experience) {
    items.push({
      id: `exp-${item.id}`,
      title: item.role,
      subtitle: `${item.organization} · ${item.period}`,
      href: "/experience",
      group: "Experience",
      keywords: `${item.role} ${item.organization} ${item.summary} ${item.highlights.join(" ")} ${item.skills?.join(" ") || ""}`,
    });
  }

  for (const item of education) {
    items.push({
      id: `edu-${item.id}`,
      title: item.program,
      subtitle: `${item.institution} · ${item.period}`,
      href: "/experience",
      group: "Education",
      keywords: `${item.program} ${item.institution} ${item.status} ${item.note || ""}`,
    });
  }

  for (const item of certifications) {
    items.push({
      id: `cert-${item.id}`,
      title: item.title,
      subtitle: `${item.issuer} · ${item.period}`,
      href: item.verifyUrl,
      group: "Certifications",
      action: "external",
      keywords: `${item.title} ${item.issuer} ${item.program} alx certificate`,
    });
  }

  for (const item of services) {
    items.push({
      id: `service-${item.id}`,
      title: item.title,
      subtitle: item.description,
      href: "/services",
      group: "Services",
      keywords: `${item.title} ${item.description} ${item.features.join(" ")}`,
    });
  }

  speakingEngagements.forEach((item, index) => {
    items.push({
      id: `speak-${index}`,
      title: item.title,
      subtitle: `${item.event} · ${item.location}`,
      href: "/#speaking",
      group: "Speaking",
      keywords: `${item.title} ${item.event} ${item.topic} training speaking`,
    });
  });

  for (const post of blogPosts) {
    items.push({
      id: `blog-${post.slug}`,
      title: post.title,
      subtitle: post.excerpt || "Article",
      href: `/blog/${post.slug}`,
      group: "Writing",
      keywords: `${post.title} ${post.excerpt || ""} ${(post.tags || []).join(" ")}`,
    });
  }

  return items;
}

export function searchSiteIndex(
  query: string,
  limit = 12,
  bookingSettings?: BookingSettingsSlice | null,
): SiteSearchItem[] {
  const needle = normalize(query);
  const index = buildSiteSearchIndex(bookingSettings);
  if (!needle) {
    return index
      .filter((item) => item.group === "Quick" || item.group === "Navigate" || item.group === "Work")
      .slice(0, limit);
  }

  const scored = index
    .map((item) => {
      const hay = normalize(`${item.title} ${item.subtitle || ""} ${item.keywords}`);
      let score = 0;
      if (hay === needle) score += 120;
      if (normalize(item.title) === needle) score += 100;
      if (normalize(item.title).startsWith(needle)) score += 70;
      if (hay.includes(needle)) score += 45;
      if (item.group === "Quick" && hay.includes(needle)) score += 25;
      for (const part of needle.split(" ")) {
        if (part.length >= 2 && hay.includes(part)) score += 10;
      }
      if (/^\+?\d[\d\s-]{3,}$/.test(query.trim()) && hay.replace(/\s/g, "").includes(needle.replace(/\s/g, ""))) {
        score += 50;
      }
      return { item, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  return scored.slice(0, limit).map((row) => row.item);
}
