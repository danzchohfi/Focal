import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Faq from "@/components/Faq";
import Figure from "@/components/Figure";
import Galeria from "@/components/Galeria";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import StatusBadge from "@/components/StatusBadge";
import Tipologias from "@/components/Tipologias";
import WhatsAppCta from "@/components/WhatsAppCta";
import { porSlug, publicados } from "@/data/empreendimentos";
import { site } from "@/lib/site";
import { emVenda, statusLabel } from "@/lib/types";

export function generateStaticParams() {
  return publicados.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = porSlug(slug);
  if (!e) return {};
  return {
    title: `${e.nome} — ${e.bairro}`,
    description: e.resumo30s[0],
    openGraph: {
      title: `${e.nome} — ${e.bairro} | ${statusLabel[e.status]}`,
      description: e.resumo30s.slice(0, 2).join(" "),
    },
  };
}

export default async function EmpreendimentoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const e = porSlug(slug);
  if (!e) notFound();

  const venda = emVenda(e.status);
  const outros = publicados.filter((o) => o.slug !== e.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        name: e.nome,
        url: `${site.url}/empreendimentos/${e.slug}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: e.endereco,
          addressLocality: "São Paulo",
          addressRegion: "SP",
          addressCountry: "BR",
        },
        ...(e.arquitetura ? { provider: { "@type": "Organization", name: e.arquitetura } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Empreendimentos", item: `${site.url}/empreendimentos` },
          { "@type": "ListItem", position: 3, name: e.nome },
        ],
      },
      ...(e.faq.length > 0
        ? [{
            "@type": "FAQPage",
            mainEntity: e.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1 — Hero */}
      <section className="relative overflow-hidden">
        <div className="foto-placeholder absolute inset-0" aria-hidden />
        {/* TODO go-live: vídeo (em obra/lançamento) ou foto definitiva (entregue) */}
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-12 pt-24 md:pt-32">
          <nav aria-label="Breadcrumb" className="text-xs text-white/50">
            <Link href="/empreendimentos" className="hover:text-[#7fb89a]">
              Empreendimentos
            </Link>{" "}
            / {e.nome}
          </nav>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={e.status} entrega={e.entrega} />
            {e.arquitetura ? (
              <span className="text-xs uppercase tracking-wider text-white/50">
                Arquitetura {e.arquitetura}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-5xl font-bold tracking-tight md:text-6xl">{e.nome}</h1>
          <p className="mt-3 max-w-xl text-[#a3a39c]">{e.endereco}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <WhatsAppCta empreendimento={e.nome} posicao="hero">
              {venda ? `Falar sobre o ${e.nome}` : "Quero um projeto assim"}
            </WhatsAppCta>
            {e.tipologias.length > 0 ? (
              <a
                href="#plantas"
                className="inline-flex items-center rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-[#7fb89a] hover:text-[#7fb89a]"
              >
                Ver plantas
              </a>
            ) : null}
          </div>
        </div>

        {/* Barra de highlights */}
        <div className="relative border-y border-white/10 bg-[#0a0a0a]/90">
          <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-5 py-6 md:grid-cols-5">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/45">Metragem</dt>
              <dd className="mt-1 text-sm font-semibold">
                {e.metragem.min}–{e.metragem.max} m²
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/45">Uso</dt>
              <dd className="mt-1 text-sm font-semibold">
                {e.usos.includes("nr") ? "Residencial + NR" : "Residencial"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/45">Status</dt>
              <dd className="mt-1 text-sm font-semibold">
                {statusLabel[e.status]}
                {e.entrega && venda ? ` · ${e.entrega}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/45">Bairro</dt>
              <dd className="mt-1 text-sm font-semibold">{e.bairro}</dd>
            </div>
            {venda && e.precoAPartir ? (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/45">A partir de</dt>
                <dd className="mt-1 text-sm font-semibold text-[#7fb89a]">{e.precoAPartir}</dd>
              </div>
            ) : (
              <div>
                <dt className="text-xs uppercase tracking-wider text-white/45">Situação</dt>
                <dd className="mt-1 text-sm font-semibold text-white/70">100% vendido</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* 2 — O projeto em 30 segundos */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7fb89a]">
            O projeto em 30 segundos
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {e.resumo30s.map((item) => (
              <li
                key={item}
                className="border-l-2 border-[#3e7c5b] pl-4 text-base leading-relaxed text-white/90"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* 3 — Galeria editorial */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-16">
        <div className="mx-auto w-full max-w-6xl px-5">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Galeria</h2>
            <div className="mt-8">
              <Galeria itens={e.galeria} empreendimento={e.nome} />
            </div>
          </Reveal>
          {e.tourVirtual ? (
            <p className="mt-8">
              <a
                href={e.tourVirtual}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7fb89a] underline hover:text-white"
              >
                Fazer o tour virtual →
              </a>
            </p>
          ) : null}
        </div>
      </section>

      {/* 4 — Diferenciais arquitetônicos */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight">Diferenciais do projeto</h2>
        </Reveal>
        <div className="mt-10 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {e.diferenciais.map((d) => (
            <Reveal key={d.titulo}>
              <Figure src={d.imagem} alt={d.titulo} aspect="aspect-[16/10]" />
              <h3 className="mt-4 text-xl font-bold">{d.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a3a39c]">{d.texto}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5 — Plantas e unidades */}
      {e.tipologias.length > 0 ? (
        <section id="plantas" className="border-t border-white/10 bg-[#0d0d0d] py-16">
          <div className="mx-auto w-full max-w-6xl px-5">
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight">Plantas e unidades</h2>
              <div className="mt-8">
                <Tipologias
                  tipologias={e.tipologias}
                  empreendimento={e.nome}
                  emVenda={venda}
                />
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* 6 — Localização e entorno */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <Reveal className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Localização e entorno</h2>
            <p className="mt-3 text-[#a3a39c]">{e.endereco}</p>
            <ul className="mt-8 space-y-4">
              {e.entorno.map((p) => (
                <li key={p.nome} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                  <span className="text-sm text-white/90">{p.nome}</span>
                  <span className="shrink-0 text-sm text-[#7fb89a]">{p.distancia}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Mapa carregado sob demanda no go-live (facade p/ performance) */}
          <Figure
            alt={`Mapa — ${e.nome} em ${e.bairro}`}
            legenda={`${e.bairro}, São Paulo`}
            aspect="aspect-square"
          />
        </Reveal>
      </section>

      {/* 7 — Tese de investimento */}
      {venda && e.investimento ? (
        <section className="mx-auto w-full max-w-6xl px-5 pb-16">
          <Reveal className="rounded-sm border border-[#3e7c5b]/40 bg-[#3e7c5b]/10 p-8 md:p-10">
            <h2 className="text-2xl font-bold tracking-tight">{e.investimento.titulo}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#a3a39c]">
              {e.investimento.texto}
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
              {e.investimento.dados.map((d) => (
                <div key={d.label}>
                  <dt className="text-xs uppercase tracking-wider text-white/45">{d.label}</dt>
                  <dd className="text-lg font-bold text-[#7fb89a]">{d.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <WhatsAppCta empreendimento={e.nome} intencao="investimento" posicao="investimento">
                Falar sobre investimento
              </WhatsAppCta>
            </div>
          </Reveal>
        </section>
      ) : null}

      {/* 8 — Atendimento contextual */}
      <section className="border-t border-white/10 bg-[#0d0d0d] py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">
              {venda ? `Interessou? Fale sobre o ${e.nome}.` : `Quer um projeto como o ${e.nome}?`}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#a3a39c]">
              No WhatsApp você fala agora com a Laís, nossa atendente — resposta
              imediata. Pelo formulário, a equipe responde em até 24h úteis.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <WhatsAppCta empreendimento={e.nome} posicao="rodape-produto">
                {venda ? "Agendar visita / tirar dúvidas" : "Conhecer o projeto em venda"}
              </WhatsAppCta>
            </div>
          </Reveal>
          <Reveal>
            <LeadForm empreendimento={e.nome} />
          </Reveal>
        </div>
      </section>

      {/* 9 — FAQ e documentos */}
      {e.faq.length > 0 || e.documentos.length > 0 ? (
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight">Dúvidas frequentes</h2>
            <div className="mt-8">
              <Faq items={e.faq} />
            </div>
            {e.documentos.length > 0 ? (
              <div className="mt-10">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
                  Documentos
                </h3>
                <ul className="mt-4 space-y-2">
                  {e.documentos.map((doc) => (
                    <li key={doc.href}>
                      <a href={doc.href} className="text-[#7fb89a] underline hover:text-white">
                        {doc.nome} (PDF)
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </section>
      ) : null}

      {/* 10 — Outros projetos */}
      {outros.length > 0 ? (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto w-full max-w-6xl px-5">
            <h2 className="text-xl font-bold tracking-tight">Outros projetos Focal</h2>
            <ul className="mt-6 flex flex-wrap gap-4">
              {outros.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/empreendimentos/${o.slug}`}
                    className="text-[#7fb89a] hover:text-white"
                  >
                    {o.nome} — {o.bairro} →
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/empreendimentos" className="text-white/60 hover:text-white">
                  Ver portfólio completo →
                </Link>
              </li>
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
