"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    await new Promise((r) => setTimeout(r, 1000));
    setState("success");
  };

  if (state === "success") {
    return (
      <p className="text-emerald-400 text-sm font-medium" role="status" aria-live="polite">
        ✓ You&apos;re subscribed! Thanks for joining.
      </p>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3"
      aria-label="Newsletter subscription form"
      onSubmit={handleSubmit}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-[rgba(14,82,168,0.06)] border border-[rgba(14,82,168,0.2)] rounded-lg px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#0E52A8] transition-colors"
        required
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="btn btn-primary flex-shrink-0"
        aria-busy={state === "loading"}
      >
        {state === "loading" ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
