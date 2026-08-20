// Camada HTTP do CVCRM: autenticação, rate limit e as duas formas de chamada.
//
// Uma particularidade do CVDW obriga a sair do `fetch`: os parâmetros de
// paginação e de carga incremental vão no CORPO JSON de uma requisição GET.
// O `fetch` do Node recusa corpo em GET, então o CVDW usa `node:https`
// diretamente. Os endpoints transacionais são `fetch` normal.

import { INTERVALO_MS, type ConfigCvcrm } from "./config";

export class ErroCvcrm extends Error {
  constructor(
    readonly status: number,
    readonly rota: string,
    readonly corpo: string
  ) {
    super(`CVCRM ${status} em ${rota}: ${corpo.slice(0, 300)}`);
    this.name = "ErroCvcrm";
  }
}

/** Espaçamento mínimo entre chamadas, por família de API. */
const ultimaChamada: Record<"rest" | "cvdw", number> = { rest: 0, cvdw: 0 };

async function respeitaLimite(familia: "rest" | "cvdw") {
  const intervalo = INTERVALO_MS[familia];
  const espera = ultimaChamada[familia] + intervalo - Date.now();
  if (espera > 0) await new Promise((resolve) => setTimeout(resolve, espera));
  ultimaChamada[familia] = Date.now();
}

