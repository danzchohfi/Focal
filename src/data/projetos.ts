import galerias from "./galerias.json";

export type Planta = { img: string; cap: string };

export type Projeto = {
  slug: string;
  nome: string;
  /** Nome quebrado em linhas no card da vitrine */
  nomeCard: [string, string];
  bairro: string;
  statusLabel: "Lançamento" | "Entregue";
  categorias: string[];
  cardImg: string;
  heroImg: string;
  heroTitulo: string;
  heroSub: string;
  /** Specs exibidas no card da home (dormitórios + metragem) */
  cardSpecs: { dorm: string; area: string };
  /** Formulário do hero: Artur usa selects de qualificação; entregues usam mensagem */
  formVariant: "artur" | "entregue";
  strip: string[];
  intro: { titulo: string; texto: string; specs: string[] };
  detalhes: {
    localizacao: string;
    arquitetura: string;
    interiores: string;
    paisagismo: string;
    entregaLabel: string;
    entrega: string;
  };
  /** Percentuais dos gráficos de status da obra */
  status: { label: string; valor: number }[];
  video?: { youtube?: string; mp4?: string };
  destaqueArea: { titulo: string; texto: string; img: string };
  plantas: { titulo: string; texto: string; itens: Planta[] };
  tourUrl?: string;
  folderUrl?: string;
  obra: { titulo: string; fotos: string[]; video?: string; legenda?: string };
  destaques: { icone: string; titulo: string; texto: string }[];
  mapa: string;
  /** Posição do pin no mapa (mesmas coordenadas do WP Go Maps do site atual) */
  mapaCoord: { lat: number; lng: number };
  faleLinha: string;
  legal?: string;
};

const g = galerias as Record<
  string,
  { strip: string[]; plantas: Planta[]; obra: string[] }
>;

