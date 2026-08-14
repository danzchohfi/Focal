"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";
import { getProjeto } from "@/data/projetos";

// ── Vídeo da obra — Cloudflare Stream ────────────────────────────────────
// Master "hf_20260813_194702" na conta da Vitamina. Para trocar o vídeo,
// basta apontar UID/host para outro asset do Stream: o resto (MP4, HLS,
// poster) deriva daqui.
const STREAM =
  "https://customer-mvmgeaoiwcmxb2t3.cloudflarestream.com/37c7419e039568e2821a66ccbfde93ff";
const HLS_URL = `${STREAM}/manifest/video.m3u8`;
// O MP4 progressivo é o formato certo pra scrub (seek preciso e barato) e é
// tentado primeiro — só existe se "MP4 downloads" estiver ativo no painel do
// Stream. Sem ele, o scrub cai pro HLS.
const MP4_URL = `${STREAM}/downloads/default.mp4`;
const POSTER = `${STREAM}/thumbnails/thumbnail.jpg?time=2s&height=1080`;
// ─────────────────────────────────────────────────────────────────────────

const p = getProjeto("artur-73")!;
const st = Object.fromEntries(p.status.map((s) => [s.label, s.valor]));
const TOTAL = st["Total Geral"] ?? 0;

// Capítulos = as etapas reais da obra, na ordem em que acontecem. O número
// do chip conta de 0 até o valor real enquanto o scroll atravessa o capítulo.
const FASES = [
  { n: "01", titulo: "Fundação", valor: st["Fundação"] ?? 0 },
  { n: "02", titulo: "Estrutura", valor: st["Estrutura"] ?? 0 },
  { n: "03", titulo: "Acabamentos", valor: st["Acabamentos"] ?? 0 },
];
// Scroll dedicado a cada capítulo, em alturas de viewport.
const VH_POR_FASE = 1.1;

function sufixo(valor: number): string {
  return valor >= 100 ? "concluída" : "em andamento";
}

/**
 * Seção "a obra": painel sticky de 100svh dentro de um wrapper alto; o
 * scroll atravessa o wrapper enquanto a UI fica presa, e o progresso
 * (0–1, medido por getBoundingClientRect a cada frame) comanda TUDO —
 * o tempo do vídeo (scrub: rolar avança, voltar rebobina), a troca de
 * capítulos, os contadores e a barra segmentada.
 *
 * De propósito não usa ScrollTrigger/pin aqui: o pin muda o layout da
 * página (spacers) e o start dele depende da ordem de inicialização em
 * relação ao pin do trilho de diferenciais — medir o wrapper por rect a
 * cada frame é imune a tudo isso.
 */
