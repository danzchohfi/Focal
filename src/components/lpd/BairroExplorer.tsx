"use client";

import { useState } from "react";
import MapaBairro from "./MapaBairro";

/**
 * Explorador do bairro — o guia dos carrosséis do Instagram em forma
 * interativa: as categorias filtram os pins no mapa da identidade, e cada
 * lugar abre a ficha com o texto aprovado do post, na família de cor da
 * própria categoria (azul para cultura, pinho para design, taupe para morar).
 *
 * Acessível pelos chips (botões reais); os pins do SVG são um atalho de
 * ponteiro e ficam fora da árvore de acessibilidade para não duplicar. Sem
 * JS, o estado inicial já vem renderizado do servidor.
 */

type Lugar = {
  id: string;
  nome: string;
  texto: string;
  x: number;
  y: number;
  /** Só onde o material aprovou um número. */
  tempo?: string;
};

type Categoria = {
  id: string;
  titulo: string;
  frase: string;
  /** Família de cor da identidade */
  fundo: string;
  tinta: string;
  lugares: Lugar[];
};

const CATEGORIAS: Categoria[] = [
  {
    id: "cultura",
    titulo: "Cultura",
    frase: "Cultura que pulsa ao redor do Artur 73 — cinco lugares para viver o melhor de São Paulo a poucos passos.",
    fundo: "#BCD7E6",
    tinta: "#12475F",
    lugares: [
      {
        id: "masp",
        nome: "MASP",
        texto: "O museu mais emblemático do país, a 15 minutos de caminhada. Arte que transforma a rotina.",
        tempo: "15 min a pé",
        x: 690,
        y: 60,
      },
      {
        id: "ims",
        nome: "IMS Paulista",
        texto: "Fotografia, cinema, exposições de grande relevância e um dos cafés mais agradáveis da Paulista.",
        x: 700,
        y: 120,
      },
      {
        id: "sesc",
        nome: "Sesc Pinheiros",
        texto: "Programação diversa: teatro, música, exposições, oficinas e uma energia única no bairro.",
        x: 96,
        y: 330,
      },
      {
        id: "mis",
        nome: "Museu da Imagem e do Som (MIS)",
        texto: "Cinema, mostras internacionais e exposições sempre atualizadas.",
        x: 600,
        y: 300,
      },
      {
        id: "unibes",
        nome: "Unibes Cultural",
        texto: "Espaço que conecta cultura e inovação com programação de cinema, debates e exposições.",
        x: 430,
        y: 96,
      },
    ],
  },
  {
    id: "design",
    titulo: "Arte & Design",
    frase: "Arte, design e estilo de vida entre a Artur de Azevedo e a Oscar Freire.",
    fundo: "#E4EAE2",
    tinta: "#2F5D48",
    lugares: [
      {
        id: "etel",
        nome: "ETEL",
        texto: "Design brasileiro em sua melhor forma: mobiliário assinado e materiais nobres.",
        x: 250,
        y: 448,
      },
      {
        id: "micasa",
        nome: "MICASA",
        texto: "Mais que uma referência, a Micasa ocupa posição de farol para a decoração, o design e o lifestyle na cidade de São Paulo.",
        x: 480,
        y: 388,
      },
      {
        id: "vermelho",
        nome: "Galeria Vermelho",
        texto: "Referência em curadoria experimental e artistas de grande relevância, a poucos minutos do Artur 73.",
        x: 520,
        y: 180,
      },
      {
        id: "almeida",
        nome: "Galeria Almeida & Dale",
        texto: "Fundada em 1998, é uma das galerias mais relevantes do Brasil, promovendo artistas fundamentais para a arte brasileira.",
        x: 330,
        y: 500,
      },
      {
        id: "shops",
        nome: "Shops Jardins",
        texto: "Um espaço elegante que reúne marcas de moda, design e lifestyle em um ambiente acolhedor e bem curado — perfeito para descobrir novas referências.",
        x: 640,
        y: 470,
      },
    ],
  },
  {
    id: "gastronomia",
    titulo: "Gastronomia",
    frase: "Gastronomia, cultura, arte e hospitalidade no entorno imediato.",
    fundo: "#2F5D48",
    tinta: "#FFFFFF",
    lugares: [
      {
        id: "oscarfreire",
        nome: "Oscar Freire e entorno",
        texto: "Bares e restaurantes que definem o repertório da cidade, na porta de casa.",
        x: 300,
        y: 428,
      },
    ],
  },
  {
    id: "trabalho",
    titulo: "Trabalho",
    frase: "Proximidade ao metrô e à Paulista, o maior eixo corporativo do país.",
    fundo: "#12475F",
    tinta: "#FFFFFF",
    lugares: [
      {
        id: "metro-of",
        nome: "Metrô Oscar Freire",
        texto: "A 5 minutos de casa, ligando o Artur 73 a toda a rede.",
        tempo: "5 min a pé",
        x: 392,
        y: 412,
      },
      {
        id: "paulista",
        nome: "Av. Paulista",
        texto: "O maior eixo corporativo do país, a 15 minutos caminhando.",
        tempo: "15 min a pé",
        x: 620,
        y: 76,
      },
      {
        id: "metro-clinicas",
        nome: "Metrô Clínicas",
        texto: "Segunda estação no raio de caminhada, pelo eixo da Dr. Arnaldo.",
        x: 150,
        y: 172,
      },
    ],
  },
  {
    id: "lazer",
    titulo: "Lazer",
    frase: "Ruas caminháveis, trechos arborizados, vida fluindo.",
    fundo: "#C9AD96",
    tinta: "#53381E",
    lugares: [
      {
        id: "ruasemsaida",
        nome: "Rua sem saída na porta de casa",
        texto: "Tranquilidade preservada; possibilidades abertas — mobilidade real sem renunciar ao silêncio.",
        x: 104,
        y: 402,
      },
      {
        id: "verde-hc",
        nome: "Vista para o verde do bairro",
        texto: "Vista permanente para o verde do complexo do Hospital das Clínicas — área que não será construída.",
        x: 300,
        y: 228,
      },
    ],
  },
];

