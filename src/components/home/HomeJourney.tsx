"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import { projects, siteConfig, speakingEngagements, timeline } from "@/data/site-data";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { socialsFor, socialIcon } from "@/lib/socials";

const WORK_IDS = ["caritas-systems", "stockpro", "askfield", "psta-accounting"] as const;

const WORK_FOCUS: Record<string, { tags: string[]; line: string; support: string }> = {
  "caritas-systems": {
    tags: ["Systems", "Data"],
    line: "Organizational reporting, held in one dependable system.",
    support: "Product delivery · Systems · Data",
  },
  stockpro: {
    tags: ["Product", "Systems"],
    line: "Inventory and sales, without a pile of separate records.",
    support: "Product · Business systems",
  },
  askfield: {
    tags: ["Product", "Data"],
    line: "Survey workflows, connected through the interface.",
    support: "Frontend integration · Product experience",
  },
  "psta-accounting": {
    tags: ["Systems"],
    line: "Ticket accounting with a record someone can trace.",
    support: "Automation · Financial workflows",
  },
};

const KNOWLEDGE = [
  {
    id: "strategy",
    title: "Strategy & Discovery",
    body: "Requirements, problem framing, and solution planning before a line of interface is treated as the answer.",
  },
  {
    id: "product",
    title: "Product & Experience",
    body: "Product thinking, workflows, and interfaces people can actually follow.",
  },
  {
    id: "technology",
    title: "Technology & Systems",
    body: "React, Next.js, PHP, APIs, integrations, and databases already used in the documented work.",
  },
  {
    id: "data",
    title: "Data & Operations",
    body: "SQL, reporting systems, dashboards, and operational records.",
  },
];

const PRINCIPLES = [
  { n: "01", title: "Understand before building", body: "The strongest solution begins with the right problem." },
  { n: "02", title: "Make complexity useful", body: "Technology matters when people can depend on it." },
  { n: "03", title: "Build for progress", body: "Every product should create a meaningful next step." },
];

const CONVERSATIONS = [
  { title: "Introductory conversation", time: "20 minutes", body: "An idea, or a first introduction." },
  { title: "Project discovery", time: "30 minutes", body: "Requirements and whether a collaboration fits." },
  { title: "Partnership discussion", time: "45 minutes", body: "Lerony, a venture, or an institutional brief." },
];

