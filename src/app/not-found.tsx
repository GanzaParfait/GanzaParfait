import Link from "next/link";
import { siteConfig } from "@/data/site-data";

export default function NotFound() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center text-center relative dot-grid"
      aria-label="Page not found"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      <div className="relative z-10 container">
        <p
          className="text-[8rem] font-bold leading-none text-[#0E52A8] opacity-20 select-none mb-0"
          aria-hidden="true"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          404
        </p>
        <h1
          className="text-white text-3xl font-bold -mt-4 mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Page not found.
        </h1>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
          <Link href="/projects" className="btn btn-outline">
            View Projects
          </Link>
        </div>
        <p className="text-slate-600 text-sm mt-10">
          {siteConfig.url.replace("https://", "")}
        </p>
      </div>
    </section>
  );
}
