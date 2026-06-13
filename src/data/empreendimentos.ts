import type { Empreendimento } from "@/lib/types";

/**
 * Fonte de verdade do portfólio.
 *
 * Artur 73 (em venda) vem das transcrições e materiais internos. As quatro
 * fichas de entregues — Jaúnas 95, Padre Carvalho 730, Mourato 111 e Quaddra
 * Butantã — foram extraídas das páginas reais de focalinc.com.br (texto, fichas
 * técnicas, fotos e folders). Nada aqui é inventado: o que não constava no site
 * fica vazio e está listado como pendência no commit/relatório.
 *
 * "Breve lançamento" segue em draft: o site atual só exibe os teasers "Pinheiros
 * 1" e "Pinheiros 2", sem ficha técnica (ver docs/plano-site-focal.md §8).
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

  // ——— Entregues (fichas extraídas de focalinc.com.br) ———
  {
    slug: "jaunas-95",
    nome: "Jaúnas 95",
    bairro: "Moema",
    endereco: "Alameda Jaúnas, 95 — Moema, São Paulo/SP",
    status: "entregue",
    anoEntrega: "2020",
    arquitetura: "JBA — Jonas Birger Arquitetura",
    metragem: { min: 132, max: 172 },
    usos: ["residencial"],
    heroImage: "/images/jaunas-95/fachada.jpg",
    resumo30s: [
      "A cinco minutos do Parque Ibirapuera e do Clube Monte Líbano, em rua arborizada de Moema.",
      "Projeto concebido como uma casa: apenas 8 apartamentos.",
      "Nada padrão — pé-direito acima de 3 m, janelas maiores e laje mais espessa para conforto acústico.",
      "Sistema de laje plana com mais de 19 cm: menos pilares e vigas, plantas flexíveis.",
      "Entregue em março de 2020. Arquitetura JBA, interiores Triplex Arquitetura, paisagismo Sergio Santana.",
    ],
    highlights: [
      { label: "Metragem", value: "138–172 m²" },
      { label: "Tipologia", value: "2 suítes" },
      { label: "Pé-direito", value: "acima de 3 m" },
      { label: "Vagas", value: "2 a 3 por unidade" },
    ],
    tipologias: [
      {
        nome: "Tipo — 2 suítes",
        uso: "residencial",
        area: "132 m²",
        detalhes: [
          "2 suítes — com opção de living integrado ou de 1 suíte ampliada",
          "Sistema de laje plana (>19 cm): planta flexível, sem vigas aparentes",
          "Pé-direito acima de 3 m",
        ],
      },
      {
        nome: "Garden — 2 suítes",
        uso: "residencial",
        area: "172 m²",
        detalhes: ["2 suítes", "Maior metragem do projeto, com área externa privativa"],
      },
      {
        nome: "Cobertura — 2 suítes",
        uso: "residencial",
        area: "132 m²",
        detalhes: ["2 suítes", "Unidade de cobertura"],
      },
    ],
    diferenciais: [
      {
        titulo: "Sistema de laje plana",
        texto:
          "Laje com mais de 19 cm resulta em menos pilares e vigas — mais flexibilidade para configurar a planta como se quiser.",
        imagem: "/images/jaunas-95/fachada-rua.jpg",
      },
      {
        titulo: "Pé-direito alto e conforto acústico",
        texto:
          "Apartamentos com pé-direito acima de 3 m, janelas maiores e laje mais espessa — a leveza de uma casa, com isolamento de som.",
        imagem: "/images/jaunas-95/rooftop-lounge.jpg",
      },
      {
        titulo: "Lazer no rooftop",
        texto: "Rooftop com piscina e churrasqueira, além de academia completa.",
        imagem: "/images/jaunas-95/rooftop-piscina.jpg",
      },
      {
        titulo: "Segurança redundante",
        texto: "Guarita blindada e gerador para 100% do edifício.",
        imagem: "/images/jaunas-95/academia.jpg",
      },
    ],
    galeria: [
      { src: "/images/jaunas-95/aerea.jpg", legenda: "Vista aérea — cobertura e rooftop", categoria: "fachada" },
      { src: "/images/jaunas-95/fachada-rua.jpg", legenda: "Fachada na Alameda Jaúnas", categoria: "fachada" },
      { src: "/images/jaunas-95/rooftop-piscina.jpg", legenda: "Rooftop com piscina e churrasqueira", categoria: "areas-comuns" },
      { src: "/images/jaunas-95/rooftop-lounge.jpg", legenda: "Lounge do rooftop", categoria: "areas-comuns" },
      { src: "/images/jaunas-95/academia.jpg", legenda: "Academia completa", categoria: "areas-comuns" },
    ],
    entorno: [
      { nome: "Parque Ibirapuera", distancia: "5 min", tipo: "parque" },
      { nome: "Clube Monte Líbano", distancia: "5 min", tipo: "serviços" },
    ],
    faq: [
      {
        q: "Quando o Jaúnas 95 foi entregue?",
        a: "Entregue em março de 2020.",
      },
      {
        q: "Quem assina o projeto?",
        a: "Arquitetura JBA / Jonas Birger Arquitetura, interiores da Triplex Arquitetura e paisagismo de Sergio Santana.",
      },
      {
        q: "Quais são as metragens e tipologias?",
        a: "De 138 a 172 m², com plantas de 2 suítes — incluindo opções de living integrado, garden e cobertura. O sistema de laje plana permite reconfigurar os ambientes.",
      },
      {
        q: "O Jaúnas 95 está disponível para compra?",
        a: "É um empreendimento entregue. Para saber sobre unidades disponíveis no mercado, fale com a equipe pelo WhatsApp.",
      },
    ],
    documentos: [
      { nome: "Folder digital — Jaúnas 95", href: "https://focalinc.com.br/wp-content/uploads/2023/11/folder-jaunas.pdf" },
    ],
  },
  {
    slug: "padre-carvalho-730",
    nome: "Padre Carvalho 730",
    bairro: "Pinheiros",
    endereco: "Rua Padre Carvalho, 730 — Pinheiros, São Paulo/SP",
    status: "entregue",
    anoEntrega: "2021",
    arquitetura: "JBA — Jonas Birger Arquitetura",
    metragem: { min: 40, max: 105 },
    usos: ["residencial"],
    heroImage: "/images/padre-carvalho-730/aerea.jpg",
    resumo30s: [
      "Apartamentos de 1 e 2 dormitórios na região da Faria Lima, voltados para locação.",
      "Fachada elegante e atemporal que se destaca no skyline de Pinheiros.",
      "Metrô, trem, ciclofaixa, Faria Lima e Marginal a poucos passos.",
      "Lazer com piscina de 25 m, academia com equipamentos Matrix, sauna e salão de festas.",
      "Entregue em março de 2021. Arquitetura JBA, interiores Studio DWG, paisagismo Núcleo Arquitetura.",
    ],
    highlights: [
      { label: "Metragem", value: "40–105 m²" },
      { label: "Tipologia", value: "1 e 2 dormitórios" },
      { label: "Vocação", value: "locação na Faria Lima" },
      { label: "Vagas", value: "1 ou 2 por unidade" },
    ],
    tipologias: [
      { nome: "40 m² — 1 dormitório", uso: "residencial", area: "40 m²", detalhes: ["1 dormitório"] },
      { nome: "48 m² — 1 dormitório", uso: "residencial", area: "48 m²", detalhes: ["1 dormitório"] },
      { nome: "65 m² — 2 dormitórios", uso: "residencial", area: "65 m²", detalhes: ["2 dormitórios"] },
      { nome: "74 m² — 2 dormitórios", uso: "residencial", area: "74 m²", detalhes: ["2 dormitórios"] },
      { nome: "85 m² — 1 suíte, living ampliado", uso: "residencial", area: "85 m²", detalhes: ["1 suíte", "Living ampliado"] },
      { nome: "105 m² — 1 suíte ampliada", uso: "residencial", area: "105 m²", detalhes: ["1 suíte ampliada"] },
    ],
    diferenciais: [
      {
        titulo: "Conectividade no centro de Pinheiros",
        texto: "Metrô, trem, ciclofaixa, Faria Lima e Marginal a poucos passos — perto de tudo que move o dia.",
        imagem: "/images/padre-carvalho-730/aerea-rooftop.jpg",
      },
      {
        titulo: "Pensado para locação",
        texto: "Apartamentos com pacotes mobiliados e serviços pay-per-use — lavanderia, arrumação e limpeza.",
        imagem: "/images/padre-carvalho-730/entrada.jpg",
      },
      {
        titulo: "Lazer completo",
        texto: "Piscina de 25 m, academia com equipamentos Matrix, sauna e salão de festas com churrasqueira.",
        imagem: "/images/padre-carvalho-730/lounge-rooftop.jpg",
      },
      {
        titulo: "Fachada atemporal",
        texto: "Volume elegante assinado pela JBA que se destaca no skyline do bairro.",
        imagem: "/images/padre-carvalho-730/rooftop-jardim.jpg",
      },
    ],
    galeria: [
      { src: "/images/padre-carvalho-730/fachada.jpg", legenda: "Fachada na Rua Padre Carvalho", categoria: "fachada" },
      { src: "/images/padre-carvalho-730/entrada.jpg", legenda: "Entrada do edifício", categoria: "fachada" },
      { src: "/images/padre-carvalho-730/aerea-rooftop.jpg", legenda: "Vista aérea — rooftop e Pinheiros", categoria: "fachada" },
      { src: "/images/padre-carvalho-730/lounge-rooftop.jpg", legenda: "Lounge no rooftop, com vista", categoria: "areas-comuns" },
      { src: "/images/padre-carvalho-730/rooftop-jardim.jpg", legenda: "Paisagismo do rooftop", categoria: "areas-comuns" },
    ],
    entorno: [
      { nome: "Metrô", distancia: "a poucos passos", tipo: "metrô" },
      { nome: "Trem (CPTM)", distancia: "a poucos passos", tipo: "serviços" },
      { nome: "Avenida Faria Lima", distancia: "a poucos passos", tipo: "serviços" },
      { nome: "Marginal Pinheiros", distancia: "a poucos passos", tipo: "serviços" },
      { nome: "Ciclofaixa", distancia: "a poucos passos", tipo: "serviços" },
    ],
    faq: [
      {
        q: "Quando o Padre Carvalho 730 foi entregue?",
        a: "Entregue em março de 2021.",
      },
      {
        q: "Quem assina o projeto?",
        a: "Arquitetura JBA / Jonas Birger Arquitetura, interiores do Studio DWG e paisagismo da Núcleo Arquitetura.",
      },
      {
        q: "Quais são as metragens e tipologias?",
        a: "De 40 a 105 m², com plantas de 1 e 2 dormitórios, incluindo opções de suíte e living ampliado.",
      },
      {
        q: "O Padre Carvalho 730 é voltado para locação?",
        a: "Sim — o projeto foi concebido para locação na região da Faria Lima, com pacotes mobiliados e serviços pay-per-use. Para disponibilidade, fale com a equipe.",
      },
    ],
    documentos: [],
  },
  {
    slug: "mourato-111",
    nome: "Mourato 111",
    bairro: "Pinheiros",
    endereco: "Rua Mourato Coelho, 111 — Pinheiros, São Paulo/SP",
    status: "entregue",
    anoEntrega: "2021",
    arquitetura: "JBA — Jonas Birger Arquitetura",
    metragem: { min: 82, max: 220 },
    usos: ["residencial"],
    heroImage: "/images/mourato-111/fachada.jpg",
    resumo30s: [
      "No coração de Pinheiros — arte, gastronomia e qualidade de vida na porta.",
      "Plantas flexíveis, sem interferência de pilares e vigas na área interna.",
      "Unidades de 147 m² com elevador social privativo; depósito privativo em todas.",
      "Rooftop a mais de 70 m de altura, com piscina cênica e academia.",
      "Entregue em setembro de 2021. Arquitetura JBA, interiores Triplex Arquitetura, paisagismo Sergio Santana.",
    ],
    highlights: [
      { label: "Metragem", value: "82–220 m²" },
      { label: "Tipologia", value: "2 a 3 suítes / dormitórios" },
      { label: "Rooftop", value: "+70 m de altura" },
      { label: "Vagas", value: "1 a 3 por unidade" },
    ],
    tipologias: [
      { nome: "82 m² — 2 dormitórios", uso: "residencial", area: "82 m²", detalhes: ["2 dormitórios", "Depósito privativo"] },
      {
        nome: "147 m² — 2 dormitórios",
        uso: "residencial",
        area: "147 m²",
        detalhes: ["2 dormitórios", "Elevador social privativo", "Depósito privativo"],
      },
      {
        nome: "147 m² — 3 dormitórios",
        uso: "residencial",
        area: "147 m²",
        detalhes: ["3 dormitórios", "Elevador social privativo", "Depósito privativo"],
      },
      { nome: "Garden — 2 suítes", uso: "residencial", area: "121 m²", detalhes: ["2 suítes", "Unidade especial — garden"] },
      { nome: "Garden — 3 dormitórios", uso: "residencial", area: "220 m²", detalhes: ["3 dormitórios", "Unidade especial — garden"] },
    ],
    diferenciais: [
      {
        titulo: "Plantas flexíveis",
        texto: "Área interna sem interferência de pilares e vigas — espaço livre para configurar como quiser.",
        imagem: "/images/mourato-111/aerea.jpg",
      },
      {
        titulo: "Coworking completo",
        texto: "Espaço para reuniões, trabalho e estudo, com cozinha compartilhada e forno de pizza.",
        imagem: "/images/mourato-111/coworking.jpg",
      },
      {
        titulo: "Rooftop a +70 m",
        texto: "Piscina cênica e academia no topo, com a vista de Pinheiros.",
        imagem: "/images/mourato-111/rooftop-piscina.jpg",
      },
      {
        titulo: "Privacidade nas unidades de 147 m²",
        texto: "Elevador social privativo nas unidades de 147 m² e depósito privativo em todas.",
        imagem: "/images/mourato-111/brinquedoteca.jpg",
      },
    ],
    galeria: [
      { src: "/images/mourato-111/aerea.jpg", legenda: "Vista aérea — Pinheiros", categoria: "fachada" },
      { src: "/images/mourato-111/rooftop-piscina.jpg", legenda: "Rooftop a +70 m — piscina cênica", categoria: "areas-comuns" },
      { src: "/images/mourato-111/coworking.jpg", legenda: "Coworking com cozinha compartilhada", categoria: "areas-comuns" },
      { src: "/images/mourato-111/brinquedoteca.jpg", legenda: "Brinquedoteca", categoria: "areas-comuns" },
      { src: "/images/mourato-111/academia.jpg", legenda: "Academia", categoria: "areas-comuns" },
      { src: "/images/mourato-111/living-82.jpg", legenda: "Living — planta de 82 m²", categoria: "interiores" },
    ],
    entorno: [],
    faq: [
      {
        q: "Quando o Mourato 111 foi entregue?",
        a: "Entregue em setembro de 2021.",
      },
      {
        q: "Quem assina o projeto?",
        a: "Arquitetura JBA / Jonas Birger Arquitetura, interiores da Triplex Arquitetura e paisagismo de Sergio Santana.",
      },
      {
        q: "Quais são as metragens e tipologias?",
        a: "De 82 a 220 m², com plantas de 2 e 3 dormitórios e unidades especiais garden. As unidades de 147 m² têm elevador social privativo.",
      },
      {
        q: "O Mourato 111 está disponível para compra?",
        a: "É um empreendimento entregue. Para saber sobre unidades disponíveis no mercado, fale com a equipe pelo WhatsApp.",
      },
    ],
    documentos: [
      { nome: "Folder digital — Mourato 111", href: "https://focalinc.com.br/wp-content/uploads/2023/11/4.-ANEXO-Folder.pdf" },
    ],
  },
  {
    slug: "quadra-butanta",
    nome: "Quaddra Butantã",
    bairro: "Butantã",
    endereco: "Rua Raul Saddi, 88 — Butantã, São Paulo/SP",
    status: "entregue",
    anoEntrega: "2023",
    arquitetura: "JBA — Jonas Birger Arquitetura",
    metragem: { min: 24, max: 44 },
    usos: ["residencial"],
    heroImage: "/images/quadra-butanta/aerea.jpg",
    tourVirtual: "https://quadrabutanta.com.br/tour_z515_quadra_butanta/index.html",
    resumo30s: [
      "No coração do Butantã, bairro arborizado e com metrô por perto.",
      "Condomínio com mais de 4.000 m² de área de lazer.",
      "Apartamentos de 1 e 2 dormitórios, de 24 a 44 m², com plantas que aproveitam todos os espaços.",
      "Lazer com piscina e prainha infantil, academia, salão de jogos, cinema e quadra.",
      "Entregue em dezembro de 2023. Arquitetura JBA, interiores Claudia Albertini, paisagismo Núcleo Arquitetura.",
    ],
    highlights: [
      { label: "Metragem", value: "24–44 m²" },
      { label: "Tipologia", value: "1 e 2 dormitórios" },
      { label: "Lazer", value: "+4.000 m²" },
      { label: "Vagas", value: "0 ou 1 por unidade" },
    ],
    tipologias: [
      { nome: "24 m² — 1 dormitório", uso: "residencial", area: "24 m²", detalhes: ["1 dormitório", "Planta compacta e funcional"] },
      { nome: "33 m² — 2 dormitórios", uso: "residencial", area: "33 m²", detalhes: ["2 dormitórios"] },
      { nome: "44 m² — 2 dormitórios com terraço", uso: "residencial", area: "44 m²", detalhes: ["2 dormitórios", "Terraço"] },
    ],
    diferenciais: [
      {
        titulo: "Mais de 4.000 m² de lazer",
        texto:
          "Salão de festas, churrasqueira, salão de jogos, cinema, brinquedoteca, biblioteca e quadra — tudo dentro de casa.",
        imagem: "/images/quadra-butanta/salao-jogos.jpg",
      },
      {
        titulo: "Piscina com prainha",
        texto: "Piscina com prainha infantil para aproveitar com a família.",
        imagem: "/images/quadra-butanta/piscina.jpg",
      },
      {
        titulo: "Serviços do dia a dia",
        texto: "Lavanderia coletiva, oficina, espaço beauty, espaço pet e academia.",
        imagem: "/images/quadra-butanta/academia.jpg",
      },
      {
        titulo: "Butantã arborizado, metrô por perto",
        texto: "Bairro verde, com parques próximos e metrô nas proximidades para encurtar os trajetos.",
        imagem: "/images/quadra-butanta/fachada.jpg",
      },
    ],
    galeria: [
      { src: "/images/quadra-butanta/aerea.jpg", legenda: "Vista aérea — torres e entorno arborizado", categoria: "fachada" },
      { src: "/images/quadra-butanta/fachada.jpg", legenda: "Fachada e térreo na Rua Raul Saddi", categoria: "fachada" },
      { src: "/images/quadra-butanta/piscina.jpg", legenda: "Piscina com prainha infantil", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/lounge.jpg", legenda: "Espaço de convivência", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/salao-jogos.jpg", legenda: "Salão de jogos", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/academia.jpg", legenda: "Academia", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/brinquedoteca.jpg", legenda: "Brinquedoteca", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/quadra.jpg", legenda: "Quadra", categoria: "areas-comuns" },
      { src: "/images/quadra-butanta/bicicletario.jpg", legenda: "Bicicletário", categoria: "areas-comuns" },
    ],
    entorno: [
      { nome: "Metrô (Linha 4-Amarela)", distancia: "nas proximidades", tipo: "metrô" },
      { nome: "Parques do entorno", distancia: "nas proximidades", tipo: "parque" },
    ],
    faq: [
      {
        q: "Quando o Quaddra Butantã foi entregue?",
        a: "Entregue em dezembro de 2023.",
      },
      {
        q: "Quem assina o projeto?",
        a: "Arquitetura JBA / Jonas Birger Arquitetura, interiores de Claudia Albertini e paisagismo da Núcleo Arquitetura.",
      },
      {
        q: "Como é a área de lazer?",
        a: "São mais de 4.000 m²: piscina com prainha, academia, salão de festas, salão de jogos, cinema, brinquedoteca, biblioteca, quadra, lavanderia coletiva, oficina, espaço beauty e espaço pet.",
      },
      {
        q: "O Quaddra Butantã está disponível para compra?",
        a: "É um empreendimento entregue. Para saber sobre unidades disponíveis no mercado, fale com a equipe pelo WhatsApp.",
      },
    ],
    documentos: [
      { nome: "Folder digital — Quaddra Butantã", href: "https://focalinc.com.br/wp-content/uploads/2023/11/FOLDER_butanta.pdf" },
    ],
  },

  // ——— Breve lançamento (sem ficha técnica no site — só teasers) ———
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
