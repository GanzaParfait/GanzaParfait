"use client";

import { RiShareLine } from "react-icons/ri";

export default function ShareButton({ title, excerpt }: { title: string; excerpt: string }) {
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title,
        text: excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <button
      className="btn btn-outline btn-sm"
      onClick={handleShare}
      aria-label="Share this article"
    >
      <RiShareLine size={14} />
      Share
    </button>
  );
}
