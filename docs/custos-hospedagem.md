# Custos de hospedagem — tours virtuais + site Focal

**Data:** 11/ago/2026 · **Câmbio:** US$ 1 = R$ 5,09
**Contexto:** e-mail da Tassiana (Focal) sobre hospedar os tours virtuais das vistas
dos andares (Rua General Furtado do Nascimento e Rua Massacá), produzidos pela Gyro.

---

## 1. Resumo executivo

São duas perguntas independentes, com respostas bem diferentes.

| Pergunta | Resposta curta | Custo |
|---|---|---|
| **Onde hospedar os tours virtuais?** | **Cloudflare R2**, num subdomínio (`tour.focalinc.com.br`). Não cabe na WP Engine e não deve ir para a Vercel. | **~US$ 2,21/mês (R$ 11)** mesmo a 157 GB |
| **Quanto custa subir o site novo fora do WordPress?** | **Vercel Pro**, US$ 20/mês. Mais barato que a WP Engine de hoje e com ~13× mais banda. | **US$ 20/mês (R$ 102)** até ~200 mil pageviews/mês |

**Total site + tours: ~R$ 113/mês**, contra os R$ 153/mês que a WP Engine Startup já
custa hoje — e que nem comporta os tours.

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

Três consequências práticas:

**a) É 100% estático.** Não tem PHP, banco de dados nem Node. São arquivos servidos
como estão. Isso amplia muito as opções — qualquer hospedagem de arquivo estático serve,
inclusive as que custam quase nada.

**b) O `FATAL ERROR: tour.xml - loading failed!` não é defeito.** Acontece porque o
`index.html` foi aberto direto do disco (`file://`). O krpano carrega o `tour.xml` via
requisição HTTP, e o navegador bloqueia isso em arquivos locais. Servido por HTTP, funciona.
É exatamente o que o próprio erro diz e o motivo dos `tour_testingserver` existirem.

**c) O `panos/` é o problema real — não o tamanho, e sim a quantidade de arquivos.**
O krpano fatia cada panorama em milhares de *tiles* (multiresolução). Com 2 torres × 3
horários × N andares, é plausível chegar em **centenas de milhares de arquivos pequenos**.
Esse número, mais do que os GB, é o que inviabiliza algumas plataformas.

> ⚠️ **Não subir** `tour_testingserver.exe` e `tour_testingserver_macos`. São servidores
> locais só para pré-visualização. Num servidor de produção são inúteis, e um `.exe`
> exposto na web costuma ser sinalizado como risco de segurança.

---

## 3. Pergunta 1 — Onde hospedar os tours

### 3.1 WP Engine: sua intuição está certa, mas o motivo é outro

Não achei cláusula no contrato da WP Engine proibindo arquivo estático fora do WordPress —
tecnicamente dá para jogar a pasta via SFTP e servir. **O bloqueio é de cota, não de política:**

| Plano | US$/mês | Armazenamento | Banda/mês |
|---|---|---|---|
| Startup *(o atual)* | 30 | **10 GB** | 75 GB |
| Professional | 55 | 15 GB | 150 GB |
| Growth | 109 | 20 GB | 240 GB |
| Scale | 276 | **50 GB** | 550 GB |

Se o tour tiver mesmo **157 GB**, ele não cabe **em nenhum plano** — nem no Scale de
US$ 276/mês (R$ 1.405), que dá 50 GB. Só indo para o Core (US$ 400+/mês, sob consulta),
o que é absurdo para servir arquivo estático.

Se for **157 MB**, cabe folgado no Startup e não tem discussão — sobe por SFTP e pronto.

**Por isso o item 1 dos "próximos passos" é confirmar o tamanho.** É o número que decide tudo.

### 3.2 Vercel: aqui o bloqueio é técnico, não de preço

A Vercel tem limites rígidos que o tour estoura:

- **15.000 arquivos por deploy.** Um krpano com panos multires passa disso com facilidade.
- **1 GB de upload estático** no plano Pro.
- E o repositório no GitHub ficaria inviável (limite de 100 MB por arquivo).

Ou seja: **o tour não deve entrar no repositório do site.** Não é questão de custo — não
sobe. Mesmo que subisse, misturar 400 mil arquivos de tour no repo do site tornaria cada
deploy do site lento e frágil.

### 3.3 Cloudflare R2: a resposta certa

