import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Atribuicao } from "@/lib/atribuicao/tipos";
import type { RegistroCusto, RegistroEvento, RegistroLead, RegistroToque } from "@/lib/dados/tipos";
import { conciliaJornadas, montaJornadas } from "./conciliacao";
import { montaRelatorio } from "./relatorio";
import type { EntradaRelatorio } from "./tipos";

/* ─────────────────────────  fábricas  ───────────────────────── */

function atribuicao(ref: string, ts: string): Atribuicao {
  const toque = { ts, lp: "/artur-73", canal: "google_ads" as const };
  return { v: 1, ref, primeiro: toque, ultimo: toque, toques: 1, criadoEm: ts };
}

function toque(p: Partial<RegistroToque> & { ref: string; ts: string }): RegistroToque {
  return {
    id: `${p.ref}|${p.ts}`,
    tipo: "whatsapp",
    canal: "google_ads",
    plataforma: "google",
    canalPrimeiro: p.canal ?? "google_ads",
    toques: 1,
    atribuicao: atribuicao(p.ref, p.ts),
    ...p,
  };
}

function lead(ref: string, telefone: string): RegistroLead {
  return {
    id: `lead-${ref}`,
    ref,
    criadoEm: "2026-03-10T12:00:00.000Z",
    chaves: [`tel:${telefone}`],
    telefoneNormalizado: telefone,
  };
}

function evento(p: Partial<RegistroEvento> & { id: string; etapa: RegistroEvento["etapa"]; ts: string }): RegistroEvento {
  return { chaves: [], moeda: "BRL", fonte: "cvcrm", ...p };
}

function custo(p: Partial<RegistroCusto> & { id: string; data: string; custo: number }): RegistroCusto {
  return {
    plataforma: "google",
    campanhaId: "C1",
    impressoes: 1000,
    cliques: 50,
    ...p,
  };
}

/** Cenário base: um clique em março que vira venda de R$ 2,054 mi em julho. */
function cenario(): EntradaRelatorio {
  return {
    custos: [
      custo({
        id: "g1",
        data: "2026-03-10",
        custo: 5000,
        campanhaId: "C1",
        campanhaNome: "Artur 73 · Search",
        grupoId: "G1",
        grupoNome: "pé-direito duplo",
        anuncioId: "A1",
        anuncioNome: "anúncio 81m²",
      }),
      custo({
        id: "m1",
        data: "2026-03-15",
        custo: 3000,
        plataforma: "meta",
        campanhaId: "C2",
        campanhaNome: "Artur 73 · Advantage+",
        anuncioId: "A2",
      }),
    ],
    toques: [
      toque({
        ref: "FCL-AAAAAAAA",
        ts: "2026-03-10T14:00:00.000Z",
        campanhaId: "C1",
        grupoId: "G1",
        anuncioId: "A1",
      }),
      toque({
        ref: "FCL-BBBBBBBB",
        ts: "2026-03-15T14:00:00.000Z",
        canal: "meta_ads",
        plataforma: "meta",
        campanhaId: "C2",
        anuncioId: "A2",
      }),
    ],
    leads: [lead("FCL-AAAAAAAA", "5511900000001"), lead("FCL-BBBBBBBB", "5511900000002")],
    eventos: [
      evento({ id: "e1", ref: "FCL-AAAAAAAA", etapa: "lead", ts: "2026-03-10T14:05:00.000Z" }),
      evento({ id: "e2", ref: "FCL-AAAAAAAA", etapa: "qualificado", ts: "2026-03-11T10:00:00.000Z" }),
      evento({
        id: "e3",
        ref: "FCL-AAAAAAAA",
        etapa: "venda",
        ts: "2026-07-20T10:00:00.000Z",
        valor: 2_054_000,
      }),
      evento({ id: "e4", ref: "FCL-BBBBBBBB", etapa: "lead", ts: "2026-03-15T14:05:00.000Z" }),
    ],
  };
}

const MARCO = { de: "2026-03-01", ate: "2026-03-31" };

/* ─────────────────────────  testes  ───────────────────────── */

