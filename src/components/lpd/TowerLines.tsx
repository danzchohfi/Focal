"use client";

import { useEffect, useRef } from "react";

/**
 * Torre em linhas (three.js) para o hero da LP-D — o elemento de arquitetura
 * que substitui as partículas: um volume estilizado do Artur 73 desenhado só
 * em arestas, girando devagar, com paralaxe leve ao ponteiro.
 *
 * A massa é uma leitura livre do projeto: pódio com brises, torre esbelta com
 * lajes marcadas e o volume do rooftop deslocado no topo.
 *
 * Decorativo (aria-hidden). Sem WebGL ou com prefers-reduced-motion a camada
 * não monta — nada depende dela.
 */
export default function TowerLines({ cor = "#12475F" }: { cor?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const host = ref.current;
    const parent = host?.parentElement;
    if (!host || !parent) return;

    let cancelado = false;
    let limpar: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (cancelado) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearAlpha(0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
      host.appendChild(renderer.domElement);

      const cena = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(4.6, 3.4, 7.2);
      camera.lookAt(0, 1.9, 0);

      const grupo = new THREE.Group();
      cena.add(grupo);

      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(cor),
        transparent: true,
        opacity: 0.42,
      });
      const matForte = new THREE.LineBasicMaterial({
        color: new THREE.Color(cor),
        transparent: true,
        opacity: 0.8,
      });

      const aresta = (
        w: number, h: number, d: number,
        x: number, y: number, z: number,
        material = mat
      ) => {
        const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
        const l = new THREE.LineSegments(g, material);
        l.position.set(x, y, z);
        grupo.add(l);
        return g;
      };

      const geos: InstanceType<typeof THREE.EdgesGeometry>[] = [];

      // Pódio com base marcada
      geos.push(aresta(2.6, 1.1, 2.2, 0, 0.55, 0, matForte));
      // Brises do pódio: linhas verticais na face frontal
      const brise = new THREE.BufferGeometry();
      const pts: number[] = [];
      for (let i = 0; i <= 12; i++) {
        const x = -1.2 + (i * 2.4) / 12;
        pts.push(x, 0.08, 1.101, x, 1.02, 1.101);
      }
      brise.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      grupo.add(new THREE.LineSegments(brise, mat));

      // Torre esbelta
      geos.push(aresta(1.5, 3.9, 1.1, 0.1, 1.1 + 1.95, -0.1, matForte));
      // Lajes marcadas
      for (let i = 1; i <= 12; i++) {
        geos.push(aresta(1.56, 0.02, 1.16, 0.1, 1.1 + (i * 3.9) / 13, -0.1));
      }
      // Volume do rooftop deslocado
      geos.push(aresta(0.62, 0.5, 0.62, 0.62, 1.1 + 3.9 + 0.25, -0.28, matForte));

      // Chão: quadrícula de implantação
      const grade = new THREE.BufferGeometry();
      const gpts: number[] = [];
      for (let i = -4; i <= 4; i++) {
        gpts.push(i, 0, -4, i, 0, 4, -4, 0, i, 4, 0, i);
      }
      grade.setAttribute("position", new THREE.Float32BufferAttribute(gpts, 3));
      const matGrade = new THREE.LineBasicMaterial({ color: new THREE.Color(cor), transparent: true, opacity: 0.12 });
      grupo.add(new THREE.LineSegments(grade, matGrade));

      const alvoRot = { y: 0.5, x: 0 };
      const onPointer = (e: PointerEvent) => {
        const r = parent.getBoundingClientRect();
        alvoRot.y = 0.5 + ((e.clientX - r.left) / r.width - 0.5) * 0.5;
        alvoRot.x = ((e.clientY - r.top) / r.height - 0.5) * 0.16;
      };

      const resize = () => {
        const r = parent.getBoundingClientRect();
        const w = Math.max(1, r.width);
        const h = Math.max(1, r.height);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };

      let visivel = true;
      let raf = 0;
      const relogio = new THREE.Clock();
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visivel) return;
        const t = relogio.getElapsedTime();
        grupo.rotation.y += (alvoRot.y + t * 0.05 - grupo.rotation.y) * 0.04;
        grupo.rotation.x += (alvoRot.x - grupo.rotation.x) * 0.05;
        renderer.render(cena, camera);
      };

      const onPerda = (e: Event) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
      };

      resize();
      raf = requestAnimationFrame(tick);

      const io = new IntersectionObserver(([e]) => (visivel = e.isIntersecting), { threshold: 0 });
      io.observe(parent);
      const ro = new ResizeObserver(resize);
      ro.observe(parent);
      parent.addEventListener("pointermove", onPointer);
      renderer.domElement.addEventListener("webglcontextlost", onPerda);

      limpar = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        parent.removeEventListener("pointermove", onPointer);
        renderer.domElement.removeEventListener("webglcontextlost", onPerda);
        geos.forEach((g) => g.dispose());
        brise.dispose();
        grade.dispose();
        mat.dispose();
        matForte.dispose();
        matGrade.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelado = true;
      limpar?.();
    };
  }, [cor]);

  return <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}
