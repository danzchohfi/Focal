import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import SiteHeader from "@/components/SiteHeader";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "Sobre" };

// Página Sobre: split 50/50 — imagem à esquerda, painel escuro com o
// manifesto à direita (como no site atual).
export default function SobrePage() {
  return (
    <main className="grid min-h-svh grid-cols-1 lg:grid-cols-2">
      <div className="relative min-h-[40svh] lg:min-h-svh">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${asset("/wp/e9782ff72e19a6f01b1def46620edd00.jpg")})` }}
          role="img"
          aria-label="Fachada de empreendimento Focal"
        />
        <Link href="/" className="absolute left-6 top-6 z-10 md:left-10 md:top-8" aria-label="Focal Inc — Home">
          <Logo tone="branco" className="h-7 w-auto md:h-8" />
        </Link>
      </div>
      <div className="relative flex flex-col bg-ink-2">
        <SiteHeader tone="claro" active="Sobre" fixed={false} showLogo={false} />
        <div className="flex flex-1 flex-col justify-center px-8 py-16 md:px-16">
          <Reveal>
            <h1 className="din h-hero text-white">Focal Inc</h1>
            <div className="mt-10 max-w-md space-y-5 text-[17px] leading-relaxed text-white md:text-[18px]">
              <p>
                Somos fascinados pela arquitetura pois acreditamos na sua capacidade de criar
                experiências singulares e nos inspirar a uma vida melhor.
              </p>
              <p>
                Por isso investimos em fachadas e plantas inovadoras, capazes de redefinir o espaço
                e surpreender nossos clientes com uma infinidade de detalhes.
              </p>
              <p>Focamos naquilo que realmente importa.</p>
              <p>Essa é a nossa essência. Somos a focal.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </main>
  );
}
