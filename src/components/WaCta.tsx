"use client";

import { track } from "@/lib/track";

// Âncora de WhatsApp com tracking de conversão (posição identificada).
export default function WaCta({
  href,
  posicao,
  className = "",
  children,
  ariaLabel,
}: {
  href: string;
  posicao: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() => track("clique_whatsapp", { posicao })}
    >
      {children}
    </a>
  );
}
