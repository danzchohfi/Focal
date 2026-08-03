import Link from "next/link";
import Carousel from "./Carousel";
import DestaqueIcon from "./DestaqueIcon";
import LeadForm from "./LeadForm";
import LpHeader from "./LpHeader";
import MapEmbed from "./MapEmbed";
import ObraCarousel from "./ObraCarousel";
import PieStatus from "./PieStatus";
import Reveal from "./Reveal";
import SiteFooter from "./SiteFooter";
import VideoSection from "./VideoSection";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import type { Projeto } from "@/data/projetos";

function SpecIcons({ specs }: { specs: string[] }) {
  const icons = [
    // régua/projeto
    <path key="0" d="m3 17 4 4L21 7l-4-4L3 17zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />,
    // cama
    <path key="1" d="M3 6v12M3 16h18M21 16v-5a2 2 0 0 0-2-2h-8v5M6 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />,
    // pé-direito
    <path key="2" d="M12 3v18M8.5 6.5 12 3l3.5 3.5M8.5 17.5 12 21l3.5-3.5" />,
    // carro
    <path key="3" d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M4 11h16a1 1 0 0 1 1 1v4h-2M3 16v-4a1 1 0 0 1 1-1M7.5 16a1.5 1.5 0 1 1-3 0M19.5 16a1.5 1.5 0 1 1-3 0M7.5 16h9" />,
  ];
  return (
    <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
      {specs.map((s, i) => (
        <div key={s} className="flex flex-col items-start gap-3">
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {icons[i % icons.length]}
          </svg>
          <span className="din text-[17px] leading-snug md:text-[20px]">{s}</span>
        </div>
      ))}
    </div>
  );
}

