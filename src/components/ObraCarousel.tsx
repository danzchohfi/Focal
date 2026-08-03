"use client";

import Carousel from "./Carousel";
import { asset } from "@/lib/asset";

// Galeria escura "Conheça o {empreendimento}": fotos verticais em carrossel
// com fades laterais integrando o corte ao fundo preto; no Artur inclui o
// vídeo da obra como primeiro item.
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
  const chip = legenda ? (
    <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-1 text-[11px] uppercase tracking-wider text-white backdrop-blur-sm">
      {legenda}
    </span>
  ) : null;

  const items: React.ReactNode[] = [];

  if (video) {
    items.push(
      <div className="relative h-[440px] overflow-hidden rounded-lg bg-black md:h-[480px]">
        <video
          src={asset(video)}
          className="h-full w-full object-cover"
          controls
          muted
          playsInline
          preload="metadata"
        />
        {chip}
      </div>
    );
  }

  fotos.forEach((f, i) => {
    items.push(
      <div className="relative h-[440px] overflow-hidden rounded-lg md:h-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(f)}
          alt={`${nome} — foto ${i + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:scale-105"
        />
        {chip}
      </div>
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
    </div>
  );
}
