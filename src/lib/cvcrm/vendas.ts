// Reservas e vendas no CVCRM — o lado do relatório que traz o dinheiro.
//
// Dois caminhos, conforme o CVDW esteja contratado:
//
//   COM CVDW  — `/cvdw/vendas` devolve, na mesma linha, `valor_contrato`,
//               `data_venda`, `midia`, `campanha` e `idlead` (a lista de leads
//               vinculados). É o caminho completo e com carga incremental por
//               data de alteração, que é o que faz uma venda de dezembro
//               reaparecer carregando o lead de março.
//
//   SEM CVDW  — `/comercial/reservas` com `a_partir_de`. Traz
//               `leads_associados[]` e os valores dentro de `condicoes`.
//               Funciona, mas exige varrer mais e não tem histórico de
//               situação.

import { chavesIdentidade } from "@/lib/atribuicao/identidade";
import type { Etapa, RegistroEvento } from "@/lib/dados/tipos";
import { configCvcrm, ROTAS, type ConfigCvcrm } from "./config";
import { paginaCvdw, paginaRest } from "./http";
import { leCamposAdicionais } from "./campos";
import { listaIds, paraIso, paraNumero, pega, texto } from "./util";
import { normalizaRef, extraiRef } from "@/lib/atribuicao/ref";

type Bruto = Record<string, unknown>;

/** Situação da reserva → etapa do funil. */
export function etapaDaReserva(registro: Bruto, config: ConfigCvcrm): Etapa {
  const vendida = texto(pega(registro, "vendida", "venda"))?.toUpperCase();
  const situacao = (texto(pega(registro, "situacao.situacao", "situacao")) ?? "").toLowerCase();
  const idSituacao = texto(pega(registro, "situacao.idsituacao", "idsituacao"))?.toLowerCase();

  if (pega(registro, "data_cancelamento") || situacao.includes("distrat")) return "distrato";
  if (
    vendida === "S" ||
    vendida === "SIM" ||
    pega(registro, "data_venda") ||
    config.situacoesVenda.some((valor) => valor === idSituacao || situacao.includes(valor))
  ) {
    return "venda";
  }
  if (situacao.includes("cancel")) return "descartado";
  if (situacao.includes("proposta")) return "proposta";
  return "reserva";
}

/** Valor do contrato: o número que entra no ROAS. */
export function valorDaReserva(registro: Bruto): number | undefined {
  return (
    paraNumero(pega(registro, "valor_contrato", "condicoes.valor_contrato")) ??
    paraNumero(pega(registro, "valor_venda", "condicoes.valor_venda")) ??
    paraNumero(pega(registro, "condicoes.total_proposta", "valor_proposta")) ??
    paraNumero(pega(registro, "vgv_tabela", "condicoes.vgv_tabela"))
  );
}

/** Código de atribuição gravado na reserva ou herdado do lead. */
function refDaReserva(registro: Bruto, config: ConfigCvcrm) {
  const adicionais = {
    ...leCamposAdicionais(pega(registro, "campos_adicionais")),
    ...leCamposAdicionais(pega(registro, "campos_adicionais_contrato")),
  };
  const direto = normalizaRef(adicionais[config.campos.ref]);
  if (direto) return direto;
  return extraiRef(texto(pega(registro, "midia", "campanha")));
}

/** IDs dos leads ligados à reserva — o elo com o clique de origem. */
export function leadsDaReserva(registro: Bruto): string[] {
  const associados = pega(registro, "leads_associados");
  if (Array.isArray(associados)) {
    return associados
      .map((item) => texto((item as Bruto)?.idlead))
      .filter((valor): valor is string => !!valor);
  }
  return listaIds(pega(registro, "idlead"));
}

/** Converte reserva/venda em evento de funil com valor. */
export function reservaParaEvento(registro: Bruto, config: ConfigCvcrm): RegistroEvento {
  const id = texto(pega(registro, "idreserva", "id", "numero_venda")) ?? crypto.randomUUID();
  const etapa = etapaDaReserva(registro, config);
  const idsLead = leadsDaReserva(registro);

  return {
    id: `cvcrm|reserva|${id}`,
    ref: refDaReserva(registro, config),
    chaves: [
      ...chavesIdentidade({
        email: texto(pega(registro, "email", "cliente.email")),
        telefone: texto(pega(registro, "telefone", "celular", "cliente.telefone")),
      }),
      // Chave sintética: liga a venda ao lead do CV mesmo sem contato no payload.
      ...idsLead.map((idlead) => `cvlead:${idlead}`),
    ],
    etapa,
    ts:
      paraIso(
        pega(
          registro,
          "data_venda",
          "data_contrato",
          "data_ultima_alteracao_situacao",
          "data_cad",
          "data_reserva"
        )
      ) ?? new Date().toISOString(),
    valor: etapa === "venda" || etapa === "distrato" ? valorDaReserva(registro) : undefined,
    moeda: "BRL",
    fonte: "cvcrm",
    fonteId: id,
    empreendimento: texto(pega(registro, "empreendimento", "nome_empreendimento")),
    unidade: texto(pega(registro, "unidade", "identificador_unidade")),
    bruto: registro,
  };
}

/** Lista reservas/vendas do período, pelo caminho disponível. */
export async function listaVendasCrm(opcoes: { aPartirDe?: string } = {}) {
  const config = configCvcrm();
  if (!config) return [];

  if (config.cvdw) {
    const [vendas, reservas] = await Promise.all([
      paginaCvdw<Bruto>(config, "/vendas", { aPartirDe: opcoes.aPartirDe }),
      paginaCvdw<Bruto>(config, "/reservas", { aPartirDe: opcoes.aPartirDe }),
    ]);
    // `/vendas` é o recorte fechado; `/reservas` cobre o meio do funil.
    return [...vendas, ...reservas];
  }

  return paginaRest<Bruto>(config, ROTAS.listarReservas, {
    estilo: "pagina-registros",
    campoLista: "reservas",
    filtros: {
      a_partir_de: opcoes.aPartirDe?.slice(0, 10),
      campos_adicionais_reserva_contrato: true,
    },
  });
}

/**
 * Chave sintética `cvlead:<idlead>` para os leads do CV, de modo que uma venda
 * sem contato no payload ainda encontre o lead — e o lead, o clique.
 */
export function chaveLeadCv(idlead: string | number) {
  return `cvlead:${idlead}`;
}
