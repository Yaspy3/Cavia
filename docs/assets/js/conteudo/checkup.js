// Roteiro do check-up (imagens iPhone 16 - 28 e 36). Itens e agrupamento vêm da imagem
// (a lista das instruções tinha também "caroços e barriga" e "peso"; segue-se a imagem).
// `achados`: opções do pop-up "O que você viu?". Só "Boca e dentes" tem lista na imagem 36;
// nos outros itens só há a observação livre. `olhar`: texto de "como olhar", ainda a escrever com
// a revisão veterinária. Tudo com revisao: "pendente".

export const GRUPOS_CHECKUP = [
  { id: "cabeca", rotulo: "Cabeça", itens: ["olhos", "orelhas", "nariz", "boca"] },
  { id: "corpo", rotulo: "Corpo", itens: ["pele", "patas", "tras"] },
];

export const ITENS_CHECKUP = [
  { id: "olhos", rotulo: "Olhos", icone: "olho" },
  { id: "orelhas", rotulo: "Orelhas", icone: "orelha" },
  { id: "nariz", rotulo: "Nariz", icone: "nariz" },
  {
    id: "boca", rotulo: "Boca e dentes", icone: "dente",
    achados: ["Dentes compridos", "Dentes quebrados", "Dentes tortos", "Baba", "Ferida ou vermelhidão", "Outro"],
  },
  { id: "pele", rotulo: "Pele e pelo", icone: "pelo" },
  { id: "patas", rotulo: "Patas e unhas", icone: "pata" },
  { id: "tras", rotulo: "Parte de trás", icone: "asterisco" },
].map((i) => ({
  achados: [], olhar: "Orientação sobre como olhar este item em validação com a veterinária.", revisao: "pendente", ...i,
}));

export const itemCheckup = (id) => ITENS_CHECKUP.find((i) => i.id === id) ?? null;
