"use client";

import { useEffect, useRef, useState } from "react";

const R = 34;
const C = 2 * Math.PI * R;

// Gráfico circular de status da obra: arco anima via transição CSS (60fps),
// número via rAF; cascata opcional com delay.
export default function PieStatus({
  label,
  valor,
  delay = 0,
}: {
  label: string;
  valor: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [num, setNum] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = requestAnimationFrame(() => {
        setOn(true);
        setNum(valor);
      });
      return () => cancelAnimationFrame(t);
    }
    const io = new IntersectionObserver(
      (e) => {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        const start = () => {
          setOn(true);
          const t0 = performance.now();
          const dur = 1200;
          const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / dur);
            setNum(Math.round(valor * (1 - Math.pow(1 - k, 3))));
            if (k < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };
        if (delay) setTimeout(start, delay);
        else start();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [valor, delay]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" stroke="#111" strokeOpacity="0.08" strokeWidth="6.5" />
          <circle
            cx="40"
            cy="40"
            r={R}
            fill="none"
            stroke="#111111"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={on ? C * (1 - valor / 100) : C}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.33,1,.68,1)" }}
          />
        </svg>
        <span className="din absolute inset-0 flex items-center justify-center text-[22px] text-ink [font-variant-numeric:tabular-nums]">
          {num}%
        </span>
      </div>
      <p className="text-[15px] text-ink-2">{label}</p>
    </div>
  );
}
