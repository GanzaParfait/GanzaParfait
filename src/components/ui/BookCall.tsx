import Link from "next/link";
import { RiCalendarLine, RiWhatsappLine } from "react-icons/ri";
import { WHATSAPP_CALL_URL, googleCalendarCallUrl } from "@/lib/booking";

export default function BookCall() {
  return (
    <div className="book-actions">
      <a className="btn btn-primary" href={googleCalendarCallUrl()} target="_blank" rel="noopener noreferrer">
        <RiCalendarLine size={18} />
        Propose a time
      </a>
      <a className="btn btn-outline" href={WHATSAPP_CALL_URL} target="_blank" rel="noopener noreferrer">
        <RiWhatsappLine size={18} />
        WhatsApp
      </a>
      <Link className="btn btn-ghost" href="/contact">
        Send a brief
      </Link>
    </div>
  );
}
