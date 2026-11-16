// Sintomas e ocorrências (imagem iPhone 16 - 24). Lista da imagem; não completar por conta própria.
// `urgente`: mostra a orientação direta na própria tela. Só "Respiração difícil" está assim na imagem.
// Sintomas NUNCA geram alerta. Tudo com revisao: "pendente".

export const SINTOMAS = [
  { id: "espirros", nome: "Espirros" },
  { id: "respiracao-dificil", nome: "Respiração difícil", urgente: true,
    orientacao: { titulo: "Respiração difícil ou com ruído pode ser urgente.", texto: "Procure um veterinário, sem esperar piorar" } },
  { id: "perda-de-pelo", nome: "Perda de pelo" },
  { id: "olhos-com-secrecao", nome: "Olhos com secreção" },
  { id: "coceira", nome: "Coceira" },
  { id: "mancando", nome: "Mancando" },
  { id: "caroco", nome: "Caroço" },
  { id: "nao-quer-comer", nome: "Não quer comer" },
  { id: "outro", nome: "Outro" },
].map((s) => ({ ...s, revisao: "pendente" }));

export const MOTIVOS = [
  { id: "rotina", nome: "Rotina" },
  { id: "sintoma", nome: "Sintoma" },
  { id: "pos-operatorio", nome: "Pós-operatório" },
  { id: "outro", nome: "Outro" },
];

export const nomeSintoma = (id) => SINTOMAS.find((s) => s.id === id)?.nome ?? id;
