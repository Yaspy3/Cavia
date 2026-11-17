// Texto dos alertas (Início e Peso do animal): resumo curto, título e linha do aviso de urgência
// e o "o que fazer". Os textos são provisórios (revisão veterinária pendente).

import { animalPorId } from "./acoes.js";
import { OQUE_FAZER } from "./conteudo/oque-fazer.js";
import { CAMPOS, nomeDe } from "./conteudo/observacao.js";
import { itemCheckup } from "./conteudo/checkup.js";

const dias = (n) => `${n} ${n === 1 ? "dia" : "dias"}`;

/**
 * Descreve um alerta. Devolve:
 * { nivel, animal, resumo (uma linha curta), titulo e linha (aviso de urgência), orientacao (o que fazer) }.
 */
export function descreverAlerta(a) {
  const animal = animalPorId(a.animalId);
  const nivel = a.nivel ?? "atencao";
  if (a.tipo === "peso") {
    const perdeu = a.delta < 0;
    const gramas = Math.abs(a.delta);
    const verbo = perdeu ? "caiu" : "subiu";
    const orientacao = nivel === "urgente"
      ? OQUE_FAZER.peso.urgencia
      : perdeu ? OQUE_FAZER.peso.texto(gramas) : OQUE_FAZER.peso.textoGanho(gramas);
    return {
      nivel, animal, orientacao,
      resumo: `${animal.nome}: peso ${verbo} ${gramas} g`,
      titulo: `${animal.nome}: peso ${verbo} ${Math.round(Math.abs(a.pct))}% em ${dias(a.dias)}`,
      linha: OQUE_FAZER.peso.urgencia,
    };
  }
  if (a.tipo === "checkup") {
    const itens = a.itens.map((i) => itemCheckup(i)?.rotulo ?? i).join(", ").toLowerCase();
    return { nivel, animal, resumo: `${animal.nome}: check-up com atenção`, titulo: `${animal.nome}: check-up com atenção (${itens})`, linha: OQUE_FAZER.peso.urgencia, orientacao: OQUE_FAZER.checkup.texto };
  }
  const resumo = `${animal.nome}: ${CAMPOS[a.campo].rotulo.toLowerCase()} ${nomeDe(a.campo, a.valor).toLowerCase()}`;
  return { nivel, animal, resumo, titulo: resumo, linha: OQUE_FAZER.peso.urgencia, orientacao: OQUE_FAZER.observacao.texto };
}
