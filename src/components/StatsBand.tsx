"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { alvo: 500, fmt: (v: number) => `${v}MM`, label: "Vendidos" },
  { alvo: 1300, fmt: (v: number) => `${v.toLocaleString("pt-BR")}${v >= 1300 ? "+" : ""}`, label: "Unidades Entregues" },
  { alvo: 80000, fmt: (v: number) => `${v.toLocaleString("pt-BR")}m²`, label: "Construídos" },
];

// Faixa de números sobre a foto aérea. SSR/first paint já mostra os valores
// finais; a contagem anima só quando a faixa entra no viewport.
export default function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [vals, setVals] = useState(stats.map((s) => s.alvo));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (e) => {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        const dur = 1600;
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / dur);
          const ease = 1 - Math.pow(1 - k, 3);
          setVals(stats.map((s) => Math.round(s.alvo * ease)));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative bg-[#2F5D48] py-32 md:py-40">
      <div className="relative mx-auto grid max-w-[1300px] grid-cols-1 gap-14 px-6 text-center text-white sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label}>
            <p className="din h-num">{s.fmt(vals[i])}</p>
            <p className="din mt-3 text-[13px] uppercase tracking-[0.15em] text-[#DFE6DC]">
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
