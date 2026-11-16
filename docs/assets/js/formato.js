// Todas as datas e números passam por aqui. Nenhuma tela formata data ou peso por conta própria.

import { hoje, paraData, diasEntre } from "./datas.js";

const numero = new Intl.NumberFormat("pt-BR");

/** 1020 -> "1.020 g". Sem valor -> "Não informado". */
export function gramas(valor) {
  if (valor === null || valor === undefined || valor === "") return "Não informado";
  return `${numero.format(valor)} g`;
}

/** Variação com sinal: 14 -> "+14", -50 -> "−50". */
export function variacao(valor) {
  if (!valor) return "0";
  return `${valor > 0 ? "+" : "−"}${numero.format(Math.abs(valor))}`;
}

/** "2026-05-25" -> "25.05.26" (formato curto usado nas telas). */
export function dataCurta(texto) {
  if (!texto) return "Não informado";
  const [a, m, d] = texto.split("-");
  return `${d}.${m}.${a.slice(2)}`;
}

/** "2026-11-26" -> "26.11.2026". */
export function dataCompleta(texto) {
  if (!texto) return "Não informado";
  const [a, m, d] = texto.split("-");
  return `${d}.${m}.${a}`;
}

/** "2026-05-30" -> "Segunda, 30.05.2026". */
export function dataLonga(texto) {
  if (!texto) return "Não informado";
  const [a, m, d] = texto.split("-");
  const dia = diaSemana(texto).replace("-feira", "");
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${d}.${m}.${a}`;
}

/** Hoje, amanhã, ontem; senão a data curta. */
export function dataRelativa(texto) {
  if (!texto) return "Não informado";
  const n = diasEntre(hoje(), texto);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  return dataCurta(texto);
}

/** Idade a partir do nascimento: "4 anos", "8 meses", "3 semanas". */
export function idade(nascimento) {
  if (!nascimento) return "Não informado";
  const nasc = paraData(nascimento);
  const ref = paraData(hoje());
  let meses = (ref.getFullYear() - nasc.getFullYear()) * 12 + (ref.getMonth() - nasc.getMonth());
  if (ref.getDate() < nasc.getDate()) meses -= 1;
  if (meses >= 12) {
    const anos = Math.floor(meses / 12);
    return `${anos} ${anos === 1 ? "ano" : "anos"}`;
  }
  if (meses >= 1) return `${meses} ${meses === 1 ? "mês" : "meses"}`;
  const semanas = Math.max(1, Math.floor(diasEntre(nascimento, hoje()) / 7));
  return `${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
}

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const DIAS_LONGOS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const INICIAIS = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES_CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-11-15" -> "dom, 15 nov" (data do cabeçalho do Início). */
export function dataTopo(texto) {
  const d = paraData(texto);
  return `${DIAS_CURTOS[d.getDay()]}, ${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
}

/** Inicial do dia da semana (S T Q Q S S D) para grades de 7 dias. */
export function inicialDia(texto) {
  return INICIAIS[paraData(texto).getDay()];
}

/** "2026-11-15" -> "domingo". */
export function diaSemana(texto) {
  return DIAS_LONGOS[paraData(texto).getDay()];
}

/** "25.05 - 01.06" para um intervalo de datas. */
export function intervalo(inicio, fim) {
  const [, m1, d1] = inicio.split("-");
  const [, m2, d2] = fim.split("-");
  return `${d1}.${m1} - ${d2}.${m2}`;
}

/** "2026-05-25T18:00" -> "18:00". */
export function hora(instante) {
  return instante && instante.includes("T") ? instante.split("T")[1].slice(0, 5) : "";
}
