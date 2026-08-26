import type { NextConfig } from "next";

// Modo estático para GitHub Pages (deploy temporário): sem servidor,
// imagens sem otimização e basePath do projeto (/Focal).
const isExport = process.env.STATIC_EXPORT === "1";

// Rotas que só existem com servidor (recepção de lead, registro de
// atribuição, redirecionador de WhatsApp, webhook do CVCRM) usam o sufixo
// `.server.ts`. No build estático essa extensão não entra em `pageExtensions`,
// então essas rotas simplesmente não são geradas em vez de quebrar o export.
const extensoesServidor = ["server.ts", "server.tsx"];
const extensoesBase = ["tsx", "ts", "jsx", "js"];

const exportConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: extensoesBase,
};

const serverConfig: NextConfig = {
  pageExtensions: [...extensoesServidor, ...extensoesBase],
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
