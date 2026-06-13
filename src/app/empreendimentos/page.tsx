import type { Metadata } from "next";
import Vitrine from "./Vitrine";

export const metadata: Metadata = {
  title: "Empreendimentos",
  description:
    "Compare os empreendimentos da Focal por status, bairro, metragem e uso — residencial e NR — em São Paulo.",
};

export default function EmpreendimentosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
        Portfólio
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Empreendimentos
      </h1>
      <p className="mt-4 max-w-2xl text-[#a3a39c]">
        Cinco projetos escolhidos a dedo em São Paulo. Filtre por status, bairro,
        metragem e uso — ou compare tudo lado a lado.
      </p>
      <Vitrine />
    </div>
  );
}
