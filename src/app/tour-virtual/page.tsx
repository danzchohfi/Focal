import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Tour virtual" };

// Página escura simples com CTA para o tour virtual do Artur 73.
export default function TourVirtualPage() {
  return (
    <>
      <div className="relative flex min-h-svh flex-col bg-[#1c1c1c]">
        <SiteHeader tone="claro" fixed={false} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <h1 className="din h-hero text-white">Tour Virtual</h1>
            <p className="mt-8 text-[17px] text-white md:text-[18px]">
              Para acessar o tour virtual, clique no botão abaixo.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href="https://estudiorgb.com.br/3d/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/25 bg-ink-2 px-10 py-4 text-[12px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-ink"
              >
                Acessar Tour Virtual
              </a>
            </div>
          </Reveal>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
