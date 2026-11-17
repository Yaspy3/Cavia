// "O que fazer" dos alertas. TEXTOS PROVISÓRIOS: dependem de revisão veterinária.
// O app registra e orienta; nunca sugere dose, tratamento caseiro ou diagnóstico.

export const OQUE_FAZER = {
  // Texto da imagem iPhone 16 - 5 (texto final).
  peso: {
    revisao: "pendente",
    texto: (gramas) => `Seu porquinho perdeu ${gramas} g. Pese de novo amanhã e fique de olho no apetite.`,
    textoGanho: (gramas) => `Seu porquinho ganhou ${gramas} g em poucos dias. Pese de novo amanhã e confira a balança.`,
    // Texto do aviso de urgência (mesma frase da imagem de sintomas).
    urgencia: "Procure um veterinário, sem esperar piorar",
  },
  checkup: {
    revisao: "pendente",
    texto: "Olhe esse item de novo nos próximos dias e registre. Se continuar ou piorar, procure um veterinário.",
  },
  observacao: {
    revisao: "pendente",
    texto: "Observe o seu porquinho nas próximas horas e registre de novo amanhã. Se a mudança continuar ou ele piorar, procure um veterinário.",
  },
};
