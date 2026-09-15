"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiUserLine,
  RiChat1Line,
  RiFileTextLine,
  RiSendPlaneLine,
  RiLockLine,
  RiCalendarLine,
  RiWhatsappLine,
  RiLinkedinBoxLine,
  RiArrowRightUpLine,
  RiAddLine,
  RiSubtractLine,
  RiShareForwardLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { setting } from "@/lib/hero";
import { socialIcon, socialsFor } from "@/lib/socials";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import AnimatedSection from "@/components/ui/AnimatedSection";

type FormState = "idle" | "loading" | "success" | "error";

const contactReasons = [
  "Project / Freelance Work",
  "Technical Consulting",
  "Speaking Invitation",
  "Collaboration",
  "Other",
];

const faqs = [
  {
    q: "How long does it take to get a response?",
    a: "Most serious inquiries receive a reply within 24 hours on business days (Kigali, UTC+2).",
  },
  {
    q: "Do you offer freelance or consulting services?",
    a: "Project and systems work is possible when the brief is a fit. Share context in the form and we can decide next steps.",
  },
  {
    q: "Can we schedule a call instead of email?",
    a: "Yes. Use Book a conversation when the calendar is connected, or reach out on WhatsApp for a quick intro.",
  },
  {
    q: "Where are you based?",
    a: "Kigali, Rwanda. Remote collaboration is welcome.",
  },
];

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Kigali%2C%20Rwanda";

