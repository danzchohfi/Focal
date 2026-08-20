# Atribuição e ROAS — do clique à escritura

Manual do pipeline que responde a pergunta que hoje não tem resposta: **quando
um apartamento é vendido, de qual anúncio ele veio, e quanto aquele anúncio
custou.**

---

## 1. Por que o ROAS não existe hoje

O funil atual é `anúncio → site → WhatsApp → Laís → CVCRM → venda`. A origem
morre em quatro pontos, cada um por um motivo diferente:

| Onde | O que acontece | Consequência |
|---|---|---|
| **Site → WhatsApp** | `wa.me` não transporta UTM nem `gclid`. O único dado que atravessa é o texto pré-preenchido da primeira mensagem. | O clique pago some. Em abril, **216 cliques em WhatsApp viraram 36 leads** — e nenhum dos 36 sabia de qual campanha veio. |
| **Laís → CVCRM** | A Laís só grava no CRM o lead que ela **qualificou**. | Os não qualificados não existem no CRM: sem denominador, não há taxa de qualificação por campanha. |
| **CVCRM** | `origem` é lista fechada de 2 caracteres e imutável. Não há campo nativo para `gclid`/`fbclid`/UTM. | A granularidade de campanha/grupo/anúncio não cabe — a menos que se criem campos adicionais. |
| **Google e Meta** | Janela de atribuição muito menor que o ciclo de venda: 90 dias (Google, por `gclid`) e **7 dias** (Meta, clique → conversão). | Uma venda que fecha 120 dias depois do clique **nunca** vai aparecer atribuída no Ads Manager. Nenhuma configuração muda isso. |

A conclusão que orienta todo o resto: **o ROAS de verdade tem que ser calculado
fora das plataformas**, num banco próprio. As plataformas recebem eventos de
meio de funil para otimizar a entrega; o número que vai para o cliente sai
daqui.

---

## 2. Como o pipeline resolve

### 2.1 O código de atribuição

O site gera, na primeira visita, um código curto — `FCL-3K9M2A7B`. Ele é a
única peça que atravessa o buraco do WhatsApp:

```
Olá! Vi o Artur 73 no site e quero as plantas.

(cód. FCL-3K9M2A7B)
```

Formato (`src/lib/atribuicao/ref.ts`): base32 Crockford, sem `I`, `L`, `O` e
`U`, para não confundir quem dita por telefone. Cinco caracteres de minuto
desde 2024 + três aleatórios — colisão exigiria ~200 códigos no mesmo minuto
para 50% de chance, e a data de origem é recuperável do próprio código
(`dataDoRef`). A leitura tolera erro de transcrição: `fcl 3k9m2a70`, `3K9M2A7O`
e `FCL-3K9M2A7B` resolvem para o mesmo código.

O código **não é a única camada**. São três, empilhadas:

1. **`ctwa_clid`** — determinístico, quando a origem é um anúncio
   clique-para-WhatsApp da Meta. Depende da Laís repassar (ver §6).
2. **Redirecionador `/ir/whatsapp`** — o clique passa pelo nosso servidor, que
   grava o toque **antes** de redirecionar. Imune a `sendBeacon` descartado e
   ao ITP do Safari.
3. **Código no texto** — é o único que sobrevive quando a pessoa salva o número
   e volta a conversar dias depois.

E, quando nenhuma sobrevive, ainda há o casamento por telefone normalizado
(§7). O que não casa por nada disso **aparece no relatório como não
conciliado** — atribuição que esconde o próprio buraco vira ficção.

### 2.2 Camadas

```
navegador ──► /api/atribuicao ──┐
   captura click ids + UTM      │
   cookie fcl_ref (180 d)       ├─► warehouse (Postgres/Supabase)
                                │      toques · leads · eventos · custos
/ir/whatsapp ───────────────────┤
   registra e redireciona       │
                                │
/api/lead ──────────────────────┤──► CVCRM (campos adicionais: gclid, ref…)
   grava lead + espelha no CRM  │
                                │
/api/webhooks/cvcrm ────────────┤◄── CVCRM (webhook LD/RS: só o id, enriquece)
                                │
scripts/roas.ts sync ───────────┘◄── Google Ads (custo) · Meta Insights (custo)
                                 ──► Data Manager API · Conversions API
                                       (conversões de meio de funil)
                                 ──► /relatorios/roas · CSV · Looker Studio
```

