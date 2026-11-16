// Monta o conteúdo do histórico exportado (prévia em A4). Só lê o estado; não grava nada.

import { somarDias, hoje } from "./datas.js";
import { dataCurta, gramas, variacao, idade } from "./formato.js";
import { pesagensDoAnimal } from "./regras.js";
import { CAMPOS, nomeDe } from "./conteudo/observacao.js";
import { alimentoPorId } from "./conteudo/alimentos.js";

export const ITENS = [
  { id: "peso", rotulo: "Peso" },
  { id: "observacoes", rotulo: "Observações" },
  { id: "consultas", rotulo: "Consultas e exames" },
  { id: "sintomas", rotulo: "Sintomas e ocorrências" },
  { id: "tratamentos", rotulo: "Tratamentos" },
  { id: "checkups", rotulo: "Check-ups" },
  { id: "alimentacao", rotulo: "Alimentação" },
];

export const PERIODOS = [
  { id: "30d", rotulo: "30 dias" },
  { id: "3m", rotulo: "3 meses" },
  { id: "6m", rotulo: "6 meses" },
  { id: "1a", rotulo: "1 ano" },
  { id: "pers", rotulo: "Personalizar" },
];

const DIAS = { "30d": 30, "3m": 91, "6m": 182, "1a": 365 };

/** Intervalo { de, ate } de um período. Em "pers", usa as datas dadas. */
export function intervaloDoPeriodo(periodo, de = "", ate = "") {
  const fim = hoje();
  if (periodo === "pers") return { de: de || somarDias(fim, -30), ate: ate || fim };
  return { de: somarDias(fim, -(DIAS[periodo] ?? 91)), ate: fim };
}

const MOTIVOS = { rotina: "Rotina", sintoma: "Sintoma", "pos-operatorio": "Pós-operatório", outro: "Outro" };
const SEXO = { femea: "Fêmea", macho: "Macho" };
const vazio = "—";

const dentro = (data, de, ate) => !!data && data >= de && data <= ate;
const porData = (a, b) => a.data.localeCompare(b.data);

function secaoAnimal(estado, animal, itens, de, ate) {
  const secoes = [];
  if (itens.includes("peso")) {
    const todas = pesagensDoAnimal(estado, animal.id);
    const linhas = todas.map((p, i) => ({ p, ant: todas[i - 1] })).filter(({ p }) => dentro(p.data, de, ate))
      .map(({ p, ant }) => [dataCurta(p.data), gramas(p.gramas), ant ? variacao(p.gramas - ant.gramas) + " g" : vazio]);
    secoes.push({ titulo: "Peso", colunas: ["Data", "Peso", "Variação"], linhas });
  }
  if (itens.includes("observacoes")) {
    const linhas = estado.observacoes.filter((o) => o.alvo === "animal" && o.alvoId === animal.id && dentro(o.data, de, ate)).sort(porData)
      .map((o) => [dataCurta(o.data), nomeDe("fezes", o.fezes) || vazio, nomeDe("urina", o.urina) || vazio, nomeDe("comportamento", o.comportamento) || vazio]);
    secoes.push({ titulo: "Observações", colunas: ["Data", "Fezes", "Urina", "Comportamento"], linhas });
  }
  if (itens.includes("consultas")) {
    const linhas = estado.consultas.filter((c) => c.animalId === animal.id && dentro(c.data, de, ate)).sort(porData)
      .map((c) => [dataCurta(c.data), c.tipo === "exame" ? "Exame" : "Consulta", c.clinica || vazio, MOTIVOS[c.motivo] ?? (c.motivo || vazio), c.orientacao || vazio]);
    secoes.push({ titulo: "Consultas e exames", colunas: ["Data", "Tipo", "Veterinário ou clínica", "Motivo", "Orientação"], linhas });
  }
  if (itens.includes("sintomas")) {
    const linhas = estado.sintomas.filter((s) => s.animalId === animal.id && dentro(s.data, de, ate)).sort(porData)
      .map((s) => [dataCurta(s.data), (s.sintomas ?? []).join(", ") || vazio, s.nota || vazio]);
    secoes.push({ titulo: "Sintomas e ocorrências", colunas: ["Data", "O que foi notado", "Observação"], linhas });
  }
  if (itens.includes("tratamentos")) {
    const linhas = estado.tratamentos.filter((t) => {
      const fim = t.inicio ? somarDias(t.inicio, Math.max(0, (t.dias || 1) - 1)) : null;
      return t.animalId === animal.id && t.inicio && t.inicio <= ate && fim >= de;
    }).sort((a, b) => a.inicio.localeCompare(b.inicio))
      .map((t) => [t.nome, t.dose || vazio, `${t.vezesPorDia}x ao dia`, dataCurta(t.inicio), t.dias ? `${t.dias} dias` : vazio]);
    secoes.push({ titulo: "Tratamentos", colunas: ["Medicamento ou tratamento", "Dose (conforme a receita)", "Vezes por dia", "Início", "Duração"], linhas });
  }
  if (itens.includes("checkups")) {
    const linhas = estado.checkups.filter((c) => c.animalId === animal.id && dentro(c.data, de, ate)).sort(porData).map((c) => {
      const atencao = Object.entries(c.itens ?? {}).filter(([, v]) => v !== "normal").map(([k]) => k);
      return [dataCurta(c.data), atencao.length ? `Atenção: ${atencao.join(", ")}` : "Tudo normal"];
    });
    secoes.push({ titulo: "Check-ups", colunas: ["Data", "Resultado"], linhas });
  }
  return secoes;
}

