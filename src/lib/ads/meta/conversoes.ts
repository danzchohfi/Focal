// Envio de conversões para a Meta (Conversions API).
//
// A verdade desconfortável, que precisa estar escrita no relatório do cliente:
// a Meta decide a atribuição pelo INTERVALO entre o clique e o `event_time` —
// não pelo momento do upload. A janela máxima hoje é 7 dias de clique (as
// janelas de 28 dias e de view foram removidas ao longo de 2026). Uma venda
// fechada 120 dias depois do clique é ACEITA pela API, mas NÃO aparece
// atribuída ao anúncio no Ads Manager. Nenhum ajuste de configuração muda
// isso.
//
// O que a Meta ainda faz de útil:
//   • otimizar entrega pelos eventos de meio de funil (QualifiedLead), que
//     cabem na janela e por isso são o alvo certo de otimização;
//   • receber a venda como sinal de valor (`physical_store`, até 62 dias);
//   • atribuir conversas de clique-para-WhatsApp pelo `ctwa_clid`.
//
// O ROAS real por campanha/grupo/anúncio sai do nosso warehouse.

import type { Etapa } from "@/lib/dados/tipos";
import type { ConversaoOffline, ResultadoEnvio } from "../tipos";
import { configMeta, VERSAO_GRAPH } from "./custos";

/** Teto de `event_time` no passado para eventos comuns. */
export const JANELA_PADRAO_DIAS = 7;

/**
 * Teto para eventos offline (`action_source: physical_store`).
 *
 * A doc põe as duas frases no mesmo parágrafo — "if any event_time in data is
 * greater than 7 days in the past, we return an error for the entire request"
 * e "for offline and physical store events... you should upload transactions
 * within 62 days" — sem dizer que a segunda dispensa a primeira. A leitura
 * conservadora é 7 dias por padrão; com o toggle "Allow Historical Conversion
 * Uploads" ligado no Events Manager, sobe para 90. Ligue
 * `META_JANELA_HISTORICA=1` só depois de confirmar o toggle na conta.
 */
export const JANELA_OFFLINE_DIAS = process.env.META_JANELA_HISTORICA === "1" ? 90 : 7;

/** Janela máxima de atribuição clique → conversão (otimização e web). */
export const JANELA_ATRIBUICAO_DIAS = 7;

/**
 * Janela de RELATÓRIO. O clique de 28 dias saiu da configuração de atribuição
 * do conjunto de anúncios, mas continua disponível na Insights API
 * (`action_attribution_windows=28d_click`) — é a janela mais longa que a Meta
 * ainda reporta.
 */
export const JANELA_RELATORIO_DIAS = 28;

/** A Meta aceita até 1.000 eventos por requisição. */
const LOTE = 1000;

/** Nomes de evento da Meta por etapa do funil. */
const EVENTO_POR_ETAPA: Partial<Record<Etapa, string>> = {
  lead: "Lead",
  qualificado: "QualifiedLead",
  visita: "Schedule",
  proposta: "InitiateCheckout",
  venda: "Purchase",
};

function dias(de: string, ate: string) {
  return (Date.parse(ate) - Date.parse(de)) / 86_400_000;
}

function conta(motivos: Record<string, number>, chave: string) {
  motivos[chave] = (motivos[chave] ?? 0) + 1;
}

export type OpcoesEnvioMeta = {
  /** Envia só para medição, sem alimentar a otimização de entrega. */
  apenasMedicao?: boolean;
  /** Código de teste do Events Manager (homologação). */
  codigoTeste?: string;
};

/**
 * Monta o evento no formato da CAPI.
 *
 * Regras que derrubam o match quando ignoradas: `fbc`, `fbp` e `ctwa_clid`
 * NÃO são hasheados; e-mail e telefone SÃO (SHA-256 hex minúsculo), com o
 * telefone só em dígitos e sem `+`.
 */
export function montaEventoMeta(conversao: ConversaoOffline, opcoes: OpcoesEnvioMeta = {}) {
  const config = configMeta();
  const nome = EVENTO_POR_ETAPA[conversao.etapa] ?? "Lead";
  const ctwa = conversao.ctwaClid;

  const userData: Record<string, unknown> = {};
  if (conversao.emailSha256Meta) userData.em = [conversao.emailSha256Meta];
  if (conversao.telefoneSha256Meta) userData.ph = [conversao.telefoneSha256Meta];
  if (conversao.primeiroNomeSha256) userData.fn = [conversao.primeiroNomeSha256];
  if (conversao.sobrenomeSha256) userData.ln = [conversao.sobrenomeSha256];
  if (conversao.fbc) userData.fbc = conversao.fbc;
  if (conversao.fbp) userData.fbp = conversao.fbp;
  if (conversao.idExterno) userData.external_id = conversao.idExterno;
  if (ctwa) {
    userData.ctwa_clid = ctwa;
    if (config?.wabaId) userData.whatsapp_business_account_id = config.wabaId;
  }

  const customData: Record<string, unknown> = { order_id: conversao.idTransacao };
  if (conversao.valor !== undefined) {
    customData.value = conversao.valor;
    customData.currency = "BRL";
  }

  return {
    event_name: nome,
    event_time: Math.floor(Date.parse(conversao.ts) / 1000),
    // Conversa de anúncio clique-para-WhatsApp exige os dois campos juntos;
    // venda registrada no CRM entra como evento offline de loja física.
    ...(ctwa
      ? { action_source: "business_messaging", messaging_channel: "whatsapp" }
      : { action_source: "physical_store" }),
    // A Meta não deduplica eventos de business messaging: a chave é nossa.
    event_id: `${conversao.etapa}|${conversao.idTransacao}`,
    user_data: userData,
    custom_data: customData,
    ...(opcoes.apenasMedicao ? { opt_out: true } : {}),
  };
}

