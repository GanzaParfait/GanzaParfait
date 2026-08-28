"use client";

import { useState } from "react";
import {
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiCheckLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { setting } from "@/lib/hero";
import { socialIcon, socialsFor } from "@/lib/socials";
import AnimatedSection from "@/components/ui/AnimatedSection";

type FormState = "idle" | "loading" | "success" | "error";

const contactReasons = [
  "Project / Freelance Work",
  "Technical Consulting",
  "Speaking Invitation",
  "Collaboration",
  "Other",
];

export default function ContactPageClient() {
  const settings = useSiteSettings();
  const email = setting(settings, "contactEmail");
  const location = setting(settings, "location");
  const phone = settings.phoneNumber || "";
  const whatsapp = socialsFor(settings, "contact").find((link) => link.platform === "whatsapp")?.url;
  const contactSocials = socialsFor(settings, "contact");
  const [formState, setFormState] = useState<FormState>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    const subject = encodeURIComponent(
      formData.reason ? `${formData.reason} — ${formData.name}` : `Message from ${formData.name}`
    );
    const body = encodeURIComponent(
      `${formData.message}\n\n— ${formData.name}\n${formData.email}`
    );

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setFormState("success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
      {/* Contact info */}
      <AnimatedSection className="lg:col-span-2 flex flex-col gap-6" direction="left">
        <div>
          <p className="section-label">Contact</p>
          <h1
            className="theme-heading mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Let&apos;s talk.
          </h1>
          <p className="theme-copy leading-relaxed">
            Whether you have a project, a systems problem, or a training brief — write with a real context. I will reply from this address.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 theme-copy">
            <div
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-[#0E52A8]"
              aria-hidden="true"
            >
              <RiMailLine size={18} />
            </div>
            <div>
              <p className="text-xs theme-muted mb-0.5">Email</p>
              <a
                href={`mailto:${email}`}
                className="text-sm theme-heading hover:text-[#60a5fa] transition-colors"
              >
                {email}
              </a>
            </div>
          </div>

          {phone ? (
          <div className="flex items-center gap-3 theme-copy">
            <div
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-[#0E52A8]"
              aria-hidden="true"
            >
              <RiPhoneLine size={18} />
            </div>
            <div>
              <p className="text-xs theme-muted mb-0.5">Phone</p>
              <a href={whatsapp || `tel:${phone.replace(/\s/g, "")}`} className="text-sm theme-heading hover:text-[#60a5fa] transition-colors">
                {phone}
              </a>
            </div>
          </div>
          ) : null}

          <div className="flex items-center gap-3 theme-copy">
            <div
              className="w-10 h-10 rounded-lg glass flex items-center justify-center text-[#0E52A8]"
              aria-hidden="true"
            >
              <RiMapPinLine size={18} />
            </div>
            <div>
              <p className="text-xs theme-muted mb-0.5">Location</p>
              <p className="text-sm theme-heading">{location} 🇷🇼</p>
            </div>
          </div>
        </div>

        {/* Social links */}
        <div>
          <p className="text-xs theme-muted uppercase tracking-widest mb-3">
            Social
          </p>
          <div className="flex gap-3">
            {contactSocials.map((link) => {
              const Icon = socialIcon(link.platform);
              return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="w-10 h-10 rounded-lg glass flex items-center justify-center theme-copy hover:border-[rgba(14,82,168,0.5)] transition-all"
              >
                <Icon size={17} />
              </a>
              );
            })}
          </div>
        </div>

        {/* Response time */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              aria-hidden="true"
            />
            <p className="text-xs font-semibold text-emerald-400">Usually responds within 24h</p>
          </div>
          <p className="text-xs theme-muted">
            Based in Kigali, Rwanda (UTC+2). I try to respond to every serious inquiry.
          </p>
        </div>
      </AnimatedSection>

      {/* Form */}
      <AnimatedSection className="lg:col-span-3" delay={150}>
        <div className="card p-8">
          {formState === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
              <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center mb-4">
                <RiCheckLine size={28} className="text-emerald-400" />
              </div>
              <h3
                className="theme-heading font-semibold text-xl mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Message sent!
              </h3>
              <p className="theme-copy text-sm max-w-xs">
                Thanks for reaching out. I&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={() => {
                  setFormState("idle");
                  setFormData({ name: "", email: "", reason: "", message: "" });
                }}
                className="btn btn-outline btn-sm mt-6"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} aria-label="Contact form" noValidate>
              <h2
                className="theme-heading font-semibold text-lg mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Send a message
              </h2>

              {formState === "error" && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 mb-4 text-sm text-red-400"
                  role="alert"
                  aria-live="assertive"
                >
                  <RiErrorWarningLine size={16} />
                  Something went wrong. Please try again.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-medium theme-copy mb-1.5"
                  >
                    Full Name <span aria-label="required" className="text-[#0E52A8]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="theme-input w-full border border-[rgba(14,82,168,0.2)] rounded-lg px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#0E52A8] transition-colors"
                    autoComplete="name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium theme-copy mb-1.5"
                  >
                    Email <span aria-label="required" className="text-[#0E52A8]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="theme-input w-full border border-[rgba(14,82,168,0.2)] rounded-lg px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#0E52A8] transition-colors"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <label
                  htmlFor="contact-reason"
                  className="block text-xs font-medium theme-copy mb-1.5"
                >
                  Reason for contact
                </label>
                <select
                  id="contact-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="theme-input w-full border border-[rgba(14,82,168,0.2)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#0E52A8] transition-colors"
                >
                  <option value="" disabled>
                    Select a reason
                  </option>
                  {contactReasons.map((reason) => (
                    <option key={reason} value={reason} style={{ background: "var(--color-bg)" }}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium theme-copy mb-1.5"
                >
                  Message <span aria-label="required" className="text-[#0E52A8]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell me about your project, question, or idea..."
                  className="theme-input w-full border border-[rgba(14,82,168,0.2)] rounded-lg px-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#0E52A8] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={formState === "loading"}
                className="btn btn-primary w-full justify-center"
                aria-busy={formState === "loading"}
              >
                {formState === "loading" ? (
                  <>
                    <span
                      className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      aria-hidden="true"
                    />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          )}
        </div>
      </AnimatedSection>
    </div>
  );
}
