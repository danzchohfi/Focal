#!/usr/bin/env python3
"""Embute imagens locais de um HTML como data URIs (propostas autocontidas).

Uso: python3 embutir.py proposta.html
Troca todo src="arquivo.(webp|jpg|jpeg|png)" cujo arquivo exista (relativo ao
HTML) pelo data URI correspondente, no próprio arquivo. Imagens já em data: ou
http(s): ficam como estão. Avisa sobre arquivos não encontrados — resolva antes
de entregar: uma proposta com imagem quebrada não pode sair.
"""
import base64, mimetypes, pathlib, re, sys

def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    html_path = pathlib.Path(sys.argv[1])
    base = html_path.parent
    html = html_path.read_text()
    faltando: list[str] = []

    def troca(m: re.Match) -> str:
        src = m.group(2)
        if src.startswith(("data:", "http://", "https://")):
            return m.group(0)
        arquivo = (base / src).resolve()
        if not arquivo.is_file():
            faltando.append(src)
            return m.group(0)
        mime = mimetypes.guess_type(arquivo.name)[0] or "application/octet-stream"
        b64 = base64.b64encode(arquivo.read_bytes()).decode()
        return f'{m.group(1)}data:{mime};base64,{b64}{m.group(3)}'

    novo = re.sub(r'(src=")([^"]+)(")', troca, html)
    html_path.write_text(novo)
    print(f"ok: {html_path} ({len(novo):,} bytes)")
    for f in faltando:
        print(f"AVISO: imagem não encontrada: {f}")
    return 1 if faltando else 0

if __name__ == "__main__":
    raise SystemExit(main())
