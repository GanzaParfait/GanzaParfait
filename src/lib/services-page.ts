import type { SiteSettings } from "@/lib/supabase";

export const SERVICE_FOCUS_IDS = ["build", "grow", "transform", "support"] as const;
export type ServiceFocus = (typeof SERVICE_FOCUS_IDS)[number];

export type ServiceFamilyLayout = "modules" | "feature" | "workflow" | "assist";

export type ServiceFamily = {
  id: ServiceFocus;
  label: string;
  title: string;
  summary: string;
  layout: ServiceFamilyLayout;
  sortOrder: number;
};

export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: ServiceFocus;
  summary: string;
  description: string;
  icon: string;
  capabilities: string[];
  technologies: string[];
  relatedProjects: string[];
  relatedExperience: string[];
  audiences: string[];
  engagementType: string[];
  featured: boolean;
  published: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
};

export type ServicesPageContent = {
  hero: {
    label: string;
    title: string;
    body: string;
    rail: string[];
    railNote: string;
  };
  families: ServiceFamily[];
  items: ServiceItem[];
  selectedWork: {
    label: string;
    title: string;
    body?: string;
    ctaLabel: string;
    ctaHref: string;
    projectIds: string[];
  };
  audiences: {
    label: string;
    title: string;
    body: string;
    sideNote?: string;
    items: { title: string; body: string }[];
  };
  process: {
    label: string;
    title: string;
    note?: string;
    steps: { n: string; title: string; body: string }[];
  };
  leronyNote: string;
  cta: {
    label?: string;
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    whatsappLabel: string;
    trust?: string[];
  };
  seo: {
    title: string;
    description: string;
  };
};

export function parseServiceFocus(value: string | string[] | undefined | null): ServiceFocus | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const normalized = raw.trim().toLowerCase();
  return (SERVICE_FOCUS_IDS as readonly string[]).includes(normalized)
    ? (normalized as ServiceFocus)
    : null;
}

export function serviceFocusHref(focus: ServiceFocus | null | "all") {
  if (!focus || focus === "all") return "/services";
  return `/services?focus=${focus}`;
}

