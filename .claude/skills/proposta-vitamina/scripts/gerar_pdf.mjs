// Imprime a proposta em PDF de slides 16:9 com links clicáveis.
//
// Uso: node gerar_pdf.mjs proposta.html proposta.pdf
//
// Requisitos do ambiente Claude Code remoto: playwright-core instalado no
// diretório de trabalho (npm i playwright-core) e o Chromium pré-instalado em
// /opt/pw-browsers/chromium (PLAYWRIGHT_BROWSERS_PATH). Em outra máquina,
// ajuste executablePath ou remova-o para usar o Chromium do Playwright.
//
// O HTML deve usar seções .pagina com break-after: page no @media print
// (o base.css da skill já faz isso). Cada .pagina vira um slide 16:9.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

// resolve playwright-core a partir do script OU do diretório atual
let chromium;
try {
  ({ chromium } = await import("playwright-core"));
} catch {
  const req = createRequire(resolve(process.cwd(), "package.json"));
  ({ chromium } = req("playwright-core"));
}

const [html, pdf] = process.argv.slice(2);
if (!html || !pdf) {
  console.error("uso: node gerar_pdf.mjs <entrada.html> <saida.pdf>");
  process.exit(2);
}

const exec = "/opt/pw-browsers/chromium";
const browser = await chromium.launch({
  ...(existsSync(exec) ? { executablePath: exec } : {}),
  args: ["--use-gl=swiftshader", "--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto("file://" + resolve(html), { waitUntil: "load", timeout: 60000 });
// dá tempo das fontes do Google chegarem; sem rede, os fallbacks assumem
await page.evaluate(() => document.fonts.ready).catch(() => {});
await page.waitForTimeout(600);
await page.pdf({
  path: pdf,
  width: "13.333in",   // 16:9 — 1280×720 em 96dpi
  height: "7.5in",
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});
await browser.close();
console.log("ok:", pdf);
