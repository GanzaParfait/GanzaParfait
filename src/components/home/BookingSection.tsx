"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiChat3Line,
  RiFileList3Line,
  RiMailLine,
  RiTeamLine,
  RiWhatsappLine,
} from "react-icons/ri";
import type { BookingItemIcon, HomepageContent } from "@/lib/homepage";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import { siteConfig } from "@/data/site-data";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function ItemIcon({ icon }: { icon: BookingItemIcon }) {
  if (icon === "doc") return <RiFileList3Line size={18} />;
  if (icon === "people") return <RiTeamLine size={18} />;
  return <RiChat3Line size={18} />;
}

export default function BookingSection({
  booking,
  embedded = false,
}: {
  booking: HomepageContent["booking"];
  embedded?: boolean;
}) {
  const settings = useSiteSettings();
  const calendar = configuredBookingUrl(settings.bookingCalendarUrl);
  const email = settings.contactEmail || siteConfig.contact.email;
  const primaryHref = calendar || booking.primaryHref || "/contact";
  const primaryExternal = Boolean(calendar) || /^https?:\/\//i.test(primaryHref);

  return (
    <section
      className={embedded ? "booking-band booking-embedded" : "booking-band"}
      aria-label="Book a conversation"
      id="book"
      data-page-section={embedded ? undefined : true}
      data-section-label={embedded ? undefined : "Book a conversation"}
    >
      <div className="container booking-shell">
        <div className="booking-copy">
          <p className="section-label">{booking.label}</p>
          <h2>{booking.title}</h2>
          {booking.body ? <p className="booking-lead">{booking.body}</p> : null}
          <div className="book-actions">
            {primaryExternal ? (
              <a className="btn btn-primary" href={primaryHref} target="_blank" rel="noopener noreferrer">
                {booking.primaryCta} <RiArrowRightLine size={16} />
              </a>
            ) : (
              <Link className="btn btn-primary" href={primaryHref}>
                {booking.primaryCta} <RiArrowRightLine size={16} />
              </Link>
            )}
            <a className="btn btn-outline" href={`mailto:${email}`}>
              <RiMailLine size={15} /> {booking.emailLabel || "Email"}
            </a>
            <a className="btn btn-outline" href={WHATSAPP_CALL_URL} target="_blank" rel="noopener noreferrer">
              <RiWhatsappLine size={15} /> {booking.whatsappLabel || "WhatsApp"}
            </a>
          </div>
        </div>

        <ul className="booking-options">
          {booking.items.map((item) => {
            const href = item.href || primaryHref;
            const external = /^https?:\/\//i.test(href);
            const content = (
              <>
                <span className={`booking-option-icon is-${item.icon || "chat"}`} aria-hidden="true">
                  <ItemIcon icon={item.icon || "chat"} />
                </span>
                <span className="booking-option-copy">
                  <strong>{item.title}</strong>
                  <em>{item.body}</em>
                </span>
                <span className="booking-option-meta">
                  <b>{item.time}</b>
                  <RiArrowRightSLine size={16} aria-hidden="true" />
                </span>
              </>
            );
            return (
              <li key={item.title}>
                {external ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <Link href={href}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>

        {booking.rails?.length ? (
          <div className="booking-orbit" aria-hidden="true">
            <span className="booking-orbit-ring" />
            <span className="booking-orbit-ring is-mid" />
            <ul>
              {booking.rails.map((rail) => (
                <li key={rail}>{rail}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