export default function HomeJourney() {
  const settings = useSiteSettings();
  const booking = configuredBookingUrl(settings.bookingCalendarUrl);
  const socials = socialsFor(settings, "footer").slice(0, 4);
  const stories = WORK_IDS.map((id) => projects.find((project) => project.id === id)).filter((project) => project != null);
  const [focus, setFocus] = useState("All");
  const [knowledge, setKnowledge] = useState(KNOWLEDGE[0].id);
  const [progress, setProgress] = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  const training = speakingEngagements[0];
  const filters = ["All", "Product", "Systems", "Data"];
  const visible = stories.filter((project) => focus === "All" || WORK_FOCUS[project.id]?.tags.includes(focus));

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
        <img
          src="/images/profile/prince-parfait-ganza-kigali-rwanda.webp"
          alt=""
          className="manifesto-photo"
          width={1024}
          height={919}
        />
        <div className="container manifesto-copy">
          <p className="section-label">The work</p>
          <h2>I work where ideas, technology and execution meet.</h2>
          <p>
            From digital systems and client platforms to products and new ventures, the work is turning a complex need into something useful and dependable.
          </p>
          <ol>
            <li><strong>Think clearly</strong><span>Understand the real challenge.</span></li>
            <li><strong>Build purposefully</strong><span>Create technology around actual needs.</span></li>
            <li><strong>Deliver reliably</strong><span>Turn the concept into something people can use.</span></li>
          </ol>
        </div>
      </section>

      <section className="work-stories" id="work" aria-label="Selected work">
        <div className="container">
          <div className="work-stories-head">
            <div>
              <p className="section-label">01 / Selected work</p>
              <h2>Evidence, one case at a time.</h2>
            </div>
            <div className="work-filters" role="tablist" aria-label="Filter work">
              {filters.map((item) => (
                <button key={item} type="button" role="tab" aria-selected={focus === item} className={focus === item ? "is-on" : undefined} onClick={() => setFocus(item)}>
                  {item}
                </button>
              ))}
              <a href="#ventures">Ventures</a>
            </div>
          </div>
          <div className="work-story-list">
            {visible.map((project, index) => {
              const meta = WORK_FOCUS[project.id];
              return (
                <article key={project.id} className={`work-story work-story-${index % 4}`}>
                  <div className="work-story-copy">
                    <p>{String(stories.indexOf(project) + 1).padStart(2, "0")}</p>
                    <h3>{project.title}</h3>
                    <p className="work-story-line">{meta?.line}</p>
                    <p className="work-story-support">{meta?.support}</p>
                    <p><strong>Challenge. </strong>{project.challenge || project.problem}</p>
                    <p><strong>Contribution. </strong>{project.whatIBuilt || project.myRole}</p>
                    <p><strong>Status. </strong>{project.outcome || project.result || "Documented as built. No public metric is claimed."}</p>
                    <Link href={`/projects/${project.id}`}>View case study <RiArrowRightLine size={16} /></Link>
                  </div>
                  <div className="work-story-visual" aria-hidden="true">
                    <span>{project.organization}</span>
                    <strong>{project.title}</strong>
                  </div>
                </article>
              );
            })}
          </div>
          <Link href="/projects" className="btn btn-outline" style={{ marginTop: "1.5rem" }}>All work</Link>
        </div>
      </section>

      <section className="knowledge" id="knowledge" aria-label="Knowledge system">
        <div className="container">
          <p className="section-label">Knowledge</p>
          <h2>How ideas become working systems.</h2>
          <div className="knowledge-map">
            {KNOWLEDGE.map((item) => (
              <button
                key={item.id}
                type="button"
                className={knowledge === item.id ? "is-on" : undefined}
                aria-expanded={knowledge === item.id}
                onClick={() => setKnowledge(item.id)}
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
          <p className="section-label">Journey</p>
          <h2>How the work developed.</h2>
          <p className="journey-note">The exact employers and dates live on Experience. This is the public path.</p>
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
          <Link href="/experience" className="btn btn-outline">Explore this record</Link>
        </div>
      </section>

      <section className="ventures-band" id="ventures" aria-label="Ventures">
        <div className="container ventures-band-grid">
          <div>
            <p className="section-label">Ventures</p>
            <h2>Building beyond individual projects.</h2>
            <p>
              Through {siteConfig.company.name}, organizational challenges and ambitious ideas are turned into digital solutions. This site remains the person. The company lives at lerony.com.
            </p>
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
          <p className="section-label">Principles</p>
          <h2>How the work is actually done.</h2>
          <ol>
            {PRINCIPLES.map((item) => (
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
        <img src="/images/profile/prince-parfait-ganza-kigali-casual.webp" alt="" className="speaking-photo" width={1024} height={1024} />
        <div className="container speaking-copy">
          <p className="section-label">Speaking and training</p>
          <h2>Knowledge becomes more valuable when it moves.</h2>
          {training ? (
            <p>
              {training.topic} The engagement is {training.event}. Exact session dates are not published until they are verified. No conference or keynote is claimed.
            </p>
          ) : null}
          <Link href="/speaking" className="btn btn-primary">Explore speaking and training <RiArrowRightLine size={16} /></Link>
        </div>
      </section>

      <section className="booking-band" id="book" aria-label="Book a conversation">
        <div className="container">
          <p className="section-label">A conversation</p>
          <h2>Have an ambitious idea worth discussing?</h2>
          <p>A focused introduction about a product, partnership, venture, or digital challenge.</p>
          <ul>
            {CONVERSATIONS.map((item) => (
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
          <h2>The next meaningful product starts with a clear conversation.</h2>
          <img src="/brand/logos/logo-horizontal-light.png" alt="" width={168} height={40} className="closing-mark" />
          <p className="closing-name">{siteConfig.name}</p>
          <p>Founder · Entrepreneur · Technologist</p>
          <p>Kigali, Rwanda</p>
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
