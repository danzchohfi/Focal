import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

// Material atrás do portão de acesso (2026-09-09): nada entra em buscador
// enquanto estiver assim. Pra reabrir, volte a regra de allow abaixo e tire
// o `robots` do metadata em app/layout.tsx.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
