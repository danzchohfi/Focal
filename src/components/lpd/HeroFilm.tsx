"use client";

import { useEffect, useRef } from "react";

/**
 * O filme da obra em autoplay no fundo do hero — Cloudflare Stream.
 *
 * MP4 progressivo primeiro (barato e sem dependência); se o download não
 * estiver habilitado no painel, cai para HLS via hls.js. Com movimento
 * reduzido não há autoplay: fica o poster, e o filme segue disponível na
 * seção #filme com controles. Sem JavaScript, o <source> MP4 nativo cuida
 * do autoplay mudo — e, se não existir, o poster segura a cena.
 */

const STREAM =
  "https://customer-mvmgeaoiwcmxb2t3.cloudflarestream.com/9abaa451613897445f56b911056cbcea";
const MP4_URL = `${STREAM}/downloads/default.mp4`;
const HLS_URL = `${STREAM}/manifest/video.m3u8`;
const POSTER = `${STREAM}/thumbnails/thumbnail.jpg?time=8s&height=1080`;

export default function HeroFilm() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.removeAttribute("autoplay");
      v.pause();
      return;
    }

    let cancelado = false;
    let hls: { destroy(): void } | null = null;

    // Fora da tela o filme PARA: o hero fica lá em cima enquanto a página
    // inteira rola, e um HLS de 1080p decodificando invisível disputa CPU
    // com o scrub do filme da obra logo abaixo. Volta a tocar quando reaparece.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0 }
    );
    io.observe(v);

    // HLS direto: é o formato garantido no Stream (o MP4 progressivo depende
    // de configuração no painel e aqui só serve de fallback sem JS).
    (async () => {
      if (v.canPlayType("application/vnd.apple.mpegurl")) {
        v.src = HLS_URL;
        v.play().catch(() => {});
        return;
      }
      const { default: Hls } = await import("hls.js");
      if (cancelado || !Hls.isSupported()) return;
      const h = new Hls({ capLevelToPlayerSize: true });
      hls = h;
      h.loadSource(HLS_URL);
      h.attachMedia(v);
      v.play().catch(() => {});
    })();

    return () => {
      cancelado = true;
      io.disconnect();
      hls?.destroy();
    };
  }, []);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      poster={POSTER}
      aria-hidden
      tabIndex={-1}
      className="absolute inset-0 h-full w-full object-cover"
      /* o poster também como background: segura a cena enquanto o HLS carrega */
      style={{ backgroundImage: `url(${POSTER})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <source src={MP4_URL} type="video/mp4" />
    </video>
  );
}
