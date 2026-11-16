// Regras de lembretes: repetição e cálculo da próxima ocorrência.
// Datas/horas ficam no formato "AAAA-MM-DDTHH:MM" (dia local).

import { somarDias, paraData, dataLocal } from "./datas.js";

export const REPETICOES = [
  { valor: "nunca", rotulo: "Não repetir" },
  { valor: "todo-dia", rotulo: "Todo dia" },
  { valor: "semana", rotulo: "Toda semana" },
  { valor: "cada-n", rotulo: "A cada N dias" },
  { valor: "mes", rotulo: "Todo mês" },
];

export const AVISOS = [
  { valor: "", rotulo: "Na hora" },
  { valor: "10min", rotulo: "10 minutos antes" },
  { valor: "1h", rotulo: "1 hora antes" },
  { valor: "1dia", rotulo: "1 dia antes" },
];

export const divide = (quando) => {
  const [data, hora = "00:00"] = quando.split("T");
  return { data, hora };
};
export const junta = (data, hora) => `${data}T${hora}`;

/** Próxima ocorrência de um lembrete que se repete. `cadaDias` só vale para "cada-n". */
export function proximaOcorrencia(quando, repetir, cadaDias = 1) {
  const { data, hora } = divide(quando);
  if (repetir === "todo-dia") return junta(somarDias(data, 1), hora);
  if (repetir === "semana") return junta(somarDias(data, 7), hora);
  if (repetir === "cada-n") return junta(somarDias(data, Math.max(1, Number(cadaDias) || 1)), hora);
  if (repetir === "mes") {
    const d = paraData(data);
    const dia = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(dia, ultimo));
    return junta(dataLocal(d), hora);
  }
  return quando;
}

/** Soma horas a um instante "AAAA-MM-DDTHH:MM". */
export function somarHoras(quando, horas) {
  const { data, hora } = divide(quando);
  const d = paraData(data);
  const [h, m] = hora.split(":").map(Number);
  d.setHours(h + horas, m);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return junta(dataLocal(d), `${hh}:${mm}`);
}

export const repete = (l) => !!l.repetir && l.repetir !== "nunca";

export function rotuloRepeticao(l) {
  if (l.repetir === "cada-n") return `A cada ${l.cadaDias || 1} dias`;
  return REPETICOES.find((r) => r.valor === l.repetir)?.rotulo ?? "Não repetir";
}
