"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import MapEmbed from "./MapEmbed";
import EscalaAltura from "./lpc/EscalaAltura";
import ParticleField from "./lpc/ParticleField";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import { track } from "@/lib/track";
import { getProjeto } from "@/data/projetos";

// ── Dados comerciais da campanha ─────────────────────────────────────────
// ⚠️ Mesmos valores da variante B (materiais internos, abr/2026). Confirmar
// com o time antes de escalar mídia.
const comercial = {
  precoResidencial: "R$ 2,054 mi",
  precoNR: "R$ 1,5 mi",
  valorizacaoNR: "~12% a.a. desde o lançamento (2023)",
};
// ─────────────────────────────────────────────────────────────────────────

const p = getProjeto("artur-73")!;
const PE_DIREITO = 5.5;
// Coordenadas do diagrama em lpc/EscalaAltura.tsx — o scroll anima o volume
// entre o piso e a altura final.
const ESCALA_PISO = 440;
const ESCALA_ALTURA = 320;

function waMsg(sobre: string) {
  return waLink(site.whatsapp, `Olá! Vi o Artur 73 no site e quero ${sobre}`);
}

/* ─────────────────────────────  CTA  ───────────────────────────── */

function Cta({
  posicao,
  sobre,
  children,
  variante = "solido",
  className = "",
}: {
  posicao: string;
  sobre: string;
  children: React.ReactNode;
  variante?: "solido" | "linha";
  className?: string;
}) {
  const base =
    "cta group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-md px-8 py-4 transition-transform duration-200 active:scale-[0.985]";
  const skin =
    variante === "solido"
      ? "bg-verde text-white"
      : "border border-white/30 text-white hover:border-white/70";
  return (
    <a
      href={waMsg(sobre)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("clique_whatsapp", { posicao })}
      className={`${base} ${skin} ${className}`}
    >
      {/* Brilho que varre o botão no hover */}
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

/* ────────────────────────  Formulário curto  ──────────────────────── */

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
          contexto: "Artur 73 — LP C",
          origem: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("submit_form", { contexto: "Artur 73 — LP C", canal: "api" });
      setEstado("ok");
    } catch {
      track("submit_form", { contexto: "Artur 73 — LP C", canal: "whatsapp_fallback" });
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

const diferenciais = [
  {
    n: "01",
    img: "/wp/FACHADA-scaled-1-uai-1790x1193.jpg",
    titulo: "A esquina",
    texto:
      "Artur de Azevedo com Oscar Freire, em rua sem saída e na quadra do metrô. O endereço faz metade do trabalho.",
  },
  {
    n: "02",
    img: "/wp/1-Drone-SP.jpg",
    titulo: "A vista que não fecha",
    texto:
      "De frente para o verde do complexo do Hospital das Clínicas e da Faculdade de Medicina da USP — área que não será construída.",
  },
  {
    n: "03",
    img: "/wp/PISCINA-ROOFTOP-uai-1516x1011.jpg",
    titulo: "O rooftop",
    texto:
      "Piscina de 25 metros no alto da torre, academia, quadra de areia, sports bar e sala de mindfulness.",
  },
  {
    n: "04",
    img: "/wp/VOO-PASSARO-uai-1599x1066.jpg",
    titulo: "O projeto",
    texto:
      "Arquitetura JBA — Jonas Birger. Interiores de Melina Romano. Paisagismo do Núcleo Arquitetura.",
  },
];

/* ───────────────────────────  Página  ─────────────────────────── */

export default function ArturLpC() {
  const raiz = useRef<HTMLDivElement>(null);
  const [plantaAtiva, setPlantaAtiva] = useState(0);
  const [ctaVisivel, setCtaVisivel] = useState(false);

  // Barra de CTA aparece depois que o hero sai da tela.
  useEffect(() => {
    const hero = raiz.current?.querySelector("[data-hero]");
    if (!hero) return;
    const io = new IntersectionObserver(([e]) => setCtaVisivel(!e.isIntersecting), {
      threshold: 0,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = raiz.current;
    if (!el) return;

    let ctx: { revert: () => void } | undefined;
    let cancelado = false;

    // GSAP entra por import dinâmico: mantém o bundle inicial leve e garante
    // que nada disso roda no servidor.
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduzido) return;

      ctx = gsap.context(() => {
        const desktop = window.matchMedia("(min-width: 768px)").matches;

        /* Hero — entrada coreografada */
        const linhas = gsap.utils.toArray<HTMLElement>("[data-hero-linha]");
        gsap.set(linhas, { yPercent: 115 });
        gsap.set("[data-hero-fade]", { opacity: 0, y: 18 });

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(linhas, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.15)
          .to("[data-hero-fade]", { opacity: 1, y: 0, duration: 0.8, stagger: 0.09 }, 0.5)
          .fromTo(
            "[data-hero-bg]",
            { scale: 1.12 },
            { scale: 1, duration: 2.2, ease: "power2.out" },
            0
          );

        /* Hero — parallax na saída */
        gsap.to("[data-hero-bg]", {
          yPercent: 14,
          ease: "none",
          scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
        });

        /* Régua de altura à esquerda — preenche com o scroll da página */
        gsap.to("[data-regua-fill]", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.4 },
        });

        /* Cena assinatura — a altura */
        const cena = el.querySelector<HTMLElement>("[data-altura]");
        const escala = el.querySelector<HTMLElement>("[data-escala]");
        if (cena && escala) {
          // O gatilho é o próprio diagrama, não a seção: no empilhamento
          // mobile a seção é alta demais e a animação terminaria depois de o
          // desenho já ter saído da tela.
          // Termina em "center 60%": o desenho completa enquanto está inteiro
          // na tela. Amarrar ao fim do elemento faria a cota chegar aos 5,50
          // já com o topo do volume acima da dobra — a recompensa da cena
          // aconteceria fora do enquadramento.
          const st = {
            trigger: escala,
            start: "top 90%",
            end: "center 60%",
            scrub: 0.6,
          };

          // O volume do Artur 73 cresce do piso para cima…
          gsap.fromTo(
            "[data-escala-volume]",
            { attr: { y: ESCALA_PISO, height: 0 } },
            {
              attr: { y: ESCALA_PISO - ESCALA_ALTURA, height: ESCALA_ALTURA },
              ease: "none",
              scrollTrigger: st,
            }
          );

          // …e a linha de teto com a cota sobe junto com ele.
          gsap.fromTo(
            "[data-escala-teto]",
            { y: ESCALA_ALTURA },
            { y: 0, ease: "none", scrollTrigger: st }
          );

          // O número acompanha, contando até 5,50.
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

          gsap.from("[data-altura-texto] > *", {
            opacity: 0,
            y: 24,
            duration: 0.9,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: { trigger: cena, start: "top 65%" },
          });
        }

        /* Diferenciais — trilho horizontal preso no desktop */
        const trilho = el.querySelector<HTMLElement>("[data-trilho]");
        const pista = el.querySelector<HTMLElement>("[data-pista]");
        if (desktop && trilho && pista) {
          const distancia = () => pista.scrollWidth - window.innerWidth + 96;
          gsap.to(pista, {
            x: () => -distancia(),
            ease: "none",
            scrollTrigger: {
              trigger: trilho,
              start: "top top",
              end: () => `+=${distancia()}`,
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });
        }

        /* Obra — barras de avanço */
        gsap.utils.toArray<HTMLElement>("[data-barra]").forEach((barra) => {
          const pct = Number(barra.dataset.barra || 0);
          gsap.fromTo(
            barra,
            { scaleX: 0 },
            {
              scaleX: pct / 100,
              duration: 1.3,
              ease: "expo.out",
              scrollTrigger: { trigger: barra, start: "top 88%" },
            }
          );
        });

        /* Revelações genéricas */
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((alvo) => {
          gsap.from(alvo, {
            opacity: 0,
            y: 30,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: alvo, start: "top 86%" },
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
    <div ref={raiz} className="lp-b relative bg-[#0C100F] text-white">
      {/* Régua de altura — fio condutor visual da página */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-5 top-0 z-30 hidden h-full w-px bg-white/10 lg:block"
      >
        <div
          data-regua-fill
          className="h-full w-full origin-top scale-y-0 bg-verde"
        />
      </div>

      {/* ───────────────── Hero ───────────────── */}
      <section data-hero className="relative min-h-[100svh] overflow-hidden">
        <div
          data-hero-bg
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${asset(p.heroImg)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C100F]/85 via-[#0C100F]/45 to-[#0C100F]" />
        <ParticleField />

        <header className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between px-5 py-6 md:px-10">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="branco" className="h-5 w-auto md:h-6" />
          </Link>
          <a
            href={site.telefoneHref}
            className="hidden text-[14px] text-white/75 transition-colors hover:text-white md:block"
          >
            {site.telefone}
          </a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-92px)] max-w-[1240px] flex-col justify-center px-5 pb-24 md:px-10">
          <p data-hero-fade className="kicker text-verde">
            Pinheiros · Entrega set/2026
          </p>

          <h1 className="din mt-5 text-[clamp(60px,12vw,168px)] leading-[0.86] tracking-[-0.02em]">
            <span className="block overflow-hidden">
              <span data-hero-linha className="block">Artur</span>
            </span>
            <span className="block overflow-hidden">
              <span data-hero-linha className="block text-verde">73</span>
            </span>
          </h1>

          <p
            data-hero-fade
            className="din-book mt-7 max-w-[26ch] text-[clamp(20px,2.6vw,30px)] leading-[1.2] text-white/90"
          >
            Cinco metros e meio entre o seu chão e o seu teto.
          </p>

          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3">
            {["52 a 88m²", "2 suítes + lavabo", "Rooftop com piscina de 25 m"].map((c) => (
              <span key={c} className="din text-[13px] uppercase tracking-[0.14em] text-white/60">
                {c}
              </span>
            ))}
          </div>

          <div data-hero-fade className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Cta posicao="hero" sobre="receber as plantas e valores.">
              Falar no WhatsApp
            </Cta>
            <a
              href="#plantas"
              className="cta inline-flex items-center justify-center rounded-md border border-white/25 px-8 py-4 text-white transition-colors duration-200 hover:border-white/70"
            >
              Ver as plantas
            </a>
          </div>

          <p data-hero-fade className="mt-6 text-[14px] text-white/55">
            Residenciais a partir de{" "}
            <span className="din text-[22px] text-white">{comercial.precoResidencial}</span>
          </p>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-8 z-10 flex justify-center motion-reduce:hidden"
        >
          <span className="animate-bounce-slow text-white/40">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </span>
        </div>
      </section>

      {/* ─────────── Cena assinatura: a altura ─────────── */}
      <section data-altura className="relative border-t border-white/10 py-24 md:py-36">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-8 px-5 md:grid-cols-[1fr_1.05fr] md:gap-14 md:px-10">
          <div data-altura-texto>
            <p className="kicker text-verde">O diferencial</p>
            <h2 className="din mt-4 text-[clamp(34px,4.6vw,62px)] leading-[1.04] tracking-[-0.015em]">
              Pé-direito duplo
              <br />
              de 5,5 metros
            </h2>
            <p className="mt-7 max-w-[46ch] text-[17px] leading-[1.75] text-white/70">
              A maioria dos apartamentos de São Paulo entrega 2,7 m entre o chão e o teto. O living
              do Artur 73 entrega o dobro — e é isso que muda a sensação de estar dentro dele: mais
              luz natural, mais ar, e uma parede inteira de vidro que a altura torna possível.
            </p>
            <ul className="mt-9 space-y-3">
              {[
                ["2,70 m", "Apartamento convencional"],
                ["5,50 m", "Living do Artur 73"],
              ].map(([v, l], i) => (
                <li key={l} className="flex items-baseline gap-4">
                  <span
                    className={`din text-[30px] [font-variant-numeric:tabular-nums] ${
                      i === 1 ? "text-verde" : "text-white/35"
                    }`}
                  >
                    {v}
                  </span>
                  <span className={`text-[14px] ${i === 1 ? "text-white/80" : "text-white/40"}`}>
                    {l}
                  </span>
                </li>
              ))}
            </ul>
            <Cta posicao="altura" sobre="conhecer o living de pé-direito duplo." className="mt-10">
              Quero conhecer
            </Cta>
          </div>

          {/* Diagrama de escala — desenhado, não fotografado (ver EscalaAltura) */}
          <div data-escala className="mx-auto w-full max-w-[420px] md:max-w-[460px]">
            <EscalaAltura />
          </div>
        </div>
      </section>

      {/* ─────────── Diferenciais em trilho horizontal ─────────── */}
      <section data-trilho className="relative overflow-hidden border-t border-white/10 py-20 md:min-h-[100svh] md:py-0">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10 md:pt-24">
          <p className="kicker text-verde">Por que o Artur 73</p>
        </div>

        <div className="mt-10 md:flex md:min-h-[62svh] md:items-center">
          <div
            data-pista
            className="snap-track gap-5 px-5 md:flex md:gap-8 md:overflow-visible md:px-10"
          >
            {diferenciais.map((d) => (
              <article
                key={d.n}
                className="w-[78vw] max-w-[420px] shrink-0 md:w-[38vw] md:max-w-[520px]"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(d.img)}
                    alt={d.titulo}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
                  />
                  <span className="din absolute left-4 top-4 text-[13px] tracking-[0.2em] text-white/70">
                    {d.n}
                  </span>
                </div>
                <h3 className="din mt-6 text-[26px] leading-tight md:text-[32px]">{d.titulo}</h3>
                <p className="mt-3 max-w-[42ch] text-[15px] leading-[1.7] text-white/65">{d.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Plantas interativas ─────────── */}
      <section id="plantas" className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal>
            <p className="kicker text-verde">Plantas</p>
            <h2 className="din mt-4 text-[clamp(32px,4.2vw,56px)] leading-[1.06] tracking-[-0.015em]">
              Escolha a sua
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1fr)_1.15fr] md:gap-16">
            {/* Seletor */}
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
                    className={`group relative flex items-center justify-between gap-4 rounded-md border px-5 py-5 text-left transition-colors duration-300 ${
                      ativo
                        ? "border-verde bg-verde/10"
                        : "border-white/12 hover:border-white/35"
                    }`}
                  >
                    <span>
                      <span
                        className={`din block text-[19px] leading-tight transition-colors ${
                          ativo ? "text-white" : "text-white/70"
                        }`}
                      >
                        {pl.cap}
                      </span>
                    </span>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      className={`shrink-0 transition-all duration-300 ${
                        ativo ? "text-verde" : "-translate-x-1 text-white/25 group-hover:translate-x-0 group-hover:text-white/50"
                      }`}
                      aria-hidden
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                );
              })}

              <Cta
                posicao="planta"
                sobre={`saber mais sobre a planta ${planta.cap}.`}
                className="mt-6 w-full"
              >
                Quero esta planta
              </Cta>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
                <Link href="/tour-virtual" className="text-white/60 underline underline-offset-4 transition-colors hover:text-verde">
                  Tour virtual
                </Link>
                <Link href="/download-folder-digital" className="text-white/60 underline underline-offset-4 transition-colors hover:text-verde">
                  Folder digital
                </Link>
              </div>
            </div>

            {/* Prancha */}
            <div className="relative overflow-hidden rounded-lg bg-white p-6 md:p-10">
              <div className="flex aspect-square items-center justify-center">
                {p.plantas.itens.map((pl, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={pl.img}
                    src={asset(pl.img)}
                    alt={`Planta ${pl.cap}`}
                    loading="lazy"
                    className={`max-h-full max-w-full object-contain transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      i === plantaAtiva
                        ? "opacity-100"
                        : "pointer-events-none absolute scale-[0.97] opacity-0"
                    }`}
                  />
                ))}
              </div>
              <p className="din mt-4 text-center text-[15px] text-ink-2">{planta.cap}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Obra ─────────── */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[46ch]">
            <p className="kicker text-verde">A obra</p>
            <h2 className="din mt-4 text-[clamp(32px,4.2vw,56px)] leading-[1.06] tracking-[-0.015em]">
              Fundação e estrutura, 100% concluídas
            </h2>
            <p className="mt-6 text-[16px] leading-[1.75] text-white/65">
              Entrega prevista para setembro de 2026. Acompanhe o avanço real de cada etapa.
            </p>
          </div>

          <div className="mt-14 space-y-7">
            {p.status.map((s) => (
              <div key={s.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="din text-[16px] text-white/80 md:text-[18px]">{s.label}</span>
                  <span className="din text-[22px] text-verde [font-variant-numeric:tabular-nums] md:text-[26px]">
                    {s.valor}%
                  </span>
                </div>
                <div className="mt-3 h-px w-full bg-white/12">
                  <div data-barra={s.valor} className="h-full origin-left bg-verde" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Localização ─────────── */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 md:grid-cols-[1fr_1.2fr] md:px-10">
          <div data-reveal>
            <p className="kicker text-verde">Onde fica</p>
            <h2 className="din mt-4 text-[clamp(30px,3.6vw,48px)] leading-[1.08] tracking-[-0.015em]">
              R. Artur de Azevedo, 73
            </h2>
            <ul className="mt-8 space-y-4 text-[16px] leading-relaxed text-white/70">
              {[
                "Esquina com a Oscar Freire, em rua sem saída",
                "Na quadra do metrô — eixo Rebouças / Eusébio Matoso",
                "Vista permanente para o verde do HC e da Faculdade de Medicina da USP",
                "A pé do melhor de Pinheiros e dos Jardins",
              ].map((li) => (
                <li key={li} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#189673" strokeWidth="2.4" className="mt-1 shrink-0" aria-hidden>
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
            <MapEmbed query={p.mapa} />
          </div>
        </div>
      </section>

      {/* ─────────── Investimento NR ─────────── */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div data-reveal className="max-w-[56ch]">
            <p className="kicker text-verde">Para investir</p>
            <h2 className="din mt-4 text-[clamp(30px,3.6vw,48px)] leading-[1.08] tracking-[-0.015em]">
              Studios NR de 52m² a partir de {comercial.precoNR}
            </h2>
            <p className="mt-6 text-[16px] leading-[1.8] text-white/70">
              Unidades não residenciais com 2 dormitórios, pensadas para locação de curta temporada
              na região mais disputada de Pinheiros. Valorização de {comercial.valorizacaoNR}.
            </p>
            <Cta posicao="investir" sobre="falar sobre investimento nos studios NR." className="mt-9">
              Falar sobre investimento
            </Cta>
          </div>
        </div>
      </section>

      {/* ─────────── Conversão ─────────── */}
      <section id="form" className="relative overflow-hidden border-t border-white/10 py-24 md:py-32">
        <ParticleField density={30} />
        <div className="relative z-10 mx-auto grid max-w-[1240px] grid-cols-1 gap-12 px-5 md:grid-cols-[1fr_minmax(0,480px)] md:items-center md:px-10">
          <div data-reveal>
            <h2 className="din text-[clamp(34px,4.6vw,60px)] leading-[1.04] tracking-[-0.015em]">
              Receba as plantas
              <br />
              e os valores
            </h2>
            <p className="mt-6 max-w-[44ch] text-[16px] leading-[1.75] text-white/65">
              Deixe seu contato e o time da Focal envia tudo pelo WhatsApp, com as condições de
              pagamento atualizadas.
            </p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
            <FormRapido />
          </div>
        </div>
      </section>

      {/* ─────────── Rodapé ─────────── */}
      <footer className="border-t border-white/10 px-5 py-12 md:px-10">
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

      {/* ─────────── Barra fixa de conversão ─────────── */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0C100F]/95 backdrop-blur-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          ctaVisivel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-3 md:px-10">
          <div className="hidden md:block">
            <p className="din text-[16px] leading-tight">Artur 73 · Pinheiros</p>
            <p className="text-[13px] text-white/55">
              A partir de {comercial.precoResidencial} · entrega set/2026
            </p>
          </div>
          <div className="flex flex-1 gap-2 md:flex-none">
            <Cta posicao="sticky" sobre="receber as plantas e valores." className="flex-1 px-6 py-3.5 md:flex-none">
              WhatsApp
            </Cta>
            <a
              href="#form"
              className="cta flex flex-1 items-center justify-center rounded-md border border-white/25 px-6 py-3.5 text-white transition-colors hover:border-white/70 md:flex-none"
            >
              Plantas e valores
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
