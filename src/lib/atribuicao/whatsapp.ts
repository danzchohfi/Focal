"use client";

// Ligação dos CTAs de WhatsApp com a atribuição (lado do cliente).

import { useMemo, useSyncExternalStore } from "react";
import { assinaAtribuicao, refSnapshot } from "./captura";
import { registraEvento } from "./eventos";
import { comCodigo, paraRedirecionador } from "./mensagem";

export { linhaCodigo, comCodigo, linkRedirecionado, paraRedirecionador } from "./mensagem";

const SEM_CODIGO = () => "";

/**
 * Com `NEXT_PUBLIC_WHATSAPP_REDIRECT=1` os CTAs passam por /ir/whatsapp, que
 * grava o clique no servidor antes de redirecionar. Custa um salto a mais e
 * exige servidor, mas não depende de `sendBeacon` sobreviver à navegação.
 */
const VIA_REDIRECIONADOR = process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT === "1";

/**
 * Devolve o href já com o código.
 *
 * O servidor não conhece o visitante, então o HTML sai com o link puro e o
 * código entra assim que a captura roda no cliente — o link nunca fica
 * quebrado, mesmo se o JS falhar. `useSyncExternalStore` é o que torna essa
 * diferença servidor/cliente segura na hidratação.
 */
export function useHrefWhatsApp(
  href: string,
  extras: { posicao?: string; contexto?: string } = {}
) {
  const ref = useSyncExternalStore(assinaAtribuicao, refSnapshot, SEM_CODIGO);
  const { posicao, contexto } = extras;
  return useMemo(() => {
    if (VIA_REDIRECIONADOR) return paraRedirecionador(href, { posicao, contexto });
    return comCodigo(href, ref || undefined);
  }, [href, ref, posicao, contexto]);
}

/** Handler padrão do clique: registra o evento antes de o navegador sair. */
export function aoClicarWhatsApp(extras: { contexto?: string; posicao?: string } = {}) {
  registraEvento("whatsapp", extras);
}