// Template das páginas de empreendimento — réplica da LP do site atual.
export default function ProjectPageTemplate({ projeto: p }: { projeto: Projeto }) {
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/30" />
          <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[1fr_380px] md:px-10 md:py-20 lg:gap-16">
            <div className="flex flex-col justify-center text-white">
              <Reveal>
                <h1 className="din text-[14px] uppercase tracking-widest">{p.statusLabel}</h1>
                <h2 className={`din ${p.slug === "artur-73" ? "h-hero-lp" : "h-hero"} mt-2`}>
                  {p.heroTitulo}
                </h2>
                <h3
                  className="mt-10 max-w-2xl text-[22px] leading-snug md:text-[28px] lg:text-[32px]"
                  style={{ fontFamily: "var(--font-din)", fontWeight: 400 }}
                >
                  {p.heroSub}
                </h3>
              </Reveal>
            </div>
            <Reveal delay={150}>
              <div id="atendimento" className="rounded-md bg-verde p-6 shadow-2xl md:p-7">
                <h2 className="din h-card mb-5 text-white">Atendimento</h2>
                <LeadForm variant={p.formVariant} tone="verde" contexto={p.nome} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Faixa de fotos */}
        <section className="bg-light py-12 md:py-16">
          <div className="mx-auto max-w-[1400px] px-4">
            <Carousel itemClassName="w-[88%] p-2 sm:w-[55%] md:w-[44%]">
              {p.strip.map((f, i) => (
                <div key={f} className="h-[300px] overflow-hidden rounded-sm md:h-[420px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(f)}
                    alt={`${p.nome} — imagem ${i + 1}`}
                    loading={i > 1 ? "lazy" : undefined}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Intro + Detalhes + Status */}
        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-14 px-6 md:grid-cols-[1.2fr_1fr_0.8fr] md:px-10">
            <Reveal>
              <h3 className="din h-card text-ink-2">{p.intro.titulo}</h3>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2 md:text-[18px]">
                {p.intro.texto}
              </p>
              <SpecIcons specs={p.intro.specs} />
            </Reveal>
            <Reveal delay={100}>
              <h2 className="din h-section text-ink-2">Detalhes</h2>
              <dl className="mt-8 space-y-6">
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
                    <dt className="din text-[18px] text-ink-2 md:text-[20px]">{k}</dt>
                    <dd className="mt-1 text-[15px] text-ink-2/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={200}>
              <h2 className="din h-section text-ink-2">Status</h2>
              <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-1">
                {p.status.map((s) => (
                  <PieStatus key={s.label} label={s.label} valor={s.valor} />
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
                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2 md:text-[18px]">
                  {p.destaqueArea.texto}
                </p>
                <LeadForm variant={p.formVariant} tone="claro" contexto={p.nome} className="mt-8 max-w-md" />
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
        <section className="bg-light py-20 md:py-24">
          <div className="mx-auto max-w-[1300px] px-6">
            <Reveal className="text-center">
              <h3 className="din h-section text-ink-2">{p.plantas.titulo}</h3>
              <p className="mt-4 text-[17px] text-ink-2 md:text-[18px]">{p.plantas.texto}</p>
            </Reveal>
            <div className="mt-12">
              <Carousel itemClassName="w-[88%] p-3 sm:w-[50%] md:w-[33.33%]">
                {p.plantas.itens.map((pl) => (
                  <figure key={pl.img} className="flex h-full flex-col">
                    <div className="flex aspect-square items-center justify-center overflow-hidden bg-white p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset(pl.img)}
                        alt={`${p.nome} — planta ${pl.cap}`}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <figcaption className="mt-4 text-center text-[15px] text-ink-2">{pl.cap}</figcaption>
                  </figure>
                ))}
              </Carousel>
            </div>
            {(p.tourUrl || p.folderUrl) && (
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                {p.tourUrl && (
                  <Link
                    href={p.tourUrl}
                    target={p.tourUrl.startsWith("http") ? "_blank" : undefined}
                    className="flex items-center gap-3 bg-ink-2 px-8 py-4 text-[15px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85 md:text-[16px]"
                  >
                    <span aria-hidden>↗</span> Tour Virtual
                  </Link>
                )}
                {p.folderUrl && (
                  <a
                    href={p.folderUrl.startsWith("/wp/") ? asset(p.folderUrl) : p.folderUrl}
                    target={p.folderUrl.startsWith("/wp/") ? "_blank" : undefined}
                    className="flex items-center gap-3 bg-ink-2 px-8 py-4 text-[15px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-85 md:text-[16px]"
                  >
                    <span aria-hidden>↗</span> Download do Folder Digital
                  </a>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Conheça o empreendimento (galeria escura) */}
        <section className="bg-ink py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-4 md:px-6">
            <Reveal className="text-center">
              <h3 className="din h-card text-white">{p.obra.titulo}</h3>
              <p className="mt-3 text-[17px] text-white/90 md:text-[18px]">
                Entre em contato caso deseje mais informações.
              </p>
            </Reveal>
            <div className="mt-12">
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
        <section className="bg-ink-3 py-20 md:py-24">
          <div className="mx-auto max-w-[1300px] px-6 md:px-10">
            <Reveal>
              <h2 className="din h-section text-white">Destaques</h2>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {p.destaques.map((d, i) => (
                <Reveal key={d.titulo} delay={(i % 3) * 100}>
                  <div className="flex gap-5 text-white">
                    <DestaqueIcon nome={d.icone} />
                    <div>
                      <h3 className="din text-[18px] md:text-[20px]">{d.titulo}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-white/85">{d.texto}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Localização */}
        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <h2 className="din h-section text-ink-2">Localização</h2>
            </Reveal>
            <div className="mt-10">
              <MapEmbed query={p.mapa} />
            </div>
          </div>
        </section>

        {/* Fale Conosco */}
        <section className="bg-ink py-20 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <Reveal>
              <h3 className="din h-num text-white">Fale Conosco</h3>
            </Reveal>
            <div className="mt-14 grid grid-cols-1 items-center gap-10 md:grid-cols-2">
              <h6 className="din h-card text-white">{p.faleLinha}</h6>
              <a
                href={waLink(site.whatsapp, `Olá Focal Inc! Quero mais informações sobre o ${p.nome}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-verde px-8 py-4 text-[15px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-85"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
                </svg>
                Atendimento
              </a>
            </div>
            {p.legal && (
              <p className="mt-14 text-justify text-[13px] leading-relaxed text-white/80">{p.legal}</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
