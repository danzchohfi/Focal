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
    <section id="empreendimentos" className="bg-white py-20 md:py-24">
      <Reveal className="px-6 text-center">
        <h1 className="font-[500] h-hero text-ink-2" style={{ fontFamily: "var(--font-din)" }}>
          Empreendimentos
        </h1>
      </Reveal>

      {/* Filtros */}
      <Reveal className="mt-8 flex justify-center px-4" delay={100}>
        <div className="flex max-w-full flex-wrap justify-center gap-1 rounded-full bg-off p-1.5 shadow-sm">
          {filtros.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-5 py-2 text-[14px] transition-all ${
                filtro === f.id ? "bg-white font-semibold shadow" : "text-black/70 hover:text-black"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Cards */}
      <div className="mx-auto mt-10 max-w-[1400px] px-4 md:px-6">
        {lista.length > 0 ? (
          <Carousel
            arrows
            dots={false}
            itemClassName="w-[82%] p-2 sm:w-[46%] md:w-[33%] lg:w-[20%]"
          >
            {lista.map((p) => (
              <ProjectCard key={p.slug} projeto={p} />
            ))}
          </Carousel>
        ) : (
          <p className="py-16 text-center text-[15px] text-black/50">
            Nenhum empreendimento nesta categoria no momento.
          </p>
        )}
      </div>
    </section>
  );
}
