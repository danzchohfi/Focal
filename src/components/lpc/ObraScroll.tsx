"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { track } from "@/lib/track";
import { getProjeto } from "@/data/projetos";

// ── Vídeo da obra — Cloudflare Stream ────────────────────────────────────
// Master "hf_20260813_194702" na conta da Vitamina. Para trocar o vídeo,
// basta apontar UID/host para outro asset do Stream: o resto (HLS, poster,
// fallback MP4) deriva daqui.
const STREAM =
  "https://customer-mvmgeaoiwcmxb2t3.cloudflarestream.com/37c7419e039568e2821a66ccbfde93ff";
const HLS_URL = `${STREAM}/manifest/video.m3u8`;
// Só existe se "MP4 downloads" estiver ativo no painel — por isso é fallback.
const MP4_URL = `${STREAM}/downloads/default.mp4`;
const POSTER = `${STREAM}/thumbnails/thumbnail.jpg?time=2s&height=1080`;
// ─────────────────────────────────────────────────────────────────────────

const p = getProjeto("artur-73")!;
const st = Object.fromEntries(p.status.map((s) => [s.label, s.valor]));
const TOTAL = st["Total Geral"] ?? 0;

function chipEtapa(label: string): string {
  const v = st[label];
  if (v === undefined) return label;
  return v >= 100 ? `${label} · 100% concluída` : `${label} · ${v}% em andamento`;
}

// Capítulos da obra. As linhas do título são separadas porque cada uma anima
// dentro da própria máscara (mesmo recurso do hero).
const FASES = [
  { n: "01", linhas: ["Assentar", "as fundações"], chip: chipEtapa("Fundação") },
  { n: "02", linhas: ["Erguer", "a estrutura"], chip: chipEtapa("Estrutura") },
  { n: "03", linhas: ["Vestir", "o edifício"], chip: chipEtapa("Acabamentos") },
  { n: "04", linhas: ["Entregar", "as chaves"], chip: `Entrega · ${p.detalhes.entrega}` },
];

