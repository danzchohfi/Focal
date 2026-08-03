import type { NextConfig } from "next";

// Modo estático para GitHub Pages (deploy temporário): sem servidor,
// imagens sem otimização e basePath do projeto (/Focal).
const isExport = process.env.STATIC_EXPORT === "1";

const exportConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
};

const serverConfig: NextConfig = {
  async redirects() {
    // Higiene de migração: URLs residuais do WordPress e da iteração anterior.
    return [
      { source: "/parcerias", destination: "/parcerias-2", permanent: true },
      { source: "/privacidade", destination: "/politica-de-privacidade-e-seguranca", permanent: true },
      { source: "/empreendimentos", destination: "/#empreendimentos", permanent: true },
      { source: "/empreendimentos/:slug", destination: "/:slug", permanent: true },
      { source: "/page_category/:path*", destination: "/#empreendimentos", permanent: true },
      { source: "/portfolio/:path*", destination: "/#empreendimentos", permanent: true },
      { source: "/shop", destination: "/", permanent: true },
      { source: "/shop/:path*", destination: "/", permanent: true },
    ];
  },
};

export default isExport ? exportConfig : serverConfig;
