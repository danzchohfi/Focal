-- Warehouse de atribuição — schema para Postgres (Supabase).
--
-- Rodar uma vez no SQL Editor do Supabase. Os nomes das colunas são o
-- snake_case do modelo em src/lib/dados/tipos.ts: o repositório converte
-- camelCase → snake_case automaticamente (src/lib/dados/repositorio.ts).
--
-- Duas decisões deliberadas:
--   • PII fica isolada em `atr_leads`, com retenção própria e política de
--     acesso separada — é a única tabela que precisa de cuidado LGPD.
--   • Nenhuma chave estrangeira rígida entre toques, leads e eventos. As três
--     chegam de fontes independentes e fora de ordem (o webhook da venda pode
--     chegar antes da carga do lead); amarrar com FK só produziria falha de
--     ingestão. A ligação é feita na leitura, pelo `ref` e pelas `chaves`.

-- ─────────────────────────── toques ───────────────────────────
-- Um clique/visita com origem, ou um clique em CTA de WhatsApp.

create table if not exists atr_toques (
  id                    text primary key,
  ref                   text not null,
  tipo                  text not null check (tipo in ('toque','whatsapp','formulario')),
  ts                    timestamptz not null,
  pagina                text,
  contexto              text,
  posicao               text,

  canal                 text not null,
  plataforma            text not null,
  -- IDs de mídia como TEXT: os IDs do Google são inteiros de 64 bits e
  -- perderiam precisão em qualquer tipo numérico do JavaScript.
  campanha_id           text,
  grupo_id              text,
  anuncio_id            text,
  palavra_chave         text,

  gclid                 text,
  gbraid                text,
  wbraid                text,
  fbclid                text,
  fbc                   text,
  fbp                   text,
  ga_cid                text,

  canal_primeiro        text,
  campanha_primeiro_id  text,
  toques                integer default 1,

  atribuicao            jsonb,
  criado_em             timestamptz default now()
);

create index if not exists atr_toques_ref_idx on atr_toques (ref);
create index if not exists atr_toques_ts_idx on atr_toques (ts);
create index if not exists atr_toques_gclid_idx on atr_toques (gclid) where gclid is not null;
create index if not exists atr_toques_anuncio_idx on atr_toques (plataforma, campanha_id, grupo_id, anuncio_id);

-- ─────────────────────────── leads ───────────────────────────
-- ÚNICA tabela com dado pessoal. Ver a seção de LGPD em docs/atribuicao-roas.md.

create table if not exists atr_leads (
  id                     text primary key,
  ref                    text not null,
  criado_em              timestamptz not null,
  nome                   text,
  email                  text,
  telefone               text,
  telefone_normalizado   text,
  email_sha256           text,
  telefone_sha256        text,
  chaves                 jsonb not null default '[]'::jsonb,
  contexto               text,
  origem                 text,
  assunto                text,
  quando                 text,
  orcamento              text,
  mensagem               text,
  consentimento          boolean,
  atribuicao             jsonb,
  crm_id                 text
);

create index if not exists atr_leads_ref_idx on atr_leads (ref);
create index if not exists atr_leads_telefone_idx on atr_leads (telefone_normalizado);
create index if not exists atr_leads_chaves_idx on atr_leads using gin (chaves);

-- ─────────────────────────── eventos ───────────────────────────
-- O funil: lead → qualificado → visita → proposta → reserva → venda/distrato.

create table if not exists atr_eventos (
  id              text primary key,
  ref             text,
  chaves          jsonb not null default '[]'::jsonb,
  etapa           text not null,
  ts              timestamptz not null,
  valor           numeric(14,2),
  moeda           text default 'BRL',
  fonte           text not null,
  fonte_id        text,
  empreendimento  text,
  unidade         text,
  bruto           jsonb,
  criado_em       timestamptz default now()
);

create index if not exists atr_eventos_ref_idx on atr_eventos (ref);
create index if not exists atr_eventos_ts_idx on atr_eventos (ts);
create index if not exists atr_eventos_etapa_idx on atr_eventos (etapa);
create index if not exists atr_eventos_chaves_idx on atr_eventos using gin (chaves);

-- ─────────────────────────── custos ───────────────────────────
-- Custo diário por anúncio. Precisa ser sincronizado TODO DIA: Google e Meta
-- encurtaram a retenção do histórico em 2026, e o custo que não for guardado
-- hoje pode não estar disponível quando a venda chegar, meses depois.

create table if not exists atr_custos (
  id             text primary key,
  data           date not null,
  plataforma     text not null,
  conta_id       text,
  campanha_id    text not null,
  campanha_nome  text,
  grupo_id       text,
  grupo_nome     text,
  anuncio_id     text,
  anuncio_nome   text,
  impressoes     bigint default 0,
  cliques        bigint default 0,
  custo          numeric(12,2) default 0
);

create index if not exists atr_custos_data_idx on atr_custos (data);
create index if not exists atr_custos_chave_idx on atr_custos (plataforma, campanha_id, grupo_id, anuncio_id);

-- ───────────────────────── conciliações ─────────────────────────
-- Auditoria de COMO cada venda foi ligada a um clique. Serve para responder
-- "por que esta venda não aparece em nenhuma campanha?".

create table if not exists atr_conciliacoes (
  id             text primary key,
  evento_id      text not null,
  ref            text,
  metodo         text not null,
  confianca      text not null,
  toque_id       text,
  conciliado_em  timestamptz not null,
  observacao     text
);

create index if not exists atr_conciliacoes_evento_idx on atr_conciliacoes (evento_id);

-- ───────────────────────── segurança ─────────────────────────
-- O pipeline usa a service key (bypassa RLS). Ligar RLS sem policy garante
-- que a chave anônima, exposta no navegador, não leia nada.

alter table atr_toques        enable row level security;
alter table atr_leads         enable row level security;
alter table atr_eventos       enable row level security;
alter table atr_custos        enable row level security;
alter table atr_conciliacoes  enable row level security;

-- ───────────────────────── retenção ─────────────────────────
-- Apaga o dado pessoal depois da janela declarada na política de privacidade,
-- preservando o histórico agregado (toques, eventos e custos não têm PII).
-- Agendar com pg_cron: select cron.schedule('purga-pii','0 4 * * *','select atr_purga_pii(24)');

create or replace function atr_purga_pii(meses integer default 24)
returns integer
language plpgsql
as $$
declare afetados integer;
begin
  update atr_leads
     set nome = null, email = null, telefone = null, mensagem = null
   where criado_em < now() - (meses || ' months')::interval
     and (nome is not null or email is not null or telefone is not null);
  get diagnostics afetados = row_count;
  return afetados;
end;
$$;
