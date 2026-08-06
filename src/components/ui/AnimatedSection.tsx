"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  direction?: "up" | "left" | "right" | "fade";
  threshold?: number;
  as?: React.ElementType;
}

export default function AnimatedSection({
  children,
  className = "",
  style: externalStyle,
  delay = 0,
  direction = "up",
  threshold = 0.1,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const transforms: Record<string, string> = {
    up:    "translateY(24px)",
    left:  "translateX(-24px)",
    right: "translateX(24px)",
    fade:  "none",
  };

  const animStyle: React.CSSProperties = {
    opacity:    isVisible ? 1 : 0,
    transform:  isVisible ? "none" : transforms[direction],
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <Tag ref={ref} className={className} style={{ ...animStyle, ...externalStyle }}>
      {children}
    </Tag>
  );
}
