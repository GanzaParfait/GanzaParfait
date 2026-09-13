import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import BookCall from "@/components/ui/BookCall";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const PAGE_DESCRIPTION =
  "Contact Prince Parfait GANZA about a venture, a product, or a system that needs to exist. Based in Kigali. Email hello@princeparfait.com.";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/contact",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/contact",
            name: "Contact Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
            type: "ContactPage",
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/contact"),
        ])}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section
        className="section pt-8 relative overflow-hidden min-h-screen"
        aria-label="Contact section"
      >
        <div className="container relative z-10">
          <div className="book-panel" style={{ marginBottom: "1.5rem" }}>
            <div>
              <p className="section-label">Book a call</p>
              <h2>Book a conversation, or write the brief.</h2>
              <p>The calendar button uses the public booking page when it is connected. Email remains available either way.</p>
            </div>
            <BookCall />
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
