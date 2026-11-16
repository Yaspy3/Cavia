// Conteúdo das observações. Listas e descrições vêm das imagens (iPhone 16 - 20, 39, 40, 34).
// Todo item clínico leva revisao: "pendente" (revisão veterinária ainda não feita).

const pend = (itens) => itens.map((i) => ({ ...i, revisao: "pendente" }));

/** Valor considerado "normal" em cada campo (base de comparação dos alertas). */
export const NORMAL = "normal";

export const FEZES = pend([
  { id: "normal", nome: "Normal", descricao: "Cor e quantidade normal" },
  { id: "gota", nome: "Gota", descricao: "Deformado com a ponta fina" },
  { id: "empelotado", nome: "Empelotado", descricao: "Deformado e colado com outros" },
  { id: "viscoso", nome: "Viscoso", descricao: "Coberto de muco" },
  { id: "mole", nome: "Mole", descricao: "Mole ou líquido" },
  { id: "anormal", nome: "Anormal", descricao: "Coloração diferente" },
]);

export const URINA = pend([
  { id: "normal", nome: "Normal", descricao: "Coloração amarela ou transparente" },
  { id: "cor-diferente", nome: "Cor diferente", descricao: "Mais escura ou mais forte" },
  { id: "com-sangue", nome: "Com sangue", descricao: "Vermelho forte" },
  { id: "branco-turva", nome: "Branco ou turva", descricao: "Aspecto leitoso e arenoso" },
  { id: "muito-ou-pouca", nome: "Muito ou pouca", descricao: "Quantidade diferente" },
  { id: "com-esforco", nome: "Com esforço", descricao: "Demora ou com incômodo" },
]);

export const COMPORTAMENTO = pend([
  { id: "normal", nome: "Normal" },
  { id: "quieto", nome: "Quieto" },
  { id: "agitado", nome: "Agitado" },
  { id: "violento", nome: "Violento" },
]);

export const AGUA = pend([
  { id: "normal", nome: "Normal" },
  { id: "menos", nome: "Menos" },
  { id: "mais", nome: "Mais" },
]);

export const HIGIENE = [
  { id: "unhas", nome: "Corte de unhas" },
  { id: "banho", nome: "Banho" },
];

export const CAMPOS = {
  fezes: { rotulo: "Fezes", lista: FEZES },
  urina: { rotulo: "Urina", lista: URINA },
  comportamento: { rotulo: "Comportamento", lista: COMPORTAMENTO },
  agua: { rotulo: "Água", lista: AGUA },
};

export function nomeDe(campo, valor) {
  return CAMPOS[campo]?.lista.find((i) => i.id === valor)?.nome ?? "";
}