export default function ObraScroll() {
  const raiz = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const wrapper = raiz.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzido) return; // sem scrub nem animação: poster + estado real

    let hls: { destroy: () => void } | null = null;
    let raf = 0;
    let rodando = false;
    let videoIniciado = false;
    let entrou = false;
    let cancelado = false;
    let suave = 0; // progresso com inércia, pra UI não "serrilhar" com a roda

    /* ── Timeline da UI (pausado; dirigido por tl.progress abaixo) ── */
    const n = FASES.length;
    let tl: { progress: (v: number) => void; kill: () => void } | null = null;
    let entrada: { play: () => void; kill: () => void } | null = null;
    const vistas = new Set<number>();

    (async () => {
      const { gsap } = await import("gsap");
      if (cancelado) return;

      const q = <T extends HTMLElement>(sel: string) =>
        Array.from(wrapper.querySelectorAll<T>(sel));
      const fases = q("[data-obra-fase]");
      const nums = q("[data-obra-num]");
      const pcts = q("[data-obra-pct]");
      const entradas = q("[data-obra-entrada]");

      /* Entrada do capítulo 01 + moldura (kicker e barra) — roda uma vez */
      const linhas = q("[data-obra-linha]");
      gsap.set(linhas, { yPercent: 115 });
      gsap.set(entradas, { autoAlpha: 0, y: 16 });
      entrada = gsap
        .timeline({ paused: true, defaults: { ease: "expo.out" } })
        .to(linhas, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0)
        .to(entradas, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.25);
      if (entrou) entrada.play(); // o painel apareceu antes de o GSAP carregar

      nums.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0.35 }));

      const linha = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      linha.fromTo(wrapper.querySelector("[data-obra-fill]"), { scaleX: 0 }, { scaleX: 1, duration: n }, 0);
      linha.fromTo(wrapper.querySelector("[data-obra-video]"), { scale: 1.06 }, { scale: 1, duration: n }, 0);

      FASES.forEach((f, i) => {
        const alvoEl = pcts[i];
        if (!alvoEl) return;
        const contador = { v: 0 };
        linha.to(
          contador,
          {
            v: f.valor,
            duration: 0.8,
            onUpdate: () => {
              alvoEl.textContent = String(Math.round(contador.v));
            },
          },
          i + 0.05
        );
      });

      for (let i = 1; i < n; i++) {
        linha.to(fases[i - 1], { autoAlpha: 0, y: -44, duration: 0.32, ease: "power1.in" }, i - 0.36);
        linha.fromTo(
          fases[i],
          { autoAlpha: 0, y: 48 },
          { autoAlpha: 1, y: 0, duration: 0.36, ease: "power1.out" },
          i - 0.02
        );
        linha.to(nums[i], { opacity: 1, duration: 0.1 }, i - 0.02);
      }
      linha.progress(0);
      tl = linha;
    })();

    /* ── Vídeo ── */
    const tentarMp4 = () =>
      new Promise<boolean>((resolver) => {
        const limpar = () => {
          video.removeEventListener("loadedmetadata", ok);
          video.removeEventListener("error", falha);
          clearTimeout(t);
        };
        const ok = () => {
          limpar();
          resolver(true);
        };
        const falha = () => {
          limpar();
          resolver(false);
        };
        const t = setTimeout(falha, 12000);
        video.addEventListener("loadedmetadata", ok, { once: true });
        video.addEventListener("error", falha, { once: true });
        video.preload = "auto"; // scrub precisa do arquivo inteiro no buffer
        video.src = MP4_URL;
        video.load();
      });

    const iniciarVideo = async () => {
      if (videoIniciado || cancelado) return;
      videoIniciado = true;
      if (await tentarMp4()) return;
      if (cancelado) return;
      video.removeAttribute("src");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = HLS_URL; // Safari busca nativamente no HLS
        video.load();
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelado) return;
      if (Hls.isSupported()) {
        const h = new Hls({
          capLevelToPlayerSize: true,
          // Scrub anda pra trás e pra frente: segura o vídeo curto inteiro
          // no buffer nos dois sentidos.
          maxBufferLength: 120,
          backBufferLength: Infinity,
        });
        hls = h;
        h.loadSource(HLS_URL);
        h.attachMedia(video);
        h.on(Hls.Events.ERROR, (_ev, dados) => {
          if (dados.fatal) {
            h.destroy();
            hls = null; // sem vídeo: o poster e a narrativa seguram a seção
          }
        });
      }
    };

    /* ── Laço mestre: progresso → timeline da UI + tempo do vídeo ── */
    const passo = () => {
      if (!rodando) return;
      const r = wrapper.getBoundingClientRect();
      const percurso = r.height - window.innerHeight;
      const bruto = percurso > 0 ? Math.min(Math.max(-r.top / percurso, 0), 1) : 0;
      // Inércia curta (≈ scrub 0.6 do ScrollTrigger)
      suave += (bruto - suave) * 0.16;
      if (Math.abs(bruto - suave) < 0.001) suave = bruto;

      tl?.progress(suave);

      const faseAtual = Math.min(n - 1, Math.floor(suave * n));
      if (!vistas.has(faseAtual)) {
        vistas.add(faseAtual);
        track("obra_scroll_fase", { fase: FASES[faseAtual]?.titulo ?? String(faseAtual + 1) });
      }

      const dur = video.duration;
      if (Number.isFinite(dur) && dur > 0) {
        const alvo = bruto * Math.max(dur - 0.08, 0);
        const delta = alvo - video.currentTime;
        if (Math.abs(delta) > 0.033 && !video.seeking) {
          // Saltos grandes vão direto; os pequenos aproximam por lerp.
          video.currentTime = Math.abs(delta) > 1.5 ? alvo : video.currentTime + delta * 0.28;
        }
      }
      raf = requestAnimationFrame(passo);
    };
    const ligar = () => {
      if (!rodando) {
        rodando = true;
        raf = requestAnimationFrame(passo);
      }
    };
    const desligar = () => {
      rodando = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          void iniciarVideo();
          ligar();
        } else {
          desligar();
        }
      },
      // Margem generosa: o download começa antes de a seção prender.
      { rootMargin: "600px 0px" }
    );
    io.observe(wrapper);

    // Entrada quando o painel (não o wrapper alto) aparece de fato na tela
    const painel = wrapper.querySelector("[data-obra-painel]") ?? wrapper;
    const ioEntrada = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !entrou) {
          entrou = true;
          entrada?.play(); // se o GSAP ainda não carregou, o build dá play
          ioEntrada.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    ioEntrada.observe(painel);

    return () => {
      cancelado = true;
      desligar();
      io.disconnect();
      ioEntrada.disconnect();
      hls?.destroy();
      tl?.kill();
      entrada?.kill();
    };
  }, []);

  return (
    <section
      ref={raiz}
      aria-label="A obra, etapa por etapa"
      className="relative h-[var(--obra-h)] border-t border-white/10 bg-[#0C100F] motion-reduce:h-auto"
      style={{ "--obra-h": `${(1 + FASES.length * VH_POR_FASE) * 100}svh` } as React.CSSProperties}
    >
      {/* Painel preso enquanto o scroll atravessa o wrapper */}
      <div data-obra-painel className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Vídeo de fundo — o scroll controla o tempo */}
        <div data-obra-video className="absolute inset-0 will-change-transform">
          <video
            ref={videoRef}
            poster={POSTER}
            muted
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
            Total geral · {TOTAL}% · Entrega {p.detalhes.entrega}
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
                  <span className="block overflow-hidden">
                    {i === 0 ? (
                      <span data-obra-linha className="block">
                        {f.titulo}
                      </span>
                    ) : (
                      <span className="block">{f.titulo}</span>
                    )}
                  </span>
                </h2>
                <p
                  data-obra-entrada={i === 0 ? "" : undefined}
                  className="din mt-7 inline-block rounded-[4px] bg-[#0C100F]/70 px-4 py-2.5 text-[12px] uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm"
                >
                  <span className="text-verde">
                    <span data-obra-pct className="[font-variant-numeric:tabular-nums]">
                      {f.valor}
                    </span>
                    %
                  </span>{" "}
                  · {sufixo(f.valor)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Barra segmentada — preenche de ponta a ponta ao longo do percurso.
            Fica acima da barra fixa de conversão da LP (que ocupa o rodapé). */}
        <div
          data-obra-entrada
          className="absolute inset-x-5 bottom-28 z-10 md:inset-x-10 md:bottom-24"
        >
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
      </div>
    </section>
  );
}
