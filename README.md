# Focal Inc — Novo site

Site da Focal Incorporadora (focalinc.com.br), reconstruído em **Next.js 16 +
TypeScript + Tailwind 4**, seguindo o plano em
[`docs/plano-site-focal.md`](docs/plano-site-focal.md).

## Rodando localmente

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produção
pnpm lint
```

## Estrutura

- `src/data/empreendimentos.ts` — **fonte de verdade do portfólio.** O Artur 73
  está completo; as outras 4 fichas estão em `draft: true` e aparecem como
  "em preparação" até recebermos os inputs (plano §8). Para publicar uma ficha:
  preencher os campos e remover `draft`.
- `src/lib/site.ts` — dados institucionais, pilares, 4 passos, números de prova.
- `src/lib/tracking.ts` — GA4/GTM, persistência de UTM e deep links de WhatsApp
  com mensagem contextual.
- `src/app/api/lead/route.ts` — recepção de leads (intenção + empreendimento +
  origem). Integração com Staple/CRM via `LEAD_WEBHOOK_URL`.
- Redirects do WordPress antigo em `next.config.ts`.

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canônica (default `https://focalinc.com.br`) |
| `NEXT_PUBLIC_GA_ID` | ID do GA4 (`G-XXXX`) — sem ela o site roda sem analytics |
| `NEXT_PUBLIC_WHATSAPP` | Número do WhatsApp comercial, formato `5511XXXXXXXXX` |
| `LEAD_WEBHOOK_URL` | Webhook para entrega de leads (Staple/CRM/Zapier) |

## Publicação (go-live)

1. Importar este repositório na [Vercel](https://vercel.com/new) (ou hospedagem
   Node equivalente) — build automático a cada push.
2. Configurar as variáveis de ambiente acima.
3. Apontar o DNS de `focalinc.com.br` (A/CNAME) para a hospedagem.
4. Conferir a lista de pendências de conteúdo no plano §8 (fotos, vídeos,
   fichas dos demais empreendimentos, número de WhatsApp e GA).

## Pendências de conteúdo (resumo)

Fotos/vídeos finais (os placeholders editoriais são automáticos enquanto
`src` estiver vazio), fichas dos outros 4 empreendimentos, materiais do
"Novo Jango", confirmação dos números institucionais e valor do m² do
Artur 73. Lista completa: `docs/plano-site-focal.md` §8.
