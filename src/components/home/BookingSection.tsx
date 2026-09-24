"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiArrowRightSLine,
  RiCalendarEventLine,
  RiChat3Line,
  RiFileList3Line,
  RiMailLine,
  RiTeamLine,
  RiWhatsappLine,
} from "react-icons/ri";
import type { BookingItemIcon, HomepageContent } from "@/lib/homepage";
import {
  activeBookingOptions,
  bookingOptionMeta,
  openBookingLink,
  primaryBookingOption,
  WHATSAPP_CALL_URL,
} from "@/lib/booking";
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
  const calendarOptions = activeBookingOptions(settings);
  const primary = primaryBookingOption(settings);
  const email = settings.contactEmail || siteConfig.contact.email;
  const primaryHref = primary?.url || booking.primaryHref || "/contact";
  const primaryExternal = Boolean(primary);

  return (
    <section
      className={embedded ? "booking-band booking-embedded" : "booking-band"}
      aria-label="Book a conversation"
      id="book"
      data-page-section={embedded ? undefined : true}
      data-section-label={embedded ? undefined : "Connect"}
    >
      <div className="container booking-shell booking-shell-compact">
        <div className="booking-copy">
          <p className="section-label">{booking.label}</p>
          <h2>{booking.title}</h2>
          {booking.body ? <p className="booking-lead">{booking.body}</p> : null}
        </div>

        <div className="booking-side">
          <ul className="booking-options">
            {calendarOptions.length
              ? calendarOptions.map((option) => (
                  <li key={option.id}>
                    <button type="button" onClick={() => openBookingLink(option.url, "homepage")}>
                      <span className="booking-option-icon is-chat" aria-hidden="true">
                        <RiCalendarEventLine size={18} />
                      </span>
                      <span className="booking-option-copy">
                        <strong>{option.label}</strong>
                        <em>{option.description}</em>
                      </span>
                      <span className="booking-option-meta">
                        <b>{option.durationMinutes} min</b>
                        <RiArrowRightSLine size={16} aria-hidden="true" />
                      </span>
                      <span className="sr-only">{bookingOptionMeta(option)}. Opens in a new tab.</span>
                    </button>
                  </li>
                ))
              : booking.items.map((item) => {
                  const href = item.href || "/contact";
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

          <div className="book-actions">
            {primaryExternal && primary ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => openBookingLink(primary.url, "homepage")}
              >
                Book a meeting <RiArrowRightLine size={15} />
              </button>
            ) : (
              <Link className="btn btn-primary btn-sm" href={primaryHref}>
                {booking.primaryCta} <RiArrowRightLine size={15} />
              </Link>
            )}
            <a className="btn btn-outline btn-sm" href={`mailto:${email}`}>
              <RiMailLine size={14} /> {booking.emailLabel || "Email"}
            </a>
            <a className="btn btn-outline btn-sm" href={WHATSAPP_CALL_URL} target="_blank" rel="noopener noreferrer">
              <RiWhatsappLine size={14} /> {booking.whatsappLabel || "WhatsApp"}
            </a>
          </div>
        </div>

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
