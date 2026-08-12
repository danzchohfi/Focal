# Custos de hospedagem — tours virtuais + site Focal

**Data:** 12/ago/2026 · **Câmbio:** US$ 1 = R$ 5,09 (cotação de 11/ago)
**Contexto:** e-mail da Tassiana (Focal) sobre hospedar os tours virtuais das vistas
dos andares (Rua General Furtado do Nascimento e Rua Massacá), produzidos pela Gyro.

> **Revisão de 12/ago.** Duas informações novas mudaram a conclusão original:
> 1. **Os tours foram publicados** e estão no ar em `focalinc.com.br/tourvirtual/`.
>    A pergunta 1 está resolvida (§3).
> 2. **A mensalidade real da WP Engine é US$ 14,95, não US$ 30.** A versão anterior
>    comparava com o preço de tabela do plano Startup e concluía que a Vercel
>    economizaria R$ 51/mês. Com o valor correto, **a Vercel passa a ser mais cara
>    que a hospedagem atual**, e a recomendação muda (§4, §5).

---

## 1. Resumo executivo

| Pergunta | Resposta | Custo |
|---|---|---|
| **Onde hospedar os tours virtuais?** | ✅ Resolvido — publicados na raiz da WP Engine. | **R$ 0** |
| **Quanto custa subir o site novo fora do WordPress?** | Cloudflare Workers, plano gratuito. | **Economia de R$ 76/mês** |

**O site é pesado em mídia, e é isso que decide a hospedagem.** São 152 MB de assets e
~5 MB por pageview medidos. Nesse perfil, o único custo que varia entre provedores é
banda — e a Cloudflare é a única que não cobra por ela. Sai de R$ 76/mês (US$ 14,95)
para **R$ 0**, com banda ilimitada em vez do teto de 75 GB de hoje.

**Ressalva:** dois arquivos passam do limite de 25 MiB por arquivo da Cloudflare e
precisam ser comprimidos ou movidos para o R2 (§4.4). É a mesma compressão de PDF que
o documento já recomendava — ela resolve o bloqueio e a banda de uma vez.

---

## 2. O que são esses arquivos (diagnóstico técnico)

Pela estrutura de pastas, é um tour **krpano**:

```
index.html   tour.js   tour.xml   compass.xml
panos/       skin/     plugins/   images/
scenes_dia_torre_a.xml    scenes_dia_torre_b.xml
scenes_tarde_torre_a.xml  scenes_tarde_torre_b.xml
scenes_noite_torre_a.xml  scenes_noite_torre_b.xml
tour_testingserver.exe    tour_testingserver_macos
Montserrat-Medium.ttf
```

**a) É 100% estático.** Não tem PHP, banco de dados nem Node. São arquivos servidos como
estão. Qualquer hospedagem de arquivo estático serve.

**b) O `FATAL ERROR: tour.xml - loading failed!` não é defeito.** Acontece porque o
`index.html` foi aberto direto do disco (`file://`). O krpano carrega o `tour.xml` via
requisição HTTP e o navegador bloqueia isso em arquivo local. Servido por HTTP, funciona —
é o que o próprio erro diz e o motivo dos `tour_testingserver` existirem.

**c) A restrição que sobra é a contagem de arquivos, não o tamanho.** O krpano fatia cada
panorama em milhares de *tiles*. A ~157 MB, a estimativa é de **3.000 a 8.000 arquivos** —
confortavelmente abaixo do limite de 15.000 da Vercel, mas é o único número que ainda
precisa ser verificado (ver §6).

### 2.1 Sobre o `.exe` — ele não vai para o servidor

`tour_testingserver.exe` (Windows) e `tour_testingserver_macos` **não fazem parte do tour**.
São o servidorzinho local que o krpano inclui para você pré-visualizar o tour na sua
máquina — é justamente o que resolve o erro do `file://` descrito acima. Numa hospedagem
web eles não têm função nenhuma: o servidor já é o servidor.

**A conduta correta é apagar os dois antes de subir**, em qualquer hospedagem. O tour
funciona perfeitamente sem eles.

Se subissem, aconteceriam duas coisas ruins:

- Nenhum host executa um `.exe` — WP Engine, Vercel e R2 servem só arquivo estático, e a
  WP Engine em particular só executa PHP. Então o binário ficaria **inerte, mas
  baixável** por quem descobrisse a URL.
