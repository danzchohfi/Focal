import type { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import WaCta from "@/components/WaCta";
import { asset } from "@/lib/asset";
import { site, waLink } from "@/lib/site";
import { projetos } from "@/data/projetos";

export const metadata: Metadata = { title: "Parcerias" };

const beneficios = [
  {
    label: "Ficha Técnica",
    icon: (
      <path d="M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 7h6M9 11h6M9 15h4" />
    ),
  },
  {
    label: "Imagens",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <circle cx="9" cy="10" r="1.6" />
        <path d="m5 18 5-5 3 3 3-3 3 3" />
      </>
    ),
  },
  {
    label: "Treinamentos",
    icon: <path d="m12 4 10 4-10 4L2 8l10-4zM6 10v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 8v6" />,
  },
  {
    label: "Tabela de Valores",
    icon: (
      <>
        <rect x="2" y="6" width="20" height="12" rx="1.5" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M5.5 9v.01M18.5 15v.01" />
      </>
    ),
  },
  {
    label: "Disponibilidade",
    icon: <path d="m4 12.5 5 5L20 6.5" />,
  },
];

// Página Parcerias: hero de imagem com card branco sobreposto, benefícios,
// CTA de cadastro via WhatsApp e vitrine dos empreendimentos.
export default function ParceriasPage() {
  return (
    <>
      <SiteHeader tone="claro" active="Parcerias" />
      <main>
        <div
          className="h-[46svh] min-h-[320px] bg-cover bg-center md:h-[60svh]"
          style={{ backgroundImage: `url(${asset("/wp/PISCINA-ROOFTOP.jpg")})` }}
          role="img"
          aria-label="Rooftop com piscina — empreendimento Focal"
        />
        <section className="relative z-10 mx-auto -mt-24 max-w-[1240px] bg-white px-6 pb-16 pt-14 md:px-14">
          <Reveal>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
              <h4
                className="din text-[16px] uppercase tracking-widest text-ink-2 md:border-r md:border-black/15 md:pr-8 md:text-[18px]"
                style={{ fontWeight: 400 }}
              >
                Parcerias
              </h4>
              <div>
                <h2 className="h-card text-ink-2" style={{ fontFamily: "var(--font-din)", fontWeight: 400 }}>
                  A Focal quer você como parceiro.
                </h2>
              </div>
            </div>
            <div className="mx-auto mt-10 max-w-2xl space-y-4 text-[17px] leading-relaxed text-ink-2 md:text-[18px]">
              <p>
                Somos uma empresa de dono e vamos lhe ajudar no que for preciso: apresentações,
                visitas e negociações com a diretoria.
              </p>
              <p>
                Cadastre-se e tenha nosso portfólio à sua disposição e conte conosco para fecharmos
                negócios juntos!
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-5">
              {beneficios.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-4 text-center">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-ink"
                    aria-hidden
                  >
                    {b.icon}
                  </svg>
                  <h3 className="din text-[16px] text-ink-2 md:text-[18px]" style={{ fontWeight: 400 }}>
                    {b.label}
                  </h3>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-14 flex justify-center">
              <WaCta
                href={waLink(
                  site.whatsappComercial,
                  "Olá *Focal Inc*! Preciso de mais informações sobre Parcerias"
                )}
                posicao="parcerias-cadastro"
                contexto="parcerias"
                className="flex items-center gap-3 bg-verde px-10 py-4 text-[15px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-85"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm10 10.2-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
                </svg>
                Cadastre-se
              </WaCta>
            </div>
          </Reveal>
        </section>

        {/* Vitrine dos 5 empreendimentos */}
        <section className="mx-auto max-w-[1400px] px-4 py-14 md:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {projetos.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProjectCard projeto={p} />
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
