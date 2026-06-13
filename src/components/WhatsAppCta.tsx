"use client";

import { track, whatsappHref } from "@/lib/tracking";

export default function WhatsAppCta({
  empreendimento,
  tipologia,
  intencao,
  posicao,
  children,
  variant = "solid",
  className = "",
}: {
  empreendimento?: string;
  tipologia?: string;
  intencao?: string;
  posicao: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-colors";
  const styles = {
    solid: "bg-[#3e7c5b] text-white hover:bg-[#356b4e]",
    outline:
      "border border-white/30 text-white hover:border-[#7fb89a] hover:text-[#7fb89a]",
    ghost: "text-[#7fb89a] hover:text-white",
  } as const;

  return (
    <a
      href={whatsappHref({ empreendimento, tipologia, intencao })}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles[variant]} ${className}`}
      onClick={() =>
        track("clique_whatsapp", {
          empreendimento,
          tipologia,
          intencao,
          posicao,
        })
      }
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4.1.2.1.7-.1 1.2Z" />
      </svg>
      {children}
    </a>
  );
}
