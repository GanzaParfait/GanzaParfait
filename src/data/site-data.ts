// ============================================================
// Site Data — Prince Parfait GANZA
// ============================================================

export const siteConfig = {
  name: "Prince Parfait GANZA",
  shortName: "PPG",
  title: "Prince Parfait GANZA — Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  description:
    "Founder, Software Engineer, AI Builder, Speaker & Entrepreneur. Building software that creates impact across Africa and beyond.",
  tagline: "Building software that creates impact.",
  url: "https://princeparfait.com",
  ogImage: "/brand/logos/logo-horizontal-dark.png",
  locale: "en_US",
  keywords: [
    "Prince Parfait GANZA",
    "Prince Parfait",
    "GANZA Prince",
    "Software Engineer Rwanda",
    "AI Builder Africa",
    "Founder Lerony",
    "Full Stack Developer Rwanda",
    "React Developer Rwanda",
    "Next.js Developer Rwanda",
    "Technology Entrepreneur Rwanda",
    "Software Engineer Africa",
    "Speaker Africa",
    "Entrepreneur Rwanda",
  ],
  social: {
    github: "https://github.com/GanzaParfait",
    linkedin: "https://linkedin.com/in/ganza-prince-235816269",
    twitter: "https://x.com/prince_parfait1",
    youtube: "https://youtube.com/@prince_parfait",
    instagram: "https://www.instagram.com/prince_parfait",
    tiktok: "https://tiktok.com/@prince_parfait",
    threads: "https://www.threads.com/@prince_parfait",
    luma: "https://luma.com/user/princeparfait",
    buymeacoffee: "https://buymeacoffee.com/princeparfait",
    whatsapp: "https://wa.me/250792054846",
  },
  contact: {
    email: "hello@princeparfait.com",
    location: "Kigali, Rwanda",
    whatsapp: "https://wa.me/250792054846",
  },
};

export type Project = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  technologies: string[];
  category: "web" | "mobile" | "ai" | "saas" | "open-source";
  status: "live" | "in-progress" | "archived";
  featured: boolean;
  links: {
    live?: string;
    github?: string;
    case_study?: string;
  };
  image?: string;
  year: number;
};

