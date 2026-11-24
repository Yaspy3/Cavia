// Catálogo de vegetais, ervas e frutas, com informação nutricional e frequência sugerida.
//
// Composição (por 100 g, crua): TACO 4ª ed. (NEPA/UNICAMP, 2011) e, para o que a TACO não traz, USDA
// FoodData Central. Frequência e uso: Keeble E. (2023), In Practice 45(4):200-210, doi:10.1002/inpr.309, e o
// guia de adoção do Animal Care Centers of NYC ("ACC"), tabela "Feeding Your Guinea Pigs". Os dados estão em
// alimentos-dados.js (gerado por scripts/gerar-alimentos.mjs).
//
// Quando as duas fontes dão frequências diferentes para o mesmo alimento, o app mostra a MAIS CAUTELOSA e
// deixa as duas visíveis no pop-up. NADA aqui foi validado por veterinária: revisao: "pendente".

import { DADOS } from "./alimentos-dados.js";

export const CATEGORIAS = [
  { id: "folhas", rotulo: "Folhas e ervas" },
  { id: "legumes", rotulo: "Outros vegetais" },
  { id: "frutas", rotulo: "Frutas" },
];

/** Frequências do guia da ACC. `max` = vezes por semana no máximo (null = sem limite). `ordem` = grupo na lista. */
export const FREQUENCIAS = {
  dia: { rotulo: "Todo dia", max: null, ordem: 0, texto: "Todo dia" },
  "2-4": { rotulo: "2 - 4x/sem", max: 4, ordem: 1, texto: "2 a 4 vezes por semana" },
  "1-2": { rotulo: "1 - 2x/sem", max: 2, ordem: 2, texto: "1 a 2 vezes por semana" },
  raro: { rotulo: "Raramente", max: 1, ordem: 3, texto: "Bem de vez em quando" },
  evitar: { rotulo: "Evitar", max: 0, ordem: 3, texto: "Evitar" },
  sem: { rotulo: "", max: null, ordem: 4, texto: "" },
};
/** Grupos da lista, na ordem em que aparecem. */
export const GRUPOS = [
  { ordem: 0, titulo: "Todo dia" },
  { ordem: 1, titulo: "2 a 4 vezes por semana" },
  { ordem: 2, titulo: "1 ou 2 vezes por semana" },
  { ordem: 3, titulo: "Evitar ou só raramente" },
  { ordem: 4, titulo: "Sem frequência definida" },
];

const KEEBLE_TXT = {
  diaria: "Todo dia, dentro de cerca de 1 xícara de verduras por dia",
  ervas: "Citado como parte da dieta, sem frequência definida",
  ocasional: "Ocasional, como petisco",
  fonteVitC: "Citado como fonte de vitamina C, sem frequência definida",
};
const ACC_TXT = {
  dia: "Pode todo dia", "2-4": "2 a 4 vezes por semana", "1-2": "1 a 2 vezes por semana",
  raro: "Bem de vez em quando, em pouca quantidade", evitar: "Não recomendado",
};

// Observações do guia da ACC e do artigo sobre o preparo ou a quantidade de alguns alimentos.
const OBS = {
  "alface-americana": "O guia da ACC liga verduras muito aguadas, como a alface americana, a diarreia.",
  "alface-lisa": "No guia da ACC, é a alface do tipo manteiga (butterhead).",
  "alface-crespa": "No guia da ACC, é a alface de folha verde (green leaf).",
  "alface-roxa": "No guia da ACC, é a alface de folha roxa (red leaf).",
  chicoria: "No guia da ACC, corresponde à escarola (endive e escarole). Keeble cita a chicória.",
  almeirao: "No guia da ACC e no artigo, corresponde à chicória (chicory greens).",
  coentro: "O guia da ACC sugere cerca de 20 ramos por porquinho por dia como base de vitamina C.",
  "pimentao-verde": "O guia da ACC sugere uma fatia de 1/8 de pimentão por porquinho por dia como base de vitamina C.",
  "pimentao-amarelo": "O guia da ACC sugere uma fatia de 1/8 de pimentão por porquinho por dia como base de vitamina C.",
  "pimentao-vermelho": "O guia da ACC sugere uma fatia de 1/8 de pimentão por porquinho por dia como base de vitamina C. A versão vermelha entra só 2 a 4 vezes por semana.",
  cenoura: "O guia da ACC fala em 1 cenourinha por porquinho, como petisco. As folhas da cenoura estão entre as verduras de todo dia (Keeble).",
  aipo: "Corte em pedaços pequenos e tire os fios (ACC). As folhas de aipo estão entre as verduras de todo dia (Keeble).",
  abobrinha: "Com casca (ACC).", pepino: "Com casca (ACC).",
  abobora: "Crua e sem sementes (ACC).",
  "ervilha-vagem": "Na vagem (ACC).",
  maca: "Com casca, sem o miolo e as sementes (ACC).",
  uva: "Sem sementes (ACC).",
  laranja: "Com casca (ACC).",
  melancia: "Com casca (ACC).",
  banana: "O guia da ACC pede muito pouca banana, porque ela pode causar prisão de ventre.",
};
const NOTA_FRUTA = "Fruta é petisco: pouca quantidade, por causa do açúcar (ACC). Keeble (2023) não se posiciona sobre frutas.";