describe("coorte por data do clique", () => {
  it("credita a venda de julho ao investimento de março", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, dimensao: "campanha" });
    const google = relatorio.linhas.find((linha) => linha.campanhaId === "C1");

    assert.ok(google);
    assert.equal(google.investimento, 5000);
    assert.equal(google.leads, 1);
    assert.equal(google.vendas, 1);
    assert.equal(google.vgv, 2_054_000);
    assert.equal(google.roas, 2_054_000 / 5000);
    assert.equal(google.cac, 5000);
    assert.equal(google.cpl, 5000);
    // 10/03 → 20/07 = 132 dias.
    assert.equal(google.diasAteVenda, 132);
  });

  it("a venda conta como qualificada mesmo sem evento intermediário", () => {
    const dados = cenario();
    dados.eventos = dados.eventos.filter((evento) => evento.etapa !== "qualificado");
    const relatorio = montaRelatorio(dados, { ...MARCO, dimensao: "campanha" });
    const google = relatorio.linhas.find((linha) => linha.campanhaId === "C1");
    assert.equal(google?.qualificados, 1);
    assert.equal(google?.visitas, 1);
  });

  it("campanha sem venda fica com ROAS zero, não indefinido", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, dimensao: "campanha" });
    const meta = relatorio.linhas.find((linha) => linha.campanhaId === "C2");
    assert.equal(meta?.leads, 1);
    assert.equal(meta?.vendas, 0);
    assert.equal(meta?.roas, 0);
    assert.equal(meta?.cac, undefined, "CAC sem venda não pode ser 0 nem Infinity");
  });

  it("base por evento mostra o descasamento de safra", () => {
    // Em julho a venda aparece, mas o investimento que a gerou foi em março:
    // dividir um pelo outro é exatamente o erro que a base 'clique' evita.
    const relatorio = montaRelatorio(cenario(), {
      de: "2026-07-01",
      ate: "2026-07-31",
      base: "evento",
      dimensao: "campanha",
    });
    assert.equal(relatorio.total.investimento, 0);
    assert.equal(relatorio.total.vgv, 2_054_000);
    assert.equal(relatorio.total.roas, undefined);
  });
});

describe("dimensões", () => {
  it("quebra por grupo de anúncios e por anúncio", () => {
    const porGrupo = montaRelatorio(cenario(), { ...MARCO, dimensao: "grupo" });
    const grupo = porGrupo.linhas.find((linha) => linha.grupoId === "G1");
    assert.equal(grupo?.investimento, 5000);
    assert.equal(grupo?.vendas, 1);
    assert.match(grupo?.rotulo ?? "", /pé-direito duplo/);

    const porAnuncio = montaRelatorio(cenario(), { ...MARCO, dimensao: "anuncio" });
    const anuncio = porAnuncio.linhas.find((linha) => linha.anuncioId === "A1");
    assert.equal(anuncio?.vgv, 2_054_000);
    assert.match(anuncio?.rotulo ?? "", /anúncio 81m²/);
  });

  it("agrupa por plataforma respondendo 'foi Google ou Meta?'", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, dimensao: "plataforma" });
    assert.deepEqual(
      relatorio.linhas.map((linha) => [linha.plataforma, linha.investimento, linha.vendas]),
      [
        ["google", 5000, 1],
        ["meta", 3000, 0],
      ]
    );
  });
});

describe("modelos de atribuição", () => {
  function doisToques() {
    const dados = cenario();
    // O mesmo lead volta pela Meta antes de comprar.
    dados.toques.push(
      toque({
        ref: "FCL-AAAAAAAA",
        ts: "2026-03-20T14:00:00.000Z",
        canal: "meta_ads",
        plataforma: "meta",
        campanhaId: "C2",
        anuncioId: "A2",
      })
    );
    return dados;
  }

  it("último toque dá todo o crédito à Meta", () => {
    const relatorio = montaRelatorio(doisToques(), { ...MARCO, modelo: "ultimo", dimensao: "campanha" });
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C2")?.vgv, 2_054_000);
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C1")?.vgv, 0);
  });

  it("primeiro toque dá todo o crédito ao Google", () => {
    const relatorio = montaRelatorio(doisToques(), { ...MARCO, modelo: "primeiro", dimensao: "campanha" });
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C1")?.vgv, 2_054_000);
  });

  it("linear divide o crédito e o total continua fechando", () => {
    const relatorio = montaRelatorio(doisToques(), { ...MARCO, modelo: "linear", dimensao: "campanha" });
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C1")?.vgv, 1_027_000);
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C2")?.vgv, 1_027_000);
    assert.equal(relatorio.total.vgv, 2_054_000);
    assert.equal(relatorio.total.vendas, 1);
  });

  it("toque posterior à venda não recebe crédito", () => {
    const dados = cenario();
    dados.toques.push(
      toque({
        ref: "FCL-AAAAAAAA",
        ts: "2026-09-01T14:00:00.000Z",
        canal: "meta_ads",
        plataforma: "meta",
        campanhaId: "C2",
      })
    );
    const relatorio = montaRelatorio(dados, {
      de: "2026-01-01",
      ate: "2026-12-31",
      modelo: "ultimo",
      dimensao: "campanha",
    });
    assert.equal(relatorio.linhas.find((l) => l.campanhaId === "C1")?.vgv, 2_054_000);
  });
});

