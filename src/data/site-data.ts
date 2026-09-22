// ============================================================
// Site Data — Prince Parfait GANZA
// Source of truth for public copy: docs/PORTFOLIO_CONTEXT.md
// Canonical identity: src/lib/identity.ts
// Do not invent clients, results, titles, dates, or testimonials.
// ============================================================

import {
  CANONICAL_NAME,
  COMPANY_ROLE,
  IDENTITY_COMPACT_BIO,
  IDENTITY_DESCRIPTION,
  IDENTITY_PAGE_TITLE,
  IDENTITY_PORTRAIT_ALT,
  IDENTITY_POSITIONING,
  IDENTITY_ROLE_LINE,
  IDENTITY_SHORT_BIO,
  LINKEDIN_HEADLINE,
  SPECIALIZATIONS,
} from "@/lib/identity";

export const identity = {
  name: CANONICAL_NAME,
  roleLine: IDENTITY_ROLE_LINE,
  companyRole: COMPANY_ROLE,
  linkedInHeadline: LINKEDIN_HEADLINE,
  positioning: IDENTITY_POSITIONING,
  pageTitle: IDENTITY_PAGE_TITLE,
  description: IDENTITY_DESCRIPTION,
  shortBio: IDENTITY_SHORT_BIO,
  compactBio: IDENTITY_COMPACT_BIO,
  portraitAlt: IDENTITY_PORTRAIT_ALT,
  specializations: SPECIALIZATIONS,
} as const;

export const siteConfig = {
  name: "Prince Parfait GANZA",
  title: identity.pageTitle,
  description: identity.description,
  tagline: identity.positioning,
  positioning: identity.roleLine,
  shortIntro: identity.shortBio,
  compactIntro: identity.compactBio,
  portraitAlt: identity.portraitAlt,
  url: "https://www.princeparfait.com",
  ogImage: "/images/og/seo-share-image.jpg",
  locale: "en_US",
  keywords: [
    "Prince Parfait GANZA",
    "Prince Parfait Ganza",
    "Prince Parfait",
    "Software Engineer Kigali",
    "Software engineer Rwanda",
    "Software engineer in Kigali",
    "Technology entrepreneur Rwanda",
    "Tech founder Kigali",
    "Founder LERONY Ltd",
    "LERONY founder",
    "LERONY Ltd CEO",
    "Research technology Rwanda",
    "Digital data collection Kigali",
    "Survey programming Rwanda",
    "XLSForm Rwanda",
    "Digital data collection Kigali",
    "CAPI survey Rwanda",
    "Data systems Kigali",
    "Indicator management systems",
    "Business systems Rwanda",
    "Full-stack developer Kigali",
    "Organizational reporting systems",
    "AskField survey platform",
    "Caritas Rwanda systems",
    "princeparfait.com",
  ],
  social: {
    github: "https://github.com/GanzaParfait",
    linkedin: "https://www.linkedin.com/in/prince-parfait-ganza",
    twitter: "https://x.com/prince_parfait1",
    youtube: "https://youtube.com/@prince_parfait",
    instagram: "https://www.instagram.com/_prince_parfait_",
    tiktok: "https://tiktok.com/@_prince_parfait_",
    threads: "https://www.threads.com/@_prince_parfait_",
    luma: "https://luma.com/user/princeparfait",
    buymeacoffee: "https://buymeacoffee.com/_prince_parfait_",
    whatsapp: "https://wa.me/250792054846",
  },
  contact: {
    email: "hello@princeparfait.com",
    location: "Kigali, Rwanda",
    whatsapp: "https://wa.me/250792054846",
  },
  company: {
    name: "LERONY Ltd",
    url: "https://lerony.com",
    role: "Founder & CEO",
    established: "2025",
    location: "Kigali, Rwanda",
    summary:
      "A Rwanda-based technology and innovation company building practical solutions that help organizations, businesses, and communities operate better, grow, and prepare for the future.",
  },
};