O R2 é armazenamento de objetos com **egress (banda de saída) gratuito** — é isso que muda
o jogo, porque tour virtual é pesado em transferência.

| Item | Preço | Cota grátis/mês |
|---|---|---|
| Armazenamento | US$ 0,015/GB-mês | 10 GB |
| Banda de saída | **US$ 0,00** | ilimitada |
| Operações Classe A (upload) | US$ 4,50/milhão | 1 milhão |
| Operações Classe B (leitura) | US$ 0,36/milhão | 10 milhões |

**Custo com 157 GB de tour:**

| Componente | Conta | Custo |
|---|---|---|
| Armazenamento | (157 − 10 GB grátis) × US$ 0,015 | **US$ 2,21/mês** |
| Upload inicial (~400 mil arquivos) | dentro da cota de 1M Classe A | US$ 0 (uma vez) |
| Leituras (10 mil sessões × ~400 tiles = 4M) | dentro da cota de 10M Classe B | US$ 0 |
| Banda | egress gratuito | US$ 0 |
| **Total** | | **US$ 2,21/mês ≈ R$ 11,25** |

**Se o tour for 157 MB, o custo é R$ 0** — cabe inteiro na cota grátis de 10 GB.

**Como o custo escala com a audiência:**

| Sessões/mês | Leituras (Classe B) | Custo leituras | Total/mês |
|---|---|---|---|
| 1.000 | 400 mil | grátis | US$ 2,21 (R$ 11) |
| 10.000 | 4 milhões | grátis | US$ 2,21 (R$ 11) |
| 25.000 | 10 milhões | no limite da cota | US$ 2,21 (R$ 11) |
| 100.000 | 40 milhões | US$ 10,80 | US$ 13,01 (R$ 66) |

Praticamente plano. É a vantagem de não pagar banda.

### 3.4 Por que não Bunny.net (a alternativa óbvia)

A Bunny é boa e tem POP em São Paulo, mas cobra banda:

- Armazenamento: 157 GB × US$ 0,01 = US$ 1,57/mês
- Banda América do Sul: US$ 0,045/GB → 10 mil sessões × ~20 MB = 200 GB = **US$ 9,00/mês**
- **Total: ~US$ 10,57/mês (R$ 54)** — cerca de 5× o R2

Funciona, mas o R2 é mais barato e mais previsível. Fica como plano B.

### 3.5 A comparação que resume tudo

Mesmo tour, mesmas 100 mil sessões/mês:

| Onde | Custo/mês | Observação |
|---|---|---|
| **Cloudflare R2** | **US$ 13 (R$ 66)** | egress grátis |
| Bunny.net | US$ 92 (R$ 468) | 2 TB × US$ 0,045 |
| Vercel | US$ 240 (R$ 1.222) | *se* subisse — 1 TB extra × US$ 0,22 |
| WP Engine | não comporta | teto de 50 GB de armazenamento |

---

## 4. Pergunta 2 — O site novo na Vercel

### 4.1 O que já está a favor

- O projeto usa `<img>` nativo, **não** `next/image`. Logo, **custo zero de Image
  Optimization** — que costuma ser a fatura-surpresa da Vercel.
- Os assets já vêm pré-dimensionados do WordPress (`public/wp/`, 152 MB em 264 arquivos).
- Fica bem abaixo dos limites de deploy (264 arquivos contra 15.000).

### 4.2 O plano e os preços

**Vercel Pro — US$ 20/mês por assento**, incluindo:
- 1 TB de Fast Data Transfer
- 10 milhões de Edge Requests

Excedente na região de São Paulo (gru1): **US$ 0,22/GB** e **US$ 3,20/milhão de requests**.

> ⚠️ O plano Hobby (grátis) **não serve**: é restrito a uso pessoal/não-comercial.
> Site de cliente exige Pro. Não dá para economizar aqui.

### 4.3 Projeção por faixa de tráfego

Estimando ~5 MB por pageview (as imagens são grandes e o mobile carrega um vídeo de 2,6 MB):

