# Fotos da proposta — de onde tirar e como gerar

A foto certa é o que separa esta proposta de um PDF de sistema. Regra de ouro:
**humana, natural, com textura** — mãos trabalhando, rua, bastidor, luz de
janela. P&B (grayscale + leve contraste, como o `.capa img` do base.css) dá
unidade quando as fontes são variadas.

## Ordem de preferência

1. **Material do próprio cliente/prospect** — fotos do produto, do espaço, da
   obra, dos posts dele. Peça ao Daniel; se ele disse que vai mandar, espere.
   Fotos enviadas no chat ficam no transcript da sessão como base64 — dá para
   extrair (procure blocos `"type":"image"` no JSONL da sessão).
2. **Prints de carrossel/Instagram**: recorte fora as setas ‹ ›, os pontinhos
   de paginação e qualquer interface. Nas peças com foto emoldurada, corte a
   área da foto por frações (as margens são ~5,6% da largura). Confira o
   recorte olhando a imagem antes de usar.
3. **Portfólio da Vitamina** — bastidores, sets, frames dos filmes dos cases.
   Atenção: material identificável de um cliente **não** entra na proposta de
   outro sem o Daniel combinar.
4. **Screenshot de site/demo** — capture com Playwright (1500×940, dark quando
   fizer sentido), esconda overlays de dev e barras fixas antes do shot. Para
   mobile: 390×844 com deviceScaleFactor 2, e apresente como "celular
   flutuando" (`figure.tela` no base.css) em vez de sangrar.
5. **Geração via Higsfield** — quando não há material. Ver abaixo.

## Gerando no Higsfield sem cara de IA

Use `mcp__Higsfield__generate_image` (na dúvida de modelo,
`models_explore(action:'recommend')`). O objetivo é parecer fotografia
editorial, não render.

Receita de prompt que funciona:

- Comece com o tipo: "editorial documentary photograph", "35mm photo".
- Assunto humano parcial, nunca rosto em close: mãos escrevendo/apontando para
  uma tela, pessoas de costas numa reunião, silhueta na rua, mesa de trabalho.
- Luz e textura: "natural window light, soft shadows, subtle film grain".
- Composição com espaço para texto: "negative space on the left, dark
  background" (a capa põe título sobre a foto).
- Feche com o que evitar: "no text, no logos, no watermarks".
- Se o resultado vier colorido demais, o CSS já aplica grayscale na capa; para
  outras posições, gere já pedindo "muted color palette, charcoal and teal
  accents" para casar com #0B0F12/#19B8AE.

Exemplo (capa de proposta de direção de marca):
"Editorial documentary photograph, hands of a creative director sketching a
brand diagram on paper over a dark wood desk, natural window light from the
right, soft shadows, subtle film grain, negative space on the left, dark moody
tones, no text, no logos."

Limites que não se negocia:
- **Nunca** gerar pessoas apresentadas como clientes reais, depoimentos ou
  equipe da Vitamina. Gente gerada é sempre anônima e incidental (mãos, costas,
  silhueta).
- Nunca gerar logotipos, marcas ou fachadas de empresas reais.
- Sempre **olhar a imagem gerada** (Read) antes de embutir: mãos com dedos
  errados e texto alucinado são os defeitos clássicos — regenere se houver.

## Preparo final

- Corte/redimensione com o ffmpeg-static (npm i ffmpeg-static):
  `ffmpeg -i in.jpg -vf "crop=W:H:X:Y,scale='min(1600,iw)':-2" -f image2 -c:v libwebp -q:v 74 out.webp`
- Mire ~100–300 KB por foto (WebP q≈74, ≤1600px) — o HTML final embute tudo em
  data URI e precisa continuar leve (artifact ≤ 16 MB; PDF idem por e-mail).
- Rode `scripts/embutir.py` por último e confira o aviso de imagens faltando.
