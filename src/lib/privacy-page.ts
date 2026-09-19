export type PrivacyPromiseIcon = "lock" | "user" | "shield" | "clock";
export type PrivacyCollectIcon = "mail" | "news" | "cv" | "chart";
export type PrivacySectionIcon =
  | "person"
  | "folder"
  | "check"
  | "cloud"
  | "cookie"
  | "archive"
  | "choice"
  | "refresh";

export type PrivacyPageContent = {
  label: string;
  title: string;
  subtitle: string;
  lead: string;
  updatedLabel: string;
  updatedDate: string;
  asideTitle: string;
  asideBody: string;
  promises: { icon: PrivacyPromiseIcon; text: string }[];
  sections: {
    n: string;
    icon: PrivacySectionIcon;
    title: string;
    body?: string;
    bullets?: string[];
    collectCards?: { icon: PrivacyCollectIcon; title: string; body: string }[];
    pills?: string[];
  }[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaLabel: string;
  ctaHref: string;
};

export const DEFAULT_PRIVACY_PAGE: PrivacyPageContent = {
  label: "Legal",
  title: "Privacy Policy",
  subtitle: "Clear, simple and transparent.",
  lead:
    "This page explains what information princeparfait.com collects, why it is collected, and how to reach Prince Parfait GANZA about it. It is written for a personal portfolio — not as a substitute for formal legal advice.",
  updatedLabel: "Last updated",
  updatedDate: "19 September 2026",
  asideTitle: "Your privacy matters",
  asideBody: "I only collect what is needed to respond, improve this site, and keep it secure — never to sell your data.",
  promises: [
    { icon: "lock", text: "I don't sell your data." },
    { icon: "user", text: "I only collect what is necessary." },
    { icon: "shield", text: "Your information is handled securely." },
    { icon: "clock", text: "You can contact me about your data anytime." },
  ],
  sections: [
    {
      n: "01",
      icon: "person",
      title: "Who is responsible?",
      body:
        "This site is operated by Prince Parfait GANZA (Kigali, Rwanda). For privacy questions, email hello@princeparfait.com.",
    },
    {
      n: "02",
      icon: "folder",
      title: "Information I may collect",
      collectCards: [
        {
          icon: "mail",
          title: "Contact messages",
          body: "Name, email, and the message you send through the contact form.",
        },
        {
          icon: "news",
          title: "Newsletter / updates",
          body: "Email address when you subscribe to Stay Updated.",
        },
        {
          icon: "cv",
          title: "CV access requests",
          body: "Details you submit when requesting a résumé download.",
        },
        {
          icon: "chart",
          title: "Site analytics",
          body: "Basic page-view signals such as path, device class, and approximate location.",
        },
      ],
    },
    {
      n: "03",
      icon: "check",
      title: "How I use the information",
      bullets: [
        "To respond to inquiries and collaboration requests",
        "To send occasional updates only if you subscribed",
        "To understand which public pages are useful",
        "To protect the site and diagnose technical problems",
        "I do not sell personal information",
      ],
    },
    {
      n: "04",
      icon: "cloud",
      title: "Third-party services",
      body: "These services help run the site when configured:",
      pills: [
        "Hosting & Deployment",
        "Database / Backend",
        "Email / Contact Forms",
        "Fonts & Media",
        "Security & Monitoring",
        "Optional booking (Google Calendar)",
      ],
    },
    {
      n: "05",
      icon: "cookie",
      title: "Cookies and local storage",
      bullets: [
        "Theme preference stored in your browser",
        "Intro / announcement dismissals may be stored locally",
        "An admin session cookie is used only after dashboard login",
        "Third-party embeds may set their own cookies when you open those services",
      ],
    },
    {
      n: "06",
      icon: "archive",
      title: "Data retention",
      body:
        "Contact and subscriber records are kept while useful for communication or as required for security. Analytics may be aggregated or deleted from the dashboard. Email hello@princeparfait.com to request deletion.",
    },
    {
      n: "07",
      icon: "choice",
      title: "Your rights and choices",
      bullets: [
        "Do not submit forms you are uncomfortable with",
        "Unsubscribe or email to remove a newsletter address",
        "Clear site data in your browser to reset theme and local dismissals",
        "Use the contact page for any privacy request",
      ],
    },
    {
      n: "08",
      icon: "refresh",
      title: "Changes to this policy",
      body:
        "This notice may be updated as the site evolves. The “Last updated” date at the top will change when material updates are published.",
    },
  ],
  ctaEyebrow: "Questions about privacy?",
  ctaTitle: "I'm here to help.",
  ctaBody: "If you have questions about how information is handled on this site, feel free to reach out.",
  ctaLabel: "Contact me",
  ctaHref: "/contact",
};

function mergeSection(
  base: PrivacyPageContent["sections"][number],
  saved?: Partial<PrivacyPageContent["sections"][number]>,
): PrivacyPageContent["sections"][number] {
  if (!saved) return base;
  return {
    ...base,
    ...saved,
    bullets: saved.bullets?.length ? saved.bullets : base.bullets,
    collectCards: saved.collectCards?.length ? saved.collectCards : base.collectCards,
    pills: saved.pills?.length ? saved.pills : base.pills,
  };
}

export function privacyPageFrom(settings?: { privacyPage?: PrivacyPageContent } | null): PrivacyPageContent {
  const saved = settings?.privacyPage;
  if (!saved) return DEFAULT_PRIVACY_PAGE;
  return {
    ...DEFAULT_PRIVACY_PAGE,
    ...saved,
    promises: saved.promises?.length ? saved.promises : DEFAULT_PRIVACY_PAGE.promises,
    sections: DEFAULT_PRIVACY_PAGE.sections.map((section, index) =>
      mergeSection(section, saved.sections?.[index]),
    ),
  };
}