export const DEFAULT_SERVICES_PAGE: ServicesPageContent = {
  hero: {
    label: "Services",
    title: "From ideas to real impact.",
    body: "Digital products, presence, systems and hands-on support.",
    rail: ["Ideas", "People", "Systems", "Impact"],
    railNote: "Practical technology for a more connected Rwanda and beyond.",
  },
  families: [
    {
      id: "build",
      label: "Build",
      title: "Build digital products",
      summary:
        "Websites, web applications, business systems and e-commerce experiences.",
      layout: "modules",
      sortOrder: 1,
    },
    {
      id: "grow",
      label: "Grow",
      title: "Grow a digital presence",
      summary:
        "Social media, marketplace support, content publishing and brand presence.",
      layout: "feature",
      sortOrder: 2,
    },
    {
      id: "transform",
      label: "Transform",
      title: "Improve how work gets done",
      summary: "Business systems, data, automation and practical AI for everyday operations.",
      layout: "workflow",
      sortOrder: 3,
    },
    {
      id: "support",
      label: "Support",
      title: "Support ideas and operations",
      summary:
        "Technical guidance, international client support, training and ongoing assistance.",
      layout: "assist",
      sortOrder: 4,
    },
  ],
  items: [
    {
      id: "software-engineering",
      slug: "software-engineering",
      title: "Software Engineering",
      shortTitle: "Software",
      category: "build",
      summary: "Production-oriented web applications designed around real workflows and users.",
      description:
        "Design and development of reliable digital products for organizations and businesses — with authentication, roles, dashboards and maintainable delivery.",
      icon: "code",
      capabilities: [
        "Production web applications",
        "Frontend and backend development",
        "Full-stack delivery",
        "Authentication and authorization",
        "Role-based systems",
        "Dashboards and internal applications",
      ],
      technologies: ["React", "Next.js", "TypeScript", "JavaScript", "PHP", "Node.js", "MySQL", "Supabase"],
      relatedProjects: ["askfield", "stockpro", "caritas-systems", "psta-accounting"],
      relatedExperience: ["askfield", "lerony"],
      audiences: ["Organizations", "Businesses", "Founders", "Teams"],
      engagementType: ["Build", "Product"],
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      id: "websites-platforms",
      slug: "websites-platforms",
      title: "Websites & Web Platforms",
      shortTitle: "Websites",
      category: "build",
      summary: "Corporate, organization and personal-brand websites with clear structure and modern interfaces.",
      description:
        "Content-driven websites, portals and responsive interfaces — including modernization work when an existing presence needs to perform better.",
      icon: "globe",
      capabilities: [
        "Corporate and organization websites",
        "Personal-brand websites",
        "Content-driven sites and portals",
        "Responsive interfaces",
        "Website modernization",
        "CMS-backed websites",
      ],
      technologies: ["Next.js", "React", "HTML", "CSS", "Tailwind"],
      relatedProjects: ["caritas-website"],
      relatedExperience: [],
      audiences: ["Organizations", "Businesses", "Founders"],
      engagementType: ["Build"],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      id: "business-systems",
      slug: "business-systems",
      title: "Business Systems",
      shortTitle: "Business systems",
      category: "build",
      summary: "Operational software for workflows, records, inventory, reporting and administration.",
      description:
        "Systems that turn day-to-day operations into reliable software — from inventory and reporting to indicator management and internal tools.",
      icon: "puzzle",
      capabilities: [
        "Inventory and sales operations",
        "Reporting and dashboards",
        "Workflow and administrative platforms",
        "Indicator and data management systems",
        "Internal management software",
      ],
      technologies: ["PHP", "MySQL", "React", "SQL", "Supabase"],
      relatedProjects: ["caritas-systems", "stockpro", "psta-accounting"],
      relatedExperience: ["psta"],
      audiences: ["Organizations", "Businesses", "Teams"],
      engagementType: ["Build", "Transform"],
      featured: true,
      published: true,
      sortOrder: 3,
    },
    {
      id: "api-integration",
      slug: "api-integration",
      title: "Integrations & APIs",
      shortTitle: "Integrations",
      category: "build",
      summary: "Connect products to APIs, services and existing platforms without fragile glue.",
      description:
        "REST API work, third-party service connections, authentication hooks and frontend/backend integration so systems exchange data cleanly.",
      icon: "layers",
      capabilities: [
        "REST API integration",
        "Third-party service integration",
        "Authentication integration",
        "Frontend/backend integration",
        "Notification integrations",
      ],
      technologies: ["REST APIs", "Node.js", "PHP", "JavaScript", "Supabase"],
      relatedProjects: ["askfield", "stockpro"],
      relatedExperience: ["askfield"],
      audiences: ["Organizations", "Founders", "Teams"],
      engagementType: ["Build", "Transform"],
      featured: false,
      published: true,
      sortOrder: 4,
    },
    {
      id: "product-development",
      slug: "product-development",
      title: "Product Development",
      shortTitle: "Products",
      category: "build",
      summary: "Turn product ideas into usable interfaces, features and deployable releases.",
      description:
        "Product architecture, feature implementation, MVP work and iteration — focused on what users and operators can actually run.",
      icon: "box",
      capabilities: [
        "Product architecture",
        "Feature implementation",
        "MVP and product development",
        "Interface development",
        "Product iteration",
        "Deployment support",
      ],
      technologies: ["React", "Next.js", "TypeScript", "Supabase"],
      relatedProjects: ["askfield", "gotallnews", "lerony"],
      relatedExperience: ["lerony", "askfield"],
      audiences: ["Founders", "Businesses", "Teams"],
      engagementType: ["Build"],
      featured: true,
      published: true,
      sortOrder: 5,
    },
    {
      id: "commerce-experiences",
      slug: "commerce-experiences",
      title: "Commerce Experiences",
      shortTitle: "Commerce",
      category: "build",
      summary: "Digital storefronts, catalogs and marketplace-connected product experiences.",
      description:
        "Interfaces and flows for product catalogs, e-commerce surfaces and business digital storefronts — without claiming ownership of third-party marketplaces.",
      icon: "store",
      capabilities: [
        "E-commerce interfaces",
        "Product catalogs",
        "Marketplace-connected experiences",
        "Business digital storefronts",
      ],
      technologies: ["React", "Next.js", "JavaScript"],
      relatedProjects: ["gotallnews", "stockpro"],
      relatedExperience: [],
      audiences: ["Businesses", "Founders"],
      engagementType: ["Build", "Grow"],
      featured: false,
      published: true,
      sortOrder: 6,
    },
    {
      id: "digital-presence",
      slug: "digital-presence",
      title: "Digital Presence Setup",
      shortTitle: "Presence",
      category: "grow",
      summary: "Plan and configure a coherent online presence across website and key platforms.",
      description:
        "Digital presence planning, website presence, account and profile configuration, and a consistent identity across the channels that matter.",
      icon: "radar",
      capabilities: [
        "Digital presence planning",
        "Website presence",
        "Account and platform setup",
        "Business profile configuration",
        "Consistent digital identity",
      ],
      technologies: [],
      relatedProjects: ["caritas-website", "gotallnews"],
      relatedExperience: [],
      audiences: ["Businesses", "Organizations", "Founders"],
      engagementType: ["Grow"],
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      id: "social-operations",
      slug: "social-operations",
      title: "Social Media Operations",
      shortTitle: "Social",
      category: "grow",
      summary: "Practical support for account setup, publishing workflows and platform organization.",
      description:
        "Help configuring social accounts, organizing publishing workflows and keeping product or brand content structured across platforms — where that support is actually provided.",
      icon: "share",
      capabilities: [
        "Social account setup and configuration",
        "Publishing workflows",
        "Product and content publishing support",
        "Platform management support",
        "Content organization",
      ],
      technologies: [],
      relatedProjects: ["gotallnews"],
      relatedExperience: [],
      audiences: ["Businesses", "Founders"],
      engagementType: ["Grow", "Support"],
      featured: false,
      published: true,
      sortOrder: 2,
    },
    {
      id: "marketplace-support",
      slug: "marketplace-support",
      title: "Marketplace & E-commerce",
      shortTitle: "Marketplaces",
      category: "grow",
      summary: "Onboarding, catalog organization and product publishing for digital commerce surfaces.",
      description:
        "Support for marketplace-oriented workflows such as product listing, catalog structure and digital storefront readiness — without implying platform partnerships or ownership.",
      icon: "cart",
      capabilities: [
        "Marketplace onboarding support",
        "Product listing",
        "Catalog organization",
        "Product publishing",
        "Digital storefront support",
      ],
      technologies: [],
      relatedProjects: ["stockpro", "gotallnews"],
      relatedExperience: [],
      audiences: ["Businesses", "Founders"],
      engagementType: ["Grow"],
      featured: false,
      published: true,
      sortOrder: 3,
    },
    {
      id: "digital-branding",
      slug: "digital-branding",
      title: "Digital Branding Support",
      shortTitle: "Brand consistency",
      category: "grow",
      summary: "Keep website, profiles and digital assets consistent across channels.",
      description:
        "Practical brand deployment online — profile presentation, asset implementation and consistency between website and social surfaces. Not positioned as traditional graphic design.",
      icon: "palette",
      capabilities: [
        "Brand consistency across platforms",
        "Digital assets implementation",
        "Online profile presentation",
        "Website and social consistency",
        "Practical brand deployment",
      ],
      technologies: [],
      relatedProjects: ["caritas-website", "lerony"],
      relatedExperience: ["lerony"],
      audiences: ["Businesses", "Founders", "Organizations"],
      engagementType: ["Grow"],
      featured: false,
      published: true,
      sortOrder: 4,
    },
    {
      id: "seo-discoverability",
      slug: "seo-discoverability",
      title: "SEO & Discoverability",
      shortTitle: "SEO",
      category: "grow",
      summary: "Technical SEO, metadata and structured data that make pages machine-readable.",
      description:
        "Implementation work around metadata, structured data, sitemaps, robots configuration and social sharing tags. No ranking promises — only solid discoverability foundations.",
      icon: "search",
      capabilities: [
        "Technical SEO foundations",
        "Metadata and Open Graph",
        "Structured data",
        "Sitemap and robots configuration",
        "Content structure for discoverability",
      ],
      technologies: ["Next.js", "JSON-LD"],
      relatedProjects: [],
      relatedExperience: [],
      audiences: ["Businesses", "Founders", "Organizations"],
      engagementType: ["Grow", "Build"],
      featured: true,
      published: true,
      sortOrder: 5,
    },
    {
      id: "process-digitization",
      slug: "process-digitization",
      title: "Business Process Digitization",
      shortTitle: "Digitization",
      category: "transform",
      summary: "Translate manual workflows into digital systems people can actually run.",
      description:
        "Understand existing processes, design operational workflows and move administration into software that fits the organization.",
      icon: "flow",
      capabilities: [
        "Understanding manual workflows",
        "Translating processes into digital systems",
        "Operational workflow design",
        "Administrative digitization",
      ],
      technologies: ["PHP", "MySQL", "React", "SQL"],
      relatedProjects: ["caritas-systems", "stockpro", "psta-accounting"],
      relatedExperience: ["psta"],
      audiences: ["Organizations", "Businesses", "Teams"],
      engagementType: ["Transform"],
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      id: "data-reporting",
      slug: "data-reporting",
      title: "Data & Reporting Systems",
      shortTitle: "Data",
      category: "transform",
      summary: "Databases, reporting workflows and dashboards for operational clarity.",
      description:
        "Organize records, build reporting paths and surface management information so teams can see what is happening.",
      icon: "chart",
      capabilities: [
        "Databases and data organization",
        "Reporting workflows",
        "Operational dashboards",
        "Operational records",
        "Management information systems",
      ],
      technologies: ["MySQL", "SQL", "Supabase", "Power BI"],
      relatedProjects: ["caritas-systems", "psta-accounting", "stockpro"],
      relatedExperience: ["eshuri", "psta"],
      audiences: ["Organizations", "Teams", "Businesses"],
      engagementType: ["Transform"],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      id: "systems-integration",
      slug: "systems-integration",
      title: "Systems Integration",
      shortTitle: "Connected systems",
      category: "transform",
      summary: "Connect platforms, exchange data and keep workflows linked.",
      description:
        "API-backed connections, data exchange and workflow integration so tools do not stay isolated.",
      icon: "link",
      capabilities: [
        "APIs and connected platforms",
        "Data exchange",
        "Workflow integration",
        "Third-party services",
      ],
      technologies: ["REST APIs", "Node.js", "PHP", "Supabase"],
      relatedProjects: ["askfield", "stockpro"],
      relatedExperience: ["askfield"],
      audiences: ["Organizations", "Teams"],
      engagementType: ["Transform", "Build"],
      featured: false,
      published: true,
      sortOrder: 3,
    },
    {
      id: "automation",
      slug: "automation",
      title: "Automation",
      shortTitle: "Automation",
      category: "transform",
      summary: "Reduce repetitive work with practical notifications and system-triggered flows.",
      description:
        "Operational automation, notification workflows and integrations that remove busywork without over-engineering.",
      icon: "bolt",
      capabilities: [
        "Repetitive workflow reduction",
        "Notification workflows",
        "Operational automation",
        "System-triggered communication",
        "Practical integrations",
      ],
      technologies: ["APIs", "Node.js", "Supabase"],
      relatedProjects: ["askfield", "stockpro"],
      relatedExperience: [],
      audiences: ["Organizations", "Businesses", "Teams"],
      engagementType: ["Transform"],
      featured: false,
      published: true,
      sortOrder: 4,
    },
    {
      id: "practical-ai",
      slug: "practical-ai",
      title: "Practical AI Integration",
      shortTitle: "AI",
      category: "transform",
      summary: "AI features and workflow assistance scoped to problems that can be substantiated.",
      description:
        "AI-assisted product features, intelligent interfaces and practical service integration — not research theatre.",
      icon: "brain",
      capabilities: [
        "AI-assisted product features",
        "Workflow assistance",
        "Intelligent interfaces",
        "Practical AI service integration",
      ],
      technologies: ["APIs", "JavaScript", "TypeScript", "Python"],
      relatedProjects: ["askfield"],
      relatedExperience: ["askfield"],
      audiences: ["Founders", "Organizations", "Teams"],
      engagementType: ["Transform", "Build"],
      featured: true,
      published: true,
      sortOrder: 5,
    },
    {
      id: "tech-consulting",
      slug: "technology-consulting",
      title: "Technology Consulting",
      shortTitle: "Consulting",
      category: "transform",
      summary: "Clarify requirements, architecture and the right digital approach before building.",
      description:
        "Discovery, solution architecture discussions, product and system planning, and technology assessment grounded in shipped work.",
      icon: "compass",
      capabilities: [
        "Requirements discovery",
        "Solution architecture discussions",
        "Product and system planning",
        "Technology assessment",
        "Digital transformation planning",
      ],
      technologies: [],
      relatedProjects: ["lerony", "caritas-systems"],
      relatedExperience: ["lerony"],
      audiences: ["Organizations", "Founders", "Businesses"],
      engagementType: ["Transform", "Support"],
      featured: true,
      published: true,
      sortOrder: 6,
    },
    {
      id: "technology-guidance",
      slug: "technology-guidance",
      title: "Technology Guidance",
      shortTitle: "Guidance",
      category: "support",
      summary: "Clear technical direction for products, platforms and implementation choices.",
      description:
        "Consultation on product direction, platform selection, implementation guidance and troubleshooting when decisions need an experienced technical view.",
      icon: "guide",
      capabilities: [
        "Technical consultation",
        "Product guidance",
        "Platform selection",
        "Implementation guidance",
        "Troubleshooting and technical direction",
      ],
      technologies: [],
      relatedProjects: ["lerony"],
      relatedExperience: ["lerony"],
      audiences: ["Founders", "Organizations", "International clients"],
      engagementType: ["Support"],
      featured: true,
      published: true,
      sortOrder: 1,
    },
    {
      id: "international-support",
      slug: "international-client-support",
      title: "International Client Support",
      shortTitle: "International support",
      category: "support",
      summary: "Remote digital and process assistance for clients collaborating beyond Rwanda.",
      description:
        "Practical help navigating digital workflows, account and process guidance, and coordination across online services. Based in Kigali, working with collaborators locally and internationally. This is digital/process support — not legal, accounting or immigration advice.",
      icon: "globe-people",
      capabilities: [
        "Remote technical assistance",
        "Digital process assistance",
        "Account and process guidance",
        "Help navigating digital workflows",
        "Coordination across online services",
        "Digital/process support around registration workflows",
      ],
      technologies: [],
      relatedProjects: [],
      relatedExperience: [],
      audiences: ["International clients", "Founders", "Businesses"],
      engagementType: ["Support"],
      featured: true,
      published: true,
      sortOrder: 2,
    },
    {
      id: "technical-support",
      slug: "technical-support",
      title: "Technical Support",
      shortTitle: "Tech support",
      category: "support",
      summary: "Troubleshooting, configuration, deployment help and ongoing technical maintenance.",
      description:
        "Hands-on assistance when systems need debugging, configuration, deployment support or practical platform help.",
      icon: "wrench",
      capabilities: [
        "Troubleshooting",
        "Deployment assistance",
        "Configuration",
        "Digital platform assistance",
        "Website and system support",
        "Ongoing technical maintenance where offered",
      ],
      technologies: ["Next.js", "PHP", "MySQL", "Supabase"],
      relatedProjects: ["caritas-website", "askfield", "stockpro"],
      relatedExperience: [],
      audiences: ["Organizations", "Businesses", "Teams"],
      engagementType: ["Support"],
      featured: false,
      published: true,
      sortOrder: 3,
    },
    {
      id: "training",
      slug: "training",
      title: "Training & Knowledge Transfer",
      shortTitle: "Training",
      category: "support",
      summary: "Practical technical and data-systems instruction grounded in real delivery work.",
      description:
        "Software, web and data-systems training — including documented knowledge-sharing with a cohort of approximately 85 trainees. No invented event names.",
      icon: "book",
      capabilities: [
        "Software and web training",
        "Data systems instruction",
        "Technical workshops",
        "Practical digital-skills instruction",
      ],
      technologies: ["SQL", "MySQL", "Web fundamentals"],
      relatedProjects: [],
      relatedExperience: ["eshuri"],
      audiences: ["Teams", "Organizations"],
      engagementType: ["Support"],
      featured: true,
      published: true,
      sortOrder: 4,
    },
    {
      id: "digital-operations",
      slug: "digital-operations-support",
      title: "Digital Operations Support",
      shortTitle: "Operations",
      category: "support",
      summary: "Day-to-day help configuring platforms, publishing workflows and online administration.",
      description:
        "Platform configuration, publishing workflows, account setup and technology-enabled business operations support.",
      icon: "settings",
      capabilities: [
        "Platform configuration",
        "Publishing workflows",
        "Account setup",
        "Technology-enabled business operations",
        "Practical online administration",
      ],
      technologies: [],
      relatedProjects: ["gotallnews", "stockpro"],
      relatedExperience: [],
      audiences: ["Businesses", "Founders", "Teams"],
      engagementType: ["Support", "Grow"],
      featured: false,
      published: true,
      sortOrder: 5,
    },
  ],
  selectedWork: {
    label: "Selected work",
    title: "Proven in practice.",
    body: "Real projects. Practical results.",
    ctaLabel: "View all projects",
    ctaHref: "/projects",
    projectIds: ["caritas-systems", "askfield", "stockpro", "gotallnews"],
  },
  audiences: {
    label: "Who this is for",
    title: "Who I work with.",
    body: "Based in Kigali, working with clients and collaborators locally and internationally.",
    sideNote: "Local solutions. Global opportunities.",
    items: [
      { title: "Businesses", body: "Small and growing." },
      { title: "Organizations", body: "NGOs, institutions." },
      { title: "Founders", body: "From idea to product." },
      { title: "International clients", body: "Remote support & coordination." },
    ],
  },
  process: {
    label: "Process",
    title: "A simple, practical process.",
    note: "You'll always know what's next. Transparent process, practical updates, and support throughout.",
    steps: [
      {
        n: "01",
        title: "Understand",
        body: "Your goals and context.",
      },
      {
        n: "02",
        title: "Plan",
        body: "Scope and approach.",
      },
      {
        n: "03",
        title: "Execute",
        body: "Build, implement or support.",
      },
      {
        n: "04",
        title: "Improve",
        body: "Launch and grow.",
      },
    ],
  },
  leronyNote:
    "Larger commercial and organizational engagements may be delivered through LERONY Ltd. This personal site remains the place to understand the person, capabilities and evidence.",
  cta: {
    label: "Let's work together",
    title: "Have a project or challenge in mind?",
    body: "Start with the problem. We can figure out the right approach from there. Talk with Prince Parfait GANZA in Kigali, Rwanda, or remotely.",
    primaryLabel: "Start a conversation",
    primaryHref: "/contact",
    secondaryLabel: "Email",
    secondaryHref: "mailto:hello@princeparfait.com",
    whatsappLabel: "WhatsApp",
    trust: ["Practical discussion", "No obligation", "Response within 24 hours"],
  },
  seo: {
    title: "Services & Capabilities | Prince Parfait GANZA",
    description:
      "Services from Prince Parfait GANZA in Kigali, Rwanda: digital products, websites, business systems, digital presence, data, practical AI, consulting, training and technical support.",
  },
};

