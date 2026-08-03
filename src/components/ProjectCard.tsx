import Link from "next/link";
import { asset } from "@/lib/asset";
import type { Projeto } from "@/data/projetos";

// Ícones dos specs do card (cama e metragem), como no site atual.
function BedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 6v12h2v-2h14v2h2v-8a3 3 0 0 0-3-3h-7v5H5V6H3zm4 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="m3 17 4 4L21 7l-4-4L3 17zM8 12l1.5 1.5M11 9l1.5 1.5M14 6l1.5 1.5" />
    </svg>
  );
}

export default function ProjectCard({ projeto }: { projeto: Projeto }) {
  return (
    <Link
      href={`/${projeto.slug}`}
      className="group relative block h-[520px] overflow-hidden rounded-sm md:h-[560px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
        style={{ backgroundImage: `url(${asset(projeto.cardImg)})` }}
      />
      {/* Gradiente inferior (tmb-overlay-gradient-bottom do tema atual) */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/40 to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 p-5 text-white">
        <h3 className="din h-card">
          {projeto.nomeCard[0]}
          <br />
          {projeto.nomeCard[1]}
        </h3>
        <span className="badge-verde mt-3">{projeto.bairro}</span>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <BedIcon />
            <span className="din text-[17px] md:text-[18px]">{projeto.cardSpecs.dorm}</span>
          </div>
          <div className="flex items-center gap-3">
            <RulerIcon />
            <span className="din text-[17px] md:text-[18px]">{projeto.cardSpecs.area}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
