"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de partículas do hero da LP-C: motes de luz subindo, com repulsão
 * suave ao ponteiro e linhas de conexão perto do cursor.
 *
 * Diferente de <Particles/> (usado no hero da home), aqui a cor acompanha o
 * verde da marca e há interação — é a camada que dá a sensação de ambiente
 * vivo sem competir com o texto.
 *
 * Desliga em prefers-reduced-motion e pausa quando sai da viewport.
 */
export default function ParticleField({
  density = 46,
  tint = "24, 150, 115",
}: {
  density?: number;
  tint?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visivel = true;
    // Ponteiro fora da tela até o primeiro movimento, para não repelir no load.
    const ponteiro = { x: -9999, y: -9999 };

    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number };
    let pts: P[] = [];

    const criar = (): P => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.5 + Math.random() * 1.7,
      vx: -0.06 + Math.random() * 0.12,
      vy: -0.12 - Math.random() * 0.16,
      a: 0.1 + Math.random() * 0.35,
      tw: Math.random() * Math.PI * 2,
    });

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Densidade proporcional à área, com teto para telas grandes.
      const alvo = Math.min(density, Math.round((w * h) / 16000));
      pts = Array.from({ length: Math.max(14, alvo) }, criar);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      ponteiro.x = e.clientX - rect.left;
      ponteiro.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      ponteiro.x = -9999;
      ponteiro.y = -9999;
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visivel) return;

      ctx.clearRect(0, 0, w, h);
      const RAIO = 130;

      for (const p of pts) {
        // Repulsão suave: empurra o mote para longe do ponteiro.
        const dx = p.x - ponteiro.x;
        const dy = p.y - ponteiro.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < RAIO * RAIO) {
          const d = Math.sqrt(dist2) || 1;
          const forca = (1 - d / RAIO) * 0.7;
          p.x += (dx / d) * forca;
          p.y += (dy / d) * forca;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -6) {
          p.y = h + 6;
          p.x = Math.random() * w;
        }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;

        const alpha = p.a * (0.6 + 0.4 * Math.sin(t / 1500 + p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${tint},${alpha.toFixed(3)})`;
        ctx.fill();

        // Fio de luz ligando o mote ao cursor quando está perto.
        if (dist2 < RAIO * RAIO) {
          const forca = 1 - Math.sqrt(dist2) / RAIO;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(ponteiro.x, ponteiro.y);
          ctx.strokeStyle = `rgba(${tint},${(forca * 0.16).toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    };

    resize();
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0 });
    io.observe(parent);
    window.addEventListener("resize", resize);
    parent.addEventListener("pointermove", onPointer);
    parent.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      parent.removeEventListener("pointermove", onPointer);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [density, tint]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[5]" />;
}
