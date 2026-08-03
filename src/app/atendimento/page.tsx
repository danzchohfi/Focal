import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import { asset } from "@/lib/asset";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Atendimento" };

// Página Atendimento: split 50/50 — fachada à esquerda, painel escuro com o
// formulário à direita (como no site atual).
export default function AtendimentoPage() {
  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <div className="relative min-h-[40svh] lg:min-h-svh">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${asset("/wp/FOC_MOURATO_FMC-AQ-CF_FACHADA1-Grande.jpeg")})`,
          }}
          role="img"
          aria-label="Fachada do Mourato 111"
        />
        <Link href="/" className="absolute left-6 top-6 z-10 md:left-10 md:top-8" aria-label="Focal Inc — Home">
          <Logo tone="branco" className="h-7 w-auto md:h-8" />
        </Link>
      </div>
      <div className="relative flex flex-col bg-ink-2">
        <SiteHeader tone="claro" active="Atendimento" fixed={false} showLogo={false} />
        <div className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16">
          <Reveal>
            <h1 className="din h-hero text-white">Atendimento</h1>
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-white md:text-[18px]">
              Quer comprar um apartamento, ser nosso fornecedor, investir conosco, vender um
              terreno, conhecer a nossa sede ou fazer parte do nosso time? Entre em contato.
            </p>
            <LeadForm variant="atendimento" tone="escuro" contexto="Atendimento" className="mt-8 max-w-md" />
            <p className="mt-8 text-[17px] text-white md:text-[18px]">
              {site.endereco.replace("20ª Andar", "20ª andar")} |{" "}
              <a href={site.telefoneHref} className="hover:opacity-70">
                {site.telefone}
              </a>{" "}
              |{" "}
              <a href={`mailto:${site.email}`} className="hover:opacity-70">
                {site.email}
              </a>
            </p>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
