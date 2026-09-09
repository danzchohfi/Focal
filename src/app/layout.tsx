import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import PortaoAcesso from "@/components/PortaoAcesso";
import { site } from "@/lib/site";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `Home - ${site.nome}`,
    template: `%s - ${site.nome}`,
  },
  description: site.descricao,
  // Enquanto o material está atrás do portão, fora dos buscadores: o HTML é
  // pré-renderizado, então sem isto o Google indexaria o conteúdo gateado.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${openSans.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        {/* Gate de motion + dataLayer para tracking/A-B */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');window.dataLayer=window.dataLayer||[];",
          }}
        />
        {/* Portão de acesso: nada do site monta sem a senha da equipe —
            inclusive o widget de WhatsApp, que não pode ficar flutuando
            sozinho sobre a tela de senha. */}
        <PortaoAcesso>
          {children}
          <WhatsAppWidget />
        </PortaoAcesso>
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
