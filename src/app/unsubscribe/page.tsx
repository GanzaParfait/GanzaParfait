import type { Metadata } from "next";
import { Suspense } from "react";
import { buildPageMetadata } from "@/lib/seo";
import UnsubscribeClient from "./UnsubscribeClient";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Unsubscribe",
    description: "Opt out of occasional updates from Prince Parfait GANZA.",
    path: "/unsubscribe",
  }),
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <section className="unsubscribe-page">
          <div className="container unsubscribe-card">
            <p className="section-label">Email preferences</p>
            <h1>Updating…</h1>
          </div>
        </section>
      }
    >
      <UnsubscribeClient />
    </Suspense>
  );
}