// Limites do app por 100 g (provisórios): acima de `alto` = alto; abaixo de `baixo` = baixo.
const LIMITES = {
  vitC: { alto: 30, baixo: 10 },     // mg
  calcio: { alto: 100, baixo: 30 },  // mg
  fibra: { alto: 4, baixo: 2 },      // g
};
const NIVEL = { alto: "Alto", normal: "Normal", baixo: "Baixo" };
export const VITC_DIARIA_MG_POR_KG = 10; // Keeble (2023): 10 mg/kg/dia (2 a 3 vezes na gestação)

function nivelDe(nutriente, valorPor100g) {
  const l = LIMITES[nutriente];
  if (valorPor100g === null || !l) return null;
  return valorPor100g >= l.alto ? "alto" : valorPor100g < l.baixo ? "baixo" : "normal";
}

const fmt = (n, casas) => n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
const por10g = (v) => (v === null ? null : v / 10);

/** Frequência que vale para o app: a do guia da ACC; sem ela, a do artigo (verdura de todo dia, petisco = 1 a 2x). */
function frequenciaId(d) {
  if (d.acc) return d.acc;
  if (d.keeble === "diaria") return "dia";
  if (d.keeble === "ocasional") return "1-2";
  return "sem";
}

export const ALIMENTOS = DADOS.map((d) => {
  const v = d.por100g;
  const fid = frequenciaId(d);
  const f = FREQUENCIAS[fid];
  const niveis = { vitC: nivelDe("vitC", v.vitC), calcio: nivelDe("calcio", v.calcio), fibra: nivelDe("fibra", v.fibra) };
  const etiqueta = [
    niveis.vitC === "alto" ? "Vit C alta" : niveis.vitC === "baixo" ? "Vit C baixa" : "",
    niveis.calcio === "alto" ? "Cálcio alto" : "",
  ].filter(Boolean).join(" - ");
  const fruta = d.categoria === "frutas";
  // As duas fontes divergem quando o artigo manda dar todo dia e o guia da ACC limita.
  const divergem = d.keeble === "diaria" && d.acc && d.acc !== "dia";
  return {
    id: d.id, nome: d.nome, categoria: d.categoria, keeble: d.keeble, acc: d.acc,
    etiqueta, niveis, por100g: v,
    frequenciaId: fid, grupo: f.ordem,
    frequencia: fid === "sem" ? null : { rotulo: f.rotulo, max: f.max, texto: f.texto + (fruta && fid !== "evitar" ? ", em pouca quantidade" : "") },
    aviso: fid === "evitar" ? "O guia da ACC recomenda evitar este alimento." : f.max !== null ? "Passou da frequência sugerida. Varie com outros alimentos." : null,
    fontes: [
      { nome: "Keeble (2023)", texto: KEEBLE_TXT[d.keeble] ?? "Não cita este alimento" },
      { nome: "Guia ACC NYC", texto: d.acc ? `${ACC_TXT[d.acc]}${d.geral ? " (frutas em geral)" : ""}` : "Não cita este alimento" },
    ],
    divergem,
    notas: [fruta ? NOTA_FRUTA : null, OBS[d.id] ?? null].filter(Boolean),
    origemDados: d.fonte === "taco"
      ? `TACO 4ª ed. (NEPA/UNICAMP, 2011): ${d.de}`
      : `USDA FoodData Central ${d.fdc}: ${d.de}`,
    revisao: "pendente",
  };
});

/** Linhas da tabela "A cada 10 g": { nome, valor, rotuloNivel?, tom? }. */
export function nutrientesPor10g(a) {
  const v = a.por100g;
  const linha = (nome, valor, un, casas, nutr, tomAlto = "ok") => {
    if (valor === null) return { nome, valor: "sem dado" };
    const nivel = nutr ? a.niveis[nutr] : null;
    return {
      nome, valor: `${fmt(por10g(valor), casas)} ${un}`,
      ...(nivel ? { rotuloNivel: NIVEL[nivel], tom: nivel === "alto" ? tomAlto : "neutro" } : {}),
    };
  };
  return [
    linha("Vitamina C", v.vitC, "mg", 2, "vitC"),
    linha("Cálcio", v.calcio, "mg", 1, "calcio", "atencao"),
    linha("Fósforo", v.fosforo, "mg", 1, null),
    linha("Fibras", v.fibra, "g", 2, "fibra"),
    linha("Energia", v.kcal, "kcal", 1, null),
    ...(v.carbo !== null ? [linha("Carboidratos", v.carbo, "g", 2, null)] : []),
  ];
}

/** Quanto 10 g cobrem da vitamina C diária de um porquinho de 1 kg (10 mg/kg/dia), em %; null se não há dado. */
export function coberturaVitC10g(a) {
  const mg = por10g(a.por100g.vitC);
  return mg === null || mg <= 0 ? null : Math.round((mg / VITC_DIARIA_MG_POR_KG) * 100);
}

/** Nota de cálcio (Keeble, 2023: muito cálcio e pouca água favorecem pedras urinárias). */
export const notaCalcio = (a) => a.niveis.calcio === "alto"
  ? "Rico em cálcio. Dietas com muito cálcio e pouca água favorecem pedras urinárias. Alterne as folhas e deixe água fresca todo dia."
  : null;

// Ids antigos (dados já salvos no aparelho) e seus novos nomes.
const ANTIGOS = { pimentao: "pimentao-verde", salsinha: "salsa" };
export const alimentoPorId = (id) => ALIMENTOS.find((a) => a.id === (ANTIGOS[id] ?? id)) ?? null;
