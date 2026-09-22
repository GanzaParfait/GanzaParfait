"use client";

import { useMemo, useState, type ReactNode, type ClipboardEvent } from "react";
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
  RiAddLine,
  RiSubtractLine,
  RiShareForwardLine,
  RiExternalLinkLine,
  RiLightbulbFlashLine,
  RiHandHeartLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { setting } from "@/lib/hero";
import { resolvedSocials, socialIcon, socialsFor } from "@/lib/socials";
import { contactPageFrom, type ContactPageContent, type ContactTopicIcon } from "@/lib/contact-page";
import { plainTextFromClipboard } from "@/lib/paste-plain-text";
import AnimatedSection from "@/components/ui/AnimatedSection";
import CustomSelect from "@/components/ui/CustomSelect";
import { siteConfig } from "@/data/site-data";

type FormState = "idle" | "loading" | "success" | "error";

function TopicIcon({ icon }: { icon: ContactTopicIcon }) {
  if (icon === "bulb") return <RiLightbulbFlashLine size={16} />;
  if (icon === "handshake") return <RiHandHeartLine size={16} />;
  if (icon === "plane") return <RiSendPlaneLine size={16} />;
  return <RiChat1Line size={16} />;
}

function FloatField({
  id,
  label,
  required,
  icon,
  children,
  area = false,
}: {
  id: string;
  label: string;
  required?: boolean;
  icon: ReactNode;
  children: ReactNode;
  area?: boolean;
}) {
  return (
    <div className={area ? "contact-float is-area" : "contact-float"}>
      <span className="contact-float-icon" aria-hidden="true">
        {icon}
      </span>
      {children}
      <label htmlFor={id} className="contact-float-label">
        {label}
        {required ? <em>*</em> : null}
      </label>
    </div>
  );
}