### 2.3 Por que o cookie tem só o código

O objeto de atribuição completo passa de 1 KB e o cookie viaja em **toda**
requisição do domínio. Então o cookie carrega apenas `fcl_ref` (12 bytes),
reemitido pelo servidor a cada navegação (`src/proxy.ts`) com validade
deslizante de 180 dias. O payload fica no `localStorage` e, do lado do
servidor, na tabela de toques indexada pelo código.

A reemissão pelo servidor não é preciosismo. No Safari, o ITP **apaga todo
cookie escrito por JavaScript** (e o resto do storage gravável por script)
após 7 dias **sem interação** com o site; e a validade cai para 24 h quando a
navegação veio de um domínio classificado como rastreador com querystring — o
caso de um link de anúncio. Num ciclo de 180 dias, quem some por dois meses
perde a origem. O `Set-Cookie` first-party não é apagado por essa purga,
sobrevive a JS bloqueado e não cai para 24 h em link decorado.

O `proxy.ts` **não roda no build estático** do GitHub Pages — e as rotas
`.server.ts` também não são geradas lá. Ou seja, no Pages não existe nem o
cookie de 180 dias, nem `/api/lead`, nem `/api/atribuicao`, nem
`/ir/whatsapp`, nem o webhook do CVCRM. **A produção precisa estar em Vercel ou
Node.**

---

## 3. Tagueamento das campanhas

Sem isto, nada do resto funciona: os IDs precisam chegar na URL. Guarde **ID,
não nome** — nome de campanha é editado o tempo todo e quebra o histórico; os
nomes entram no relatório vindos da sincronização diária de custo.

### Google Ads — modelo de acompanhamento da conta

Em **Configurações da conta → Acompanhamento → Modelo de acompanhamento**:

```
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&ag={adgroupid}&utm_content={creative}&utm_term={keyword}&mt={matchtype}&net={network}&dev={device}&tgt={targetid}
```

Confirme também que o **tagueamento automático (auto-tagging) está ligado** —
sem ele não existe `gclid`.

### Meta — parâmetros de URL do anúncio

No campo **Parâmetros de URL** de cada anúncio (ou no nível da conta):

```
utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.id}}&ag={{adset.id}}&utm_content={{ad.id}}&utm_term={{placement}}&plc={{site_source_name}}
```

### Anúncios que vão direto para o WhatsApp

Aponte a URL final para o redirecionador em vez do `wa.me`. Assim o clique pago
é capturado mesmo sem visita ao site — exatamente o caso onde a atribuição some
hoje:

```
https://focalinc.com.br/ir/whatsapp?c=artur-73&p=anuncio&t=Ol%C3%A1%21%20Vi%20o%20Artur%2073&utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&ag={adgroupid}&utm_content={creative}
```

Parâmetros da rota: `n` número (só números da Focal são aceitos), `t` texto,
`p` posição, `c` contexto/empreendimento. Todo o resto da querystring é lido
como origem.

---

## 4. Configuração no CVCRM

Documentação oficial e pública: <https://desenvolvedor.cvcrm.com.br>.

### 4.1 Usuário de integração

Painel → **Configurações → Usuários Administrativos** → criar um usuário
dedicado à integração → opção **Token**. Autenticação é por dois headers,
`email` e `token`. O perfil precisa das permissões **"Cadastrar Novo Lead"**,
**"Administrar lead"** e **"Administrar reservas"** — sem elas a API devolve
403.

Limites publicados: 200 req/min nas APIs REST e 20 req/min no CVDW.

### 4.2 Campos adicionais (obrigatório)

Não há API para criar campos adicionais — alguém com acesso de gestor precisa
criá-los em **Configurações → Campos adicionais**, tipo **Texto**,
funcionalidade **Lead e Reserva**. O "Nome de referência" é o slug que a API
usa e precisa bater exatamente:

