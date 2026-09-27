"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

type RevealVariant = "up" | "scale" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  /** Wrapper element. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Stagger delay in milliseconds. */
  delay?: number;
  variant?: RevealVariant;
  /** Fraction of the element that must be visible before revealing. */
  threshold?: number;
};

/**
 * Reveals its children with a soft fade + slide once they scroll into view.
 * Uses IntersectionObserver so server components can stay on the server —
 * only this thin wrapper ships to the client.
 */
export default function Reveal({
  children,
  as: Component = "div",
  className = "",
  delay = 0,
  variant = "up",
  threshold = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Component
      ref={ref}
      className={`reveal reveal-${variant}${visible ? " is-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Component>
  );
}
