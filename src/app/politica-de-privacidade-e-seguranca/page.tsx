import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import blocos from "@/data/privacidade.json";

export const metadata: Metadata = { title: "Política de Privacidade e Segurança" };

type Bloco = { tag: string; text: string };

// Política de privacidade — texto integral do site atual (src/data/privacidade.json).
export default function PoliticaPage() {
  const conteudo = (blocos as Bloco[]).filter((b) => b.text.trim().length > 1);

  return (
    <>
      <div className="bg-white">
        <SiteHeader tone="escuro" fixed={false} />
        <main className="mx-auto max-w-[900px] px-6 pb-24 pt-10 md:pt-16">
          {conteudo.map((b, i) =>
            b.tag === "h1" ? (
              <Reveal key={i}>
                <h1 className="din h-card mb-10 text-ink-2">{b.text}</h1>
              </Reveal>
            ) : /^(h2|h3|h4)$/.test(b.tag) ? (
              <h2 key={i} className="din mb-3 mt-10 text-[20px] text-ink-2">
                {b.text}
              </h2>
            ) : b.tag === "li" ? (
              <li key={i} className="ml-5 list-disc text-[15px] leading-relaxed text-ink-2/90">
                {b.text}
              </li>
            ) : (
              <p key={i} className="mb-4 text-[15px] leading-relaxed text-ink-2/90">
                {b.text}
              </p>
            )
          )}
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
