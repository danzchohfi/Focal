// Envio de conversões offline para o Google Ads via Data Manager API.
//
// Por que Data Manager e não `ConversionUploadService.UploadClickConversions`:
// desde 15/06/2026 o método antigo só funciona para developer tokens que já
// vinham enviando uploads antes dessa data. Uma conta nova recebe
// CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE. A Data Manager API é o caminho
// oficial e, de quebra, não exige developer token.
//
// JANELAS — o ponto que precisa estar claro com o cliente:
//   • gclid: 90 dias entre o clique e a conversão;
//   • identidade hasheada (enhanced conversions for leads): 63 dias.
// Num ciclo imobiliário de 30 a 180+ dias, a VENDA frequentemente não cabe.
// Por isso o pipeline envia as etapas intermediárias (qualificado, visita) —
// que cabem — e trata a venda como "envia se couber". O ROAS de verdade sai do
// warehouse, não do Ads Manager.
//
// Modelo fast-fail: um único evento inválido derruba o lote inteiro. A
// validação acontece aqui, antes do envio.

import type { ConversaoOffline, ResultadoEnvio } from "../tipos";
import { accessToken, configGoogle, type ConfigGoogle } from "./auth";

/** Retenção do gclid: conversão mais velha que isso não é importada. */
export const JANELA_GCLID_DIAS = 90;
/** Janela quando a conversão é identificada só por e-mail/telefone hasheado. */
export const JANELA_IDENTIDADE_DIAS = 63;
/** O Google precisa de algumas horas para processar o clique antes do upload. */
export const ESPERA_MINIMA_HORAS = 6;
/** Limite de eventos por requisição na Data Manager API. */
const LOTE = 2000;

function dias(de: string, ate: string) {
  return (Date.parse(ate) - Date.parse(de)) / 86_400_000;
}

type Motivos = Record<string, number>;

function conta(motivos: Motivos, chave: string) {
  motivos[chave] = (motivos[chave] ?? 0) + 1;
}

/**
 * Decide se a conversão pode ser enviada e por qual identificador.
 * Devolve o motivo da recusa quando não pode — é o que explica ao cliente
 * por que uma venda não apareceu no Google Ads.
 */
export function avaliaConversaoGoogle(conversao: ConversaoOffline) {
  const clickIds = [conversao.gclid, conversao.gbraid, conversao.wbraid].filter(Boolean);
  if (clickIds.length > 1) {
    return { pode: false as const, motivo: "mais de um click id (o Google aceita exatamente um)" };
  }
  const temIdentidade = !!(conversao.emailSha256Google || conversao.telefoneSha256Google);
  if (!clickIds.length && !temIdentidade) {
    return { pode: false as const, motivo: "sem gclid e sem identidade hasheada" };
  }

  if (conversao.tsClique) {
    const distancia = dias(conversao.tsClique, conversao.ts);
    if (distancia < 0) return { pode: false as const, motivo: "conversão anterior ao clique" };
    const limite = clickIds.length ? JANELA_GCLID_DIAS : JANELA_IDENTIDADE_DIAS;
    if (distancia > limite) {
      return {
        pode: false as const,
        motivo: `fora da janela do Google (${Math.round(distancia)}d > ${limite}d)`,
      };
    }
    const horas = (Date.now() - Date.parse(conversao.tsClique)) / 3_600_000;
    if (horas < ESPERA_MINIMA_HORAS) {
      return { pode: false as const, motivo: "clique ainda em processamento (<6h)" };
    }
  }
  return { pode: true as const };
}

