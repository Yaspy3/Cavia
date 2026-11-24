// Gera assets/js/conteudo/alimentos-dados.js. Três fontes:
//
//  1. TACO, 4ª edição ampliada e revisada (NEPA/UNICAMP, 2011): composição por 100 g, em
//     _docs/fontes/TACO_4a_edicao.csv (CSV do repositório isaquetdiniz/taco-api, licença MIT; os valores
//     conferem com a planilha oficial da NEPA). A reprodução é permitida citando a fonte.
//  2. USDA FoodData Central (SR Legacy, domínio público): o que a TACO não traz. Registros extraídos por
//     scripts/extrair-usda.mjs em _docs/fontes/usda-sr-legacy-selecao.json (chave = FDC ID).
//  3. Quais alimentos entram e o que as fontes dizem de cada um:
//     keeble = Keeble E. (2023), In Practice 45(4):200-210, doi:10.1002/inpr.309 (quadros 1 e 2):
//              diaria | ervas | ocasional | fonteVitC | null (não citado)
//     acc    = Animal Care Centers of NYC, guia de adoção de porquinhos-da-índia, tabela
//              "Feeding Your Guinea Pigs": dia | 2-4 | 1-2 | raro | evitar | null (não citado)
//
// Uso (na raiz do projeto):  node scripts/gerar-alimentos.mjs
// Não roda no `quarto render`; rode de novo só se mudar a seleção abaixo.

import { readFileSync, writeFileSync } from "node:fs";

