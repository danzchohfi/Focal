"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * O filme conduzido pelo scroll — a peça central da LP-D.
 *
 * Sequência de frames WebP desenhada num canvas, com o índice do frame
 * amarrado ao progresso do ScrollTrigger (a seção fica pinada por ~3 alturas
 * de viewport). O vídeo é vertical, então o canvas entra emoldurado sobre o
 * fundo escuro — a mesma composição dos cards da identidade.
 *
 * Camadas de degradação:
 * - Sem JS: o markup estático já traz o poster emoldurado e as três legendas
 *   empilhadas — nada fica invisível.
 * - prefers-reduced-motion: sem pin e sem scrub; o poster vira um player de
 *   vídeo nativo com controles (o mp4 original de 2,6 MB).
 * - Com JS: os frames carregam em paralelo (8 por vez) e o scrub desenha o
 *   frame mais próximo já disponível, então a cena funciona mesmo com a
 *   sequência ainda baixando.
 */

const FRAMES = 134;
const src = (i: number) => asset(`/a73d/film/f${String(i + 1).padStart(3, "0")}.webp`);

const BEATS = [
  { t: "O que existe entre a Artur de Azevedo e a Oscar Freire?", sub: null },
  { t: "Esse pequeno trecho de Pinheiros concentra o melhor da cidade.", sub: null },
  {
    t: "É nesse encontro raro — tranquilo, vibrante e inteligente — que nasce o Artur 73.",
    sub: "Chaves em 2026",
  },
];

