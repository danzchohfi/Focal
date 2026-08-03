import type { Metadata } from "next";
import ArturConversionLP from "@/components/ArturConversionLP";
import TrackView from "@/components/TrackView";
import { getExperiment, splitterScript } from "@/lib/ab";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Artur 73 — Pé-direito duplo na esquina da Oscar Freire",
  description:
    "Apartamentos de 52 a 88m² com 2 suítes e pé-direito duplo de 5,5 m, na quadra do metrô, em Pinheiros. Entrega em setembro de 2026.",
  // Variante de teste A/B: não indexar; a canônica é /artur-73
  robots: { index: false, follow: false },
  alternates: { canonical: "/artur-73" },
};

export default function ArturBPage() {
  const exp = getExperiment("artur73_lp")!;
  return (
    <>
      {/* Splitter: honra ?v=a (volta para a variante A) e fixa a atribuição
          de quem chega direto nesta URL */}
      <script dangerouslySetInnerHTML={{ __html: splitterScript(exp, BASE_PATH, "b") }} />
      <TrackView experiment={exp.id} variant="b" />
      <ArturConversionLP />
    </>
  );
}
