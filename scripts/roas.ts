#!/usr/bin/env tsx
// CLI do pipeline de atribuição e ROAS.
//
//   pnpm roas:sync                      sincroniza custo (Google/Meta) + CRM e
//                                       devolve as conversões offline
//   pnpm roas:relatorio -- --de … --ate …   monta o relatório
//   tsx scripts/roas.ts cliques         snapshot diário gclid → anúncio
//   tsx scripts/roas.ts demo            popula dados de exemplo e mostra o
//                                       relatório (para ver o formato antes de
//                                       ter credencial de qualquer fornecedor)
//
// Roda no Node, fora do Next: é o que o cron da hospedagem executa.

import { repositorio } from "@/lib/dados/repositorio";
import type { RegistroCusto, RegistroEvento, RegistroLead, RegistroToque } from "@/lib/dados/tipos";
import { montaRelatorio } from "@/lib/roas/relatorio";
import type { Dimensao, LinhaRelatorio, ModeloAtribuicao, Relatorio } from "@/lib/roas/tipos";
import { janelaRecente, sincronizaTudo } from "@/lib/roas/sincronizacao";
import { snapshotCliquesGoogle } from "@/lib/ads/google/custos";
import { novoRef } from "@/lib/atribuicao/ref";
import { chavesIdentidade, hasheiaIdentidade } from "@/lib/atribuicao/identidade";

/* ─────────────────────────  argumentos  ───────────────────────── */

function argumentos(argv: string[]) {
  const saida: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const chave = item.slice(2);
    const proximo = argv[i + 1];
    if (proximo && !proximo.startsWith("--")) {
      saida[chave] = proximo;
      i++;
    } else {
      saida[chave] = true;
    }
  }
  return saida;
}

/* ─────────────────────────  formatação  ───────────────────────── */

const reais = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function vazio(valor: number | undefined, formata: (n: number) => string) {
  return valor === undefined || Number.isNaN(valor) ? "—" : formata(valor);
}

const COLUNAS: { titulo: string; largura: number; valor: (l: LinhaRelatorio) => string }[] = [
  { titulo: "Origem", largura: 46, valor: (l) => l.rotulo },
  { titulo: "Investido", largura: 12, valor: (l) => reais.format(l.investimento) },
  { titulo: "Leads", largura: 7, valor: (l) => decimal.format(l.leads) },
  { titulo: "Qualif.", largura: 8, valor: (l) => decimal.format(l.qualificados) },
  { titulo: "Vendas", largura: 7, valor: (l) => decimal.format(l.vendas) },
  { titulo: "VGV", largura: 15, valor: (l) => reais.format(l.vgv) },
  { titulo: "CPL", largura: 11, valor: (l) => vazio(l.cpl, (n) => reais.format(n)) },
  { titulo: "CPL qual.", largura: 11, valor: (l) => vazio(l.cplQualificado, (n) => reais.format(n)) },
  { titulo: "CAC", largura: 13, valor: (l) => vazio(l.cac, (n) => reais.format(n)) },
  { titulo: "ROAS", largura: 9, valor: (l) => vazio(l.roas, (n) => `${decimal.format(n)}x`) },
  { titulo: "Dias", largura: 6, valor: (l) => vazio(l.diasAteVenda, (n) => String(n)) },
];

function corta(texto: string, largura: number) {
  return texto.length > largura ? `${texto.slice(0, largura - 1)}…` : texto.padEnd(largura);
}