export const projects: Project[] = [
  {
    id: "lerony",
    title: "Lerony",
    description:
      "A technology company building software products that solve real-world problems across Africa.",
    longDescription:
      "Lerony is my software company focused on building impactful technology solutions for African markets. From SaaS tools to custom software development, Lerony bridges the gap between world-class engineering and local impact.",
    problem:
      "African businesses and individuals lack access to high-quality, locally-relevant software solutions.",
    solution:
      "Building a portfolio of software products and services tailored to African contexts with global standards.",
    impact:
      "Empowering businesses and individuals across Rwanda and Africa with reliable software tools.",
    technologies: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
    category: "saas",
    status: "live",
    featured: true,
    links: {
      live: "https://lerony.com",
    },
    year: 2024,
  },
  {
    id: "agrivoice",
    title: "AgriVoice Rwanda",
    description:
      "An AI-powered agricultural assistant helping Rwandan farmers with voice-based crop guidance and market insights.",
    longDescription:
      "AgriVoice provides Rwandan farmers with AI-powered assistance through voice interfaces, offering crop disease diagnosis, weather alerts, market prices, and best practices in Kinyarwanda.",
    problem:
      "Rwandan smallholder farmers lack accessible, real-time agricultural knowledge and market data.",
    solution:
      "Voice-first AI assistant that speaks to farmers in their language with locally-relevant agricultural intelligence.",
    impact:
      "Improving crop yields and farmer income through AI-powered agricultural guidance.",
    technologies: ["React", "Express", "OpenAI API", "PostgreSQL", "PWA"],
    category: "ai",
    status: "in-progress",
    featured: true,
    links: {
      github: "https://github.com/GanzaParfait/agrivoice",
    },
    year: 2025,
  },
  {
    id: "tut-labs",
    title: "TUT Labs",
    description:
      "A technology security and defense company providing cutting-edge solutions for critical infrastructure protection.",
    longDescription:
      "TUT Labs develops advanced security technologies including body armor innovations, signal intelligence systems, and corporate security solutions.",
    problem:
      "Organizations need reliable, sophisticated security solutions that balance protection with practicality.",
    solution:
      "Building a comprehensive security technology portfolio with a focus on R&D and innovation.",
    impact:
      "Enhancing security capabilities for governments, corporations, and institutions.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Framer Motion",
      "Three.js",
      "Tailwind CSS",
    ],
    category: "web",
    status: "live",
    featured: true,
    links: {
      live: "https://gettutlabs.com",
    },
    year: 2025,
  },
  {
    id: "gotallnews",
    title: "GotAllNews",
    description:
      "A modern media platform aggregating news with intelligent categorization and personalized feeds.",
    longDescription:
      "GotAllNews is a React-powered news aggregation platform with advanced search, FULLTEXT indexing, and Cloudinary-powered media pipeline.",
    technologies: [
      "React",
      "PHP",
      "MySQL",
      "Cloudinary",
      "Recharts",
      "Tailwind CSS",
    ],
    category: "web",
    status: "live",
    featured: false,
    links: {},
    year: 2025,
  },
  {
    id: "caritas-portal",
    title: "Caritas Digital Portal",
    description:
      "A comprehensive web platform for a humanitarian organization with CMS, donation management, and impact reporting.",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Stripe"],
    category: "web",
    status: "live",
    featured: false,
    links: {},
    year: 2024,
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

export const blogPosts: BlogPost[] = [
  {
    id: "building-ai-africa",
    title: "Building AI Products for African Markets: Lessons Learned",
    excerpt:
      "What I've learned from building AI-powered tools for contexts where internet connectivity is limited and local languages are underrepresented in training data.",
    category: "AI",
    readTime: "8 min read",
    date: "2025-07-15",
    featured: true,
    slug: "building-ai-africa",
    tags: ["AI", "Africa", "Product Development", "Machine Learning"],
  },
  {
    id: "from-student-to-founder",
    title: "From Student to Founder: Building Lerony from Scratch",
    excerpt:
      "The raw, honest story of starting a technology company in Rwanda — the challenges, the wins, and everything in between.",
    category: "Entrepreneurship",
    readTime: "12 min read",
    date: "2025-06-20",
    featured: true,
    slug: "from-student-to-founder",
    tags: ["Entrepreneurship", "Rwanda", "Startups", "Lerony"],
  },
  {
    id: "nextjs-performance-2025",
    title: "Achieving 100 Lighthouse Score with Next.js in 2025",
    excerpt:
      "A practical, step-by-step guide to optimizing a Next.js application for perfect Lighthouse scores across all metrics.",
    category: "Software Engineering",
    readTime: "10 min read",
    date: "2025-05-10",
    featured: false,
    slug: "nextjs-performance-2025",
    tags: ["Next.js", "Performance", "Web Development", "Lighthouse"],
  },
  {
    id: "why-i-code",
    title: "Why I Code: On Purpose, Craft, and Impact",
    excerpt:
      "A reflection on what drives me to write software every day, and why I believe code is one of the most powerful tools for social change.",
    category: "Leadership",
    readTime: "6 min read",
    date: "2025-04-05",
    featured: false,
    slug: "why-i-code",
    tags: ["Leadership", "Career", "Purpose", "Software Engineering"],
  },
];

export type Skill = {
  name: string;
  category: string;
};

export const skills: Skill[] = [
  // Frontend
  { name: "Next.js", category: "Frontend" },
  { name: "React", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  // Backend
  { name: "Node.js", category: "Backend" },
  { name: "Express", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "MySQL", category: "Backend" },
  { name: "Prisma", category: "Backend" },
  // AI/ML
  { name: "OpenAI API", category: "AI/ML" },
  { name: "LangChain", category: "AI/ML" },
  { name: "Python", category: "AI/ML" },
  // DevOps
  { name: "Vercel", category: "DevOps" },
  { name: "AWS", category: "DevOps" },
  { name: "Docker", category: "DevOps" },
  { name: "Git", category: "DevOps" },
];

export type TimelineItem = {
  year: string;
  title: string;
  organization: string;
  description: string;
  type: "education" | "work" | "milestone";
};

export const timeline: TimelineItem[] = [
  {
    year: "2025",
    title: "Founder & CEO",
    organization: "Lerony",
    description:
      "Building a technology company focused on creating impactful software products for African markets.",
    type: "work",
  },
  {
    year: "2024",
    title: "Full Stack Developer",
    organization: "Freelance",
    description:
      "Delivering high-quality web applications for clients across Rwanda and internationally.",
    type: "work",
  },
  {
    year: "2024",
    title: "AI Builder",
    organization: "Independent",
    description:
      "Began specializing in AI-powered applications, building tools that leverage LLMs for real-world impact.",
    type: "milestone",
  },
  {
    year: "2023",
    title: "Computer Science Studies",
    organization: "University of Rwanda",
    description:
      "Deepening foundations in algorithms, data structures, and software engineering principles.",
    type: "education",
  },
  {
    year: "2022",
    title: "First Open Source Contribution",
    organization: "GitHub",
    description:
      "Started contributing to open source projects and building a public track record as a developer.",
    type: "milestone",
  },
];

export type SpeakingEngagement = {
  title: string;
  event: string;
  location: string;
  date: string;
  type: "conference" | "workshop" | "panel" | "podcast";
  topic: string;
};

export const speakingEngagements: SpeakingEngagement[] = [
  {
    title: "AI in African Contexts",
    event: "Rwanda Tech Summit",
    location: "Kigali, Rwanda",
    date: "2025",
    type: "conference",
    topic: "Building AI products that work in low-resource environments",
  },
  {
    title: "From Idea to Product",
    event: "University of Rwanda Tech Week",
    location: "Kigali, Rwanda",
    date: "2024",
    type: "workshop",
    topic: "Entrepreneurship and software development for students",
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
    id: "web-development",
    title: "Web Development",
    description:
      "Building fast, accessible, and scalable web applications using modern technologies.",
    features: [
      "Next.js & React applications",
      "Full-stack development",
      "API design and integration",
      "Performance optimization",
      "Responsive & mobile-first",
    ],
    icon: "globe",
  },
  {
    id: "ai-integration",
    title: "AI Integration",
    description:
      "Integrating AI capabilities into your products and workflows to unlock new possibilities.",
    features: [
      "LLM integration & fine-tuning",
      "AI-powered features",
      "Chatbots & assistants",
      "Data analysis tools",
      "Voice AI applications",
    ],
    icon: "brain-circuit",
  },
  {
    id: "consulting",
    title: "Technical Consulting",
    description:
      "Strategic technology guidance for startups and established companies scaling their digital products.",
    features: [
      "Architecture review",
      "Tech stack selection",
      "Code review & audits",
      "Team mentoring",
      "Growth strategy",
    ],
    icon: "puzzle",
  },
  {
    id: "speaking",
    title: "Speaking & Workshops",
    description:
      "Sharing knowledge through keynotes, workshops, and panels at tech events and universities.",
    features: [
      "Conference keynotes",
      "Technical workshops",
      "University talks",
      "Podcast appearances",
      "Panel discussions",
    ],
    icon: "mic",
  },
];
