"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";

// Seção "Assista o vídeo": poster em alta com scrim, play sólido; ao clicar,
// o YouTube entra com fade (ou o mp4 quando é o único formato).
export default function VideoSection({ youtube, mp4 }: { youtube?: string; mp4?: string }) {
  const [play, setPlay] = useState(false);
  const [frameOn, setFrameOn] = useState(false);
  const [posterSrc, setPosterSrc] = useState(
    youtube ? `https://i.ytimg.com/vi/${youtube}/maxresdefault.jpg` : undefined
  );

  return (
    <section className="bg-ink-3 py-20 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="din h-section text-center text-white">Assista o vídeo</h2>
        <div className="relative mx-auto mt-14 aspect-video max-w-[960px] overflow-hidden rounded-lg bg-black/40">
          {play ? (
            youtube ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0&modestbranding=1`}
                title="Vídeo do empreendimento"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                onLoad={() => setFrameOn(true)}
                className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${frameOn ? "opacity-100" : "opacity-0"}`}
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
              className="group on-dark absolute inset-0 flex items-center justify-center"
            >
              {posterSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={posterSrc}
                  alt=""
                  onError={() =>
                    setPosterSrc(youtube ? `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg` : undefined)
                  }
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/30" />
              <span className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white text-ink shadow-[0_8px_32px_rgba(0,0,0,.35)] transition-transform duration-200 group-hover:scale-110">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