describe("distrato", () => {
  it("zera o VGV da venda desfeita mas mantém o custo", () => {
    const dados = cenario();
    dados.eventos.push(
      evento({ id: "e5", ref: "FCL-AAAAAAAA", etapa: "distrato", ts: "2026-09-01T10:00:00.000Z" })
    );
    const relatorio = montaRelatorio(dados, { ...MARCO, dimensao: "campanha" });
    const google = relatorio.linhas.find((linha) => linha.campanhaId === "C1");
    assert.equal(google?.vgv, 0);
    assert.equal(google?.distratos, 1);
    assert.equal(google?.investimento, 5000);
    assert.equal(google?.roas, 0);
  });
});

describe("conciliação sem código", () => {
  it("casa a venda pelo telefone quando o código não voltou do CRM", () => {
    const dados = cenario();
    // O cliente apagou o código antes de mandar a mensagem: o CRM só tem o
    // telefone. O join precisa cair no telefone e continuar creditando.
    dados.eventos = dados.eventos.map((evento) =>
      evento.ref === "FCL-AAAAAAAA"
        ? { ...evento, ref: undefined, chaves: ["tel:5511900000001"] }
        : evento
    );
    const relatorio = montaRelatorio(dados, { ...MARCO, dimensao: "campanha" });
    assert.equal(relatorio.linhas.find((linha) => linha.campanhaId === "C1")?.vgv, 2_054_000);
    assert.equal(relatorio.cobertura.porMetodo.telefone, 1);
    assert.equal(relatorio.cobertura.porMetodo.ref, 1);
  });

  it("venda sem nenhum vínculo aparece na cobertura, não no ROAS", () => {
    const dados = cenario();
    dados.eventos.push(
      evento({
        id: "e9",
        etapa: "venda",
        ts: "2026-03-25T10:00:00.000Z",
        valor: 1_500_000,
        chaves: ["tel:5511900009999"],
      })
    );
    const relatorio = montaRelatorio(dados, { ...MARCO, base: "evento", dimensao: "campanha" });
    assert.equal(relatorio.cobertura.vendas, 1);
    assert.equal(relatorio.cobertura.vendasConciliadas, 0);
    assert.equal(relatorio.cobertura.porMetodo.sem_correspondencia, 1);
    assert.equal(relatorio.total.vgv, 0, "VGV órfão não pode inflar o ROAS de ninguém");
  });

  it("lead 100% orgânico é conciliado mas não credita mídia paga", () => {
    const dados = cenario();
    dados.toques = dados.toques.map((toqueAtual) =>
      toqueAtual.ref === "FCL-AAAAAAAA"
        ? { ...toqueAtual, canal: "google_organico" as const, plataforma: "google" as const }
        : toqueAtual
    );
    const relatorio = montaRelatorio(dados, { ...MARCO, dimensao: "campanha" });
    assert.equal(relatorio.total.vgv, 0);
    assert.equal(relatorio.cobertura.porMetodo.ref, 2);
    assert.equal(relatorio.cobertura.vendasConciliadas, 0);
  });
});

