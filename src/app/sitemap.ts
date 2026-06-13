import type { MetadataRoute } from "next";
import { publicados } from "@/data/empreendimentos";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const estaticas = [
    "",
    "/empreendimentos",
    "/sobre",
    "/parcerias",
    "/atendimento",
    "/clientes",
    "/privacidade",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    priority: path === "" ? 1 : 0.7,
  }));

  const produtos = publicados.map((e) => ({
    url: `${site.url}/empreendimentos/${e.slug}`,
    lastModified: new Date(),
    priority: 0.9,
  }));

  return [...estaticas, ...produtos];
}
