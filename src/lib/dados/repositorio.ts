// Repositório do warehouse de atribuição.
//
// A escolha do backend é por variável de ambiente, e o resto do código não
// sabe qual está ativo:
//
//   SUPABASE_URL + SUPABASE_SERVICE_KEY  → Postgres gerenciado (recomendado:
//                                          leitura e escrita, e o cliente
//                                          consegue plugar Looker Studio nele)
//   ATRIBUICAO_ARQUIVO=/caminho/dir      → arquivos JSONL (dev e self-hosted)
//   nenhuma                              → memória (perde no restart)
//
// Independente do backend, `LEAD_WEBHOOK_URL` continua recebendo um espelho de
// cada gravação — é o caminho de menor atrito para n8n/Make/Planilhas.

import type {
  Colecao,
  FiltroPeriodo,
  RegistroConciliacao,
  RegistroCusto,
  RegistroEvento,
  RegistroLead,
  RegistroToque,
} from "./tipos";

export type Repositorio = {
  nome: string;
  /** Falso quando o backend só escreve (webhook) ou não está configurado. */
  leitura: boolean;
  salva<T extends { id: string }>(colecao: Colecao, registros: T[]): Promise<void>;
  lista<T>(colecao: Colecao, filtro?: FiltroPeriodo & { campoData?: string }): Promise<T[]>;
};

export type RepositorioTipado = Repositorio & {
  salvaToques(r: RegistroToque[]): Promise<void>;
  salvaLeads(r: RegistroLead[]): Promise<void>;
  salvaEventos(r: RegistroEvento[]): Promise<void>;
  salvaCustos(r: RegistroCusto[]): Promise<void>;
  salvaConciliacoes(r: RegistroConciliacao[]): Promise<void>;
  listaToques(f?: FiltroPeriodo): Promise<RegistroToque[]>;
  listaLeads(f?: FiltroPeriodo): Promise<RegistroLead[]>;
  listaEventos(f?: FiltroPeriodo): Promise<RegistroEvento[]>;
  listaCustos(f?: FiltroPeriodo): Promise<RegistroCusto[]>;
  listaConciliacoes(f?: FiltroPeriodo): Promise<RegistroConciliacao[]>;
};

/** Campo de data usado para filtrar cada coleção. */
const CAMPO_DATA: Record<Colecao, string> = {
  toques: "ts",
  leads: "criadoEm",
  eventos: "ts",
  custos: "data",
  conciliacoes: "conciliadoEm",
};

export function camelParaSnake(chave: string) {
  return chave.replace(/[A-Z]/g, (letra) => `_${letra.toLowerCase()}`);
}

export function snakeParaCamel(chave: string) {
  return chave.replace(/_([a-z0-9])/g, (_, letra: string) => letra.toUpperCase());
}

function paraLinha(registro: Record<string, unknown>) {
  const linha: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(registro)) {
    if (valor !== undefined) linha[camelParaSnake(chave)] = valor;
  }
  return linha;
}

function paraRegistro<T>(linha: Record<string, unknown>): T {
  const registro: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(linha)) {
    if (valor !== null && valor !== undefined) registro[snakeParaCamel(chave)] = valor;
  }
  return registro as T;
}

/* ───────────────────────────  memória  ─────────────────────────── */

function repositorioMemoria(): Repositorio {
  const tabelas = new Map<Colecao, Map<string, unknown>>();
  const tabela = (colecao: Colecao) => {
    if (!tabelas.has(colecao)) tabelas.set(colecao, new Map());
    return tabelas.get(colecao)!;
  };
  return {
    nome: "memoria",
    leitura: true,
    async salva(colecao, registros) {
      for (const registro of registros) tabela(colecao).set(registro.id, registro);
    },
    async lista(colecao, filtro) {
      return filtraPeriodo([...tabela(colecao).values()], colecao, filtro) as never;
    },
  };
}

/* ───────────────────────────  arquivo  ─────────────────────────── */

function repositorioArquivo(diretorio: string): Repositorio {
  // `require` dinâmico: o módulo de arquivos não existe no runtime Edge, e o
  // import estático quebraria o bundle do middleware.
  const fs = () => import("node:fs/promises");
  const caminho = async (colecao: Colecao) => {
    const path = await import("node:path");
    return path.join(diretorio, `${colecao}.jsonl`);
  };

  return {
    nome: `arquivo:${diretorio}`,
    leitura: true,
    async salva(colecao, registros) {
      if (!registros.length) return;
      const modulo = await fs();
      await modulo.mkdir(diretorio, { recursive: true });
      const linhas = registros.map((r) => JSON.stringify(r)).join("\n");
      await modulo.appendFile(await caminho(colecao), `${linhas}\n`, "utf8");
    },
    async lista(colecao, filtro) {
      const modulo = await fs();
      let bruto: string;
      try {
        bruto = await modulo.readFile(await caminho(colecao), "utf8");
      } catch {
        return [] as never;
      }
      // Última gravação de cada id vence (o JSONL é append-only).
      const porId = new Map<string, Record<string, unknown>>();
      for (const linha of bruto.split("\n")) {
        if (!linha.trim()) continue;
        try {
          const registro = JSON.parse(linha) as Record<string, unknown>;
          porId.set(String(registro.id), registro);
        } catch {
          /* linha corrompida: ignora */
        }
      }
      return filtraPeriodo([...porId.values()], colecao, filtro) as never;
    },
  };
}

