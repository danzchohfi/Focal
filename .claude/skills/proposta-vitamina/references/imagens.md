# Imagens da proposta — de onde tirar

A proposta vende a experiência; a imagem é o que separa o documento de um PDF
de sistema. A hierarquia abaixo existe por decisões do Daniel (2026-08):
o portfólio em vídeo da própria Vitamina é a fonte padrão, porque ele não tem
tempo de curar fotos por proposta — e porque é prova de trabalho, não banco de
imagem.

## Ordem de preferência

1. **Capas dos vídeos do portfólio (liberado, use como padrão).** Demo reel +
   vitrine oficial — UIDs e receita de thumbnail em `produtos.md`. Regras:
   - Olhe cada capa (Read) antes de usar; se o frame de `time=1s` tiver
     legenda queimada ou rosto em close estranho, amostre outros tempos
     (`time=3s`, `5s`, `8s`…) e escolha um frame limpo.
   - Cada card de vídeo no PDF é clicável → `vitaminapublicitaria.com.br/v/<uid>`.
   - Rotule case com a marca ("Cliente · Velocity") — é prova de produção
     para um cliente, não vídeo da VP.
2. **Assets oficiais do repo do sistema**: logos brancos em
   `webapp/public/clientes/logos/*.png` (parede monocromática — ou tem logo ou
   não entra; nunca parede de nomes) e prints reais de sites em
   `webapp/public/clientes/sites/*.jpg`.
3. **Material do próprio prospect** — o que o Daniel mandar. Se ele disse que
   vai mandar, espere; não produza o final sem.
4. **Fotos de clientes tiradas do site da Vitamina**: SÓ com o Daniel dizendo
   quais. Ele tem receio explícito de uso não combinado.
5. **Screenshot de site/demo** — Playwright (esconda overlays de dev e barras
   fixas), mobile 390×844 @2x apresentado como tela flutuando, nunca sangrado.
6. **Geração via Higsfield** — último recurso, quando nada acima cobre.

## Gerando no Higsfield sem cara de IA (quando chegar a isso)

Use `mcp__Higsfield__generate_image` (na dúvida de modelo,
`models_explore(action:'recommend')`). Receita: "editorial documentary
photograph" + assunto humano parcial (mãos, costas, silhueta — nunca rosto em
close) + "natural window light, soft shadows, subtle film grain" + espaço
negativo para texto + "no text, no logos, no watermarks".

Limites que não se negocia:
- Nunca gerar pessoas apresentadas como clientes reais, depoimentos ou equipe.
- Nunca gerar logotipos/marcas reais.
- Sempre olhar a imagem gerada (Read) antes de embutir — mãos erradas e texto
  alucinado são os defeitos clássicos; regenere o CONCEITO (não retoque).

## Preparo final

- Recorte/comprima com ffmpeg-static:
  `ffmpeg -i in.jpg -vf "crop=W:H:X:Y,scale='min(1600,iw)':-2" -f image2 -c:v libwebp -q:v 74 out.webp`
- Mire ~100–300 KB por imagem; rode `scripts/embutir.py` por último e trate
  qualquer aviso de imagem faltando — proposta com imagem quebrada não sai.
