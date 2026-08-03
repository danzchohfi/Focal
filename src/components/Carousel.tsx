"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Carrossel genérico por scroll-snap, com setas sólidas com estados e
// dots que alongam em pílula (estilo editorial).
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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const p = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(p);
    const max = el.scrollWidth - el.clientWidth;
    setPage(Math.round((el.scrollLeft / (max || 1)) * (p - 1)) || 0);
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
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

  const behavior = (): ScrollBehavior =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: behavior() });
  };

  const goPage = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({
      left: (el.scrollWidth - el.clientWidth) * (i / Math.max(1, pages - 1)),
      behavior: behavior(),
    });
  };

  const arrowCls =
    "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-ink shadow-[0_2px_10px_rgba(0,0,0,.18)] backdrop-blur transition-[opacity,transform,background-color] duration-200 hover:scale-105 hover:bg-white active:scale-95 md:flex";

  return (
    <div className={`relative ${className}`}>
      {arrows && pages > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => go(-1)}
            className={`${arrowCls} left-5 ${atStart ? "pointer-events-none opacity-0" : ""}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m14 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Próximo"
            onClick={() => go(1)}
            className={`${arrowCls} right-5 ${atEnd ? "pointer-events-none opacity-0" : ""}`}
          >
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
        <div className="mt-6 flex justify-center">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para página ${i + 1}`}
              aria-current={i === page}
              onClick={() => goPage(i)}
              className="group p-2"
            >
              <span
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === page
                    ? `w-5 ${dark ? "bg-white" : "bg-black/70"}`
                    : `w-1.5 ${dark ? "bg-white/30 group-hover:bg-white/60" : "bg-black/25 group-hover:bg-black/50"}`
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
