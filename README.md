# Focal Inc — Site (réplica do WordPress atual)

Nova versão do site da Focal Incorporadora (focalinc.com.br), construída em
**Next.js 16 + TypeScript + Tailwind 4** como **réplica fiel do site WordPress
no ar** — mesma arquitetura, mesmas páginas, mesmos textos, imagens e
identidade — com melhorias técnicas pontuais (performance, animações
discretas, formulários com fallback de WhatsApp).

> A iteração anterior (reformulação completa) está preservada como backup na
> branch [`claude/focal-site-redesign-svst3x`](../../tree/claude/focal-site-redesign-svst3x).

## Rodando localmente

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produção
pnpm lint
```

## Páginas (mesmas rotas do site atual)

| Rota | Conteúdo |
|---|---|
| `/` | Home: hero com vídeo de drone (YouTube no desktop, mp4 no mobile), vitrine com filtros, números, institucional |
| `/artur-73` | LP completa do lançamento (formulário de qualificação, status da obra, plantas, obra Maio/2026, mapa) |
| `/jaunas-95` · `/mourato-111` · `/padre-carvalho-730` · `/quadra-butanta` | LPs dos entregues (mesmo template) |
| `/sobre` · `/atendimento` | Split-screen com painel escuro (manifesto / formulário) |
| `/parcerias-2` | Parcerias com CTA de cadastro via WhatsApp e vitrine |
| `/tour-virtual` · `/download-folder-digital` | Páginas de apoio do Artur 73 |
| `/politica-de-privacidade-e-seguranca` | Texto integral do site atual |

## Atribuição e ROAS

O site também é a origem do pipeline que liga **clique de mídia → lead →
qualificação → venda no CVCRM → ROAS por campanha, grupo e anúncio**. Manual
completo em [`docs/atribuicao-roas.md`](docs/atribuicao-roas.md).

```bash
ATRIBUICAO_ARQUIVO=./.dados pnpm exec tsx scripts/roas.ts demo  # ver o relatório com dados de exemplo
pnpm roas:sync                                                  # custo (Google/Meta) + funil (CVCRM)
pnpm roas:relatorio -- --de 2026-03-01 --ate 2026-03-31 --dimensao anuncio
pnpm test                                                       # testes do motor de atribuição
```

Painel no navegador: `/relatorios/roas?k=RELATORIO_TOKEN`.

> Requer deploy com servidor (Vercel/Node). No build estático do GitHub Pages o
> `proxy.ts` não roda e o cookie de atribuição morre em 7 dias no Safari.

## Estrutura

- `src/data/projetos.ts` — fonte de verdade dos 5 empreendimentos (textos, specs, status, destaques).
- `src/data/galerias.json` — galerias/plantas extraídas do site atual.
- `src/data/privacidade.json` — texto integral da política de privacidade.
- `public/wp/` — todos os assets do site atual (imagens, plantas, vídeos, PDFs) auto-hospedados.
- `src/app/fonts.css` — DIN 2014 via Adobe Fonts (mesmos arquivos do site atual); Open Sans via `next/font`.
- `src/app/api/lead/route.server.ts` — recepção de leads (grava o warehouse de atribuição, espelha no CVCRM e no `LEAD_WEBHOOK_URL`). No build estático os formulários caem no WhatsApp com mensagem contextual.
- `src/lib/atribuicao/` · `src/lib/roas/` · `src/lib/cvcrm/` · `src/lib/ads/` — pipeline de atribuição e ROAS (ver `docs/atribuicao-roas.md`).
- Rotas com sufixo `.server.ts` só existem no build com servidor; o export estático as ignora (ver `next.config.ts`).

## Publicação

- **Preview:** GitHub Pages (workflow `.github/workflows/pages.yml`, build estático com `STATIC_EXPORT=1`).
- **Produção:** importar na Vercel (ou hospedagem Node) e apontar o DNS de `focalinc.com.br`; variáveis: `NEXT_PUBLIC_SITE_URL`, `LEAD_WEBHOOK_URL` (opcional).

## Melhorias em relação ao WordPress (sem mudar a experiência)

- Sem bloqueio 403 a crawlers; previews de link funcionam.
- Vídeos e imagens lazy; contadores/gráficos animados só ao entrar no viewport; `prefers-reduced-motion` respeitado.
- Partículas sutis no hero da home (desligáveis por reduced-motion).
- Formulários (mesmos campos do CF7 atual) com envio para API/webhook e fallback de WhatsApp com contexto.
- Redirects das URLs residuais do WordPress (`/shop`, `/portfolio`, `/page_category/*`).
- Logo corrigido na página de Tour Virtual (no site atual fica preto sobre fundo preto).
