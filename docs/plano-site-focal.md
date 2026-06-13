# Focal Inc — Plano do Novo Site

> Documento-mestre da reformulação de focalinc.com.br.
> Fonte de verdade: transcrições e documentos internos (Notion/VP) + dados públicos indexados do site atual.
> Data: junho/2026.

---

## 0) Base de verdade (fatos extraídos dos materiais internos)

### Institucional
- **Razão social:** Focal Incorporadora e Desenvolvimento Imobiliário Ltda — CNPJ 24.457.654/0001-07, fundada em 24/03/2016.
- **Sede:** Rua Diogo Moreira, 132 — 20º andar, cj. 2010, Pinheiros, São Paulo/SP. Tel (11) 3136-0142 · contato@focalinc.com.br.
- **Sócios:** Antonio Oliveira Ribeiro Bordon (origem em loteamentos) e Ricardo Birger (arquiteto, sócio da JBA — Jonas Birger Arquitetura).
- **Números divulgados:** R$ 500 milhões vendidos · 1.300+ unidades entregues · 80.000 m² construídos. ⚠️ Verificar antes de publicar (ver seção 8).
- **Atuação:** somente São Paulo capital; campanhas focadas no bairro.

### Marca e narrativa (reunião 22/10/2025)
- **Slogan novo:** “Projetos que funcionam, em endereços que permanecem.” (substitui “Projetos especiais”).
- **Pilares:**
  1. **Localização privilegiada** — endereços consolidados em bairros tradicionais; terreno é critério, não acaso.
  2. **Inteligência arquitetônica** — projetos funcionais que maximizam luz, ventilação e fluidez; “pensar como proprietário”.
  3. **Valor calibrado** — preço de mercado, sem inflação artificial.
- **Processo (“4 Passos”):** Descoberta estratégica → Arquitetura intencional → Comercialização inteligente → Entrega impecável.
- **Identidade visual:** minimalismo de inspiração escandinava; preto/branco/cinza + verde institucional; entrada de tons quentes (bordô, pastéis); tipografia DIN (precisão) + complementar arredondada; **imagem como elemento central**. Referência citada: lavvi.com.br. Boas referências de concorrência: SKR, Nortis; demais: Idea Zarvos, Cyrela, Gafisa, Mitre.

### Persona e linguagem
- Persona “Antonio”, 35–55 anos: localização é fator determinante; orgulho de mostrar onde mora (“pé-direito duplo na sala”); quer menos trânsito, proximidade de metrô/trabalho/escola.
- Palavras-chave do público: pé-direito duplo, iluminação, flexibilidade, planta inteligente, “na esquina da Oscar Freire”, “na quadra do metrô”.

### Artur 73 (produto em venda — ficha real)
- Esquina Artur de Azevedo × Oscar Freire, Pinheiros; rua sem saída; **mesma quadra do metrô**; eixo Rebouças/Eusébio Matoso.
- Torre única, 27 pavimentos, 60 unidades. Arquitetura **JBA — Jonas Birger Arquitetura**.
- **Residencial:** 81–88 m², 2 suítes + lavabo, living com pé-direito duplo de 5,5 m, 1 vaga com infra para eletrificação. A partir de **R$ 2,054 mi**.
- **NR (não residencial):** 52 m², tese de investimento (short-stay/Airbnb). A partir de **R$ 1,5 mi**. Valorização ~**12% a.a.** desde o lançamento (2023).
- Lazer em 2 pavimentos + rooftop: piscina de 25 m com vista, academia a +80 m de altura, quadra de areia, salão de festas, playground, churrasqueira, mindfulness, sports bar, hidro.
- Entrega 2026. Decorados (81 m² e NR) em produção. Tour virtual existente.
- **Aprendizado de mídia:** criativos com especificações (m², suítes, pé-direito) convertem melhor (CPL R$ 12–15) do que criativos de bairro. Informar preço no criativo é a estratégia atual para qualificar.

