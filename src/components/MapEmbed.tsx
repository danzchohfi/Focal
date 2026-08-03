"use client";

import { useEffect, useRef, useState } from "react";

// Mapa do Google via embed sem chave, carregado só quando entra no viewport.
export default function MapEmbed({ query }: { query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);

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
    <div ref={ref} className="h-[420px] w-full bg-light md:h-[600px]">
      {load && (
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&output=embed`}
          title={`Mapa — ${query}`}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </div>
  );
}
