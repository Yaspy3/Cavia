// Ilustrações das opções de fezes e urina: recortadas dos desenhos da designer (imagens de referência
// "Fezes" e "Urina"), com fundo transparente. Ficam em assets/img/obs/ (arquivos em 2x).
// Tamanhos em px do quadro de 393 px. Sempre decorativas (aria-hidden).

const TAMANHOS = {"fezes":{"normal":{"w":41.6,"h":29.7},"gota":{"w":45,"h":35.7},"empelotado":{"w":41.6,"h":24.6},"viscoso":{"w":51,"h":28},"mole":{"w":41.6,"h":22.1},"anormal":{"w":41.6,"h":30.6}},"urina":{"normal":{"w":27.2,"h":32.3},"cor-diferente":{"w":26.3,"h":32.3},"com-sangue":{"w":27.2,"h":32.3},"branco-turva":{"w":26.3,"h":32.3},"muito-ou-pouca":{"w":34,"h":32.3},"com-esforco":{"w":44.2,"h":29.7}}};

/** Imagem da ilustração. `campo` = "fezes" ou "urina"; `id` = tipo escolhido; `tamanho` = escala (40 = tamanho da tela de Observação). */
export function ilustracao(campo, id, tamanho = 40) {
  const d = TAMANHOS[campo]?.[id];
  if (!d) return "";
  const f = tamanho / 40;
  return `<img class="obs-arte" src="../assets/img/obs/${campo}-${id}.png" alt="" width="${(d.w * f).toFixed(1)}" height="${(d.h * f).toFixed(1)}" aria-hidden="true">`;
}