### Funil atual (dados de abr/2026)
- Anúncio → site → WhatsApp/formulário. **216 cliques em WhatsApp viraram só 36 leads** (quebra enorme entre clique e mensagem enviada).
- 36 leads → 20 qualificados; muitos corretores e fornecedores entram pelo mesmo funil.
- IA **“Laís”** faz pré-atendimento e triagem no WhatsApp (cliente final vs. parceiro) há ~1 ano; sistema **Staple** para gestão de leads.
- SLA interno: MQL com dados completos; vendas responde em até 24h.

---

## 1) Auditoria do site atual

**Nota de método:** o site retorna HTTP 403 para agentes não-navegador, o que limitou a navegação automatizada. A auditoria combina a estrutura indexada (Google), as URLs públicas e o que foi discutido nas reuniões internas. Esse próprio bloqueio é um achado (item 5).

### Principais problemas (UX e conversão)
1. **Infraestrutura WordPress vazando na experiência.** URLs como `/page_category/empreendimentos/`, taxonomia duplicada (`/portfolio/` + “empreendimentos”) e uma página **`/shop/` residual de tema WooCommerce indexada no Google**. Para uma marca que quer parecer “produto premium”, isso quebra a percepção logo no resultado de busca e dilui SEO.
2. **Vitrine sem hierarquia de decisão.** Os empreendimentos são listados por categoria (lançamento / em construção / breve lançamento / entregues) sem dados comparáveis na listagem (m², tipologia, bairro, preço, status com data). O usuário não consegue *escolher* — só clicar um por um.
3. **Conversão com fricção dupla e sem contexto.** O funil anúncio → site → WhatsApp perde ~83% entre clique e mensagem (216 cliques → 36 leads em abril). O CTA de WhatsApp não carrega contexto (empreendimento, intenção, mensagem pré-preenchida), e o formulário único mistura comprador, corretor e fornecedor — a triagem cai inteira na Laís.
4. **Prova despadronizada e legibilidade fraca.** Números institucionais existem mas soltos; menu e fontes pequenos no desktop (apontado na reunião de 22/10); a página “Sobre” não conta o manifesto nem o processo.
5. **Site fechado para máquinas.** O 403 a crawlers/ferramentas afeta previews de link (WhatsApp/LinkedIn), auditorias de performance e potencialmente bots de busca secundários. Premium também é ser bem citado.

### O que está bom e deve ser preservado
- **Minimalismo preto/branco com imagem grande** — coerente com a marca; a reformulação refina, não recomeça.
- **Slogan e pilares já definidos** (22/10/2025) — o novo site é a primeira aplicação em escala deles.
- **Página do Artur 73 com conteúdo rico** (tour virtual, fotos do decorado, ficha técnica com pé-direito duplo e infra de eletrificação) — vira o protótipo do novo template.
- **Atendimento via WhatsApp + Laís** — o motor funciona; falta o site entregar leads com contexto.
- **Números institucionais** — manter, desde que verificados e atualizáveis.

---

## 2) Conceito criativo — 3 rotas e recomendação

### Rota A — “Editorial arquitetônico”
A revista da Focal: fotografia em tela cheia, tipografia DIN grande, ritmo de scroll com muito respiro, texto mínimo.
- ✅ Máxima percepção premium; barato de manter; serve a marca minimalista.
- ❌ Comparação e dados ficam em segundo plano — exatamente a maior fraqueza do site atual; risco de “vitrine bonita que não converte”.

### Rota B — “Produto/portfólio”
Curadoria com dados: cards ricos, filtros, specs em primeiro plano, comparação lado a lado.
- ✅ Resolve a escolha entre os 5; alinhado ao aprendizado de mídia (criativos com especificação convertem mais).
- ❌ Com apenas 5 produtos, uma UI de “catálogo com filtros pesados” parece frio e superdimensionado; menos memorável.

### Rota C — “Imersivo com motion”
Transições page-to-page, vídeo dominante, microinterações em tudo, eventuais momentos WebGL.
- ✅ Potencial “award-worthy”; diferenciação máxima.
- ❌ Custo e prazo maiores; risco real para Core Web Vitals; manutenção exige equipe; motion sem propósito envelhece rápido.

