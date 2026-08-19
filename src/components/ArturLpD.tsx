"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import MapEmbed from "./MapEmbed";
import EscalaAltura from "./lpc/EscalaAltura";
import ObraScroll from "./lpc/ObraScroll";
import IconeD, { type IconeDNome } from "./lpd/IconeD";
import BairroExplorer from "./lpd/BairroExplorer";
import CartoesMorar from "./lpd/CartoesMorar";
import ScrollFilm from "./lpd/ScrollFilm";
import TowerLines from "./lpd/TowerLines";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import { track } from "@/lib/track";
import { getProjeto } from "@/data/projetos";

// ── Dados comerciais da campanha (mesmos das variantes B/C) ──────────────
// ⚠️ Confirmar com o time antes de escalar mídia.
const comercial = {
  precoResidencial: "R$ 2,054 mi",
  precoNR: "R$ 1,5 mi",
  valorizacaoNR: "~12% a.a. desde o lançamento (2023)",
};
// ─────────────────────────────────────────────────────────────────────────

const p = getProjeto("artur-73")!;
const PE_DIREITO = 5.5;
// Coordenadas do diagrama em lpc/EscalaAltura.tsx
const ESCALA_PISO = 440;
const ESCALA_ALTURA = 320;

/* Paleta da identidade 2026 — as três famílias que conversam */
const COR = {
  navy: "#12475F",
  navyFundo: "#0D3549",
  pastel: "#BCD7E6",
  pastelClaro: "#DCE9F1",
  pinho: "#2F5D48",
  salvia: "#E4EAE2",
  taupe: "#C9AD96",
  marrom: "#53381E",
  off: "#F6F4EF",
};

function waMsg(sobre: string) {
  return waLink(site.whatsapp, `Olá! Vi o Artur 73 no site e quero ${sobre}`);
}

/* ─────────────────────────────  CTA  ───────────────────────────── */

