import type { Metadata } from "next";
import Link from "next/link";
import { RiLockPasswordLine } from "react-icons/ri";
import { safeCvPdfNext } from "@/lib/cv-pdf-lock";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "CV download",
    description: "Enter the password to open this CV link.",
    path: "/cv/unlock",
  }),
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  invalid: "That password is not correct.",
  rate: "Too many attempts. Please try again in a few minutes.",
};

export default async function CvUnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = safeCvPdfNext(typeof params.next === "string" ? params.next : "");
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <section className="unsubscribe-page" aria-label="CV download">
      <div className="container unsubscribe-card">
        <span className="unsubscribe-icon" aria-hidden="true">
          <RiLockPasswordLine size={36} />
        </span>
        <p className="section-label">CV / Resume</p>
        <h1>This link is protected</h1>
        <p className="unsubscribe-copy">
          Enter the password you were given to open the PDF, or get it from the CV page with your email.
        </p>
        <form className="cv-unlock-form" action="/api/cv/unlock" method="post">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="cv-unlock-password" className="sr-only">
            Password
          </label>
          <input
            id="cv-unlock-password"
            name="password"
            type="password"
            autoComplete="off"
            required
            autoFocus
            placeholder="Password"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "cv-unlock-error" : undefined}
          />
          <button type="submit" className="btn btn-primary">
            Open CV
          </button>
        </form>
        {error ? (
          <p id="cv-unlock-error" className="cv-unlock-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="unsubscribe-actions">
          <Link href="/cv" className="btn btn-outline">
            Go to the CV page
          </Link>
        </div>
      </div>
    </section>
  );
}