| Nome de referência | Guarda |
|---|---|
| `lead_ref` | o código de atribuição — **este é o mais importante** |
| `gclid`, `gbraid`, `wbraid` | click ids do Google |
| `fbclid` | click id da Meta |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | campanha |
| `grupo_anuncio` | ID do grupo de anúncios / conjunto |
| `origem_midia` | resumo legível da origem |
| `landing_page` | página de entrada |

Se os slugs saírem com outro nome, ajuste por env (`CVCRM_CAMPO_REF=...`) em
vez de mexer no código.

### 4.3 Webhooks

**Configurações → Integrações** → novo webhook:

| Funcionalidade | Gatilho | URL |
|---|---|---|
| Leads (LD) | Alteração para situações definidas | `https://focalinc.com.br/api/webhooks/cvcrm?k=SEGREDO` |
| Reservas (RS) | Alteração para situações definidas · Contrato gerado | a mesma |

O payload do CV é mínimo (`{"idlead": 1}`), então a rota sempre reconsulta o
registro pela API autenticada. **Não há assinatura HMAC** — a proteção é o
segredo na URL, que precisa ter alta entropia.

### 4.4 CVDW (recomendado, contratado à parte)

O CVDW (`/api/v1/cvdw/...`) é o data warehouse do CV. O endpoint `/vendas`
devolve, na mesma linha, `valor_contrato`, `data_venda`, `midia`, `campanha` e
`idlead` — e aceita carga incremental por **data de alteração**
(`a_partir_data_referencia`), que é o que faz uma venda de dezembro reaparecer
carregando o lead de março.

Sem CVDW o pipeline funciona pelos endpoints transacionais, mas o
`GET /comercial/leads` **não tem filtro por data de atualização** e a
sincronização fica muito mais cara. Vale pedir ao CS do CV.

Ligue com `CVCRM_CVDW=1`.

### 4.5 Situações do funil

Os workflows são customizados por incorporadora. Rode uma vez:

```
GET /api/v1/configuracoes/workflows/leads
GET /api/v1/configuracoes/workflows/reservas
```

e combine com o time comercial quais `idsituacao` contam como **qualificado** e
como **venda**. Preencha `CVCRM_SITUACOES_QUALIFICADO` e
`CVCRM_SITUACOES_VENDA`. Sem isso, o custo por lead qualificado mede a coisa
errada.

### 4.6 Cuidado com dupla contagem

O próprio CV alerta: se os leads da Meta já chegam por uma plataforma
intermediária (a Laís), **não ligue também a integração nativa Facebook →
CVCRM** — o lead entra duas vezes e gera duas conversões. Audite isso antes de
calcular qualquer CPL.

---

## 5. Configuração no Google

### 5.1 Conversões offline: Data Manager API

Desde **15/06/2026** o método antigo (`UploadClickConversions`) só funciona
para developer tokens que já vinham enviando uploads antes dessa data; uma
conta nova recebe `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE`. O caminho atual
é a **Data Manager API** (`POST datamanager.googleapis.com/v1/events:ingest`),
que **não exige developer token** — só um projeto Google Cloud e OAuth com o
escopo `https://www.googleapis.com/auth/datamanager`.

Crie **quatro conversion actions** do tipo *Site (importar de cliques)*, uma
por etapa, e anote os IDs numéricos:

| Conversion action | Papel | Primária? |
|---|---|---|
| Lead Qualificado Laís | otimização | sim |
| Visita Agendada | otimização | sim |
| Proposta Enviada | observação | não |
| Venda Assinada | observação | não |

Marque as **etapas intermediárias como primárias**: são elas que cabem na
janela e têm volume para o Smart Bidding aprender. Venda de R$ 2 mi tem volume
mensal baixíssimo e não sustenta tCPA/tROAS sozinha.

Aceite obrigatório na conta (é decisão jurídica, feita por alguém com
autoridade): **Termos de dados do cliente** + **Enhanced conversions for
leads**. Verifique com:

