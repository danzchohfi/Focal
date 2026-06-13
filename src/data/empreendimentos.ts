import type { Empreendimento } from "@/lib/types";

/**
 * Fonte de verdade do portfólio.
 *
 * O Artur 73 está completo (dados das transcrições e materiais internos).
 * As demais fichas estão em `draft: true` até recebermos os inputs listados
 * em docs/plano-site-focal.md §8 (nomes, endereços, metragens, fotos, books
 * e os materiais do "Novo Jango"). Fichas em draft aparecem na vitrine como
 * "em preparação", sem dados inventados.
 */
export const empreendimentos: Empreendimento[] = [
  {
    slug: "artur-73",
    nome: "Artur 73",
    bairro: "Pinheiros",
    endereco: "Rua Artur de Azevedo × Rua Oscar Freire — Pinheiros, São Paulo/SP",
    status: "em-construcao",
    entrega: "2026",
    anoLancamento: "2023",
    arquitetura: "JBA — Jonas Birger Arquitetura",
    metragem: { min: 52, max: 88 },
    usos: ["residencial", "nr"],
    precoAPartir: "R$ 2,054 mi",
    resumo30s: [
      "Esquina da Artur de Azevedo com a Oscar Freire, em rua sem saída — na mesma quadra do metrô.",
      "Living com pé-direito duplo de 5,5 m e luz natural o dia inteiro.",
      "Torre única de 27 pavimentos com apenas 60 unidades, projeto JBA.",
      "Rooftop com piscina de 25 m e academia a mais de 80 m de altura.",
      "Entrega em 2026 — decorados de 81 m² e NR em produção.",
    ],
    highlights: [
      { label: "Residencial", value: "81–88 m² · 2 suítes" },
      { label: "Pé-direito", value: "5,5 m no living" },
      { label: "NR / investimento", value: "studios 52 m²" },
      { label: "Vaga", value: "1 vaga com infra para carro elétrico" },
    ],
    tipologias: [
      {
        nome: "Residencial 81–88 m²",
        uso: "residencial",
        area: "81 a 88 m² privativos",
        detalhes: [
          "2 suítes + lavabo",
          "Living com pé-direito duplo de 5,5 m",
          "1 vaga com infraestrutura para eletrificação",
          "Luz natural e ventilação cruzada",
        ],
        precoAPartir: "R$ 2,054 mi",
        disponibilidade: "Últimas unidades — consulte disponibilidade",
      },
      {
        nome: "NR 52 m² — investimento",
        uso: "nr",
        area: "52 m² privativos",
        detalhes: [
          "Studios não residenciais para locação de curta temporada",
          "Valorização de ~12% ao ano desde o lançamento (2023)",
          "Mesma quadra do metrô — alta liquidez de locação",
        ],
        precoAPartir: "R$ 1,5 mi",
        disponibilidade: "Unidades disponíveis",
      },
    ],
    diferenciais: [
      {
        titulo: "Pé-direito duplo de 5,5 m",
        texto:
          "O living de dupla altura muda a escala da casa: mais luz, mais ar e uma sala que se tornou a assinatura do projeto.",
      },
      {
        titulo: "A esquina certa",
        texto:
          "Artur de Azevedo com Oscar Freire, em rua sem saída e na mesma quadra do metrô: silêncio de rua local com acesso de eixo estrutural (Rebouças/Eusébio Matoso).",
      },
      {
        titulo: "Lazer em altura",
        texto:
          "Dois pavimentos de lazer e rooftop com piscina de 25 m, academia a +80 m de altura, quadra de areia, sports bar, hidro e espaço mindfulness.",
      },
      {
        titulo: "Projeto JBA",
        texto:
          "Arquitetura da Jonas Birger Arquitetura, com plantas funcionais que maximizam luz, ventilação e fluidez — feitas para envelhecer bem.",
      },
    ],
    galeria: [
      { legenda: "Fachada — esquina Artur de Azevedo × Oscar Freire", categoria: "fachada" },
      { legenda: "Living com pé-direito duplo de 5,5 m — apto. 84 m² decorado", categoria: "interiores" },
      { legenda: "Rooftop — piscina de 25 m com vista panorâmica", categoria: "areas-comuns" },
      { legenda: "Academia a mais de 80 m de altura", categoria: "areas-comuns" },
      { legenda: "Studio NR 52 m² — decorado", categoria: "interiores" },
      { legenda: "Evolução da obra — estrutura concluída", categoria: "obra" },
    ],
    entorno: [
      { nome: "Estação Fradique Coutinho (Linha 4)", distancia: "na mesma quadra", tipo: "metrô" },
      { nome: "Rua dos Pinheiros — gastronomia", distancia: "5 min a pé", tipo: "gastronomia" },
      { nome: "Hospital das Clínicas", distancia: "10 min", tipo: "saúde" },
      { nome: "Praça Benedito Calixto", distancia: "8 min a pé", tipo: "parque" },
      { nome: "Eixo Rebouças / Eusébio Matoso", distancia: "acesso imediato", tipo: "serviços" },
    ],
    investimento: {
      titulo: "Tese de investimento — studios NR",
      texto:
        "Unidades não residenciais de 52 m² desenhadas para locação de curta temporada, na quadra do metrô e no coração de Pinheiros.",
      dados: [
        { label: "A partir de", value: "R$ 1,5 mi" },
        { label: "Valorização desde 2023", value: "~12% a.a." },
        { label: "Uso", value: "short-stay / locação" },
      ],
    },
    faq: [
      {
        q: "Qual o prazo de entrega?",
        a: "A entrega está prevista para 2026. O diário de obra é atualizado periodicamente nesta página.",
      },
      {
        q: "Qual o preço das unidades?",
        a: "Residenciais (81–88 m²) a partir de R$ 2,054 milhões; studios NR (52 m²) a partir de R$ 1,5 milhão. Condições e disponibilidade direto com a equipe no WhatsApp.",
      },
      {
        q: "Posso morar em uma unidade NR?",
        a: "As unidades NR têm destinação não residencial, ideais para locação de curta temporada e consultórios/estúdios. Nossa equipe explica as regras de uso caso a caso.",
      },
      {
        q: "Há vaga de garagem?",
        a: "Os residenciais têm 1 vaga com infraestrutura pronta para futura eletrificação.",
      },
      {
        q: "Dá para visitar o decorado?",
        a: "Sim — os decorados de 81 m² e do studio NR estão em produção. Agende pelo WhatsApp para conhecer o apartamento e o tour virtual.",
      },
    ],
    documentos: [],
    tourVirtual: undefined,
  },

  // ——— Fichas aguardando conteúdo aprovado (plano §8) ———
  {
    slug: "empreendimento-entregue-1",
    nome: "Ficha em preparação",
    bairro: "São Paulo",
    endereco: "",
    status: "entregue",
    metragem: { min: 0, max: 0 },
    usos: ["residencial"],
    resumo30s: [],
    highlights: [],
    tipologias: [],
    diferenciais: [],
    galeria: [],
    entorno: [],
    faq: [],
    documentos: [],
    draft: true,
  },
  {
    slug: "empreendimento-entregue-2",
    nome: "Ficha em preparação",
    bairro: "São Paulo",
    endereco: "",
    status: "entregue",
    metragem: { min: 0, max: 0 },
    usos: ["residencial"],
    resumo30s: [],
    highlights: [],
    tipologias: [],
    diferenciais: [],
    galeria: [],
    entorno: [],
    faq: [],
    documentos: [],
    draft: true,
  },
  {
    slug: "empreendimento-entregue-3",
    nome: "Ficha em preparação",
    bairro: "São Paulo",
    endereco: "",
    status: "entregue",
    metragem: { min: 0, max: 0 },
    usos: ["residencial"],
    resumo30s: [],
    highlights: [],
    tipologias: [],
    diferenciais: [],
    galeria: [],
    entorno: [],
    faq: [],
    documentos: [],
    draft: true,
  },
  {
    slug: "breve-lancamento",
    nome: "Breve lançamento",
    bairro: "São Paulo",
    endereco: "",
    status: "breve-lancamento",
    metragem: { min: 0, max: 0 },
    usos: ["residencial"],
    resumo30s: [],
    highlights: [],
    tipologias: [],
    diferenciais: [],
    galeria: [],
    entorno: [],
    faq: [],
    documentos: [],
    draft: true,
  },
];

export const publicados = empreendimentos.filter((e) => !e.draft);
export const rascunhos = empreendimentos.filter((e) => e.draft);

export const porSlug = (slug: string) =>
  publicados.find((e) => e.slug === slug);
