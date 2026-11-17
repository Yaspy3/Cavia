// Regras de alerta e de vencimento. TODAS PROVISÓRIAS: dependem de fonte veterinária.
// Constantes nomeadas e comentário em cada uma. Fase 1: só o vencimento do check-up.
// As regras de alerta de observação e de peso entram na Fase 3.

import { diasEntre, somarDias, hoje as hojeAtual } from "./datas.js";

// PROVISÓRIO: não é recomendação clínica
export const CHECKUP_PADRAO_DIAS = 7;

// PROVISÓRIO: não é recomendação clínica. Variação de peso (em %) dentro de uma janela curta de tempo:
// a partir de PESO_ATENCAO_PCT aparece um alerta de ATENÇÃO e a partir de PESO_URGENCIA_PCT, um alerta de URGÊNCIA.
// A janela é de até PESO_JANELA_DIAS dias entre a pesagem mais recente e uma pesagem anterior.
export const PESO_ATENCAO_PCT = 5;
export const PESO_URGENCIA_PCT = 10;
export const PESO_JANELA_DIAS = 7;

// PROVISÓRIO: não é recomendação clínica. Diferença (em %) em relação à última pesagem
// a partir da qual o formulário pede para conferir a balança (igual ao limite de urgência).
export const AVISO_DIFERENCA_PCT = 10;

// PROVISÓRIO: não é recomendação clínica. Acima disso o valor "parece alto" (provável erro de unidade).
export const LIMITE_GRAMAS_ALTO = 2000;

/** Pesagens de um animal, da mais antiga para a mais nova. */
export function pesagensDoAnimal(estado, animalId) {
  return estado.pesagens.filter((p) => p.animalId === animalId).sort((a, b) => a.data.localeCompare(b.data));
}

/**
 * Maior variação entre a pesagem mais recente e as pesagens dos PESO_JANELA_DIAS dias anteriores.
 * Devolve { anterior, atual, delta, pct, dias } ou null (sem pesagem anterior na janela).
 */
export function variacaoPeso(pesagens) {
  const ultima = pesagens.at(-1);
  if (!ultima || pesagens.length < 2) return null;
  let melhor = null;
  for (const p of pesagens.slice(0, -1)) {
    const dias = diasEntre(p.data, ultima.data);
    if (dias < 1 || dias > PESO_JANELA_DIAS) continue;
    const pct = ((ultima.gramas - p.gramas) / p.gramas) * 100;
    if (!melhor || Math.abs(pct) > Math.abs(melhor.pct)) melhor = { anterior: p.gramas, atual: ultima.gramas, delta: ultima.gramas - p.gramas, pct, dias };
  }
  return melhor;
}

/** "urgente" (variação >= 10%), "atencao" (>= 5%) ou null. */
export function nivelDaVariacao(v) {
  if (!v) return null;
  const abs = Math.abs(v.pct);
  return abs >= PESO_URGENCIA_PCT ? "urgente" : abs >= PESO_ATENCAO_PCT ? "atencao" : null;
}

/** "sem-peso" | "estavel" | "atencao" | "urgente" (pesagem recente com variação acima dos limites provisórios). */
export function statusPeso(estado, animalId) {
  const pesagens = pesagensDoAnimal(estado, animalId);
  if (!pesagens.length) return "sem-peso";
  if (diasEntre(pesagens.at(-1).data, hojeAtual()) > ALERTA_PESO_VALIDADE_DIAS) return "estavel";
  return nivelDaVariacao(variacaoPeso(pesagens)) ?? "estavel";
}
/**
 * Confere o peso digitado. Devolve null (tudo certo) ou { codigo, texto }.
 * Não bloqueia o salvamento: só pede para conferir.
 */
export function avaliarPeso(pesagensAnteriores, gramas) {
  if (gramas > LIMITE_GRAMAS_ALTO) {
    return { codigo: "alto", texto: "O valor parece alto. Confira se está em gramas." };
  }
  const ultima = pesagensAnteriores[pesagensAnteriores.length - 1];
  if (ultima && (Math.abs(gramas - ultima.gramas) / ultima.gramas) * 100 >= AVISO_DIFERENCA_PCT) {
    return { codigo: "diferenca", texto: "Diferença maior do que o usual, confira a balança antes de salvar." };
  }
  return null;
}

/**
 * Check-ups vencidos ou que vencem hoje.
 * Animal sem nenhum check-up registrado não entra (não há o que comparar).
 * Devolve [{ animalId, proximo, atrasoDias }], com atrasoDias >= 0.
 */
export function checkupsVencidos(estado, hoje) {
  const resultado = [];
  for (const animal of estado.animais) {
    if (animal.arquivado) continue;
    const feitos = estado.checkups.filter((c) => c.animalId === animal.id).map((c) => c.data).sort();
    if (!feitos.length) continue;
    const freq = estado.checkupFrequencia.porAnimal[animal.id]
      ?? estado.checkupFrequencia.padraoDias ?? CHECKUP_PADRAO_DIAS;
    const proximo = somarDias(feitos[feitos.length - 1], freq);
    const atrasoDias = diasEntre(proximo, hoje);
    if (atrasoDias >= 0) resultado.push({ animalId: animal.id, proximo, atrasoDias });
  }
  return resultado;
}


