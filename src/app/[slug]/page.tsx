import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import TrackView from "@/components/TrackView";
import { getExperiment, splitterScript } from "@/lib/ab";
import { getProjeto, projetos } from "@/data/projetos";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function generateStaticParams() {
  return projetos.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjeto(slug);
  if (!p) return {};
  return {
    title: p.nome,
    description: p.heroSub,
  };
}

export default async function ProjetoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projeto = getProjeto(slug);
  if (!projeto) notFound();

  // /artur-73 é a página de entrada do teste A/B (variante A): o splitter
  // roda antes do paint e redireciona quem for sorteado para a variante B.
  const exp = getExperiment("artur73_lp");
  const emTeste = exp && exp.entryPath === `/${slug}`;

  return (
    <>
      {emTeste && (
        <>
          <script dangerouslySetInnerHTML={{ __html: splitterScript(exp, BASE_PATH, "a") }} />
          <TrackView experiment={exp.id} variant="a" />
        </>
      )}
      <ProjectPageTemplate projeto={projeto} />
    </>
  );
}
