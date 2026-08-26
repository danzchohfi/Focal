// Conciliação: ligar cada venda ao clique que a originou.
//
// É a parte que decide se o relatório vale alguma coisa. Três caminhos, nessa
// ordem de confiança:
//
//   1. CÓDIGO (alta)  — o `ref` viajou site → WhatsApp → Laís → CVCRM e voltou
//                       no evento. Ligação direta, sem ambiguidade.
//   2. TELEFONE (média) — o CRM só tem o contato; casamos com o lead que o
//                       formulário gravou aqui. Telefone é mais confiável que
//                       e-mail no Brasil (o WhatsApp é o telefone).
//   3. E-MAIL (média)
//
// O que não casa por nenhum dos três é contabilizado como não conciliado — e
// aparece no relatório. Atribuição que esconde o próprio buraco vira ficção.

import { ETAPAS, type Etapa, type RegistroEvento, type RegistroLead, type RegistroToque } from "@/lib/dados/tipos";
import { canalPago } from "@/lib/dados/mapeamento";
import type {
  CreditoToque,
  Jornada,
  JornadaConciliada,
  MetodoConciliacao,
  ModeloAtribuicao,
} from "./tipos";

const ORDEM_ETAPA = new Map<Etapa, number>(ETAPAS.map((etapa, indice) => [etapa, indice]));

/** Etapas que representam progresso no funil (distrato e descarte não contam). */
function progride(etapa: Etapa) {
  return etapa !== "distrato" && etapa !== "descartado";
}

function maiorEtapa(a: Etapa, b: Etapa): Etapa {
  if (!progride(b)) return a;
  if (!progride(a)) return b;
  return (ORDEM_ETAPA.get(a) ?? 0) >= (ORDEM_ETAPA.get(b) ?? 0) ? a : b;
}

/**
 * Agrupa eventos soltos em jornadas de lead.
 *
 * O mesmo lead chega por várias fontes (site, CVCRM, Laís) com identificadores
 * diferentes. União por código quando existe, por chave de contato quando não.
 */
export function montaJornadas(eventos: RegistroEvento[], leads: RegistroLead[]): Jornada[] {
  // Mapa chave-de-contato → código, alimentado pelos leads do site e pelos
  // eventos que trazem os dois lados.
  const chaveParaRef = new Map<string, string>();
  const registraChaves = (ref: string | undefined, chaves: string[]) => {
    if (!ref) return;
    for (const chave of chaves) if (!chaveParaRef.has(chave)) chaveParaRef.set(chave, ref);
  };
  for (const lead of leads) registraChaves(lead.ref || undefined, lead.chaves ?? []);
  for (const evento of eventos) registraChaves(evento.ref, evento.chaves ?? []);

  type Resolucao = { id: string; direto: boolean; via?: "telefone" | "email" };

  const identidade = (evento: RegistroEvento): Resolucao => {
    // O código veio no próprio evento: atravessou site → WhatsApp → CRM.
    if (evento.ref) return { id: `ref:${evento.ref}`, direto: true };
    // Só o contato veio: o código é recuperado pela identidade do lead.
    for (const chave of evento.chaves ?? []) {
      const ref = chaveParaRef.get(chave);
      if (ref) {
        return { id: `ref:${ref}`, direto: false, via: chave.startsWith("tel:") ? "telefone" : "email" };
      }
    }
    return { id: (evento.chaves ?? [])[0] ?? `evento:${evento.id}`, direto: false };
  };

  const porIdentidade = new Map<string, Jornada>();

  for (const evento of eventos) {
    const { id, direto, via } = identidade(evento);
    const atual: Jornada = porIdentidade.get(id) ?? {
      id,
      ref: id.startsWith("ref:") ? id.slice(4) : undefined,
      chaves: [],
      refDireto: false,
      etapaMaxima: "lead",
      etapas: new Set<Etapa>(),
      primeiroEvento: evento.ts,
      valor: 0,
      valorBruto: 0,
      distratado: false,
    };

    if (direto) atual.refDireto = true;
    if (via && !atual.viaChave) atual.viaChave = via;
    atual.etapas.add(evento.etapa);
    atual.etapaMaxima = maiorEtapa(atual.etapaMaxima, evento.etapa);
    if (evento.ts < atual.primeiroEvento) atual.primeiroEvento = evento.ts;
    for (const chave of evento.chaves ?? []) {
      if (!atual.chaves.includes(chave)) atual.chaves.push(chave);
    }
    if (!atual.empreendimento && evento.empreendimento) atual.empreendimento = evento.empreendimento;

    if (evento.etapa === "venda") {
      atual.valorBruto += evento.valor ?? 0;
      if (!atual.dataVenda || evento.ts < atual.dataVenda) atual.dataVenda = evento.ts;
    }
    if (evento.etapa === "distrato") atual.distratado = true;

    porIdentidade.set(id, atual);
  }

  for (const jornada of porIdentidade.values()) {
    jornada.valor = jornada.distratado ? 0 : jornada.valorBruto;
  }
  return [...porIdentidade.values()];
}

