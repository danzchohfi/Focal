"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";

/** Barra de prova institucional com contadores que animam uma única vez. */
export default function ProvaBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-8 border-y border-white/10 py-10 md:grid-cols-4"
    >
      {site.prova.map((item, i) => (
        <div
          key={item.label}
          className="text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(12px)",
            transitionDelay: `${i * 120}ms`,
          }}
        >
          <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {item.value}
          </p>
          <p className="mt-1 text-sm text-[#a3a39c]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
