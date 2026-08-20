// Orquestração do pipeline.
//
// Três rotinas independentes, pensadas para rodar em cron separado porque têm
// frequências e riscos diferentes:
//
//   sincronizaCustos     — diária. Precisa ser diária mesmo: as duas
//                          plataformas encurtaram a retenção do histórico em
//                          2026, e o custo que não for guardado hoje pode não
//                          estar disponível quando a venda chegar.
//   sincronizaCrm        — diária (ou sob demanda via webhook do CVCRM).
//   devolveConversoes    — diária. Manda de volta o que aconteceu no funil,
//                          respeitando as janelas de cada plataforma.
//
// Nenhuma delas explode quando a integração correspondente não está
// configurada: devolvem zero e seguem.

import { hasheiaIdentidade, sha256 } from "@/lib/atribuicao/identidade";
import { repositorio } from "@/lib/dados/repositorio";
import type { RegistroCusto, RegistroEvento, RegistroLead } from "@/lib/dados/tipos";
import { configCvcrm } from "@/lib/cvcrm/config";
import { leadParaEvento, listaLeadsCrm } from "@/lib/cvcrm/leads";
import { listaVendasCrm, reservaParaEvento } from "@/lib/cvcrm/vendas";
import { buscaCustosGoogle } from "@/lib/ads/google/custos";
import { buscaCustosMeta } from "@/lib/ads/meta/custos";
import { enviaConversoesGoogle } from "@/lib/ads/google/conversoes";
import { enviaConversoesMeta } from "@/lib/ads/meta/conversoes";
import type { ConversaoOffline, ResultadoEnvio } from "@/lib/ads/tipos";
import { conciliaJornadas, montaJornadas } from "./conciliacao";
import type { JornadaConciliada, ModeloAtribuicao } from "./tipos";

export type JanelaISO = { de: string; ate: string };

/** Últimos `dias` até hoje, no formato aaaa-mm-dd. */
export function janelaRecente(dias = 30): JanelaISO {
  const ate = new Date();
  const de = new Date(ate.getTime() - dias * 86_400_000);
  return { de: de.toISOString().slice(0, 10), ate: ate.toISOString().slice(0, 10) };
}

/* ─────────────────────────  custos  ───────────────────────── */

export async function sincronizaCustos(janela: JanelaISO) {
  const banco = repositorio();
  const resultados: Record<string, number> = { google: 0, meta: 0 };
  const erros: string[] = [];

  const coleta = async (nome: string, fn: () => Promise<RegistroCusto[]>) => {
    try {
      const custos = await fn();
      if (custos.length) await banco.salvaCustos(custos);
      resultados[nome] = custos.length;
    } catch (erro) {
      erros.push(`${nome}: ${erro instanceof Error ? erro.message : String(erro)}`);
    }
  };

  await Promise.all([
    coleta("google", () => buscaCustosGoogle(janela)),
    coleta("meta", () => buscaCustosMeta(janela)),
  ]);

  return { ...resultados, erros };
}

/* ─────────────────────────  CRM  ───────────────────────── */

/**
 * Puxa leads e reservas do CVCRM e transforma em eventos de funil.
 * `aPartirDe` usa a data de ALTERAÇÃO, não a de criação — é o que faz uma
 * venda fechada hoje trazer de volta o lead de meses atrás.
 */
export async function sincronizaCrm(opcoes: { aPartirDe?: string } = {}) {
  const config = configCvcrm();
  if (!config) return { eventos: 0, erros: ["CVCRM não configurado"] };

  const erros: string[] = [];
  const eventos: RegistroEvento[] = [];

  try {
    for (const registro of await listaLeadsCrm(opcoes)) {
      eventos.push(leadParaEvento(registro as Record<string, unknown>, config));
    }
  } catch (erro) {
    erros.push(`leads: ${erro instanceof Error ? erro.message : String(erro)}`);
  }

  try {
    for (const registro of await listaVendasCrm(opcoes)) {
      eventos.push(reservaParaEvento(registro as Record<string, unknown>, config));
    }
  } catch (erro) {
    erros.push(`reservas: ${erro instanceof Error ? erro.message : String(erro)}`);
  }

  if (eventos.length) await repositorio().salvaEventos(eventos);
  return { eventos: eventos.length, erros };
}

/* ────────────────────  conversões offline  ──────────────────── */

/** Valor-proxy em reais das etapas que ainda não têm dinheiro na mesa. */
export type ValoresProxy = Partial<Record<string, number>>;

function valorProxyPadrao(): ValoresProxy {
  const numero = (bruto: string | undefined) => {
    const valor = Number(bruto);
    return Number.isFinite(valor) ? valor : undefined;
  };
  return {
    qualificado: numero(process.env.ROAS_VALOR_QUALIFICADO),
    visita: numero(process.env.ROAS_VALOR_VISITA),
    proposta: numero(process.env.ROAS_VALOR_PROPOSTA),
  };
}

/**
 * Converte jornadas conciliadas em conversões prontas para as plataformas.
 *
 * O crédito usado aqui é sempre o do ÚLTIMO clique pago, independente do
 * modelo do relatório: as plataformas só aceitam um identificador de clique
 * por conversão, e crédito fracionário não existe do lado delas.
 */
