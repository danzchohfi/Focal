# Propostas modulares — produtos, capítulos e fonte da verdade

A proposta da Vitamina é MODULAR: o cliente contrata produtos avulsos ou
somados, e o documento monta um capítulo por produto. O sistema da agência
(repo `danzchohfi/vitamina`) já define catálogo, copy e ordem — **leia de lá,
não duplique**: copy duplicada drifta (o próprio código avisa; o 5× errado da
Polyorganic aconteceu por isso). Se o repo não estiver nesta sessão, adicione
via `add_repo danzchohfi/vitamina` e clone raso.

## Fonte da verdade (caminhos no clone)

- `webapp/lib/assignable-products.ts` — catálogo: slug, nome, preço, recorrência
  (e aliases: `gravacao → avulso`, `vitamina-g → trafego`).
- `webapp/lib/vp-landing-content.ts` — **a copy toda** (prova, 70%/criativo,
  direção, produção, ciclo, mídia/funil, site). Compartilhada site ↔ proposta.
- `webapp/lib/vitamins.ts` — Vitaminas A/B/C (includes/excludes), Avulsa, G.
- `webapp/lib/nativo/product-presentation.ts` — que blocos cada produto injeta
  e em que ordem; texto do capítulo de Identidade Visual (~linha 957).
- `webapp/lib/nativo/proposal-pages.ts` — ordem canônica do documento
  (`assembleDoc`), capa com índice, fechamento "Aprovar é um clique.",
  investimento.
- `webapp/lib/payment-plans.ts` + `lib/proposals.ts` — parcelamentos oficiais.
- Assets: `webapp/public/clientes/logos/*.png` (fundo transparente, branco),
  `webapp/public/clientes/sites/*.jpg` (prints reais dos sites).

## Catálogo (agosto/2026 — confira preços no código antes de usar)

| slug | produto | preço | recorrência |
|---|---|---|---|
| `direcao` | Direção de Marca | R$ 10.000 (ou R$ 12.000 em até 8×) | único |
| `avulso` | Produção Avulsa ("gravação avulsa") | R$ 7.500 (ou 3×) | único |
| `loja` | Novo Layout de Loja (Nuvemshop) | R$ 10.000 | único |
| `trafego` | Vitamina G — gestão de tráfego | R$ 4.000/mês | mensal |
| `vitamina-a` | Vitamina A (produção a cada 30 dias) | R$ 6.500/mês | mensal |
| `vitamina-b` | Vitamina B (a cada 60 dias) | R$ 4.500/mês | mensal |
| `vitamina-c` | Vitamina C (a cada 90 dias) | R$ 3.500/mês | mensal |
| — | Website (linha manual) | por proposta | único |
| — | Identidade Visual (linha manual) | por proposta | único |

## Ordem canônica do documento (a mesma do sistema, MENOS a reunião)

1. **Capa** — wordmark, "Proposta", nome da marca do cliente, índice numerado
   das partes, "Vitamina Publicitária × Marca · mês/ano".
2. **Apresentação da VP** — filme institucional (demo reel) + "Marcas que a
   gente já moveu" (VP_PROVAS: Polyorganic 3×, comparaCAR 4×, AlfaPesca 400%)
   + parede de cases em vídeo.
3. **Um capítulo por produto contratado**, na ordem dos itens:
   - `direcao`: 70% do criativo (CREATIVE_ANCHOR/TRIO) → problema → contexto →
     8 pilares → processo 30 dias/4 gates → entregáveis → quem faz o quê.
   - `avulso`: abertura "Produção dirigida, do roteiro à entrega." + padrão de
     produção + escopo do job (vem do vendedor, não de texto pronto).
   - `vitamina-a/b/c`: abertura com a pílula "Não faz parte desta frente: …" →
     a base (Direção) → o ciclo (4 fases) → por dentro do ciclo → padrão de
     produção → escopo.
   - `trafego` (G): abertura → base → distribuição (operação + métricas) →
     funil (dados de EXEMPLO rotulados) → tecnologia → escopo. Sem gravação.
   - Website: referências reais (Focal, AlfaPesca, Totanka, Museu em Fios,
     com print + link) → "Três conceitos. Criação a quatro mãos." → o padrão →
     "Site bem feito barateia o anúncio."
   - Identidade Visual: o parágrafo do sistema (manual de identidade, paleta,
     tipografia, proteção, usos) + "Marcas criadas pela Vitamina" (logos
     Daniel Dourado, Intercon, comparaCAR).
   O bloco "padrão de produção" aparece **uma vez por documento**; capítulos
   seguintes só apontam para ele.
4. **Continuidade das Vitaminas** — só quando NÃO há Vitamina entre os itens:
   o ciclo + "De R$ 4 mil a R$ 10 mil por mês" como passo seguinte.
5. **Investimento** — itens + preço + total; prazo, validade, forma de
   pagamento (à vista Pix/boleto; parcelado conforme payment-plans).
6. **Fechamento** — "Aprovar é um clique." + link da proposta no sistema
   (`vitaminapublicitaria.com.br/cliente/proposta/<token>`) + assinatura.

## Dados da reunião: FORA por padrão

O miolo 01–05 do sistema ("O momento", "A virada" com as falas da call) **não
entra** — o Daniel decidiu (2026-08) que o cliente pode se sentir invadido
vendo a própria reunião transcrita no documento. Se ele pedir explicitamente o
momento/virada, use no máximo um toque leve (uma frase de contexto), nunca a
lista de dores com as palavras da call.

## Vitrine de vídeos (imagens liberadas pelo Daniel)

Demo reel institucional: `66361aeab60dfd8904e6205d34627c1a`. Cases da vitrine
oficial (uma marca por slot, nesta ordem): Velocity `c7dca645…`, Estúdio Mais
`f52218ce…`, Flaviano Queiroz `45744af9…`, Totanka `bd12e7b2…` (horizontal),
Forlan `dc9ce6b8…` — UIDs completos e a lista viva em `webapp/lib/clients.ts`
(`VITRINE_VIDEOS`, `STREAM_CLIENT`).

- Capa: `https://customer-mvmgeaoiwcmxb2t3.cloudflarestream.com/<uid>/thumbnails/thumbnail.jpg?time=1s&height=720`
  (troque `time=` se o frame de 1s tiver legenda queimada — olhe antes de usar).
- Link clicável do card: `https://vitaminapublicitaria.com.br/v/<uid>`.
