"use client";

import { useEffect, useState } from "react";
import { site, waLink } from "@/lib/site";
import { track } from "@/lib/track";

// Botão flutuante de WhatsApp (equivalente ao Joinchat do site atual).
export default function WhatsAppWidget() {
  const [bubble, setBubble] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBubble(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="wa-widget fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {bubble && !dismissed && (
        <div className="wa-bubble relative rounded-2xl bg-white px-4 py-2 shadow-lg">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setDismissed(true)}
            className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[9px] text-white"
          >
            ✕
          </button>
          <span className="text-[14px]">Olá 👋</span>
        </div>
      )}
      <a
        href={waLink(site.whatsapp)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("clique_whatsapp", { posicao: "widget" })}
        aria-label="Abrir bate-papo no WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] shadow-lg transition-transform hover:scale-105"
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden>
          <path d="M3.5 3.5c4.7-4.7 12.3-4.7 17 0a12 12 0 0 1-13.8 19.3l-5.8.7a.4.4 0 0 1-.4-.4l.7-5.8A12 12 0 0 1 3.5 3.5zm3.6 17 .3.2a9.8 9.8 0 1 0-3.5-3.5l.2.3-.5 3.9a.2.2 0 0 0 .2.2l3.3-.5zm6.5-7-.9 1.2a9.8 9.8 0 0 1-3.5-3.5l1.2-.9a.8.8 0 0 0 .2-.9l-1.3-2.9a.8.8 0 0 0-.9-.4l-2 .5a.8.8 0 0 0-.6.9A11.8 11.8 0 0 0 15.8 17.5a.8.8 0 0 0 .9-.6l.5-2a.8.8 0 0 0-.4-.9l-2.9-1.3a.8.8 0 0 0-.9.2z" />
        </svg>
      </a>
    </div>
  );
}
