import Link from "next/link";
import Image from "next/image";
import {
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiTiktokFill,
  RiWhatsappLine,
  RiCupLine,
  RiThreadsLine,
} from "react-icons/ri";
import { siteConfig } from "@/data/site-data";
import BackToTop from "@/components/ui/BackToTop";

const navGroups = [
  {
    label: "Pages",
    links: [
      { label: "Home",     href: "/" },
      { label: "About",    href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Blog",     href: "/blog" },
    ],
  },
  {
    label: "Work with me",
    links: [
      { label: "Services", href: "/services" },
      { label: "Speaking", href: "/speaking" },
      { label: "Contact",  href: "/contact" },
    ],
  },
];

const socialLinks = [
  { href: siteConfig.social.github,       label: "GitHub",          icon: RiGithubFill },
  { href: siteConfig.social.linkedin,     label: "LinkedIn",        icon: RiLinkedinFill },
  { href: siteConfig.social.twitter,      label: "X / Twitter",     icon: RiTwitterXFill },
  { href: siteConfig.social.youtube,      label: "YouTube",         icon: RiYoutubeFill },
  { href: siteConfig.social.instagram,    label: "Instagram",       icon: RiInstagramFill },
  { href: siteConfig.social.tiktok,       label: "TikTok",          icon: RiTiktokFill },
  { href: siteConfig.social.whatsapp,     label: "WhatsApp",        icon: RiWhatsappLine },
  { href: siteConfig.social.threads,      label: "Threads",         icon: RiThreadsLine },
  { href: siteConfig.social.buymeacoffee, label: "Buy Me a Coffee", icon: RiCupLine },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer
        role="contentinfo"
        style={{
          background: "var(--color-bg-2)",
          borderTop: "1px solid var(--color-border)",
          position: "relative",
        }}
      >
        {/* Top accent */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "20rem",
            height: "1px",
            background: "linear-gradient(90deg, transparent, var(--color-primary), transparent)",
            opacity: 0.5,
          }}
        />

        <div className="container" style={{ padding: "3.5rem 1.5rem 2rem" }}>
          {/* Main grid — responsive */}
          <div style={{
            display: "grid",
            gap: "2.5rem",
            gridTemplateColumns: "repeat(1, 1fr)",
          }}
            className="sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link
                href="/"
                style={{ display: "inline-flex", alignItems: "center", marginBottom: "1rem", textDecoration: "none" }}
                aria-label="Home"
              >
                <div style={{ position: "relative", width: "10rem", height: "2.5rem" }}>
                  <Image
                    src="/brand/logos/logo-horizontal-blue.png"
                    alt="Prince Parfait GANZA"
                    fill
                    className="object-contain object-left footer-logo-dark"
                  />
                  <Image
                    src="/brand/logos/logo-horizontal-light.png"
                    alt="Prince Parfait GANZA"
                    fill
                    className="object-contain object-left footer-logo-light"
                    style={{ display: "none" }}
                  />
                </div>
              </Link>

              <p style={{
                fontSize: "0.875rem",
                color: "var(--color-text-2)",
                lineHeight: 1.75,
                maxWidth: "26rem",
                marginBottom: "1.5rem",
              }}>
                Founder, Software Engineer & AI Builder based in Kigali, Rwanda 🇷🇼.
                Building technology that creates real impact across Africa and beyond.
              </p>

              {/* Social icons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }} aria-label="Social media links">
                {socialLinks.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="footer-social-icon"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav groups */}
            {navGroups.map((group) => (
              <div key={group.label}>
                <h3 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text)",
                  marginBottom: "1rem",
                  letterSpacing: "-0.01em",
                }}>
                  {group.label}
                </h3>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }} role="list">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="footer-nav-link"
                        style={{
                          fontSize: "0.875rem",
                          color: "var(--color-text-2)",
                          textDecoration: "none",
                          transition: "color 0.15s ease",
                          display: "inline-block",
                        }}
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
          <div style={{
            marginTop: "3rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)" }}>
              © {year}{" "}
              <a href={siteConfig.url} style={{ color: "inherit", textDecoration: "none" }}>
                Prince Parfait GANZA
              </a>
              . All rights reserved.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <Link href="/contact" style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textDecoration: "none" }}>
                Privacy
              </Link>
              <a
                href={siteConfig.social.buymeacoffee}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.75rem", color: "var(--color-text-3)", textDecoration: "none" }}
              >
                ☕ Buy me a coffee
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating back-to-top button */}
      <BackToTop />
    </>
  );
}