| Pageviews/mês | Transferência | % do 1 TB incluído | Extra | **Total/mês** |
|---|---|---|---|---|
| 10.000 | 50 GB | 5% | US$ 0 | **US$ 20 (R$ 102)** |
| 25.000 | 125 GB | 12% | US$ 0 | **US$ 20 (R$ 102)** |
| 50.000 | 250 GB | 25% | US$ 0 | **US$ 20 (R$ 102)** |
| 100.000 | 500 GB | 50% | US$ 0 | **US$ 20 (R$ 102)** |
| 200.000 | 1 TB | 100% | ~US$ 0 | **US$ 20 (R$ 102)** |
| 400.000 | 2 TB | 200% | US$ 220 | US$ 240 (R$ 1.222) |

**Leitura:** até ~200 mil pageviews/mês o custo é fixo em US$ 20. Como vocês rodam tráfego
pago, o número real precisa ser confirmado — mas seria preciso um volume muito alto para
sair dessa faixa.

### 4.4 O ponto de atenção: os PDFs

O folder do Artur 73 tem **33,5 MB** e há um vídeo de **32,4 MB**. São os dois maiores
arquivos do projeto e o principal risco de estourar o 1 TB:

| Downloads do folder | Transferência |
|---|---|
| 1.000 | 33 GB |
| 5.000 | 167 GB |
| 30.000 | 1 TB (sozinho consome a franquia) |

**Recomendação:** comprimir os PDFs. 33 MB para um folder é muito — dá para chegar em
5–8 MB sem perda visível. Alternativa: servir os PDFs e vídeos pesados também do R2, que
não cobra banda.

### 4.5 Vercel Pro × WP Engine para o site

| | WP Engine Startup | Vercel Pro |
|---|---|---|
| Preço | US$ 30/mês (R$ 153) | **US$ 20/mês (R$ 102)** |
| Visitas/mês | 25.000 | ilimitadas |
| Banda/mês | 75 GB | **1 TB** (13×) |
| Deploy | SFTP / plugin | Git push |

Sair da WP Engine para a Vercel **economiza R$ 51/mês e multiplica a banda por 13**.

---

## 5. Recomendação

1. **Tours → Cloudflare R2**, publicados em `tour.focalinc.com.br/general` e
   `tour.focalinc.com.br/massaca` (ou via rota `/tourvirtual/...` no site, como a Gyro
   sugeriu). **~R$ 11/mês.**
2. **Site → Vercel Pro**, substituindo a WP Engine. **R$ 102/mês.**
3. **Não** colocar o tour dentro do repositório do site — ele não sobe, e mesmo que
   subisse tornaria todo deploy do site lento e frágil.
4. Comprimir os PDFs pesados antes de migrar.

**Total: ~R$ 113/mês** para site + tours, contra R$ 153/mês da WP Engine hoje.

### Detalhes de implantação do tour no R2

- Subir com `rclone` ou `aws s3 sync` (lida bem com centenas de milhares de arquivos).
- Garantir os *Content-Type* corretos: `.xml` → `text/xml`, `.js` → `application/javascript`.
  Se o `tour.xml` for servido como `application/octet-stream`, o krpano quebra.
- Remover `tour_testingserver.exe` e `tour_testingserver_macos` antes do upload.
- Ligar domínio customizado no bucket (o egress grátis vale também pelo domínio próprio).

---

## 6. Premissas e o que falta confirmar

Os números acima dependem de duas informações que ainda não temos:

| # | O que confirmar | Por que importa | Como levantar |
|---|---|---|---|
| 1 | **Tamanho real e contagem de arquivos do tour** — os "157" são GB ou MB? | Decide se a WP Engine é opção (157 MB: sim / 157 GB: não) | Descompactar e rodar `du -sh .` e `find . -type f \| wc -l` |
| 2 | **Tráfego atual do focalinc.com.br** (pageviews/mês) | Define em que linha da tabela 4.3 o site cai | Google Analytics ou painel da WP Engine |

**Demais premissas usadas:**

- ~5 MB por pageview do site (estimativa a partir do peso real dos assets em `public/wp/`).
- ~20 MB e ~400 *tiles* por sessão de tour. Como o R2 não cobra banda, essa premissa
  **não afeta o custo do R2** — ela só pesa na comparação com Vercel e Bunny.
- Câmbio US$ 1 = R$ 5,09 (11/ago/2026). Não inclui IOF nem impostos sobre o cartão.
- Preços de lista consultados em 11/ago/2026 nas páginas oficiais de Vercel, Cloudflare,
  WP Engine e Bunny.net.
