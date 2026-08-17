import Link from "next/link";
import { siteConfig } from "@/data/site-data";

export default function NotFound() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center relative py-20"
      style={{ 
        backgroundColor: "var(--color-bg)",
        paddingLeft: "1.5rem",
        paddingRight: "1.5rem"
      }}
      aria-label="Page not found"
    >
      <div 
        className="relative z-10 flex flex-col items-center text-center mt-4 md:mt-8"
        style={{ width: "100%", maxWidth: "32rem" }}
      >
        {/* Large 404 Text */}
        <p
          className="font-black leading-none select-none"
          aria-hidden="true"
          style={{ 
            fontFamily: "var(--font-heading)",
            color: "var(--color-primary)",
            opacity: 0.1,
            fontSize: "clamp(7rem, 25vw, 10rem)",
            marginBottom: "1.5rem"
          }}
        >
          404
        </p>

        {/* Heading */}
        <h1
          className="font-bold tracking-tight whitespace-nowrap"
          style={{ 
            fontFamily: "var(--font-heading)",
            color: "var(--color-text)",
            fontSize: "clamp(2rem, 8vw, 3.75rem)",
            marginBottom: "1.5rem"
          }}
        >
          Page Not Found
        </h1>
        
        {/* Description */}
        <p 
          className="leading-relaxed"
          style={{ 
            color: "var(--color-text-3)",
            fontSize: "clamp(0.875rem, 3vw, 1rem)",
            marginBottom: "3.5rem",
            maxWidth: "28rem"
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Buttons */}
        <div 
          className="flex flex-col sm:flex-row items-center justify-center w-full"
          style={{ gap: "1rem", marginBottom: "4rem" }}
        >
          <Link 
            href="/" 
            className="btn btn-primary w-full sm:flex-1 flex justify-center rounded-xl"
            style={{ padding: "0.875rem 1rem", fontSize: "0.95rem" }}
          >
            Go to live site
          </Link>
          <Link 
            href="/dashboard/projects" 
            className="btn btn-outline w-full sm:flex-1 flex justify-center rounded-xl"
            style={{ padding: "0.875rem 1rem", fontSize: "0.95rem" }}
          >
            View Projects
          </Link>
        </div>

        {/* Footer Link */}
        <p 
          className="font-medium tracking-wide"
          style={{ color: "var(--color-text-3)", fontSize: "0.875rem" }}
        >
          {siteConfig.url.replace("https://", "")}
        </p>
      </div>
    </section>
  );
}
