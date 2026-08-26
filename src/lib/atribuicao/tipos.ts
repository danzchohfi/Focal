// Contrato de dados da atribuição de mídia.
//
// Um "toque" é uma chegada ao site com informação de origem (click id de
// plataforma, UTM ou referrer). A atribuição guarda o primeiro e o último
// toque — no imobiliário o ciclo é longo e o cliente costuma voltar várias
// vezes por canais diferentes, então nenhum dos dois sozinho conta a história.

export const VERSAO_ATRIBUICAO = 1;

/** Canal normalizado do toque. */
export type Canal =
  | "google_ads"
  | "meta_ads"
  | "tiktok_ads"
  | "microsoft_ads"
  | "linkedin_ads"
  | "google_organico"
  | "social_organico"
  | "email"
  | "referral"
  | "direto"
  | "outro";

/** Identificadores de clique das plataformas (a chave mais forte da atribuição). */
export type ClickIds = {
  /** Google Ads — clique com cookie disponível. */
  gclid?: string;
  /** Google Ads — campanhas de app/iOS sem gclid (Web-to-App). */
  gbraid?: string;
  /** Google Ads — campanhas de app/iOS sem gclid (App-to-Web). */
  wbraid?: string;
  /** Meta Ads. */
  fbclid?: string;
  /** TikTok Ads. */
  ttclid?: string;
  /** Microsoft/Bing Ads. */
  msclkid?: string;
  /** LinkedIn Ads. */
  li_fat_id?: string;
};

/** Parâmetros de campanha (UTM padrão + os IDs que a gente injeta via template). */
export type ParamsCampanha = {
  utm_source?: string;
  utm_medium?: string;
  /** ID da campanha (Google `{campaignid}` / Meta `{{campaign.id}}`). */
  utm_campaign?: string;
  /** ID do anúncio (Google `{creative}` / Meta `{{ad.id}}`). */
  utm_content?: string;
  /** Palavra-chave (Google `{keyword}`) ou posicionamento (Meta `{{placement}}`). */
  utm_term?: string;
  utm_id?: string;
  /** ID do grupo de anúncios (Google `{adgroupid}`) ou do conjunto (Meta `{{adset.id}}`). */
  ag?: string;
  /** Tipo de correspondência da palavra-chave (Google `{matchtype}`). */
  mt?: string;
  /** Rede (Google `{network}`: g/s/d/u/ytv). */
  net?: string;
  /** Dispositivo (Google `{device}`: m/t/c). */
  dev?: string;
  /** Posicionamento (Google `{placement}` / Meta `{{site_source_name}}`). */
  plc?: string;
  /** ID do alvo em Shopping/Display (Google `{targetid}`). */
  tgt?: string;
};

/** Uma chegada ao site com informação de origem. */
export type Toque = {
  /** Momento do toque (ISO 8601). */
  ts: string;
  /** Path da landing page (sem querystring). */
  lp: string;
  /** Host do referrer, quando existe. */
  ref?: string;
  canal: Canal;
} & ClickIds &
  ParamsCampanha;

/** Objeto persistido no navegador e enviado junto de toda conversão. */
export type Atribuicao = {
  v: typeof VERSAO_ATRIBUICAO;
  /** Código curto que viaja no WhatsApp e vira a chave do join no CRM. */
  ref: string;
  /** Primeiro toque com origem identificada (o que "descobriu" o lead). */
  primeiro: Toque;
  /** Último toque com origem identificada (o que "fechou" a visita). */
  ultimo: Toque;
  /** Quantidade de toques com origem identificada. */
  toques: number;
  /** Momento em que o `ref` foi criado (ISO 8601). */
  criadoEm: string;
  /** Cookie `_fbp` do pixel da Meta, quando presente. */
  fbp?: string;
  /** Cookie `_fbc` da Meta — construído a partir do fbclid quando não existe. */
  fbc?: string;
  /** client_id do GA4 (lido do cookie `_ga`), para casar com o relatório do GA. */
  gaCid?: string;
};

/** Payload que o formulário envia para /api/lead. */
export type PayloadLead = {
  nome: string;
  email: string;
  telefone: string;
  assunto?: string;
  quando?: string;
  orcamento?: string;
  mensagem?: string;
  /** Empreendimento/contexto do formulário (ex.: "artur-73"). */
  contexto?: string;
  /** Path da página onde o formulário foi enviado. */
  origem?: string;
  atribuicao?: Atribuicao;
  /** Consentimento LGPD registrado no envio. */
  consentimento?: boolean;
};

/** Nome do cookie/chave de storage da atribuição. */
export const COOKIE_ATRIBUICAO = "fcl_atr";
/** Nome do cookie/chave de storage do código curto. */
export const COOKIE_REF = "fcl_ref";
/** Validade da atribuição: 180 dias cobre o ciclo de decisão do imobiliário. */
export const DIAS_VALIDADE = 180;
