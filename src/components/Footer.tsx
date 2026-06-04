export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-white/[0.06] py-12"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Prince Parfait GANZA</p>
              <p className="text-xs text-slate-600">CEO & Founder · Lerony Co. Ltd</p>
            </div>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-6" role="list">
              {[
                { label: "Work", href: "#work" },
                { label: "Credentials", href: "#credentials" },
                { label: "About", href: "#about" },
                { label: "Contact", href: "#contact" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    id={`footer-nav-${item.label.toLowerCase()}`}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline-accent"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            &copy; {currentYear} Prince Parfait GANZA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