- Um executável baixável a partir do domínio do cliente é exatamente o padrão que dispara
  varredura de malware. A WP Engine roda esse tipo de scan e pode sinalizar ou colocar o
  arquivo em quarentena — e, no pior caso, o domínio pega alerta de Google Safe Browsing
  ou de antivírus. Risco desnecessário para um arquivo que não serve para nada ali.

Ou seja: não é um problema a resolver com o suporte da WP Engine, é um arquivo a deletar.

---

## 3. Pergunta 1 — Onde hospedar os tours ✅ resolvido

> **Status (12/ago):** os tours foram publicados na **raiz da WP Engine** e estão no ar,
> por exemplo em `focalinc.com.br/tourvirtual/aereo_focalinc_galeria3massaca`.
> Custo adicional **R$ 0**, como previsto. O restante desta seção fica como registro das
> alternativas avaliadas — e volta a importar em §4.6, porque migrar o site sem migrar os
> tours quebra essas URLs.

A ~157 MB, **todas as opções eram viáveis e todas custavam R$ 0**. A escolha passou a ser
operacional, não financeira.

| Opção | Cabe? | Custo/mês | Observação |
|---|---|---|---|
| **Repositório do site (Vercel)** | Sim | **R$ 0** | Recomendada — um deploy só, URL nativa |
| Cloudflare R2 | Sim | R$ 0 | Dentro da cota grátis de 10 GB |
| WP Engine (atual) | Sim | R$ 0 | Cabe em armazenamento; risco está na banda |
| Gyro hospedar | Sim | R$ 0 | Já é o modelo do tour do Artur 73 |

### 3.1 Recomendada: dentro do repositório do site

Colocar os arquivos em `public/tourvirtual/general/` e `public/tourvirtual/massaca/`.

- O repositório já tem 152 MB de assets; somar ~157 MB o leva a ~310 MB. Irrelevante para
  o GitHub e bem abaixo do limite de 1 GB de upload estático da Vercel Pro.
- A URL sai exatamente como a Gyro sugeriu: `focalinc.com.br/tourvirtual/general`.
- Sem bucket separado, sem credencial extra, sem CORS, sem MIME type para configurar —
  a Vercel já serve `.xml` e `.js` corretamente.
- Consumo de banda dentro do 1 TB já incluído no plano Pro (ver §4.3).

**Único pré-requisito:** a contagem de arquivos precisa ficar abaixo de 15.000 (§6).

### 3.2 Alternativa: Cloudflare R2

Se a contagem de arquivos estourar 15.000, o tour sai do repositório e vai para um bucket
R2, publicado em `tour.focalinc.com.br`.

- Armazenamento: 157 MB — dentro da cota grátis de 10 GB → **R$ 0**
- Banda de saída: gratuita no R2, sempre
- Leituras: ~400 tiles/sessão; a cota grátis de 10 milhões/mês cobre ~25.000 sessões

Custo continua **R$ 0**, mas adiciona um sistema a administrar. Só vale se o repositório
não comportar.

### 3.3 Manter na WP Engine: cabe, mas a banda preocupa

Os 157 MB cabem folgados nos 10 GB do plano Startup. **O gargalo é a banda**, que é
compartilhada com o site:

| Plano | US$/mês | Armazenamento | Banda/mês |
|---|---|---|---|
| Startup *(o atual)* | 30 | 10 GB | **75 GB** |
| Professional | 55 | 15 GB | 150 GB |
| Growth | 109 | 20 GB | 240 GB |

A ~15 MB por sessão de tour, os 75 GB dão ~5.000 sessões — **e isso antes de contar o
tráfego do próprio site**.

> 📌 Vale conferir a fatura atual. O plano Startup promete 25.000 visitas mas só 75 GB de
> banda. Num site com imagens deste peso (~5 MB/pageview), 25.000 visitas dariam ~125 GB —
> ou seja, a franquia de banda estoura antes da de visitas. É possível que já esteja
> havendo excedente hoje, independentemente dos tours.

### 3.4 Opção que já existe: a Gyro hospedar

A página `/tour-virtual` do site atual aponta para `https://estudiorgb.com.br/3d/` — o tour
do Artur 73 **está hospedado pelo próprio produtor**, e o site apenas linka.

Ou seja, já existe precedente. A Gyro mandou o tutorial de auto-hospedagem, mas nada impede
pedir que hospedem, como o Estúdio RGB faz. Custo zero e responsabilidade de manutenção
fica com quem produziu.

