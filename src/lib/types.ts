export type Status =
  | "breve-lancamento"
  | "lancamento"
  | "em-construcao"
  | "entregue";

export type Uso = "residencial" | "nr";

export interface Tipologia {
  nome: string;
  uso: Uso;
  area: string;
  detalhes: string[];
  precoAPartir?: string;
  disponibilidade?: string;
  planta?: string; // caminho da imagem da planta
}

export interface ItemGaleria {
  src?: string; // quando vazio, renderiza placeholder editorial
  legenda: string;
  categoria: "fachada" | "areas-comuns" | "interiores" | "obra";
}

export interface PontoEntorno {
  nome: string;
  distancia: string;
  tipo: "metrô" | "saúde" | "educação" | "gastronomia" | "parque" | "serviços";
}

export interface Empreendimento {
  slug: string;
  nome: string;
  bairro: string;
  endereco: string;
  status: Status;
  entrega?: string;
  anoLancamento?: string;
  anoEntrega?: string;
  arquitetura?: string;
  metragem: { min: number; max: number };
  usos: Uso[];
  precoAPartir?: string;
  resumo30s: string[];
  highlights: { label: string; value: string }[];
  tipologias: Tipologia[];
  diferenciais: { titulo: string; texto: string; imagem?: string }[];
  galeria: ItemGaleria[];
  entorno: PontoEntorno[];
  investimento?: { titulo: string; texto: string; dados: { label: string; value: string }[] };
  faq: { q: string; a: string }[];
  documentos: { nome: string; href: string }[];
  heroVideo?: string;
  heroImage?: string;
  tourVirtual?: string;
  /** Ficha ainda sem conteúdo aprovado — aparece como "em preparação" na vitrine. */
  draft?: boolean;
}

export const statusLabel: Record<Status, string> = {
  "breve-lancamento": "Breve lançamento",
  lancamento: "Lançamento",
  "em-construcao": "Em construção",
  entregue: "Entregue",
};

export const emVenda = (s: Status) => s !== "entregue";