export type HashesLead = {
  emailGoogle?: string;
  emailMeta?: string;
  telGoogle?: string;
  telMeta?: string;
};

export function montaConversoesOffline(
  jornadas: JornadaConciliada[],
  leads: RegistroLead[],
  hashes: Map<string, HashesLead>,
  valores: ValoresProxy = valorProxyPadrao()
): ConversaoOffline[] {
  const leadPorRef = new Map(leads.filter((lead) => lead.ref).map((lead) => [lead.ref, lead]));
  const saida: ConversaoOffline[] = [];

  for (const jornada of jornadas) {
    if (!jornada.creditos.length) continue;
    const credito = jornada.creditos[jornada.creditos.length - 1].toque;
    const lead = jornada.ref ? leadPorRef.get(jornada.ref) : undefined;
    const hash = jornada.ref ? hashes.get(jornada.ref) : undefined;

    for (const etapa of jornada.etapas) {
      if (etapa === "lead" || etapa === "descartado" || etapa === "distrato") continue;

      const ehVenda = etapa === "venda";
      const valor = ehVenda ? jornada.valor : valores[etapa];
      const ts = ehVenda ? (jornada.dataVenda ?? jornada.primeiroEvento) : jornada.primeiroEvento;

      saida.push({
        etapa,
        ts,
        valor,
        idTransacao: `${jornada.id}|${etapa}`,
        gclid: credito.gclid,
        gbraid: credito.gclid ? undefined : credito.gbraid,
        wbraid: credito.gclid || credito.gbraid ? undefined : credito.wbraid,
        fbc: credito.fbc,
        fbp: credito.fbp,
        emailSha256Google: hash?.emailGoogle ?? lead?.emailSha256Google,
        emailSha256Meta: hash?.emailMeta ?? lead?.emailSha256,
        telefoneSha256Google: hash?.telGoogle,
        telefoneSha256Meta: hash?.telMeta ?? lead?.telefoneSha256,
        idExterno: lead?.crmId ?? jornada.ref,
        tsClique: credito.ts,
      });
    }
  }
  return saida;
}

/**
 * Recalcula os quatro hashes de identidade a partir do contato bruto.
 * Necessário porque o registro guarda só o formato da Meta, e o Google usa
 * outro tanto no telefone (com `+`) quanto no e-mail (regra do Gmail).
 */
async function montaHashes(leads: RegistroLead[]) {
  const mapa = new Map<string, HashesLead>();
  for (const lead of leads) {
    if (!lead.ref) continue;
    const hashes = await hasheiaIdentidade({ email: lead.email, telefone: lead.telefone });
    const telefone = lead.telefoneNormalizado;
    mapa.set(lead.ref, {
      emailGoogle: hashes.emailSha256Google ?? lead.emailSha256Google,
      emailMeta: hashes.emailSha256Meta ?? lead.emailSha256,
      telMeta: hashes.telefoneSha256Meta ?? (telefone ? await sha256(telefone) : lead.telefoneSha256),
      telGoogle: hashes.telefoneSha256Google ?? (telefone ? await sha256(`+${telefone}`) : undefined),
    });
  }
  return mapa;
}

export type OpcoesDevolucao = {
  /** Só considera jornadas com evento a partir desta data. */
  aPartirDe?: string;
  modelo?: ModeloAtribuicao;
  /** `validateOnly` no Google e `test_event_code` na Meta. */
  homologacao?: boolean;
  codigoTesteMeta?: string;
};

/**
 * Devolve as conversões do funil para Google e Meta.
 *
 * O que fica de fora é tão importante quanto o que vai: cada conversão
 * descartada volta com o motivo, e é isso que explica ao cliente por que uma
 * venda de R$ 2 mi não aparece no Ads Manager (quase sempre: o clique tem mais
 * de 90 dias no Google ou mais de 7 dias de janela na Meta).
 */
export async function devolveConversoes(opcoes: OpcoesDevolucao = {}): Promise<ResultadoEnvio[]> {
  const banco = repositorio();
  const [toques, leads, eventos] = await Promise.all([
    banco.listaToques(),
    banco.listaLeads(),
    banco.listaEventos({ de: opcoes.aPartirDe }),
  ]);

  const jornadas = conciliaJornadas(montaJornadas(eventos, leads), toques, leads, {
    modelo: opcoes.modelo ?? "ultimo",
  });
  const conversoes = montaConversoesOffline(jornadas, leads, await montaHashes(leads));

  return Promise.all([
    enviaConversoesGoogle(conversoes, { validaApenas: opcoes.homologacao }),
    enviaConversoesMeta(conversoes, {
      codigoTeste: opcoes.homologacao ? opcoes.codigoTesteMeta : undefined,
    }),
  ]);
}

/* ─────────────────────────  tudo  ───────────────────────── */

export async function sincronizaTudo(opcoes: { dias?: number; homologacao?: boolean } = {}) {
  const janela = janelaRecente(opcoes.dias ?? 30);
  const custos = await sincronizaCustos(janela);
  const crm = await sincronizaCrm({ aPartirDe: `${janela.de} 00:00:00` });
  const envios = await devolveConversoes({ homologacao: opcoes.homologacao });
  return { janela, custos, crm, envios };
}
