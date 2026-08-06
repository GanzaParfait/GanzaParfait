"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { RiMenuLine, RiCloseLine, RiGithubFill, RiLinkedinFill, RiTwitterXFill } from "react-icons/ri";
import { siteConfig } from "@/data/site-data";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/services", label: "Services" },
  { href: "/speaking", label: "Speaking" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header
        role="banner"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-[rgba(5,8,22,0.85)] backdrop-blur-xl border-b border-[rgba(14,82,168,0.2)]"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Prince Parfait GANZA — Home"
            className="flex items-center gap-3 group"
          >
            <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/brand/icons/icon-blue.png"
                alt="Prince Parfait GANZA logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span
              className="font-heading font-semibold text-white hidden sm:block text-[0.9375rem] tracking-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Prince Parfait
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-1"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white bg-[rgba(14,82,168,0.2)] border border-[rgba(14,82,168,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Social links — desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="btn btn-ghost btn-icon text-slate-400 hover:text-white"
              >
                <RiGithubFill size={18} />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="btn btn-ghost btn-icon text-slate-400 hover:text-white"
              >
                <RiLinkedinFill size={18} />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) profile"
                className="btn btn-ghost btn-icon text-slate-400 hover:text-white"
              >
                <RiTwitterXFill size={16} />
              </a>
            </div>

            {/* CTA */}
            <Link
              href="/contact"
              className="btn btn-primary btn-sm hidden sm:inline-flex"
            >
              Let&apos;s Talk
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn btn-ghost btn-icon lg:hidden text-white"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <RiCloseLine size={22} /> : <RiMenuLine size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[rgba(5,8,22,0.95)] backdrop-blur-xl"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        {/* Menu content */}
        <nav
          className={`absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#050816] border-l border-[rgba(14,82,168,0.2)] flex flex-col pt-24 pb-8 px-8 transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1 flex-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white bg-[rgba(14,82,168,0.2)] border border-[rgba(14,82,168,0.3)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                style={{ transitionDelay: isOpen ? `${i * 40}ms` : "0ms" }}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile social + CTA */}
          <div className="flex flex-col gap-4 mt-8">
            <Link href="/contact" className="btn btn-primary w-full justify-center">
              Let&apos;s Talk
            </Link>
            <div className="flex items-center justify-center gap-4">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <RiGithubFill size={22} />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <RiLinkedinFill size={22} />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <RiTwitterXFill size={20} />
              </a>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
