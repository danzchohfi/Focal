// Leads no CVCRM: escrita (site → CRM) e leitura (CRM → warehouse).

import { extraiRef, normalizaRef } from "@/lib/atribuicao/ref";
import { chavesIdentidade } from "@/lib/atribuicao/identidade";
import type { Etapa, RegistroEvento, RegistroLead } from "@/lib/dados/tipos";
import { configCvcrm, ROTAS, type ConfigCvcrm } from "./config";
import { chamadaRest, paginaRest } from "./http";
import { conversaoCv, leCamposAdicionais, midiaCv, montaCamposAdicionais, origemCv } from "./campos";
import { pega, paraIso, paraNumero, texto } from "./util";

type Bruto = Record<string, unknown>;

/**
 * Espelha o lead do formulário no CVCRM.
 *
 * Observações que vêm da documentação e mudam o comportamento:
 *  • e-mail e telefone são chaves únicas — reenvio do mesmo contato sem
 *    `permitir_alteracao` volta erro de duplicidade;
 *  • `origem` é de lista fechada e IMUTÁVEL depois de criada, então a
 *    granularidade real (campanha/grupo/anúncio) vai em `midia`, `conversao`
 *    e nos campos adicionais;
 *  • cada reentrada do mesmo contato vira uma "conversão" no CV — é o modelo
 *    multi-toque nativo, e é por isso que `converter: true` é enviado.
 *
 * No-op silencioso quando a integração não está configurada.
 */
export async function enviaLeadParaCrm(lead: RegistroLead) {
  const config = configCvcrm();
  if (!config) return undefined;

  const atribuicao = lead.atribuicao;
  const canal = atribuicao?.ultimo.canal ?? "direto";

  const payload: Bruto = {
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    telefone_ddi: "+55",
    origem: origemCv(canal),
    midia: midiaCv(atribuicao),
    conversao: conversaoCv(atribuicao),
    converter: true,
    permitir_alteracao: true,
    campos_adicionais: montaCamposAdicionais(config, lead.ref, atribuicao),
    tags: [lead.contexto, canal].filter(Boolean),
    resumo_insight_api: [
      lead.quando ? `Prazo de compra: ${lead.quando}` : undefined,
      lead.orcamento ? `Orçamento: ${lead.orcamento}` : undefined,
      lead.assunto ? `Assunto: ${lead.assunto}` : undefined,
      lead.ref ? `Código de atribuição: ${lead.ref}` : undefined,
    ]
      .filter(Boolean)
      .join(" · "),
  };

  if (config.idEmpreendimento) payload.idempreendimento = config.idEmpreendimento;
  if (lead.mensagem) {
    payload.interacoes = [{ tipo: "A", descricao: lead.mensagem, situacao: "A" }];
  }

  const resposta = (await chamadaRest(config, ROTAS.criarLead, {
    method: "POST",
    body: JSON.stringify(payload),
  })) as Bruto | undefined;

  return { crmId: texto(pega(resposta, "id", "idlead", "dados.id")) };
}

/* ─────────────────────────  leitura  ───────────────────────── */

/** Procura o código de atribuição em todos os lugares onde ele pode ter caído. */
export function refDoRegistro(registro: Bruto, config: ConfigCvcrm) {
  const adicionais = leCamposAdicionais(pega(registro, "campos_adicionais"));
  const direto = adicionais[config.campos.ref];
  const normalizado = normalizaRef(direto);
  if (normalizado) return normalizado;

  // Fallback: o código pode ter chegado colado num texto livre — na primeira
  // mensagem do WhatsApp repassada pela Laís, numa anotação, na mídia.
  const textos = [
    adicionais[config.campos.origemResumo],
    texto(pega(registro, "midia", "midia_principal", "midia_original", "midia_ultimo")),
    texto(pega(registro, "observacoes", "observacao", "descricao", "resumo_insight_api")),
    JSON.stringify(pega(registro, "interacao", "interacoes") ?? ""),
  ];
  for (const bruto of textos) {
    const achado = extraiRef(bruto);
    if (achado) return achado;
  }
  return undefined;
}