```sql
SELECT customer.id,
       customer.conversion_tracking_setting.accepted_customer_data_terms,
       customer.conversion_tracking_setting.enhanced_conversions_for_leads_enabled
FROM customer
```

### 5.2 Leitura de custo

Usa a Google Ads API (v25) com `developer-token` e, quando o acesso é via MCC,
o header `login-customer-id`. Três consultas, porque a estrutura não é
uniforme: `ad_group_ad` (Search/Display/Demand Gen), `asset_group`
(Performance Max — **PMax não tem grupo de anúncios, e consultar `ad_group`
devolve zero linhas em silêncio**) e `campaign` como rede de segurança.

### 5.3 Snapshot diário de cliques

O vínculo `gclid → anúncio` (`click_view`) só existe por ~90 dias. Como a venda
chega bem depois, rode todo dia:

```bash
tsx scripts/roas.ts cliques --dia 2026-08-19
```

Sem isso, o `gclid` gravado no CRM vira um identificador órfão.

---

## 6. Configuração na Meta

### 6.1 Conversions API

`POST https://graph.facebook.com/v26.0/{DATASET_ID}/events`. O token sai do
**Events Manager → Dataset → Configurações → Conversions API → Gerar token** e
**não exige App Review**. A leitura de custo (Insights) exige `ads_read` num
system user do Business Manager.

Regras que derrubam o match em silêncio quando ignoradas — e as duas
plataformas divergem nas **duas** pontas, por isso o pipeline guarda quatro
hashes e não dois:

- **telefone:** Meta quer só dígitos, **sem `+`**; Google quer E.164 **com
  `+`**;
- **e-mail:** Meta quer só trim + minúsculas; Google exige, **apenas para
  `gmail.com` e `googlemail.com`**, remover os pontos e o sufixo `+tag` do
  usuário antes do hash — e preservá-los em qualquer outro domínio;
- `fbc`, `fbp` e `ctwa_clid` **não são hasheados**;
- `_fbc` tem o formato `fb.{índice}.{ms}.{fbclid}`, com o índice contando os
  rótulos abaixo do sufixo público (`focalinc.com.br` = 1);
- `event_time` é em **segundos**, enquanto o timestamp dentro do `_fbc` é em
  **milissegundos**.

### 6.2 A conversa honesta sobre a janela

A Meta decide a atribuição pelo **intervalo entre o clique e o `event_time`** —
não pelo momento do upload. A janela de **otimização** é de 7 dias de clique
(as janelas de visualização de 7 e 28 dias foram removidas em 12/01/2026 e hoje
retornam vazio, sem erro). Para **relatório**, o clique de 28 dias continua
disponível na Insights API (`action_attribution_windows=28d_click`) — é a
janela mais longa que a Meta ainda mostra, e vale usá-la.

Sobre o prazo de **envio**, a doc é ambígua: diz que qualquer `event_time` com
mais de 7 dias faz a Meta devolver erro para a **requisição inteira**, e no
mesmo parágrafo que eventos de loja física "devem ser enviados em até 62 dias".
Como a segunda frase não dispensa a primeira, o padrão aqui é conservador — 7
dias — e o pipeline separa os lotes por idade, para que uma rejeição do
histórico não leve junto os eventos recentes. Com o toggle *Allow Historical
Conversion Uploads* confirmado no Events Manager, ligue
`META_JANELA_HISTORICA=1` e a janela sobe para 90 dias.

Nada disso chega aos 120+ dias do ciclo. **Alinhe com o cliente na largada:** o
Gerenciador da Meta nunca vai mostrar o ROAS de venda; o relatório deste
repositório vai.

> Existe um caminho oficial alternativo para eventos de CRM
> (`action_source: system_generated` + `user_data.lead_id` +
> `custom_data.event_source: "crm"`), mas ele exige o `lead_id` de um formulário
> instantâneo da Meta. Como os leads da Focal nascem no site e não em Lead Ads,
> o pipeline usa `physical_store` para a venda assinada. Se um dia houver
> campanha de formulário instantâneo, esse é o caminho a adotar para ela.