**Contraponto:** hospedando você, a URL fica no domínio da Focal
(`focalinc.com.br/tourvirtual/...`), o que é melhor para SEO, para o pixel de remarketing e
para não depender da infraestrutura de terceiros. Como o custo é zero de qualquer forma,
a recomendação continua sendo §3.1.

---

## 4. Pergunta 2 — Colocar o site novo no ar

### 4.1 O que o site é (medido no build)

Números do `next build` de 12/ago, não estimativas:

| | |
|---|---|
| Next.js / React | 16.2.9 / 19.2.4 |
| Páginas | 16 estáticas + 1 rota dinâmica (`/api/lead`) |
| HTML + JS + CSS de **todas** as páginas | **3,1 MB** |
| Assets em `public/wp/` | **152 MB** em 264 arquivos |

**O código é irrelevante para o custo; a mídia é tudo.** O site inteiro cabe em 3,1 MB —
os outros 152 MB são fotos, vídeos e PDFs herdados do WordPress.

Dois pontos técnicos que já jogam a favor:

- Usa `<img>` nativo, **não** `next/image` → **custo zero de Image Optimization**,
  que costuma ser a fatura-surpresa da Vercel.
- O vídeo do hero em desktop é um **iframe do YouTube** → essa banda corre por conta do
  YouTube, não da hospedagem. Só o mobile carrega mp4 local (2,6 MB).

### 4.2 Quanto pesa um pageview

Somando os assets que a home realmente referencia:

| | Peso |
|---|---|
| Home **desktop** (11 imagens + shell; vídeo via YouTube) | **~4,4 MB** |
| Home **mobile** (mesmas imagens + mp4 de 2,6 MB com `autoPlay`) | **~7,0 MB** |
| Média usada nas projeções | **~5 MB/pageview** |

Confirma a estimativa da versão anterior — agora medida. É um site **pesado**: 5 MB por
pageview é ~5× o normal para um site institucional. Por isso banda é a única variável de
custo que importa aqui.

### 4.3 As opções, com o preço real de hoje na mesa

Hoje a Focal paga **US$ 14,95/mês (R$ 76)** na WP Engine.

| Opção | US$/mês | R$/mês | Banda | `/api/lead` | Veredito |
|---|---|---|---|---|---|
| **Cloudflare Workers (Free)** | **0** | **0** | **ilimitada** | 100k req/dia | ✅ **Recomendada** |
| Cloudflare Workers (Paid) | 5 | 25 | ilimitada | 10M req/mês | Folga, se quiser |
| Netlify (Free) | 0 | 0 | 100 GB | 125k invocações | Grátis, mas com teto |
| **WP Engine hoje** | **14,95** | **76** | 75 GB | ✗ | Referência atual |
| Vercel Pro | 20 | 102 | 1 TB | incluída | **+R$ 26/mês vs. hoje** |
| Vercel Hobby | 0 | 0 | 100 GB | incluída | ❌ ToS proíbe uso comercial |
| GitHub Pages | 0 | 0 | ~100 GB | ✗ | ❌ ToS proíbe uso comercial |

Duas eliminações por contrato, não por preço:

> **Vercel Hobby está fora.** A documentação é literal: *"the Hobby plan restricts users
> to non-commercial, personal use only"*. Site de incorporadora exige Pro — US$ 20.
>
> **GitHub Pages está fora** como destino final. O ToS proíbe usar como *"free
> web-hosting service to run your online business"*. Serve para a preview de hoje, não
> para produção.

**Por que a Cloudflare ganha:** ela não cobra banda. A documentação é explícita —
*"requests to static assets are free and unlimited"* e *"no additional charges for data
transfer (egress) or throughput"*. Num site de 5 MB/pageview, isso é a diferença entre
ter um teto e não ter.

E a Vercel, que a versão anterior recomendava, **passa a custar R$ 26/mês a mais que
hoje** — não R$ 51 a menos. A conclusão original vinha do preço de tabela errado.

### 4.4 ⚠️ O bloqueio: dois arquivos passam de 25 MiB

A Cloudflare limita **25 MiB por arquivo** em assets estáticos (igual no Free e no Paid).
Dois arquivos do projeto estouram:

