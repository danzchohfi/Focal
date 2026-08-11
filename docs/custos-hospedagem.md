# Custos de hospedagem — tours virtuais + site Focal

**Data:** 11/ago/2026 · **Câmbio:** US$ 1 = R$ 5,09
**Contexto:** e-mail da Tassiana (Focal) sobre hospedar os tours virtuais das vistas
dos andares (Rua General Furtado do Nascimento e Rua Massacá), produzidos pela Gyro.

---

## 1. Resumo executivo

| Pergunta | Resposta | Custo adicional |
|---|---|---|
| **Onde hospedar os tours virtuais?** | Dentro do próprio repositório do site, publicados junto com ele. | **R$ 0** |
| **Quanto custa subir o site novo fora do WordPress?** | Vercel Pro, US$ 20/mês — mais barato que a WP Engine de hoje. | **Economia de R$ 51/mês** |

**Com o tamanho confirmado em ~157 MB, hospedar os tours deixou de ser uma decisão de
infraestrutura.** Cabe em qualquer cenário — inclusive na WP Engine atual — e não gera
custo em nenhum deles. A única decisão real que sobra é a migração do site.

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

## 3. Pergunta 1 — Onde hospedar os tours

A ~157 MB, **todas as opções são viáveis e todas custam R$ 0**. A escolha passa a ser
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

## 4. Pergunta 2 — O site novo na Vercel

### 4.1 O que já está a favor

- O projeto usa `<img>` nativo, **não** `next/image`. Logo, **custo zero de Image
  Optimization** — que costuma ser a fatura-surpresa da Vercel.
- Assets já pré-dimensionados do WordPress (`public/wp/`, 152 MB em 264 arquivos).
- Bem abaixo dos limites de deploy, com ou sem os tours.

### 4.2 O plano

**Vercel Pro — US$ 20/mês por assento**, incluindo:
- 1 TB de Fast Data Transfer
- 10 milhões de Edge Requests

Excedente na região de São Paulo (gru1): **US$ 0,22/GB** e **US$ 3,20/milhão de requests**.

> ⚠️ O plano Hobby (grátis) **não serve**: é restrito a uso pessoal/não-comercial.
> Site de cliente exige Pro.

### 4.3 Projeção por faixa de tráfego

Estimando ~5 MB por pageview do site e ~15 MB por sessão de tour:

| Pageviews/mês | Site | + 2.000 sessões de tour | Total | % do 1 TB | **Custo/mês** |
|---|---|---|---|---|---|
| 10.000 | 50 GB | 30 GB | 80 GB | 8% | **US$ 20 (R$ 102)** |
| 25.000 | 125 GB | 30 GB | 155 GB | 15% | **US$ 20 (R$ 102)** |
| 50.000 | 250 GB | 30 GB | 280 GB | 28% | **US$ 20 (R$ 102)** |
| 100.000 | 500 GB | 30 GB | 530 GB | 53% | **US$ 20 (R$ 102)** |
| 190.000 | 950 GB | 30 GB | ~1 TB | 100% | **US$ 20 (R$ 102)** |

**Os tours cabem inteiros na folga do plano.** Até ~190 mil pageviews/mês o custo é fixo
em US$ 20 — site e tours juntos.

### 4.4 O ponto de atenção: os PDFs

O folder do Artur 73 tem **33,5 MB** e há um vídeo de **32,4 MB**. São os maiores arquivos
do projeto e o principal risco de consumir a franquia:

| Downloads do folder | Transferência |
|---|---|
| 1.000 | 33 GB |
| 5.000 | 167 GB |
| 30.000 | 1 TB (sozinho consome a franquia) |

**Recomendação:** comprimir os PDFs. 33 MB para um folder é muito — dá para chegar em
5–8 MB sem perda visível. É a otimização de maior impacto do projeto, e vale mais do que
qualquer escolha de hospedagem discutida aqui.

### 4.5 Vercel Pro × WP Engine

| | WP Engine Startup | Vercel Pro |
|---|---|---|
| Preço | US$ 30/mês (R$ 153) | **US$ 20/mês (R$ 102)** |
| Visitas/mês | 25.000 | ilimitadas |
| Banda/mês | 75 GB | **1 TB** (13×) |
| Deploy | SFTP / plugin | Git push |

Migrar **economiza R$ 51/mês e multiplica a banda por 13**. Para quem roda tráfego pago,
a folga vale mais que a economia.

---

## 5. Recomendação

1. **Tours → dentro do repositório**, em `public/tourvirtual/{general,massaca}/`,
   publicados junto com o site. Custo adicional **R$ 0**.
   Se a contagem de arquivos passar de 15.000, mover para Cloudflare R2 (também R$ 0).
2. **Site → Vercel Pro**, substituindo a WP Engine. **R$ 102/mês** contra R$ 153/mês.
3. **Comprimir os PDFs pesados** — maior ganho isolado de banda do projeto.
4. Remover `tour_testingserver.exe` e `tour_testingserver_macos` antes de publicar.

**Resultado: os tours saem de graça, e o site fica R$ 51/mês mais barato do que hoje.**

### Se optar por manter o WordPress na WP Engine

Também funciona — sobe por SFTP conforme o tutorial da Gyro, cria
`/tourvirtual/general/` e descompacta. Os 157 MB cabem nos 10 GB. Só vale monitorar a
banda de 75 GB, que passa a ser dividida entre site e tours (§3.3).

---

## 6. O que falta confirmar

| # | O que confirmar | Por que importa | Como levantar |
|---|---|---|---|
| 1 | **Contagem de arquivos do tour descompactado** | Decide entre §3.1 (repositório) e §3.2 (R2). Limite: 15.000 | `find . -type f \| wc -l` |
| 2 | **Tráfego atual do focalinc.com.br** | Define em que linha da tabela 4.3 o site cai | Google Analytics ou painel da WP Engine |
| 3 | **Banda consumida hoje na WP Engine** | Verificar se já há excedente (§3.3) | Painel da WP Engine |

**Premissas usadas:**

- ~157 MB por tour (confirmado). Se os dois tours somarem ~314 MB, nada muda — segue
  folgado em todos os cenários.
- ~5 MB por pageview do site (estimativa a partir do peso real dos assets em `public/wp/`).
- ~15 MB e ~400 *tiles* por sessão de tour.
- Câmbio US$ 1 = R$ 5,09 (11/ago/2026). Não inclui IOF nem impostos sobre o cartão.
- Preços de lista consultados em 11/ago/2026 nas páginas oficiais de Vercel, Cloudflare
  e WP Engine.
