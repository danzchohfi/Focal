"use client";

import { useState } from "react";
import Figure from "@/components/Figure";
import WhatsAppCta from "@/components/WhatsAppCta";
import { track } from "@/lib/tracking";
import type { Tipologia } from "@/lib/types";

export default function Tipologias({
  tipologias,
  empreendimento,
  emVenda,
}: {
  tipologias: Tipologia[];
  empreendimento: string;
  emVenda: boolean;
}) {
  const [ativa, setAtiva] = useState(0);
  if (tipologias.length === 0) return null;
  const t = tipologias[ativa];

  return (
    <div>
      <div role="tablist" aria-label="Tipologias" className="flex flex-wrap gap-2">
        {tipologias.map((tip, i) => (
          <button
            key={tip.nome}
            role="tab"
            aria-selected={ativa === i}
            onClick={() => {
              setAtiva(i);
              track("view_planta", { empreendimento, tipologia: tip.nome });
            }}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
              ativa === i
                ? "border-[#3e7c5b] bg-[#3e7c5b]/15 text-[#7fb89a]"
                : "border-white/20 text-white/70 hover:border-white/50"
            }`}
          >
            {tip.nome}
          </button>
        ))}
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-2">
        <Figure
          src={t.planta}
          alt={`Planta — ${t.nome}`}
          legenda={`Planta · ${t.area}`}
          aspect="aspect-square"
        />
        <div>
          <p className="text-2xl font-bold">{t.area}</p>
          <ul className="mt-5 space-y-3 text-white/85">
            {t.detalhes.map((d) => (
              <li key={d} className="border-l-2 border-[#3e7c5b] pl-3 text-sm leading-relaxed">
                {d}
              </li>
            ))}
          </ul>
          {emVenda ? (
            <div className="mt-7 space-y-3">
              {t.precoAPartir ? (
                <p className="text-lg">
                  <span className="text-sm uppercase tracking-wider text-white/50">
                    a partir de{" "}
                  </span>
                  <strong className="text-[#7fb89a]">{t.precoAPartir}</strong>
                </p>
              ) : null}
              {t.disponibilidade ? (
                <p className="text-sm text-[#a3a39c]">{t.disponibilidade}</p>
              ) : null}
              <WhatsAppCta
                empreendimento={empreendimento}
                tipologia={t.nome}
                posicao="plantas"
              >
                Quero esta planta
              </WhatsAppCta>
            </div>
          ) : (
            <p className="mt-7 inline-block rounded-full border border-white/25 px-4 py-1.5 text-sm text-white/70">
              Empreendimento entregue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
