import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Parcerias",
  description:
    "Tem um terreno em bairro consolidado de São Paulo? Corretores e fornecedores também encontram aqui o canal certo com a Focal.",
};

const frentes = [
  {
    titulo: "Terrenistas",
    texto:
      "Terrenos espetaculares são o início de tudo na Focal. Se você tem um terreno em bairro consolidado de São Paulo, fazemos uma avaliação criteriosa e transparente — permuta ou aquisição.",
    intencao: "terreno",
  },
  {
    titulo: "Corretores e imobiliárias",
    texto:
      "Trabalhamos com parceiros de venda com material completo, atendimento ágil e comissionamento claro. Cadastre-se para receber books, tabelas e atualizações de disponibilidade.",
    intencao: "corretor",
  },
  {
    titulo: "Fornecedores",
    texto:
      "Construção e acabamento no padrão Focal. Apresente sua empresa pelo canal correto e nossa equipe de suprimentos avalia.",
    intencao: "fornecedor",
  },
];

export default function ParceriasPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
        Parcerias
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
        Bons projetos começam com boas parcerias.
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {frentes.map((f) => (
          <Reveal key={f.titulo} className="border-t-2 border-[#3e7c5b] pt-5">
            <h2 className="text-xl font-bold">{f.titulo}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a3a39c]">{f.texto}</p>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight">Apresente sua proposta</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#a3a39c]">
            Escolha o assunto no formulário — terrenos, parceria de vendas ou
            fornecimento — e a mensagem chega direto à pessoa certa. Resposta em
            até 24h úteis.
          </p>
          <p className="mt-6 text-sm text-[#a3a39c]">
            Prefere e-mail?{" "}
            <a href={`mailto:${site.email}`} className="text-[#7fb89a] underline">
              {site.email}
            </a>
          </p>
        </Reveal>
        <Reveal>
          <LeadForm intencaoInicial="terreno" />
        </Reveal>
      </div>
    </div>
  );
}
