"use client";

// Registro server-side dos eventos de atribuição.
//
// O ponto crítico do funil é o WhatsApp: o visitante sai do site levando só o
// código curto na mensagem. Quando a Laís devolve esse código para o CVCRM e a
// venda acontece meses depois, o código precisa encontrar do lado de cá um
// registro com a campanha, o grupo e o anúncio de origem. Por isso todo
// código que "viaja" é registrado no servidor ANTES de sair do site.

import { obtemAtribuicao, capturaAtribuicao } from "./captura";
import type { Atribuicao } from "./tipos";

export type TipoEventoAtribuicao =
  /** Chegada ao site com origem identificada. */
  | "toque"
  /** Clique num CTA de WhatsApp (o código acabou de sair do site). */
  | "whatsapp"
  /** Envio de formulário. */
  | "formulario";

export type EventoAtribuicao = {
  tipo: TipoEventoAtribuicao;
  ts: string;
  ref: string;
  atribuicao: Atribuicao;
  /** Empreendimento/contexto (ex.: "artur-73"). */
  contexto?: string;
  /** Posição do CTA na página (hero, planta, widget…). */
  posicao?: string;
  pagina?: string;
};

const ROTA = "/api/atribuicao";
/** Marcador de deduplicação por sessão, para não repetir o mesmo toque. */
const CHAVE_ENVIADOS = "fcl_atr_enviados";

function jaEnviado(chave: string) {
  try {
    const bruto = sessionStorage.getItem(CHAVE_ENVIADOS);
    const lista = bruto ? (JSON.parse(bruto) as string[]) : [];
    if (lista.includes(chave)) return true;
    lista.push(chave);
    sessionStorage.setItem(CHAVE_ENVIADOS, JSON.stringify(lista.slice(-50)));
    return false;
  } catch {
    return false;
  }
}

/**
 * Envia o evento para o servidor. Usa `sendBeacon` quando disponível: o clique
 * no WhatsApp navega para fora e um `fetch` normal seria cancelado no meio.
 */
export function registraEvento(
  tipo: TipoEventoAtribuicao,
  extras: { contexto?: string; posicao?: string; deduplicarPor?: string } = {}
) {
  if (typeof window === "undefined") return;
  const atribuicao = obtemAtribuicao() ?? capturaAtribuicao();
  if (!atribuicao) return;

  if (extras.deduplicarPor && jaEnviado(`${tipo}:${extras.deduplicarPor}`)) return;

  const evento: EventoAtribuicao = {
    tipo,
    ts: new Date().toISOString(),
    ref: atribuicao.ref,
    atribuicao,
    contexto: extras.contexto,
    posicao: extras.posicao,
    pagina: window.location.pathname,
  };
  const corpo = JSON.stringify(evento);

  try {
    if (navigator.sendBeacon) {
      const enviado = navigator.sendBeacon(ROTA, new Blob([corpo], { type: "application/json" }));
      if (enviado) return;
    }
  } catch {
    /* sendBeacon indisponível ou bloqueado */
  }
  void fetch(ROTA, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: corpo,
    keepalive: true,
  }).catch(() => {
    /* sem servidor (export estático) — o cookie mantém a atribuição */
  });
}
