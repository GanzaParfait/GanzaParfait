"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { siteConfig } from "@/data/site-data";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import { homepageFrom } from "@/lib/homepage";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialsFor, socialIcon } from "@/lib/socials";
import ManifestoSection from "@/components/home/ManifestoSection";
import SelectedWork from "@/components/home/SelectedWork";
import KnowledgeSection from "@/components/home/KnowledgeSection";
import JourneySection from "@/components/home/JourneySection";

export default function HomeJourney() {
  const settings = useSiteSettings();
  const home = homepageFrom(settings);
  const booking = configuredBookingUrl(settings.bookingCalendarUrl);
  const socials = socialsFor(settings, "footer").slice(0, 4);
  const [pageProgress, setPageProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setPageProgress(height <= 0 ? 0 : window.scrollY / height);
    };
    update();
    if (reduce) {
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

      <ManifestoSection manifesto={{ ...home.manifesto, attribution: home.manifesto.attribution || settings.siteTitle }} />

      <SelectedWork work={home.work} records={settings.projectRecords} />

      <KnowledgeSection knowledge={home.knowledge} />

      <JourneySection journey={home.journey} />

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