export default function ObraScroll() {
  const raiz = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Vídeo: carrega só quando a seção se aproxima da tela e toca só enquanto
     ela está visível. Safari toca HLS nativo; o resto usa hls.js (import
     dinâmico — fora do bundle inicial). Se o HLS falhar, tenta o MP4 direto;
     se nada tocar, o poster do Stream segura a cena. */
  useEffect(() => {
    const secao = raiz.current;
    const video = videoRef.current;
    if (!secao || !video) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) return; // sem autoplay: fica o poster

    let hls: { destroy: () => void } | null = null;
    let iniciado = false;
    let cancelado = false;

    async function iniciar() {
      if (iniciado || cancelado) return;
      iniciado = true;
      const v = videoRef.current;
      if (!v) return;
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = HLS_URL;
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelado) return;
      if (Hls.isSupported()) {
        const h = new Hls({ capLevelToPlayerSize: true });
        hls = h;
        h.loadSource(HLS_URL);
        h.attachMedia(v);
        h.on(Hls.Events.ERROR, (_ev, dados) => {
          if (!dados.fatal) return;
          h.destroy();
          hls = null;
          v.src = MP4_URL;
          v.play().catch(() => {});
        });
      } else {
        v.src = MP4_URL;
      }
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          void iniciar().then(() => {
            if (!cancelado) video.play().catch(() => {});
          });
        } else {
          video.pause();
        }
      },
      // Margem generosa: o buffer começa antes de a seção pinar.
      { rootMargin: "400px 0px" }
    );
    io.observe(secao);

    return () => {
      cancelado = true;
      io.disconnect();
      hls?.destroy();
    };
  }, []);

  /* Scroll: pina a seção por ~1 viewport por capítulo. Um timeline com scrub
     preenche a barra segmentada de ponta a ponta e troca título/chip em cada
     fronteira de capítulo; o vídeo assenta de 1.12 → 1 ao longo do trajeto. */
  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;

    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduzido) return;

      ctx = gsap.context(() => {
        const fases = gsap.utils.toArray<HTMLElement>("[data-obra-fase]");
        const nums = gsap.utils.toArray<HTMLElement>("[data-obra-num]");
        const n = fases.length;

        /* Entrada do capítulo 01 + moldura (kicker e barra), fora do scrub */
        const linhas = gsap.utils.toArray<HTMLElement>("[data-obra-linha]");
        gsap.set(linhas, { yPercent: 115 });
        gsap.set("[data-obra-entrada]", { autoAlpha: 0, y: 16 });
        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: { trigger: el, start: "top 62%" },
          })
          .to(linhas, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0)
          .to("[data-obra-entrada]", { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.25);

        /* Estado inicial dos números da barra: só o 01 aceso */
        nums.forEach((el2, i) => gsap.set(el2, { opacity: i === 0 ? 1 : 0.35 }));

        const vistas = new Set<number>();
        const marcar = (i: number) => {
          if (vistas.has(i)) return;
          vistas.add(i);
          track("obra_scroll_fase", { fase: FASES[i]?.n ?? String(i + 1) });
        };
        marcar(0);

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: `+=${n * 90}%`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo("[data-obra-fill]", { scaleX: 0 }, { scaleX: 1, duration: n }, 0);
        tl.fromTo("[data-obra-video]", { scale: 1.12 }, { scale: 1, duration: n }, 0);

        for (let i = 1; i < n; i++) {
          tl.to(
            fases[i - 1],
            { autoAlpha: 0, y: -44, duration: 0.32, ease: "power1.in" },
            i - 0.36
          );
          tl.fromTo(
            fases[i],
            { autoAlpha: 0, y: 48 },
            { autoAlpha: 1, y: 0, duration: 0.36, ease: "power1.out" },
            i - 0.02
          );
          // O número acende quando o preenchimento cruza o começo do segmento
          // (e fica aceso — trecho vencido da obra).
          tl.to(nums[i], { opacity: 1, duration: 0.1 }, i - 0.02);
          tl.add(() => marcar(i), i);
        }
      }, el);
    })();

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={raiz}
      aria-label="A obra, capítulo a capítulo"
      className="relative h-[100svh] overflow-hidden border-t border-white/10 bg-[#0C100F]"
    >
      {/* Vídeo de fundo */}
      <div data-obra-video className="absolute inset-0 will-change-transform">
        <video
          ref={videoRef}
          poster={POSTER}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="h-full w-full object-cover"
        />
      </div>

      {/* Véus de legibilidade: texto à esquerda, barra embaixo */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#0C100F]/75 via-[#0C100F]/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0C100F]/85 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0C100F]/70 to-transparent"
      />

      {/* Moldura superior */}
      <div
        data-obra-entrada
        className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1240px] items-baseline justify-between px-5 pt-8 md:px-10"
      >
        <p className="kicker text-verde">A obra</p>
        <p className="din hidden text-[13px] uppercase tracking-[0.14em] text-white/60 sm:block">
          Total geral · {TOTAL}% concluído
        </p>
      </div>

      {/* Capítulos — empilhados; o scroll troca qual está visível */}
      <div className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2">
        <div className="relative mx-auto max-w-[1240px] px-5 md:px-10">
          {FASES.map((f, i) => (
            <div
              key={f.n}
              data-obra-fase
              className={i === 0 ? "relative" : "absolute inset-x-5 top-0 opacity-0 md:inset-x-10"}
            >
              <h2 className="din max-w-[12ch] text-[clamp(44px,8.5vw,118px)] leading-[0.95] tracking-[-0.02em] text-white">
                {f.linhas.map((linha) => (
                  <span key={linha} className="block overflow-hidden">
                    {i === 0 ? (
                      <span data-obra-linha className="block">
                        {linha}
                      </span>
                    ) : (
                      <span className="block">{linha}</span>
                    )}
                  </span>
                ))}
              </h2>
              <p
                data-obra-entrada={i === 0 ? "" : undefined}
                className="din mt-7 inline-block rounded-[4px] bg-[#0C100F]/70 px-4 py-2.5 text-[12px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm"
              >
                {f.chip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Barra segmentada — preenche de ponta a ponta ao longo do pin.
          Fica acima da barra fixa de conversão da LP (que ocupa o rodapé). */}
      <div data-obra-entrada className="absolute inset-x-5 bottom-28 z-10 md:inset-x-10 md:bottom-24">
        <div className="relative h-9 overflow-hidden bg-white/12 md:h-10">
          <div
            data-obra-fill
            className="absolute inset-0 origin-left bg-verde"
            style={{ transform: `scaleX(${TOTAL / 100})` }}
          />
          {FASES.slice(1).map((f, i) => (
            <span
              key={f.n}
              aria-hidden
              className="absolute top-0 h-full w-px bg-[#0C100F]/80"
              style={{ left: `${((i + 1) / FASES.length) * 100}%` }}
            />
          ))}
          {FASES.map((f, i) => (
            <span
              key={f.n}
              data-obra-num
              className="din absolute top-1/2 -translate-y-1/2 text-[13px] tracking-[0.2em] text-white"
              style={{
                left: `calc(${(i / FASES.length) * 100}% + 14px)`,
                opacity: i / FASES.length < TOTAL / 100 ? 1 : 0.35,
              }}
            >
              {f.n}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