/** Distribui o crédito entre os toques pagos segundo o modelo escolhido. */
export function distribuiCredito(
  toques: RegistroToque[],
  modelo: ModeloAtribuicao,
  limite?: string
): CreditoToque[] {
  const candidatos = toques
    .filter((toque) => canalPago(toque.canal))
    // Só toques anteriores à conversão podem receber crédito por ela.
    .filter((toque) => !limite || toque.ts <= limite)
    .sort((a, b) => a.ts.localeCompare(b.ts));

  // Sem toque pago anterior: o lead existe, mas não é mérito de mídia paga.
  if (!candidatos.length) return [];

  if (modelo === "primeiro") return [{ toque: candidatos[0], peso: 1 }];
  if (modelo === "ultimo") return [{ toque: candidatos[candidatos.length - 1], peso: 1 }];

  // Linear: um voto por anúncio distinto, não por pageview.
  const porAnuncio = new Map<string, RegistroToque>();
  for (const toque of candidatos) {
    const chave = `${toque.plataforma}|${toque.campanhaId}|${toque.grupoId}|${toque.anuncioId}`;
    porAnuncio.set(chave, toque);
  }
  const unicos = [...porAnuncio.values()];
  return unicos.map((toque) => ({ toque, peso: 1 / unicos.length }));
}

export type OpcoesConciliacao = {
  modelo?: ModeloAtribuicao;
  /** Janela máxima entre clique e venda. Padrão 365 dias. */
  janelaDias?: number;
};

/**
 * Liga cada jornada aos toques que a originaram.
 * A ordem das tentativas define a confiança registrada.
 */
export function conciliaJornadas(
  jornadas: Jornada[],
  toques: RegistroToque[],
  leads: RegistroLead[],
  opcoes: OpcoesConciliacao = {}
): JornadaConciliada[] {
  const modelo = opcoes.modelo ?? "ultimo";
  const janelaMs = (opcoes.janelaDias ?? 365) * 86_400_000;

  const toquesPorRef = new Map<string, RegistroToque[]>();
  for (const toque of toques) {
    if (!toque.ref) continue;
    const lista = toquesPorRef.get(toque.ref) ?? [];
    lista.push(toque);
    toquesPorRef.set(toque.ref, lista);
  }

  const refPorChave = new Map<string, { ref: string; metodo: MetodoConciliacao }>();
  for (const lead of leads) {
    if (!lead.ref) continue;
    for (const chave of lead.chaves ?? []) {
      if (refPorChave.has(chave)) continue;
      refPorChave.set(chave, {
        ref: lead.ref,
        metodo: chave.startsWith("tel:") ? "telefone" : "email",
      });
    }
  }

  return jornadas.map((jornada) => {
    let metodo: MetodoConciliacao = "sem_correspondencia";
    let lista: RegistroToque[] | undefined;

    if (jornada.ref && toquesPorRef.has(jornada.ref)) {
      // "ref" só quando o código realmente voltou do CRM. Se ele foi
      // reconstruído por telefone/e-mail, o relatório precisa dizer isso — é
      // essa diferença que mostra se o código está atravessando o funil.
      metodo = jornada.refDireto ? "ref" : (jornada.viaChave ?? "ref");
      lista = toquesPorRef.get(jornada.ref);
    } else {
      for (const chave of jornada.chaves) {
        const achado = refPorChave.get(chave);
        const candidatos = achado ? toquesPorRef.get(achado.ref) : undefined;
        if (candidatos?.length) {
          metodo = achado!.metodo;
          lista = candidatos;
          break;
        }
      }
    }

    const limite = jornada.dataVenda ?? undefined;
    const creditos = lista ? distribuiCredito(lista, modelo, limite) : [];

    // Fora da janela: clique velho demais para reivindicar a venda.
    const dentroDaJanela = creditos.filter((credito) => {
      if (!jornada.dataVenda) return true;
      const distancia = Date.parse(jornada.dataVenda) - Date.parse(credito.toque.ts);
      return distancia >= 0 && distancia <= janelaMs;
    });

    const total = dentroDaJanela.reduce((soma, credito) => soma + credito.peso, 0);
    const normalizados =
      total > 0 ? dentroDaJanela.map((c) => ({ ...c, peso: c.peso / total })) : [];

    const primeiroClique = normalizados.length
      ? normalizados.map((c) => c.toque.ts).sort()[0]
      : undefined;
    const diasAteVenda =
      jornada.dataVenda && primeiroClique
        ? Math.round((Date.parse(jornada.dataVenda) - Date.parse(primeiroClique)) / 86_400_000)
        : undefined;

    // `metodo` responde "achei o histórico desta pessoa?"; os créditos
    // respondem "esse histórico tem clique pago?". São perguntas diferentes:
    // um lead pode ser conciliado com alta confiança e mesmo assim ser 100%
    // orgânico — e aí não pode entrar no ROAS de mídia.
    return {
      ...jornada,
      metodo,
      confianca:
        metodo === "sem_correspondencia"
          ? "nenhuma"
          : metodo === "ref" || metodo === "manual"
            ? "alta"
            : "media",
      creditos: normalizados,
      diasAteVenda,
    };
  });
}
