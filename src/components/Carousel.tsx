"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Carrossel genérico por scroll-snap, com setas e bolinhas (estilo Uncode/Owl).
export default function Carousel({
  children,
  className = "",
  itemClassName = "",
  dots = true,
  arrows = true,
  dark = false,
}: {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  dots?: boolean;
  arrows?: boolean;
  dark?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const p = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(p);
    setPage(Math.round((el.scrollLeft / (el.scrollWidth - el.clientWidth || 1)) * (p - 1)) || 0);
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  const goPage = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({
      left: (el.scrollWidth - el.clientWidth) * (i / Math.max(1, pages - 1)),
      behavior: "smooth",
    });
  };

  const arrowCls = `absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full p-2 transition-opacity md:flex ${
    dark ? "bg-white/10 text-white hover:bg-white/25" : "bg-black/10 text-black hover:bg-black/25"
  }`;

  return (
    <div className={`relative ${className}`}>
      {arrows && pages > 1 && (
        <>
          <button type="button" aria-label="Anterior" onClick={() => go(-1)} className={`${arrowCls} left-2`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m14 18-6-6 6-6" />
            </svg>
          </button>
          <button type="button" aria-label="Próximo" onClick={() => go(1)} className={`${arrowCls} right-2`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m10 6 6 6-6 6" />
            </svg>
          </button>
        </>
      )}
      <div ref={track} className="snap-track">
        {children.map((c, i) => (
          <div key={i} className={itemClassName}>
            {c}
          </div>
        ))}
      </div>
      {dots && pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para página ${i + 1}`}
              onClick={() => goPage(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === page
                  ? dark
                    ? "bg-white"
                    : "bg-black/70"
                  : dark
                    ? "bg-white/30"
                    : "bg-black/25"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
