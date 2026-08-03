import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectPageTemplate from "@/components/ProjectPageTemplate";
import { getProjeto, projetos } from "@/data/projetos";

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
  return <ProjectPageTemplate projeto={projeto} />;
}