### 6.3 Clique-para-WhatsApp

O `ctwa_clid` é a única atribuição determinística de CTWA e chega **apenas na
primeira mensagem** da conversa, dentro do objeto `referral` do webhook da
WhatsApp Cloud API. Se não for persistido ali, está perdido para sempre. O
número de atendimento é a WABA da Laís — então isso depende dela (§7).

---

## 7. O que perguntar à Laís (lais.ai / Lastro)

A Laís não tem documentação pública de API; ela é entregue pelo Gerente de
Contas. Estas são as perguntas que decidem quanto do pipeline funciona — vale
mandar como lista:

1. A Laís captura o objeto `referral` / `ctwa_clid` das mensagens vindas de
   anúncios clique-para-WhatsApp? Se captura, **expõe** esses campos no payload
   que envia ao CVCRM, ou eles ficam presos dentro do produto? Pedir um exemplo
   real e completo do payload de saída.
2. O toggle **"Ads Attribution"** está habilitado na WABA usada no atendimento
   da Focal? Sem ele a Meta não envia o `referral`.
3. Qual BSP/provedor de WhatsApp roda por baixo? Muitos middlewares descartam o
   `referral` antes de entregar.
4. No endpoint de **entrada**, a Laís aceita campos custom no payload do
   formulário do site (`lead_ref`, `gclid`, `fbclid`, UTMs) e os **propaga** até
   o CRM sem perda? É a única via possível para Google Ads, que não é
   integração nativa dela.
5. No endpoint de **saída** para o CVCRM, quais campos ela consegue popular?
   Especificamente `midia`, `conversao`, `tags[]` e **`campos_adicionais`**.
   Sem acesso a `campos_adicionais` não há onde guardar o código no CRM.
6. Ela preserva e expõe o **corpo da primeira mensagem**? Consegue extrair um
   código no padrão `FCL-XXXXXXXX` e gravá-lo em campo estruturado?
7. Existe **webhook de saída** para um endpoint nosso (não o CRM), com os
   eventos de conversa — lead recebido, qualificado, visita agendada, lead
   frio? Isso resolveria o denominador dos não qualificados.
8. Qual a lista fechada de status/tags que ela emite?
9. Leads **não qualificados** são enviados ao CVCRM (opcionalmente) ou
   descartados?
10. Existe alguma integração Meta → CVCRM ligada **em paralelo** à Laís na
    conta da Focal? (risco de dupla contagem, §4.6)

Enquanto isso não é respondido, o pipeline funciona com o que controlamos: o
código no texto do WhatsApp, o redirecionador e o casamento por telefone.

---

## 8. Instalação

```bash
pnpm install
cp .env.example .env.local        # preencher
```

1. **Banco:** criar um projeto no Supabase e rodar `docs/sql/warehouse.sql` no
   SQL Editor. Preencher `SUPABASE_URL` e `SUPABASE_SERVICE_KEY`.
2. **Ver o formato antes de ter credencial:**
   ```bash
   ATRIBUICAO_ARQUIVO=./.dados tsx scripts/roas.ts demo
   ```
3. **Sincronizar** (cron diário):
   ```bash
   pnpm roas:sync                 # custo + CRM + devolução de conversões
   tsx scripts/roas.ts cliques    # snapshot gclid → anúncio (obrigatório diário)
   ```
4. **Relatório:**
   ```bash
   pnpm roas:relatorio -- --de 2026-03-01 --ate 2026-03-31 --dimensao anuncio
   pnpm roas:relatorio -- --formato csv > roas.csv
   ```
   ou no navegador: `/relatorios/roas?k=RELATORIO_TOKEN`.

Homologação antes de escrever em produção: `pnpm roas:sync -- --homologacao`
usa `validateOnly` no Google e `test_event_code` na Meta.

### Agendamento

`vercel.json` (ou GitHub Actions equivalente):

```json
{
  "crons": [
    { "path": "/api/cron/roas", "schedule": "0 6 * * *" }
  ]
}
```

