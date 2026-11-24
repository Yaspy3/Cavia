// Extrai, do download em lote da USDA FoodData Central (SR Legacy, CSV, abril/2018; domínio público),
// só os alimentos usados pelo app e grava _docs/fontes/usda-sr-legacy-selecao.json.
//
// Uso:  node scripts/extrair-usda.mjs <pasta com food.csv e food_nutrient.csv>
//   (baixe e descompacte https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip)

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// FDC IDs usados (a descrição serve de conferência).
const IDS = {
  168429: "Lettuce, butterhead", 168412: "Endive, raw", 168564: "Radicchio, raw", 169247: "Lettuce, cos or romaine, raw",
  168407: "Cress, garden, raw", 173470: "Thyme, fresh", 172233: "Dill weed, fresh", 170061: "Turnip greens, raw",
  168421: "Kale, raw", 170010: "Peas, edible-podded, raw", 170383: "Brussels sprouts, raw",
  173946: "Blackberries, raw", 171711: "Blueberries, raw", 167755: "Raspberries, raw", 171697: "Apricots, raw", 171719: "Cherries, sweet, raw",
  170390: "Cabbage, chinese (pak-choi), raw", 169997: "Coriander (cilantro) leaves, raw", 173475: "Spearmint, fresh",
  169226: "Dandelion greens, raw", 168389: "Asparagus, raw", 170417: "Parsnips, raw",
};
// id do nutriente no CSV -> campo
const NUTRIENTES = { 1008: "kcal", 1005: "carbo", 1079: "fibra", 1087: "calcio", 1091: "fosforo", 1162: "vitC" };

function csv(t) {
  const out = []; let f = "", r = [], q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; out.push(r); r = []; }
    else f += c;
  }
  if (f || r.length) { r.push(f); out.push(r); }
  return out;
}

const pasta = process.argv[2];
if (!pasta) throw new Error("Informe a pasta com food.csv e food_nutrient.csv");
const alimentos = new Map(csv(readFileSync(join(pasta, "food.csv"), "utf8")).slice(1).filter((r) => r.length > 2).map((r) => [Number(r[0]), r[2]]));
const saida = {};
for (const [id, prefixo] of Object.entries(IDS)) {
  const desc = alimentos.get(Number(id));
  if (!desc?.startsWith(prefixo)) throw new Error(`FDC ${id}: esperado "${prefixo}", achei "${desc}"`);
  saida[id] = { descricao: desc };
}
for (const r of csv(readFileSync(join(pasta, "food_nutrient.csv"), "utf8")).slice(1)) {
  const campo = NUTRIENTES[r[2]];
  if (campo && saida[r[1]]) saida[r[1]][campo] = Number(r[3]);
}
writeFileSync(new URL("../_docs/fontes/usda-sr-legacy-selecao.json", import.meta.url), `${JSON.stringify(saida, null, 1)}\n`);
console.log(`${Object.keys(saida).length} alimentos extraídos`);
