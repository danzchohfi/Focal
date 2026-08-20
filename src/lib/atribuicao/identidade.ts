// Normalização e hash de identidade.
//
// Dois usos, com regras diferentes:
//  1. JOIN interno — casar a venda que veio do CVCRM (só tem nome/telefone/
//     e-mail) com o clique original. Aqui vale ser agressivo na normalização.
//  2. ENVIO para Google/Meta — as plataformas exigem um formato exato antes do
//     SHA-256; qualquer desvio derruba o match rate a zero silenciosamente.
//
// Nada de PII em texto puro sai daqui para fora: as funções `hash*` devolvem
// sempre o digest hexadecimal minúsculo, que é o que as duas APIs aceitam.

/** Só dígitos. */
function digitos(valor: string) {
  return valor.replace(/\D+/g, "");
}

/**
 * Telefone brasileiro em E.164 sem o `+` (ex.: 5511998887777).
 * Aceita "(11) 99888-7777", "+55 11 99888 7777", "011999887777".
 * Devolve `undefined` quando não dá para ter certeza do número.
 */
export function normalizaTelefone(bruto: string | null | undefined): string | undefined {
  if (!bruto) return undefined;
  let n = digitos(bruto);
  if (!n) return undefined;

  // Zeros de operadora/DDD (0xx) na frente.
  n = n.replace(/^0+/, "");
  // Código internacional já presente.
  if (n.startsWith("55") && (n.length === 12 || n.length === 13)) return n;
  // DDD + 8 (fixo/celular antigo) ou DDD + 9 (celular atual).
  if (n.length === 10 || n.length === 11) return `55${n}`;
  // Número sem DDD: não dá para atribuir com segurança.
  if (n.length < 10) return undefined;
  // Fora do padrão (internacional ou digitação errada): mantém como está.
  return n;
}

/** Mesmo número em E.164 com `+` — formato exigido pelo Google Ads. */
export function telefoneE164(bruto: string | null | undefined) {
  const n = normalizaTelefone(bruto);
  return n ? `+${n}` : undefined;
}

/**
 * Variantes do mesmo telefone para o join interno: o CRM pode ter gravado o
 * celular sem o 9º dígito (base antiga) enquanto o site gravou com ele.
 */
export function variantesTelefone(bruto: string | null | undefined): string[] {
  const n = normalizaTelefone(bruto);
  if (!n) return [];
  const saida = new Set<string>([n]);
  if (n.startsWith("55") && n.length === 13) {
    const ddd = n.slice(2, 4);
    const resto = n.slice(4);
    if (resto.startsWith("9") && resto.length === 9) saida.add(`55${ddd}${resto.slice(1)}`);
  }
  if (n.startsWith("55") && n.length === 12) {
    const ddd = n.slice(2, 4);
    const resto = n.slice(4);
    if (/^[6-9]/.test(resto)) saida.add(`55${ddd}9${resto}`);
  }
  return [...saida];
}

/** Lowercase + trim — é o que a Meta exige, e a base para a regra do Google. */
export function normalizaEmail(bruto: string | null | undefined): string | undefined {
  if (!bruto) return undefined;
  const limpo = bruto.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo) ? limpo : undefined;
}

/** Provedores que ignoram ponto e sufixo `+tag` no nome de usuário. */
const IGNORAM_PONTO = ["gmail.com", "googlemail.com"];

/**
 * Normalização de e-mail do Google Ads (enhanced conversions).
 *
 * A regra do Google NÃO é a mesma da Meta: além de trim + minúsculas, para
 * **gmail.com e googlemail.com** é obrigatório remover os pontos e o sufixo
 * `+tag` do usuário ANTES do hash. Para os demais domínios, ponto e `+tag` são
 * significativos e precisam ser preservados. Aplicar a regra do Gmail a todo
 * mundo — ou não aplicá-la ao Gmail — gera um hash diferente do que o Google
 * espera, e o match simplesmente não acontece, sem nenhum erro.
 */