function cabecalhos(config: ConfigCvcrm) {
  return {
    email: config.email,
    token: config.token,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function interpreta(corpo: string, rota: string): unknown {
  if (!corpo.trim()) return undefined;
  try {
    return JSON.parse(corpo);
  } catch {
    throw new ErroCvcrm(0, rota, `resposta não-JSON: ${corpo.slice(0, 200)}`);
  }
}

/** Chamada REST comum (GET com query, POST com corpo). */
export async function chamadaRest(
  config: ConfigCvcrm,
  rota: string,
  init: RequestInit & { tentativas?: number } = {}
): Promise<unknown> {
  const { tentativas = 3, ...resto } = init;
  const url = rota.startsWith("http") ? rota : `${config.baseUrl}${rota}`;

  for (let tentativa = 1; ; tentativa++) {
    await respeitaLimite("rest");
    const resposta = await fetch(url, {
      ...resto,
      headers: { ...cabecalhos(config), ...(resto.headers ?? {}) },
    });
    const corpo = await resposta.text();

    // 204 = consulta válida sem registros (o CV usa isso em reservas vazias).
    if (resposta.status === 204) return undefined;
    if (resposta.ok) return interpreta(corpo, rota);

    // 429 = estourou o limite; o CV bloqueia por 1 minuto.
    const recuperavel = resposta.status === 429 || resposta.status >= 500;
    if (!recuperavel || tentativa >= tentativas) {
      throw new ErroCvcrm(resposta.status, rota, corpo);
    }
    const espera = resposta.status === 429 ? 60_000 : 2_000 * 2 ** (tentativa - 1);
    await new Promise((resolve) => setTimeout(resolve, espera));
  }
}

/**
 * Chamada ao CVDW: GET com corpo JSON.
 *
 * `fetch` rejeita corpo em GET, então esta função desce para `node:https`.
 * Só roda no runtime Node (jobs de sincronização), nunca no Edge.
 */
export async function chamadaCvdw(
  config: ConfigCvcrm,
  recurso: string,
  parametros: Record<string, unknown> = {},
  tentativas = 3
): Promise<unknown> {
  const { ROTAS } = await import("./config");
  const rota = ROTAS.cvdw(recurso);
  const alvo = new URL(`${config.baseUrl}${rota}`);
  const corpoEnvio = JSON.stringify(parametros);
  const https = await import("node:https");

  for (let tentativa = 1; ; tentativa++) {
    await respeitaLimite("cvdw");

    const { status, corpo } = await new Promise<{ status: number; corpo: string }>(
      (resolve, reject) => {
        const requisicao = https.request(
          {
            hostname: alvo.hostname,
            port: alvo.port || 443,
            path: alvo.pathname + alvo.search,
            method: "GET",
            headers: {
              ...cabecalhos(config),
              "Content-Length": Buffer.byteLength(corpoEnvio),
            },
          },
          (resposta) => {
            let dados = "";
            resposta.setEncoding("utf8");
            resposta.on("data", (parte) => (dados += parte));
            resposta.on("end", () => resolve({ status: resposta.statusCode ?? 0, corpo: dados }));
          }
        );
        requisicao.on("error", reject);
        requisicao.write(corpoEnvio);
        requisicao.end();
      }
    );

    if (status === 204) return undefined;
    if (status >= 200 && status < 300) return interpreta(corpo, rota);

    const recuperavel = status === 429 || status >= 500;
    if (!recuperavel || tentativa >= tentativas) throw new ErroCvcrm(status, rota, corpo);
    await new Promise((resolve) => setTimeout(resolve, status === 429 ? 60_000 : 2_000 * tentativa));
  }
}

export type PaginaCvdw<T> = {
  pagina: number;
  registros: number;
  total_de_registros: number;
  total_de_paginas: number;
  dados: T[];
};

/**
 * Percorre todas as páginas de um recurso do CVDW.
 * `aPartirDe` usa `a_partir_data_referencia`, que devolve o que foi criado OU
 * alterado desde a data — é o que faz a venda de dezembro voltar carregando o
 * lead de março.
 */
export async function paginaCvdw<T = Record<string, unknown>>(
  config: ConfigCvcrm,
  recurso: string,
  opcoes: { aPartirDe?: string; ateData?: string; porPagina?: number; maxPaginas?: number } = {}
): Promise<T[]> {
  const porPagina = Math.min(opcoes.porPagina ?? 500, 500);
  const maxPaginas = opcoes.maxPaginas ?? 200;
  const saida: T[] = [];

  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const resposta = (await chamadaCvdw(config, recurso, {
      pagina,
      registros_por_pagina: porPagina,
      ...(opcoes.aPartirDe ? { a_partir_data_referencia: opcoes.aPartirDe } : {}),
      ...(opcoes.ateData ? { ate_data_referencia: opcoes.ateData } : {}),
    })) as PaginaCvdw<T> | undefined;

    const dados = resposta?.dados ?? [];
    saida.push(...dados);
    if (!dados.length || pagina >= (resposta?.total_de_paginas ?? 1)) break;
  }
  return saida;
}

/**
 * Percorre uma listagem transacional. O CV usa pelo menos quatro convenções de
 * paginação diferentes; `estilo` escolhe a certa para cada endpoint.
 */
export async function paginaRest<T = Record<string, unknown>>(
  config: ConfigCvcrm,
  rota: string,
  opcoes: {
    estilo: "limit-offset" | "pagina-registros";
    filtros?: Record<string, string | number | boolean | undefined>;
    porPagina?: number;
    maxPaginas?: number;
    campoLista: string;
  }
): Promise<T[]> {
  const porPagina = opcoes.porPagina ?? 200;
  const maxPaginas = opcoes.maxPaginas ?? 100;
  const saida: T[] = [];

  for (let pagina = 0; pagina < maxPaginas; pagina++) {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(opcoes.filtros ?? {})) {
      if (valor !== undefined && valor !== "") params.set(chave, String(valor));
    }
    if (opcoes.estilo === "limit-offset") {
      params.set("limit", String(porPagina));
      params.set("offset", String(pagina * porPagina));
    } else {
      params.set("pagina", String(pagina + 1));
      params.set("registros_por_pagina", String(porPagina));
    }

    const resposta = (await chamadaRest(config, `${rota}?${params}`)) as
      | Record<string, unknown>
      | undefined;
    if (!resposta) break;

    const lista = resposta[opcoes.campoLista];
    const registros = Array.isArray(lista) ? (lista as T[]) : [];
    saida.push(...registros);
    if (registros.length < porPagina) break;
  }
  return saida;
}
