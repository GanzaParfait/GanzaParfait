import Link from "next/link";
import Image from "next/image";
import {
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiArrowUpLine,
} from "react-icons/ri";
import { siteConfig } from "@/data/site-data";

const footerLinks = {
  "Site Map": [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
  ],
  Work: [
    { label: "Services", href: "/services" },
    { label: "Speaking", href: "/speaking" },
    { label: "Contact", href: "/contact" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="relative border-t border-[rgba(14,82,168,0.15)] bg-[#050816]"
    >
      {/* Top glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-[#0E52A8] to-transparent opacity-50"
      />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group" aria-label="Home">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/brand/logos/logo-vertical-blue.png"
                  alt="Prince Parfait GANZA"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p
                  className="font-semibold text-white text-sm leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Prince Parfait GANZA
                </p>
                <p className="text-xs text-slate-500">Founder • Software Engineer • AI Builder</p>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
              {siteConfig.tagline} Building technology that creates real impact
              across Africa and beyond, one line of code at a time.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3" aria-label="Social media links">
              {[
                { href: siteConfig.social.github, label: "GitHub", icon: RiGithubFill },
                { href: siteConfig.social.linkedin, label: "LinkedIn", icon: RiLinkedinFill },
                { href: siteConfig.social.twitter, label: "X (Twitter)", icon: RiTwitterXFill },
                { href: siteConfig.social.youtube, label: "YouTube", icon: RiYoutubeFill },
                { href: siteConfig.social.instagram, label: "Instagram", icon: RiInstagramFill },
              ].map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white hover:border-[rgba(14,82,168,0.5)] transition-all duration-200"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3
                className="text-xs font-semibold uppercase tracking-widest text-[#0E52A8] mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {category}
              </h3>
              <ul className="flex flex-col gap-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-[rgba(14,82,168,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {year} Prince Parfait GANZA. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-600">
              Kigali, Rwanda 🇷🇼
            </span>
            <a
              href="#top"
              aria-label="Back to top"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors duration-150"
            >
              <RiArrowUpLine size={14} />
              Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
