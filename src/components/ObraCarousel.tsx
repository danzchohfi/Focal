"use client";

import { useState } from "react";
import Carousel from "./Carousel";
import Lightbox, { type LightboxItem } from "./Lightbox";
import { asset } from "@/lib/asset";

// Galeria escura "Conheça o {empreendimento}": fotos verticais em carrossel
// com fades laterais integrando o corte ao fundo preto; no Artur inclui o
// vídeo da obra como primeiro item. Como no site atual, cada item abre em
// lightbox (o vídeo também).
export default function ObraCarousel({
  fotos,
  video,
  legenda,
  nome,
}: {
  fotos: string[];
  video?: string;
  legenda?: string;
  nome: string;
}) {
  const [aberto, setAberto] = useState<number | null>(null);

  const lbItems: LightboxItem[] = [
    ...(video ? [{ video, cap: legenda }] : []),
    ...fotos.map((f, i) => ({ src: f, cap: legenda, alt: `${nome} — foto ${i + 1}` })),
  ];

  const chip = legenda ? (
    <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1 text-[11px] uppercase tracking-wider text-white backdrop-blur-sm">
      {legenda}
    </span>
  ) : null;

  const items: React.ReactNode[] = [];

  if (video) {
    items.push(
      <button
        type="button"
        onClick={() => setAberto(0)}
        aria-label={`Assistir o vídeo — ${nome}`}
        className="group relative block h-[440px] w-full cursor-zoom-in overflow-hidden rounded-lg bg-black text-left md:h-[480px]"
      >
        <video
          src={asset(video)}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <span className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_32px_rgba(0,0,0,.35)] transition-transform duration-200 group-hover:scale-110">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        {chip}
      </button>
    );
  }

  fotos.forEach((f, i) => {
    const idx = (video ? 1 : 0) + i;
    items.push(
      <button
        type="button"
        onClick={() => setAberto(idx)}
        aria-label={`Ampliar foto ${i + 1} — ${nome}`}
        className="relative block h-[440px] w-full cursor-zoom-in overflow-hidden rounded-lg text-left md:h-[480px]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(f)}
          alt={`${nome} — foto ${i + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
        />
        {chip}
      </button>
    );
  });

  return (
    <div className="relative">
      {/* Fades laterais sobre o fundo preto */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-20 bg-gradient-to-r from-ink to-transparent md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-20 bg-gradient-to-l from-ink to-transparent md:block" />
      <Carousel dark itemClassName="w-[75%] p-2 sm:w-[40%] md:w-[24%] lg:w-[19%]">
        {items}
      </Carousel>

      {aberto !== null && (
        <Lightbox
          items={lbItems}
          index={aberto}
          onClose={() => setAberto(null)}
          onNavigate={setAberto}
        />
      )}
    </div>
  );
}