export function normalizaEmailGoogle(bruto: string | null | undefined): string | undefined {
  const email = normalizaEmail(bruto);
  if (!email) return undefined;
  const [usuario, dominio] = email.split("@");
  if (!IGNORAM_PONTO.includes(dominio)) return email;
  return `${usuario.split("+")[0].replace(/\./g, "")}@${dominio}`;
}

/**
 * Chave de e-mail para o JOIN INTERNO. Mais agressiva que a do Google: remove
 * o sufixo `+tag` em qualquer domínio, porque aqui um falso positivo custa
 * pouco e um falso negativo custa uma venda sem origem. NÃO usar para enviar
 * às plataformas — para isso existem `normalizaEmail` (Meta) e
 * `normalizaEmailGoogle` (Google).
 */
export function chaveEmail(bruto: string | null | undefined): string | undefined {
  const email = normalizaEmail(bruto);
  if (!email) return undefined;
  const [usuario, dominio] = email.split("@");
  const semTag = usuario.split("+")[0];
  return `${IGNORAM_PONTO.includes(dominio) ? semTag.replace(/\./g, "") : semTag}@${dominio}`;
}

/** Nome próprio normalizado (sem acento, minúsculo) — usado no matching avançado. */
export function normalizaNome(bruto: string | null | undefined): string | undefined {
  if (!bruto) return undefined;
  const limpo = bruto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return limpo || undefined;
}

/** SHA-256 hexadecimal minúsculo — formato aceito por Google Ads e Meta CAPI. */
export async function sha256(valor: string): Promise<string> {
  const bytes = new TextEncoder().encode(valor);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type IdentidadeHasheada = {
  /** SHA-256 do e-mail com a normalização do Google (regra do Gmail aplicada). */
  emailSha256Google?: string;
  /** SHA-256 do e-mail com trim + minúsculas (padrão Meta CAPI). */
  emailSha256Meta?: string;
  /** SHA-256 do telefone em E.164 COM `+` (padrão Google Ads). */
  telefoneSha256Google?: string;
  /** SHA-256 do telefone em E.164 SEM `+` (padrão Meta CAPI). */
  telefoneSha256Meta?: string;
  primeiroNomeSha256?: string;
  sobrenomeSha256?: string;
};

/**
 * Hasheia o contato nos formatos que cada plataforma espera.
 *
 * São quatro hashes e não dois porque as duas plataformas divergem nas DUAS
 * pontas: telefone (Google com `+`, Meta sem) e e-mail (Google normaliza Gmail,
 * Meta não). Mandar o hash errado não dá erro — só zera o match.
 */
export async function hasheiaIdentidade(contato: {
  email?: string | null;
  telefone?: string | null;
  nome?: string | null;
}): Promise<IdentidadeHasheada> {
  const saida: IdentidadeHasheada = {};

  const emailMeta = normalizaEmail(contato.email);
  if (emailMeta) saida.emailSha256Meta = await sha256(emailMeta);
  const emailGoogle = normalizaEmailGoogle(contato.email);
  if (emailGoogle) {
    saida.emailSha256Google =
      emailGoogle === emailMeta ? saida.emailSha256Meta : await sha256(emailGoogle);
  }

  const telefone = normalizaTelefone(contato.telefone);
  if (telefone) {
    saida.telefoneSha256Google = await sha256(`+${telefone}`);
    saida.telefoneSha256Meta = await sha256(telefone);
  }

  const nome = normalizaNome(contato.nome);
  if (nome) {
    const partes = nome.split(" ");
    saida.primeiroNomeSha256 = await sha256(partes[0]);
    if (partes.length > 1) saida.sobrenomeSha256 = await sha256(partes[partes.length - 1]);
  }
  return saida;
}

/**
 * Chaves determinísticas de identidade para casar lead do site com registro do
 * CRM. Ordem importa: a primeira que casar dos dois lados vence.
 */
export function chavesIdentidade(contato: {
  email?: string | null;
  telefone?: string | null;
}): string[] {
  const chaves: string[] = [];
  for (const telefone of variantesTelefone(contato.telefone)) chaves.push(`tel:${telefone}`);
  const email = chaveEmail(contato.email);
  if (email) chaves.push(`email:${email}`);
  return chaves;
}
