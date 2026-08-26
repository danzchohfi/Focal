---
name: proposta-vitamina
description: >-
  Cria propostas comerciais da Vitamina Publicitária no padrão da casa: escuras,
  fotográficas, com pouquíssimo texto e os valores no final — como página web
  (artifact) ou PDF de slides 16:9 com links clicáveis. Use SEMPRE que o Daniel
  pedir uma proposta, orçamento, apresentação comercial ou "PDF bonitão" para um
  cliente ou prospect da Vitamina — mesmo que ele não diga "proposta" (ex.:
  "monta algo pra eu mandar pro cliente X", "prepara o material da reunião de
  amanhã com valores"). Também para REVISAR uma proposta existente nesse padrão.
  Cobre estrutura narrativa, tabela de preços, condições de pagamento e o
  fornecimento de fotos (portfólio do cliente ou geração via Higsfield).
---

# Proposta Vitamina

A proposta da Vitamina vende **experiência, não leitura**. O cliente não lê
parágrafos — ele sente o padrão da agência pela qualidade visual do documento.
Por isso: fotografia grande e humana, quase nenhum texto, números protagonistas,
e os valores sempre por último. "Feito por gente. Acelerado por IA." é o
equilíbrio da marca: use fotos humanas (mãos, rua, bastidor) para compensar a
precisão fria do resto.

## Processo

### 1. Reúna os insumos — nunca invente valores

Antes de desenhar, tenha em mãos (pergunte o que faltar; valores errados em
proposta são um incidente, não um detalhe):

- **Cliente e frentes** — o que está sendo vendido (site, direção de marca,
  identidade, Vitamina G/mensalidade, etc.) e o preço de cada frente.
- **O momento do cliente** — o negócio dele e, se houver, **as falas literais**
  que ele disse na reunião ("tenho uma ideia mas está meio solta"). Falas do
  cliente viram citações em destaque: é o material de venda mais forte que
  existe, porque ele se reconhece.
- **Fotos** — pergunte quais usar. Ordem de preferência em
  `references/imagens.md`. Se o Daniel disse que vai mandar fotos, **não
  produza o documento final antes de recebê-las**.
- **Condições de pagamento** — padrão da casa: à vista no Pix (ou boleto), ou
  em até 12× no cartão com os juros da operadora por conta do cliente. Confirme
  se muda.
- Se a proposta já existe no sistema da Vitamina
  (`vitaminapublicitaria.com.br/cliente/proposta/<uuid>`), baixe o PDF em
  `/api/proposta/<uuid>/pdf` e extraia o conteúdo — os textos de lá são a
  fonte da verdade do escopo.

### 2. Escolha o formato

- **Página web (artifact)** — para propostas enxutas e vivas, que o cliente
  abre por link e o Daniel atualiza com o tempo (caso Focal). 3 páginas-tela:
  capa → frente(s) com valores → mensalidade + de acordo.
- **PDF 16:9** — para apresentação completa a prospect novo (caso Giraê).
  10–14 slides. Gere com `scripts/gerar_pdf.mjs` (links continuam clicáveis).
- Em dúvida, pergunte. Os dois usam o mesmo sistema visual.

### 3. Monte com o sistema da casa: FEED-FIRST

O Daniel escolheu (2026-08-26) o sistema **feed-first** como o layout das
propostas: "o produto é o design" — a proposta desenhada com os objetos do
próprio serviço. CSS pronto em `assets/base.css`; exemplos reais: proposta
Instituto Rocca (mídia social, 3 págs) e proposta completa (14 págs).

- **Paleta**: fundo ink `#0b0c10`, cartões `#14161d`/`#1a1d26`, texto
  `#f2f3ee`, acento **chartreuse `#d9f64a`** (escolhido contra o teal em
  teste A/B com o Daniel — "mais moderna"), laranja `#ff7a45` SÓ em
  gradientes de anel/glow. O teal `#19B8AE` segue sendo o acento do SITE;
  a proposta tem sistema próprio. Ilha escura: cores explícitas, um tema só.
- **Gramática visual**: glows desfocados nos cantos; eyebrow com barrinha;
  círculos numerados (01…) nos itens de escopo; chips e pills arredondadas;
  caixa TRACEJADA pro "não faz parte"; celular desenhado em CSS com o perfil
  do cliente mockado (badges chartreuse ancoram cada item do escopo na parte
  do perfil que ele constrói); stories com anel gradiente; valor gigante
  Inter Tight 800 com o número em chartreuse; fechamento com cartão de chat
  ("Qualquer ajuste, é só responder no WhatsApp." + bolha digitando).
- **Fontes**: Inter Tight 700/800 (display, tracking −.03em) + Inter
  400/500/600. Na web via Google Fonts; pra PDF local declare TAMBÉM
  @font-face `file://` das mesmas famílias (as duas fontes convivem; sem a
  local o print do Chromium cai em fallback feio).
- Logo: o wordmark "vitamina." em Inter Tight 800 com o ponto no acento já É
  o logo nesse sistema (o SVG `assets/logo-vitamina.svg` segue disponível).
- Embuta as imagens como data URI com `scripts/embutir.py` (artifacts não
  carregam imagem externa; PDFs ficam autocontidos).
- Texto: cada página tem no máximo um título curto, uma linha de apoio e um
  bloco funcional (valores, chips, citações). Se um parágrafo passa de duas
  linhas, corte — "nem eu vou ler esse texto, nem o cliente" (Daniel).
- **Cuidado com gradiente+rgba no print**: `linear-gradient` com cores rgba
  desloca o matiz (barras saíram MAGENTA) no PDF do Chromium. Gradientes com
  cores OPACAS; véu sobre foto = cor sólida + `opacity`.

### 4. Estrutura narrativa canônica

A ordem existe por um motivo: **o que o cliente pediu vem antes do que a
Vitamina quer vender** (upgrade de mensalidade nunca abre a proposta), e
valores vêm depois do valor.

Proposta completa (prospect novo):

1. **Capa** — foto forte + logo + "Proposta · Cliente · Mês Ano" + uma frase da
   marca ("Posicione. Ou você vira preço." / "Feito por gente. Acelerado por IA.")
2. **A Vitamina** — filme institucional como imagem clicável (link para o site)
3. **Prova** — marcas e números (Polyorganic 3×, comparaCAR 4×, AlfaPesca 400% —
   dados em `references/vitamina.md`)
4. **O momento** — o negócio do cliente + as falas dele como citações
5. **A virada** — pares "Hoje → Com a Vitamina"
6. **As entregas** — uma seção por frente vendida (a de direção de marca tem
   material pronto na reference: 8 pilares, 30 dias, 4 workshops)
7. **Continuidade** — o ciclo das Vitaminas (~30 dias) + faixa R$ 4–10 mil/mês
8. **Investimento** — tabela limpa, número grande, tabular-nums; opção
   principal com acento teal; alternativa mais barata em linha **pequena e
   discreta** ("se preferirem apenas manter…"); âncora de valor quando ajudar
   ("no modelo tradicional custa R$ 50–80 mil"); condições de pagamento
9. **Próximo passo** — link de aprovação do sistema ou bloco "De acordo" com
   assinaturas (proposta-documento)

Proposta enxuta (cliente da casa): capa → frente + valores → mensalidade +
de acordo. Mesmo espírito, 3 páginas.

### 5. Regras que já causaram retrabalho (não repita)

- **Nunca fale mal do trabalho atual do cliente** — pode ter sido a própria
  Vitamina que fez. Venda evolução ("melhorar a taxa de conversão"), não
  conserto.
- **Não mencione quanto o cliente paga hoje** a menos que o Daniel peça.
- **Preço riscado** (de/por) só se o Daniel pedir; o padrão é opção principal
  destacada + alternativa discreta embaixo.
- **Papéis internos** (programador, designer…) não aparecem; "se for
  necessário, eu explico" (Daniel).
- **Números fictícios** em mockups (ex.: exemplo de teste A/B) precisam do
  rótulo "exemplo ilustrativo" e de aritmética que fecha exata se o cliente
  conferir.
- Fotos de um cliente **não** entram na proposta de outro sem combinar — use
  portfólio neutro, material do próprio prospect ou geração.
- **Blindagem de escopo** (Daniel 2026-08-26, "pra evitar problema lá na
  frente"): serviço recorrente ganha a caixa "Não faz parte desta frente"
  ESPECÍFICA. Checklist pra gestão de mídia social — DMs; comentários e
  moderação; gravação/edição; tráfego pago (impulsionamento, gestão e
  verba); Google Meu Negócio; WhatsApp (atendimento, listas, status); peças
  fora das redes (impressos, apresentações, e-mail mkt); site/landing/SEO.
  Feche a caixa vendendo: "São frentes adicionais — qualquer uma delas, a
  gente cota à parte." Escopo de entregáveis com NÚMERO e FORMATO ("30
  capas/posts por mês, em dois formatos: feed 4:5 e stories 9:16"), nunca
  "todos os formatos".
- **No máximo DUAS opções de pagamento** por frente (Daniel 2026-08-26:
  "tem duas opções só") — ex.: mensal como número gigante + à vista na
  contratação como pill destacada. Três opções confundem.

### 6. Verifique antes de entregar

Renderize e **olhe cada página** (Playwright + screenshot, claro e escuro para
web; todas as páginas do PDF). Cheque: valores corretos, nada de texto sobrando,
imagem sem marca do Instagram/interface, logo íntegro, links funcionando.
Só então publique o artifact (carregue a skill `artifact-design` antes, se for
web) ou envie o PDF com SendUserFile.

## Arquivos desta skill

- `assets/base.css` — o sistema visual completo (leia antes de montar)
- `assets/logo-vitamina.svg` — símbolo do logo para `<use href="#vp-logo">`
- `assets/exemplo-pagina.html` — esqueleto das páginas (capa, dupla com foto,
  tabela de valores, citações, grid de pilares, investimento)
- `scripts/embutir.py <html> <img...>` — troca `src` por data URIs
- `scripts/gerar_pdf.mjs <html> <pdf>` — imprime slides 16:9 com links
- `references/vitamina.md` — dados da marca: cases com números, serviços,
  8 pilares, ciclo, contatos, condições padrão (leia sempre)
- `references/imagens.md` — de onde tirar fotos e como gerar no Higsfield sem
  cara de IA (leia quando for buscar ou gerar imagem)
