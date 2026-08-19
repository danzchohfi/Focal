/**
 * Mapa estilizado do trecho Artur de Azevedo × Oscar Freire, reproduzindo em
 * SVG a peça do guia de bairro da identidade: fundo sálvia, malha de ruas em
 * linha fina, arteriais em traço mais forte e pins em pílula.
 *
 * É ilustrativo (geometria simplificada), como no material original — o mapa
 * geográfico real fica na seção de localização, com o MapEmbed.
 */

const PINHO = "#2F5D48";

function Pin({ x, y, label, ancora = "esq" }: { x: number; y: number; label: string; ancora?: "esq" | "dir" }) {
  const w = label.length * 7.4 + 26;
  const rx = ancora === "esq" ? x + 12 : x - 12 - w;
  return (
    <g>
      <circle cx={x} cy={y} r="6" fill={PINHO} />
      <rect x={rx} y={y - 11} width={w} height={22} rx={11} fill={PINHO} opacity="0.12" />
      <text
        x={ancora === "esq" ? rx + 13 : rx + w - 13}
        y={y + 4}
        textAnchor={ancora === "esq" ? "start" : "end"}
        fill={PINHO}
        fontSize="11.5"
        letterSpacing="0.08em"
        style={{ textTransform: "uppercase" }}
      >
        {label}
      </text>
    </g>
  );
}

export default function MapaBairro({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 760 560"
      role="img"
      aria-label="Mapa ilustrativo: Artur 73 na esquina da Artur de Azevedo com a Oscar Freire, perto dos metrôs Oscar Freire e Clínicas, do Hospital das Clínicas, do IMS e do Shops Jardins"
      className={`h-auto w-full ${className}`}
    >
      {/* malha fina */}
      <g stroke={PINHO} strokeWidth="0.8" opacity="0.35">
        {/* transversais (sentido Oscar Freire) */}
        {[70, 150, 230, 310, 390, 470].map((y, i) => (
          <path key={`t${i}`} d={`M0 ${y + 60} L760 ${y - 30}`} />
        ))}
        {/* longitudinais (sentido Rebouças) */}
        {[120, 220, 320, 420, 520, 620, 700].map((x, i) => (
          <path key={`l${i}`} d={`M${x + 40} 0 L${x - 40} 560`} />
        ))}
      </g>

      {/* arteriais */}
      <g stroke={PINHO} strokeWidth="3" fill="none">
        {/* Av. Rebouças — diagonal principal */}
        <path d="M470 0 L360 560" />
        {/* Av. Paulista — topo à direita */}
        <path d="M470 60 L760 92" strokeWidth="4" />
        {/* Av. Dr. Arnaldo — topo à esquerda */}
        <path d="M0 150 L470 60" />
        {/* R. da Consolação */}
        <path d="M600 0 L560 560" strokeWidth="1.6" />
      </g>

      {/* quarteirão do HC (área verde institucional) */}
      <path d="M60 190 L430 120 L440 210 L120 300 Z" fill={PINHO} opacity="0.05" stroke={PINHO} strokeWidth="0.8" />

      {/* nomes de rua */}
      <g fill={PINHO} fontSize="12" letterSpacing="0.04em">
        <text x="620" y="76" transform="rotate(6 620 76)">Av. Paulista</text>
        <text x="150" y="128" transform="rotate(-11 150 128)">Av. Dr. Arnaldo</text>
        <text x="404" y="330" transform="rotate(79 404 330)">Av. Rebouças</text>
        <text x="580" y="260" transform="rotate(86 580 260)">R. da Consolação</text>
        <text x="200" y="420" transform="rotate(-8 200 420)">R. Oscar Freire</text>
        <text x="96" y="472" transform="rotate(-84 96 472)">R. Artur de Azevedo</text>
        <text x="470" y="352" transform="rotate(-8 470 352)">Al. Lorena</text>
      </g>

      {/* R. Oscar Freire e R. Artur de Azevedo destacadas de leve */}
      <g stroke={PINHO} strokeWidth="1.4" opacity="0.7">
        <path d="M0 430 L760 340" />
        <path d="M86 300 L120 560" />
      </g>

      {/* pins */}
      <Pin x={700} y={120} label="IMS" ancora="dir" />
      <Pin x={150} y={172} label="Metrô Clínicas" />
      <Pin x={300} y={228} label="Hospital das Clínicas FMUSP" />
      <Pin x={104} y={402} label="Artur 73" />
      <Pin x={392} y={412} label="Metrô Oscar Freire" />
      <Pin x={640} y={470} label="Shops Jardins" ancora="dir" />

      {/* monograma */}
      <text x="36" y="530" fill={PINHO} fontSize="34" fontWeight="600" letterSpacing="-0.02em">
        A<tspan fontSize="20" dy="-12">73</tspan>
      </text>
    </svg>
  );
}
