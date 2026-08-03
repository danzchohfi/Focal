"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Projeto } from "@/data/projetos";

// Ícones dos specs do card (traço 2.2, mesmo peso entre si).
function BedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7v10M3 15h18M21 15v-4a2 2 0 0 0-2-2h-8v6" />
      <circle cx="6.5" cy="11" r="1.5" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 17 4 4L21 7l-4-4L3 17zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />
    </svg>
  );
}

export default function ProjectCard({ projeto }: { projeto: Projeto }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  // A imagem pode carregar antes da hidratação — o onLoad se perde.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <Link
      href={`/${projeto.slug}`}
      className="group on-dark relative block h-[520px] overflow-hidden rounded-lg bg-ink-3 transition-shadow duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,.08),0_24px_48px_-16px_rgba(0,0,0,.35)] md:h-[560px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={asset(projeto.cardImg)}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Scrim ancorado na base: a foto respira, o texto lê */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_top,rgba(0,0,0,.82)_0%,rgba(0,0,0,.55)_28%,rgba(0,0,0,.22)_58%,transparent_100%)] opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-white transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 md:p-8">
        <h3 className="din h-card">
          {projeto.nomeCard[0]}
          <br />
          {projeto.nomeCard[1]}
        </h3>
        <span className="badge-verde mt-4">{projeto.bairro}</span>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 text-white/90">
            <BedIcon />
            <span className="din text-[15px]">{projeto.cardSpecs.dorm}</span>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <RulerIcon />
            <span className="din text-[15px]">{projeto.cardSpecs.area}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