/* ───────────────────────────  supabase  ─────────────────────────── */

function repositorioSupabase(url: string, chave: string): Repositorio {
  const base = `${url.replace(/\/$/, "")}/rest/v1`;
  const headers = {
    apikey: chave,
    Authorization: `Bearer ${chave}`,
    "Content-Type": "application/json",
  };
  const tabela = (colecao: Colecao) => `atr_${colecao}`;

  return {
    nome: "supabase",
    leitura: true,
    async salva(colecao, registros) {
      if (!registros.length) return;
      const resposta = await fetch(`${base}/${tabela(colecao)}`, {
        method: "POST",
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(registros.map((r) => paraLinha(r as Record<string, unknown>))),
      });
      if (!resposta.ok) {
        throw new Error(`supabase ${colecao}: ${resposta.status} ${await resposta.text()}`);
      }
    },
    async lista(colecao, filtro) {
      const campo = camelParaSnake(filtro?.campoData ?? CAMPO_DATA[colecao]);
      const params = new URLSearchParams({ select: "*", limit: "50000" });
      if (filtro?.de) params.append(campo, `gte.${filtro.de}`);
      if (filtro?.ate) params.append(campo, `lte.${filtro.ate}`);
      const resposta = await fetch(`${base}/${tabela(colecao)}?${params}`, { headers });
      if (!resposta.ok) {
        throw new Error(`supabase ${colecao}: ${resposta.status} ${await resposta.text()}`);
      }
      const linhas = (await resposta.json()) as Record<string, unknown>[];
      return linhas.map((linha) => paraRegistro(linha)) as never;
    },
  };
}

/* ───────────────────────────  webhook  ─────────────────────────── */

/** Espelho write-only: não substitui o repositório, complementa. */
async function espelhaNoWebhook(colecao: Colecao, registros: unknown[]) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url || !registros.length) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colecao, registros, enviadoEm: new Date().toISOString() }),
    });
  } catch {
    // O webhook é conveniência; falha nele não pode derrubar a gravação.
  }
}

/* ───────────────────────────  fábrica  ─────────────────────────── */

function filtraPeriodo(
  registros: unknown[],
  colecao: Colecao,
  filtro?: FiltroPeriodo & { campoData?: string }
) {
  if (!filtro?.de && !filtro?.ate) return registros;
  const campo = filtro?.campoData ?? CAMPO_DATA[colecao];
  return registros.filter((registro) => {
    const valor = (registro as Record<string, string>)[campo];
    if (!valor) return true;
    if (filtro.de && valor < filtro.de) return false;
    if (filtro.ate && valor > filtro.ate) return false;
    return true;
  });
}

let instancia: RepositorioTipado | undefined;

function escolheBackend(): Repositorio {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, ATRIBUICAO_ARQUIVO } = process.env;
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    return repositorioSupabase(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  if (ATRIBUICAO_ARQUIVO) return repositorioArquivo(ATRIBUICAO_ARQUIVO);
  return repositorioMemoria();
}

/** Repositório ativo (singleton por processo). */
export function repositorio(): RepositorioTipado {
  if (instancia) return instancia;
  const backend = escolheBackend();

  const salva: Repositorio["salva"] = async (colecao, registros) => {
    if (!registros.length) return;
    await backend.salva(colecao, registros);
    await espelhaNoWebhook(colecao, registros);
  };

  instancia = {
    ...backend,
    salva,
    salvaToques: (r) => salva("toques", r),
    salvaLeads: (r) => salva("leads", r),
    salvaEventos: (r) => salva("eventos", r),
    salvaCustos: (r) => salva("custos", r),
    salvaConciliacoes: (r) => salva("conciliacoes", r),
    listaToques: (f) => backend.lista("toques", f),
    listaLeads: (f) => backend.lista("leads", f),
    listaEventos: (f) => backend.lista("eventos", f),
    listaCustos: (f) => backend.lista("custos", f),
    listaConciliacoes: (f) => backend.lista("conciliacoes", f),
  };
  return instancia;
}

/** Reseta o singleton — usado nos testes. */
export function reiniciaRepositorio() {
  instancia = undefined;
}