| Arquivo | Tamanho | Situação |
|---|---|---|
| `4.-ANEXO-Folder.pdf` | 33,5 MB | ❌ acima do limite |
| `Focal-Maio-2026-1.mp4` | 32,4 MB | ❌ acima do limite |
| `07.-ANEXO-FOLDER.pdf` | 9,8 MB | ✅ ok |
| Outros 261 arquivos | < 7 MB | ✅ ok |

Duas saídas, e a primeira é a que o documento já recomendava por outro motivo:

1. **Comprimir.** 33 MB para um folder em PDF é muito — dá para chegar em 5–8 MB sem
   perda visível, e o vídeo de 32 MB reencodado fica bem abaixo de 25 MiB. Resolve o
   bloqueio **e** a banda de uma vez.
2. **Mover os dois para o Cloudflare R2**, servidos pelo mesmo domínio. Armazenamento e
   egress gratuitos dentro da cota de 10 GB — o projeto inteiro usa 152 MB. Custo **R$ 0**.
   É também o caminho que o ToS da Cloudflare sanciona explicitamente para arquivos
   grandes: eles podem ser servidos desde que hospedados num serviço da própria
   Cloudflare (R2, Stream, Images).

A contagem de arquivos não é problema: 264, contra um limite de 20.000 no plano gratuito.

### 4.5 Capacidade por faixa de tráfego

A ~5 MB/pageview, quantos pageviews cada franquia comporta:

| Hospedagem | Franquia | Pageviews/mês antes do teto |
|---|---|---|
| **WP Engine (hoje)** | 75 GB | **~15.000** |
| Netlify Free | 100 GB | ~20.000 |
| Vercel Pro | 1 TB | ~210.000 |
| **Cloudflare** | — | **sem teto** |

> 📌 **A franquia de hoje é mais apertada do que parece.** O plano promete 25.000 visitas,
> mas a 5 MB/pageview os 75 GB acabam em ~15.000 — a banda estoura antes das visitas.
> E agora divide com os tours. Vale conferir se já há excedente na fatura.

O peso dos PDFs deixa isso pior. Um único arquivo pode consumir a franquia:

| Downloads do folder de 33,5 MB | Transferência | % dos 75 GB de hoje |
|---|---|---|
| 500 | 17 GB | 22% |
| 1.000 | 33 GB | **45%** |
| 2.240 | 75 GB | **100%** |

Uma campanha de mídia paga com 2.000 downloads de folder estoura a franquia sozinha.
Na Cloudflare, esse cenário simplesmente não gera conta.

### 4.6 O acoplamento que não existia antes: os tours

Agora que os tours estão na WP Engine em `focalinc.com.br/tourvirtual/`, **migrar o site
mexe neles**. Quando o DNS de `focalinc.com.br` apontar para outro provedor, essas URLs
param de responder — a menos que os tours vão junto.

| Caminho | Custo/mês | Observação |
|---|---|---|
| **Migrar site + tours para a Cloudflare** | **R$ 0** | Cancela a WP Engine. Recomendado |
| Migrar o site, manter a WP Engine só para os tours | R$ 76 | Paga hospedagem inteira por uma pasta estática |
| Migrar o site, tours num subdomínio na WP Engine | R$ 76 | Mesmo custo, e ainda muda a URL divulgada |

Só o primeiro caminho realiza a economia. Os outros dois mantêm a fatura atual e ainda
adicionam um provedor.

**Antes de migrar os tours, contar os arquivos.** Tour krpano gera milhares de *tiles*.
Se passar de 20.000 arquivos, eles vão para o R2 em vez dos assets estáticos do Workers —
o R2 não tem limite de contagem, e continua R$ 0.

### 4.7 O que quebra num export puramente estático

Vale registrar, porque a preview do GitHub Pages hoje roda assim (`STATIC_EXPORT=1`) e
já mostra as duas lacunas:

- **`/api/lead` desaparece.** Confirmado no build: a rota não é gerada no export. O
  `LeadForm` tem fallback para WhatsApp com a mensagem preenchida, então nenhum lead se
  perde — mas o envio por formulário não funciona.
- **Os 8 redirects de migração somem.** Eles só existem no modo servidor do
  `next.config.ts`. As URLs antigas do WordPress (`/parcerias`, `/empreendimentos/:slug`,
  `/portfolio/*`…) passariam a dar 404, com o custo de SEO correspondente.

Na Cloudflare via `@opennextjs/cloudflare` (que suporta Next.js 16), **as duas coisas
continuam funcionando** — a rota vira uma função e os redirects são preservados. É o
motivo de não recomendar simplesmente jogar o export estático num host qualquer.