### ✅ Recomendação: **A + espinha dorsal de B, com C como tempero** — “Editorial com dados”
Por quê:
1. **5 empreendimentos é curadoria, não catálogo.** A narrativa editorial dá o tom premium; os dados estruturados (barra de specs, filtros leves, comparação) resolvem a decisão. Nenhuma das rotas puras faz as duas coisas.
2. **A prova já mostrou o caminho:** nos anúncios, especificação > adjetivo (CPL R$ 12 vs. criativos de bairro com pior performance). O site deve repetir a fórmula: foto editorial + dado objetivo na mesma dobra.
3. **A marca já é editorial-minimalista** (DIN, preto/branco, imagem central) — a rota A é continuidade natural; B e C puros exigiriam reinventar a identidade recém-definida.
4. Motion entra **apenas onde gera percepção ou clareza** (lista priorizada na seção 6), com fallback CSS e `prefers-reduced-motion` — preservando CWV.

---

## 3) Sitemap e arquitetura de navegação

```
/                           Home — curadoria + prova + distribuição
/empreendimentos            Vitrine: filtros (status, bairro, metragem, uso) + comparar
/empreendimentos/artur-73   Página definitiva (template seção 5)
/empreendimentos/[slug]     × demais 4 empreendimentos
/sobre                      Manifesto, pilares, 4 Passos, números, sócios + JBA, linha do tempo
/parcerias                  Terrenistas (núcleo), corretores, fornecedores
/atendimento                Hub com roteamento por intenção
/clientes                   Área do cliente: assistência técnica, manuais, documentos
/privacidade                Política de privacidade e segurança
─── Fase 2 (opcional) ───
/jornal                     Conteúdo: bairro, arquitetura, diário de obra, guias
/investir                   Tese NR/short-stay (existe internamente: campanha NR, ~12% a.a.)
```

**Navegação (header):** Empreendimentos · Sobre · Parcerias · Atendimento — e CTA persistente “WhatsApp” (com contexto da página). Menu e tipografia maiores no desktop (pedido interno).

**Roteamento por intenção em /atendimento** (alimenta Laís/Staple já segmentado):
- Quero comprar → escolhe empreendimento → WhatsApp com mensagem pré-preenchida ou formulário curto.
- Tenho um terreno → formulário específico (localização, metragem, documentação) → vai para /parcerias.
- Sou corretor(a) → cadastro de parceria.
- Sou fornecedor → formulário próprio (tira fornecedor do funil de vendas — hoje contamina os leads).
- Já sou cliente / assistência técnica → /clientes.

**Higiene de migração:** 301 de `/page_category/*`, `/portfolio/*`, `/artur-73/` → novas rotas; **remover `/shop/`** e solicitar remoção do índice; sitemap.xml + robots liberado para bots legítimos.

---

## 4) Home — wireframe textual

