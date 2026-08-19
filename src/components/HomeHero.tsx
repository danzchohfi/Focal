"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import TowerLines from "./lpd/TowerLines";
import { asset } from "@/lib/asset";
import { menu } from "@/lib/site";

const YT_ID = "kDffbrcLwb4"; // vídeo de drone do hero (mesmo embed do site atual)

/* Paleta da identidade 2026 */
const NAVY = "#12475F";
const PASTEL = "#BCD7E6";
const PINHO = "#2F5D48";

// Hero da home na identidade 2026: campo azul pastel com o vídeo emoldurado —
// a composição dos cards da marca — em vez do full-bleed escuro. O YouTube
// continua mudo/loop/sem controles no desktop (invisível até o player avisar
// que está tocando, e com sobra de escala para cortar título e marca d'água);
// no mobile o mp4 local cobre a moldura.
//
// `comVideo={false}` é a variante E (/home-e), para comparação: sem o drone,
// o hero vira composição tipográfica sobre o pastel com a torre em linhas —
// mesma mecânica de menu na base e mesma coreografia de entrada.
export default function HomeHero({ comVideo = true }: { comVideo?: boolean }) {
  const embed = `https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      try {
        if (!/(^|\.)youtube(-nocookie)?\.com$/.test(new URL(e.origin).hostname)) return;
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (
          (data?.event === "onStateChange" && data?.info === 1) ||
          (data?.event === "infoDelivery" && data?.info?.playerState === 1)
        ) {
          setPlaying(true);
        }
      } catch {
        /* mensagens de outros widgets */
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Handshake da API de iframe: sem isso o player não emite onStateChange.
  const startListening = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(JSON.stringify({ event: "listening", id: "hero", channel: "widget" }), "*");
    win.postMessage(
      JSON.stringify({ event: "command", func: "addEventListener", args: ["onStateChange"], id: "hero", channel: "widget" }),
      "*"
    );
  };

  return (
    <section
      className="relative flex min-h-svh flex-col overflow-hidden"
      style={{ background: PASTEL, color: NAVY }}
    >
      {/* Variante E: torre em linhas atrás de tudo, sem mídia */}
      {!comVideo && <TowerLines cor={NAVY} />}

      {/* Texto do hero */}
      <div className={`relative z-10 px-6 pt-24 md:px-12 md:pt-28 ${comVideo ? "" : "flex flex-1 flex-col justify-center pt-0 md:pt-0"}`}>
        <h6 className="kicker hero-in hero-in-1 mb-6" style={{ color: PINHO }}>
          Descubra a Focal Inc
        </h6>
        <h2 className={`din hero-in hero-in-2 max-w-3xl ${comVideo ? "h-section" : "h-hero max-w-4xl"}`}>
          Uma incorporadora
          <br />
          focada na realização
          <br />
          de projetos especiais
        </h2>
        {!comVideo && (
          <p className="din-book hero-in hero-in-3 mt-8 max-w-[38ch] text-[clamp(17px,2vw,22px)] leading-[1.4] opacity-80">
            Fachadas e plantas que redefinem o espaço, no melhor de Pinheiros e Moema.
          </p>
        )}
      </div>

      {/* Vídeo emoldurado, como as mídias dos cards da identidade */}
      {comVideo && (
        <div className="hero-in hero-in-3 flex-1 px-6 pb-4 pt-10 md:px-12">
          <div
            className="relative mx-auto h-full min-h-[300px] w-full max-w-[1320px] overflow-hidden rounded-lg shadow-[0_28px_90px_-30px_rgba(18,71,95,.5)]"
            style={{ background: NAVY }}
          >
            {/* Poster de fallback atrás do vídeo — nunca um vazio */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${asset("/wp/1-Drone-SP.jpg")})` }}
              aria-hidden
            />
            {/* YouTube (desktop) com 35% de sobra para cortar o overlay do título */}
            <div className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
              <iframe
                ref={iframeRef}
                src={embed}
                title="Focal Inc — vídeo institucional"
                allow="autoplay; encrypted-media"
                onLoad={startListening}
                className={`absolute left-1/2 top-1/2 h-[max(135svh,75.94vw)] w-[max(135vw,240svh)] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${
                  playing ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
            {/* Vídeo mp4 (mobile) */}
            <video
              className="absolute inset-0 h-full w-full object-cover md:hidden"
              src={asset("/wp/Focal_Drones_v4_mobile-MPEG-4-720-2.mp4")}
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      )}

      {/* Barra de menu no rodapé do hero */}
      <div className="hero-in hero-in-3 relative z-10">
        <div className="mx-6 border-t md:mx-12" style={{ borderColor: "rgba(18,71,95,.25)" }} />
        <div className="flex items-center gap-10 px-6 py-6 md:px-12">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="preto" className="h-7 w-auto md:h-8" />
          </Link>
          <nav className="hidden items-center gap-9 md:flex">
            {menu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link text-[15px]"
                style={{ color: NAVY }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hero-in hero-in-4 flex justify-center pb-5">
          <a
            href="#empreendimentos"
            aria-label="Ver empreendimentos"
            className="animate-bounce-slow opacity-80 transition-opacity hover:opacity-100"
            style={{ color: NAVY }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