---

## 5. Com o tráfego real: 3.000 acessos/mês

O Google Analytics dos últimos 30 dias mostra **~3.000 acessos**, dos quais ~500–600 de
tráfego pago. Isso muda a escala do problema — **não há problema de banda a resolver**:

| Cenário | Peso/pageview | Banda/mês | % dos 75 GB de hoje |
|---|---|---|---|
| Como está hoje | ~5 MB | **15 GB** | 20% |
| Depois de otimizar mídia (§7) | ~1 MB | **3 GB** | 4% |

A 3.000 acessos/mês, **qualquer** opção da tabela §4.3 comporta o site com folga enorme.
A escolha deixa de ser sobre capacidade e passa a ser sobre **preço e sobre o que a
plataforma permite fazer** — deploy por git, testes A/B, previews.

Nessa faixa de tráfego, a Cloudflare no plano gratuito não é só a mais barata: é
sobra de capacidade por R$ 0.

---

## 6. O modelo para a Vitamina assumir a hospedagem

A intenção é o cliente **cancelar a WP Engine** e a hospedagem passar a estar embutida no
contrato mensal da Vitamina. A pergunta que importa: **quanto isso custa para a agência?**

### 6.1 Custo real de hospedar a Focal na conta da Vitamina

| Item | Serviço | Custo/mês |
|---|---|---|
| Site (16 páginas + `/api/lead`) | Cloudflare Workers, plano Free | **US$ 0** |
| Tours virtuais (~157 MB) | Cloudflare R2 ou Workers assets | **US$ 0** (cota de 10 GB) |
| Vídeos | Cloudflare Stream | **~US$ 0,60** de entrega |
| **Total** | | **≈ R$ 0–3/mês** |

**Não há custo por cliente.** Uma conta Cloudflare hospeda vários sites no plano
gratuito — cada site é um Worker, e o limite é de 100 Workers por conta. Não é preciso
abrir conta separada para a Focal, nem pagar assento por projeto.

> **É por isso que a Cloudflare vence a Vercel neste caso.** Na Vercel, qualquer site
> comercial exige o plano Pro (US$ 20/mês) — o Hobby é proibido por contrato. Seriam
> R$ 102/mês saindo do bolso da agência para hospedar um site de 3.000 acessos.

### 6.2 O que muda para o cliente

Do lado da Focal, a única linha que muda na parte de infraestrutura é a **saída da
mensalidade da WP Engine** — US$ 14,95, ou ~R$ 85–90 na fatura com IOF e spread.

> As condições comerciais da migração e da mensalidade da Vitamina ficam **fora deste
> repositório**, por serem material da agência: este documento pode acabar transferido
> junto com o código se o contrato terminar (§6.3).

### 6.3 Quem fica com o quê (e como é a saída)

Para a relação ficar limpa se o cliente sair um dia:

| Ativo | Onde deve ficar | Por quê |
|---|---|---|
| **Domínio `focalinc.com.br`** | **No nome da Focal**, no Registro.br | Inegociável. É o ativo do cliente |
| Repositório do site | GitHub da Vitamina | Transferível num clique se ele sair |
| Conta Cloudflare | Vitamina | Custo zero; ele reaponta o DNS quando quiser |
| Contas de anúncio / Analytics | No nome da Focal | Mesma lógica do domínio |

Com o domínio no nome do cliente, a saída é: transferir o repositório e apontar o DNS.
Sem refém, sem discussão — e isso é um bom argumento a favor na conversa, não contra.

---

## 7. O que fazer com a mídia pesada

Três ações, e as três têm efeito duplo — resolvem limite técnico **e** melhoram
velocidade, que é o que sustenta a proposta comercial:

| Ação | Situação hoje | Depois | Ganho |
|---|---|---|---|
| **Vídeos → Cloudflare Stream** | 3 arquivos, 41 MB, um deles acima do limite de 25 MiB | 0 MB no repositório | Resolve o bloqueio, tira o branding do YouTube, melhora o LCP |
| **Comprimir PDFs** | 4 arquivos, 50,7 MB (maior: 33,5 MB) | ~10 MB no total | Resolve o segundo bloqueio de 25 MiB |
| **Converter imagens para WebP/AVIF** | 257 arquivos, 59 MB | ~10–15 MB | Home de ~4,4 MB → **menos de 1 MB** |

