"use client";

import Link from "next/link";
import { RiArrowRightLine, RiWhatsappLine } from "react-icons/ri";
import { configuredBookingUrl, WHATSAPP_CALL_URL } from "@/lib/booking";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function BookCall() {
  const settings = useSiteSettings();
  const booking = configuredBookingUrl(settings.bookingCalendarUrl);

  return (
    <div className="book-actions">
      {booking ? (
        <a className="btn btn-primary" href={booking} target="_blank" rel="noopener noreferrer">
          Book a conversation <RiArrowRightLine size={16} />
        </a>
      ) : (
        <Link className="btn btn-primary" href="/contact">
          Book a conversation <RiArrowRightLine size={16} />
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