// [id, nome, categoria, keeble, acc, origem, extras]
//  origem: texto = descrição exata na TACO; número = FDC ID da USDA.
//  extras: { geral: true } = a fonte trata a classe (frutas) em geral, sem citar este alimento pelo nome.
const ITENS = [
  // ---- Folhas e ervas ----
  ["alface-lisa", "Alface lisa (manteiga)", "folhas", null, "dia", "Alface, lisa, crua"],
  ["alface-crespa", "Alface crespa", "folhas", null, "dia", "Alface, crespa, crua"],
  ["alface-roxa", "Alface roxa", "folhas", null, "dia", "Alface, roxa, crua"],
  ["alface-romana", "Alface romana", "folhas", null, "2-4", 169247],
  ["alface-americana", "Alface americana", "folhas", null, "evitar", "Alface, americana, crua"],
  ["chicoria", "Chicória (escarola)", "folhas", "diaria", "dia", "Chicória, crua"],
  ["almeirao", "Almeirão", "folhas", "diaria", "2-4", "Almeirão, cru"],
  ["radicchio", "Radicchio", "folhas", null, "dia", 168564],
  ["rucula", "Rúcula", "folhas", "diaria", "2-4", "Rúcula, crua"],
  ["dente-de-leao", "Dente-de-leão (folhas)", "folhas", "ervas", "2-4", 169226],
  ["agriao-de-jardim", "Agrião-de-jardim", "folhas", null, "2-4", 168407],
  ["mostarda", "Mostarda (folha)", "folhas", null, "2-4", "Mostarda, folha, crua"],
  ["salsa", "Salsa", "folhas", "fonteVitC", "2-4", "Salsa, crua"],
  ["tomilho", "Tomilho", "folhas", null, "2-4", 173470],
  ["couve", "Couve (manteiga)", "folhas", "diaria", "1-2", "Couve, manteiga, crua"],
  ["kale", "Kale (couve crespa)", "folhas", "diaria", "1-2", 168421],
  ["endro", "Endro (dill)", "folhas", null, "1-2", 172233],
  ["espinafre", "Espinafre", "folhas", "ocasional", "1-2", "Espinafre, Nova Zelândia, cru"],
  ["folha-de-nabo", "Folha de nabo", "folhas", null, "1-2", 170061],
  ["agriao", "Agrião", "folhas", "diaria", "1-2", "Agrião, cru"],
  ["coentro", "Coentro (folhas frescas)", "folhas", "ervas", "dia", 169997],
  ["manjericao", "Manjericão", "folhas", "ervas", "1-2", "Manjericão, cru"],
  ["hortela", "Hortelã", "folhas", "ervas", null, 173475],
  ["repolho", "Repolho branco", "folhas", "diaria", null, "Repolho, branco, cru"],
  ["repolho-roxo", "Repolho roxo", "folhas", "diaria", null, "Repolho, roxo, cru"],
  ["acelga", "Acelga", "folhas", "diaria", null, "Acelga, crua"],
  ["pak-choi", "Pak choi (couve-chinesa)", "folhas", "diaria", null, 170390],
  // ---- Outros vegetais ----
  ["pimentao-verde", "Pimentão verde", "legumes", "fonteVitC", "dia", "Pimentão, verde, cru"],
  ["pimentao-amarelo", "Pimentão amarelo", "legumes", "fonteVitC", "dia", "Pimentão, amarelo, cru"],
  ["pimentao-vermelho", "Pimentão vermelho", "legumes", "fonteVitC", "2-4", "Pimentão, vermelho, cru"],
  ["tomate", "Tomate", "legumes", "fonteVitC", "dia", "Tomate, com semente, cru"],
  ["abobrinha", "Abobrinha italiana", "legumes", null, "dia", "Abobrinha, italiana, crua"],
  ["cenoura", "Cenoura", "legumes", "ocasional", "2-4", "Cenoura, crua"],
  ["vagem", "Vagem", "legumes", "ocasional", "2-4", "Vagem, crua"],
  ["aipo", "Aipo (salsão)", "legumes", "ocasional", "2-4", "Aipo, cru"],
  ["pepino", "Pepino", "legumes", null, "2-4", "Pepino, cru"],
  ["ervilha-vagem", "Ervilha em vagem", "legumes", null, "2-4", "Ervilha, em vagem"],
  ["nabo", "Nabo", "legumes", null, "2-4", "Nabo, cru"],
  ["aspargo", "Aspargo", "legumes", "fonteVitC", "1-2", 168389],
  ["beterraba", "Beterraba", "legumes", "ocasional", "1-2", "Beterraba, crua"],
  ["brocolis", "Brócolis", "legumes", "ocasional", "1-2", "Brócolis, cru"],
  ["couve-flor", "Couve-flor", "legumes", "ocasional", "1-2", "Couve-flor, crua"],
  ["couve-de-bruxelas", "Couve-de-bruxelas", "legumes", null, "1-2", 170383],
  ["abobora", "Abóbora moranga (crua)", "legumes", null, "1-2", "Abóbora, moranga, crua"],
  ["pastinaca", "Pastinaca", "legumes", "ocasional", null, 170417],
  ["chuchu", "Chuchu", "legumes", null, null, "Chuchu, cru"],
  ["rabanete", "Rabanete", "legumes", null, null, "Rabanete, cru"],
  // ---- Frutas (o guia da ACC trata as frutas em geral: 1 a 2 vezes por semana, em pouca quantidade) ----
  ["maca", "Maçã", "frutas", null, "1-2", "Maçã, Fuji, com casca, crua"],
  ["pera", "Pera", "frutas", null, "1-2", "Pêra, Williams, crua"],
  ["morango", "Morango", "frutas", null, "1-2", "Morango, cru"],
  ["kiwi", "Kiwi", "frutas", null, "1-2", "Kiwi, cru"],
  ["laranja", "Laranja", "frutas", null, "1-2", "Laranja, pêra, crua"],
  ["melancia", "Melancia", "frutas", null, "1-2", "Melancia, crua"],
  ["melao", "Melão", "frutas", null, "1-2", "Melão, cru"],
  ["abacaxi", "Abacaxi", "frutas", null, "1-2", "Abacaxi, cru"],
  ["manga", "Manga", "frutas", null, "1-2", "Manga, Tommy Atkins, crua"],
  ["uva", "Uva", "frutas", null, "1-2", "Uva, Itália, crua"],
  ["pessego", "Pêssego", "frutas", null, "1-2", "Pêssego, Aurora, cru"],
  ["ameixa", "Ameixa", "frutas", null, "1-2", "Ameixa, crua"],
  ["amora", "Amora-preta", "frutas", null, "1-2", 173946],
  ["mirtilo", "Mirtilo", "frutas", null, "1-2", 171711],
  ["framboesa", "Framboesa", "frutas", null, "1-2", 167755],
  ["damasco", "Damasco", "frutas", null, "1-2", 171697],
  ["cereja", "Cereja", "frutas", null, "1-2", 171719],
  ["banana", "Banana prata", "frutas", null, "raro", "Banana, prata, crua"],
  ["mamao", "Mamão papaia", "frutas", null, "1-2", "Mamão, Papaia, cru", { geral: true }],
  ["goiaba", "Goiaba vermelha", "frutas", null, "1-2", "Goiaba, vermelha, com casca, crua", { geral: true }],
];

