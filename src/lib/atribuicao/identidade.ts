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

/** Lowercase + trim — a normalização que Google e Meta exigem. */
export function normalizaEmail(bruto: string | null | undefined): string | undefined {
  if (!bruto) return undefined;
  const limpo = bruto.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo) ? limpo : undefined;
}

/**
 * Chave de e-mail para o join interno: remove pontos e sufixo `+tag` nos
 * provedores que os ignoram. NÃO usar para enviar às plataformas.
 */
export function chaveEmail(bruto: string | null | undefined): string | undefined {
  const email = normalizaEmail(bruto);
  if (!email) return undefined;
  const [usuario, dominio] = email.split("@");
  const semTag = usuario.split("+")[0];
  const ignoramPonto = ["gmail.com", "googlemail.com"];
  return `${ignoramPonto.includes(dominio) ? semTag.replace(/\./g, "") : semTag}@${dominio}`;
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
  /** SHA-256 do e-mail normalizado. */
  emailSha256?: string;
  /** SHA-256 do telefone em E.164 COM `+` (padrão Google Ads). */
  telefoneSha256Google?: string;
  /** SHA-256 do telefone em E.164 SEM `+` (padrão Meta CAPI). */
  telefoneSha256Meta?: string;
  primeiroNomeSha256?: string;
  sobrenomeSha256?: string;
};

/** Hasheia o contato uma única vez nos formatos que cada plataforma espera. */
export async function hasheiaIdentidade(contato: {
  email?: string | null;
  telefone?: string | null;
  nome?: string | null;
}): Promise<IdentidadeHasheada> {
  const saida: IdentidadeHasheada = {};

  const email = normalizaEmail(contato.email);
  if (email) saida.emailSha256 = await sha256(email);

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
