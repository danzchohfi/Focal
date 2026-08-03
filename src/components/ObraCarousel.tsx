"use client";

import Carousel from "./Carousel";
import { asset } from "@/lib/asset";

// Galeria escura "Conheça o {empreendimento}": fotos verticais em carrossel;
// no Artur inclui o vídeo da obra como primeiro item.
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
  const items: React.ReactNode[] = [];

  if (video) {
    items.push(
      <div className="relative h-[440px] overflow-hidden rounded-sm bg-black md:h-[480px]">
        <video
          src={asset(video)}
          className="h-full w-full object-cover"
          controls
          muted
          playsInline
          preload="metadata"
        />
        {legenda && (
          <span className="absolute bottom-3 left-3 bg-ink/80 px-3 py-1 text-[12px] text-white">
            {legenda}
          </span>
        )}
      </div>
    );
  }

  fotos.forEach((f, i) => {
    items.push(
      <div className="relative h-[440px] overflow-hidden rounded-sm md:h-[480px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(f)}
          alt={`${nome} — foto ${i + 1}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
        />
        {legenda && (
          <span className="absolute bottom-3 left-3 bg-ink/80 px-3 py-1 text-[12px] text-white">
            {legenda}
          </span>
        )}
      </div>
    );
  });

  return (
    <Carousel dark itemClassName="w-[75%] p-2 sm:w-[40%] md:w-[24%] lg:w-[19%]">
      {items}
    </Carousel>
  );
}
