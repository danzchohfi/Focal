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
    // Higiene de migração do WordPress antigo (docs/plano-site-focal.md §3)
    return [
      { source: "/artur-73", destination: "/empreendimentos/artur-73", permanent: true },
      { source: "/page_category/empreendimentos", destination: "/empreendimentos", permanent: true },
      { source: "/page_category/:path*", destination: "/empreendimentos", permanent: true },
      { source: "/portfolio", destination: "/empreendimentos", permanent: true },
      { source: "/portfolio/:path*", destination: "/empreendimentos", permanent: true },
      { source: "/shop", destination: "/empreendimentos", permanent: true },
      { source: "/shop/:path*", destination: "/empreendimentos", permanent: true },
      {
        source: "/politica-de-privacidade-e-seguranca",
        destination: "/privacidade",
        permanent: true,
      },
    ];
  },
};

export default isExport ? exportConfig : serverConfig;
