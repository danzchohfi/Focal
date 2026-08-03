"use client";

import { useEffect, useRef, useState } from "react";

// Mapa do Google via embed sem chave: skeleton com pin até o carregamento,
// iframe entra com fade quando visível.
export default function MapEmbed({ query }: { query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-[560px] w-full overflow-hidden rounded-lg bg-light md:h-[640px]">
      {/* Skeleton */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
        aria-hidden
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#707070" strokeWidth="1.6">
          <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </div>
      {load && (
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`}
          title={`Mapa — ${query}`}
          onLoad={() => setReady(true)}
          className={`h-full w-full border-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}