export const projetos: Projeto[] = [
  {
    slug: "jaunas-95",
    nome: "Jaúnas 95",
    nomeCard: ["Jaúnas", "95"],
    bairro: "Moema",
    statusLabel: "Entregue",
    categorias: ["entregues"],
    cardImg: "/wp/a47af8eedb3025964abb9c66aac10482-scaled.jpg",
    heroImg: "/wp/jaunas-destaque-scaled.jpg",
    heroTitulo: "Jaúnas 95",
    heroSub:
      "Em uma localização absolutamente premium, de frente ao Parque Ibirapuera, apresentamos um projeto com a leveza e requinte de uma casa.",
    cardSpecs: { dorm: "2 Suítes", area: "138m² a 172m²" },
    formVariant: "entregue",
    strip: g["jaunas-95"].strip,
    intro: {
      titulo:
        "A exclusividade de morar a 5 minutos do Parque Ibirapuera e do Clube Monte Líbano.",
      texto:
        "O Jaúnas 95 conta com a leveza e requinte de uma casa. Nada é padrão: pé-direito mais alto, janelas maiores e laje mais espessa para conforto acústico.",
      specs: ["138m² a 172m²", "2 suítes", "Pé direito > 3 metros", "2 a 3 vagas"],
    },
    detalhes: {
      localizacao: "Alameda Jaunas, 95 - Moema",
      arquitetura: "JBA / Jonas Birger Arquitetura",
      interiores: "Triplex Arquitetura",
      paisagismo: "Sergio Santana",
      entregaLabel: "Data de Entrega",
      entrega: "Março/2020",
    },
    status: [
      { label: "Total Geral", valor: 100 },
      { label: "Fundação", valor: 100 },
      { label: "Estrutura", valor: 100 },
      { label: "Acabamento", valor: 100 },
    ],
    destaqueArea: {
      titulo: "Localizado no melhor ponto do bairro, numa rua arborizada e tranquila.",
      texto: "O projeto foi concebido como uma casa contando com apenas 8 luxuosos apartamentos.",
      img: "/wp/jaunas-destaque2-scaled.jpg",
    },
    plantas: {
      titulo: "138m² a 172m² - 2 Suítes",
      texto: "Um projeto com o sistema de laje plana que permite infinitas configurações.",
      itens: g["jaunas-95"].plantas,
    },
    folderUrl: "/wp/folder-jaunas.pdf",
    obra: { titulo: "Conheça o Jaúnas 95", fotos: g["jaunas-95"].obra },
    destaques: [
      {
        icone: "layers",
        titulo: "Sistema de Laje Plana",
        texto: "Laje com mais de 19cm resultando em menos pilares e vigas para maior flexibilidade de uso.",
      },
      { icone: "car", titulo: "Vagas Privativas", texto: "2 ou 3 vagas determinadas e padrão M ou G." },
      { icone: "pool", titulo: "Lazer Rooftop", texto: "Rooftop com piscina e churrasqueira." },
      { icone: "gym", titulo: "Academia", texto: "Academia completa." },
      { icone: "height", titulo: "Pé direito alto", texto: "Apartamentos com pé direito > 3m." },
    ],
    mapa: "Alameda Jaúnas, 95 - Moema, São Paulo - SP",
    mapaCoord: { lat: -23.5985252, lng: -46.6623678 },
    faleLinha: "Alameda Jaúnas, 95 - Moema, SP",
  },
  {
    slug: "artur-73",
    nome: "Artur 73",
    nomeCard: ["Artur", "73"],
    bairro: "Pinheiros",
    statusLabel: "Lançamento",
    categorias: ["lancamento", "em-construcao"],
    cardImg: "/wp/FACHADA-scaled-1.jpg",
    heroImg: "/wp/artur73-scaled.jpg",
    heroTitulo: "Artur73",
    heroSub:
      "84m² - Pé direito duplo - 2 suítes em uma das principais esquinas da cidade, na Artur Azevedo com a Oscar Freire",
    cardSpecs: { dorm: "2 Suítes", area: "52m² a 88m²" },
    formVariant: "artur",
    strip: g["artur-73"].strip,
    intro: {
      titulo: "Artur 73. Você perto de tudo",
      texto:
        "Já imaginou morar em uma rua sem saída, na esquina com a emblemática Oscar Freire e pertinho do melhor de Pinheiros e dos Jardins?",
      specs: [
        "52m² a 88m²",
        "2 suítes",
        "Pé direito duplo",
        "1 vaga de garagem preparada para futura eletrificação",
      ],
    },
    detalhes: {
      localizacao: "R. Artur de Azevedo, 73 – Esquina com Oscar Freire - Pinheiros",
      arquitetura: "JBA / Jonas Birger Arquitetura",
      interiores: "Melina Romano",
      paisagismo: "Núcleo Arquitetura",
      entregaLabel: "Data de Entrega",
      entrega: "Setembro 2026",
    },
    status: [
      { label: "Total Geral", valor: 66 },
      { label: "Fundação", valor: 100 },
      { label: "Estrutura", valor: 100 },
      { label: "Acabamentos", valor: 20 },
    ],
    video: { youtube: "6AClY3bzMb8", mp4: "/wp/reel-artur73-1.mp4" },
    destaqueArea: {
      titulo: "Conheça uma rara área da cidade cheia de verde e ar fresco",
      texto:
        "Com uma vista privilegiada de todo o verde do complexo do Hospital das Clínicas e da Faculdade de Medicina da USP, e localizado em uma rua sem saída e com acesso cercado por árvores.",
      img: "/wp/1-Drone-SP.jpg",
    },
    plantas: {
      titulo: "52m² a 88 m² - 2 suítes – Pé direito duplo",
      texto: "Um projeto cheio de nuances e inspirações, com um pé direito de tirar o fôlego",
      itens: g["artur-73"].plantas,
    },
    tourUrl: "/tour-virtual",
    folderUrl: "/download-folder-digital",
    obra: {
      titulo: "Conheça o Artur73",
      fotos: g["artur-73"].obra,
      video: "/wp/Focal-Maio-2026-1.mp4",
      legenda: "Maio/2026",
    },
    destaques: [
      {
        icone: "height",
        titulo: "Pé direito duplo",
        texto: "Apartamentos com pé direito duplo, muito arejados, com living de 5,50m e muita luz natural",
      },
      {
        icone: "car",
        titulo: "Vagas Privativas",
        texto: "Todas vagas privativas com infraestrutura para futura eletrificação",
      },
      { icone: "party", titulo: "Salão de festas", texto: "Salão de festas com forno de pizza" },
      {
        icone: "sport",
        titulo: "Quadra integrada",
        texto: "Quadra de areia integrada com churrasqueira à carvão e sports bar",
      },
      {
        icone: "pool",
        titulo: "Piscina de 25m",
        texto: "Rooftop com Piscina de 25m, academia e sala de mindfulness",
      },
      { icone: "shield", titulo: "Guarita blindada", texto: "Guarita blindada e gerador para áreas comuns" },
    ],
    mapa: "Rua Artur de Azevedo, 73 - Pinheiros, São Paulo - SP",
    mapaCoord: { lat: -23.5578801, lng: -46.6735331 },
    faleLinha: "Rua Artur Azevedo, 73 - Pinheiros, SP",
    legal:
      "INCORPORADORA RESPONSÁVEL: JARDIM FGS SPE LTDA. O EMPREENDIMENTO SOMENTE SERÁ COMERCIALIZADO APÓS O REGISTRO DA INCORPORAÇÃO, NOS TERMOS DA LEI Nº 4.591/64. MATERIAL PRELIMINAR SUJEITO A ALTERAÇÕES. IMAGENS MERAMENTE ILUSTRATIVAS. ACABAMENTOS, QUANTIDADE DE MOBILIÁRIO E EQUIPAMENTOS SERÃO ENTREGUES CONFORME MEMORIAL DESCRITIVO DO EMPREENDIMENTO E CONDIÇÕES DO COMPROMISSO DE COMPRA E VENDA. PERSPECTIVAS ARTÍSTICAS DA VEGETAÇÃO COM PORTE ADULTO, QUE SERÁ ATINGIDO APÓS A ENTREGA DO EMPREENDIMENTO E DE ACORDO COM O PROJETO DE PAISAGISMO. INTERMEDIAÇÃO: FOCAL VENDAS LTDA. – AV. BRIGADEIRO FARIA LIMA, 1979 – 1ª ANDAR – JARDIM PAULISTANO – SÃO PAULO-SP – TEL (11) 3136-0142 – CRECI/SP 36385-J E LPS SÃO PAULO – CONSULTORIA DE IMÓVEIS LTDA. – RUA ESTADOS UNIDOS, 1971 – JARDIM AMÉRICA – TEL (11) 3067-0000 – WWW.LOPES.COM.BR – CRECI/SP 24073-J. (*) OS APARTAMENTOS RESIDENCIAIS POSSUEM ÁREA PRIVATIVA DE 81M² A 88M².",
  },
  {
    slug: "mourato-111",
    nome: "Mourato 111",
    nomeCard: ["Mourato", "111"],
    bairro: "Pinheiros",
    statusLabel: "Entregue",
    categorias: ["entregues"],
    cardImg: "/wp/e9782ff72e19a6f01b1def46620edd00.jpg",
    heroImg: "/wp/e9782ff72e19a6f01b1def46620edd00.jpg",
    heroTitulo: "Mourato 111",
    heroSub:
      "82m² a 220m² - 2 a 3 Suítes - o apartamento e o bairro dos seus sonhos estão no melhor lugar.",
    cardSpecs: { dorm: "2 a 3 Suítes", area: "82m² a 220m²" },
    formVariant: "entregue",
    strip: g["mourato-111"].strip,
    intro: {
      titulo: "Mourato 111. Você chegou ao seu destino.",
      texto:
        "Se arte, gastronomia e qualidade de vida se encontram pelas ruas de pinheiros, conforto praticidade e exclusividade se encontram em cada detalhe do Mourato 111.",
      specs: ["82m² a 220m²", "2 a 3 Suítes", "Lazer completo", "1 a 3 vagas"],
    },
    detalhes: {
      localizacao: "Rua Mourato Coelho, 111 - Pinheiros",
      arquitetura: "JBA / Jonas Birger Arquitetura",
      interiores: "Triplex Arquitetura",
      paisagismo: "Sergio Santana",
      entregaLabel: "Data de Entrega",
      entrega: "Setembro/2021",
    },
    status: [
      { label: "Total Geral", valor: 100 },
      { label: "Fundação", valor: 100 },
      { label: "Estrutura", valor: 100 },
      { label: "Acabamentos", valor: 100 },
    ],
    video: { youtube: "nbQTd0qEvWk" },
    destaqueArea: {
      titulo: "Para quem ama sua casa. E tudo que vive fora dela.",
      texto:
        "Pinheiros une o melhor dos mundos. Além de abrigar a efervescência da metrópole, também é o reduto ideal para aquele passeio especial.",
      img: "/wp/3.-ANEXO.jpg",
    },
    plantas: {
      titulo: "82m² a 220m² - 2 a 3 Suítes",
      texto:
        "Um projeto que contempla os conceitos de flexibilidade, inserção na dinâmica urbana e uma fachada atemporal.",
      itens: g["mourato-111"].plantas,
    },
    tourUrl: "http://www.sferica.com.br/temporario/agenciazeroacem/mourato111/",
    folderUrl: "/wp/4.-ANEXO-Folder.pdf",
    obra: { titulo: "Conheça o Mourato 111", fotos: g["mourato-111"].obra },
    destaques: [
      { icone: "layers", titulo: "Plantas flexíveis", texto: "Sem interferências de pilares e vigas na área interna." },
      {
        icone: "desk",
        titulo: "Coworking completo",
        texto: "Para reuniões, trabalhos e estudos equipado com cozinha compartilhada e forno de pizza.",
      },
      { icone: "pet", titulo: "Espaço pet", texto: "Espaço pet friendly." },
    ],
    mapa: "Rua Mourato Coelho, 111 - Pinheiros, São Paulo - SP",
    mapaCoord: { lat: -23.5659311, lng: -46.6860419 },
    faleLinha: "Rua Mourato Coelho, 111 - Pinheiros, SP",
  },
  {
    slug: "padre-carvalho-730",
    nome: "Padre Carvalho 730",
    nomeCard: ["Pe. Carvalho", "730"],
    bairro: "Pinheiros",
    statusLabel: "Entregue",
    categorias: ["entregues"],
    cardImg: "/wp/85a0a6855289cc8143535391ef79eeea.jpg",
    heroImg: "/wp/1.-ANEXO-scaled.jpg",
    heroTitulo: "Padre Carvalho 730",
    heroSub: "Apartamentos de 1 e 2 dormitórios exclusivos para locação na Faria Lima.",
    cardSpecs: { dorm: "1 e 2 Dormitórios", area: "40m² a 105m²" },
    formVariant: "entregue",
    strip: g["padre-carvalho-730"].strip,
    intro: {
      titulo:
        "Conheça o projeto que se destaca no skyline de pinheiros com uma fachada elegante e atemporal.",
      texto: "Em casa desfrute de uma ampla área de lazer com piscina, academia e um super lounge.",
      specs: ["40m² a 105m", "1 ou 2 Dormitórios", "Lazer completo", "1 ou 2 vagas"],
    },
    detalhes: {
      localizacao: "Rua Padre Carvalho, 730 - Pinheiros",
      arquitetura: "JBA / Jonas Birger Arquitetura",
      interiores: "Studio DWG",
      paisagismo: "Núcleo Arquitetura",
      entregaLabel: "Data de Entrega",
      entrega: "Março/2021",
    },
    status: [
      { label: "Total Geral", valor: 100 },
      { label: "Fundação", valor: 100 },
      { label: "Estrutura", valor: 100 },
      { label: "Acabamentos", valor: 100 },
    ],
    destaqueArea: {
      titulo: "Metrô, Trem, Ciclofaixa, Faria Lima e Marginal a poucos passos.",
      texto:
        "Conectividade em primeiro lugar para encurtar a distância entre você e tudo que move sua vida.",
      img: "/wp/2.-ANEXO-scaled.jpg",
    },
    plantas: {
      titulo: "40m² a 105 m² - 1 ou 2 Dormitórios",
      texto: "Apartamentos perfeitos para o seu momento de vida.",
      itens: g["padre-carvalho-730"].plantas,
    },
    obra: { titulo: "Conheça o Padre Carvalho 730", fotos: g["padre-carvalho-730"].obra },
    destaques: [
      { icone: "service", titulo: "Serviços pay-per-use", texto: "Lavanderia, arrumação e limpeza." },
      {
        icone: "sofa",
        titulo: "Apartamentos decorados para locação",
        texto: "Pacotes com unidades totalmente mobiliadas.",
      },
      { icone: "party", titulo: "Salão de festas", texto: "Salão de festas com churrasqueira." },
      { icone: "sauna", titulo: "Sauna", texto: "Sauna." },
    ],
    mapa: "Rua Padre Carvalho, 730 - Pinheiros, São Paulo - SP",
    mapaCoord: { lat: -23.5664343, lng: -46.6965934 },
    faleLinha: "Rua Padre Carvalho, 730 - Pinheiros, SP",
  },
  {
    slug: "quadra-butanta",
    nome: "Quadra Butantã",
    nomeCard: ["Quadra", "Butantã"],
    bairro: "Butantã",
    statusLabel: "Entregue",
    categorias: ["entregues"],
    cardImg: "/wp/quadra-butanta.jpg",
    heroImg: "/wp/01.-ANEXO.jpg",
    heroTitulo: "Quaddra Butantã",
    heroSub: "Apartamentos de 1 e 2 dormitórios no coração do Butantã.",
    cardSpecs: { dorm: "1 e 2 Dormitórios", area: "24m² a 44m²" },
    formVariant: "entregue",
    strip: g["quadra-butanta"].strip,
    intro: {
      titulo: "Ta fácil escolher. Tá fácil de mudar.",
      texto:
        "Já pensou em morar em um bairro com muito verde, com metrô na porta em um condomínio completíssimo com mais de 4.000m² de área de lazer?",
      specs: ["24m² a 44m²", "1 ou 2 Dormitórios", "+ 4.000m² de áreas de lazer", "0 ou 1 vaga de garagem"],
    },
    detalhes: {
      localizacao: "Rua Raul Saddi, 88 - Butantã",
      arquitetura: "JBA / Jonas Birger Arquitetura",
      interiores: "Claudia Albertini",
      paisagismo: "Nucleo Arquitetura",
      entregaLabel: "Data De Entrega",
      entrega: "Dezembro/2023",
    },
    status: [
      { label: "Total Geral", valor: 100 },
      { label: "Fundação", valor: 100 },
      { label: "Estrutura", valor: 100 },
      { label: "Acabamentos", valor: 100 },
    ],
    video: { youtube: "PK-nno_zDA4" },
    destaqueArea: {
      titulo: "Morar no coração do Butantã é prazeroso por motivos que você só encontra aqui.",
      texto:
        "O bairro é arborizado e conta com parques próximos para aproveitar com toda a família. Se tiver de sair, você tem a melhor infraestrutura a sua disposição.",
      img: "/wp/02.-ANEXO.jpg",
    },
    plantas: {
      titulo: "24m² a 44 m² - 1 ou 2 Dormitórios",
      texto: "Plantas inteligentes que aproveitam todos os espaços.",
      itens: g["quadra-butanta"].plantas,
    },
    tourUrl: "https://quadrabutanta.com.br/tour_z515_quadra_butanta/index.html",
    folderUrl: "/wp/FOLDER_butanta.pdf",
    obra: { titulo: "Conheça o Quaddra Butantã", fotos: g["quadra-butanta"].obra },
    destaques: [
      {
        icone: "party",
        titulo: "Lazer com 4.000m²",
        texto: "Salão de festas, churrasqueira, salão de jogos, cinema, brinquedoteca, biblioteca, quadra.",
      },
      { icone: "beauty", titulo: "Oficina e espaço beauty", texto: "Oficina e espaço beauty." },
      { icone: "gym", titulo: "Academia", texto: "Academia completa." },
      { icone: "laundry", titulo: "Lavanderia coletiva", texto: "Lavanderia coletiva." },
      { icone: "pool", titulo: "Piscina", texto: "Piscina com prainha infantil." },
    ],
    mapa: "Rua Raul Saddi, 88 - Butantã, São Paulo - SP",
    mapaCoord: { lat: -23.569292, lng: -46.7128795 },
    faleLinha: "Rua Raul Saddi, 88 - Butantã, SP",
  },
];

export const filtros = [
  { id: "todos", label: "Todos" },
  { id: "lancamento", label: "Lançamento" },
  { id: "em-construcao", label: "Em Construção" },
  { id: "breve-lancamento", label: "Breve Lançamento" },
  { id: "entregues", label: "Entregues" },
];

export function getProjeto(slug: string) {
  return projetos.find((p) => p.slug === slug);
}
