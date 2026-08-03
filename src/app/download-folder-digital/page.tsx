import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { asset } from "@/lib/asset";

export const metadata: Metadata = { title: "Download do Folder Digital" };

// Página escura simples com CTA para download do folder do Artur 73.
export default function DownloadFolderPage() {
  return (
    <>
      <div className="relative flex min-h-svh flex-col bg-[#1c1c1c]">
        <SiteHeader tone="claro" fixed={false} />
        <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Reveal>
            <h1 className="din h-hero text-white">Download do Folder Digital</h1>
            <p className="mt-8 text-[17px] text-white md:text-[18px]">
              Para realizar o download do folder digital, clique no botão abaixo.
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href={asset("/wp/07.-ANEXO-FOLDER.pdf")}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/25 bg-ink-2 px-10 py-4 text-[12px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-ink"
              >
                Download Folder Digital
              </a>
            </div>
          </Reveal>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
