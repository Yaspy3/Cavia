// Texto dos alertas (Início e Peso do animal): resumo curto, título e linha do aviso de urgência
// e o "o que fazer". Os textos são provisórios (revisão veterinária pendente).

import { animalPorId } from "./acoes.js";
import { icone } from "./icones.js";
import { esc } from "./ui.js";
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

/**
 * Aviso visual de um alerta (perfil do animal e telas de registro): caixa vermelha para urgência,
 * amarela para atenção; primeira linha em negrito e, abaixo, a orientação.
 * `semNome`: tira o nome do animal do título (no perfil dele já se sabe de quem é).
 */
export function avisoDeAlerta(a, { semNome = false } = {}) {
  const d = descreverAlerta(a);
  let titulo = d.titulo;
  if (semNome && titulo.startsWith(`${d.animal.nome}: `)) {
    titulo = titulo.slice(d.animal.nome.length + 2);
    titulo = titulo.charAt(0).toUpperCase() + titulo.slice(1);
  }
  const urgente = d.nivel === "urgente";
  return `<div class="ds-notice ds-notice--${urgente ? "urgente" : "atencao"}" role="note" data-revisao="pendente">
    <span class="ds-notice__icone">${icone("alerta", { tamanho: 22 })}</span>
    <p><strong>${esc(titulo)}</strong><br>${esc(urgente ? d.linha : d.orientacao)}</p></div>`;
}

/**
 * Depois de salvar um registro que gerou alertas de atenção: esconde o formulário e mostra, na própria
 * tela de registro, o aviso e o "o que fazer", com atalho para o Diário do animal e para o Início.
 */
export function mostrarResultadoComAlertas({ form, titulo, alertas, animalId, destino }) {
  form.hidden = true;
  const resultado = document.createElement("section");
  resultado.className = "form registro-resultado";
  resultado.setAttribute("aria-labelledby", "t-salvo");
  resultado.innerHTML = `
    <h2 class="t-title" id="t-salvo" tabindex="-1">${esc(titulo)}</h2>
    ${alertas.map((a) => avisoDeAlerta(a)).join("")}
    <a class="ds-button ds-button--registrar ds-button--bloco" href="animal.html?id=${encodeURIComponent(animalId)}&aba=diario">Ver o diário de ${esc(animalPorId(animalId).nome)}</a>
    <a class="ds-button ds-button--contorno ds-button--bloco" href="${esc(destino)}">Voltar ao início</a>`;
  form.after(resultado);
  resultado.querySelector("#t-salvo").focus();
}