/** Traduz a situação do CV para a etapa canônica do funil. */
export function etapaDoLead(registro: Bruto, config: ConfigCvcrm): Etapa {
  const idSituacao = texto(pega(registro, "situacao.id", "idsituacao"))?.toLowerCase();
  const nome = (texto(pega(registro, "situacao.nome", "situacao")) ?? "").toLowerCase();

  const bate = (lista: string[]) =>
    lista.some((valor) => valor === idSituacao || (valor.length > 2 && nome.includes(valor)));

  if (pega(registro, "data_cancelamento") || nome.includes("descart") || nome.includes("perdido")) {
    return "descartado";
  }
  if (pega(registro, "data_venda") || bate(config.situacoesVenda) || nome.includes("vend")) {
    return "venda";
  }
  if (nome.includes("reserva")) return "reserva";
  if (nome.includes("proposta")) return "proposta";
  if (nome.includes("visita")) return "visita";
  if (bate(config.situacoesQualificado) || nome.includes("qualific") || nome.includes("atendimento")) {
    return "qualificado";
  }
  return "lead";
}

/** Converte um lead do CV em evento de funil. */
export function leadParaEvento(registro: Bruto, config: ConfigCvcrm): RegistroEvento {
  const id = texto(pega(registro, "idlead", "id")) ?? crypto.randomUUID();
  const empreendimentos = pega(registro, "empreendimento");
  const empreendimento = Array.isArray(empreendimentos)
    ? texto((empreendimentos[0] as Bruto)?.nome)
    : texto(pega(registro, "empreendimento_ultimo", "nome_empreendimento", "empreendimento"));

  return {
    id: `cvcrm|lead|${id}`,
    ref: refDoRegistro(registro, config),
    chaves: [
      // A chave sintética é o que liga a reserva (que só traz idlead) a este
      // lead, e daí ao clique de origem.
      `cvlead:${id}`,
      ...chavesIdentidade({
        email: texto(pega(registro, "email")),
        telefone: texto(pega(registro, "telefone", "celular")),
      }),
    ],
    etapa: etapaDoLead(registro, config),
    ts:
      paraIso(pega(registro, "data_ultima_alteracao", "data_cad", "ultima_data_conversao")) ??
      new Date().toISOString(),
    valor: paraNumero(pega(registro, "valor_venda", "valor_negocio")),
    moeda: "BRL",
    fonte: "cvcrm",
    fonteId: id,
    empreendimento,
    bruto: registro,
  };
}

/** Busca um lead específico (usado no enriquecimento pós-webhook). */
export async function buscaLeadCrm(idlead: string) {
  const config = configCvcrm();
  if (!config) return undefined;
  const resposta = (await chamadaRest(
    config,
    `${ROTAS.listarLeads}?${new URLSearchParams({ idlead })}`
  )) as Bruto | undefined;
  const lista = pega(resposta, "leads", "dados");
  return Array.isArray(lista) ? (lista[0] as Bruto | undefined) : undefined;
}

/**
 * Lista leads. Com CVDW contratado usa carga incremental por data de
 * alteração; sem ele, varre a listagem transacional — que não tem filtro de
 * data e por isso é bem mais cara.
 */
export async function listaLeadsCrm(opcoes: { aPartirDe?: string } = {}) {
  const config = configCvcrm();
  if (!config) return [];
  if (config.cvdw) {
    const { paginaCvdw } = await import("./http");
    return paginaCvdw<Bruto>(config, "/leads", { aPartirDe: opcoes.aPartirDe });
  }
  return paginaRest<Bruto>(config, ROTAS.listarLeads, {
    estilo: "limit-offset",
    campoLista: "leads",
    filtros: { ativo: true },
  });
}
