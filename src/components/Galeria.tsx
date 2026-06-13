"use client";

import { useMemo, useState } from "react";
import Figure from "@/components/Figure";
import { track } from "@/lib/tracking";
import type { ItemGaleria } from "@/lib/types";

const categorias: { id: ItemGaleria["categoria"] | "todas"; label: string }[] = [
  { id: "todas", label: "Tudo" },
  { id: "fachada", label: "Fachada" },
  { id: "areas-comuns", label: "Áreas comuns" },
  { id: "interiores", label: "Interiores" },
  { id: "obra", label: "Obra" },
];

export default function Galeria({
  itens,
  empreendimento,
}: {
  itens: ItemGaleria[];
  empreendimento: string;
}) {
  const [cat, setCat] = useState<(typeof categorias)[number]["id"]>("todas");

  const visiveis = useMemo(
    () => (cat === "todas" ? itens : itens.filter((i) => i.categoria === cat)),
    [cat, itens],
  );

  const existentes = useMemo(
    () => categorias.filter((c) => c.id === "todas" || itens.some((i) => i.categoria === c.id)),
    [itens],
  );

  if (itens.length === 0) return null;

  return (
    <div>
      <div role="tablist" aria-label="Categorias da galeria" className="flex flex-wrap gap-2">
        {existentes.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => {
              setCat(c.id);
              track("view_galeria", { empreendimento, categoria_foto: c.id });
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cat === c.id
                ? "border-[#3e7c5b] bg-[#3e7c5b]/15 text-[#7fb89a]"
                : "border-white/20 text-white/70 hover:border-white/50"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {visiveis.map((item) => (
          <Figure
            key={item.legenda}
            src={item.src}
            alt={item.legenda}
            legenda={item.legenda}
          />
        ))}
      </div>
    </div>
  );
}
