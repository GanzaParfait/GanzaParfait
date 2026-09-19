// ============================================================
// Site Data — Prince Parfait GANZA
// Source of truth for public copy: docs/PORTFOLIO_CONTEXT.md
// Do not invent clients, results, titles, dates, or testimonials.
// ============================================================

export const identity = {
  roleLine: "Founder · Entrepreneur · Technologist · Software Engineer · AI Builder",
  positioning:
    "Building technology, products and ventures that turn ambitious ideas into real-world impact.",
  pageTitle: "Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
  description:
    "Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist, and a software engineer and AI builder, based in Kigali.",
  shortBio:
    "Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist based in Kigali. He leads Lerony and works across technology, digital products and ventures that help organizations and ambitious ideas become reliable real-world solutions. His background combines software engineering, product delivery, data systems, client collaboration and technical training.",
  compactBio:
    "Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.",
} as const;

export const siteConfig = {
  name: "Prince Parfait GANZA",
  title: identity.pageTitle,
  description: identity.description,
  tagline: identity.positioning,
  positioning: identity.roleLine,
  shortIntro: identity.shortBio,
  compactIntro: identity.compactBio,
  url: "https://www.princeparfait.com",
  ogImage: "/images/og/seo-share-image.jpg",
  locale: "en_US",
  keywords: [
    "Prince Parfait GANZA",
    "Prince Parfait Ganza",
    "Founder Entrepreneur Technologist",
    "Founder LERONY Ltd",
    "Technology entrepreneur Rwanda",
    "Software Engineer Rwanda",
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

export type Project = {
  id: string;
  title: string;
  organization?: string;
  description: string;
  longDescription?: string;
  context?: string;
  challenge?: string;
  solution?: string;
  problem?: string;
  whatIBuilt?: string;
  technologies: string[];
  /** Company-level capabilities (for technology/company records). Distinct from website stack. */
  capabilities?: string[];
  /** Tech stack for the company website or a specific software product — not the company identity. */
  websiteTechnologies?: string[];
  myRole?: string;
  outcome?: string;
  result?: string;
  screenshots?: string[];
  category: "web" | "mobile" | "ai" | "saas" | "technology" | "open-source" | "systems" | "product" | "other";
  categoryNote?: string;
  status: "live" | "in-progress" | "archived";
  featured: boolean;
  independent?: boolean;
  links: {
    live?: string;
    github?: string;
    case_study?: string;
  };
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
      "Organizational digital systems for indicator tracking, reporting, and information management.",
    longDescription:
      "Work for Caritas Rwanda on internal digital systems used for organizational reporting and information management. The systems support role-based access, dashboards, data management, exports, and administrative workflows.",
    context: "Caritas Rwanda needed digital systems for organizational indicator and information management.",
    challenge:
      "Humanitarian and organizational reporting depends on reliable data, controlled access, and repeatable administrative workflows.",
    solution:
      "Information-management functionality including dashboards, role-based access, reporting, exports, and administration.",
    problem:
      "Organizational indicator and information-management work required structured digital systems.",
    whatIBuilt:
      "Digital systems covering role-based access, dashboards, reporting, data management, exports, and administrative workflows.",
    myRole: "Software engineer",
    technologies: ["Web platforms", "Dashboards", "Role-based access", "Reporting"],
    category: "systems",
    status: "live",
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
      "Operational systems succeed when access control, reporting, and day-to-day data entry are designed as one workflow—not as separate tools.",
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
    links: {},
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
    title: "Caritas Rwanda Website",
    organization: "Caritas Rwanda",
    description:
      "Website revamp and public digital presence work for Caritas Rwanda.",
    longDescription:
      "Public-facing website work for Caritas Rwanda, treated separately from the internal indicator and information-management systems.",
    context: "Caritas Rwanda needed a renewed public website alongside its internal systems work.",
    challenge: "The public website and internal information systems serve different audiences and should not be conflated.",
    solution: "Website revamp / digital work for the public-facing Caritas Rwanda presence.",
    problem: "The public digital presence required a website revamp distinct from internal systems.",
    whatIBuilt: "Website revamp and related public digital work.",
    myRole: "Software engineer",
    technologies: ["Web", "Content", "Frontend"],
    category: "web",
    status: "live",
    featured: false,
    image: "/images/projects/caritas-website.webp",
    screenshots: ["/images/projects/caritas-website.webp"],
    links: {},
  },
  {
    id: "askfield",
    title: "AskField",
    organization: "Ethical Research Solutions / AskField",
    description:
      "Frontend development and API integration for a survey and data-collection platform.",
    longDescription:
      "Contribution to the AskField survey platform through frontend development and API integration, using React and Redux. This was team/organizational work, not sole product ownership.",
    context:
      "AskField is a survey and data-collection platform. Work was performed as part of Ethical Research Solutions / the product team.",
    challenge:
      "The product needed frontend interfaces connected to existing APIs for survey and data-collection workflows.",
    solution:
      "Frontend development and API integration using React and Redux.",
    problem:
      "The survey platform required frontend work and API integration.",
    whatIBuilt:
      "Frontend interfaces and API integration for survey/data-collection workflows.",
    myRole: "Frontend development and API integration (team contribution)",
    technologies: ["React", "Redux", "API integration"],
    category: "web",
    status: "live",
    featured: false,
    contribution: "contributor",
    logo: "/images/projects/logos/askfield.png",
    image: "/images/projects/askfield.webp",
    screenshots: [
      "/images/projects/askfield.webp",
      "/images/projects/askfield.webp",
      "/images/projects/askfield.webp",
    ],
    screenshotCaptions: ["Survey workspace", "Data collection", "API-backed UI"],
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
      "Bachelor of Computer Science in Software Engineering at ULK. Degree in progress — not presented as complete.",
    highlights: [
      "Bachelor of Computer Science in Software Engineering",
      "Degree in progress",
    ],
    status: "In progress",
    relatedHref: "/experience",
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
    sortYear: 2025,
  },
  {
    id: "askfield",
    organization: "Ethical Research Solutions / AskField",
    role: "Frontend development & API integration",
    period: "Selected engagement",
    location: "Rwanda",
    summary:
      "Frontend development and API integration for the AskField survey and data-collection platform, using React and Redux. Contribution as part of a team — not sole product ownership.",
    highlights: [
      "React frontend development",
      "Redux state management",
      "REST API integration",
    ],
    skills: ["React", "Redux", "API integration"],
    type: "work",
    category: "work",
    relatedHref: "/projects/askfield",
    relatedLabel: "View related work",
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
    sortYear: 2025,
  },
  {
    id: "sjitc",
    institution: "SJITC Nyamirambo",
    program: "Software Development (SOD)",
    period: "2021–2024",
    status: "Graduated with distinction",
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
      "Practical AI functionality inside digital products and organizational workflows — not research theatre.",
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
