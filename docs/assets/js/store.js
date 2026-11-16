// Único ponto de acesso ao localStorage. As telas NUNCA acessam o localStorage direto.
// Chave: cavia:v1. O estado tem versão e uma função de migração.

import { estadoVazio, criarExemplo, VERSAO_ESTADO } from "./seed.js";
export { hoje, definirHoje, diaSimulado, somarDias, diasEntre, dataLocal, paraData } from "./datas.js";

const CHAVE = "cavia:v1";
const assinantes = new Set();
let estado = null;
let emMemoria = false;

/** Leva um estado antigo até a versão atual, sem perder dados. */
function migrar(e) {
  if (!e || typeof e !== "object") return estadoVazio();
  // Exemplo para o futuro: if (e.versao < 2) { ...ajusta e.versao = 2; }
  const base = estadoVazio();
  const migrado = { ...base, ...e, versao: VERSAO_ESTADO };
  for (const chave of Object.keys(base)) {
    if (migrado[chave] === undefined) migrado[chave] = base[chave];
  }
  return migrado;
}

function avisarErro(motivo) {
  emMemoria = true;
  window.dispatchEvent(new CustomEvent("cavia:erro-armazenamento", { detail: motivo }));
}

function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? migrar(JSON.parse(bruto)) : estadoVazio();
  } catch {
    avisarErro("leitura");
    return estadoVazio();
  }
}

function gravar() {
  if (emMemoria) return;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch (erro) {
    avisarErro(erro?.name === "QuotaExceededError" ? "cota" : "gravacao");
  }
}

function notificar() {
  for (const fn of assinantes) {
    try { fn(estado); } catch (erro) { console.error(erro); }
  }
}

/** Estado atual. Trate como somente leitura: para mudar, use atualizar(). */
export function obter() {
  if (!estado) estado = ler();
  return estado;
}

/** Recebe uma função que muda uma cópia do estado (ou devolve um novo). Grava e avisa os assinantes. */
export function atualizar(fn) {
  const copia = structuredClone(obter());
  const resultado = fn(copia);
  estado = resultado ?? copia;
  gravar();
  notificar();
  return estado;
}

/** As telas assinam para se redesenhar quando o estado muda. Devolve a função de cancelar. */
export function assinar(fn) {
  assinantes.add(fn);
  return () => assinantes.delete(fn);
}

export function zerar() {
  estado = estadoVazio();
  gravar();
  notificar();
}

export function carregarExemplo() {
  estado = criarExemplo();
  gravar();
  notificar();
}

export function armazenamentoEmMemoria() {
  return emMemoria;
}

export function temConta() {
  return !!obter().conta;
}

/** Atalhos de leitura usados por várias telas. */
export const animaisAtivos = () => obter().animais.filter((a) => !a.arquivado);