function secoesGrupo(estado, grupo, itens, de, ate) {
  const secoes = [];
  if (itens.includes("observacoes")) {
    const linhas = estado.observacoes.filter((o) => o.alvo === "grupo" && o.alvoId === grupo.id && dentro(o.data, de, ate)).sort(porData)
      .map((o) => [dataCurta(o.data), nomeDe("agua", o.agua) || vazio, nomeDe("comportamento", o.comportamento) || vazio, nomeDe("fezes", o.fezes) || vazio, nomeDe("urina", o.urina) || vazio]);
    secoes.push({ titulo: "Observações do grupo", colunas: ["Data", "Água", "Comportamento", "Fezes", "Urina"], linhas });
  }
  if (itens.includes("alimentacao")) {
    const linhas = estado.alimentacao.filter((r) => r.grupoId === grupo.id && dentro(r.data, de, ate)).sort(porData)
      .map((r) => [dataCurta(r.data), r.alimentos.map((id) => alimentoPorId(id)?.nome ?? id).join(", ") || vazio, r.feno ? "Sim" : "Não", r.racao ? "Sim" : "Não"]);
    secoes.push({ titulo: "Alimentação", colunas: ["Data", "Vegetais e frutas", "Feno", "Ração"], linhas });
  }
  return secoes;
}

/**
 * Conteúdo do histórico. `alvo` = "animal" | "grupo"; `id` = animal ou grupo; `itens` = ids de ITENS.
 * Devolve { titulo, linhasInfo, blocos: [{ titulo, secoes }] } ou null se o alvo não existe.
 */
export function montarHistorico(estado, { alvo, id, de, ate, itens }) {
  if (alvo === "animal") {
    const animal = estado.animais.find((a) => a.id === id);
    if (!animal) return null;
    const grupo = estado.grupos.find((g) => g.id === animal.grupoId);
    const info = [`Grupo: ${grupo?.nome ?? vazio}`, `Sexo: ${SEXO[animal.sexo] ?? vazio}`, `Idade: ${animal.nascimento ? idade(animal.nascimento) : vazio}`, `Raça: ${animal.raca || vazio}`];
    return { titulo: animal.nome, tipo: "Histórico do animal", info, blocos: [{ titulo: null, secoes: secaoAnimal(estado, animal, itens, de, ate) }] };
  }
  const grupo = estado.grupos.find((g) => g.id === id);
  if (!grupo) return null;
  const animais = grupo.animais.map((aid) => estado.animais.find((a) => a.id === aid)).filter((a) => a && !a.arquivado);
  const blocos = [];
  const doGrupo = secoesGrupo(estado, grupo, itens, de, ate);
  if (doGrupo.length) blocos.push({ titulo: "Dados do grupo", secoes: doGrupo });
  for (const a of animais) {
    const s = secaoAnimal(estado, a, itens, de, ate);
    if (s.length) blocos.push({ titulo: a.nome, secoes: s });
  }
  return { titulo: grupo.nome, tipo: "Histórico do grupo", info: [`Animais: ${animais.map((a) => a.nome).join(", ") || vazio}`], blocos };
}

export { CAMPOS };
