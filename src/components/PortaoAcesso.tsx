"use client";

// Portão de acesso do preview (Daniel 2026-09-09: o cliente declinou as
// propostas — o material sai do ar público, mas a equipe continua acessando).
//
// LIMITE CONHECIDO, de propósito: isto é um site ESTÁTICO (GitHub Pages), não
// tem servidor pra validar senha. O portão impede a visita — quem abre o link
// vê a tela de senha e para aí. Não é criptografia: o HTML das páginas segue
// no bundle e alguém tecnicamente decidido consegue extrair pelo view-source.
// Se um dia precisar de proteção de verdade, o caminho é tirar as páginas do
// ar ou pôr atrás de autenticação com servidor (ex.: Cloudflare Access).
//
// A senha não fica em texto no código: guardamos o SHA-256 dela. Trocar a
// senha = trocar o hash (node -e "console.log(require('crypto')
// .createHash('sha256').update('NOVA').digest('hex'))"), e as sessões antigas
// caem sozinhas porque o valor salvo no navegador é o próprio hash.

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const HASH_SENHA = "8238215065567fbe31b6ea4e3f5acd3d013a9558970deb3e9a16ceae3d84a1d8";
const CHAVE = "focal:acesso";

// A liberação mora no localStorage — estado EXTERNO ao React, então é lido com
// useSyncExternalStore. É ele que resolve a hidratação: no HTML pré-renderizado
// o snapshot do servidor é sempre "sem acesso" (portão), e depois que o JS sobe
// o React relê o navegador. Ler isso num useEffect + setState seria a forma
// errada (e o lint reclama, com razão).
const ouvintes = new Set<() => void>();

function assinar(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  // outra aba entrando/saindo também atualiza esta
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
    window.removeEventListener("storage", aoMudar);
  };
}

function avisarMudanca() {
  for (const aoMudar of ouvintes) aoMudar();
}

function lerNavegador(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null; // armazenamento bloqueado: pede a senha a cada visita
  }
}

function lerServidor(): string | null {
  return null;
}

async function sha256(texto: string): Promise<string | null> {
  // crypto.subtle só existe em contexto seguro (https/localhost). Sem ele não
  // dá pra conferir a senha — melhor avisar que liberar sem checar.
  if (typeof crypto === "undefined" || !crypto.subtle) return null;
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PortaoAcesso({ children }: { children: React.ReactNode }) {
  const salvo = useSyncExternalStore(assinar, lerNavegador, lerServidor);
  const liberado = salvo === HASH_SENHA;
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!liberado) campo.current?.focus();
  }, [liberado]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    setErro("");

    const digitada = campo.current?.value ?? "";
    const hash = await sha256(digitada);

    if (hash === null) {
      setErro("Não foi possível verificar a senha neste navegador. Abra a página por https.");
      setEnviando(false);
      return;
    }
    if (hash !== HASH_SENHA) {
      setErro("Senha incorreta.");
      setEnviando(false);
      if (campo.current) {
        campo.current.value = "";
        campo.current.focus();
      }
      return;
    }

    try {
      localStorage.setItem(CHAVE, hash);
    } catch {
      // sem armazenamento a liberação vale só para esta navegação
    }
    avisarMudanca();
    setEnviando(false);
  }

  if (liberado) return <>{children}</>;

  // Bloqueado: o conteúdo NÃO é montado — o portão é o que existe na página.
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#111111",
        color: "#f3f3f3",
      }}
    >
      <main style={{ width: "100%", maxWidth: "360px" }}>
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#707070",
              margin: 0,
            }}
          >
            Área restrita
          </p>
          <h1
            style={{
              fontFamily: "var(--font-din), var(--font-sans), sans-serif",
              fontSize: "26px",
              lineHeight: 1.2,
              fontWeight: 700,
              margin: "12px 0 8px",
            }}
          >
            Material em revisão
          </h1>
          <p style={{ fontSize: "14px", lineHeight: 1.55, color: "#cfcfcf", margin: 0 }}>
            Estas páginas estão temporariamente fora do ar público. Acesso com a senha
            da equipe.
          </p>

          <form onSubmit={enviar} style={{ marginTop: "24px" }}>
            <label
              htmlFor="senha-acesso"
              style={{
                display: "block",
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#707070",
                marginBottom: "8px",
              }}
            >
              Senha
            </label>
            <input
              id="senha-acesso"
              ref={campo}
              type="password"
              name="senha"
              autoComplete="current-password"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby={erro ? "erro-acesso" : undefined}
              style={{
                width: "100%",
                height: "46px",
                padding: "0 14px",
                borderRadius: "4px",
                border: `1px solid ${erro ? "#c4453a" : "#333333"}`,
                background: "#1a1a1a",
                color: "#f3f3f3",
                fontSize: "16px", // 16px evita o zoom automático no iOS
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <div id="erro-acesso" role="status" aria-live="polite" style={{ minHeight: "22px" }}>
              {erro && (
                <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#e0776d" }}>{erro}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={enviando}
              style={{
                width: "100%",
                height: "46px",
                marginTop: "10px",
                borderRadius: "4px",
                border: "none",
                background: "#f3f3f3",
                color: "#111111",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: enviando ? "default" : "pointer",
                opacity: enviando ? 0.7 : 1,
              }}
            >
              {enviando ? "Verificando…" : "Entrar"}
            </button>
          </form>
      </main>
    </div>
  );
}