**Sobre o Stream:** a Vitamina já usa o produto, então os ~5 minutos de vídeo da Focal
entram na alocação existente. Entrega custa US$ 1 por 1.000 minutos — a 3.000 acessos/mês
dá **centavos**. Além do custo, troca o iframe do YouTube (pesado, com marca e vídeos
sugeridos no fim) por player limpo no domínio da Focal.

**A conversão de imagens é o maior ganho isolado.** Sair de ~5 MB para menos de 1 MB por
pageview é uma melhora de velocidade que aparece no Core Web Vitals, no Quality Score do
Google Ads e na taxa de conversão — exatamente o que justifica a migração para o cliente.

---

## 8. Ordem da migração

> 🚨 **Os tours estão na WP Engine.** Cancelar a hospedagem antes de movê-los derruba
> `focalinc.com.br/tourvirtual/...`. A ordem abaixo não é opcional.

1. **Otimizar a mídia** (§7) — vídeos para o Stream, PDFs comprimidos, imagens em WebP.
2. **Mover os tours** para R2/Workers e validar as URLs num domínio de teste.
   Antes disso, contar os arquivos: acima de 20.000, vão obrigatoriamente para o R2.
3. **Publicar o site** na Cloudflare, ainda em domínio de teste.
4. **Conferir os 8 redirects** das URLs antigas do WordPress e ligar o `/api/lead` ao
   destino real de leads (hoje é um `TODO` no código).
5. **Backup final do WordPress** — exportar conteúdo e banco antes de qualquer corte.
6. **Apontar o DNS.** ⚠️ Preservar os registros MX: se o e-mail `@focalinc.com.br`
   depender do DNS atual, trocar o apontamento sem cuidado derruba o e-mail da empresa.
7. **Monitorar 48–72h** com o WP Engine ainda ativo, como rollback.
8. **Só então cancelar a WP Engine.**

Os passos 5–8 são o momento de risco real da migração; o resto é reversível.

---

## 9. O que falta confirmar

| # | O que confirmar | Por que importa | Como levantar |
|---|---|---|---|
| 1 | **Onde está o DNS e se há MX ativo** | Risco mais alto da migração: derrubar o e-mail `@focalinc.com.br` (§8, passo 6) | Registro.br + `dig focalinc.com.br MX` |
| 2 | **Contagem de arquivos dos tours** | Acima de 20.000 vão para o R2, não para os assets do Workers | `find . -type f \| wc -l` no servidor |
| 3 | **Destino oficial dos leads** | `/api/lead` hoje é um `TODO` no código — precisa de CRM ou e-mail antes do go-live | Definir com a Focal |
| 4 | **Titularidade do domínio** | Precisa estar no nome da Focal para a saída ser limpa (§6.3) | Registro.br |
| 5 | **Duração total dos vídeos** | Dimensiona a alocação do Stream | Somar os 3 arquivos em `public/wp/` |

**Premissas e fontes:**

- **Medido no build de 12/ago:** 16 páginas, 3,1 MB de HTML+JS+CSS, 152 MB de assets em
  264 arquivos (257 imagens = 59 MB, 4 PDFs = 50,7 MB, 3 vídeos = 41,1 MB).
- **Medido:** home desktop ~4,4 MB, home mobile ~7,0 MB → média de ~5 MB/pageview.
- **Informado pelo cliente:** mensalidade de US$ 14,95 na WP Engine; ~3.000 acessos nos
  últimos 30 dias, ~500–600 de tráfego pago.
- ~157 MB por tour (confirmado); os dois somam ~314 MB, folgado em todos os cenários.
- Câmbio US$ 1 = R$ 5,09 (11/ago/2026). Não inclui IOF nem spread do cartão — na prática
  os US$ 14,95 chegam mais perto de R$ 85–90 na fatura.
- Preços de lista consultados em 11–12/ago/2026 nas páginas oficiais de
  [Cloudflare Workers](https://developers.cloudflare.com/workers/platform/pricing/),
  [R2](https://developers.cloudflare.com/r2/pricing/),
  [Stream](https://developers.cloudflare.com/stream/pricing/),
  [Vercel](https://vercel.com/docs/plans) e WP Engine.
- Limites de assets estáticos da Cloudflare (25 MiB/arquivo, 20.000 arquivos no Free)
  conferidos em [Workers Platform Limits](https://developers.cloudflare.com/workers/platform/limits/).
