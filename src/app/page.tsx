import Link from "next/link";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import Figure from "@/components/Figure";
import LeadForm from "@/components/LeadForm";
import ProvaBar from "@/components/ProvaBar";
import Reveal from "@/components/Reveal";
import StatusBadge from "@/components/StatusBadge";
import WhatsAppCta from "@/components/WhatsAppCta";
import { empreendimentos, publicados } from "@/data/empreendimentos";
import { site } from "@/lib/site";

const artur = publicados.find((e) => e.slug === "artur-73")!;

export default function Home() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative flex min-h-[78vh] items-center overflow-hidden">
        <div className="foto-placeholder absolute inset-0" aria-hidden />
        {/* TODO go-live: trocar placeholder por vídeo mudo (drone Pinheiros →
            fachada → decorado), com poster e preload=metadata */}
        <div className="relative mx-auto w-full max-w-6xl px-5 py-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
            Projetos que funcionam, em endereços que permanecem.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[#a3a39c]">{site.descricao}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#portfolio"
              className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#7fb89a]"
            >
              Conhecer os empreendimentos
            </Link>
            <WhatsAppCta posicao="hero" variant="outline">
              Falar com a Focal
            </WhatsAppCta>
          </div>
        </div>
      </section>

      {/* 2 — Prova institucional */}
      <section className="mx-auto w-full max-w-6xl px-5">
        <ProvaBar />
      </section>

      {/* 3 — Destaque do momento */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
            Em venda agora
          </p>
          <div className="mt-6 grid items-center gap-10 lg:grid-cols-2">
            <Figure
              src={artur.heroImage}
              alt={`${artur.nome} — living com pé-direito duplo`}
              aspect="aspect-[4/3]"
              priority
            />
            <div>
              <StatusBadge status={artur.status} entrega={artur.entrega} />
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                {artur.nome}
              </h2>
              <p className="mt-2 text-[#a3a39c]">{artur.endereco}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {artur.highlights.map((h) => (
                  <li key={h.label} className="border-l-2 border-[#3e7c5b] pl-3">
                    <span className="block text-xs uppercase tracking-wider text-white/45">
                      {h.label}
                    </span>
                    <span className="text-sm text-white/90">{h.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-lg">
                <span className="text-sm uppercase tracking-wider text-white/50">
                  a partir de{" "}
                </span>
                <strong className="text-[#7fb89a]">{artur.precoAPartir}</strong>
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <Link
                  href={`/empreendimentos/${artur.slug}`}
                  className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-[#7fb89a]"
                >
                  Ver o {artur.nome}
                </Link>
                <WhatsAppCta empreendimento={artur.nome} posicao="home-destaque" variant="outline">
                  WhatsApp sobre o {artur.nome}
                </WhatsAppCta>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 4 — Vitrine dos 5 */}
      <section id="portfolio" className="border-t border-white/10 bg-[#0d0d0d] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
                  Portfólio
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Cinco projetos, um critério.
                </h2>
              </div>
              <Link href="/empreendimentos" className="text-sm text-[#7fb89a] hover:text-white">
                Comparar todos →
              </Link>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {empreendimentos.map((e) => (
              <Reveal key={e.slug}>
                <EmpreendimentoCard e={e} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 — Porquê Focal */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
            Porquê Focal
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            Menos adjetivo, mais critério.
          </h2>
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

      {/* 6 — Como trabalhamos */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Como a Focal trabalha
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-8 md:grid-cols-4">
            {site.passos.map((passo, i) => (
              <Reveal key={passo.titulo} as="li">
                <span className="text-3xl font-bold text-[#3e7c5b]/60">{i + 1}</span>
                <h3 className="mt-2 font-semibold">{passo.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#a3a39c]">
                  {passo.texto}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 — Tese de investimento (NR) */}
      {artur.investimento ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <Reveal className="grid items-center gap-10 rounded-sm border border-white/10 bg-[#0d0d0d] p-8 md:grid-cols-[2fr_1fr] md:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
                Para investir
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                {artur.investimento.titulo}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#a3a39c]">
                {artur.investimento.texto}
              </p>
              <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                {artur.investimento.dados.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs uppercase tracking-wider text-white/45">
                      {d.label}
                    </dt>
                    <dd className="text-lg font-bold text-[#7fb89a]">{d.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="md:text-right">
              <WhatsAppCta
                empreendimento={artur.nome}
                intencao="investimento"
                posicao="home-investir"
              >
                Falar sobre investimento
              </WhatsAppCta>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 8 — Parcerias / terreno */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Reveal className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Terrenos espetaculares são o início de tudo.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-[#a3a39c]">
                Tem um terreno em bairro consolidado de São Paulo? Nosso processo
                de descoberta estratégica começa com uma conversa.
              </p>
            </div>
            <Link
              href="/atendimento?intencao=terreno"
              className="inline-flex items-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-[#7fb89a] hover:text-[#7fb89a]"
            >
              Apresentar um terreno
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 9 — Atendimento */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Fale com a Focal</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a3a39c]">
              No WhatsApp você fala agora com a Laís, nossa atendente — resposta
              imediata, qualquer dia. Pelo formulário, nossa equipe responde em
              até 24h úteis.
            </p>
            <div className="mt-7">
              <WhatsAppCta posicao="home-atendimento">
                Conversar no WhatsApp
              </WhatsAppCta>
            </div>
          </Reveal>
          <Reveal>
            <LeadForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
