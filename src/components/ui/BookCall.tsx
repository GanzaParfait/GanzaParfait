"use client";

import Link from "next/link";
import { RiArrowRightLine, RiWhatsappLine } from "react-icons/ri";
import {
  openBookingLink,
  primaryBookingOption,
  WHATSAPP_CALL_URL,
} from "@/lib/booking";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function BookCall() {
  const settings = useSiteSettings();
  const booking = primaryBookingOption(settings);

  return (
    <div className="book-actions">
      {booking ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openBookingLink(booking.url, "homepage")}
        >
          Book a meeting <RiArrowRightLine size={16} />
        </button>
      ) : (
        <Link className="btn btn-primary" href="/contact">
          Book a meeting <RiArrowRightLine size={16} />
        </Link>
      )}
      <a className="btn btn-outline" href={WHATSAPP_CALL_URL} target="_blank" rel="noopener noreferrer">
        <RiWhatsappLine size={18} />
        WhatsApp
      </a>
      <a className="btn btn-ghost" href={`mailto:${settings.contactEmail}`}>
        Send an email
      </a>
    </div>
  );
}