// ---- leitura das fontes -----------------------------------------------------------------------------------
function lerCsv(texto) {
  const linhas = []; let campo = ""; let linha = []; let aspas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (aspas) { if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; } else if (c === '"') aspas = false; else campo += c; }
    else if (c === '"') aspas = true;
    else if (c === ",") { linha.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && texto[i + 1] === "\n") i++; linha.push(campo); campo = ""; linhas.push(linha); linha = []; }
    else campo += c;
  }
  if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
  const [cab, ...resto] = linhas;
  return resto.filter((l) => l.length > 1).map((l) => Object.fromEntries(cab.map((k, i) => [k, l[i]])));
}
// "Tr" (traço) vale 0; "NA", "*" e vazio = sem dado.
const numero = (v) => {
  if (v === "Tr") return 0;
  const n = Number(v);
  return v === "" || v === "NA" || v === "*" || Number.isNaN(n) ? null : n;
};
const arred = (n, casas) => (n === null || n === undefined ? null : Math.round(n * 10 ** casas) / 10 ** casas);

const tabela = new Map(lerCsv(readFileSync(new URL("../_docs/fontes/TACO_4a_edicao.csv", import.meta.url), "utf8")).map((r) => [r.description, r]));
const usda = JSON.parse(readFileSync(new URL("../_docs/fontes/usda-sr-legacy-selecao.json", import.meta.url), "utf8"));

const alimentos = ITENS.map(([id, nome, categoria, keeble, acc, origem, extras = {}]) => {
  const base = { id, nome, categoria, keeble, acc, ...extras };
  if (typeof origem === "number") {
    const u = usda[origem];
    if (!u) throw new Error(`USDA ${origem} não está em usda-sr-legacy-selecao.json (${id})`);
    return { ...base, fonte: "usda", fdc: origem, de: u.descricao,
      por100g: { kcal: arred(u.kcal, 0), vitC: arred(u.vitC, 1), calcio: arred(u.calcio, 1), fosforo: arred(u.fosforo, 1), fibra: arred(u.fibra, 1), carbo: arred(u.carbo, 1) } };
  }
  const r = tabela.get(origem);
  if (!r) throw new Error(`Não achei na TACO: ${origem} (${id})`);
  return { ...base, fonte: "taco", taco: Number(r.id), de: r.description,
    por100g: { kcal: arred(numero(r.energy_kcal), 0), vitC: arred(numero(r.vitaminC_mg), 1), calcio: arred(numero(r.calcium_mg), 1),
      fosforo: arred(numero(r.phosphorus_mg), 1), fibra: arred(numero(r.fiber_g), 1), carbo: arred(numero(r.carbohydrate_g), 1) } };
});

const ids = new Set();
for (const a of alimentos) { if (ids.has(a.id)) throw new Error(`id repetido: ${a.id}`); ids.add(a.id); }

const cab = `// GERADO por scripts/gerar-alimentos.mjs — não edite à mão. Composição por 100 g de parte comestível crua.
// Composição: TACO 4ª ed. (NEPA/UNICAMP, 2011) e USDA FoodData Central (SR Legacy). Classificação:
// "keeble" = Keeble (2023), In Practice 45(4):200-210, doi:10.1002/inpr.309; "acc" = guia de adoção do
// Animal Care Centers of NYC (tabela "Feeding Your Guinea Pigs"). null = não citado / sem dado; 0 inclui "traço".
`;
writeFileSync(new URL("../assets/js/conteudo/alimentos-dados.js", import.meta.url),
  `${cab}\nexport const DADOS = [\n${alimentos.map((a) => `  ${JSON.stringify(a)}`).join(",\n")},\n];\n`);
const por = (c) => alimentos.filter((a) => a.categoria === c).length;
console.log(`${alimentos.length} alimentos: ${por("folhas")} folhas e ervas, ${por("legumes")} outros vegetais, ${por("frutas")} frutas`);