Enquanto a rota de cron não existir, rode `pnpm roas:sync` por GitHub Actions
com os mesmos segredos.

---

## 9. As métricas

| Métrica | Fórmula | Cuidado |
|---|---|---|
| CPL | investimento ÷ leads | |
| **CPL qualificado** | investimento ÷ leads qualificados | a métrica que o cliente pediu |
| CAC | investimento ÷ vendas | |
| Ticket médio | VGV ÷ vendas | |
| **ROAS (VGV)** | VGV atribuído ÷ investimento | número de board; **infla**, porque VGV é o preço do imóvel, não a receita de quem paga a mídia |
| **ROAS (receita)** | (VGV × `fracaoReceita`) ÷ investimento | use a margem real (≈15–20% do VGV) ou a comissão (3–6%) |
| Ciclo | mediana de dias entre o clique e a venda | |

Duas decisões do motor que mudam o número:

**Coorte por data do clique (padrão).** Comparar "vendas fechadas em agosto"
com "investimento de agosto" mistura safras e produz um ROAS que sobe e desce
sem relação com a mídia. Na base `clique`, o investimento de agosto é comparado
com o que **ele** gerou, mesmo que a venda saia em dezembro. O preço é que os
meses recentes aparecem subestimados de propósito — a safra ainda não
amadureceu. A base `evento` continua disponível para acompanhamento comercial.

**Funil cumulativo.** Uma venda conta também como qualificado e como visita,
mesmo que o CRM não tenha registrado a etapa intermediária.

E ainda: **distrato zera o VGV** da venda desfeita e mantém o investimento; e
**só clique pago recebe crédito** — lead orgânico aparece na cobertura, não no
ROAS de nenhuma campanha.

---

## 10. Limites honestos

Coisas que este pipeline **não** faz, e que precisam estar ditas antes da
primeira reunião de resultado:

- **A venda não vai aparecer no Ads Manager.** Janela de 7 dias na Meta e 90
  dias no Google, contra um ciclo de 30 a 180+ dias. O relatório deste
  repositório é a fonte da verdade; as plataformas recebem os eventos de meio
  de funil para otimizar.
- **Quem apaga o código antes de enviar a mensagem** cai no casamento por
  telefone. Funciona bem no Brasil (o WhatsApp é o telefone), mas é o segundo
  nível de confiança, e o relatório mostra a diferença.
- **Quem digita o número na mão ou vem de indicação** não tem origem. Aparece
  como "sem vínculo" na cobertura.
- **Multi-dispositivo** (clica no celular, converte no desktop) só é
  reconciliado se o contato coincidir.
- **Enhanced conversions só por PII** casam 40–50% dos casos — por isso vale o
  esforço de persistir o `gclid`.
- **Celular antigo de São Paulo com prefixo 5.** O casamento por telefone gera
  a variante sem o 9º dígito para números que começam em 6–9 (a faixa móvel do
  plano de numeração). Celulares legados da Grande São Paulo cujo número local
  começa com 5 ficam de fora: gerar a variante para eles criaria colisão com
  telefone fixo, que também começa com 5. É uma perda pequena e deliberada.
- **Cobertura realista esperada** nos primeiros 90 dias: alta para formulário
  (o payload vai completo), média para WhatsApp saindo do site (depende do
  texto sobreviver e da Laís gravar), baixa para clique-para-WhatsApp enquanto
  o `ctwa_clid` não estiver confirmado com a Laís.

---

## 11. LGPD

- Hash SHA-256 é **pseudonimização**, não anonimização: dado hasheado continua
  dado pessoal.
- Enviar e-mail/telefone hasheados para Google e Meta é compartilhamento com
  controlador independente **e** transferência internacional (arts. 33–36 da
  LGPD).
- Base legal recomendada para publicidade: **consentimento**, com bloqueio
  prévio e Consent Mode v2 (`ad_user_data` é o que libera o envio). Registre o
  consentimento com data/hora, texto exibido e versão da política — o ônus da
  prova é do controlador (art. 8º, §2º).
- PII fica isolada em `atr_leads`, com a função `atr_purga_pii()` para a
  retenção declarada na política.