| # | Seção | Objetivo (dúvida que resolve) | Conteúdo | Prova | CTA |
|---|-------|------------------------------|----------|-------|-----|
| 1 | **Hero** | “Onde estou? Isso é para mim?” | Vídeo curto mudo (drone Pinheiros → fachada → interior decorado), H1: “Projetos que funcionam, em endereços que permanecem.” Sub: “Incorporadora paulistana de projetos especiais — do terreno certo à entrega impecável, desde 2016.” | O próprio vídeo (obra real, não render genérico) | Primário: “Conhecer os empreendimentos” (âncora p/ §4) · Secundário: “Falar com a Focal” (WhatsApp) |
| 2 | **Barra de prova** | “Posso confiar?” | 4 números em linha: R$ 500 mi vendidos · 1.300+ unidades entregues · 80.000 m² construídos · desde 2016 | Números verificados e atualizáveis via CMS | — (âncora “ver portfólio”) |
| 3 | **Destaque do momento (Artur 73)** | “O que está à venda agora?” | Card hero: foto do living pé-direito duplo + status “Em construção · entrega 2026” + specs: 81–88 m² · 2 suítes · pé-direito 5,5 m · quadra do metrô + “a partir de R$ 2,054 mi” | Foto real do decorado, tour virtual, arquitetura JBA | “Ver o Artur 73” · “WhatsApp sobre o Artur 73” (msg pré-preenchida) |
| 4 | **Vitrine dos 5** | “Quais são as opções? Como comparo?” | Grid editorial 5 cards; cada card: foto, nome, bairro, status (badge), 3 highlights (metragem, tipologia, diferencial-chave) | Fotos reais; status com data | Card → página; link “comparar todos” → /empreendimentos |
| 5 | **Porquê Focal (3 pilares com prova)** | “Por que vocês e não a concorrência?” | 1. Localização: “terrenos em esquinas consolidadas — Artur de Azevedo × Oscar Freire, na quadra do metrô”. 2. Inteligência arquitetônica: “pé-direito duplo, ventilação cruzada, plantas que envelhecem bem — projeto JBA”. 3. Valor calibrado: “preço de mercado; o Artur 73 valorizou ~12% a.a. desde 2023” | Cada pilar com foto + dado, zero adjetivo solto | “Conhecer a Focal” → /sobre |
| 6 | **Como trabalhamos (4 Passos)** | “Como é o processo? Sou bem cuidado?” | Descoberta estratégica → Arquitetura intencional → Comercialização inteligente → Entrega impecável (1 linha cada) | Foto de obra/equipe por passo | → /sobre#processo |
| 7 | **Tese de investimento (NR)** *(condicional)* | “Serve para investir?” | Teaser: studios NR 52 m² para short-stay, a partir de R$ 1,5 mi, valorização ~12% a.a. | Dado de valorização + foto NR | “Falar sobre investimento” (WhatsApp com intenção=investir) |
| 8 | **Parcerias / terreno** | “Tenho um terreno — interessa?” | “Terrenos espetaculares são o início de tudo. Tem um em bairro consolidado?” | 4 Passos como garantia de processo | “Apresentar um terreno” → /atendimento?intencao=terreno |
| 9 | **Atendimento** | “Como falo com vocês sem fricção?” | WhatsApp (resposta imediata com a Laís) + formulário curto com seletor de intenção | “Resposta em até 24h úteis” (SLA real) | clique_whatsapp / submit_form |
| 10 | **Footer** | credenciais e navegação | Endereço, CNPJ, telefone, e-mail, redes, links legais, selo JBA/parceiros | — | — |

---

## 5) Template definitivo — página de empreendimento

Ordem das seções (variações por status indicadas):

1. **Hero** — vídeo (lançamento/obra) ou foto definitiva (entregue). Nome + bairro + badge de status com data (“Em construção · entrega 2026”). Barra de highlights fixa: metragem · tipologia · vagas · status · “a partir de R$” (se em venda). CTA duplo: WhatsApp contextual + “ver plantas”.
2. **O projeto em 30 segundos** — 3–5 bullets objetivos. Ex. Artur 73: “Esquina Artur de Azevedo × Oscar Freire, na quadra do metrô” · “Living com pé-direito duplo de 5,5 m” · “60 unidades, torre única JBA” · “Rooftop com piscina de 25 m e academia a +80 m” · “Entrega 2026”.
3. **Galeria editorial** — curadoria com legendas úteis (“Living de 5,5 m de pé-direito — apto. 84 m²”), categorias: fachada / áreas comuns / interiores / obra (status real). Lightbox + tour virtual embutido quando existir.
4. **Diferenciais arquitetônicos** — pares foto+dado (luz natural, ventilação, planta, infra EV). Assinatura do escritório (JBA) com 1 parágrafo. Sem adjetivos órfãos: todo claim com prova visual ou número.
5. **Plantas e unidades** — tabs por tipologia (ex.: Residencial 81–88 m² · NR 52 m²); planta ampliável, m², orientação; **disponibilidade** (em venda) ou “100% vendido” (entregue). CTA por tipologia: “Quero esta planta” → WhatsApp com tipologia na mensagem.
6. **Localização e entorno** — mapa interativo leve (lazy) + “vida no entorno”: metrô, padarias, escolas, hospitais com distâncias reais a pé. Para entregues: “quem mora aqui” (depoimentos, se houver).
7. **Tese de investimento** *(só onde houver NR/short-stay)* — números: preço, valorização, cenário de locação.
8. **Atendimento contextual** — WhatsApp pré-preenchido (“Olá! Quero saber mais sobre o {nome}, tipologia {X}”) + formulário curto (nome, e-mail, telefone, intenção: morar/investir) já etiquetado com o empreendimento.
9. **FAQ + documentos** — perguntas reais do funil (preço, financiamento, prazo, vaga, NR pode morar?) em accordion com schema FAQPage; documentos (book, memorial, registro de incorporação) em PDF nomeado e rastreado.
10. **Prova e credenciais** — números da Focal, arquitetura JBA, linha “outros projetos” (cross-sell entre os 5).
11. **Footer padrão.**

