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

### 3. Monte com o sistema da casa

- CSS pronto em `assets/base.css` — carvão `#0B0F12`, off `#F2F5F7`, acento
  teal `#19B8AE` (o ponto do logo), Inter Tight (títulos 800, tracking
  apertado) + Inter (texto). Não invente outra paleta.
- Logo: use `assets/logo-vitamina.svg` (símbolo `#vp-logo`, wordmark
  "vitamina." com ponto teal). **Só o logo** — a identidade visual completa do
  site da Vitamina pede pouca imagem, mas a proposta é o contrário: aqui a
  fotografia manda. Essa exceção é intencional e foi definida pelo Daniel.
- Embuta as imagens como data URI com `scripts/embutir.py` (artifacts não
  carregam imagem externa; PDFs ficam autocontidos).
- Texto: cada página tem no máximo um título curto, uma linha de apoio e um
  bloco funcional (valores, chips, citações). Se um parágrafo passa de duas
  linhas, corte — "nem eu vou ler esse texto, nem o cliente" (Daniel).

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