function imprimeTabela(relatorio: Relatorio) {
  const { opcoes, total, cobertura } = relatorio;
  // A primeira coluna carrega a hierarquia inteira (plataforma · campanha ·
  // grupo · anúncio) e cresce muito na dimensão de anúncio; dimensioná-la pelo
  // conteúdo evita cortar justamente o nome do criativo.
  COLUNAS[0].largura = Math.min(
    72,
    Math.max(20, ...relatorio.linhas.map((linha) => linha.rotulo.length))
  );
  console.log(
    `\nROAS · ${opcoes.de} a ${opcoes.ate} · dimensão: ${opcoes.dimensao} · ` +
      `modelo: ${opcoes.modelo} · base: ${opcoes.base}` +
      (opcoes.fracaoReceita !== 1 ? ` · receita: ${opcoes.fracaoReceita * 100}% do VGV` : "")
  );
  console.log(
    opcoes.base === "clique"
      ? "Coorte por data do clique: o investimento do período é comparado ao que ELE gerou, mesmo que a venda tenha saído depois.\n"
      : "Base por data do evento: mostra o que entrou no período, misturando safras de investimento.\n"
  );

  if (relatorio.maturidade) {
    const { fracao, cicloDias, observado } = relatorio.maturidade;
    const fonte = observado ? "medido nas vendas reais" : "estimado, ainda sem venda medida";
    console.log(
      fracao >= 0.95
        ? `Coorte madura (ciclo de ${cicloDias} dias, ${fonte}).\n`
        : `Coorte ${Math.round(fracao * 100)}% madura — os cliques deste período tiveram, em média, ` +
            `essa fração do ciclo de ${cicloDias} dias (${fonte}). O ROAS abaixo ainda vai subir.\n`
    );
  }

  console.log(COLUNAS.map((c) => corta(c.titulo, c.largura)).join(" "));
  console.log(COLUNAS.map((c) => "─".repeat(c.largura)).join(" "));
  for (const linha of relatorio.linhas) {
    console.log(COLUNAS.map((c) => corta(c.valor(linha), c.largura)).join(" "));
  }
  console.log(COLUNAS.map((c) => "─".repeat(c.largura)).join(" "));
  console.log(COLUNAS.map((c) => corta(c.valor(total), c.largura)).join(" "));

  const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—");
  console.log("\nCobertura da atribuição");
  console.log(
    `  jornadas no período: ${cobertura.jornadas} · conciliadas: ${cobertura.conciliadas} ` +
      `(${pct(cobertura.conciliadas, cobertura.jornadas)})`
  );
  console.log(
    `  por código: ${cobertura.porMetodo.ref} · por telefone: ${cobertura.porMetodo.telefone} · ` +
      `por e-mail: ${cobertura.porMetodo.email} · sem vínculo: ${cobertura.porMetodo.sem_correspondencia}`
  );
  console.log(
    `  vendas: ${cobertura.vendas} · com origem identificada: ${cobertura.vendasConciliadas} ` +
      `(${pct(cobertura.vendasConciliadas, cobertura.vendas)})`
  );
  console.log(
    `  VGV total: ${reais.format(cobertura.vgvTotal)} · atribuído: ${reais.format(cobertura.vgvConciliado)}`
  );
  if (cobertura.investimentoSemJornada > 0) {
    console.log(
      `  ⚠️  ${reais.format(cobertura.investimentoSemJornada)} investidos sem nenhum lead rastreado`
    );
  }
  console.log("");
}

