// Catálogo de alimentos. Os dados vêm das imagens iPhone 16 - 22 (lista) e 35 (pop-up da Couve).
// Só a Couve tem informação nutricional nas imagens; os demais mostram as etiquetas da lista
// e "valores em validação". NADA aqui foi validado por veterinária: revisao: "pendente".
//
// frequencia: { rotulo, max } — `max` = vezes por semana sugeridas no máximo (null = todo dia).

export const CATEGORIAS = [
  { id: "folhas", rotulo: "Folhas" },
  { id: "legumes", rotulo: "Legumes" },
  { id: "frutas", rotulo: "Frutas" },
];

const todoDia = { rotulo: "Todo dia", max: null, texto: "Todo dia" };
const umDois = { rotulo: "1 - 2x/sem", max: 2, texto: "1 a 2 vezes por semana" };

export const ALIMENTOS = [
  { id: "pimentao", nome: "Pimentão", categoria: "legumes", etiqueta: "Vit C alta", frequencia: todoDia },
  { id: "salsinha", nome: "Salsinha", categoria: "folhas", etiqueta: "Vit C alta - Cálcio alto", frequencia: umDois },
  {
    id: "couve", nome: "Couve", categoria: "folhas", etiqueta: "Cálcio alto", frequencia: umDois,
    // A cada 10 g (imagem iPhone 16 - 35). Níveis: "alto" | "normal".
    nutrientes: [
      { nome: "Vitamina C", valor: "9,67 mg", nivel: "alto", tom: "ok" },
      { nome: "Cálcio", valor: "13,1 mg", nivel: "alto", tom: "atencao" },
      { nome: "Fibras", valor: "0,57 g", nivel: "normal", tom: "ok" },
    ],
    aviso: "Cálcio em excesso pode favorecer problemas urinários. Alterne com folhas mais leves",
  },
  { id: "pepino", nome: "Pepino", categoria: "legumes", etiqueta: "Vit C baixa", frequencia: todoDia },
  { id: "cenoura", nome: "Cenoura", categoria: "legumes", etiqueta: "", frequencia: null },
  { id: "rucula", nome: "Rúcula", categoria: "folhas", etiqueta: "", frequencia: null },
].map((a) => ({ ...a, revisao: "pendente" }));

export const alimentoPorId = (id) => ALIMENTOS.find((a) => a.id === id) ?? null;
