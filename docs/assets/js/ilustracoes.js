// Ilustrações das opções de fezes e urina: SVGs exportados do Figma pela designer, em assets/img/obs/.
// Tamanhos em px do quadro de 393 px (os do próprio arquivo SVG). Sempre decorativas (aria-hidden).
// "Fezes anormal" usa a forma de "Fezes normal" em verde (cor do desenho anterior).

const TAMANHOS = {"fezes":{"normal":{"w":40,"h":27},"gota":{"w":39,"h":30},"empelotado":{"w":36,"h":19},"viscoso":{"w":48,"h":25},"mole":{"w":37,"h":17},"anormal":{"w":40,"h":27}},"urina":{"normal":{"w":22,"h":27},"cor-diferente":{"w":22,"h":27},"com-sangue":{"w":22,"h":27},"branco-turva":{"w":22,"h":27},"muito-ou-pouca":{"w":28,"h":27},"com-esforco":{"w":44.2,"h":29.7}}};

// Formato de cada desenho: vetor (SVG exportado do Figma) ou PNG (só "com esforço", ainda sem SVG).
const PNG = new Set(["urina/com-esforco"]);

/** Imagem da ilustração. `campo` = "fezes" ou "urina"; `id` = tipo escolhido; `tamanho` = escala (40 = tamanho da tela de Observação). */
export function ilustracao(campo, id, tamanho = 40) {
  const d = TAMANHOS[campo]?.[id];
  if (!d) return "";
  const f = tamanho / 40;
  return `<img class="obs-arte" src="../assets/img/obs/${campo}-${id}.${PNG.has(`${campo}/${id}`) ? "png" : "svg"}" alt="" width="${(d.w * f).toFixed(1)}" height="${(d.h * f).toFixed(1)}" aria-hidden="true">`;
}