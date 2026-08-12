"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de partículas em WebGL (three.js) para o hero e a seção de conversão
 * da LP-C.
 *
 * A cor padrão é um verde claro, não o verde da marca: o blending é aditivo,
 * então um tom escuro praticamente desaparece sobre as áreas claras da
 * fachada. O verde claro soma luz e se lê tanto no escuro quanto no claro,
 * mantendo a família cromática.
 *
 * A animação inteira roda no shader de vértice: cada mote sobe, oscila e
 * cintila a partir da própria semente, e a repulsão ao ponteiro é calculada
 * na GPU. A CPU só atualiza dois uniforms por quadro, o que permite ordem de
 * mil partículas com custo baixo — bem acima do que o canvas 2D sustentaria.
 *
 * Sistema de coordenadas: câmera ortográfica em pixels, com Y para baixo,
 * igual ao DOM. Assim a posição do ponteiro entra no shader sem conversão.
 *
 * Degrada em silêncio: sem WebGL, com prefers-reduced-motion, ou se o
 * contexto se perder, a seção simplesmente fica sem a camada — o conteúdo
 * embaixo não depende dela.
 */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uRes;
  uniform vec2  uPointer;
  uniform float uRaio;
  uniform float uDpr;

  attribute float aSeed;
  attribute float aSize;
  attribute float aVel;
  attribute float aAlpha;

  varying float vAlpha;

  void main() {
    float x = position.x + sin(uTime * 0.32 + aSeed * 6.2831) * 7.0;

    // Sobe continuamente e reentra por baixo (altura + margem).
    float span = uRes.y + 40.0;
    float y = mod(position.y - uTime * aVel, span) - 20.0;

    vec2 pos = vec2(x, y);

    // Repulsão: empurra o mote para fora do raio do ponteiro.
    vec2 d = pos - uPointer;
    float dist = length(d);
    if (dist < uRaio && dist > 0.001) {
      float forca = pow(1.0 - dist / uRaio, 2.0);
      pos += normalize(d) * forca * 46.0;
    }

    // Cintilação lenta, dessincronizada por partícula.
    vAlpha = aAlpha * (0.55 + 0.45 * sin(uTime * 0.9 + aSeed * 12.566));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 0.0, 1.0);
    gl_PointSize = aSize * uDpr;
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uCor;
  varying float vAlpha;

  void main() {
    // Disco suave: sem textura, sem requisição extra.
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uCor, a * vAlpha);
  }
`;

export default function ParticleField({
  density = 900,
  cor = "#7FEBC8",
}: {
  density?: number;
  cor?: string;
}) {
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
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch {
        return; // sem WebGL: a seção fica sem a camada
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr);
      renderer.setClearAlpha(0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
      host.appendChild(renderer.domElement);

      const cena = new THREE.Scene();
      // Ortográfica em pixels, Y para baixo (igual ao DOM).
      const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1);

      let w = 0;
      let h = 0;
      const geo = new THREE.BufferGeometry();

      const povoar = () => {
        // Densidade proporcional à área, com teto — telas pequenas não
        // precisam do mesmo número de motes que um monitor grande.
        const n = Math.max(160, Math.min(density, Math.round((w * h) / 1500)));
        const pos = new Float32Array(n * 3);
        const seed = new Float32Array(n);
        const size = new Float32Array(n);
        const vel = new Float32Array(n);
        const alpha = new Float32Array(n);

        for (let i = 0; i < n; i++) {
          pos[i * 3] = Math.random() * w;
          pos[i * 3 + 1] = Math.random() * (h + 40);
          pos[i * 3 + 2] = 0;
          seed[i] = Math.random();
          size[i] = 2.0 + Math.random() * 5.0;
          vel[i] = 8 + Math.random() * 22;
          alpha[i] = 0.22 + Math.random() * 0.72;
        }

        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
        geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        geo.setAttribute("aVel", new THREE.BufferAttribute(vel, 1));
        geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
      };

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: new THREE.Vector2(1, 1) },
          uPointer: { value: new THREE.Vector2(-9999, -9999) },
          uRaio: { value: 150 },
          uDpr: { value: dpr },
          uCor: { value: new THREE.Color(cor) },
        },
      });

      const pontos = new THREE.Points(geo, mat);
      cena.add(pontos);

      const resize = () => {
        const r = parent.getBoundingClientRect();
        w = Math.max(1, r.width);
        h = Math.max(1, r.height);
        renderer.setSize(w, h, false);
        camera.left = 0;
        camera.right = w;
        camera.top = 0;
        camera.bottom = h;
        camera.updateProjectionMatrix();
        mat.uniforms.uRes.value.set(w, h);
        povoar();
      };

      const onPointer = (e: PointerEvent) => {
        const r = parent.getBoundingClientRect();
        mat.uniforms.uPointer.value.set(e.clientX - r.left, e.clientY - r.top);
      };
      const onLeave = () => mat.uniforms.uPointer.value.set(-9999, -9999);

      let visivel = true;
      let raf = 0;
      const relogio = new THREE.Clock();

      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visivel) return;
        mat.uniforms.uTime.value = relogio.getElapsedTime();
        renderer.render(cena, camera);
      };

      const onPerdaContexto = (e: Event) => {
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
      parent.addEventListener("pointerleave", onLeave);
      renderer.domElement.addEventListener("webglcontextlost", onPerdaContexto);

      limpar = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        parent.removeEventListener("pointermove", onPointer);
        parent.removeEventListener("pointerleave", onLeave);
        renderer.domElement.removeEventListener("webglcontextlost", onPerdaContexto);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelado = true;
      limpar?.();
    };
  }, [density, cor]);

  return <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[5]" />;
}