export default function ContactPageClient() {
  const settings = useSiteSettings();
  const email = setting(settings, "contactEmail");
  const location = setting(settings, "location");
  const phone = settings.phoneNumber || "";
  const whatsapp = socialsFor(settings, "contact").find((link) => link.platform === "whatsapp")?.url;
  const contactSocials = socialsFor(settings, "contact").filter((link) =>
    ["linkedin", "github", "instagram", "youtube", "twitter", "x", "whatsapp"].includes(link.platform),
  );
  const booking = configuredBookingUrl(settings.bookingCalendarUrl);
  const linkedin = contactSocials.find((link) => link.platform === "linkedin")?.url;
  const [formState, setFormState] = useState<FormState>("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Send failed");
      }
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const messageLen = formData.message.length;

  const connectCards = [
    {
      title: "Book a conversation",
      body: "Pick a time that works for you.",
      href: booking || "#send",
      external: Boolean(booking),
      icon: <RiCalendarLine size={22} />,
      tone: "blue" as const,
    },
    {
      title: "Chat on WhatsApp",
      body: "Quick questions? Let's chat.",
      href: WHATSAPP_CALL_URL,
      external: true,
      icon: <RiWhatsappLine size={22} />,
      tone: "green" as const,
    },
    {
      title: "Connect on LinkedIn",
      body: "For professional networking.",
      href: linkedin || "https://www.linkedin.com/",
      external: true,
      icon: <RiLinkedinBoxLine size={22} />,
      tone: "purple" as const,
    },
    {
      title: "General inquiries",
      body: "Partnerships, media, or other.",
      href: `mailto:${email}`,
      external: true,
      icon: <RiMailLine size={22} />,
      tone: "slate" as const,
    },
  ];

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <AnimatedSection direction="left" className="contact-form-card">
          {formState === "success" ? (
            <div className="contact-success" role="status" aria-live="polite">
              <div className="contact-success-icon">
                <RiCheckLine size={28} />
              </div>
              <h3>Message sent</h3>
              <p>Thanks for reaching out. I&apos;ll get back to you within 24 hours.</p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setFormState("idle");
                  setFormData({ name: "", email: "", reason: "", message: "" });
                }}
              >
                Send another
              </button>
            </div>
          ) : (
            <>
              <p className="section-label">Send a message</p>
              <h1 className="contact-title">Start a conversation</h1>
              <p className="contact-lead">
                Have a project, a question, or just want to say hello? Fill out the form below and I&apos;ll
                get back to you as soon as possible.
              </p>

              {formState === "error" ? (
                <div className="contact-error" role="alert" aria-live="assertive">
                  <RiErrorWarningLine size={16} />
                  Something went wrong. Please try again.
                </div>
              ) : null}

              <form onSubmit={handleSubmit} aria-label="Contact form" noValidate className="contact-form">
                <div className="contact-form-row">
                  <label className="contact-field" htmlFor="contact-name">
                    <span>
                      Full name <em>*</em>
                    </span>
                    <span className="contact-control">
                      <RiUserLine aria-hidden />
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </span>
                  </label>

                  <label className="contact-field" htmlFor="contact-email">
                    <span>
                      Email address <em>*</em>
                    </span>
                    <span className="contact-control">
                      <RiMailLine aria-hidden />
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </span>
                  </label>
                </div>

                <label className="contact-field" htmlFor="contact-reason">
                  <span>Reason for contact</span>
                  <span className="contact-control">
                    <RiChat1Line aria-hidden />
                    <select
                      id="contact-reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select a reason
                      </option>
                      {contactReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="contact-field" htmlFor="contact-message">
                  <span>
                    Message <em>*</em>
                  </span>
                  <span className="contact-control contact-control-area">
                    <RiFileTextLine aria-hidden />
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={6}
                      maxLength={1000}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell me about your project, question, or idea..."
                    />
                  </span>
                  <small className="contact-count">{messageLen}/1000</small>
                </label>

                <button
                  type="submit"
                  className="btn btn-primary contact-submit"
                  disabled={formState === "loading"}
                  aria-busy={formState === "loading"}
                >
                  {formState === "loading" ? (
                    "Sending..."
                  ) : (
                    <>
                      <RiSendPlaneLine size={17} />
                      Send Message
                    </>
                  )}
                </button>

                <p className="contact-safe">
                  <RiLockLine size={13} aria-hidden />
                  Your information is safe and will never be shared.
                </p>
              </form>
            </>
          )}
        </AnimatedSection>

        <AnimatedSection delay={100} direction="right" className="contact-aside">
          <div className="contact-info-card">
            <p className="section-label">Contact information</p>
            <ul className="contact-info-list">
              <li>
                <a href={`mailto:${email}`} className="contact-info-row">
                  <span className="contact-info-icon">
                    <RiMailLine size={18} />
                  </span>
                  <span>
                    <small>Email</small>
                    <strong>{email}</strong>
                  </span>
                </a>
              </li>
              {phone ? (
                <li>
                  <a href={whatsapp || `tel:${phone.replace(/\s/g, "")}`} className="contact-info-row">
                    <span className="contact-info-icon">
                      <RiPhoneLine size={18} />
                    </span>
                    <span>
                      <small>Phone</small>
                      <strong>{phone}</strong>
                    </span>
                  </a>
                </li>
              ) : null}
              <li>
                <div className="contact-info-row">
                  <span className="contact-info-icon">
                    <RiMapPinLine size={18} />
                  </span>
                  <span>
                    <small>Location</small>
                    <strong>{location}</strong>
                  </span>
                </div>
              </li>
              <li>
                <div className="contact-info-row contact-info-socials">
                  <span className="contact-info-icon">
                    <RiShareForwardLine size={18} />
                  </span>
                  <span>
                    <small>Follow me</small>
                    <span className="contact-socials">
                      {contactSocials.slice(0, 5).map((link) => {
                        const Icon = socialIcon(link.platform);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.label}
                          >
                            <Icon size={16} />
                          </a>
                        );
                      })}
                    </span>
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="contact-map-card">
            <div className="contact-map-sky" aria-hidden>
              <svg viewBox="0 0 640 320" preserveAspectRatio="xMidYMax slice">
                <defs>
                  <linearGradient id="contactSky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e3a5f" />
                    <stop offset="45%" stopColor="#3d5a80" />
                    <stop offset="78%" stopColor="#c4784a" />
                    <stop offset="100%" stopColor="#1a1030" />
                  </linearGradient>
                </defs>
                <rect width="640" height="320" fill="url(#contactSky)" />
                <circle cx="520" cy="72" r="28" fill="#f6d6a8" opacity="0.9" />
                <g fill="#0b1220">
                  <rect x="40" y="170" width="48" height="150" rx="2" />
                  <rect x="100" y="140" width="70" height="180" rx="2" />
                  <rect x="180" y="155" width="42" height="165" rx="2" />
                  <rect x="235" y="120" width="88" height="200" rx="2" />
                  <rect x="335" y="150" width="55" height="170" rx="2" />
                  <rect x="400" y="110" width="95" height="210" rx="2" />
                  <rect x="510" y="160" width="60" height="160" rx="2" />
                  <rect x="580" y="145" width="40" height="175" rx="2" />
                </g>
                <g fill="#f8e7a0" opacity="0.55">
                  <rect x="112" y="158" width="8" height="8" />
                  <rect x="130" y="180" width="8" height="8" />
                  <rect x="250" y="140" width="8" height="8" />
                  <rect x="270" y="170" width="8" height="8" />
                  <rect x="420" y="130" width="8" height="8" />
                  <rect x="445" y="160" width="8" height="8" />
                  <rect x="470" y="145" width="8" height="8" />
                </g>
              </svg>
            </div>
            <div className="contact-map-footer">
              <p>
                <RiMapPinLine size={15} aria-hidden />
                <span>
                  {location}
                  <em>Innovation thrives here.</em>
                </span>
              </p>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="contact-map-btn">
                View on Google Maps
                <RiExternalLinkLine size={13} />
              </a>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <AnimatedSection className="contact-connect">
        <h2>Other ways to connect</h2>
        <div className="contact-connect-grid">
          {connectCards.map((card) => {
            const inner = (
              <>
                <span className={`contact-connect-icon is-${card.tone}`}>{card.icon}</span>
                <span className="contact-connect-copy">
                  <strong>{card.title}</strong>
                  <small>{card.body}</small>
                </span>
                <span className="contact-connect-arrow">
                  <RiArrowRightUpLine size={16} />
                </span>
              </>
            );
            if (card.external) {
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-connect-card"
                >
                  {inner}
                </a>
              );
            }
            return (
              <Link key={card.title} href={card.href} className="contact-connect-card">
                {inner}
              </Link>
            );
          })}
        </div>
      </AnimatedSection>

      <div id="faq">
        <AnimatedSection className="contact-faq">
          <div className="contact-faq-head">
            <div>
              <p className="section-label">Quick questions</p>
              <h2>Frequently asked questions</h2>
            </div>
          </div>
          <div className="contact-faq-grid">
            {faqs.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q} className={`contact-faq-item${open ? " is-open" : ""}`}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : index)}
                  >
                    <span>{item.q}</span>
                    <i>{open ? <RiSubtractLine size={16} /> : <RiAddLine size={16} />}</i>
                  </button>
                  {open ? <p>{item.a}</p> : null}
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