export default function ScrollFilm() {
  const secRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const molduraRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<"estatico" | "filme" | "player">("estatico");

  useEffect(() => {
    // rAF: decide o modo fora do corpo síncrono do efeito (regra
    // react-hooks/set-state-in-effect) e já com o layout estabilizado.
    const id = requestAnimationFrame(() => {
      setModo(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "player" : "filme");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useLayoutEffect(() => {
    if (modo !== "filme") return;
    const sec = secRef.current;
    const canvas = canvasRef.current;
    const moldura = molduraRef.current;
    if (!sec || !canvas || !moldura) return;

    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    let cancelado = false;
    let ctx: { revert: () => void } | undefined;

    // Carrega a sequência com concorrência limitada; desenha o que houver.
    const imgs: (HTMLImageElement | null)[] = Array(FRAMES).fill(null);
    let atual = 0;

    const desenhar = (idx: number) => {
      // Frame pedido ou o mais próximo anterior já carregado.
      let i = Math.max(0, Math.min(FRAMES - 1, idx));
      while (i > 0 && !imgs[i]) i--;
      const img = imgs[i];
      if (!img) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = moldura.getBoundingClientRect();
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // cover
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx2d.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    let fila = 0;
    const carregarProximo = () => {
      if (cancelado || fila >= FRAMES) return;
      const i = fila++;
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        imgs[i] = img;
        if (i === Math.round(atual)) desenhar(i);
        carregarProximo();
      };
      img.onerror = () => carregarProximo();
      img.src = src(i);
    };
    for (let k = 0; k < 8; k++) carregarProximo();

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const st = {
          trigger: sec,
          start: "top top",
          end: "+=280%",
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        };

        const alvo = { f: 0 };
        gsap.to(alvo, {
          f: FRAMES - 1,
          ease: "none",
          scrollTrigger: st,
          onUpdate: () => {
            atual = alvo.f;
            desenhar(Math.round(alvo.f));
          },
        });

        // Trilha de progresso ao lado da moldura.
        gsap.fromTo(
          "[data-film-progresso]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { ...st, pin: false } }
        );

        // Três atos de legenda, um por terço do scroll.
        const beats = gsap.utils.toArray<HTMLElement>("[data-film-beat]");
        gsap.set(beats, { opacity: 0, y: 24 });
        const tl = gsap.timeline({ scrollTrigger: { ...st, pin: false } });
        const fatia = 1 / beats.length;
        beats.forEach((b, i) => {
          const ini = i * fatia;
          tl.to(b, { opacity: 1, y: 0, duration: fatia * 0.3 }, ini + fatia * 0.08);
          if (i < beats.length - 1) {
            tl.to(b, { opacity: 0, y: -18, duration: fatia * 0.22 }, ini + fatia * 0.74);
          }
        });

        // Zoom sutil de aproximação na moldura, acompanhando o voo.
        gsap.fromTo(
          moldura,
          { scale: 0.94 },
          { scale: 1, ease: "none", scrollTrigger: { ...st, pin: false } }
        );
      }, sec);

      const aoRedimensionar = () => desenhar(Math.round(atual));
      window.addEventListener("resize", aoRedimensionar);
      const limparResize = () => window.removeEventListener("resize", aoRedimensionar);
      const revertOriginal = ctx.revert.bind(ctx);
      ctx = { revert: () => { limparResize(); revertOriginal(); } };
    })();

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, [modo]);

  return (
    <section
      ref={secRef}
      aria-label="Filme aéreo do bairro do Artur 73"
      className="relative overflow-hidden bg-[#12475F]"
    >
      <div className="relative mx-auto flex min-h-[100svh] max-w-[1240px] flex-col items-center justify-center gap-8 px-5 py-16 md:flex-row md:gap-16 md:px-10">
        {/* Coluna de legendas (com JS vira sobreposição animada) */}
        <div className="relative z-10 order-2 w-full max-w-[34rem] md:order-1 md:flex-1">
          {modo === "filme" ? (
            <div className="relative min-h-[12rem] md:min-h-[16rem]">
              {BEATS.map((b) => (
                <div key={b.t} data-film-beat className="absolute inset-x-0 top-0">
                  <p className="din-book text-[clamp(24px,3.4vw,40px)] leading-[1.18] text-white">
                    {b.t}
                  </p>
                  {b.sub && (
                    <p className="kicker mt-5 text-[#BCD7E6]">{b.sub}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {BEATS.map((b) => (
                <div key={b.t}>
                  <p className="din-book text-[clamp(22px,3vw,32px)] leading-[1.2] text-white">{b.t}</p>
                  {b.sub && <p className="kicker mt-3 text-[#BCD7E6]">{b.sub}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mídia emoldurada, como nos cards da identidade */}
        <div className="relative order-1 flex items-center gap-4 md:order-2">
          <p
            aria-hidden
            className="kicker hidden origin-center -rotate-180 text-white/45 [writing-mode:vertical-rl] lg:block"
          >
            R. Artur Azevedo, 73
          </p>

          <div
            ref={molduraRef}
            className="relative aspect-[9/16] h-[62svh] max-h-[640px] overflow-hidden rounded-md bg-[#0D3549] shadow-[0_24px_80px_-24px_rgba(0,0,0,.55)] md:h-[74svh]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/a73d/poster.webp")}
              alt="Sobrevoo do entorno do Artur 73, em Pinheiros"
              className="absolute inset-0 h-full w-full object-cover"
            />
            {modo === "filme" && (
              <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
            )}
            {modo === "player" && (
              <video
                controls
                playsInline
                preload="none"
                poster={asset("/a73d/poster.webp")}
                src={asset("/wp/Focal_Drones_v4_mobile-MPEG-4-720-2.mp4")}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>

          {/* Trilha de progresso do filme */}
          {modo === "filme" && (
            <div aria-hidden className="hidden h-[62svh] max-h-[640px] w-px bg-white/15 md:block md:h-[74svh]">
              <div data-film-progresso className="h-full w-full origin-top bg-[#BCD7E6]" />
            </div>
          )}
          <p
            aria-hidden
            className="kicker hidden text-white/45 [writing-mode:vertical-rl] lg:block"
          >
            Chaves em 2026
          </p>
        </div>
      </div>
    </section>
  );
}
