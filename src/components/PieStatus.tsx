"use client";

import { useEffect, useRef, useState } from "react";

// Gráfico circular de status da obra (vc_pie_chart do site atual),
// animado ao entrar no viewport.
export default function PieStatus({ label, valor }: { label: string; valor: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setV(valor);
          return;
        }
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          setV(Math.round(valor * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [valor]);

  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" stroke="#e5e5e5" strokeWidth="5" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="#111111"
            strokeWidth="5"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - v / 100)}
          />
        </svg>
        <span className="din absolute inset-0 flex items-center justify-center text-[18px] text-ink">
          {v}%
        </span>
      </div>
      <p className="text-[15px] text-ink-2">{label}</p>
    </div>
  );
}