/** Decide se o evento pode ser enviado e explica quando não pode. */
export function avaliaConversaoMeta(conversao: ConversaoOffline) {
  const identificadores = [
    conversao.emailSha256Meta,
    conversao.telefoneSha256Meta,
    conversao.fbc,
    conversao.ctwaClid,
    conversao.idExterno,
  ].filter(Boolean);
  if (!identificadores.length) {
    return { pode: false as const, motivo: "sem nenhum identificador aceito pela Meta" };
  }

  const idade = dias(conversao.ts, new Date().toISOString());
  const limite = conversao.ctwaClid ? JANELA_PADRAO_DIAS : JANELA_OFFLINE_DIAS;
  if (idade > limite) {
    return {
      pode: false as const,
      motivo: `evento velho demais para envio (${Math.round(idade)}d > ${limite}d)`,
    };
  }
  return { pode: true as const };
}

/**
 * Um evento pode ser enviado e ainda assim não ser ATRIBUÍDO ao anúncio —
 * são coisas diferentes. Esta função separa as duas para o relatório poder
 * dizer ao cliente exatamente o que a Meta consegue e o que não consegue.
 */
export function seraAtribuido(conversao: ConversaoOffline) {
  if (!conversao.tsClique) return false;
  return dias(conversao.tsClique, conversao.ts) <= JANELA_ATRIBUICAO_DIAS;
}

/** Fatia uma lista em lotes de tamanho fixo. */
function lotes<T>(itens: T[], tamanho: number): T[][] {
  const saida: T[][] = [];
  for (let inicio = 0; inicio < itens.length; inicio += tamanho) {
    saida.push(itens.slice(inicio, inicio + tamanho));
  }
  return saida;
}

export async function enviaConversoesMeta(
  conversoes: ConversaoOffline[],
  opcoes: OpcoesEnvioMeta = {}
): Promise<ResultadoEnvio> {
  const resultado: ResultadoEnvio = {
    plataforma: "meta",
    enviados: 0,
    descartados: 0,
    motivos: {},
    erros: [],
  };
  const config = configMeta();
  if (!config?.datasetId) {
    resultado.motivos["meta não configurada (falta META_DATASET_ID)"] = conversoes.length;
    resultado.descartados = conversoes.length;
    return resultado;
  }

  const agora = new Date().toISOString();
  const validas = conversoes.filter((conversao) => {
    const avaliacao = avaliaConversaoMeta(conversao);
    if (!avaliacao.pode) {
      conta(resultado.motivos, avaliacao.motivo);
      resultado.descartados += 1;
      return false;
    }
    if (!seraAtribuido(conversao)) {
      // Não impede o envio: o evento ainda vale como sinal de valor.
      conta(resultado.motivos, "enviado, mas fora da janela de atribuição de 7 dias");
    }
    return true;
  });

  // Um único evento antigo demais derruba a REQUISIÇÃO INTEIRA — a doc é
  // explícita: "we return an error for the entire request and process no
  // events". Separar por idade garante que uma rejeição do lote histórico não
  // leve junto os eventos recentes, que são os que otimizam a entrega.
  const recentes: ConversaoOffline[] = [];
  const historicos: ConversaoOffline[] = [];
  for (const conversao of validas) {
    (dias(conversao.ts, agora) <= JANELA_PADRAO_DIAS ? recentes : historicos).push(conversao);
  }

  for (const grupo of [recentes, historicos]) {
    for (const fatia of lotes(grupo, LOTE)) {
      try {
        const resposta = await fetch(
          `https://graph.facebook.com/${VERSAO_GRAPH}/${config.datasetId}/events`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              data: fatia.map((conversao) => montaEventoMeta(conversao, opcoes)),
              access_token: config.token,
              ...(opcoes.codigoTeste ? { test_event_code: opcoes.codigoTeste } : {}),
            }),
          }
        );
        const corpo = await resposta.text();
        if (!resposta.ok) throw new Error(`Meta CAPI ${resposta.status}: ${corpo.slice(0, 400)}`);
        resultado.enviados += fatia.length;
      } catch (erro) {
        resultado.erros.push(erro instanceof Error ? erro.message : String(erro));
        resultado.descartados += fatia.length;
        conta(resultado.motivos, "erro na Conversions API");
      }
    }
  }
  return resultado;
}
