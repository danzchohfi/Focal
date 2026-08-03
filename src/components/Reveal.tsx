"use client";

import { useEffect, useRef } from "react";

// Fade-up suave ao entrar no viewport (roda uma vez). Com group=true, os
// filhos diretos entram em cascata via --i (classe .reveal-group).
export default function Reveal({
  children,
  className = "",
  delay = 0,
  group = false,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  group?: boolean;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (group) {
      Array.from(el.children).forEach((c, i) =>
        (c as HTMLElement).style.setProperty("--i", String(i))
      );
    }
    // Elementos já acima da dobra no mount aparecem imediatamente
    if (el.getBoundingClientRect().bottom < 0) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [group]);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`${group ? "reveal-group" : "reveal"} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