- Nunca use CPF como `external_id`; use o ID do lead no CVCRM.
- A política de privacidade precisa mencionar a finalidade de mensuração
  publicitária e o compartilhamento com Google e Meta.

---

## 12. Ondas de implantação

**Onda 1 — só depende do site (já implementada).**
Captura de click ids e UTMs, código de atribuição, cookie de 180 dias reemitido
pelo servidor, código no WhatsApp, redirecionador `/ir/whatsapp`, `/api/lead`
gravando o warehouse, relatório e CLI. Valor: passa a existir a base de toques
e a ligação código ↔ campanha. **Pré-requisito: sair do GitHub Pages.**

**Onda 2 — depende do CVCRM e da Laís.**
Campos adicionais criados, token de integração, webhooks, sincronização do
funil e das vendas. Valor: CPL qualificado e ROAS de verdade.

**Onda 3 — depende de Google e Meta.**
Credenciais de API, conversion actions, custo diário, devolução das conversões
de meio de funil. Valor: o relatório fecha sozinho e as campanhas passam a
otimizar por valor esperado em vez de por lead bruto.

---

## 13. O que pedir a cada fornecedor

**Ao cliente (Focal Inc):**
> Precisamos de: (1) acesso administrativo à conta Google Ads ou vínculo ao
> nosso MCC; (2) aceite dos Termos de Dados do Cliente e ativação de enhanced
> conversions for leads na conta Google Ads; (3) confirmação de que o
> tagueamento automático está ligado; (4) acesso ao Business Manager da Meta
> com permissão de anúncios e ao Dataset do pixel; (5) um usuário
> administrativo dedicado no CVCRM com token e as permissões "Cadastrar Novo
> Lead", "Administrar lead" e "Administrar reservas"; (6) confirmação de se o
> módulo CVDW está contratado; (7) criação dos campos adicionais listados na
> seção 4.2, com o nome de referência exato; (8) validação jurídica do
> compartilhamento de dados hasheados com Google e Meta.

**À Laís:** as dez perguntas da seção 7.

**Ao CS do CVCRM:** liberação do CVDW, tabela de IDs de gatilho dos webhooks e
confirmação de se um campo adicional preenchido no lead é copiado para a
reserva.

---

## 14. Mapa do código

| Caminho | O que faz |
|---|---|
| `src/lib/atribuicao/ref.ts` | o código curto — geração, normalização, extração |
| `src/lib/atribuicao/toque.ts` | leitura da URL, classificação de canal, `_fbc`, consolidação |
| `src/lib/atribuicao/captura.ts` | captura no navegador, cookie e `localStorage` |
| `src/lib/atribuicao/identidade.ts` | normalização e hash de telefone/e-mail (formatos de cada plataforma) |
| `src/lib/atribuicao/mensagem.ts` | o código dentro do texto do WhatsApp |
| `src/proxy.ts` | reemite o cookie pelo servidor (ITP) |
| `src/app/ir/whatsapp/route.server.ts` | redirecionador rastreado |
| `src/app/api/atribuicao/route.server.ts` | registro dos toques |
| `src/app/api/lead/route.server.ts` | recepção do lead + espelho no CVCRM |
| `src/app/api/webhooks/cvcrm/route.server.ts` | webhook do CRM (enriquece pelo id) |
| `src/lib/cvcrm/` | cliente do CVCRM (v1 + CVDW), campos adicionais, funil |
| `src/lib/ads/google/` | custo (GAQL) e conversões (Data Manager API) |
| `src/lib/ads/meta/` | custo (Insights) e conversões (CAPI) |
| `src/lib/roas/conciliacao.ts` | liga venda → clique, com nível de confiança |
| `src/lib/roas/relatorio.ts` | o motor de métricas |
| `src/lib/dados/` | modelo e repositório do warehouse |
| `src/app/relatorios/roas/page.tsx` | o painel |
| `scripts/roas.ts` | CLI de sincronização e relatório |
| `docs/sql/warehouse.sql` | schema do Postgres |
