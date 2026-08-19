import type { Metadata } from "next";
import ArturLpD from "@/components/ArturLpD";
import TrackView from "@/components/TrackView";

export const metadata: Metadata = {
  title: "Artur 73 — Perto de tudo, onde Pinheiros mostra seu melhor",
  description:
    "Apartamentos de 81 e 88 m² com 2 suítes e pé-direito duplo, e studios NR de 52 m², na esquina da Artur de Azevedo com a Oscar Freire. Chaves em 2026.",
  // Variante de demonstração da nova identidade: fora do índice e fora do
  // sorteio de mídia. A canônica continua sendo /artur-73.
  robots: { index: false, follow: false },
  alternates: { canonical: "/artur-73" },
};

/**
 * Variante D do Artur 73 — reformulação na identidade visual 2026 (famílias
 * azul-petróleo/pastel, pinho/sálvia e marrom/taupe), com o filme conduzido
 * pelo scroll como peça central.
 *
 * Não entra no sorteio do experimento `artur73_lp`. Para ativar como variante
 * real, adicionar `{ id: "d", path: "/artur-73-d", weight: ... }` em
 * src/lib/ab.ts e reequilibrar os pesos.
 */
export default function ArturDPage() {
  return (
    <>
      <TrackView experiment="artur73_lp" variant="d" />
      <ArturLpD />
    </>
  );
}
