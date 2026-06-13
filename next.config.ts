import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
