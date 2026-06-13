export const site = {
  nome: "Focal Inc",
  slogan: "Projetos que funcionam, em endereços que permanecem.",
  descricao:
    "Incorporadora paulistana de projetos especiais — do terreno certo à entrega impecável, desde 2016.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://focalinc.com.br",
  telefone: "(11) 3136-0142",
  email: "contato@focalinc.com.br",
  endereco: "Rua Diogo Moreira, 132 — 20º andar, cj. 2010, Pinheiros, São Paulo/SP",
  cnpj: "24.457.654/0001-07",
  fundacao: 2016,
  instagram: "https://www.instagram.com/focal_incorporadora/",
  linkedin: "https://br.linkedin.com/company/focal-inc",
  // Número oficial do WhatsApp comercial (definir com a equipe — ver docs/plano-site-focal.md §8.9)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "551131360142",
  // ⚠️ Números institucionais: confirmar regra de apuração antes do go-live (plano §8.3)
  prova: [
    { value: "R$ 500 mi", label: "em projetos vendidos" },
    { value: "1.300+", label: "unidades entregues" },
    { value: "80.000 m²", label: "construídos" },
    { value: "2016", label: "incorporando em São Paulo" },
  ],
  pilares: [
    {
      titulo: "Localização privilegiada",
      texto:
        "Terreno é critério, não acaso: esquinas consolidadas de bairros tradicionais — como Artur de Azevedo × Oscar Freire, na quadra do metrô.",
    },
    {
      titulo: "Inteligência arquitetônica",
      texto:
        "Projetos pensados como proprietário: pé-direito duplo, luz natural, ventilação e plantas que envelhecem bem. Arquitetura assinada pela JBA.",
    },
    {
      titulo: "Valor calibrado",
      texto:
        "Preço de mercado, sem inflação artificial. O Artur 73 valorizou cerca de 12% ao ano desde o lançamento, em 2023.",
    },
  ],
  passos: [
    {
      titulo: "Descoberta estratégica",
      texto: "Seleção criteriosa do terreno e leitura do bairro antes de qualquer traço.",
    },
    {
      titulo: "Arquitetura intencional",
      texto: "Cada planta nasce da pergunta: “eu moraria aqui?”",
    },
    {
      titulo: "Comercialização inteligente",
      texto: "Atendimento direto, informação completa e preço calibrado ao mercado.",
    },
    {
      titulo: "Entrega impecável",
      texto: "Obra acompanhada de perto e pós-entrega com assistência técnica dedicada.",
    },
  ],
} as const;
