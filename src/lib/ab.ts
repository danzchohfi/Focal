// Mecanismo de teste A/B para landing pages (client-side, compatível com
// export estático). Atribuição sticky em localStorage, override por ?v=,
// eventos via dataLayer/gtag (src/lib/track.ts).
//
// Para criar uma nova variação: adicionar a rota da página e uma entrada em
// `variants` com o peso desejado (os pesos são normalizados). A variante
// cujo path é o da página "canônica" não redireciona.

export type AbVariant = {
  id: string;
  /** Path da página da variante (sem basePath) */
  path: string;
  /** Peso relativo no sorteio (ex.: 50/50) */
  weight: number;
};

export type AbExperiment = {
  id: string;
  /** Página de entrada (recebe o tráfego de mídia e faz o sorteio) */
  entryPath: string;
  variants: AbVariant[];
};

export const experiments: AbExperiment[] = [
  {
    id: "artur73_lp",
    entryPath: "/artur-73",
    variants: [
      { id: "a", path: "/artur-73", weight: 50 },
      { id: "b", path: "/artur-73-b", weight: 50 },
    ],
  },
];

export function getExperiment(id: string) {
  return experiments.find((e) => e.id === id);
}

/**
 * Gera o script inline do splitter, executado ANTES do paint na página de
 * entrada do experimento: lê override ?v=, atribui variante sticky, registra
 * ab_assign na primeira atribuição e redireciona quando a variante sorteada
 * não é a da página atual.
 */
export function splitterScript(exp: AbExperiment, basePath: string, currentVariantId: string) {
  const cfg = JSON.stringify(
    exp.variants.map((v) => ({ id: v.id, path: `${basePath}${v.path}/`, weight: v.weight }))
  );
  return `(function(){try{
var exp=${JSON.stringify(exp.id)},cur=${JSON.stringify(currentVariantId)},vs=${cfg},k='ab_'+exp;
var qs=new URLSearchParams(location.search),f=qs.get('v');
var valid=vs.map(function(x){return x.id});
var v=(f&&valid.indexOf(f)>-1)?f:localStorage.getItem(k);
var fresh=false;
if(!v||valid.indexOf(v)===-1){var t=vs.reduce(function(s,x){return s+x.weight},0),r=Math.random()*t;for(var i=0;i<vs.length;i++){r-=vs[i].weight;if(r<=0){v=vs[i].id;break}}v=v||vs[0].id;fresh=true;}
try{localStorage.setItem(k,v)}catch(e){}
window.__ab=window.__ab||{};window.__ab[exp]=v;
window.dataLayer=window.dataLayer||[];
if(fresh){dataLayer.push({event:'ab_assign',experiment:exp,variant:v});}
if(v!==cur){var d=vs.filter(function(x){return x.id===v})[0];if(d){location.replace(d.path+location.search+location.hash);}}
}catch(e){}})();`;
}
