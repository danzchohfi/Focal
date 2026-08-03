// Tracking de conversão: empurra eventos para o dataLayer (GTM) e para o
// gtag (GA4) quando presentes. As variantes de A/B ativas são anexadas
// automaticamente a todo evento.

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    __ab?: Record<string, string>;
  }
}

function variantes(): Params {
  if (typeof window === "undefined") return {};
  const out: Params = {};
  const ab = window.__ab ?? {};
  for (const [exp, v] of Object.entries(ab)) out[`ab_${exp}`] = v;
  // fallback: lê do storage caso o splitter não tenha rodado nesta página
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith("ab_") && out[k] === undefined) out[k] = localStorage.getItem(k)!;
    }
  } catch {
    /* storage indisponível */
  }
  return out;
}

export function track(event: string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const payload = {
    event,
    page: window.location.pathname,
    ...variantes(),
    ...params,
  };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
  if (typeof window.gtag === "function") {
    const rest: Params = { ...payload };
    delete rest.event;
    window.gtag("event", event, rest);
  }
  if (process.env.NODE_ENV !== "production") {
    console.debug("[track]", payload);
  }
}