function mergeItem(fallback: ServiceItem | undefined, item: Partial<ServiceItem>, index: number): ServiceItem {
  const base = fallback || DEFAULT_SERVICES_PAGE.items[index] || DEFAULT_SERVICES_PAGE.items[0];
  const staleTitles: Record<string, string> = {
    "Business & Enterprise Systems": "Business Systems",
    "API & Platform Integration": "Integrations & APIs",
    "Marketplace & E-commerce Support": "Marketplace & E-commerce",
    "SEO & Discoverability Implementation": "SEO & Discoverability",
    "Technology Consulting & Discovery": "Technology Consulting",
    "International Client Digital Support": "International Client Support",
    Training: "Training & Knowledge Transfer",
  };
  const nextTitle = item.title || base.title;
  return {
    ...base,
    ...item,
    id: item.id || base.id,
    slug: item.slug || base.slug,
    title: staleTitles[nextTitle] || nextTitle || base.title,
    shortTitle: item.shortTitle || base.shortTitle,
    category: item.category || base.category,
    summary: item.summary || base.summary,
    description: item.description || base.description,
    icon: item.icon || base.icon,
    capabilities: item.capabilities?.length ? item.capabilities : base.capabilities,
    technologies: item.technologies?.length ? item.technologies : base.technologies,
    relatedProjects: item.relatedProjects?.length ? item.relatedProjects : base.relatedProjects,
    relatedExperience: item.relatedExperience?.length ? item.relatedExperience : base.relatedExperience,
    audiences: item.audiences?.length ? item.audiences : base.audiences,
    engagementType: item.engagementType?.length ? item.engagementType : base.engagementType,
    featured: item.featured ?? base.featured,
    published: item.published ?? base.published,
    sortOrder: item.sortOrder ?? base.sortOrder ?? index + 1,
  };
}

