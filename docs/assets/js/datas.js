// Datas como texto AAAA-MM-DD (dia local). O "hoje" passa sempre por hoje(),
// para o modo de teste poder simular outro dia.

const CHAVE_DIA = "cavia:dia-simulado";

function lerSessao(chave) {
  try { return sessionStorage.getItem(chave); } catch { return null; }
}

export function dataLocal(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "AAAA-MM-DD" -> Date no fuso local (meia-noite). */
export function paraData(texto) {
  const [a, m, d] = texto.split("-").map(Number);
  return new Date(a, m - 1, d);
}

export function hoje() {
  const simulado = lerSessao(CHAVE_DIA);
  return simulado && /^\d{4}-\d{2}-\d{2}$/.test(simulado) ? simulado : dataLocal(new Date());
}

/** Define o dia simulado (modo de teste). Passe null para voltar ao dia real. */
export function definirHoje(texto) {
  try {
    if (texto) sessionStorage.setItem(CHAVE_DIA, texto);
    else sessionStorage.removeItem(CHAVE_DIA);
  } catch { /* sem sessionStorage: ignora */ }
}

export function diaSimulado() {
  return lerSessao(CHAVE_DIA);
}

export function somarDias(texto, n) {
  const d = paraData(texto);
  d.setDate(d.getDate() + n);
  return dataLocal(d);
}

/** Dias inteiros de a até b (positivo se b é depois de a). */
export function diasEntre(a, b) {
  return Math.round((paraData(b) - paraData(a)) / 86400000);
}