**Variações por status:**
- **Lançamento/em construção:** hero em vídeo, preço “a partir de”, disponibilidade, diário de obra (fotos com data — prova de avanço), CTA agressividade média (“agendar visita ao decorado”).
- **Entregue:** hero foto definitiva, galeria com fotos habitadas, “entregue em {ano}” como prova, sem preço; CTA muda para “quero um projeto assim” → direciona para o produto em venda e para parcerias. Página vira ativo de credibilidade + SEO de bairro.

---

## 6) Microinterações e motion (priorizado, com fallback)

Regra: tudo serve a percepção premium, clareza ou conversão. `prefers-reduced-motion` desliga transform/parallax e mantém opacidade simples. Nada pode degradar LCP/CLS/INP.

### Nível 1 — Base (CSS puro; entrega junto com o MVP)
1. **Fade-up suave em seções no scroll** (IntersectionObserver + CSS) — ritmo editorial. ~0 custo de performance.
2. **Hover de card de empreendimento:** leve scale na foto (1.03) + revelar barra de specs — clareza + premium.
3. **Badge de status com cor semântica** (lançamento/obra/entregue) e microtransição.
4. **Header que encolhe no scroll** e mantém CTA WhatsApp visível — conversão.
5. **Counters da barra de prova** animando ao entrar no viewport (uma vez só).
6. **Estados de formulário** (focus, validação inline, sucesso com confirmação clara) — conversão direta.

### Nível 2 — Avançado (GSAP + ScrollTrigger; fase 2)
7. **Transição entre listagem → página do empreendimento** (a foto do card expande para o hero, View Transitions API com fallback) — sensação de app premium.
8. **Galeria com drag inercial + legendas que acompanham** — experiência editorial.
9. **Sequência “pé-direito duplo”:** scrollytelling curto na seção de diferenciais (foto do living revela a escala de 5,5 m com linha de medida animada) — transforma o principal argumento de venda em momento memorável.
10. **Mapa do entorno com pins que aparecem em cascata** conforme scroll.
11. **Time-lapse de luz natural** (vídeo curto já planejado internamente com IA) como bloco de diferencial.

### Nível 3 — Pontual (apenas se houver verba/asset; nunca bloqueante)
12. **Hero com vídeo controlado por scroll** (scrub) na página do Artur 73.
13. **Maquete 3D leve (Three.js) ou tour 360 embutido** — somente lazy, abaixo da dobra, com poster estático como fallback. Avaliar contra o tour virtual já existente antes de investir.

---

## 7) Requisitos técnicos e tracking

### Stack
- **Next.js (App Router) + TypeScript**, SSG/ISR para tudo (conteúdo muda pouco); CMS headless leve (Sanity/Payload) para que a equipe atualize status, disponibilidade, números e FAQ sem dev.
- Hospedagem com edge/CDN (Vercel ou equivalente). **Sem bloqueio 403 indiscriminado a bots** — usar WAF com allowlist de crawlers.

