"use client";

import { track, whatsappHref } from "@/lib/tracking";

/**
 * Barra de conversão fixa no mobile — tráfego de mídia chega
 * majoritariamente por celular e precisa de CTA sempre visível.
 */
export default function StickyCta({
  empreendimento,
  precoAPartir,
}: {
  empreendimento: string;
  precoAPartir?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0a0a0a]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <div className="flex items-center gap-3">
        {precoAPartir ? (
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-white/45">
              a partir de
            </p>
            <p className="truncate text-sm font-bold text-[#7fb89a]">{precoAPartir}</p>
          </div>
        ) : null}
        <a
          href="#plantas"
          className="ml-auto shrink-0 rounded-full border border-white/30 px-4 py-2.5 text-xs font-semibold text-white"
        >
          Plantas
        </a>
        <a
          href={whatsappHref({ empreendimento })}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track("clique_whatsapp", { empreendimento, posicao: "sticky-mobile" })
          }
          className="shrink-0 rounded-full bg-[#3e7c5b] px-5 py-2.5 text-xs font-semibold text-white"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
