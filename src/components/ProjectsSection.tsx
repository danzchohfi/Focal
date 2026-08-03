"use client";

import { useState } from "react";
import Carousel from "./Carousel";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import { filtros, projetos } from "@/data/projetos";

// Vitrine da home: título, filtros em pill e carrossel dos 5 empreendimentos.
export default function ProjectsSection() {
  const [filtro, setFiltro] = useState("todos");
  const lista =
    filtro === "todos" ? projetos : projetos.filter((p) => p.categorias.includes(filtro));

  return (
    <section id="empreendimentos" className="bg-white py-24 md:py-32">
      <Reveal className="px-6 text-center">
        <h1 className="din-book h-hero text-ink-2">Empreendimentos</h1>
      </Reveal>

      {/* Filtros */}
      <Reveal className="mt-14 flex justify-center px-4" delay={100}>
        <div className="flex max-w-full flex-wrap justify-center gap-1 rounded-full bg-off p-2 shadow-sm">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-6 py-2.5 text-[15px] transition-[color,background-color,box-shadow] duration-250 ${
                filtro === f.id
                  ? "bg-white text-black shadow"
                  : "text-black/60 hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Cards — carrossel fluido de ponta a ponta, como no site atual
          (cards de ~245px a 1440 e ~341px a 1920, gap de 36px) */}
      <div className="mt-12 w-full px-[18px]">
        {lista.length > 0 ? (
          <div key={filtro} className="contents">
            <Carousel
              arrows
              dots={false}
              itemClassName="w-[86%] p-[18px] sm:w-[46%] md:w-[33.33%] lg:w-[20%]"
            >
              {lista.map((p, i) => (
                <div
                  key={p.slug}
                  className="filter-in-item h-full"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <ProjectCard projeto={p} />
                </div>
              ))}
            </Carousel>
          </div>
        ) : (
          <p className="py-16 text-center text-[15px] text-black/50">
            Nenhum empreendimento nesta categoria no momento.
          </p>
        )}
      </div>
    </section>
  );
}
