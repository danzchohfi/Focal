import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UtmTracker from "@/components/UtmTracker";
import { site } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nome} — ${site.slogan}`,
    template: `%s — ${site.nome}`,
  },
  description: site.descricao,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Focal Incorporadora e Desenvolvimento Imobiliário Ltda",
  alternateName: site.nome,
  url: site.url,
  telephone: site.telefone,
  email: site.email,
  foundingDate: "2016-03-24",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Diogo Moreira, 132 — 20º andar, cj. 2010",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    postalCode: "05423-010",
    addressCountry: "BR",
  },
  sameAs: [site.instagram, site.linkedin],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <UtmTracker />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
