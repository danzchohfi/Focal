"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Projeto } from "@/data/projetos";

// Ícones dos specs do card (traço 2.2, mesmo peso entre si).
function BedIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7v10M3 15h18M21 15v-4a2 2 0 0 0-2-2h-8v6" />
      <circle cx="6.5" cy="11" r="1.5" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m3 17 4 4L21 7l-4-4L3 17zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />
    </svg>
  );
}

// Card da vitrine como no site atual: foto de fundo, conteúdo ancorado na
// base (nome, badge do bairro e specs), raio de 12px e sem overlay/zoom.
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
      className="on-dark relative block h-[440px] overflow-hidden rounded-xl bg-ink-3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={asset(projeto.cardImg)}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-9">
        <h3 className="din h-card">
          {projeto.nomeCard[0]}
          <br />
          {projeto.nomeCard[1]}
        </h3>
        <span className="badge-verde mt-[18px]">{projeto.bairro}</span>
        <div className="mt-[18px] space-y-3">
          <div className="flex items-center gap-3 text-white">
            <BedIcon />
            <span className="din text-[18px] md:text-[19px]">{projeto.cardSpecs.dorm}</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <RulerIcon />
            <span className="din text-[18px] md:text-[19px]">{projeto.cardSpecs.area}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
