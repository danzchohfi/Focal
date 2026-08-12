"use client";

import { useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";
import DestaqueIcon from "./DestaqueIcon";
import LeadForm from "./LeadForm";
import Lightbox, { type LightboxItem } from "./Lightbox";
import LpHeader from "./LpHeader";
import MapEmbed from "./MapEmbed";
import ObraCarousel from "./ObraCarousel";
import PieStatus from "./PieStatus";
import Reveal from "./Reveal";
import SiteFooter from "./SiteFooter";
import VideoSection from "./VideoSection";
import WaCta from "./WaCta";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import type { Projeto } from "@/data/projetos";

const SPEC_ICONS = ["ruler", "bed", "height", "car"];

function SpecIcons({ specs }: { specs: string[] }) {
  return (
    <Reveal group className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
      {specs.map((s, i) => (
        <div key={s} className="flex flex-col items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center md:h-14 md:w-14">
            <DestaqueIcon nome={SPEC_ICONS[i % SPEC_ICONS.length]} size={44} />
          </span>
          <span className="din text-[17px] leading-snug md:text-[19px]">{s}</span>
        </div>
      ))}
    </Reveal>
  );
}

function ExternalArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-y-0.5" aria-hidden>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

// Template das páginas de empreendimento — réplica da LP do site atual.
// Como no original (iLightBox), as imagens internas e as plantas abrem em
// modal; a galeria "Conheça o..." cuida do próprio lightbox (vídeo incluso).
export default function ProjectPageTemplate({ projeto: p }: { projeto: Projeto }) {
  const [lightbox, setLightbox] = useState<{ items: LightboxItem[]; index: number } | null>(null);

  const stripItems: LightboxItem[] = p.strip.map((f, i) => ({
    src: f,
    alt: `${p.nome} — imagem ${i + 1}`,
  }));
  const plantaItems: LightboxItem[] = p.plantas.itens.map((pl) => ({
    src: pl.img,
    cap: pl.cap,
    alt: `${p.nome} — planta ${pl.cap}`,
  }));

  return (
    <>
      <LpHeader contexto={p.nome} />
      <main>
        {/* Hero com formulário */}
        <section className="relative overflow-hidden bg-ink-3">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${asset(p.heroImg)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/35" />
          <div className="relative mx-auto grid min-h-[calc(100svh-64px)] max-w-[1400px] grid-cols-1 gap-10 px-6 py-14 md:grid-cols-[1fr_380px] md:px-10 lg:gap-16">
            <div className="flex flex-col justify-center text-white">
              <Reveal>
                <h1 className="kicker text-white/80">{p.statusLabel}</h1>
                <h2 className={`din ${p.slug === "artur-73" ? "h-hero-lp" : "h-hero"} mt-3`}>
                  {p.heroTitulo}
                </h2>
                <h3 className="din-book mt-16 max-w-2xl text-[22px] leading-snug md:mt-24 md:text-[28px] lg:text-[32px]">
                  {p.heroSub}
                </h3>
              </Reveal>
            </div>
            <Reveal delay={150} className="self-center">
              <div id="atendimento" className="rounded-lg bg-verde p-6 shadow-[0_4px_12px_rgba(0,0,0,.12),0_16px_48px_-12px_rgba(0,0,0,.24)] md:p-7">
                <h2 className="din h-card mb-5 text-white">Atendimento</h2>
                <LeadForm variant={p.formVariant} tone="verde" contexto={p.nome} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Faixa de fotos */}
        <section className="bg-light py-14 md:py-16">
          <div className="mx-auto max-w-[1400px] px-4">
            <Carousel itemClassName="w-[88%] p-2 sm:w-[55%] md:w-[44%]">
              {p.strip.map((f, i) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setLightbox({ items: stripItems, index: i })}
                  aria-label={`Ampliar imagem ${i + 1} — ${p.nome}`}
                  className="block h-[300px] w-full cursor-zoom-in overflow-hidden rounded-lg md:h-[420px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(f)}
                    alt={`${p.nome} — imagem ${i + 1}`}
                    loading={i > 1 ? "lazy" : undefined}
                    className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
                  />
                </button>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Intro + Detalhes + Status */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-[1.2fr_1fr_0.8fr] md:px-10">
            <Reveal>
              <h3 className="din h-card text-ink-2">{p.intro.titulo}</h3>
              <p className="mt-7 max-w-[60ch] text-[17px] leading-[1.8] text-ink-2">
                {p.intro.texto}
              </p>
              <SpecIcons specs={p.intro.specs} />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="din h-sub text-ink-2">Detalhes</h2>
              <Reveal group as="div" className="mt-9 space-y-6">
                {(
                  [
                    ["Localização", p.detalhes.localizacao],
                    ["Arquitetura", p.detalhes.arquitetura],
                    ["Interiores", p.detalhes.interiores],
                    ["Paisagismo", p.detalhes.paisagismo],
                    [p.detalhes.entregaLabel, p.detalhes.entrega],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <h4 className="din text-[16px] text-ink-2 md:text-[17px]">{k}</h4>
                    <p className="mt-1 text-[15px] text-ink-2/90">{v}</p>
                  </div>
                ))}
              </Reveal>
            </Reveal>
            <Reveal delay={200}>
              <h2 className="din h-sub text-ink-2">Status</h2>
              <div className="mt-9 grid grid-cols-2 gap-8 md:grid-cols-1">
                {p.status.map((s, i) => (
                  <PieStatus key={s.label} label={s.label} valor={s.valor} delay={i * 150} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Assista o vídeo */}
        {p.video && <VideoSection youtube={p.video.youtube} mp4={p.video.mp4} />}

        {/* Destaque de área/entorno com formulário */}
        <section className="bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-16 md:px-14 md:py-20">
              <Reveal>
                <h2 className="din h-section text-ink-2">{p.destaqueArea.titulo}</h2>
                <p className="mt-7 max-w-[60ch] text-[17px] leading-[1.8] text-ink-2">
                  {p.destaqueArea.texto}
                </p>
                <LeadForm variant={p.formVariant} tone="claro" contexto={p.nome} className="mt-9 max-w-md" />
              </Reveal>
            </div>
            <div
              className="min-h-[360px] bg-cover bg-center lg:min-h-full"
              style={{ backgroundImage: `url(${asset(p.destaqueArea.img)})` }}
              role="img"
              aria-label={`${p.nome} — entorno`}
            />
          </div>
        </section>

        {/* Plantas */}
        <section className="bg-light py-24 md:py-32">
          <div className="mx-auto max-w-[1300px] px-6">
            <Reveal className="text-center">
              <h3 className="din h-section text-ink-2">{p.plantas.titulo}</h3>
              <p className="mt-5 text-[17px] text-ink-2 md:text-[18px]">{p.plantas.texto}</p>
            </Reveal>
            <div className="mt-16">
              <Carousel itemClassName="w-[88%] p-3 sm:w-[50%] md:w-[33.33%]">
                {p.plantas.itens.map((pl, i) => (
                  <figure key={pl.img} className="flex h-full flex-col">
                    <button
                      type="button"
                      onClick={() => setLightbox({ items: plantaItems, index: i })}
                      aria-label={`Ampliar planta ${pl.cap}`}
                      className="flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,.06),0_16px_40px_-16px_rgba(0,0,0,.28)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset(pl.img)}
                        alt={`${p.nome} — planta ${pl.cap}`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </button>
                    <figcaption className="mt-4 text-center text-[15px] text-ink-2">{pl.cap}</figcaption>
                  </figure>
                ))}
              </Carousel>
            </div>
            {(p.tourUrl || p.folderUrl) && (
              <div className="mt-14 flex flex-wrap justify-center gap-4">
                {p.tourUrl && (
                  <Link
                    href={p.tourUrl}
                    target={p.tourUrl.startsWith("http") ? "_blank" : undefined}
                    className="cta group flex items-center gap-3 rounded-[4px] bg-ink-2 px-8 py-4 text-white transition-colors duration-300 hover:bg-verde"
                  >
                    <ExternalArrow /> Tour Virtual
                  </Link>
                )}
                {p.folderUrl && (
                  <a
                    href={p.folderUrl.startsWith("/wp/") ? asset(p.folderUrl) : p.folderUrl}
                    target={p.folderUrl.startsWith("/wp/") ? "_blank" : undefined}
                    className="cta group flex items-center gap-3 rounded-[4px] bg-ink-2 px-8 py-4 text-white transition-colors duration-300 hover:bg-verde"
                  >
                    <DownloadIcon /> Download do Folder Digital
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Conheça o empreendimento (galeria escura) */}
        <section className="bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6">
            <Reveal className="text-center">
              <h3 className="din h-card text-white">{p.obra.titulo}</h3>
              <p className="mt-4 text-[17px] text-white/85 md:text-[18px]">
                Entre em contato caso deseje mais informações.
              </p>
            </Reveal>
            <div className="mt-16">
              <ObraCarousel
                fotos={p.obra.fotos}
                video={p.obra.video}
                legenda={p.obra.legenda}
                nome={p.nome}
              />
            </div>
          </div>
        </section>

        {/* Destaques */}
        <section className="bg-ink-3 py-24 md:py-32">
          <div className="mx-auto max-w-[1300px] px-6 md:px-10">
            <Reveal>
              <h2 className="din h-section text-white">Destaques</h2>
            </Reveal>
            <Reveal group className="mt-16 grid grid-cols-1 gap-x-20 gap-y-16 sm:grid-cols-2 md:gap-y-20 lg:grid-cols-3">
              {p.destaques.map((d) => (
                <div key={d.titulo} className="flex gap-6 text-white">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center md:h-14 md:w-14">
                    <DestaqueIcon nome={d.icone} size={48} />
                  </span>
                  <div>
                    <h3 className="din text-[18px] md:text-[20px]">{d.titulo}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-white/85">{d.texto}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <h2 className="din h-section text-ink-2">Localização</h2>
            </Reveal>
            <div className="mx-auto mt-14 max-w-[1100px]">
              <MapEmbed query={p.mapa} coord={p.mapaCoord} />
            </div>
          </div>
        </section>

        {/* Fale Conosco */}
        <section className="bg-ink py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <h3 className="din h-num text-white">Fale Conosco</h3>
            </Reveal>
            <div className="mt-16 md:pl-[12%]">
              <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
                <h6 className="din h-card text-white">{p.faleLinha}</h6>
                <WaCta
                  href={waLink(site.whatsapp, `Olá Focal Inc! Quero mais informações sobre o ${p.nome}.`)}
                  posicao="fale-conosco"
                  className="cta on-dark flex items-center justify-center gap-3 rounded-[4px] bg-verde px-8 py-4 text-white transition-[background-color,transform] duration-200 hover:bg-verde/90 active:scale-[0.985] md:max-w-[540px]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
                  </svg>
                  Atendimento
                </WaCta>
              </div>
              {p.legal && (
                <p className="mt-16 max-w-[75ch] text-left text-[13px] leading-[1.7] text-white/70">
                  {p.legal}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      {lightbox && (
        <Lightbox
          items={lightbox.items}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
          onNavigate={(i) => setLightbox({ ...lightbox, index: i })}
        />
      )}
    </>
  );
}
