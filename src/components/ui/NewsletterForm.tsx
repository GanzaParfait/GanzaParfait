import { PublicEmail } from "@/components/public/PublicContact";

export default function NewsletterForm() {
  return (
    <p className="theme-copy text-sm leading-relaxed">
      There is no mailing list yet. If you want to be notified when writing is published, email{" "}
      <PublicEmail style={{ color: "var(--color-primary)", fontWeight: 700 }} />
      .
    </p>
  );
}
