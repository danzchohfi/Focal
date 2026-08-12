"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import Particles from "./Particles";
import { asset } from "@/lib/asset";
import { menu } from "@/lib/site";

const YT_ID = "kDffbrcLwb4"; // vídeo de drone do hero (mesmo embed do site atual)

// Hero da home: vídeo do YouTube em tela cheia no desktop (mudo, loop, sem
// controles) sobre um poster de fallback, mp4 no mobile, entrada coreografada
// e menu no rodapé do hero.
//
// O overlay do YouTube (título/canal) não pode aparecer: o iframe fica
// invisível atrás do poster até o player avisar que está tocando (postMessage
// da API do YouTube) e é ampliado além da viewport para que a faixa do título
// e a marca d'água fiquem cortadas fora da área visível.
export default function HomeHero() {
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
    <section className="relative h-svh min-h-[560px] overflow-hidden bg-ink">
      {/* Poster de fallback atrás do vídeo — nunca um vazio cinza */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${asset("/wp/1-Drone-SP.jpg")})` }}
        aria-hidden
      />
      {/* Vídeo YouTube cobrindo o hero (desktop). O tamanho tem 35% de sobra
          nos dois eixos (mantendo 16:9) para cortar o overlay do título. */}
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
      {/* Scrim duplo: leitura no topo e na base */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/40" />
      <Particles />

      {/* Texto do hero */}
      <div className="absolute inset-x-0 top-[28%] z-10 px-6 md:px-12">
        <h6 className="kicker hero-in hero-in-1 mb-6 text-white/75">Descubra a Focal Inc</h6>
        <h2 className="din h-section hero-in hero-in-2 max-w-3xl text-white">
          Uma incorporadora
          <br />
          focada na realização
          <br />
          de projetos especiais
        </h2>
      </div>

      {/* Barra de menu no rodapé do hero */}
      <div className="hero-in hero-in-3 absolute inset-x-0 bottom-0 z-10">
        <div className="mx-6 border-t border-white/25 md:mx-12" />
        <div className="flex items-center gap-10 px-6 py-6 md:px-12">
          <Link href="/" aria-label="Focal Inc — Home">
            <Logo tone="branco" className="h-7 w-auto md:h-8" />
          </Link>
          <nav className="hidden items-center gap-9 md:flex">
            {menu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="nav-link on-dark text-[15px] text-white"
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
            className="animate-bounce-slow on-dark text-white/90"
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
