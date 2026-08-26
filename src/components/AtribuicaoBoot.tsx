"use client";

import { useEffect } from "react";
import { atribuicaoParaEventos, capturaAtribuicao, obtemAtribuicao } from "@/lib/atribuicao/captura";
import { registraEvento } from "@/lib/atribuicao/eventos";
import { toqueTemOrigem } from "@/lib/atribuicao/captura";

/**
 * Liga a captura de atribuição em todas as páginas.
 *
 * Roda no cliente logo após a hidratação: consolida o toque atual no cookie
 * first-party, publica os parâmetros de origem no dataLayer/GA4 (para que todo
 * evento subsequente já saia etiquetado) e registra no servidor os toques que
 * vieram de campanha.
 */
export default function AtribuicaoBoot() {
  useEffect(() => {
    const atribuicao = capturaAtribuicao() ?? obtemAtribuicao();
    if (!atribuicao) return;

    const plano = atribuicaoParaEventos(atribuicao);
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: "atribuicao", ...plano });
    // user_properties do GA4: permite segmentar relatório por lead_ref/canal.
    window.gtag?.("set", "user_properties", {
      lead_ref: atribuicao.ref,
      canal_primeiro: atribuicao.primeiro.canal,
    });

    if (toqueTemOrigem(atribuicao.ultimo)) {
      registraEvento("toque", {
        deduplicarPor: `${atribuicao.ultimo.ts}|${atribuicao.ultimo.lp}`,
      });
    }
  }, []);

  return null;
}
