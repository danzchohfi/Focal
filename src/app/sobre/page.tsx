import type { Metadata } from "next";
import Link from "next/link";
import ProvaBar from "@/components/ProvaBar";
import Reveal from "@/components/Reveal";
import WhatsAppCta from "@/components/WhatsAppCta";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Incorporadora paulistana fundada em 2016: terrenos escolhidos a dedo, arquitetura intencional e preço calibrado ao mercado.",
};

export default function SobrePage() {
  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
          Sobre a Focal
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
          Focar naquilo que importa.
        </h1>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <p className="text-lg leading-relaxed text-white/85">
            A Focal nasceu em 2016 para ocupar uma lacuna: incorporar com visão de
            arquitetura, fora da linha de produção. Cada projeto começa com a
            mesma pergunta — <em>“eu moraria aqui?”</em> — e com um terreno
            escolhido a dedo em bairros consolidados de São Paulo.
          </p>
          <p className="text-base leading-relaxed text-[#a3a39c]">
            Compramos terrenos espetaculares e vendemos dentro do preço de
            mercado. O resultado são projetos que funcionam no dia a dia — luz,
            ventilação, plantas que envelhecem bem — em endereços que permanecem
            valiosos.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5">
        <ProvaBar />
      </section>

      {/* Pilares */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight">No que acreditamos</h2>
        </Reveal>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {site.pilares.map((p, i) => (
            <Reveal key={p.titulo}>
              <span className="text-sm font-semibold text-[#3e7c5b]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl font-bold">{p.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#a3a39c]">{p.texto}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Processo */}
      <section id="processo" className="border-t border-white/10 bg-[#0d0d0d] py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Os 4 passos da Focal</h2>
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {site.passos.map((passo, i) => (
              <Reveal key={passo.titulo} as="li">
                <span className="text-3xl font-bold text-[#3e7c5b]/60">{i + 1}</span>
                <h3 className="mt-2 font-semibold">{passo.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a3a39c]">{passo.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Quem faz */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight">Quem faz</h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="border-l-2 border-[#3e7c5b] pl-5">
              <h3 className="text-lg font-bold">Ricardo Birger</h3>
              <p className="mt-1 text-sm text-[#7fb89a]">Sócio · Arquitetura</p>
              <p className="mt-3 text-sm leading-relaxed text-[#a3a39c]">
                Arquiteto e sócio da JBA — Jonas Birger Arquitetura, responsável
                pela visão de projeto que define a Focal: plantas funcionais, luz
                natural e edifícios que envelhecem bem.
              </p>
            </div>
            <div className="border-l-2 border-[#3e7c5b] pl-5">
              <h3 className="text-lg font-bold">Antonio Bordon</h3>
              <p className="mt-1 text-sm text-[#7fb89a]">Sócio · Desenvolvimento</p>
              <p className="mt-3 text-sm leading-relaxed text-[#a3a39c]">
                Trajetória em desenvolvimento imobiliário e loteamentos, com o
                olhar de quem avalia terreno, bairro e produto antes de qualquer
                lançamento.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="border-t border-white/10 bg-[#0d0d0d] py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-5">
          <h2 className="text-2xl font-bold tracking-tight">
            Conheça o resultado desse processo.
          </h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/empreendimentos"
              className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#7fb89a]"
            >
              Ver empreendimentos
            </Link>
            <WhatsAppCta posicao="sobre" variant="outline">
              Falar com a Focal
            </WhatsAppCta>
          </div>
        </div>
      </section>
    </>
  );
}