function imprimeCsv(relatorio: Relatorio) {
  const cabecalho = [
    "chave",
    "rotulo",
    "plataforma",
    "campanha_id",
    "campanha",
    "grupo_id",
    "grupo",
    "anuncio_id",
    "anuncio",
    "investimento",
    "impressoes",
    "cliques",
    "leads",
    "qualificados",
    "visitas",
    "propostas",
    "reservas",
    "vendas",
    "distratos",
    "vgv",
    "receita",
    "cpl",
    "cpl_qualificado",
    "cac",
    "roas",
    "ticket_medio",
    "dias_ate_venda",
  ];
  const escapa = (valor: unknown) => {
    const texto = valor === undefined || valor === null ? "" : String(valor);
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  console.log(cabecalho.join(","));
  for (const l of [...relatorio.linhas, relatorio.total]) {
    console.log(
      [
        l.chave,
        l.rotulo,
        l.plataforma,
        l.campanhaId,
        l.campanhaNome,
        l.grupoId,
        l.grupoNome,
        l.anuncioId,
        l.anuncioNome,
        l.investimento,
        l.impressoes,
        l.cliques,
        l.leads,
        l.qualificados,
        l.visitas,
        l.propostas,
        l.reservas,
        l.vendas,
        l.distratos,
        l.vgv,
        l.receita,
        l.cpl,
        l.cplQualificado,
        l.cac,
        l.roas,
        l.ticketMedio,
        l.diasAteVenda,
      ]
        .map(escapa)
        .join(",")
    );
  }
}

/* ─────────────────────────  comandos  ───────────────────────── */

async function comandoRelatorio(args: Record<string, string | boolean>) {
  const padrao = janelaRecente(90);
  const banco = repositorio();
  const [toques, leads, eventos, custos] = await Promise.all([
    banco.listaToques(),
    banco.listaLeads(),
    banco.listaEventos(),
    banco.listaCustos(),
  ]);

  const relatorio = montaRelatorio(
    { toques, leads, eventos, custos },
    {
      de: String(args.de ?? padrao.de),
      ate: String(args.ate ?? padrao.ate),
      dimensao: (args.dimensao as Dimensao) ?? "campanha",
      modelo: (args.modelo as ModeloAtribuicao) ?? "ultimo",
      base: args.base === "evento" ? "evento" : "clique",
      fracaoReceita: args.receita ? Number(args.receita) : 1,
      empreendimento: args.empreendimento ? String(args.empreendimento) : undefined,
    }
  );

  if (args.formato === "json") console.log(JSON.stringify(relatorio, null, 2));
  else if (args.formato === "csv") imprimeCsv(relatorio);
  else imprimeTabela(relatorio);
}

async function comandoSync(args: Record<string, string | boolean>) {
  const resultado = await sincronizaTudo({
    dias: args.dias ? Number(args.dias) : 30,
    homologacao: !!args.homologacao,
  });
  console.log(JSON.stringify(resultado, null, 2));

  const problemas = [...resultado.custos.erros, ...resultado.crm.erros];
  if (problemas.length) {
    console.error(`\n${problemas.length} integração(ões) com erro:`);
    for (const erro of problemas) console.error(`  · ${erro}`);
    process.exitCode = 1;
  }
}

async function comandoCliques(args: Record<string, string | boolean>) {
  // O vínculo gclid → anúncio só existe por ~90 dias no Google. Como a venda
  // chega bem depois disso, este snapshot precisa rodar todo dia.
  const ontem = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const dia = String(args.dia ?? ontem);
  const cliques = await snapshotCliquesGoogle(dia);
  console.log(JSON.stringify({ dia, cliques: cliques.length }, null, 2));
  if (cliques.length) {
    await repositorio().salva(
      "toques",
      cliques.map((clique) => ({ ...clique, id: `gclid|${clique.gclid}` }))
    );
  }
}

/** Dados de exemplo para ver o relatório antes de qualquer credencial. */
async function comandoDemo() {
  const banco = repositorio();
  const hoje = new Date();
  const dia = (atras: number) =>
    new Date(hoje.getTime() - atras * 86_400_000).toISOString().slice(0, 10);
  const iso = (atras: number) => new Date(hoje.getTime() - atras * 86_400_000).toISOString();

  const cenarios = [
    { ref: novoRef(), plat: "google" as const, camp: "22110044", grupo: "1810", anuncio: "7761", vendeu: true, valor: 2_054_000 },
    { ref: novoRef(), plat: "google" as const, camp: "22110044", grupo: "1811", anuncio: "7762", vendeu: false, valor: 0 },
    { ref: novoRef(), plat: "meta" as const, camp: "62002233", grupo: "62002234", anuncio: "62002235", vendeu: true, valor: 1_500_000 },
    { ref: novoRef(), plat: "meta" as const, camp: "62002233", grupo: "62002236", anuncio: "62002237", vendeu: false, valor: 0 },
  ];

  const toques: RegistroToque[] = [];
  const leads: RegistroLead[] = [];
  const eventos: RegistroEvento[] = [];
  const custos: RegistroCusto[] = [];

  for (const [indice, cenario] of cenarios.entries()) {
    const canal = cenario.plat === "google" ? ("google_ads" as const) : ("meta_ads" as const);
    const telefone = `55119000000${indice}0`;
    const chaves = chavesIdentidade({ telefone });
    const hashes = await hasheiaIdentidade({ telefone, nome: `Cliente Demo ${indice}` });
    const atribuicao = {
      v: 1 as const,
      ref: cenario.ref,
      primeiro: { ts: iso(150), lp: "/artur-73", canal },
      ultimo: { ts: iso(150), lp: "/artur-73", canal },
      toques: 1,
      criadoEm: iso(150),
    };

    toques.push({
      id: `demo-toque-${indice}`,
      ref: cenario.ref,
      tipo: "whatsapp",
      ts: iso(150),
      canal,
      plataforma: cenario.plat,
      campanhaId: cenario.camp,
      grupoId: cenario.grupo,
      anuncioId: cenario.anuncio,
      canalPrimeiro: canal,
      toques: 1,
      atribuicao,
      contexto: "artur-73",
    });

    leads.push({
      id: `demo-lead-${indice}`,
      ref: cenario.ref,
      criadoEm: iso(150),
      nome: `Cliente Demo ${indice}`,
      telefone,
      telefoneNormalizado: telefone,
      telefoneSha256: hashes.telefoneSha256Meta,
      chaves,
      contexto: "artur-73",
      atribuicao,
    });

    eventos.push(
      { id: `demo-ev-${indice}-lead`, ref: cenario.ref, chaves, etapa: "lead", ts: iso(150), moeda: "BRL", fonte: "site" },
      { id: `demo-ev-${indice}-qual`, ref: cenario.ref, chaves, etapa: "qualificado", ts: iso(148), moeda: "BRL", fonte: "lais" }
    );
    if (cenario.vendeu) {
      eventos.push({
        id: `demo-ev-${indice}-visita`,
        ref: cenario.ref,
        chaves,
        etapa: "visita",
        ts: iso(130),
        moeda: "BRL",
        fonte: "cvcrm",
      });
      eventos.push({
        id: `demo-ev-${indice}-venda`,
        ref: cenario.ref,
        chaves,
        etapa: "venda",
        ts: iso(20),
        valor: cenario.valor,
        moeda: "BRL",
        fonte: "cvcrm",
        empreendimento: "artur-73",
      });
    }

    custos.push({
      id: `demo-custo-${indice}`,
      data: dia(150),
      plataforma: cenario.plat,
      campanhaId: cenario.camp,
      campanhaNome: cenario.plat === "google" ? "Artur 73 · Search" : "Artur 73 · Advantage+",
      grupoId: cenario.grupo,
      grupoNome: cenario.plat === "google" ? "pé-direito duplo" : "público 1%",
      anuncioId: cenario.anuncio,
      anuncioNome: `criativo ${indice + 1}`,
      impressoes: 42_000,
      cliques: 900,
      custo: 6_500 + indice * 1_200,
    });
  }

  await Promise.all([
    banco.salvaToques(toques),
    banco.salvaLeads(leads),
    banco.salvaEventos(eventos),
    banco.salvaCustos(custos),
  ]);
  console.log(`Dados de exemplo gravados em "${banco.nome}".`);

  await comandoRelatorio({ de: dia(180), ate: dia(0), dimensao: "anuncio" });
}

/* ─────────────────────────  entrada  ───────────────────────── */

async function principal() {
  const [comando, ...resto] = process.argv.slice(2);
  const args = argumentos(resto);

  switch (comando) {
    case "sync":
      return comandoSync(args);
    case "relatorio":
      return comandoRelatorio(args);
    case "cliques":
      return comandoCliques(args);
    case "demo":
      return comandoDemo();
    default:
      console.log(
        [
          "Uso: tsx scripts/roas.ts <comando> [opções]",
          "",
          "  sync        --dias 30 --homologacao",
          "  relatorio   --de 2026-03-01 --ate 2026-03-31 --dimensao campanha|grupo|anuncio|plataforma",
          "              --modelo primeiro|ultimo|linear --base clique|evento",
          "              --receita 0.04 --empreendimento artur-73 --formato tabela|json|csv",
          "  cliques     --dia 2026-08-19",
          "  demo",
        ].join("\n")
      );
      process.exitCode = comando ? 1 : 0;
  }
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
