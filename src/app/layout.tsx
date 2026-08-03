import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { site } from "@/lib/site";
import "./globals.css";

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
        {/* Gate de motion: sem JS nada fica invisível (reveals só ativam com .js) */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
