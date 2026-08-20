import { asset } from "@/lib/asset";

/**
 * A pilha de cartões — os carrosséis da identidade traduzidos para o scroll:
 * cada cartão gruda (position: sticky) um pouco abaixo do anterior e o
 * seguinte cobre a cena ao rolar, como passar os cards no Instagram. Cada
 * cartão carrega a foto da peça original das redes na metade direita.
 *
 * CSS puro: funciona sem JavaScript e não depende de prefers-reduced-motion
 * (o empilhamento é navegação por scroll, não animação).
 */

const CARTOES = [
  {
    eyebrow: "Morar",
    frase: "Seu ponto de apoio em São Paulo, onde a vida funciona.",
    apoio: "A escolha segura para estar em São Paulo.",
    fundo: "#12475F",
    tinta: "#FFFFFF",
    detalhe: "#BCD7E6",
    foto: "/a73d/bairro/c-morar.webp",
    alt: "Pedestres cruzando uma rua arborizada de Pinheiros",
  },
  {
    eyebrow: "Mobilidade",
    frase: "A poucos minutos da Paulista e de tudo o que importa. Mobilidade real sem renunciar ao silêncio.",
    apoio: "A 5 minutos do metrô. A 15 minutos da Paulista, caminhando.",
    fundo: "#C9AD96",
    tinta: "#53381E",
    detalhe: "#53381E",
    foto: "/a73d/bairro/c-mobilidade.webp",
    alt: "Pessoa caminhando com cachorro em calçada do bairro",
  },
  {
    eyebrow: "Vista",
    frase: "Vista permanente para o verde do bairro. Tranquilidade preservada; possibilidades abertas.",
    apoio: "Ambientes amplos, arejados, iluminados — a casa ideal para uma nova fase da vida.",
    fundo: "#BCD7E6",
    tinta: "#12475F",
    detalhe: "#2F5D48",
    foto: "/a73d/bairro/c-vista.webp",
    alt: "Vista aérea do verde do bairro com o skyline ao fundo",
  },
  {
    eyebrow: "A decisão",
    frase: "Pinheiros que você escolheu. Agora com a arquitetura que celebra essa decisão.",
    apoio: "Chaves em 2026 · R. Artur Azevedo, 73",
    fundo: "#2F5D48",
    tinta: "#FFFFFF",
    detalhe: "#E4EAE2",
    foto: "/a73d/bairro/c-decisao.webp",
    alt: "Perspectiva da torre do Artur 73 entre árvores",
  },
];

export default function CartoesMorar() {
  return (
    <div className="mx-auto max-w-[1000px]">
      {CARTOES.map((c, i) => (
        <div
          key={c.eyebrow}
          className="sticky mb-6 overflow-hidden rounded-lg shadow-[0_-14px_50px_-24px_rgba(18,71,95,.4)]"
          style={{ background: c.fundo, color: c.tinta, top: `calc(88px + ${i * 14}px)` }}
        >
          <div className="grid md:min-h-[480px] md:grid-cols-2">
            <div className="flex flex-col justify-between gap-8 p-8 md:p-12">
              <div className="flex items-start justify-between gap-6">
                <p className="kicker" style={{ color: c.detalhe }}>
                  {c.eyebrow}
                </p>
                <span className="din text-[22px]" aria-hidden style={{ opacity: 0.85 }}>
                  A<sup className="text-[13px]">73</sup>
                </span>
              </div>
              <p className="din-book max-w-[24ch] text-[clamp(24px,3.4vw,38px)] leading-[1.16]">{c.frase}</p>
              <p className="din text-[13px] uppercase tracking-[0.14em]" style={{ opacity: 0.75 }}>
                {c.apoio}
              </p>
            </div>
            <figure className="relative order-first m-0 aspect-[16/10] md:order-none md:aspect-auto md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- export estático sem otimizador */}
              <img
                src={asset(c.foto)}
                alt={c.alt}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </figure>
          </div>
        </div>
      ))}
    </div>
  );
}
