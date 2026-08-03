"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import MapEmbed from "./MapEmbed";
import PieStatus from "./PieStatus";
import Reveal from "./Reveal";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import { track } from "@/lib/track";
import { getProjeto } from "@/data/projetos";

// ── Dados comerciais da campanha ─────────────────────────────────────────
// ⚠️ CONFIRMAR com o time antes de escalar mídia: valores vêm dos materiais
// internos (abr/2026). Para ocultar qualquer um, basta comentar a linha.
const comercial = {
  precoResidencial: "R$ 2,054 mi",
  precoNR: "R$ 1,5 mi",
  valorizacaoNR: "~12% a.a. desde o lançamento (2023)",
};
// ─────────────────────────────────────────────────────────────────────────

const p = getProjeto("artur-73")!;

function waMsg(sobre: string) {
  return waLink(site.whatsapp, `Olá! Vi o Artur 73 no site e quero ${sobre}`);
}

function WaButton({
  posicao,
  sobre,
  children,
  grande = false,
  className = "",
}: {
  posicao: string;
  sobre: string;
  children: React.ReactNode;
  grande?: boolean;
  className?: string;
}) {
  return (
    <a
      href={waMsg(sobre)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("clique_whatsapp", { posicao })}
      className={`cta inline-flex items-center justify-center gap-3 rounded-md bg-verde text-white transition-[background-color,transform] duration-200 hover:bg-[#14805f] active:scale-[0.985] ${
        grande ? "px-8 py-4 text-[14px]" : "px-6 py-3.5"
      } ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
      </svg>
      {children}
    </a>
  );
}

const QUANDO = ["Neste mês", "Daqui 1 a 3 meses", "Acima de 3 meses"];

function ShortForm() {
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
          contexto: "Artur 73",
          origem: window.location.pathname,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      track("submit_form", { contexto: "Artur 73", canal: "api" });
      setEstado("ok");
    } catch {
      track("submit_form", { contexto: "Artur 73", canal: "whatsapp_fallback" });
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
      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
        <svg width="44" height="44" viewBox="0 0 52 52" aria-hidden>
          <circle cx="26" cy="26" r="24" fill="none" stroke="#189673" strokeWidth="2.5" opacity="0.4" />
          <path d="M15 27l8 8 15-17" fill="none" stroke="#189673" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="din mt-4 text-[22px] text-ink-2">
          {estado === "ok" ? "Recebemos seus dados!" : "Quase lá!"}
        </p>
        <p className="mt-2 text-[15px] text-black/70">
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
            className="cta mt-6 inline-flex items-center gap-2 rounded-md bg-verde px-8 py-3.5 text-white transition-opacity duration-200 hover:opacity-90"
          >
            Receber no WhatsApp
          </a>
        )}
      </div>
    );
  }

  const input =
    "w-full rounded-[4px] border border-black/15 bg-white px-4 py-3.5 text-[16px] text-black placeholder-black/55 outline-none transition-[border-color,box-shadow] duration-200 focus:border-verde focus:ring-2 focus:ring-verde/25";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input required name="nome" type="text" placeholder="Nome" autoComplete="name" className={input} />
      <input
        required
        name="telefone"
        type="tel"
        placeholder="WhatsApp (com DDD)"
        autoComplete="tel"
        inputMode="tel"
        className={input}
      />
      <div className="relative">
        <select name="quando" className={`${input} cursor-pointer appearance-none pr-10`} defaultValue={QUANDO[1]} aria-label="Quando pretende comprar">
          {QUANDO.map((q) => (
            <option key={q}>{q}</option>
          ))}
        </select>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/50" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      <button
        type="submit"
        disabled={estado === "enviando"}
        className="cta w-full rounded-md bg-ink px-8 py-4 text-white transition-[background-color,transform] duration-200 hover:bg-ink-2 active:scale-[0.985] disabled:opacity-60"
      >
        {estado === "enviando" ? "Enviando…" : "Receber plantas e valores"}
      </button>
      <p className="text-center text-[12px] text-black/50">
        Resposta rápida pelo WhatsApp. Seus dados ficam só com a Focal.
      </p>
    </form>
  );
}

function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);
  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: "Qual o valor dos apartamentos?",
      a: (
        <>
          Os residenciais (81 a 88m², 2 suítes) partem de {comercial.precoResidencial} e os studios
          NR de 52m² partem de {comercial.precoNR}. Valores e condições atualizados direto com o
          time no{" "}
          <a href={waMsg("saber os valores atualizados.")} target="_blank" rel="noopener noreferrer" onClick={() => track("clique_whatsapp", { posicao: "faq" })} className="font-semibold text-verde underline">
            WhatsApp
          </a>
          .
        </>
      ),
    },
    {
      q: "Quando o Artur 73 será entregue?",
      a: "A entrega está prevista para setembro de 2026. A obra está com 66% de avanço geral — fundação e estrutura 100% concluídas.",
    },
    {
      q: "Quais são as plantas disponíveis?",
      a: "Residenciais de 81m², 85m² e 88m² com 2 suítes, lavabo e living de pé-direito duplo (5,5 m), e studios NR de 52m² com 2 dormitórios, ideais para investimento.",
    },
    {
      q: "Posso financiar? Como funciona o pagamento?",
      a: (
        <>
          As condições de pagamento são personalizadas.{" "}
          <a href={waMsg("simular condições de pagamento.")} target="_blank" rel="noopener noreferrer" onClick={() => track("clique_whatsapp", { posicao: "faq" })} className="font-semibold text-verde underline">
            Fale com o time no WhatsApp
          </a>{" "}
          para simular a sua.
        </>
      ),
    },
    {
      q: "Tem tour virtual e material para baixar?",
      a: (
        <>
          Sim:{" "}
          <Link href="/tour-virtual" className="font-semibold text-verde underline">
            tour virtual
          </Link>{" "}
          e{" "}
          <Link href="/download-folder-digital" className="font-semibold text-verde underline">
            folder digital
          </Link>{" "}
          completos.
        </>
      ),
    },
  ];

  return (
    <div className="divide-y divide-black/10 border-y border-black/10">
      {faqs.map((f, i) => (
        <div key={f.q}>
          <button
            type="button"
            aria-expanded={aberta === i}
            onClick={() => setAberta(aberta === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-5 text-left"
          >
            <span className="din text-[17px] text-ink-2 md:text-[18px]">{f.q}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className={`shrink-0 text-verde transition-transform duration-300 ${aberta === i ? "rotate-45" : ""}`}
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ${aberta === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <p className="pb-5 pr-8 text-[15px] leading-[1.7] text-black/75">{f.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const porQue = [
  {
    img: "/wp/PISCINA-ROOFTOP-uai-1516x1011.jpg",
    titulo: "Pé-direito duplo de 5,5 m",
    texto: "Living amplo, arejado e com muita luz natural nos residenciais de 81 a 88m².",
  },
  {
    img: "/wp/FACHADA-scaled-1-uai-1790x1193.jpg",
    titulo: "Esquina Artur de Azevedo × Oscar Freire",
    texto: "Rua sem saída, na quadra do metrô, no melhor de Pinheiros — perto dos Jardins.",
  },
  {
    img: "/wp/VOO-PASSARO-uai-1599x1066.jpg",
    titulo: "Rooftop com piscina de 25 m",
    texto: "Academia no alto da torre, quadra de areia, sports bar e sala de mindfulness.",
  },
  {
    img: "/wp/1-Drone-SP.jpg",
    titulo: "Vista verde permanente",
    texto: "De frente para o complexo verde do Hospital das Clínicas e da Faculdade de Medicina da USP.",
  },
];

// LP de conversão do Artur 73 (variante B do teste A/B) — WhatsApp-first.
export default function ArturConversionLP() {
  return (
    <div className="lp-b bg-white pb-20 md:pb-0">
      {/* Topbar slim */}
      <header className="sticky top-0 z-40 bg-ink">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 md:px-8">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="branco" className="h-5 w-auto md:h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <a href={site.telefoneHref} className="hidden text-[14px] text-white/85 hover:text-white md:block">
              {site.telefone}
            </a>
            <WaButton posicao="topo" sobre="mais informações.">
              WhatsApp
            </WaButton>
          </div>
        </div>
      </header>

      {/* Hero de conversão */}
      <section className="relative overflow-hidden bg-ink-3">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${asset(p.heroImg)})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
          <div className="max-w-xl text-white">
            <p className="kicker text-white/80">Lançamento · Entrega Set/2026</p>
            <h1 className="din mt-3 text-[56px] leading-none md:text-[84px]">Artur 73</h1>
            <p className="din-book mt-5 text-[20px] leading-snug md:text-[26px]">
              Pé-direito duplo de 5,5 m na esquina da Artur de Azevedo com a Oscar Freire — na
              quadra do metrô, em Pinheiros.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {["52 a 88m²", "2 suítes + lavabo", "1 vaga c/ infra elétrica", "Rooftop c/ piscina de 25 m"].map(
                (c) => (
                  <li key={c} className="din rounded-md bg-white/12 px-3 py-1.5 text-[13px] backdrop-blur-sm md:text-[14px]">
                    {c}
                  </li>
                )
              )}
            </ul>
            <p className="mt-8 text-[15px] text-white/80">
              Residenciais a partir de{" "}
              <span className="din text-[26px] text-white md:text-[30px]">{comercial.precoResidencial}</span>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <WaButton posicao="hero" sobre="receber as plantas e valores." grande>
                Falar no WhatsApp agora
              </WaButton>
              <a
                href="#form"
                className="cta inline-flex items-center justify-center rounded-md border border-white/40 px-8 py-4 text-[14px] text-white transition-colors duration-200 hover:bg-white hover:text-ink"
              >
                Receber plantas e valores
              </a>
            </div>
            <p className="mt-4 text-[13px] text-white/70">
              Atendimento imediato pelo WhatsApp em horário comercial.
            </p>
          </div>
        </div>
      </section>

      {/* Prova institucional */}
      <section className="border-b border-black/10 bg-off">
        <div className="mx-auto grid max-w-[1200px] grid-cols-3 gap-4 px-5 py-6 text-center md:px-8">
          {[
            ["500MM", "vendidos"],
            ["1.300+", "unidades entregues"],
            ["2016", "incorporadora desde"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="din text-[24px] text-ink-2 [font-variant-numeric:tabular-nums] md:text-[32px]">{n}</p>
              <p className="din text-[11px] uppercase tracking-[0.14em] text-black/55 md:text-[12px]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por que o Artur 73 */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="din h-sub text-ink-2">Por que o Artur 73</h2>
        </Reveal>
        <Reveal group className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {porQue.map((d) => (
            <div key={d.titulo} className="overflow-hidden rounded-lg bg-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(d.img)} alt={d.titulo} loading="lazy" className="h-44 w-full object-cover" />
              <div className="p-5">
                <h3 className="din text-[17px] leading-snug text-ink-2">{d.titulo}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-black/70">{d.texto}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Plantas com CTA por tipologia */}
      <section className="bg-light py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <Reveal>
            <h2 className="din h-sub text-ink-2">Escolha a sua planta</h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-relaxed text-black/75">
              Residenciais de 81 a 88m² com 2 suítes e pé-direito duplo, e studios NR de 52m² para
              morar ou investir.
            </p>
          </Reveal>
          <Reveal group className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {p.plantas.itens.map((pl) => (
              <div key={pl.img} className="flex flex-col rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.06),0_16px_40px_-16px_rgba(0,0,0,.28)]">
                <div className="flex aspect-square items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset(pl.img)} alt={`Planta ${pl.cap}`} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <p className="din mt-3 text-center text-[15px] text-ink-2">{pl.cap}</p>
                <a
                  href={waMsg(`saber mais sobre a planta ${pl.cap}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("clique_whatsapp", { posicao: "planta", tipologia: pl.cap })}
                  className="cta mt-4 rounded-md bg-verde py-3 text-center text-white transition-colors duration-200 hover:bg-[#14805f]"
                >
                  Quero esta planta
                </a>
              </div>
            ))}
          </Reveal>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-[14px]">
            <Link href="/tour-virtual" className="font-semibold text-ink-2 underline underline-offset-4 hover:text-verde">
              Ver tour virtual
            </Link>
            <Link href="/download-folder-digital" className="font-semibold text-ink-2 underline underline-offset-4 hover:text-verde">
              Baixar folder digital
            </Link>
          </div>
        </div>
      </section>

      {/* Status da obra — transparência */}
      <section className="mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="din h-sub text-ink-2">Obra em ritmo: entrega em setembro de 2026</h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {p.status.map((s, i) => (
            <PieStatus key={s.label} label={s.label} valor={s.valor} delay={i * 150} />
          ))}
        </div>
      </section>

      {/* Localização */}
      <section className="bg-light py-16 md:py-24">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-10 px-5 md:grid-cols-[1fr_1.2fr] md:px-8">
          <Reveal>
            <h2 className="din h-sub text-ink-2">R. Artur de Azevedo, 73 — Pinheiros</h2>
            <ul className="mt-7 space-y-4 text-[16px] leading-relaxed text-black/80">
              {[
                "Esquina com a Oscar Freire, em rua sem saída",
                "Na quadra do metrô — eixo Rebouças / Eusébio Matoso",
                "Vista permanente para o verde do HC e da Faculdade de Medicina da USP",
                "Arquitetura JBA — Jonas Birger Arquitetura · interiores Melina Romano",
              ].map((li) => (
                <li key={li} className="flex gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#189673" strokeWidth="2.4" className="mt-1 shrink-0" aria-hidden>
                    <path d="m4 12.5 5 5L20 6.5" />
                  </svg>
                  {li}
                </li>
              ))}
            </ul>
            <WaButton posicao="localizacao" sobre="agendar uma visita ao decorado." grande className="mt-8">
              Agendar visita
            </WaButton>
          </Reveal>
          <MapEmbed query={p.mapa} />
        </div>
      </section>

      {/* Investimento NR */}
      <section className="bg-ink py-16 md:py-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <div className="max-w-2xl">
            <p className="kicker text-white/70">Para investir</p>
            <h2 className="din h-sub mt-3 text-white">
              Studios NR de 52m² a partir de {comercial.precoNR}
            </h2>
            <p className="mt-5 text-[16px] leading-[1.8] text-white/85">
              Unidades não residenciais com 2 dormitórios, pensadas para locação de curta
              temporada na região mais disputada de Pinheiros. Valorização de{" "}
              {comercial.valorizacaoNR}.
            </p>
            <WaButton posicao="investir" sobre="falar sobre investimento nos studios NR." grande className="mt-8">
              Falar sobre investimento
            </WaButton>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[860px] px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="din h-sub text-ink-2">Perguntas frequentes</h2>
        </Reveal>
        <div className="mt-8">
          <Faq />
        </div>
      </section>

      {/* Formulário curto */}
      <section id="form" className="bg-light py-16 md:py-24">
        <div className="mx-auto max-w-[560px] px-5 md:px-0">
          <Reveal>
            <h2 className="din h-sub text-center text-ink-2">Receba as plantas e valores</h2>
            <p className="mt-3 text-center text-[15px] text-black/70">
              Deixe seu contato e o time da Focal envia tudo pelo WhatsApp.
            </p>
          </Reveal>
          <div className="mt-8 rounded-lg bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.06),0_16px_40px_-16px_rgba(0,0,0,.28)] md:p-8">
            <ShortForm />
          </div>
        </div>
      </section>

      {/* Legal + rodapé compacto */}
      <footer className="bg-ink px-5 py-10 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <Logo tone="branco" className="h-6 w-auto" />
            <p className="din text-[13px] text-white/85">
              {site.endereco} | {site.telefone} | {site.email}
            </p>
          </div>
          {p.legal && (
            <p className="mt-8 max-w-[90ch] text-[11px] leading-[1.7] text-white/55">{p.legal}</p>
          )}
        </div>
      </footer>

      {/* Barra sticky mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-black/10 bg-white p-3 md:hidden">
        <WaButton posicao="sticky" sobre="receber as plantas e valores." className="flex-1">
          WhatsApp
        </WaButton>
        <a
          href="#form"
          className="cta flex flex-1 items-center justify-center rounded-md bg-ink px-4 py-3.5 text-white"
        >
          Plantas e valores
        </a>
      </div>
    </div>
  );
}