// ---------------------------------------------------------------------------
// Alertas (Fase 3). Calculados na hora a partir dos registros: nada é guardado,
// por isso o alerta some sozinho quando entra um registro novo e normal.
// ---------------------------------------------------------------------------

// PROVISÓRIO: não é recomendação clínica. Janela de registros usada como "padrão" do animal.
export const OBS_JANELA_DIAS = 14;
// PROVISÓRIO: não é recomendação clínica. Por quantos dias um alerta de observação continua valendo.
export const ALERTA_OBS_VALIDADE_DIAS = 2;
// PROVISÓRIO: não é recomendação clínica. Por quantos dias um alerta de peso continua valendo.
export const ALERTA_PESO_VALIDADE_DIAS = 7;

const CAMPOS_OBS = ["fezes", "urina", "comportamento"];
const NORMAL = "normal";

function moda(valores) {
  const contagem = new Map();
  for (const v of valores) contagem.set(v, (contagem.get(v) ?? 0) + 1);
  let melhor = null;
  for (const [v, n] of contagem) if (melhor === null || n > contagem.get(melhor)) melhor = v;
  return melhor;
}

/**
 * Alertas de observação: compara o registro mais recente de cada animal com o padrão dos
 * registros anteriores (últimos OBS_JANELA_DIAS dias; sem histórico, o padrão é "normal").
 * Só há alerta se o valor não é "normal" E é diferente do padrão do animal.
 * Sintomas e ocorrências NUNCA entram aqui.
 */
export function alertasDeObservacao(estado, hoje) {
  const alertas = [];
  for (const animal of estado.animais) {
    if (animal.arquivado) continue;
    const registros = estado.observacoes
      .filter((o) => o.alvo === "animal" && o.alvoId === animal.id && o.data <= hoje)
      .sort((a, b) => a.data.localeCompare(b.data));
    const ultimo = registros.at(-1);
    if (!ultimo || diasEntre(ultimo.data, hoje) > ALERTA_OBS_VALIDADE_DIAS) continue;
    const anteriores = registros.slice(0, -1).filter((o) => diasEntre(o.data, ultimo.data) <= OBS_JANELA_DIAS);
    for (const campo of CAMPOS_OBS) {
      const valor = ultimo[campo];
      if (!valor || valor === NORMAL) continue;
      const padrao = moda(anteriores.map((o) => o[campo]).filter(Boolean)) ?? NORMAL;
      if (valor !== padrao) {
        alertas.push({ id: `obs-${animal.id}-${campo}`, tipo: "observacao", animalId: animal.id, campo, valor, data: ultimo.data });
      }
    }
  }
  return alertas;
}

/**
 * Alertas de peso: variação de 5% ou mais (atenção) ou de 10% ou mais (urgência) em até 7 dias,
 * para cima ou para baixo, enquanto a pesagem é recente.
 */
export function alertasDePeso(estado, hoje) {
  const alertas = [];
  for (const animal of estado.animais) {
    if (animal.arquivado) continue;
    const pesagens = pesagensDoAnimal(estado, animal.id);
    const ultima = pesagens.at(-1);
    if (!ultima || diasEntre(ultima.data, hoje) > ALERTA_PESO_VALIDADE_DIAS) continue;
    const v = variacaoPeso(pesagens);
    const nivel = nivelDaVariacao(v);
    if (nivel) alertas.push({ id: `peso-${animal.id}`, tipo: "peso", nivel, animalId: animal.id, delta: v.delta, pct: v.pct, dias: v.dias, data: ultima.data });
  }
  return alertas;
}
/** Todos os alertas (de peso e de observação), dos animais dos grupos pedidos (ou de todos). */
export function alertas(estado, hoje, grupoId = null) {
  const ids = grupoId ? new Set(estado.grupos.find((g) => g.id === grupoId)?.animais ?? []) : null;
  const todos = [...alertasDePeso(estado, hoje), ...alertasDeObservacao(estado, hoje), ...alertasDeCheckup(estado, hoje)]
    .filter((a) => !ids || ids.has(a.animalId));
  return todos.sort((x, y) => Number(y.nivel === "urgente") - Number(x.nivel === "urgente")); // urgência primeiro
}

/** Alertas de check-up: o check-up mais recente do animal tem item com atenção (vale por alguns dias). */
export function alertasDeCheckup(estado, hoje) {
  const alertas = [];
  for (const animal of estado.animais) {
    if (animal.arquivado) continue;
    const ultimo = estado.checkups.filter((c) => c.animalId === animal.id && c.data <= hoje).sort((a, b) => a.data.localeCompare(b.data)).at(-1);
    if (!ultimo || diasEntre(ultimo.data, hoje) > ALERTA_CHECKUP_VALIDADE_DIAS) continue;
    const itens = Object.entries(ultimo.itens ?? {}).filter(([, v]) => v !== "normal").map(([k]) => k);
    if (itens.length) alertas.push({ id: `checkup-${animal.id}`, tipo: "checkup", animalId: animal.id, itens, data: ultimo.data });
  }
  return alertas;
}

// PROVISÓRIO: não é recomendação clínica. Por quantos dias um alerta de check-up continua valendo.
export const ALERTA_CHECKUP_VALIDADE_DIAS = 7;