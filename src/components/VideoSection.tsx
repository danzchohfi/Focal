"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

// Seção "Assista o vídeo": fundo escuro com play; ao clicar, carrega o
// YouTube (desktop) ou toca o mp4 (quando é o único formato disponível).
export default function VideoSection({
  youtube,
  mp4,
}: {
  youtube?: string;
  mp4?: string;
}) {
  const [play, setPlay] = useState(false);

  return (
    <section className="bg-ink-3 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="din h-section text-center text-white">Assista o vídeo</h2>
        <div className="relative mx-auto mt-10 aspect-video max-w-[960px] overflow-hidden bg-black/40">
          {play ? (
            youtube ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1`}
                title="Vídeo do empreendimento"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={mp4 ? asset(mp4) : undefined}
                className="absolute inset-0 h-full w-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )
          ) : (
            <button
              type="button"
              onClick={() => setPlay(true)}
              aria-label="Assistir o vídeo"
              className="group absolute inset-0 flex items-center justify-center"
            >
              {youtube && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                />
              )}
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/25 backdrop-blur transition-transform group-hover:scale-110">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
