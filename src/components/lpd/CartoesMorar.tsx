/**
 * A pilha de cartões — os carrosséis da identidade traduzidos para o scroll:
 * cada cartão gruda (position: sticky) um pouco abaixo do anterior e o
 * seguinte cobre a cena ao rolar, como passar os cards no Instagram.
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
  },
  {
    eyebrow: "Mobilidade",
    frase: "A poucos minutos da Paulista e de tudo o que importa. Mobilidade real sem renunciar ao silêncio.",
    apoio: "A 5 minutos do metrô. A 15 minutos da Paulista, caminhando.",
    fundo: "#C9AD96",
    tinta: "#53381E",
    detalhe: "#53381E",
  },
  {
    eyebrow: "Vista",
    frase: "Vista permanente para o verde do bairro. Tranquilidade preservada; possibilidades abertas.",
    apoio: "Ambientes amplos, arejados, iluminados — a casa ideal para uma nova fase da vida.",
    fundo: "#BCD7E6",
    tinta: "#12475F",
    detalhe: "#2F5D48",
  },
  {
    eyebrow: "A decisão",
    frase: "Pinheiros que você escolheu. Agora com a arquitetura que celebra essa decisão.",
    apoio: "Chaves em 2026 · R. Artur Azevedo, 73",
    fundo: "#2F5D48",
    tinta: "#FFFFFF",
    detalhe: "#E4EAE2",
  },
];

export default function CartoesMorar() {
  return (
    <div className="mx-auto max-w-[900px]">
      {CARTOES.map((c, i) => (
        <div
          key={c.eyebrow}
          className="sticky mb-6 flex min-h-[420px] flex-col justify-between rounded-lg p-8 shadow-[0_-14px_50px_-24px_rgba(18,71,95,.4)] md:min-h-[480px] md:p-14"
          style={{ background: c.fundo, color: c.tinta, top: `calc(88px + ${i * 14}px)` }}
        >
          <div className="flex items-start justify-between gap-6">
            <p className="kicker" style={{ color: c.detalhe }}>
              {c.eyebrow}
            </p>
            <span className="din text-[22px]" aria-hidden style={{ opacity: 0.85 }}>
              A<sup className="text-[13px]">73</sup>
            </span>
          </div>
          <p className="din-book max-w-[24ch] text-[clamp(26px,4vw,44px)] leading-[1.16]">{c.frase}</p>
          <p className="din text-[13px] uppercase tracking-[0.14em]" style={{ opacity: 0.75 }}>
            {c.apoio}
          </p>
        </div>
      ))}
    </div>
  );
}
