"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { siteConfig, timeline } from "@/data/site-data";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import { homepageFrom } from "@/lib/homepage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialsFor, socialIcon } from "@/lib/socials";
import StoryVisual from "@/components/home/StoryVisual";

export default function HomeJourney() {
  const settings = useSiteSettings();
  const home = homepageFrom(settings);
  const booking = configuredBookingUrl(settings.bookingCalendarUrl);
  const socials = socialsFor(settings, "footer").slice(0, 4);
  const stories = home.work.stories;
  const [focus, setFocus] = useState("All");
  const [knowledge, setKnowledge] = useState(0);
  const [progress, setProgress] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  const filters = ["All", ...Array.from(new Set(stories.flatMap((story) => story.tags)))];
  const visible = stories.filter((story) => focus === "All" || story.tags.includes(focus));

  useEffect(() => {
    const node = document.getElementById("journey");
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const rect = node.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.35;
      const seen = Math.min(Math.max(-rect.top + window.innerHeight * 0.2, 0), Math.max(total, 1));
      setProgress(total <= 0 ? 1 : seen / total);
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setPageProgress(height <= 0 ? 0 : window.scrollY / height);
    };
    update();
      if (reduce) {
        setProgress(1);
        setPageProgress(0);
        return;
      }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${pageProgress})` }} />
      </div>

      <section className="manifesto" id="manifesto" aria-label="Opening statement">
        <div className="container manifesto-grid">
          <div className="manifesto-copy">
            <p className="section-label">{home.manifesto.label}</p>
            <h2>{home.manifesto.title}</h2>
            <p>{home.manifesto.body}</p>
            <ol>
              {home.manifesto.points.map((point) => (
                <li key={point.title}><strong>{point.title}</strong><span>{point.body}</span></li>
              ))}
            </ol>
          </div>
          {home.manifesto.image ? (
            <img src={home.manifesto.image} alt="" className="manifesto-photo" width={1024} height={1536} />
          ) : null}
        </div>
      </section>

      <section className="work-stories" id="work" aria-label="Selected work">
        <div className="container">
          <div className="work-stories-head">
            <div>
              <p className="section-label">{home.work.label}</p>
              <h2>{home.work.title}</h2>
            </div>
            <div className="work-filters" role="tablist" aria-label="Filter work">
              {filters.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={focus === item} className={focus === item ? "is-on" : undefined} onClick={() => setFocus(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="work-story-list">
            {visible.map((story) => (
                <article key={story.id} className="work-story">
                  <div className="work-story-copy">
                    <p>{String(stories.findIndex((item) => item.id === story.id) + 1).padStart(2, "0")}</p>
                    <h3>{story.title}</h3>
                    <p className="work-story-line">{story.line}</p>
                    <p className="work-story-support">{story.support}</p>
                    <p><strong>Challenge. </strong>{story.challenge}</p>
                    <p><strong>Contribution. </strong>{story.contribution}</p>
                    <p><strong>Status. </strong>{story.status}</p>
                    <Link href={story.href}>View case study <RiArrowRightLine size={16} /></Link>
                  </div>
                  <StoryVisual images={story.images} title={story.title} organization={story.organization} />
                </article>
            ))}
          </div>
          <Link href="/projects" className="btn btn-outline" style={{ marginTop: "1.5rem" }}>All work</Link>
        </div>
      </section>

      <section className="knowledge" id="knowledge" aria-label="Knowledge system">
        <div className="container">
          <p className="section-label">{home.knowledge.label}</p>
          <h2>{home.knowledge.title}</h2>
          <div className="knowledge-map">
            {home.knowledge.items.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={knowledge === index ? "is-on" : undefined}
                aria-expanded={knowledge === index}
                onClick={() => setKnowledge(index)}
              >
                <strong>{item.title}</strong>
                <span>{item.body}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="journey" id="journey" aria-label="Journey">
        <div className="container">
          <p className="section-label">{home.journey.label}</p>
          <h2>{home.journey.title}</h2>
          <p className="journey-note">{home.journey.note}</p>
          <ol className="journey-list">
            <span className="journey-line" style={{ transform: `scaleY(${progress})` }} />
            {timeline.slice().reverse().map((item) => (
              <li key={`${item.year}-${item.title}`}>
                <p>{item.year}</p>
                <h3>{item.title}</h3>
                <p>{item.organization}</p>
                <p>{item.description}</p>
              </li>
            ))}
          </ol>
          <Link href="/experience" className="btn btn-outline">{home.journey.cta}</Link>
        </div>
      </section>

      <section className="ventures-band" id="ventures" aria-label="Ventures">
        <div className="container ventures-band-grid">
          <div>
            <p className="section-label">{home.ventures.label}</p>
            <h2>{home.ventures.title}</h2>
            <p>{home.ventures.body}</p>
          </div>
          <article>
            <p>{siteConfig.company.role}</p>
            <h3>{siteConfig.company.name}</h3>
            <p>{siteConfig.company.summary}</p>
            <p>{siteConfig.company.established} · Kigali</p>
            <div>
              <Link href="/ventures" className="btn btn-primary">Explore my ventures <RiArrowRightLine size={16} /></Link>
              <a className="btn btn-outline" href={siteConfig.company.url} target="_blank" rel="noopener noreferrer">lerony.com</a>
            </div>
          </article>
        </div>
      </section>

      <section className="principles" aria-label="Working principles">
        <div className="container">
          <p className="section-label">{home.principles.label}</p>
          <h2>{home.principles.title}</h2>
          <ol>
            {home.principles.items.map((item) => (
              <li key={item.n}>
                <span>{item.n}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="speaking-band" aria-label="Speaking and training">
        {home.speaking.image ? <img src={home.speaking.image} alt="" className="speaking-photo" width={1024} height={1024} /> : null}
        <div className="container speaking-copy">
          <p className="section-label">{home.speaking.label}</p>
          <h2>{home.speaking.title}</h2>
          {home.speaking.body ? <p>{home.speaking.body}</p> : null}
          <Link href="/speaking" className="btn btn-primary">{home.speaking.cta} <RiArrowRightLine size={16} /></Link>
        </div>
      </section>

      <section className="booking-band" id="book" aria-label="Book a conversation">
        <div className="container">
          <p className="section-label">{home.booking.label}</p>
          <h2>{home.booking.title}</h2>
          <p>{home.booking.body}</p>
          <ul>
            {home.booking.items.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.time}</span>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
          <div className="book-actions">
            {booking ? (
              <a className="btn btn-primary" href={booking} target="_blank" rel="noopener noreferrer">Book a conversation <RiArrowRightLine size={16} /></a>
            ) : (
              <Link className="btn btn-primary" href="/contact">Book a conversation <RiArrowRightLine size={16} /></Link>
            )}
            <a className="btn btn-outline" href={`mailto:${settings.contactEmail || siteConfig.contact.email}`}>Send an email</a>
            <a className="btn btn-outline" href={WHATSAPP_CALL_URL} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
          {!booking ? <p className="booking-note">The public calendar page is not connected yet. Email and WhatsApp are the live paths.</p> : null}
        </div>
      </section>

      <section className="closing-band" aria-label="Closing">
        <div className="container">
          <h2>{home.closing.title}</h2>
          <img src="/brand/logos/logo-horizontal-light.png" alt="" width={168} height={40} className="closing-mark" />
          <p className="closing-name">{settings.siteTitle || siteConfig.name}</p>
          <p>{home.closing.roles}</p>
          <p>{settings.location || "Kigali, Rwanda"}</p>
          <a href={`mailto:${settings.contactEmail || siteConfig.contact.email}`}>{settings.contactEmail || siteConfig.contact.email}</a>
          <div className="closing-socials">
            {socials.map((link) => {
              const Icon = socialIcon(link.platform);
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="social-tip" data-tip={link.label} aria-label={link.label}>
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
