"use client";

import { site } from "@/lib/site";

type EventParams = Record<string, string | number | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

const STORAGE_KEY = "focal_origem";

/** Persiste UTMs/click-ids da primeira visita da sessão. */
export function captureOrigem() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const v = params.get(key);
      if (v) found[key] = v;
    }
    if (Object.keys(found).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    }
  } catch {
    // storage indisponível — segue sem origem
  }
}

export function getOrigem(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

/** Dispara evento para GA4 (gtag) e dataLayer (GTM), com origem anexada. */
export function track(event: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  const payload = { ...getOrigem(), ...params };
  window.gtag?.("event", event, payload);
  window.dataLayer?.push({ event, ...payload });
}

/** Monta o deep link de WhatsApp com mensagem contextual e palavra-chave de origem. */
export function whatsappHref(opts: {
  empreendimento?: string;
  tipologia?: string;
  intencao?: string;
}) {
  const partes = ["Olá! Vim pelo site da Focal"];
  if (opts.empreendimento) partes.push(`e quero saber mais sobre o ${opts.empreendimento}`);
  if (opts.tipologia) partes.push(`(${opts.tipologia})`);
  if (opts.intencao && !opts.empreendimento) partes.push(`— assunto: ${opts.intencao}`);
  const origem = getOrigem();
  const sufixo = origem.utm_campaign ? ` [${origem.utm_campaign}]` : "";
  const texto = `${partes.join(" ")}.${sufixo}`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(texto)}`;
}