export default function ContactPageClient({
  content: contentOverride,
  embedded = false,
}: {
  content?: ContactPageContent;
  embedded?: boolean;
} = {}) {
  const settings = useSiteSettings();
  const page = contentOverride || contactPageFrom(settings);
  const email = setting(settings, "contactEmail");
  const location = setting(settings, "location");
  const phone = settings.phoneNumber || "";
  const whatsappDigits = (settings.whatsappNumber || "").replace(/\D/g, "");
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : undefined;

  const contactSocials = useMemo(() => {
    const all = resolvedSocials(settings).filter((link) => link.enabled && link.url);
    const contactPlaced = socialsFor(settings, "contact");
    const limit = Math.min(6, Math.max(1, page.cards.followSocialLimit || 4));
    const ids = page.cards.followSocialIds?.filter(Boolean) || [];
    if (ids.length) {
      const byId = new Map(all.map((link) => [link.id, link]));
      return ids.map((id) => byId.get(id)).filter(Boolean).slice(0, limit) as typeof all;
    }
    return contactPlaced.slice(0, limit);
  }, [settings, page.cards.followSocialIds, page.cards.followSocialLimit]);

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subscribeOffer, setSubscribeOffer] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeState, setSubscribeState] = useState<"idle" | "loading" | "done" | "error" | "done-no-mail">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "",
    message: "",
  });

  const MESSAGE_MAX = 4000;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
  };

  const handleMessagePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    const text = plainTextFromClipboard(event.clipboardData);
    if (!text) return;
    const el = event.currentTarget;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const next = `${el.value.slice(0, start)}${text}${el.value.slice(end)}`.slice(0, MESSAGE_MAX);
    setFormData((prev) => ({ ...prev, message: next }));
    if (formState === "error") {
      setFormState("idle");
      setErrorMessage("");
    }
    requestAnimationFrame(() => {
      try {
        const pos = Math.min(start + text.length, next.length);
        el.focus();
        el.setSelectionRange(pos, pos);
      } catch {
        /* ignore selection errors while extensions mutate the field */
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    const mail = formData.email.trim();
    const message = formData.message.trim();

    if (name.length < 2) {
      setFormState("error");
      setErrorMessage("A valid name is required.");
      return;
    }
    if (!mail.includes("@")) {
      setFormState("error");
      setErrorMessage("A valid email is required.");
      return;
    }
    if (message.length < 10) {
      setFormState("error");
      setErrorMessage("Please write a short message (at least 10 characters).");
      return;
    }

    setFormState("loading");
    setErrorMessage("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: mail,
          reason: formData.reason,
          message,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Send failed");
      }
      setSubscribeOffer(Boolean(payload.subscribeOffer));
      setSubscribeEmail(String(payload.email || mail).toLowerCase());
      setSubscribeState("idle");
      setFormState("success");
    } catch (error) {
      setFormState("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  const confirmSubscribe = async () => {
    if (!subscribeEmail.includes("@")) return;
    setSubscribeState("loading");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail, name: formData.name, confirm: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not subscribe");
      setSubscribeOffer(false);
      if (payload.mailError || payload.emailed === false) {
        setSubscribeState("done-no-mail");
      } else {
        setSubscribeState("done");
      }
    } catch {
      setSubscribeState("error");
    }
  };

  return (
    <div className={embedded ? "contact-page contact-embedded" : "contact-page"}>
      <section className="contact-intro" aria-label="Contact introduction">
        <div className="container contact-intro-grid">
          <AnimatedSection direction="left" className="contact-intro-copy">
            <p className="section-label">{page.hero.label}</p>
            <h1>{page.hero.title}</h1>
            <p className="contact-intro-body">{page.hero.body}</p>
            <ul className="contact-topics">
              {page.hero.topics.map((topic, index) => (
                <li key={topic.label} style={{ animationDelay: `${index * 60}ms` }}>
                  <span className="contact-topic-icon" aria-hidden="true">
                    <TopicIcon icon={topic.icon} />
                  </span>
                  <em>{topic.label}</em>
                </li>
              ))}
            </ul>
          </AnimatedSection>

          <AnimatedSection delay={60} direction="right" className="contact-intro-visual">
            <div className="contact-portrait-wrap">
              <div className="contact-portrait-glow" aria-hidden="true" />
              {page.hero.portrait ? (
                <img src={page.hero.portrait} alt={siteConfig.portraitAlt} className="contact-portrait" width={480} height={560} />
              ) : null}
              {page.hero.script ? <p className="contact-script">{page.hero.script}</p> : null}
            </div>
            <div className="contact-intro-meta">
              <strong>{settings.siteTitle}</strong>
              <span>{page.hero.roles}</span>
              <span className="contact-intro-place">
                <RiMapPinLine size={13} /> {location}
              </span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="contact-cards-band" aria-label="Contact channels">
        <div className="container contact-cards">
          <a href={`mailto:${email}`} className="contact-card">
            <span className="contact-card-icon">
              <RiMailLine size={16} />
            </span>
            <div className="contact-card-body">
              <small>Email</small>
              <strong>{email}</strong>
              <em>{page.cards.emailNote}</em>
            </div>
          </a>

          {page.cards.showPhone && (phone || whatsappHref) ? (
            <a href={whatsappHref || `tel:${phone.replace(/\s/g, "")}`} className="contact-card" target="_blank" rel="noopener noreferrer">
              <span className="contact-card-icon">
                <RiPhoneLine size={16} />
              </span>
              <div className="contact-card-body">
                <small>{page.cards.phoneLabel}</small>
                <strong>{phone || `+${whatsappDigits}`}</strong>
                <em>{page.cards.phoneNote}</em>
              </div>
            </a>
          ) : null}

          <div className="contact-card">
            <span className="contact-card-icon">
              <RiMapPinLine size={16} />
            </span>
            <div className="contact-card-body">
              <small>Location</small>
              <strong>{location}</strong>
              <em>{page.cards.locationNote}</em>
            </div>
          </div>

          <div className="contact-card">
            <span className="contact-card-icon">
              <RiShareForwardLine size={16} />
            </span>
            <div className="contact-card-body">
              <small>[Follow Me]</small>
              <div className="contact-card-socials">
                {contactSocials.map((link) => {
                  const Icon = socialIcon(link.platform);
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
              <em>[{page.cards.followNote}]</em>
            </div>
          </div>
        </div>
      </section>

      <section id="send" className="contact-converse" aria-label="Send a message">
        <div className="container">
          <div className="contact-converse-shell">
            <AnimatedSection direction="left" className="contact-form-panel">
              {formState === "loading" ? (
                <div className="contact-sending" role="status" aria-live="polite" aria-busy="true">
                  <div className="contact-sending-orb" aria-hidden="true">
                    <RiLoader4Line className="contact-sending-spin" size={52} />
                  </div>
                  <h3>Sending your message</h3>
                  <p>Just a moment while this reaches the inbox.</p>
                </div>
              ) : null}

              {formState === "success" ? (
                <div className="contact-success" role="status" aria-live="polite">
                  <div className="contact-success-icon">
                    <RiCheckLine size={26} />
                  </div>
                  <h3>Message sent</h3>
                  <p>
                    Thanks for reaching out. I&apos;ll get back to you soon.
                    {" "}Watch for a confirmation note at your email (and spam if needed).
                  </p>
                  {subscribeOffer ? (
                    <div className="contact-subscribe-offer">
                      <p>
                        Also get occasional updates at <strong>{subscribeEmail}</strong>?
                      </p>
                      <div className="contact-subscribe-offer-actions">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => void confirmSubscribe()}
                          disabled={subscribeState === "loading"}
                        >
                          {subscribeState === "loading" ? "Subscribing…" : "Yes, subscribe"}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSubscribeOffer(false)}>
                          No thanks
                        </button>
                      </div>
                      {subscribeState === "error" ? <small>Could not confirm subscription. Try again.</small> : null}
                    </div>
                  ) : null}
                  {subscribeState === "done" ? (
                    <p className="contact-subscribe-done">You&apos;re subscribed. Welcome — check your inbox for a note.</p>
                  ) : null}
                  {subscribeState === "done-no-mail" ? (
                    <p className="contact-subscribe-done">
                      You&apos;re on the list. The welcome email couldn&apos;t send just now — you&apos;ll still hear from me when there&apos;s an update.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setFormState("idle");
                      setSubscribeOffer(false);
                      setSubscribeState("idle");
                      setFormData({ name: "", email: "", reason: "", message: "" });
                    }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                <div className={formState === "loading" ? "contact-form-stack is-sending" : "contact-form-stack"}>
                  <p className="section-label">{page.form.label}</p>
                  <h2 className="contact-form-title">{page.form.title}</h2>
                  {page.form.subtitle ? <p className="contact-form-lead">{page.form.subtitle}</p> : null}

                  {formState === "error" && errorMessage ? (
                    <div className="contact-error" role="alert" aria-live="assertive">
                      <RiErrorWarningLine size={16} />
                      {errorMessage}
                    </div>
                  ) : null}

                  <form onSubmit={handleSubmit} aria-label="Contact form" noValidate className="contact-form">
                    <div className="contact-form-row">
                      <FloatField id="contact-name" label="Full Name" required icon={<RiUserLine size={16} />}>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Your name"
                          autoComplete="name"
                          disabled={formState === "loading"}
                        />
                      </FloatField>

                      <FloatField id="contact-email" label="Email Address" required icon={<RiMailLine size={16} />}>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={formState === "loading"}
                        />
                      </FloatField>
                    </div>

                    <div className={`contact-float has-select${formData.reason ? " has-value" : ""}`}>
                      <CustomSelect
                        id="contact-reason"
                        name="reason"
                        aria-label="Subject"
                        value={formData.reason}
                        placeholder="Select a subject"
                        icon={<RiChat1Line size={16} />}
                        className="contact-cselect"
                        options={page.form.subjects.map((subject) => ({ value: subject, label: subject }))}
                        onChange={(reason) => {
                          setFormData((prev) => ({ ...prev, reason }));
                          if (formState === "error") {
                            setFormState("idle");
                            setErrorMessage("");
                          }
                        }}
                      />
                      <label htmlFor="contact-reason" className="contact-float-label">
                        Subject
                      </label>
                    </div>

                    <FloatField id="contact-message" label="Message" required icon={<RiFileTextLine size={16} />} area>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={6}
                        maxLength={MESSAGE_MAX}
                        value={formData.message}
                        onChange={handleChange}
                        onPaste={handleMessagePaste}
                        required
                        placeholder="Tell me about your project, question, or idea..."
                        disabled={formState === "loading"}
                        style={{ whiteSpace: "pre-wrap" }}
                      />
                      <span className="contact-count">{formData.message.length}/{MESSAGE_MAX}</span>
                    </FloatField>

                    <button type="submit" className="btn btn-primary contact-submit" disabled={formState === "loading"} aria-busy={formState === "loading"}>
                      Send Message <RiSendPlaneLine size={16} />
                    </button>

                    <p className="contact-safe">
                      <RiLockLine size={12} aria-hidden />
                      {page.form.privacyNote}{" "}
                      <Link href="/privacy">Privacy</Link>
                    </p>
                  </form>
                </div>
              )}
            </AnimatedSection>

            <AnimatedSection delay={80} direction="right" className="contact-media-panel">
              <div className={page.media.cityImage ? "contact-city has-image" : "contact-city"}>
                {page.media.cityImage ? <img src={page.media.cityImage} alt="" width={800} height={420} /> : null}
                <div className="contact-city-copy">
                  <strong>{page.media.cityCaption}</strong>
                  <span>{page.media.cityTagline}</span>
                  <a className="contact-city-maps" href={page.media.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {page.media.mapsLabel} <RiExternalLinkLine size={12} />
                  </a>
                </div>
              </div>

              <div className="contact-map-card">
                <iframe
                  title="Map of Kigali, Rwanda"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=30.02%2C-1.99%2C30.12%2C-1.91&layer=mapnik&marker=-1.9441%2C30.0619"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a className="contact-map-btn" href={page.media.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {page.media.mapsLabel} <RiExternalLinkLine size={13} />
                </a>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section id="faq" className="contact-faq" aria-label="Frequently asked questions">
        <div className="container">
          <div className="contact-faq-head">
            <div>
              <p className="section-label">{page.faq.label}</p>
              <h2>{page.faq.title}</h2>
            </div>
          </div>

          <div className="contact-faq-grid">
            {page.faq.items.map((item, index) => {
              const open = openFaq === index;
              return (
                <div key={item.q} className={open ? "contact-faq-item is-open" : "contact-faq-item"}>
                  <button type="button" aria-expanded={open} onClick={() => setOpenFaq(open ? null : index)}>
                    <span>{item.q}</span>
                    <i>{open ? <RiSubtractLine size={15} /> : <RiAddLine size={15} />}</i>
                  </button>
                  <div className="contact-faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