export default function BairroExplorer() {
  const [catId, setCatId] = useState(CATEGORIAS[0].id);
  const [lugarId, setLugarId] = useState(CATEGORIAS[0].lugares[0].id);

  const cat = CATEGORIAS.find((c) => c.id === catId)!;
  const lugar = cat.lugares.find((l) => l.id === lugarId) ?? cat.lugares[0];
  const idx = cat.lugares.indexOf(lugar);

  const trocarCat = (c: Categoria) => {
    setCatId(c.id);
    setLugarId(c.lugares[0].id);
  };
  const passo = (d: number) => {
    const n = (idx + d + cat.lugares.length) % cat.lugares.length;
    setLugarId(cat.lugares[n].id);
  };

  return (
    <div>
      {/* Categorias */}
      <div className="flex flex-wrap gap-2.5" role="tablist" aria-label="Categorias do bairro">
        {CATEGORIAS.map((c) => {
          const ativa = c.id === catId;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => trocarCat(c)}
              className="cta rounded-full px-5 py-2.5 transition-[transform,box-shadow] duration-200 active:scale-[0.97]"
              style={
                ativa
                  ? { background: c.fundo, color: c.tinta, boxShadow: "0 6px 20px -8px rgba(18,71,95,.45)" }
                  : { background: "transparent", color: "#2F5D48", border: "1px solid rgba(47,93,72,.35)" }
              }
            >
              {c.titulo}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
        {/* Mapa com pins da categoria ativa */}
        <div className="overflow-hidden rounded-lg" style={{ background: "#EDF1EC" }}>
          <MapaBairro>
            {/* Artur 73 sempre presente como origem */}
            <g>
              <circle cx={104} cy={402} r="7" fill="#2F5D48" />
              <circle cx={104} cy={402} r="12" fill="none" stroke="#2F5D48" strokeWidth="1.2" opacity="0.5" />
              <text x={122} y={406} fontSize="11.5" fill="#2F5D48" letterSpacing="0.08em" style={{ textTransform: "uppercase" }}>
                Artur 73
              </text>
            </g>
            {cat.lugares.map((l) => {
              const sel = l.id === lugar.id;
              return (
                <g
                  key={l.id}
                  aria-hidden
                  onClick={() => setLugarId(l.id)}
                  style={{ cursor: "pointer" }}
                >
                  {/* linha de cota até o Artur 73, só do selecionado */}
                  {sel && (
                    <line
                      x1={104}
                      y1={402}
                      x2={l.x}
                      y2={l.y}
                      stroke={cat.tinta === "#FFFFFF" ? cat.fundo : cat.tinta}
                      strokeWidth="1.2"
                      strokeDasharray="4 5"
                      opacity="0.7"
                    />
                  )}
                  <circle
                    cx={l.x}
                    cy={l.y}
                    r={sel ? 9 : 6}
                    fill={cat.tinta === "#FFFFFF" ? cat.fundo : cat.tinta}
                    opacity={sel ? 1 : 0.55}
                    style={{ transition: "all .25s" }}
                  />
                  {sel && (
                    <circle cx={l.x} cy={l.y} r={15} fill="none" stroke={cat.tinta === "#FFFFFF" ? cat.fundo : cat.tinta} strokeWidth="1.2" opacity="0.45" />
                  )}
                </g>
              );
            })}
          </MapaBairro>
        </div>

        {/* Ficha do lugar, no estilo dos cards da identidade */}
        <div>
          <div
            className="rounded-lg p-7 transition-colors duration-300 md:p-9"
            style={{ background: cat.fundo, color: cat.tinta }}
          >
            <p className="kicker" style={{ opacity: 0.75 }}>
              {cat.titulo}
            </p>
            <h3 className="din mt-4 text-[clamp(24px,2.6vw,32px)] leading-[1.12]">{lugar.nome}</h3>
            <p className="din-book mt-4 min-h-[5.2em] text-[clamp(16px,1.6vw,19px)] leading-[1.5]" style={{ opacity: 0.92 }}>
              {lugar.texto}
            </p>
            <div className="mt-6 flex items-center justify-between">
              <span className="din text-[13px] uppercase tracking-[0.14em]" style={{ opacity: 0.7 }}>
                {lugar.tempo ?? "No entorno imediato"}
              </span>
              <span className="din text-[20px]" aria-hidden>
                A<sup className="text-[12px]">73</sup>
              </span>
            </div>
          </div>

          {/* Navegação entre lugares da categoria */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {cat.lugares.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLugarId(l.id)}
                  aria-pressed={l.id === lugar.id}
                  className="rounded-full px-3.5 py-1.5 text-[12.5px] uppercase tracking-[0.06em] transition-colors duration-200"
                  style={
                    l.id === lugar.id
                      ? { background: "#2F5D48", color: "#fff" }
                      : { background: "rgba(47,93,72,.12)", color: "#2F5D48" }
                  }
                >
                  {l.nome}
                </button>
              ))}
            </div>
            {cat.lugares.length > 1 && (
              <div className="flex shrink-0 gap-1.5">
                {[
                  { d: -1, rot: "rotate-180", label: "Lugar anterior" },
                  { d: 1, rot: "", label: "Próximo lugar" },
                ].map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    aria-label={b.label}
                    onClick={() => passo(b.d)}
                    className="flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white/70"
                    style={{ border: "1px solid rgba(47,93,72,.35)", color: "#2F5D48" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={b.rot} aria-hidden>
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="mt-3 text-[12px] opacity-50">
            Mapa ilustrativo — posições aproximadas.
          </p>
        </div>
      </div>
    </div>
  );
}
