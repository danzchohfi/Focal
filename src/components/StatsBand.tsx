"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

const stats = [
  { alvo: 500, fmt: (v: number) => `${v}MM`, label: "Vendidos" },
  { alvo: 1300, fmt: (v: number) => `${v.toLocaleString("pt-BR")}${v >= 1300 ? "+" : ""}`, label: "Unidades Entregues" },
  { alvo: 80000, fmt: (v: number) => `${v.toLocaleString("pt-BR")}m²`, label: "Construídos" },
];

// Faixa de números com contadores animados sobre a foto aérea (VOO-PASSARO).
export default function StatsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [vals, setVals] = useState(stats.map(() => 0));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (e) => {
        if (e[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!on) return;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = reduzido ? 0 : 1600;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = dur === 0 ? 1 : Math.min(1, (t - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 3);
      setVals(stats.map((s) => Math.round(s.alvo * ease)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);

  return (
    <section
      ref={ref}
      className="relative bg-cover bg-center py-24 md:py-28"
      style={{ backgroundImage: `url(${asset("/wp/VOO-PASSARO.jpg")})` }}
    >
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative mx-auto grid max-w-[1300px] grid-cols-1 gap-12 px-6 text-center text-white sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={s.label}>
            <p className="din h-num">{s.fmt(vals[i])}</p>
            <p className="mt-2 text-[17px] md:text-[18px]">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
