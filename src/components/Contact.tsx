"use client";

import { useState, useRef, useEffect } from "react";

function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

const contactMethods = [
  {
    id: "github",
    label: "GitHub",
    value: "github.com/GanzaParfait",
    href: "https://github.com/GanzaParfait",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    gradient: "from-slate-700/50 to-slate-800/50",
    border: "border-slate-600/30",
    hover: "hover:border-slate-500/50",
  },
  {
    id: "email",
    label: "Email",
    value: "hello@ganzaparfait.com",
    href: "mailto:hello@ganzaparfait.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    gradient: "from-blue-700/30 to-blue-800/30",
    border: "border-blue-600/30",
    hover: "hover:border-blue-500/50",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "Connect on LinkedIn",
    href: "https://linkedin.com/in/ganzaparfait",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    gradient: "from-blue-600/30 to-sky-700/30",
    border: "border-sky-600/30",
    hover: "hover:border-sky-500/50",
  },
];

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [formState, setFormState] = useState({ name: "", email: "", message: "", subject: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    // Simulated send (connect to Supabase or email service in production)
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("sent");
    setFormState({ name: "", email: "", message: "", subject: "" });
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32" aria-labelledby="contact-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" aria-hidden="true" />
      <div className="absolute left-0 top-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase px-3">
              Contact
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" aria-hidden="true" />
          </div>
          <h2 id="contact-heading" className="text-3xl sm:text-4xl font-black text-gradient mb-4">
            Let&apos;s Build Something
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm leading-relaxed">
            Whether you have a complex technical challenge, a product idea, or a strategic
            conversation — I&apos;m ready to engage.
          </p>
        </div>

        <div ref={ref} className={`grid lg:grid-cols-5 gap-8 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {/* Left – Contact methods */}
          <aside className="lg:col-span-2 flex flex-col gap-4" aria-label="Contact methods">
            <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
              <h3 className="text-sm font-bold text-slate-200 mb-1">Prince Parfait GANZA</h3>
              <p className="text-xs text-slate-500 mb-6">CEO & Founder · Lerony Co. Ltd</p>

              <div className="space-y-3">
                {contactMethods.map((method) => (
                  <a
                    key={method.id}
                    id={`contact-${method.id}`}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${method.gradient} border ${method.border} ${method.hover} text-slate-300 hover:text-white transition-all duration-300 group`}
                    aria-label={`${method.label}: ${method.value}`}
                  >
                    <span className="text-slate-400 group-hover:text-white transition-colors">
                      {method.icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold">{method.label}</p>
                      <p className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors truncate">
                        {method.value}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 ml-auto text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="glass-card rounded-2xl p-5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                <p className="text-xs font-semibold text-green-400">Open to Opportunities</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Available for technical consulting, co-founder conversations, and strategic
                partnerships across tech, fintech, and digital transformation.
              </p>
            </div>
          </aside>

          {/* Right – Contact form */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-slate-200 mb-5">Send a Message</h3>

            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-200 mb-1">Message Sent!</p>
                  <p className="text-xs text-slate-500">I&apos;ll get back to you within 24 hours.</p>
                </div>
                <button
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setStatus("idle")}
                  id="contact-form-reset"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact form">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-slate-500 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-slate-500 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    placeholder="e.g. Partnership Opportunity / Technical Consulting"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-slate-500 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Tell me about your project, challenge, or idea..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all resize-none"
                  />
                </div>
                <button
                  id="contact-form-submit"
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
