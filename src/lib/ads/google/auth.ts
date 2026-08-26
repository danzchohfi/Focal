// Credenciais do Google.
//
// Duas APIs, dois escopos diferentes, e é fácil confundir:
//
//   • Google Ads API (leitura de custo, ajustes de conversão) — escopo
//     `.../auth/adwords`, exige `developer-token` e, quando o acesso é via
//     MCC, o header `login-customer-id`.
//   • Data Manager API (envio de conversão offline) — escopo
//     `.../auth/datamanager` e NENHUM developer token. Desde 15/06/2026 é o
//     caminho oficial: o método antigo UploadClickConversions passou a exigir
//     allowlist que uma conta nova não tem.
//
// O mesmo refresh token serve para as duas se ele foi emitido com os dois
// escopos; por isso a configuração aceita um token único ou um por API.

export type ConfigGoogle = {
  clientId: string;
  clientSecret: string;
  /** Refresh token com escopo `adwords` (leitura de custo). */
  refreshTokenAds?: string;
  /** Refresh token com escopo `datamanager` (envio de conversões). */
  refreshTokenDataManager?: string;
  developerToken?: string;
  /** ID da conta do cliente, só dígitos. */
  customerId?: string;
  /** ID do MCC da agência, só dígitos. Obrigatório quando o acesso é via MCC. */
  loginCustomerId?: string;
  /** IDs numéricos das conversion actions por etapa do funil. */
  conversionActions: Partial<Record<string, string>>;
};

/** Versão da Google Ads API usada nas consultas de custo. */
export const VERSAO_ADS_API = process.env.GOOGLE_ADS_API_VERSAO ?? "v25";

function soDigitos(valor: string | undefined) {
  return valor?.replace(/\D+/g, "") || undefined;
}

export function configGoogle(): ConfigGoogle | undefined {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return undefined;

  const compartilhado = process.env.GOOGLE_REFRESH_TOKEN;
  return {
    clientId,
    clientSecret,
    refreshTokenAds: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? compartilhado,
    refreshTokenDataManager: process.env.GOOGLE_DATAMANAGER_REFRESH_TOKEN ?? compartilhado,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    customerId: soDigitos(process.env.GOOGLE_ADS_CUSTOMER_ID),
    loginCustomerId: soDigitos(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID),
    conversionActions: {
      qualificado: process.env.GOOGLE_CONVERSION_QUALIFICADO,
      visita: process.env.GOOGLE_CONVERSION_VISITA,
      proposta: process.env.GOOGLE_CONVERSION_PROPOSTA,
      venda: process.env.GOOGLE_CONVERSION_VENDA,
    },
  };
}

type TokenCache = { valor: string; expiraEm: number };
const cache = new Map<string, TokenCache>();

/** Troca o refresh token por um access token (válido por 1 hora). */
export async function accessToken(config: ConfigGoogle, api: "ads" | "datamanager") {
  const refresh = api === "ads" ? config.refreshTokenAds : config.refreshTokenDataManager;
  if (!refresh) throw new Error(`Google: falta refresh token para a API ${api}`);

  const guardado = cache.get(refresh);
  if (guardado && guardado.expiraEm > Date.now() + 60_000) return guardado.valor;

  const resposta = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const corpo = (await resposta.json()) as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!resposta.ok || !corpo.access_token) {
    throw new Error(`Google OAuth ${resposta.status}: ${corpo.error_description ?? corpo.error ?? "sem token"}`);
  }

  cache.set(refresh, {
    valor: corpo.access_token,
    expiraEm: Date.now() + (corpo.expires_in ?? 3600) * 1000,
  });
  return corpo.access_token;
}
