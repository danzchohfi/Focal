"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import LeadForm from "@/components/LeadForm";
import WhatsAppCta from "@/components/WhatsAppCta";
import { site } from "@/lib/site";

const intents = [
  {
    id: "comprar-morar",
    titulo: "Quero comprar",
    texto: "Para morar ou investir — tire dúvidas, receba plantas e agende visita.",
  },
  {
    id: "terreno",
    titulo: "Tenho um terreno",
    texto: "Avaliação criteriosa de terrenos em bairros consolidados de SP.",
  },
  {
    id: "corretor",
    titulo: "Sou corretor(a)",
    texto: "Parceria de vendas: books, tabelas e disponibilidade atualizada.",
  },
  {
    id: "fornecedor",
    titulo: "Sou fornecedor",
    texto: "Apresente sua empresa à equipe de suprimentos.",
  },
  {
    id: "cliente",
    titulo: "Já sou cliente",
    texto: "Assistência técnica, manuais e documentos do seu imóvel.",
  },
] as const;

export default function Atendimento() {
  const params = useSearchParams();
  const inicial = params.get("intencao");
  const [ativo, setAtivo] = useState<string>(
    intents.some((i) => i.id === inicial) ? (inicial as string) : "comprar-morar",
  );

  const intent = intents.find((i) => i.id === ativo)!;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
        Atendimento
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Como podemos ajudar?
      </h1>
      <p className="mt-4 max-w-xl text-[#a3a39c]">
        Escolha o assunto — assim sua mensagem chega direto à pessoa certa, sem
        fila errada.
      </p>

      <div className="mt-10 flex flex-wrap gap-3" role="tablist" aria-label="Assunto">
        {intents.map((i) => (
          <button
            key={i.id}
            role="tab"
            aria-selected={ativo === i.id}
            onClick={() => setAtivo(i.id)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
              ativo === i.id
                ? "border-[#3e7c5b] bg-[#3e7c5b]/15 text-[#7fb89a]"
                : "border-white/20 text-white/70 hover:border-white/50"
            }`}
          >
            {i.titulo}
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">{intent.titulo}</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#a3a39c]">
            {intent.texto}
          </p>

          {ativo === "cliente" ? (
            <p className="mt-6 text-sm text-[#a3a39c]">
              Para solicitações de assistência técnica e documentos, acesse a{" "}
              <Link href="/clientes" className="text-[#7fb89a] underline">
                área de clientes
              </Link>{" "}
              ou fale direto no WhatsApp.
            </p>
          ) : null}

          <div className="mt-7">
            <WhatsAppCta intencao={intent.titulo} posicao="atendimento">
              Conversar agora no WhatsApp
            </WhatsAppCta>
            <p className="mt-3 text-xs text-white/45">
              Você fala com a Laís, nossa atendente — resposta imediata, qualquer dia.
            </p>
          </div>

          <div className="mt-10 space-y-1 text-sm text-[#a3a39c]">
            <p>{site.endereco}</p>
            <p>
              <a href={`tel:+55${site.telefone.replace(/\D/g, "")}`} className="hover:text-[#7fb89a]">
                {site.telefone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${site.email}`} className="hover:text-[#7fb89a]">
                {site.email}
              </a>
            </p>
          </div>
        </div>

        <LeadForm key={ativo} intencaoInicial={ativo} />
      </div>
    </div>
  );
}
