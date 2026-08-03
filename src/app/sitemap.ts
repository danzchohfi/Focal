import type { MetadataRoute } from "next";
import { projetos } from "@/data/projetos";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const estaticas = [
    "",
    "/sobre",
    "/parcerias-2",
    "/atendimento",
    "/politica-de-privacidade-e-seguranca",
    "/tour-virtual",
    "/download-folder-digital",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    priority: path === "" ? 1 : 0.7,
  }));

  const paginas = projetos.map((p) => ({
    url: `${site.url}/${p.slug}`,
    lastModified: new Date(),
    priority: 0.9,
  }));

  return [...estaticas, ...paginas];
}