function montaEvento(conversao: ConversaoOffline) {
  const adIdentifiers: Record<string, string> = {};
  if (conversao.gclid) adIdentifiers.gclid = conversao.gclid;
  else if (conversao.gbraid) adIdentifiers.gbraid = conversao.gbraid;
  else if (conversao.wbraid) adIdentifiers.wbraid = conversao.wbraid;

  // Cada UserIdentifier carrega UM atributo: e-mail e telefone precisam ir em
  // entradas separadas do array, senão o Google zera os demais.
  const userIdentifiers: Record<string, unknown>[] = [];
  if (conversao.emailSha256Google) {
    userIdentifiers.push({ emailAddress: conversao.emailSha256Google });
  }
  if (conversao.telefoneSha256Google) {
    userIdentifiers.push({ phoneNumber: conversao.telefoneSha256Google });
  }

  return {
    eventTimestamp: new Date(conversao.ts).toISOString(),
    transactionId: conversao.idTransacao,
    ...(conversao.valor !== undefined
      ? { conversionValue: conversao.valor, currency: "BRL" }
      : {}),
    eventSource: "OTHER",
    ...(Object.keys(adIdentifiers).length ? { adIdentifiers } : {}),
    ...(userIdentifiers.length ? { userData: { userIdentifiers } } : {}),
  };
}

/**
 * Envia um lote de conversões para uma conversion action.
 * `validaApenas` usa `validateOnly` — obrigatório em homologação, já que o
 * modelo é fast-fail e um registro ruim derruba o lote todo.
 */
export async function enviaConversoesGoogle(
  conversoes: ConversaoOffline[],
  opcoes: { validaApenas?: boolean } = {}
): Promise<ResultadoEnvio> {
  const resultado: ResultadoEnvio = {
    plataforma: "google",
    enviados: 0,
    descartados: 0,
    motivos: {},
    erros: [],
  };
  const config = configGoogle();
  if (!config?.customerId) {
    resultado.motivos["google não configurado"] = conversoes.length;
    resultado.descartados = conversoes.length;
    return resultado;
  }

  // Uma requisição por conversion action: o destino é por etapa do funil.
  const porEtapa = new Map<string, ConversaoOffline[]>();
  for (const conversao of conversoes) {
    const acao = config.conversionActions[conversao.etapa];
    if (!acao) {
      conta(resultado.motivos, `sem conversion action para "${conversao.etapa}"`);
      resultado.descartados += 1;
      continue;
    }
    const avaliacao = avaliaConversaoGoogle(conversao);
    if (!avaliacao.pode) {
      conta(resultado.motivos, avaliacao.motivo);
      resultado.descartados += 1;
      continue;
    }
    const lista = porEtapa.get(acao) ?? [];
    lista.push(conversao);
    porEtapa.set(acao, lista);
  }

  for (const [acao, lista] of porEtapa) {
    for (let inicio = 0; inicio < lista.length; inicio += LOTE) {
      const fatia = lista.slice(inicio, inicio + LOTE);
      try {
        await ingestaDataManager(config, acao, fatia, opcoes.validaApenas ?? false);
        resultado.enviados += fatia.length;
      } catch (erro) {
        resultado.erros.push(erro instanceof Error ? erro.message : String(erro));
        resultado.descartados += fatia.length;
        conta(resultado.motivos, "erro na Data Manager API");
      }
    }
  }
  return resultado;
}

async function ingestaDataManager(
  config: ConfigGoogle,
  conversionActionId: string,
  conversoes: ConversaoOffline[],
  validaApenas: boolean
) {
  const token = await accessToken(config, "datamanager");
  const corpo = {
    destinations: [
      {
        operatingAccount: { accountType: "GOOGLE_ADS", accountId: config.customerId },
        ...(config.loginCustomerId
          ? { loginAccount: { accountType: "GOOGLE_ADS", accountId: config.loginCustomerId } }
          : {}),
        productDestinationId: conversionActionId,
      },
    ],
    events: conversoes.map(montaEvento),
    // Os hashes saem daqui em hexadecimal minúsculo.
    encoding: "HEX",
    validateOnly: validaApenas,
  };

  const resposta = await fetch("https://datamanager.googleapis.com/v1/events:ingest", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
  const texto = await resposta.text();
  if (!resposta.ok) throw new Error(`Data Manager ${resposta.status}: ${texto.slice(0, 400)}`);
  return JSON.parse(texto || "{}") as { requestId?: string; fieldWarnings?: unknown[] };
}
