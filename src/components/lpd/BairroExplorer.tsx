"use client";

import { useState } from "react";
import { asset } from "@/lib/asset";
import MapaBairro from "./MapaBairro";

/**
 * Explorador do bairro — os carrosséis do Instagram em forma interativa,
 * agora conduzidos pelas fotos das próprias peças: cada lugar é um cartão no
 * layout dos posts (foto grande + faixa de texto na família de cor da
 * categoria). O mapa da identidade vira um localizador compacto ao lado dos
 * chips — presente, mas coadjuvante.
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
  /** Foto do material das redes (public/a73d/bairro). Sem foto, o cartão é tipográfico. */
  foto?: string;
  alt?: string;
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
        foto: "/a73d/bairro/masp.webp",
        alt: "Vão livre do MASP na Avenida Paulista",
      },
      {
        id: "ims",
        nome: "IMS Paulista",
        texto: "Fotografia, cinema, exposições de grande relevância e um dos cafés mais agradáveis da Paulista.",
        x: 700,
        y: 120,
        foto: "/a73d/bairro/ims.webp",
        alt: "Entrada do Instituto Moreira Salles na Paulista",
      },
      {
        id: "sesc",
        nome: "Sesc Pinheiros",
        texto: "Programação diversa: teatro, música, exposições, oficinas e uma energia única no bairro.",
        x: 96,
        y: 330,
        foto: "/a73d/bairro/sesc.webp",
        alt: "Fachada de vidro do Sesc Pinheiros",
      },
      {
        id: "mis",
        nome: "Museu da Imagem e do Som (MIS)",
        texto: "Cinema, mostras internacionais e exposições sempre atualizadas.",
        x: 600,
        y: 300,
        foto: "/a73d/bairro/mis.webp",
        alt: "Pátio de entrada do MIS, na Av. Europa",
      },
      {
        id: "unibes",
        nome: "Unibes Cultural",
        texto: "Espaço que conecta cultura e inovação com programação de cinema, debates e exposições.",
        x: 430,
        y: 96,
        foto: "/a73d/bairro/unibes.webp",
        alt: "Edifício da Unibes Cultural iluminado ao entardecer",
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
        foto: "/a73d/bairro/etel.webp",
        alt: "Mostra da ETEL com mobiliário brasileiro assinado",
      },
      {
        id: "micasa",
        nome: "MICASA",
        texto: "Mais que uma referência, a Micasa ocupa posição de farol para a decoração, o design e o lifestyle na cidade de São Paulo.",
        x: 480,
        y: 388,
        foto: "/a73d/bairro/micasa.webp",
        alt: "Ambiente da MICASA com sofá e poltrona de design",
      },
      {
        id: "vermelho",
        nome: "Galeria Vermelho",
        texto: "Referência em curadoria experimental e artistas de grande relevância, a poucos minutos do Artur 73.",
        x: 520,
        y: 180,
        foto: "/a73d/bairro/vermelho.webp",
        alt: "Fachada preta da Galeria Vermelho com instalação azul",
      },
      {
        id: "almeida",
        nome: "Galeria Almeida & Dale",
        texto: "Fundada em 1998, é uma das galerias mais relevantes do Brasil, promovendo artistas fundamentais para a arte brasileira.",
        x: 330,
        y: 500,
        foto: "/a73d/bairro/almeida.webp",
        alt: "Fachada branca da galeria Almeida & Dale",
      },
      {
        id: "shops",
        nome: "Shops Jardins",
        texto: "Um espaço elegante que reúne marcas de moda, design e lifestyle em um ambiente acolhedor e bem curado — perfeito para descobrir novas referências.",
        x: 640,
        y: 470,
        foto: "/a73d/bairro/shops.webp",
        alt: "Fachada verde do Shops Jardins ao anoitecer",
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
        foto: "/a73d/bairro/oscarfreire.webp",
        alt: "Mesas de café na calçada arborizada da Oscar Freire",
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
        foto: "/a73d/bairro/metro-of.webp",
        alt: "Travessia de pedestres em frente à estação Oscar Freire",
      },
      {
        id: "paulista",
        nome: "Av. Paulista",
        texto: "O maior eixo corporativo do país, a 15 minutos caminhando.",
        tempo: "15 min a pé",
        x: 620,
        y: 76,
        foto: "/a73d/bairro/paulista.webp",
        alt: "Avenida Paulista com o MASP em primeiro plano",
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
        foto: "/a73d/bairro/ruasemsaida.webp",
        alt: "Pracinha arborizada com chafariz no encontro das ruas",
      },
      {
        id: "verde-hc",
        nome: "Vista para o verde do bairro",
        texto: "Vista permanente para o verde do complexo do Hospital das Clínicas — área que não será construída.",
        x: 300,
        y: 228,
        foto: "/a73d/bairro/verde-hc.webp",
        alt: "Massa de árvores do complexo do Hospital das Clínicas",
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
  const pinCor = cat.tinta === "#FFFFFF" ? cat.fundo : cat.tinta;

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

      {/* Cartão no layout dos posts: foto grande + faixa de texto na cor da família */}
      <div
        className="mt-8 overflow-hidden rounded-lg shadow-[0_24px_60px_-30px_rgba(18,71,95,.35)] transition-colors duration-300"
        style={{ background: cat.fundo, color: cat.tinta }}
      >
        <div className={lugar.foto ? "grid md:grid-cols-[1.15fr_1fr]" : ""}>
          {lugar.foto && (
            <figure key={lugar.id} className="relative m-0 aspect-[4/3] md:aspect-auto md:min-h-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático sem otimizador */}
              <img
                src={asset(lugar.foto)}
                alt={lugar.alt ?? lugar.nome}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </figure>
          )}
          <div className={`flex flex-col justify-between gap-8 p-7 md:p-10 ${lugar.foto ? "" : "min-h-[360px]"}`}>
            <div className="flex items-start justify-between gap-6">
              <p className="kicker" style={{ opacity: 0.75 }}>
                {cat.titulo}
              </p>
              <span className="din text-[20px]" aria-hidden style={{ opacity: 0.85 }}>
                A<sup className="text-[12px]">73</sup>
              </span>
            </div>
            <div>
              <h3 className="din text-[clamp(26px,3vw,38px)] leading-[1.1]">{lugar.nome}</h3>
              <p className="din-book mt-4 text-[clamp(16px,1.7vw,20px)] leading-[1.5]" style={{ opacity: 0.92 }}>
                {lugar.texto}
              </p>
            </div>
            <span className="din text-[13px] uppercase tracking-[0.14em]" style={{ opacity: 0.7 }}>
              {lugar.tempo ?? "No entorno imediato"}
            </span>
          </div>
        </div>
      </div>

      {/* Navegação + localizador compacto (o mapa agora é coadjuvante) */}
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="flex items-start justify-between gap-3">
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
          <p className="din-book mt-5 max-w-[52ch] text-[15px] leading-[1.55] text-[#2F5D48]/80">{cat.frase}</p>
        </div>

        <div className="overflow-hidden rounded-lg" style={{ background: "#EDF1EC" }}>
          <MapaBairro rotulos={false}>
            {/* Artur 73 sempre presente como origem */}
            <g>
              <circle cx={104} cy={402} r="8" fill="#2F5D48" />
              <circle cx={104} cy={402} r="14" fill="none" stroke="#2F5D48" strokeWidth="1.4" opacity="0.5" />
            </g>
            {cat.lugares.map((l) => {
              const sel = l.id === lugar.id;
              return (
                <g key={l.id} aria-hidden onClick={() => setLugarId(l.id)} style={{ cursor: "pointer" }}>
                  {/* linha de cota até o Artur 73, só do selecionado */}
                  {sel && (
                    <line
                      x1={104}
                      y1={402}
                      x2={l.x}
                      y2={l.y}
                      stroke={pinCor}
                      strokeWidth="1.6"
                      strokeDasharray="4 5"
                      opacity="0.8"
                    />
                  )}
                  <circle
                    cx={l.x}
                    cy={l.y}
                    r={sel ? 11 : 7}
                    fill={pinCor}
                    opacity={sel ? 1 : 0.55}
                    style={{ transition: "all .25s" }}
                  />
                  {sel && <circle cx={l.x} cy={l.y} r={18} fill="none" stroke={pinCor} strokeWidth="1.4" opacity="0.45" />}
                </g>
              );
            })}
          </MapaBairro>
          <p className="px-4 pb-3 pt-1 text-[11.5px] leading-snug text-[#2F5D48]/60">
            Artur 73 → {lugar.nome}. Mapa ilustrativo — posições aproximadas.
          </p>
        </div>
      </div>
    </div>
  );
}
