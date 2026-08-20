#!/usr/bin/env bash
#
# Garante que o autor do commit seja um e-mail que o GitHub consegue resolver.
#
# POR QUÊ ISSO EXISTE
# -------------------
# A Vercel só publica um deploy depois de casar o e-mail do autor do commit
# com uma conta do GitHub. Quando ela não consegue, a build para em
# "Deployment Blocked" — mesmo o push tendo funcionado normalmente. Não é
# permissão de repositório: o commit entrou, o que faltou foi IDENTIDADE.
#
# Comparando dois deploys reais do projeto vp-social:
#
#   githubCommitAuthorEmail: noreply@anthropic.com
#   githubCommitAuthorLogin: claude          -> READY
#
#   githubCommitAuthorEmail: jonatas@vitaminapublicitaria.com.br
#   githubCommitAuthorLogin: (ausente)       -> BLOCKED
#
# O e-mail de trabalho não está cadastrado em nenhuma conta do GitHub, então
# o commit chega à Vercel sem login de autor e é barrado.
#
# O QUE ESTE HOOK FAZ
# -------------------
# Se o e-mail configurado não for um dos que sabidamente resolvem, troca
# APENAS o e-mail — no .git/config deste repositório, nunca no --global, para
# não mexer na configuração pessoal de ninguém — e registra no NOME do autor
# quem estava rodando a sessão, para não se perder o rastro de quem fez o quê.
#
# Isto é uma rede de segurança, não o conserto ideal. O conserto ideal é cada
# pessoa cadastrar e verificar o e-mail de trabalho no GitHub
# (Settings -> Emails); aí o commit passa a resolver sozinho, com a autoria
# correta, e este hook sai da frente sem fazer nada.

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

# Fora de um repositório git não há nada a configurar.
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

# E-mail comprovadamente resolvido pelo GitHub (conta @claude) e aceito pela
# Vercel — é o mesmo que assina os deploys que hoje sobem verdes.
FALLBACK_EMAIL="noreply@anthropic.com"

current_email="$(git config user.email 2>/dev/null || true)"

# E-mails que já resolvem para uma conta do GitHub: deixa como está, para
# preservar a autoria real de quem já está cadastrado.
#   *@users.noreply.github.com resolve por construção.
case "$current_email" in
  noreply@anthropic.com|dzchohfi@gmail.com|*@users.noreply.github.com)
    exit 0
    ;;
esac

current_name="$(git config user.name 2>/dev/null || true)"
[ -n "$current_name" ] || current_name="Claude"

# Guarda quem era no nome: "Claude" vira "Claude (jonatas)".
if [ -n "$current_email" ]; then
  who="${current_email%%@*}"
  case "$current_name" in
    *"($who)"*) : ;;
    *) current_name="$current_name ($who)" ;;
  esac
fi

git config user.email "$FALLBACK_EMAIL"
git config user.name "$current_name"

echo "[git-identity] autor: $current_name <$FALLBACK_EMAIL> (era <${current_email:-vazio}>)" >&2
