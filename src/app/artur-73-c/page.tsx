import type { Metadata } from "next";
import ArturLpC from "@/components/ArturLpC";
import TrackView from "@/components/TrackView";

export const metadata: Metadata = {
  title: "Artur 73 — Pé-direito duplo de 5,5 m na esquina da Oscar Freire",
  description:
    "Apartamentos de 52 a 88m² com 2 suítes e pé-direito duplo de 5,5 m, na quadra do metrô, em Pinheiros. Entrega em setembro de 2026.",
  // Variante de demonstração: fora do split de mídia e fora do índice.
  // A canônica continua sendo /artur-73.
  robots: { index: false, follow: false },
  alternates: { canonical: "/artur-73" },
};

/**
 * Variante C do Artur 73 — proposta de reformulação de layout.
 *
 * Não entra no sorteio do experimento `artur73_lp`: é uma URL de apresentação,
 * para mostrar o ganho de layout sem mexer no tráfego que já roda em A/B.
 * Para colocá-la no ar como variante real, basta adicionar
 * `{ id: "c", path: "/artur-73-c", weight: 33 }` em `experiments` (src/lib/ab.ts)
 * e reequilibrar os pesos — o splitter e a atribuição sticky já suportam N
 * variantes.
 */
export default function ArturCPage() {
  return (
    <>
      <TrackView experiment="artur73_lp" variant="c" />
      <ArturLpC />
    </>
  );
}