function Cta({
  posicao,
  sobre,
  children,
  className = "",
}: {
  posicao: string;
  sobre: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={waMsg(sobre)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("clique_whatsapp", { posicao })}
      className={`cta group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-md bg-verde px-8 py-4 text-white transition-transform duration-200 active:scale-[0.985] ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full motion-reduce:hidden"
      />
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="relative">
        <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
      </svg>
      <span className="relative">{children}</span>
    </a>
  );
}

/* ──────────────  Formulário curto (inalterado da variante C)  ───────────── */

const QUANDO = ["Neste mês", "Daqui 1 a 3 meses", "Acima de 3 meses"];

function FormRapido() {
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "fallback">("idle");
  const [waHref, setWaHref] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setEstado("enviando");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.nome,
          telefone: data.telefone,
          email: "-",
          quando: data.quando,
          contexto: "Artur 73 — LP D",
          origem: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("submit_form", { contexto: "Artur 73 — LP D", canal: "api" });
      setEstado("ok");
    } catch {
      track("submit_form", { contexto: "Artur 73 — LP D", canal: "whatsapp_fallback" });
      setWaHref(
        waLink(
          site.whatsapp,
          `Olá! Vi o Artur 73 no site. Meu nome é ${data.nome}. Quero receber as plantas e valores. Pretendo comprar: ${data.quando}.`
        )
      );
      setEstado("fallback");
    }
  }

  if (estado === "ok" || estado === "fallback") {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
        <svg width="48" height="48" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r="24" fill="none" stroke="#189673" strokeWidth="2" opacity="0.35" />
          <path d="M15 27l8 8 15-17" fill="none" stroke="#189673" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="din mt-5 text-[24px] text-white">
          {estado === "ok" ? "Recebemos seus dados!" : "Quase lá!"}
        </p>
        <p className="mt-2 text-[15px] text-white/70">
          {estado === "ok"
            ? "Nosso time envia as plantas e valores em instantes."
            : "Toque abaixo para receber as plantas e valores no WhatsApp."}
        </p>
        {estado === "fallback" && waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("clique_whatsapp", { posicao: "form-fallback" })}
            className="cta mt-7 inline-flex items-center gap-2 rounded-md bg-verde px-8 py-3.5 text-white transition-opacity duration-200 hover:opacity-90"
          >
            Receber no WhatsApp
          </a>
        )}
      </div>
    );
  }

  const campo =
    "w-full rounded-[4px] border border-white/20 bg-white/[0.04] px-4 py-3.5 text-[16px] text-white placeholder-white/45 outline-none transition-[border-color,background-color] duration-200 focus:border-verde focus:bg-white/[0.07]";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input required name="nome" type="text" placeholder="Nome" autoComplete="name" className={campo} />
      <input
        required
        name="telefone"
        type="tel"
        placeholder="WhatsApp (com DDD)"
        autoComplete="tel"
        inputMode="tel"
        className={campo}
      />
      <div className="relative">
        <select
          name="quando"
          defaultValue={QUANDO[1]}
          aria-label="Quando pretende comprar"
          className={`${campo} cursor-pointer appearance-none pr-10 [&>option]:bg-ink [&>option]:text-white`}
        >
          {QUANDO.map((q) => (
            <option key={q}>{q}</option>
          ))}
        </select>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50" aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="cta w-full rounded-md bg-verde px-8 py-4 text-white transition-[background-color,transform] duration-200 hover:bg-[#14805f] active:scale-[0.985] disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Receber plantas e valores"}
      </button>
      <p className="text-center text-[12px] text-white/45">
        Resposta rápida pelo WhatsApp. Seus dados ficam só com a Focal.
      </p>
    </form>
  );
}

/* ──────────────────────────  Conteúdo  ────────────────────────── */

/* ───────────────────────────  Página  ─────────────────────────── */

export default function ArturLpD() {
  const raiz = useRef<HTMLDivElement>(null);
  const [plantaAtiva, setPlantaAtiva] = useState(0);
  const [ctaVisivel, setCtaVisivel] = useState(false);

  useEffect(() => {
    const hero = raiz.current?.querySelector("[data-hero]");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setCtaVisivel(!e.isIntersecting), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

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

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      ctx = gsap.context(() => {
        /* Hero — entrada */
        const linhas = gsap.utils.toArray<HTMLElement>("[data-hero-linha]");
        gsap.set(linhas, { yPercent: 115 });
        gsap.set("[data-hero-fade]", { opacity: 0, y: 18 });
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(linhas, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0.15)
          .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.55);

        /* Cena da escala do pé-direito */
        const cena = el.querySelector<HTMLElement>("[data-altura]");
        const escala = el.querySelector<HTMLElement>("[data-escala]");
        if (cena && escala) {
          const st = { trigger: escala, start: "top 90%", end: "center 60%", scrub: 0.6 };
          gsap.fromTo(
            "[data-escala-volume]",
            { attr: { y: ESCALA_PISO, height: 0 } },
            { attr: { y: ESCALA_PISO - ESCALA_ALTURA, height: ESCALA_ALTURA }, ease: "none", scrollTrigger: st }
          );
          gsap.fromTo("[data-escala-teto]", { y: ESCALA_ALTURA }, { y: 0, ease: "none", scrollTrigger: st });
          const contador = { v: 0 };
          const alvo = cena.querySelector("[data-cota-num]");
          if (alvo) {
            gsap.to(contador, {
              v: PE_DIREITO,
              ease: "none",
              scrollTrigger: st,
              onUpdate: () => {
                alvo.textContent = contador.v.toFixed(2).replace(".", ",");
              },
            });
          }
        }

        /* Barras de avanço da obra */
        gsap.utils.toArray<HTMLElement>("[data-barra]").forEach((barra) => {
          const pct = Number(barra.dataset.barra || 0);
          gsap.fromTo(
            barra,
            { scaleX: 0 },
            { scaleX: pct / 100, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: barra, start: "top 88%" } }
          );
        });

        /* Revelações */
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((alvo) => {
          gsap.from(alvo, {
            opacity: 0,
            y: 28,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: alvo, start: "top 87%" },
          });
        });
      }, el);
    })();

    return () => {
      cancelado = true;
      ctx?.revert();
    };
  }, []);

  const planta = p.plantas.itens[plantaAtiva];

  return (
    <div ref={raiz} className="lp-b relative" style={{ background: COR.off, color: COR.navy }}>
      {/* ───────────────── Topo ───────────────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ background: "rgba(246,244,239,.92)", borderColor: "rgba(18,71,95,.12)" }}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-3.5 md:px-10">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="preto" className="h-5 w-auto md:h-6" />
          </Link>
          <div className="flex items-center gap-4">
            <a href={site.telefoneHref} className="hidden text-[14px] opacity-75 transition-opacity hover:opacity-100 md:block">
              {site.telefone}
            </a>
            <Cta posicao="topo" sobre="mais informações." className="px-5 py-2.5">
              WhatsApp
            </Cta>
          </div>
        </div>
      </header>

      {/* ───────────────── Hero ───────────────── */}
      <section data-hero className="relative overflow-hidden" style={{ background: COR.pastel }}>
        <TowerLines cor={COR.navy} />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-[1240px] flex-col justify-center px-5 py-16 md:px-10">
          <p data-hero-fade className="kicker" style={{ color: COR.pinho }}>
            R. Artur Azevedo, 73 · Pinheiros
          </p>

          <h1 className="din mt-6 leading-[0.92] tracking-[-0.01em]">
            <span className="block overflow-hidden">
              <span data-hero-linha className="block text-[clamp(64px,13vw,180px)]">
                ARTUR<sup className="ml-1 align-super text-[0.42em] tracking-[0.02em]">73</sup>
              </span>
            </span>
          </h1>

          <p
            data-hero-fade
            className="din-book mt-6 max-w-[24ch] text-[clamp(22px,3vw,34px)] leading-[1.16]"
          >
            Perto de tudo, onde Pinheiros mostra seu melhor.
          </p>

          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            {["81 e 88 m² · 2 suítes", "Studios NR de 52 m²", "Chaves em 2026"].map((c) => (
              <span key={c} className="din text-[13px] uppercase tracking-[0.14em] opacity-70">
                {c}
              </span>
            ))}
          </div>

          <div data-hero-fade className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Cta posicao="hero" sobre="receber as plantas e valores.">
              Falar no WhatsApp
            </Cta>
            <a
              href="#filme"
              className="cta inline-flex items-center justify-center gap-2 rounded-md border px-8 py-4 transition-colors duration-200 hover:bg-white/40"
              style={{ borderColor: "rgba(18,71,95,.35)", color: COR.navy }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5.5v13l11-6.5z" />
              </svg>
              Ver o filme da obra
            </a>
          </div>

          <p data-hero-fade className="mt-6 text-[14px] opacity-70">
            Residenciais a partir de{" "}
            <span className="din text-[22px] opacity-100" style={{ color: COR.navy }}>
              {comercial.precoResidencial}
            </span>
          </p>
        </div>
      </section>

      {/* ───────────── O filme da obra (Higsfield/Stream) — peça central ───────────── */}
      <div id="filme">
        <ObraScroll fundo={COR.navyFundo} />
      </div>

      {/* ───────────── Pé-direito duplo (família azul) ───────────── */}
      <section data-altura className="py-24 md:py-32" style={{ background: COR.pastelClaro }}>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-[1.05fr_1fr] md:gap-16 md:px-10">
          <div data-reveal>
            <p className="kicker" style={{ color: COR.pinho }}>
              O diferencial
            </p>
            <h2 className="din mt-4 text-[clamp(30px,4.2vw,54px)] leading-[1.08] tracking-[-0.015em]">
              Unidades com pé-direito duplo: diferencial arquitetônico real no mercado.
            </h2>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.75] opacity-80">
              Ambientes amplos, arejados, iluminados — 5,5 metros entre o chão e o teto do living,
              o dobro do que a cidade costuma entregar. 81 e 88 m², 2 suítes.
            </p>
            <Cta posicao="pedireito" sobre="conhecer o living de pé-direito duplo." className="mt-9">
              Quero conhecer
            </Cta>
          </div>

          {/* Diagrama emoldurado em navy, como as mídias dos cards */}
          <div data-escala className="rounded-lg p-6 md:p-9" style={{ background: COR.navy }}>
            <EscalaAltura />
          </div>
        </div>
      </section>

      {/* ───────────── Ficha técnica / destaques ───────────── */}
      <section className="py-24 md:py-32" style={{ background: COR.off }}>
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[56ch]">
            <p className="kicker" style={{ color: COR.pinho }}>
              O edifício
            </p>
            <h2 className="din mt-4 text-[clamp(30px,4.2vw,54px)] leading-[1.08] tracking-[-0.015em]">
              76 apartamentos em um projeto pensado para ser perene.
            </h2>
            <p className="mt-5 text-[15px] opacity-70">
              Arquitetura JBA — Jonas Birger · interiores Melina Romano · paisagismo Núcleo Arquitetura
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {p.destaques.map((d, i) => (
              <div key={d.titulo} data-reveal className="flex gap-5 border-t pt-6" style={{ borderColor: "rgba(18,71,95,.15)" }}>
                <div className="flex flex-col items-center gap-2">
                  <IconeD nome={d.icone as IconeDNome} className="shrink-0" />
                  <span className="din text-[11px] tracking-[0.1em] opacity-40">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="din text-[18px] leading-snug">{d.titulo}</h3>
                  <p className="mt-2 max-w-[34ch] text-[14px] leading-[1.65] opacity-70">{d.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── Filme aéreo: a chegada ao bairro ───────────── */}
      <ScrollFilm />

      {/* ───────────── Vizinhança (família verde) ───────────── */}
      <section className="py-24 md:py-32" style={{ background: COR.salvia, color: COR.pinho }}>
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[58ch]">
            <p className="kicker">O bairro</p>
            <h2 className="din mt-4 text-[clamp(30px,4.2vw,54px)] leading-[1.08] tracking-[-0.015em]">
              O que existe entre a Artur de Azevedo e a Oscar Freire?
            </h2>
            <p className="din-book mt-5 text-[clamp(18px,2.2vw,24px)] leading-[1.3]">
              Esse pequeno trecho de Pinheiros concentra o melhor da cidade.
            </p>
          </div>

          <div data-reveal className="mt-12">
            <BairroExplorer />
          </div>

          <div className="mt-20">
            <CartoesMorar />
          </div>

          <div
            data-reveal
            className="mt-16 rounded-lg px-8 py-14 text-center md:py-20"
            style={{ background: COR.pinho }}
          >
            <p className="din-book mx-auto max-w-[30ch] text-[clamp(24px,3.4vw,40px)] leading-[1.2] text-white">
              Pinheiros é onde o design brasileiro respira.
            </p>
            <p className="mx-auto mt-5 max-w-[44ch] text-[16px] text-white/75">
              Artur 73: arquitetura que conversa com esse mesmo espírito criativo.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────── Plantas (família taupe) ───────────── */}
      <section id="plantas" className="py-24 md:py-32" style={{ background: COR.taupe, color: COR.marrom }}>
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[54ch]">
            <p className="kicker">Plantas</p>
            <h2 className="din mt-4 text-[clamp(30px,4.2vw,54px)] leading-[1.08] tracking-[-0.015em]">
              Plantas funcionais, bem resolvidas e prontas para diferentes usos.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_1.15fr] md:gap-16">
            <div className="flex flex-col gap-2">
              {p.plantas.itens.map((pl, i) => {
                const ativo = i === plantaAtiva;
                return (
                  <button
                    key={pl.img}
                    type="button"
                    onClick={() => {
                      setPlantaAtiva(i);
                      track("seleciona_planta", { tipologia: pl.cap });
                    }}
                    aria-pressed={ativo}
                    className={`group flex items-center justify-between gap-4 rounded-md border px-5 py-5 text-left transition-colors duration-300 ${
                      ativo ? "bg-white/45" : "hover:bg-white/25"
                    }`}
                    style={{ borderColor: ativo ? COR.marrom : "rgba(83,56,30,.3)" }}
                  >
                    <span className="din text-[18px] leading-tight">{pl.cap}</span>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`shrink-0 transition-all duration-300 ${ativo ? "" : "-translate-x-1 opacity-40 group-hover:translate-x-0 group-hover:opacity-70"}`}
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                );
              })}

              <Cta posicao="planta" sobre={`saber mais sobre a planta ${planta.cap}.`} className="mt-6 w-full">
                Quero esta planta
              </Cta>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                <Link href="/tour-virtual" className="underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100">
                  Tour virtual
                </Link>
                <Link href="/download-folder-digital" className="underline underline-offset-4 opacity-80 transition-opacity hover:opacity-100">
                  Folder digital
                </Link>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 md:p-10">
              <div className="flex aspect-square items-center justify-center">
                {p.plantas.itens.map((pl, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={pl.img}
                    src={asset(pl.img)}
                    alt={`Planta ${pl.cap}`}
                    loading="lazy"
                    className={`max-h-full max-w-full object-contain transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      i === plantaAtiva ? "opacity-100" : "pointer-events-none absolute scale-[0.97] opacity-0"
                    }`}
                  />
                ))}
              </div>
              <p className="din mt-4 text-center text-[15px] text-ink-2">{planta.cap}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Obra: vídeo do arquiteto + galeria ───────────── */}
      <section className="py-24 md:py-32" style={{ background: COR.off }}>
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[1fr_1.15fr] md:gap-16">
            {/* Vídeo vertical emoldurado */}
            <div data-reveal className="mx-auto w-full max-w-[420px]">
              <div
                className="relative aspect-[9/16] overflow-hidden rounded-lg shadow-[0_24px_80px_-28px_rgba(18,71,95,.45)]"
                style={{ background: COR.navyFundo }}
              >
                <video
                  controls
                  playsInline
                  preload="none"
                  poster={asset("/a73d/obra-poster.webp")}
                  src={asset("/wp/Focal-Maio-2026-1.mp4")}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <p className="mt-4 text-center text-[13px] opacity-60">
                O arquiteto do projeto apresenta a obra · Maio/2026
              </p>
            </div>

            <div>
              <div data-reveal>
                <p className="kicker" style={{ color: COR.pinho }}>
                  A obra
                </p>
                <h2 className="din mt-4 text-[clamp(30px,4vw,50px)] leading-[1.08] tracking-[-0.015em]">
                  A obra, apresentada por quem a desenhou.
                </h2>
                <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.75] opacity-75">
                  No vídeo, o arquiteto do Artur 73 percorre a obra e mostra o que já está de pé.
                  Entrega prevista para setembro de 2026.
                </p>
              </div>

            </div>
          </div>

          {/* Galeria de fotos da obra */}
          <div className="mt-16">
            <p data-reveal className="kicker mb-6" style={{ color: COR.pinho }}>
              Fotos da obra · Maio/2026
            </p>
            <div className="snap-track gap-4">
              {p.obra.fotos.map((f) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={f}
                  src={asset(f)}
                  alt="Foto da obra do Artur 73"
                  loading="lazy"
                  className="h-[300px] w-auto rounded-md object-cover md:h-[380px]"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Investidor (família azul profunda) ───────────── */}
      <section className="py-24 md:py-32" style={{ background: COR.navy }}>
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[56ch]">
            <p className="kicker text-[#BCD7E6]">Para investir</p>
            <h2 className="din mt-4 text-[clamp(32px,4.6vw,60px)] leading-[1.05] tracking-[-0.015em] text-white">
              O ativo certo na esquina certa.
            </h2>
            <p className="din-book mt-6 text-[clamp(18px,2.2vw,24px)] leading-[1.35] text-[#BCD7E6]">
              Inteligência arquitetônica que se traduz em retorno.
            </p>
            <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.8] text-white/75">
              Studios NR de 52 m² com 2 dormitórios a partir de {comercial.precoNR}, pensados para
              locação de curta temporada no trecho mais disputado de Pinheiros. Valorização de{" "}
              {comercial.valorizacaoNR} — Pinheiros consolidado, demanda consistente.
            </p>
            <Cta posicao="investir" sobre="falar sobre investimento nos studios NR." className="mt-9">
              Falar sobre investimento
            </Cta>
          </div>
        </div>
      </section>

      {/* ───────────── Localização ───────────── */}
      <section className="py-24 md:py-32" style={{ background: COR.salvia, color: COR.pinho }}>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:px-10">
          <div data-reveal>
            <p className="kicker">Onde fica</p>
            <h2 className="din mt-4 text-[clamp(28px,3.6vw,46px)] leading-[1.08] tracking-[-0.015em]">
              R. Artur de Azevedo, 73 — esquina com a Oscar Freire
            </h2>
            <ul className="mt-8 space-y-4 text-[16px] leading-relaxed">
              {[
                "A 5 minutos do metrô Oscar Freire",
                "A 15 minutos da Paulista, caminhando",
                "Rua sem saída: tranquilidade preservada",
                "Vista permanente para o verde do bairro",
              ].map((li) => (
                <li key={li} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="mt-1 shrink-0" aria-hidden>
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  {li}
                </li>
              ))}
            </ul>
            <Cta posicao="localizacao" sobre="agendar uma visita ao decorado." className="mt-9">
              Agendar visita
            </Cta>
          </div>
          <div data-reveal className="overflow-hidden rounded-lg">
            <MapEmbed query={p.mapa} coord={p.mapaCoord} />
          </div>
        </div>
      </section>

      {/* ───────────── Conversão ───────────── */}
      <section id="form" className="py-24 md:py-32" style={{ background: COR.navyFundo }}>
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 md:grid-cols-[1fr_minmax(0,480px)] md:items-center md:px-10">
          <div data-reveal>
            <h2 className="din text-[clamp(32px,4.4vw,56px)] leading-[1.05] tracking-[-0.015em] text-white">
              Receba as plantas
              <br />e os valores
            </h2>
            <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.75] text-white/70">
              Deixe seu contato e o time da Focal envia tudo pelo WhatsApp, com as condições de
              pagamento atualizadas.
            </p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/[0.04] p-6 md:p-8">
            <FormRapido />
          </div>
        </div>
      </section>

      {/* ───────────── Rodapé ───────────── */}
      <footer className="px-5 py-12 md:px-10" style={{ background: COR.navyFundo }}>
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Logo tone="branco" className="h-6 w-auto" />
            <p className="din text-[13px] text-white/70">
              {site.endereco} | {site.telefone} | {site.email}
            </p>
          </div>
          {p.legal && (
            <p className="mt-10 max-w-[90ch] text-[11px] leading-[1.7] text-white/40">{p.legal}</p>
          )}
        </div>
      </footer>

      {/* ───────────── Barra fixa de conversão ───────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          ctaVisivel ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ background: "rgba(246,244,239,.94)", borderColor: "rgba(18,71,95,.15)" }}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-10">
          <div className="hidden md:block">
            <p className="din text-[16px] leading-tight">Artur 73 · Pinheiros</p>
            <p className="text-[13px] opacity-60">
              A partir de {comercial.precoResidencial} · chaves em 2026
            </p>
          </div>
          <div className="flex flex-1 gap-2 md:flex-none">
            <Cta posicao="sticky" sobre="receber as plantas e valores." className="flex-1 px-6 py-3.5 md:flex-none">
              WhatsApp
            </Cta>
            <a
              href="#form"
              className="cta flex flex-1 items-center justify-center rounded-md border px-6 py-3.5 transition-colors md:flex-none"
              style={{ borderColor: "rgba(18,71,95,.35)", color: COR.navy }}
            >
              Plantas e valores
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
