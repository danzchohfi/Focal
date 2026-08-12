"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Carousel from "./Carousel";
import ProjectCard from "./ProjectCard";
import Reveal from "./Reveal";
import { filtros, projetos } from "@/data/projetos";

// Vitrine da home: título, abas de filtro e os 5 empreendimentos, como no
// site atual (Uncode tab-switch): trilho escuro em pílula com o cursor branco
// deslizando até a aba ativa — e a aba troca ao passar o mouse (tab-hover).
export default function ProjectsSection() {
  const [filtro, setFiltro] = useState("todos");
  const lista =
    filtro === "todos" ? projetos : projetos.filter((p) => p.categorias.includes(filtro));

  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  const measure = useCallback(() => {
    const btn = btnRefs.current[filtro];
    if (btn) setThumb({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [filtro]);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <section id="empreendimentos" className="border-t border-[#f4f4f4] bg-white py-[72px]">
      <Reveal className="px-6 text-center">
        <h1 className="din-book h-hero text-ink-2">Empreendimentos</h1>
      </Reveal>

      {/* Abas de filtro — trilho #222 com cursor branco deslizante */}
      <Reveal className="mt-12 px-4" delay={100}>
        <div className="flex justify-center">
          <div className="max-w-full overflow-x-auto rounded-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div ref={trackRef} className="relative flex w-max rounded-full bg-ink-2 p-1">
              {thumb && (
                <span
                  aria-hidden
                  className="absolute bottom-1 top-1 rounded-full bg-white transition-[left,width] duration-200 ease-in-out"
                  style={{ left: thumb.left, width: thumb.width }}
                />
              )}
              {filtros.map((f) => (
                <button
                  key={f.id}
                  ref={(el) => {
                    btnRefs.current[f.id] = el;
                  }}
                  type="button"
                  aria-pressed={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  onMouseEnter={() => setFiltro(f.id)}
                  onFocus={() => setFiltro(f.id)}
                  className={`relative z-10 whitespace-nowrap rounded-full px-[23px] py-2.5 text-[16px] transition-colors duration-200 md:text-[17px] ${
                    filtro === f.id ? "text-black" : "text-white/85 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Cards — 5 de ponta a ponta no desktop, carrossel no mobile, como no
          site atual (cards de ~245px a 1440 e ~341px a 1920, gap de 36px) */}
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