export const primaryNav = [
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export const footerNav = [
  {
    label: "Explore",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/projects" },
      { label: "Experience", href: "/experience" },
      { label: "Services", href: "/services" },
      { label: "CV / Resume", href: "/cv?source=footer" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export const defaultFooterQuote = {
  text: "Build things people can actually use.",
  attribution: "Prince Parfait GANZA",
} as const;

export type ProjectCollaborator = {
  name: string;
  role?: string;
};

export type ProjectVisibility = "public" | "unlisted" | "draft";

export type Project = {
  id: string;
  title: string;
  organization?: string;
  /** Public organization / client site when distinct from the product live URL. */
  organizationUrl?: string;
  description: string;
  longDescription?: string;
  context?: string;
  challenge?: string;
  solution?: string;
  problem?: string;
  whatIBuilt?: string;
  technologies: string[];
  /** Capability labels demonstrated by this evidence (not identity titles). */
  capabilities?: string[];
  /** Tech stack for the company website or a specific software product — not the company identity. */
  websiteTechnologies?: string[];
  myRole?: string;
  /** Capability domain for evidence pages (e.g. Research Technology) — not a job title. */
  domain?: string;
  /** Commercial / delivery vehicle (e.g. LERONY Ltd) when distinct from the client. */
  deliveredThrough?: string;
  /** Concise factual explanation of Prince's personal contribution. */
  contributionSummary?: string;
  collaborators?: ProjectCollaborator[];
  /** Client / market geography when useful (e.g. Des Moines, Iowa, United States). */
  market?: string;
  outcome?: string;
  result?: string;
  screenshots?: string[];
  category: "web" | "mobile" | "ai" | "saas" | "technology" | "open-source" | "systems" | "product" | "other";
  categoryNote?: string;
  /** Delivery status of the product/system. */
  status: "live" | "in-progress" | "archived" | "staging" | "completed" | "ongoing";
  /** Portfolio visibility. Draft/unlisted stay out of public indexes. Defaults to public. */
  visibility?: ProjectVisibility;
  /** Work-page evidence group (not a job title). */
  workGroup?: "ventures" | "client" | "research" | "web";
  featured: boolean;
  independent?: boolean;
  links: {
    /** Canonical public product/client URL (no tracking params). */
    live?: string;
    /** Public repository only — never private repos. */
    github?: string;
    case_study?: string;
  };
  seoTitle?: string;
  seoDescription?: string;
  image?: string;
  logo?: string;
  /** Prefer these media URLs (images and/or videos) for homepage + card previews. Aim for ≥3. */
  pinnedMedia?: string[];
  video?: string;
  videos?: string[];
  videoPoster?: string;
  documents?: string[];
  tagline?: string;
  highlights?: string[];
  features?: string[];
  learned?: string;
  quote?: string;
  quoteBy?: string;
  caseStudyFile?: string;
  screenshotCaptions?: string[];
  flourish?: string;
  year?: number;
  period?: string;
  contribution?: "creator" | "contributor";
  /** When true on /projects, the card spans the full row (details left, media right). */
  wide?: boolean;
  /** full = 100% width banner card; half = one cell in a 2-column grid. */
  cardSpan?: "full" | "half";
};

export const projects: Project[] = [
  {
    id: "lerony",
    title: "LERONY Ltd",
    organization: "LERONY Ltd",
    description:
      "A Rwanda-based technology and innovation company building practical solutions that help organizations, businesses, and communities operate better, grow, and prepare for the future.",
    longDescription:
      "LERONY Ltd is a technology and innovation company founded in Kigali, Rwanda in 2025. The company works with organizations, businesses, and communities to understand real challenges and create practical, scalable solutions through technology, innovation, strategy, and implementation. Its work can include digital solutions, smart systems, business transformation, software and platforms, AI-enabled solutions, technology consulting, and emerging technologies. LERONY is not defined by a single technology, product, or service category; its focus is using the right technologies and approaches to solve meaningful problems and create long-term value. This personal website presents the founder's journey and role in building LERONY, while lerony.com represents the company itself.",
    context:
      "Organizations and businesses are navigating changing technology, growing operational complexity, and increasing expectations for efficient, connected, and future-ready services.",
    challenge:
      "Many organizations have valuable ideas and important operational needs but lack the right combination of technology, strategy, systems, and implementation capacity to turn them into effective solutions.",
    solution:
      "LERONY brings together technology, innovation, strategy, and implementation to design and build solutions around real organizational and business needs.",
    problem:
      "Organizations need technology and innovation partners capable of understanding real challenges and turning them into practical, scalable, and sustainable solutions.",
    whatIBuilt:
      "Founded LERONY Ltd as a Rwanda-based technology and innovation company focused on creating practical solutions and building what comes next.",
    myRole: "Founder & CEO",
    outcome:
      "Established LERONY Ltd as an independent technology and innovation company serving organizations and businesses through a growing range of technology, digital, strategic, and innovation capabilities.",
    capabilities: [
      "Technology & Innovation",
      "Digital Solutions",
      "Smart Systems",
      "Business Transformation",
      "Software & Platforms",
      "AI-Enabled Solutions",
      "Technology Strategy & Consulting",
      "Emerging Technologies",
    ],
    websiteTechnologies: ["Next.js", "TypeScript", "React", "Node.js", "Supabase"],
    technologies: ["Next.js", "TypeScript", "React", "Node.js", "Supabase"],
    category: "technology",
    workGroup: "ventures",
    status: "live",
    featured: true,
    period: "2025–Present",
    year: 2025,
    logo: "/images/projects/logos/lerony.png",
    image: "/images/projects/lerony/lerony-wide.jpg",
    pinnedMedia: [
      "/images/projects/lerony/lerony-wide.jpg",
      "/images/projects/lerony/lerony-portrait.jpg",
      "/images/projects/logos/lerony.png",
    ],
    screenshots: [
      "/images/projects/lerony/lerony-wide.jpg",
      "/images/projects/lerony/lerony-portrait.jpg",
    ],
    links: {
      live: "https://lerony.com",
    },
  },
  {
    id: "caritas-systems",
    title: "Caritas Rwanda Information Systems",
    organization: "Caritas Rwanda",
    description:
      "Organization-wide indicator management and decision-support systems for reporting, dashboards and information management.",
    longDescription:
      "Work for Caritas Rwanda on internal digital systems used for organizational indicators, reporting and information management. The systems support role-based access, dashboards, data management, exports and administrative workflows, helping programme and operations teams see what is happening and report reliably.",
    context: "Caritas Rwanda needed digital systems for organizational indicator tracking and decision-oriented reporting.",
    challenge:
      "Humanitarian and organizational reporting depends on reliable indicators, controlled access, disaggregated views and repeatable administrative workflows.",
    solution:
      "Indicator and information-management functionality including dashboards, role-based access, reporting, exports and administration.",
    problem:
      "Organizational indicator and information-management work required structured digital systems rather than fragmented records.",
    whatIBuilt:
      "Digital systems covering role-based access, indicator tracking, dashboards, reporting, data management, exports and administrative workflows.",
    myRole: "Software engineer",
    domain: "Data Systems, Analytics & Decision Support",
    deliveredThrough: "Engagement work",
    contributionSummary:
      "Software engineering contribution to organization-wide indicator management and decision-support systems (CRNIS).",
    technologies: ["Web platforms", "Indicators", "Dashboards", "Reporting", "Role-based access"],
    category: "systems",
    workGroup: "research",
    status: "live",
    visibility: "public",
    featured: true,
    wide: true,
    cardSpan: "full",
    flourish: "Data People Impact",
    highlights: [
      "Role-based access control",
      "Indicators management",
      "Data collection",
      "Dashboards and reporting",
      "Export to Excel/PDF",
      "Administrative workflows",
    ],
    features: [
      "Role-based access for staff and administrators",
      "Indicator tracking and organizational reporting",
      "Dashboards for programme and operations overview",
      "Data collection and validation workflows",
      "Excel and PDF exports",
      "Administrative configuration and user management",
    ],
    learned:
      "Operational systems succeed when access control, reporting, and day-to-day data entry are designed as one workflow, not as separate tools.",
    period: "Engagement work for Caritas Rwanda",
    logo: "/images/projects/logos/caritas-rwanda.png",
    image: "/images/projects/caritas-systems.webp",
    pinnedMedia: [
      "/images/projects/caritas-systems.webp",
      "/images/projects/caritas-systems.webp",
      "/images/projects/caritas-systems.webp",
    ],
    screenshots: [
      "/images/projects/caritas-systems.webp",
      "/images/projects/caritas-systems.webp",
      "/images/projects/caritas-systems.webp",
      "/images/projects/caritas-systems.webp",
    ],
    screenshotCaptions: [
      "Dashboard overview",
      "Reports & analytics",
      "Indicators workspace",
      "Administration",
    ],
    links: {
      live: "https://crnis.caritasrwanda.org/",
    },
  },
  {
    id: "stockpro",
    title: "StockPro",
    organization: "Business operations",
    description:
      "Inventory and sales management system covering stock, invoicing, clients, suppliers, and reporting.",
    longDescription:
      "StockPro is an inventory and sales management system designed around everyday business operations: products, stock movement, invoices, proformas, transfers, adjustments, suppliers, clients, debts, payments, serial tracking, and reports.",
    context: "Businesses need a single system for inventory, sales documents, and related financial follow-up.",
    challenge:
      "Stock, invoicing, supplier, and client records often live in separate spreadsheets, which makes reporting and debt tracking difficult.",
    solution:
      "An operations system for products, stock in/out, invoices, proformas, transfers, adjustments, suppliers, clients, debts, payments, serial tracking, and reports.",
    problem:
      "Inventory and sales operations needed a structured system rather than disconnected records.",
    whatIBuilt:
      "Inventory and sales management workflows spanning stock, documents, parties, payments, and reporting.",
    myRole: "Software engineer",
    technologies: ["Web application", "MySQL", "Business workflows", "Reporting"],
    category: "product",
    workGroup: "client",
    status: "live",
    featured: true,
    wide: true,
    cardSpan: "full",
    flourish: "Data People Impact",
    highlights: [
      "Stock and inventory movement",
      "Invoicing and proformas",
      "Clients and suppliers",
      "Debts and payments",
      "Serial tracking",
      "Operational reports",
    ],
    features: [
      "Product and stock movement (in/out)",
      "Invoices and proformas",
      "Transfers and adjustments",
      "Suppliers, clients, debts, and payments",
      "Serial tracking",
      "Operational reports",
    ],
    learned:
      "Inventory products succeed when stock, documents, and party records stay in one operational loop.",
    logo: "/images/projects/logos/stockpro.png",
    image: "/images/projects/stockpro.webp",
    pinnedMedia: [
      "/images/projects/stockpro.webp",
      "/images/projects/stockpro.webp",
      "/images/projects/stockpro.webp",
    ],
    screenshots: [
      "/images/projects/stockpro.webp",
      "/images/projects/stockpro.webp",
      "/images/projects/stockpro.webp",
      "/images/projects/stockpro.webp",
    ],
    screenshotCaptions: [
      "Dashboard overview",
      "Sales analytics",
      "Stock by brand",
      "Operations workspace",
    ],
    links: {},
  },
  {
    id: "psta-accounting",
    title: "PSTA Ticket Accounting System",
    organization: "PSTA",
    description:
      "Software for airline ticket records, invoicing, commission reporting, authentication, and activity tracking.",
    longDescription:
      "A software system associated with airline ticket and accounting workflows. Developed capabilities include ticket records, invoicing, commission reporting, authentication and security, and activity tracking. This is distinct from the earlier Reservation Agent operations role at PSTA.",
    context: "Airline ticket and accounting work requires a reliable record of tickets, invoices, and commissions.",
    challenge:
      "Ticket accounting and commission reporting need controlled access and a traceable activity history.",
    solution:
      "A system covering ticket records, invoicing, commission reporting, authentication, and activity tracking.",
    problem:
      "Airline ticket and accounting workflows needed structured digital records.",
    whatIBuilt:
      "Ticket records, invoicing, commission reporting, authentication/security functionality, and activity tracking.",
    myRole: "Software engineer",
    technologies: ["Web application", "Authentication", "Reporting", "Operational records"],
    category: "systems",
    workGroup: "client",
    status: "live",
    featured: true,
    period: "Associated with 2023–2024 PSTA work",
    image: "/images/projects/psta.webp",
    screenshots: [
      "/images/projects/psta.webp",
      "/images/projects/psta.webp",
      "/images/projects/psta.webp",
    ],
    screenshotCaptions: ["Ticket records", "Invoicing", "Commission reporting"],
    links: {},
  },
  {
    id: "caritas-website",
    title: "Caritas Rwanda Website Revamp",
    organization: "Caritas Rwanda",
    description:
      "Website revamp and public digital presence work for Caritas Rwanda.",
    longDescription:
      "Public-facing website work for Caritas Rwanda, treated separately from the internal indicator and information-management systems (CRNIS).",
    context: "Caritas Rwanda needed a renewed public website alongside its internal systems work.",
    challenge: "The public website and internal information systems serve different audiences and should not be conflated.",
    solution: "Website revamp / digital work for the public-facing Caritas Rwanda presence.",
    problem: "The public digital presence required a website revamp distinct from internal systems.",
    whatIBuilt: "Website revamp and related public digital work.",
    myRole: "Software engineer",
    domain: "Software Engineering & Digital Systems",
    deliveredThrough: "Engagement work",
    contributionSummary: "Software engineering contribution to the public website revamp, kept separate from CRNIS internal systems work.",
    technologies: ["Web", "Content", "Frontend"],
    category: "web",
    workGroup: "web",
    status: "live",
    visibility: "public",
    featured: false,
    image: "/images/projects/caritas-website.webp",
    screenshots: ["/images/projects/caritas-website.webp"],
    links: {
      live: "https://new.caritasrwanda.org/",
    },
  },
  {
    id: "askfield",
    title: "AskField",
    organization: "Ethical Research Solutions / AskField",
    description:
      "Research technology platform for digital surveys and data collection. Frontend integration expanding into broader research workflows.",
    longDescription:
      "Team contribution to AskField, Ethical Research Solutions’ survey and digital data-collection platform. Official role: Frontend Integrator. The work grew from frontend and API integration into hands-on research-technology practice across survey programming, questionnaire logic and validations, XLSForm, CAPI / CATI / CAWI collection modes, GPS/geolocation-based collection, enumerator assignment, field operations, response monitoring, data export and research data management. This describes capabilities demonstrated through the platform, not sole product ownership or invention of every AskField feature.",
    context:
      "AskField supports organizations that need structured digital surveys and reliable research data collection. Work was performed as part of Ethical Research Solutions / the product team.",
    challenge:
      "Research programmes need production workflows that connect questionnaire design, multi-mode collection (field, phone, web), monitoring and usable research data, not only a static form UI.",
    solution:
      "Frontend and API-backed product work alongside deeper survey programming and research-data workflows used in production collection environments.",
    problem:
      "The survey platform required strong product interfaces connected to real research-collection workflows.",
    whatIBuilt:
      "Frontend interfaces and API integration, plus support for survey programming, digital collection operations and research-data handling on the platform.",
    myRole: "Frontend Integrator (Research Technology Platform, team contribution)",
    domain: "Research Technology & Digital Data Collection",
    technologies: [
      "React",
      "Redux",
      "API integration",
      "XLSForm",
      "CAPI",
      "CATI",
      "CAWI",
      "GPS / geolocation",
    ],
    category: "web",
    workGroup: "research",
    status: "live",
    featured: true,
    contribution: "contributor",
    highlights: [
      "Survey programming and questionnaire logic",
      "Validations, skip logic and structured forms",
      "CAPI, CATI and CAWI collection workflows",
      "GPS-enabled collection and enumerator assignment",
      "Field operations, monitoring and data export",
    ],
    features: [
      "Digital survey and research-collection UI",
      "API-backed frontend integration",
      "XLSForm and questionnaire implementation practice",
      "Multi-mode collection workflows (CAPI / CATI / CAWI)",
      "Field operations and research-data management support",
    ],
    logo: "/images/projects/logos/askfield.webp",
    image: "/images/projects/askfield.webp",
    screenshots: [
      "/images/projects/askfield.webp",
      "/images/projects/askfield.webp",
      "/images/projects/askfield.webp",
    ],
    screenshotCaptions: ["Survey workspace", "Data collection", "Research workflows"],
    links: {},
  },
  {
    id: "gotallnews",
    title: "GotAllNews",
    organization: "Independent product",
    description:
      "Independent digital media product covering publishing, articles, video, accounts, and engagement.",
    longDescription:
      "GotAllNews is an independent digital media and product-development project. Relevant work includes content management, articles, video, short-form media, recommendation concepts, user accounts, engagement features, and publishing workflows. This is experimental/product work, distinct from commercially deployed client systems.",
    context: "An independent media product exploring publishing workflows and audience engagement.",
    challenge:
      "Publishing articles, video, and short-form media in one product requires accounts, workflows, and engagement features.",
    solution:
      "A media platform with content management, publishing workflows, user accounts, and engagement concepts.",
    problem:
      "Needed a product environment for articles, video, short-form media, and publishing workflows.",
    whatIBuilt:
      "Product work across CMS, articles, video, short-form media, recommendation concepts, accounts, engagement, and publishing.",
    myRole: "Independent product development",
    technologies: ["React", "PHP", "MySQL", "Content management"],
    category: "web",
    workGroup: "ventures",
    status: "in-progress",
    featured: false,
    independent: true,
    logo: "/images/projects/logos/gotallnews.png",
    image: "/images/projects/gotallnews.webp",
    screenshots: [
      "/images/projects/gotallnews.webp",
      "/images/projects/gotallnews.webp",
      "/images/projects/gotallnews.webp",
    ],
    screenshotCaptions: ["Publishing workspace", "Articles", "Media engagement"],
    links: {},
  },
  {
    id: "apn-african-marketplace",
    title: "APN African Marketplace",
    organization: "APN African Marketplace",
    organizationUrl: "https://apnafricanmarket.com/",
    description:
      "E-commerce web platform for African heritage and fashion products: catalog, accounts and checkout workflows.",
    longDescription:
      "Client e-commerce platform for APN African Marketplace. The public site presents authentic African heritage and fashion products with shop, account, wishlist and cart experiences. Delivered commercially through LERONY Ltd. Prince Parfait GANZA’s contribution was direct design and development of the web platform.",
    context:
      "A United States–based client (Des Moines, Iowa) needed a production marketplace experience for African heritage and fashion goods.",
    challenge:
      "Marketplace buyers need a reliable catalog, account flows and payment-capable checkout across an international client relationship.",
    solution:
      "A React/Next.js web platform with product catalog experiences, cloud media, backend/data services, API integrations and international payment workflows.",
    whatIBuilt:
      "Direct design and development of the web platform, with the engagement delivered commercially through LERONY Ltd.",
    myRole: "Lead Developer",
    domain: "E-commerce",
    deliveredThrough: "LERONY Ltd",
    contributionSummary: "Direct design/development and technical delivery of the web platform.",
    contribution: "creator",
    market: "Des Moines, Iowa, United States",
    capabilities: [
      "E-commerce / web engineering",
      "Product catalog experiences",
      "Cloud media",
      "Backend & data services",
      "API integrations",
      "International payment workflows",
    ],
    technologies: ["React", "Next.js", "Supabase", "Cloudinary", "REST APIs", "Stripe"],
    category: "web",
    workGroup: "web",
    status: "live",
    visibility: "public",
    featured: true,
    year: 2025,
    highlights: [
      "Product catalog and shop experience",
      "Account, wishlist and cart flows",
      "Cloud media for product imagery",
      "International payment integration",
    ],
    features: [
      "Public marketplace storefront",
      "Product browsing and cart",
      "Customer account entry points",
      "Cloud-hosted product media",
      "Payment-capable checkout integration",
    ],
    outcome:
      "A live marketplace at apnafricanmarket.com presenting catalog, account and cart experiences for the client’s audience.",
    links: {
      live: "https://apnafricanmarket.com/",
    },
  },
  {
    id: "wakow-general",
    title: "WAKOW General Ltd",
    organization: "WAKOW General Ltd",
    organizationUrl: "https://wakowgeneral.com/en",
    description:
      "Digital presence for WAKOW General Ltd spanning brand/logo work, website implementation, SEO and Google Business Profile setup.",
    longDescription:
      "Client engagement delivered through LERONY Ltd covering brand identity (logo), website implementation, search visibility foundations and Google Business Profile setup: one coherent digital delivery path rather than a single brochure page.",
    context: "WAKOW General Ltd needed a coherent public digital presence spanning brand and website.",
    challenge:
      "Brand, website, local discovery and basic SEO often launch as disconnected pieces; this engagement kept them in one delivery path.",
    solution:
      "Brand/logo work, website implementation, SEO foundations and Google Business Profile setup as one engagement.",
    whatIBuilt:
      "Branding/logo work, website implementation, SEO and Google Business Profile setup.",
    myRole: "Developer / Digital Delivery",
    domain: "Corporate Web",
    deliveredThrough: "LERONY Ltd",
    contributionSummary:
      "Branding/logo work, website implementation, SEO and Google Business Profile setup.",
    contribution: "creator",
    capabilities: [
      "Brand & logo",
      "Website implementation",
      "SEO foundations",
      "Google Business Profile setup",
    ],
    technologies: ["Web", "SEO", "Google Business Profile"],
    category: "web",
    workGroup: "web",
    status: "live",
    visibility: "public",
    featured: false,
    highlights: [
      "Brand/logo through to live website",
      "SEO foundations for discovery",
      "Google Business Profile setup",
    ],
    features: [
      "Public multilingual website presence",
      "Brand identity assets",
      "On-site SEO foundations",
      "Google Business Profile configuration",
    ],
    outcome: "Live public presence at wakowgeneral.com with brand and discovery foundations in place.",
    links: {
      live: "https://wakowgeneral.com/en",
    },
  },
  {
    id: "ngazi-construction",
    title: "NGAZI Construction",
    organization: "NGAZI Construction",
    organizationUrl: "https://www.ngaziconstruction.com/",
    description:
      "Corporate website for NGAZI Construction, delivered through LERONY Ltd. Prince supported technical delivery through testing, deployment, hosting and bug review.",
    longDescription:
      "Client website engagement delivered through LERONY Ltd for NGAZI Construction. Prince Parfait GANZA’s verified contribution is technical delivery support: testing, deployment, hosting configuration and technical/bug review. This record does not claim that he personally built the complete application.",
    context: "NGAZI Construction needed a public corporate web presence delivered through LERONY Ltd.",
    challenge:
      "Team-delivered websites need clear boundaries between commercial delivery and individual contribution.",
    solution:
      "Supported technical delivery for a live corporate site (deployment, hosting, testing and review) without presenting personal authorship of the full build.",
    whatIBuilt:
      "Testing, deployment, hosting configuration and technical/bug review for the NGAZI Construction website.",
    myRole: "Technical Delivery",
    domain: "Corporate Web",
    deliveredThrough: "LERONY Ltd",
    contributionSummary:
      "Supported technical delivery through deployment, hosting configuration, testing and bug review.",
    contribution: "contributor",
    capabilities: ["Deployment & hosting", "Testing", "Technical / bug review"],
    technologies: ["Web", "Hosting"],
    category: "web",
    workGroup: "client",
    status: "live",
    visibility: "public",
    featured: false,
    highlights: [
      "Deployment and hosting configuration",
      "Testing and technical review",
      "Delivered through LERONY Ltd",
    ],
    outcome: "Live corporate site at ngaziconstruction.com.",
    links: {
      live: "https://www.ngaziconstruction.com/",
    },
  },
  {
    id: "julia-foundation",
    title: "Julia Foundation",
    organization: "Julia Foundation",
    organizationUrl: "https://juliafoundation.org/",
    description:
      "NGO website and digital presence with donation enablement for an emerging Rwandan foundation.",
    longDescription:
      "Website/platform developed for Julia Foundation (emerging NGO / nonprofit digital infrastructure). Includes public storytelling for programmes and donation workflows that support relevant Rwanda payment channels such as MTN Mobile Money, Airtel Money and card/banking options where implemented. No private account numbers, merchant secrets or credentials are published here.",
    context: "An emerging NGO needed a public platform and donation pathways supporters can actually use.",
    challenge:
      "Nonprofit sites fail when storytelling is disconnected from practical local payment options supporters trust.",
    solution:
      "A public foundation website with programme storytelling and donation enablement for Rwanda-relevant payment channels.",
    whatIBuilt:
      "Direct website/platform development and donation/payment enablement for local mobile-money and card/banking channels where implemented.",
    myRole: "Lead Developer",
    domain: "NGO / Nonprofit Digital Infrastructure",
    deliveredThrough: "LERONY Ltd",
    contributionSummary:
      "Direct website/platform development and donation/payment enablement.",
    contribution: "creator",
    market: "Rwanda",
    capabilities: [
      "NGO / nonprofit websites",
      "Donation enablement",
      "Rwanda mobile-money payment support",
      "Programme storytelling",
    ],
    technologies: ["Web", "Frontend", "Donation payments", "MTN Mobile Money", "Airtel Money"],
    category: "web",
    workGroup: "web",
    status: "live",
    visibility: "public",
    featured: true,
    highlights: [
      "Nonprofit public platform",
      "Donation workflows with local payment channels",
      "Programme and community storytelling",
    ],
    features: [
      "Public foundation website",
      "Programme pages and storytelling",
      "Donation entry points",
      "Support for MTN Mobile Money, Airtel Money and card/banking where implemented",
    ],
    outcome: "Live foundation presence at juliafoundation.org with donation pathways for supporters.",
    links: {
      live: "https://juliafoundation.org/",
    },
  },
  {
    id: "la-fontaine",
    title: "La Fontaine",
    organization: "La Fontaine",
    organizationUrl: "https://fontaine03.org/index.php",
    description:
      "Client website delivered through LERONY Ltd. Prince supported testing, deployment, hosting and technical review.",
    longDescription:
      "Client website engagement delivered through LERONY Ltd. Prince Parfait GANZA’s verified contribution covers testing, deployment, hosting and technical/bug review. The portfolio does not claim personal authorship of the complete site.",
    context: "Client needed a public website delivered through LERONY Ltd.",
    challenge:
      "Commercial delivery through a company team must stay distinct from personal full-build claims.",
    solution:
      "Technical delivery support on hosting, deployment, testing and review for the live public site.",
    whatIBuilt:
      "Testing, deployment, hosting and technical/bug review for the La Fontaine website.",
    myRole: "Technical Delivery",
    domain: "Corporate Web",
    deliveredThrough: "LERONY Ltd",
    contributionSummary:
      "Testing, deployment, hosting and technical review for the live website.",
    contribution: "contributor",
    capabilities: ["Deployment & hosting", "Testing", "Technical review"],
    technologies: ["Web", "Hosting", "PHP"],
    category: "web",
    workGroup: "client",
    status: "live",
    visibility: "public",
    featured: false,
    highlights: [
      "Deployment and hosting support",
      "Testing and technical review",
      "Delivered through LERONY Ltd",
    ],
    outcome: "Public site referenced at fontaine03.org.",
    links: {
      live: "https://fontaine03.org/index.php",
    },
  },
  {
    id: "kt-computer-supplying",
    title: "KT Computer Supplying Ltd",
    organization: "KT Computer Supplying Ltd",
    organizationUrl: "https://www.ktcomputersupplying.com/",
    description:
      "E-commerce catalog site for KT Computer Supplying Ltd, delivered through LERONY Ltd. Prince contributed testing, deployment, hosting and technical review.",
    longDescription:
      "Client e-commerce engagement delivered through LERONY Ltd. The public site presents computer-supply catalog/storefront functionality. Prince Parfait GANZA’s verified contribution is testing, deployment, hosting and technical/bug review, not a claim that he personally developed the complete e-commerce application.",
    context: "KT Computer Supplying Ltd needed an online catalog/storefront delivered through LERONY Ltd.",
    challenge:
      "E-commerce delivery through a company engagement requires honest contribution boundaries.",
    solution:
      "Technical delivery support (testing, deployment, hosting and review) on a live catalog/storefront.",
    whatIBuilt:
      "Testing, deployment, hosting and technical/bug review for the KT Computer Supplying catalog site.",
    myRole: "Technical Delivery",
    domain: "E-commerce",
    deliveredThrough: "LERONY Ltd",
    contributionSummary:
      "Testing, deployment, hosting and technical review on the catalog/storefront engagement.",
    contribution: "contributor",
    capabilities: ["Deployment & hosting", "Testing", "Technical review"],
    technologies: ["Web", "E-commerce", "Hosting"],
    category: "web",
    workGroup: "client",
    status: "live",
    visibility: "public",
    featured: false,
    highlights: [
      "Catalog / storefront presence",
      "Testing, deployment and hosting support",
      "Delivered through LERONY Ltd",
    ],
    features: [
      "Public product catalog / storefront",
      "Client e-commerce presence",
    ],
    outcome: "Live storefront at ktcomputersupplying.com.",
    links: {
      live: "https://www.ktcomputersupplying.com/",
    },
  },
  {
    id: "goa-plus",
    title: "GOA+",
    organization: "GOA+",
    organizationUrl: "https://goapluss.com/",
    description:
      "VR education platform for African schools. Prince Parfait GANZA serves as Co-Founder & CTO.",
    longDescription:
      "GOA+ (Go A+) is a VR education venture focused on immersive learning experiences for African schools, spanning nursery through university and TVET contexts on its public positioning. Prince Parfait GANZA is Co-Founder & CTO. The public record centres on technology leadership, technical direction and product/system oversight rather than unverified hands-on implementation claims for every product surface.",
    context:
      "African education programmes need immersive learning tools that can reach learners across school levels.",
    challenge:
      "Building an education technology venture requires sustained technical direction alongside product and organizational leadership.",
    solution:
      "A public VR education platform for African schools, with Prince contributing as Co-Founder & CTO on technology leadership and technical direction.",
    whatIBuilt:
      "Technology leadership and technical direction as Co-Founder & CTO, including product/system oversight for the GOA+ venture. Specific module-level implementation details are only stated where separately verified.",
    myRole: "Co-Founder & CTO",
    domain: "Education Technology / Products & Ventures",
    deliveredThrough: undefined,
    contributionSummary:
      "Co-Founder & CTO: technology leadership, technical direction and product/system oversight.",
    contribution: "creator",
    market: "Africa · based in Kigali, Rwanda",
    capabilities: [
      "Technology leadership",
      "Technical direction",
      "Product / system oversight",
      "Education technology venture",
    ],
    technologies: [],
    category: "product",
    workGroup: "ventures",
    status: "live",
    visibility: "public",
    featured: true,
    independent: false,
    period: "Ongoing",
    year: 2025,
    highlights: [
      "Co-Founder & CTO of GOA+",
      "VR education platform for African schools",
      "Technology leadership and technical direction",
    ],
    features: [
      "Public VR education platform presence",
      "Positioned for nursery, primary, secondary, TVET and university contexts",
    ],
    outcome: "Live venture presence at goapluss.com.",
    seoTitle: "GOA+ | Co-Founder & CTO | Prince Parfait GANZA",
    seoDescription:
      "Prince Parfait GANZA is Co-Founder & CTO of GOA+, a VR education platform for African schools. Technology leadership and technical direction from Kigali.",
    links: {
      live: "https://goapluss.com/",
    },
  },
];

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  featured: boolean;
  slug: string;
  tags: string[];
  coverImage?: string;
  content?: string;
};

/** Publish only verified writing. Empty is correct until real articles exist. */
export const blogPosts: BlogPost[] = [];

export type Skill = {
  name: string;
  category: string;
};

export const skills: Skill[] = [
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "Vue", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Bootstrap", category: "Frontend" },
  { name: "PHP", category: "Backend" },
  { name: "Node.js", category: "Backend" },
  { name: "API integration", category: "Backend" },
  { name: "MySQL", category: "Data" },
  { name: "SQL", category: "Data" },
  { name: "Supabase", category: "Data" },
  { name: "Python", category: "Data" },
  { name: "Power BI", category: "Data" },
  { name: "Vercel", category: "Infrastructure" },
  { name: "Netlify", category: "Infrastructure" },
  { name: "Render", category: "Infrastructure" },
  { name: "Cloudflare", category: "Infrastructure" },
  { name: "GitHub", category: "Infrastructure" },
  { name: "PWA", category: "Infrastructure" },
];

export type TimelineItem = {
  id: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  type: "education" | "work" | "leadership" | "milestone";
  location?: string;
  summary?: string;
  highlights?: string[];
  website?: string;
  industry?: string;
  team?: string;
  status?: string;
  relatedHref?: string;
  logo?: string;
};

export const timeline: TimelineItem[] = [
  {
    id: "lerony",
    year: "2025–Present",
    title: "Founder & CEO",
    organization: "LERONY Ltd",
    description:
      "Founded and leads a Kigali-based technology and innovation company that helps organizations and businesses solve real problems and build for the future.",
    type: "leadership",
    location: "Kigali, Rwanda",
    summary:
      "Founder and CEO of a technology and innovation company. The role is leadership of the venture: direction, delivery, and turning organizational problems into practical solutions.",
    highlights: [
      "Technology and innovation leadership",
      "Digital solutions and smart systems",
      "Business transformation and strategy",
      "Software platforms and AI-enabled solutions as delivery capabilities",
    ],
    website: "https://lerony.com",
    industry: "Technology & Innovation",
    team: "Solo / partners / contractors as needed",
    status: "Ongoing",
    relatedHref: "https://lerony.com",
    logo: "/images/projects/logos/lerony.webp",
  },
  {
    id: "ulk",
    year: "2025–Present",
    title: "Bachelor of Computer Science in Software Engineering",
    organization: "Kigali Independent University (ULK)",
    description:
      "Undergraduate studies toward a Bachelor of Computer Science in Software Engineering. Degree in progress.",
    type: "education",
    location: "Kigali, Rwanda",
    summary:
      "Bachelor of Computer Science in Software Engineering at ULK. Degree in progress; not presented as complete.",
    highlights: [
      "Bachelor of Computer Science in Software Engineering",
      "Degree in progress",
    ],
    status: "In progress",
    relatedHref: "/experience",
    logo: "/images/projects/logos/ulk.webp",
  },
  {
    id: "psta",
    year: "2023–2024",
    title: "Reservation Agent",
    organization: "PSTA",
    description:
      "Airline reservation and ticketing operations and client support. Related software work later included a ticket accounting system.",
    type: "work",
    location: "Rwanda",
    summary:
      "Airline reservation and ticketing operations and client support. This operational role is separate from the ticket accounting software later associated with PSTA workflows.",
    highlights: [
      "Airline reservation and ticketing operations",
      "Client support",
      "Related later software: ticket records, invoicing, and commission reporting",
    ],
    status: "Completed",
    relatedHref: "/projects/psta-accounting",
    logo: "/images/projects/logos/psta.webp",
  },
  {
    id: "sjitc",
    year: "2021–2024",
    title: "Software Development (SOD)",
    organization: "SJITC Nyamirambo",
    description:
      "Secondary Software Development (SOD) studies. Graduated with distinction in 2024.",
    type: "education",
    location: "Kigali, Rwanda",
    summary: "Secondary Software Development (SOD) studies at SJITC Nyamirambo. Graduated with distinction in 2024.",
    highlights: ["Software Development (SOD)", "Graduated with distinction in 2024"],
    status: "Completed",
    relatedHref: "/experience",
    logo: "/images/projects/logos/sjitc.webp",
  },
];

export type ExperienceItem = {
  id: string;
  organization: string;
  role: string;
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  type: "work" | "training" | "education";
  category: "leadership" | "work" | "education" | "other";
  skills?: string[];
  website?: string;
  relatedHref?: string;
  relatedLabel?: string;
  logo?: string;
  sortYear: number;
};

export const experience: ExperienceItem[] = [
  {
    id: "lerony",
    organization: "LERONY Ltd",
    role: "Founder & CEO",
    period: "2025–Present",
    location: "Kigali, Rwanda",
    summary:
      "Founder and CEO of a technology and innovation company. The role is leadership of the venture: direction, delivery, and turning organizational problems into practical solutions.",
    highlights: [
      "Technology and innovation leadership",
      "Digital solutions and smart systems",
      "Business transformation and strategy",
      "Software platforms and AI-enabled solutions as delivery capabilities",
    ],
    skills: ["Strategy", "Technology & innovation", "Systems", "AI-enabled solutions"],
    type: "work",
    category: "leadership",
    website: "https://lerony.com",
    relatedHref: "https://lerony.com",
    relatedLabel: "Visit lerony.com",
    logo: "/images/projects/logos/lerony.webp",
    sortYear: 2025,
  },
  {
    id: "goa-plus",
    organization: "GOA+",
    role: "Co-Founder & CTO",
    period: "Ongoing",
    location: "Kigali, Rwanda",
    summary:
      "Co-Founder and CTO of GOA+, a VR education platform for African schools. The role covers technology leadership, technical direction and product/system oversight for the venture.",
    highlights: [
      "Co-Founder & CTO",
      "Technology leadership and technical direction",
      "VR education platform for African schools",
    ],
    skills: ["Technology leadership", "Technical direction", "Education technology"],
    type: "work",
    category: "leadership",
    website: "https://goapluss.com/",
    relatedHref: "/projects/goa-plus",
    relatedLabel: "View GOA+ case study",
    sortYear: 2025,
  },
  {
    id: "askfield",
    organization: "Ethical Research Solutions / AskField",
    role: "Frontend Integrator",
    period: "Selected engagement",
    location: "Rwanda",
    summary:
      "Frontend Integrator on the AskField research technology platform. Started with frontend and API integration and expanded into hands-on research-technology work: survey programming, questionnaire logic and validations, XLSForm, CAPI / CATI / CAWI workflows, GPS-enabled collection, enumerator assignment, field operations, response monitoring, data export and research data management. Team contribution, not sole product ownership.",
    highlights: [
      "Frontend and API integration for a research platform",
      "Survey programming, logic and validations",
      "XLSForm and digital questionnaire implementation",
      "CAPI, CATI and CAWI collection workflows",
      "GPS/geolocation collection and enumerator assignment",
      "Field operations, monitoring and research-data export",
    ],
    skills: [
      "Frontend integration",
      "Survey programming",
      "XLSForm",
      "Digital data collection",
      "Research technology",
      "API integration",
    ],
    type: "work",
    category: "work",
    relatedHref: "/projects/askfield",
    relatedLabel: "View related work",
    logo: "/images/projects/logos/askfield.webp",
    sortYear: 2024,
  },
  {
    id: "psta",
    organization: "PSTA",
    role: "Reservation Agent",
    period: "2023–2024",
    location: "Rwanda",
    summary:
      "Airline reservation and ticketing operations and client support. This operational role is separate from the ticket accounting software later associated with PSTA workflows.",
    highlights: [
      "Airline reservation and ticketing operations",
      "Client support",
      "Related later software: ticket records, invoicing, and commission reporting",
    ],
    skills: ["Operations", "Client support", "Ticketing"],
    type: "work",
    category: "work",
    relatedHref: "/projects/psta-accounting",
    relatedLabel: "Related software work",
    logo: "/images/projects/logos/psta.webp",
    sortYear: 2023,
  },
  {
    id: "eshuri",
    organization: "Eshuri Learning",
    role: "Data Systems trainer",
    period: "Training engagement",
    location: "Rwanda",
    summary:
      "Technical training in data systems. One engagement included approximately 85 trainees. Exact session dates are not listed here pending verification.",
    highlights: [
      "Data systems training",
      "Knowledge sharing with a cohort of approximately 85 trainees",
    ],
    skills: ["Training", "Data systems"],
    type: "training",
    category: "other",
    logo: "/images/projects/logos/data-systems.webp",
    sortYear: 2023,
  },
];

export type EducationItem = {
  id: string;
  institution: string;
  program: string;
  period: string;
  status: string;
  note?: string;
  logo?: string;
  sortYear: number;
};

export const education: EducationItem[] = [
  {
    id: "ulk",
    institution: "Kigali Independent University (ULK)",
    program: "Bachelor of Computer Science in Software Engineering",
    period: "2025–Present",
    status: "Ongoing",
    note: "Degree not yet completed.",
    logo: "/images/projects/logos/ulk.webp",
    sortYear: 2025,
  },
  {
    id: "sjitc",
    institution: "SJITC Nyamirambo",
    program: "Software Development (SOD)",
    period: "2021–2024",
    status: "Graduated with distinction",
    logo: "/images/projects/logos/sjitc.webp",
    sortYear: 2021,
  },
];

export type CertificationItem = {
  id: string;
  title: string;
  issuer: string;
  program: string;
  period: string;
  completedOn: string;
  issuedOn: string;
  verifyUrl: string;
  image?: string;
  logo?: string;
  sortYear: number;
};

/** Verified certificates only — each entry needs a public verification URL. */
export const certifications: CertificationItem[] = [
  {
    id: "alx-data-analytics",
    title: "Data Analytics",
    issuer: "ALX Africa",
    program:
      "6 Month programme in Data Analytics with Professional Development Skills for the Digital Age",
    period: "2025",
    completedOn: "15 August 2025",
    issuedOn: "27 August 2025",
    verifyUrl: "https://savanna.alxafrica.com/certificates/XSrPTHhxM6",
    image: "/images/certificates/alx-data-analytics.webp",
    logo: "/images/projects/logos/alx.webp",
    sortYear: 2025,
  },
  {
    id: "alx-founder-academy",
    title: "Founder Academy",
    issuer: "ALX Ventures",
    program: "ALX Ventures Founder Academy 6-week Deep Dive",
    period: "2025",
    completedOn: "1 July 2025",
    issuedOn: "27 June 2025",
    verifyUrl: "https://savanna.alxafrica.com/certificates/RXYG7PrL6F",
    image: "/images/certificates/alx-founder-academy.webp",
    logo: "/images/projects/logos/alx.webp",
    sortYear: 2025,
  },
  {
    id: "alx-professional-foundations",
    title: "Professional Foundations",
    issuer: "ALX Africa",
    program: "Professional Development Skills for the Digital Age",
    period: "2025",
    completedOn: "15 April 2025",
    issuedOn: "15 April 2025",
    verifyUrl: "https://savanna.alxafrica.com/certificates/5hxpC7P3YS",
    image: "/images/certificates/alx-professional-foundations.webp",
    logo: "/images/projects/logos/alx.webp",
    sortYear: 2025,
  },
];

export type SpeakingEngagement = {
  title: string;
  event: string;
  location: string;
  date: string;
  type: "conference" | "workshop" | "panel" | "podcast" | "training";
  topic: string;
};

export const speakingEngagements: SpeakingEngagement[] = [
  {
    title: "Data Systems training",
    event: "Eshuri Learning",
    location: "Rwanda",
    date: "Training engagement",
    type: "training",
    topic:
      "Technical training in data systems for a cohort of approximately 85 trainees.",
  },
];

export type Service = {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
};

export const services: Service[] = [
  {
    id: "software-engineering",
    title: "Software Engineering",
    description:
      "Design and development of production-oriented digital products for organizations and businesses.",
    features: [
      "Production web applications",
      "Authentication and access control",
      "Deployment and hosting",
      "Maintainable, documented delivery",
    ],
    icon: "globe",
  },
  {
    id: "full-stack",
    title: "Full-Stack Development",
    description:
      "Frontend, backend, database, and API-connected applications built as one system.",
    features: [
      "React and Next.js interfaces",
      "PHP and Node.js application work",
      "MySQL and Supabase data layers",
      "REST API integration",
    ],
    icon: "layers",
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    description:
      "Practical AI functionality inside digital products and organizational workflows, focused on real operational problems.",
    features: [
      "AI-enabled product features",
      "Workflow support inside existing systems",
      "Integration with third-party APIs",
      "Scoped to problems that can be substantiated",
    ],
    icon: "brain-circuit",
  },
  {
    id: "business-systems",
    title: "Business Systems",
    description:
      "Systems for operational workflows, data management, reporting, inventory, and administration.",
    features: [
      "Inventory and sales operations",
      "Reporting and dashboards",
      "Administrative workflows",
      "Records, invoicing, and follow-up",
    ],
    icon: "puzzle",
  },
  {
    id: "consulting",
    title: "Technology Consulting",
    description:
      "Technical planning and digital-solution guidance grounded in shipped systems. Larger commercial work may run through LERONY Ltd.",
    features: [
      "Solution scoping",
      "Architecture and stack guidance",
      "Delivery planning",
      "Engagements via LERONY Ltd where appropriate",
    ],
    icon: "compass",
  },
];

export const proofPoints = [
  {
    label: "Founder",
    value: "LERONY Ltd",
    detail: "Technology company, Kigali · 2025",
  },
  {
    label: "Organizations",
    value: "Caritas Rwanda, PSTA, AskField",
    detail: "Systems, operations, and product work",
  },
  {
    label: "Training",
    value: "Data systems",
    detail: "Eshuri Learning · ~85 trainees",
  },
  {
    label: "Based in",
    value: "Kigali, Rwanda",
    detail: "Building for Africa and beyond",
  },
];