describe("janela de atribuição", () => {
  it("clique velho demais não reivindica a venda", () => {
    const jornadas = montaJornadas(
      [
        evento({
          id: "v1",
          ref: "FCL-AAAAAAAA",
          etapa: "venda",
          ts: "2027-06-01T10:00:00.000Z",
          valor: 1_000_000,
        }),
      ],
      []
    );
    const conciliadas = conciliaJornadas(
      jornadas,
      [toque({ ref: "FCL-AAAAAAAA", ts: "2026-03-10T14:00:00.000Z" })],
      [],
      { janelaDias: 365 }
    );
    assert.equal(conciliadas[0].creditos.length, 0);
    assert.equal(conciliadas[0].metodo, "ref");
  });
});

describe("receita x VGV", () => {
  it("fracaoReceita transforma ROAS sobre VGV em ROAS sobre comissão", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, dimensao: "campanha", fracaoReceita: 0.04 });
    const google = relatorio.linhas.find((linha) => linha.campanhaId === "C1");
    assert.equal(google?.vgv, 2_054_000);
    assert.equal(google?.receita, 2_054_000 * 0.04);
    assert.equal(google?.roas, (2_054_000 * 0.04) / 5000);
  });
});

describe("cobertura", () => {
  it("mostra o investimento que não gerou nenhum lead rastreado", () => {
    const dados = cenario();
    dados.custos.push(
      custo({ id: "g2", data: "2026-03-12", custo: 1200, campanhaId: "C9", campanhaNome: "Display" })
    );
    const relatorio = montaRelatorio(dados, { ...MARCO, dimensao: "campanha" });
    assert.equal(relatorio.cobertura.investimentoSemJornada, 1200);
  });
});

describe("maturidade da coorte", () => {
  // "hoje" é injetado: o cálculo depende de quanto tempo passou desde o
  // clique, e um teste que dependesse do relógio quebraria sozinho.
  const HOJE = "2026-08-20T12:00:00.000Z";

  it("coorte antiga está madura; coorte de ontem, não", () => {
    const dados = cenario();
    const madura = montaRelatorio(dados, {
      ...MARCO,
      agora: HOJE,
      cicloDias: 120,
    });
    // Cliques de março, 160+ dias atrás, com ciclo de 120 → maduros.
    assert.equal(madura.maturidade?.fracao, 1);

    dados.custos = dados.custos.map((custo) => ({ ...custo, data: "2026-08-19" }));
    const verde = montaRelatorio(dados, {
      de: "2026-08-01",
      ate: "2026-08-31",
      agora: HOJE,
      cicloDias: 120,
    });
    assert.ok((verde.maturidade?.fracao ?? 1) < 0.02);
  });

  it("pondera pelo investimento de cada dia", () => {
    const dados = cenario();
    dados.custos = [
      custo({ id: "velho", data: "2026-01-01", custo: 1000, campanhaId: "C1" }),
      custo({ id: "novo", data: "2026-08-19", custo: 1000, campanhaId: "C2", plataforma: "meta" }),
    ];
    const relatorio = montaRelatorio(dados, {
      de: "2026-01-01",
      ate: "2026-08-31",
      agora: HOJE,
      cicloDias: 120,
    });
    // Metade do investimento maduro (fração 1) e metade quase zerada.
    assert.ok(Math.abs((relatorio.maturidade?.fracao ?? 0) - 0.5) < 0.01);
  });

  it("usa a mediana observada quando existe e marca como observada", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, agora: HOJE });
    assert.equal(relatorio.maturidade?.observado, true);
    assert.equal(relatorio.maturidade?.cicloDias, 132);
  });

  it("cai para a estimativa padrão sem venda medida", () => {
    const dados = cenario();
    dados.eventos = dados.eventos.filter((evento) => evento.etapa !== "venda");
    const relatorio = montaRelatorio(dados, { ...MARCO, agora: HOJE });
    assert.equal(relatorio.maturidade?.observado, false);
    assert.equal(relatorio.maturidade?.cicloDias, 120);
  });

  it("não aparece em período sem investimento nenhum", () => {
    const relatorio = montaRelatorio(cenario(), {
      de: "2026-07-01",
      ate: "2026-07-31",
      agora: HOJE,
    });
    assert.equal(relatorio.maturidade, undefined);
  });

  it("não se aplica à base por data do evento", () => {
    const relatorio = montaRelatorio(cenario(), { ...MARCO, base: "evento", agora: HOJE });
    assert.equal(relatorio.maturidade, undefined);
  });
});
