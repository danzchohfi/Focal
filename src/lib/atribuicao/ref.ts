// Código curto de atribuição ("lead ref").
//
// É a única peça que atravessa o buraco do funil: o visitante clica no
// WhatsApp, o texto pré-preenchido já vai com o código, a Laís recebe esse
// código na primeira mensagem e grava no CVCRM. Meses depois, quando a venda
// é fechada, o código no CRM devolve o clique original — campanha, grupo e
// anúncio.
//
// Formato: FCL-TTTTTRRR
//   TTTTT = minutos desde 2024-01-01 UTC em base32 Crockford (~63 anos)
//   RRR   = 3 caracteres aleatórios (32³ = 32.768 por minuto)
// A parte temporal torna colisão praticamente impossível na prática (seriam
// necessários ~200 códigos no MESMO minuto para 50% de chance) e ainda deixa
// a data de origem legível a partir do próprio código.

/** Base32 de Crockford: sem I, L, O e U (não confunde ao ditar por telefone). */
const ALFABETO = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const EPOCA_MS = Date.UTC(2024, 0, 1);
const CARACTERES_TEMPO = 5;
const CARACTERES_ALEATORIOS = 3;

export const PREFIXO_REF = "FCL";
/** Casa o código dentro de um texto livre (mensagem do WhatsApp, campo do CRM). */
export const REGEX_REF = /FCL-[0-9A-HJKMNP-TV-Z]{8}/;
const REGEX_REF_COMPLETO = /^FCL-[0-9A-HJKMNP-TV-Z]{8}$/;

function base32(valor: number, casas: number) {
  let saida = "";
  let n = Math.max(0, Math.floor(valor));
  for (let i = 0; i < casas; i++) {
    saida = ALFABETO[n % 32] + saida;
    n = Math.floor(n / 32);
  }
  return saida;
}

function aleatorios(casas: number) {
  const cripto = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cripto?.getRandomValues) {
    const bytes = cripto.getRandomValues(new Uint8Array(casas));
    return Array.from(bytes, (b) => ALFABETO[b % 32]).join("");
  }
  let saida = "";
  for (let i = 0; i < casas; i++) saida += ALFABETO[Math.floor(Math.random() * 32)];
  return saida;
}

/** Gera um código novo. `agora` é injetável para teste. */
export function novoRef(agora: number = Date.now()) {
  const minutos = Math.floor((agora - EPOCA_MS) / 60_000);
  const ciclo = 32 ** CARACTERES_TEMPO;
  const tempo = base32(((minutos % ciclo) + ciclo) % ciclo, CARACTERES_TEMPO);
  return `${PREFIXO_REF}-${tempo}${aleatorios(CARACTERES_ALEATORIOS)}`;
}

const TAMANHO_CORPO = CARACTERES_TEMPO + CARACTERES_ALEATORIOS;

/** Normaliza o que o usuário/CRM digitou (minúsculas, espaços, sem o traço). */
export function normalizaRef(bruto: string | null | undefined) {
  if (!bruto) return undefined;
  const limpo = bruto.toUpperCase().replace(/[^0-9A-Z]/g, "");

  // O prefixo sai ANTES da correção de confusões: o "L" de FCL viraria "1".
  // Aceita também um prefixo já corrompido (FC1, FCI) vindo de transcrição.
  const corpoBruto =
    limpo.length === TAMANHO_CORPO + PREFIXO_REF.length && /^FC[L1I]/.test(limpo)
      ? limpo.slice(PREFIXO_REF.length)
      : limpo;

  // Confusões comuns ao ditar por telefone ou ao transcrever de um print.
  const corpo = corpoBruto.replace(/O/g, "0").replace(/[IL]/g, "1").replace(/U/g, "V");
  if (corpo.length !== TAMANHO_CORPO) return undefined;

  const candidato = `${PREFIXO_REF}-${corpo}`;
  return REGEX_REF_COMPLETO.test(candidato) ? candidato : undefined;
}

/** Extrai o primeiro código encontrado num texto livre. */
export function extraiRef(texto: string | null | undefined) {
  if (!texto) return undefined;
  const achado = texto.toUpperCase().match(REGEX_REF);
  return achado ? achado[0] : undefined;
}

export function refValido(valor: string | null | undefined): valor is string {
  return !!valor && REGEX_REF_COMPLETO.test(valor);
}

/** Data aproximada em que o código foi criado (útil para auditar o CRM). */
export function dataDoRef(ref: string) {
  const normalizado = normalizaRef(ref);
  if (!normalizado) return undefined;
  const tempo = normalizado.slice(PREFIXO_REF.length + 1, PREFIXO_REF.length + 1 + CARACTERES_TEMPO);
  let minutos = 0;
  for (const caractere of tempo) {
    const indice = ALFABETO.indexOf(caractere);
    if (indice < 0) return undefined;
    minutos = minutos * 32 + indice;
  }
  return new Date(EPOCA_MS + minutos * 60_000);
}
