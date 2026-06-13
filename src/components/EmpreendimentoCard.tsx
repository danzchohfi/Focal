import Link from "next/link";
import Figure from "@/components/Figure";
import StatusBadge from "@/components/StatusBadge";
import type { Empreendimento } from "@/lib/types";

export default function EmpreendimentoCard({
  e,
  destaque = false,
}: {
  e: Empreendimento;
  destaque?: boolean;
}) {
  if (e.draft) {
    return (
      <div className="flex flex-col justify-between rounded-sm border border-dashed border-white/15 p-6">
        <div>
          <StatusBadge status={e.status} />
          <p className="mt-4 text-lg font-semibold text-white/60">{e.nome}</p>
          <p className="mt-2 text-sm text-[#a3a39c]">
            Ficha completa em preparação — fotos, plantas e disponibilidade em
            breve.
          </p>
        </div>
        <p className="mt-6 text-xs uppercase tracking-widest text-white/30">
          Portfólio Focal
        </p>
      </div>
    );
  }

  const specs = [
    `${e.metragem.min}–${e.metragem.max} m²`,
    e.usos.includes("nr") ? "Residencial + NR" : "Residencial",
    e.bairro,
  ];

  return (
    <Link
      href={`/empreendimentos/${e.slug}`}
      className={`group block ${destaque ? "md:col-span-2" : ""}`}
    >
      <Figure
        src={e.heroImage}
        alt={`${e.nome} — ${e.bairro}`}
        aspect={destaque ? "aspect-[16/9]" : "aspect-[4/3]"}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={e.status} entrega={e.entrega} />
        {e.precoAPartir ? (
          <span className="text-sm text-[#7fb89a]">a partir de {e.precoAPartir}</span>
        ) : null}
      </div>
      <h3 className="mt-3 text-2xl font-bold tracking-tight group-hover:text-[#7fb89a]">
        {e.nome}
      </h3>
      <p className="mt-1 text-sm text-[#a3a39c]">{specs.join(" · ")}</p>
      {destaque && e.highlights.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
          {e.highlights.map((h) => (
            <li key={h.label} className="border-l-2 border-[#3e7c5b] pl-3">
              <span className="block text-xs uppercase tracking-wider text-white/45">
                {h.label}
              </span>
              {h.value}
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