export function servicesPageFrom(
  settings: SiteSettings,
  options?: { includeUnpublished?: boolean },
): ServicesPageContent {
  const saved = settings.servicesPage;
  if (!saved) return DEFAULT_SERVICES_PAGE;

  const staleHero =
    !saved.hero?.title ||
    saved.hero.title === "Different challenges. The right way to move them forward." ||
    saved.hero.body?.includes("Practical technology services for businesses, organizations and ambitious ideas") ||
    saved.hero.body?.includes("Digital products, online presence, smarter operations and hands-on support");

  const staleFamilies =
    saved.families?.some((family) =>
      /Software, websites, platforms|Help brands, products and organizations become more visible|Use data, systems, automation and practical AI to improve|Guidance, training and practical digital support|Create useful digital products|Help businesses, organizations, products and brands become more visible|Use technology, data and automation to improve how organizations operate|Practical technical and operational support that helps people/.test(
        family.summary || "",
      ),
    ) ?? false;

  const staleAudiences =
    saved.audiences?.items?.some((item) =>
      item.title === "Teams" ||
      /Operators who need|Teams that need reliable systems|Builders who need product|Collaborators who need remote digital|Groups that need implementation/.test(
        item.body || "",
      ),
    ) ?? false;

  const staleProcess =
    saved.process?.title === "How an engagement works" ||
    (saved.process?.steps?.some((step) =>
      /Clarify the problem, context and desired outcome|Agree the right approach|Implement the agreed solution|Launch, hand over, support and improve/.test(
        step.body || "",
      ),
    ) ?? false);

  const families = (saved.families?.length ? saved.families : DEFAULT_SERVICES_PAGE.families)
    .map((family, index) => {
      const fallback = DEFAULT_SERVICES_PAGE.families.find((item) => item.id === family.id) || DEFAULT_SERVICES_PAGE.families[index];
      return {
        ...fallback,
        ...family,
        id: family.id || fallback.id,
        label: family.label || fallback.label,
        title: staleFamilies ? fallback.title : family.title || fallback.title,
        summary: staleFamilies ? fallback.summary : family.summary || fallback.summary,
        layout: family.layout || fallback.layout,
        sortOrder: family.sortOrder ?? fallback.sortOrder ?? index + 1,
      } satisfies ServiceFamily;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const mergedItems = (saved.items?.length ? saved.items : DEFAULT_SERVICES_PAGE.items)
    .map((item, index) => {
      const fallback = DEFAULT_SERVICES_PAGE.items.find((entry) => entry.id === item.id || entry.slug === item.slug);
      return mergeItem(fallback, item, index);
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));

  const items = options?.includeUnpublished
    ? mergedItems
    : mergedItems.filter((item) => item.published);

  return {
    ...DEFAULT_SERVICES_PAGE,
    ...saved,
    hero: {
      ...DEFAULT_SERVICES_PAGE.hero,
      ...saved.hero,
      ...(staleHero
        ? {
            label: DEFAULT_SERVICES_PAGE.hero.label,
            title: DEFAULT_SERVICES_PAGE.hero.title,
            body: DEFAULT_SERVICES_PAGE.hero.body,
            rail: DEFAULT_SERVICES_PAGE.hero.rail,
            railNote: DEFAULT_SERVICES_PAGE.hero.railNote,
          }
        : {}),
      rail: saved.hero?.rail?.length && !staleHero ? saved.hero.rail : DEFAULT_SERVICES_PAGE.hero.rail,
      railNote:
        saved.hero?.railNote?.trim() && !staleHero
          ? saved.hero.railNote
          : DEFAULT_SERVICES_PAGE.hero.railNote,
    },
    families,
    items: items.length ? items : DEFAULT_SERVICES_PAGE.items.filter((item) => item.published || options?.includeUnpublished),
    selectedWork: {
      ...DEFAULT_SERVICES_PAGE.selectedWork,
      ...saved.selectedWork,
      body: saved.selectedWork?.body?.trim() || DEFAULT_SERVICES_PAGE.selectedWork.body,
      projectIds: saved.selectedWork?.projectIds?.length
        ? saved.selectedWork.projectIds
        : DEFAULT_SERVICES_PAGE.selectedWork.projectIds,
    },
    audiences: staleAudiences
      ? DEFAULT_SERVICES_PAGE.audiences
      : {
          ...DEFAULT_SERVICES_PAGE.audiences,
          ...saved.audiences,
          sideNote: saved.audiences?.sideNote?.trim() || DEFAULT_SERVICES_PAGE.audiences.sideNote,
          items: saved.audiences?.items?.length ? saved.audiences.items : DEFAULT_SERVICES_PAGE.audiences.items,
        },
    process: staleProcess
      ? DEFAULT_SERVICES_PAGE.process
      : {
          ...DEFAULT_SERVICES_PAGE.process,
          ...saved.process,
          note: saved.process?.note?.trim() || DEFAULT_SERVICES_PAGE.process.note,
          steps: saved.process?.steps?.length ? saved.process.steps : DEFAULT_SERVICES_PAGE.process.steps,
        },
    leronyNote: saved.leronyNote?.trim() || DEFAULT_SERVICES_PAGE.leronyNote,
    cta: {
      ...DEFAULT_SERVICES_PAGE.cta,
      ...saved.cta,
      label: saved.cta?.label?.trim() || DEFAULT_SERVICES_PAGE.cta.label,
      trust: saved.cta?.trust?.length ? saved.cta.trust : DEFAULT_SERVICES_PAGE.cta.trust,
      ...(saved.cta?.title === "Not sure which service fits?" ||
      saved.cta?.body ===
        "Start with the problem. We can figure out the right approach from there." ||
      saved.cta?.body ===
        "Start with the problem. We can figure out the right approach from there. Talk with Prince Parfait GANZA in Kigali, Rwanda."
        ? {
            title:
              saved.cta?.title === "Not sure which service fits?"
                ? DEFAULT_SERVICES_PAGE.cta.title
                : saved.cta?.title?.trim() || DEFAULT_SERVICES_PAGE.cta.title,
            body: DEFAULT_SERVICES_PAGE.cta.body,
          }
        : {}),
    },
    seo: { ...DEFAULT_SERVICES_PAGE.seo, ...saved.seo },
  };
}

export function orderedFamilies(content: ServicesPageContent, focus: ServiceFocus | null) {
  const sorted = [...content.families].sort((a, b) => a.sortOrder - b.sortOrder);
  if (!focus) return sorted;
  const active = sorted.filter((family) => family.id === focus);
  const rest = sorted.filter((family) => family.id !== focus);
  return [...active, ...rest];
}

export function itemsForFamily(content: ServicesPageContent, familyId: ServiceFocus) {
  return content.items.filter((item) => item.category === familyId && item.published);
}

export function projectTitleMap(records: { id: string; title: string }[] | undefined) {
  const map = new Map<string, string>();
  for (const record of records || []) map.set(record.id, record.title);
  return map;
}
