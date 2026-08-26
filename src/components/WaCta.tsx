"use client";

import { track } from "@/lib/track";
import { aoClicarWhatsApp, useHrefWhatsApp } from "@/lib/atribuicao/whatsapp";

// Âncora de WhatsApp com tracking de conversão (posição identificada) e o
// código de atribuição embutido na mensagem pré-preenchida.
export default function WaCta({
  href,
  posicao,
  contexto,
  className = "",
  children,
  ariaLabel,
}: {
  href: string;
  posicao: string;
  contexto?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const hrefFinal = useHrefWhatsApp(href, { posicao, contexto });
  return (
    <a
      href={hrefFinal}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => {
        track("clique_whatsapp", { posicao, contexto });
        aoClicarWhatsApp({ posicao, contexto });
      }}
    >
      {children}
    </a>
  );
}