### SEO
- 1 URL canônica por empreendimento (`/empreendimentos/artur-73`); H1 = nome + bairro; metadados e OG image por página (preview bonito no WhatsApp — canal nº 1).
- Schema.org: `Organization` (+ números), `ApartmentComplex`/`Residence` por empreendimento, `BreadcrumbList`, `FAQPage`.
- 301 de todas as URLs antigas; remover `/shop/`; sitemap.xml; conteúdo de bairro (fase 2) para SEO local.

### Performance e acessibilidade
- Imagens AVIF/WebP responsivas (`next/image`), LCP do hero pré-carregado; vídeo hero: muted/loop, poster, `preload=metadata`, servido em resolução por viewport.
- Mapas e embeds (tour 360) lazy com facade. Fontes self-hosted com `font-display: swap`.
- Metas: LCP < 2,5 s · CLS < 0,1 · INP < 200 ms (testar em 4G/celular médio).
- A11y: contraste AA no preto/verde, navegação por teclado na galeria/filtros, `alt` descritivo real, foco visível, formulários com labels e erros anunciados.

### Tracking (GA4 + GTM; espelhar para Meta CAPI e Google Ads)
| Evento | Parâmetros | Disparo |
|---|---|---|
| `view_empreendimento` | `empreendimento`, `status`, `origem` | Pageview da página do empreendimento |
| `view_galeria` | `empreendimento`, `categoria_foto` | Abertura de lightbox / 50% da galeria |
| `view_planta` | `empreendimento`, `tipologia` | Interação na seção de plantas |
| `clique_whatsapp` | `empreendimento`, `intencao`, `posicao` (hero/planta/footer), `origem` | Clique no deep link |
| `submit_form` | `empreendimento`, `intencao` | Sucesso do envio |
| `download_documento` | `empreendimento`, `documento` | Clique em PDF |

- **Origem (campanha → empreendimento):** persistir UTMs em first-party cookie/sessionStorage e anexar a todos os eventos e ao payload do formulário/Staple.
- **WhatsApp com palavra-chave por origem** na mensagem pré-preenchida (ex.: “Olá! Vi o Artur 73 no site e…”) — fecha o buraco de atribuição entre clique e conversa, alinhado ao que a equipe já faz em campanha e à triagem da Laís.
- Para reduzir a quebra clique→mensagem: mostrar mini-modal antes do redirect (“Você vai falar com a Laís, nossa atendente — resposta imediata”) com o texto já visível. Medir as duas etapas.
- LGPD: banner de consentimento com Google Consent Mode v2; formulários com finalidade explícita.

---

## 8) Inputs faltantes (bloqueiam conteúdo, não a arquitetura)

1. **Materiais do “Novo Jango”** — ❗não localizados no Notion, Drive ou e-mail conectados. Precisamos: onde estão (pasta/link) e o que é o projeto (é um dos 5? nome oficial, endereço, status, ficha técnica).
2. **Fichas dos outros 4 empreendimentos** (além do Artur 73): nome, endereço, bairro, status, ano de entrega, metragens, tipologias, arquiteto, fotos/books/drones, plantas em alta.
3. **Confirmação dos números institucionais** (R$ 500 mi / 1.300 unidades / 80.000 m²) e fonte de atualização — o valor de 1.300 unidades pode incluir loteamentos; precisamos da regra do número para não publicar dado frágil.
4. **Valor do m² do Artur 73** (pendência já apontada na reunião de 07/05 para os criativos — vale para o site).
5. **Assets brutos:** vídeos drone, fotos editoriais em alta, tour virtual (link/embed), book de cada empreendimento, fotos do decorado NR (Taciana ficou de enviar em 07/05).
6. **Documentos por empreendimento:** memorial descritivo, registro de incorporação (o site atual já serve um PDF — listar todos).
7. **Depoimentos/“quem mora”** dos entregues (se existirem) e prêmios/menções de arquitetura da JBA aplicáveis.
8. **Área de clientes atual:** o que existe hoje (login? sistema?) para decidir entre manter, refazer ou linkar sistema externo.
9. **Número de WhatsApp oficial por campanha** (Zé conectou número novo em mai/2026) — definir qual o site usa.
