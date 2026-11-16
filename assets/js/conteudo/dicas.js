// Dicas para o seu grupo (seção 9.5). Textos FICTÍCIOS e sem afirmação clínica, a confirmar.
// Cada dica tem uma regra de exibição (`vale`) e a primeira que valer, na ordem, é mostrada.
// O texto "Feno fresco à vontade…" vem da imagem iPhone 16 - 3 (texto final).

import { diasEntre } from "../datas.js";

/** Última data de um tipo de cuidado do grupo, ou null. */
function ultimoCuidado(estado, grupoId, tipos) {
  const datas = estado.cuidadosGrupo.filter((c) => c.grupoId === grupoId && tipos.includes(c.tipo)).map((c) => c.data).sort();
  return datas.at(-1) ?? null;
}

export const DICAS = [
  {
    id: "sem-grupo", titulo: "Vamos começar",
    texto: "Crie o primeiro grupo para reunir os porquinhos que vivem juntos.",
    vale: (e) => e.grupos.length === 0, destino: { rotulo: "Criar um grupo", href: "grupo-novo.html" },
  },
  {
    id: "grupo-vazio", titulo: "Primeiro porquinho",
    texto: "Cadastre o primeiro porquinho deste grupo. Só nome e grupo são obrigatórios.",
    vale: (e, g) => g && g.animais.length === 0,
    destino: (g) => ({ rotulo: "Cadastrar um animal", href: `animal-novo.html?grupo=${g.id}` }),
  },
  {
    id: "sem-peso", titulo: "Primeiro peso",
    texto: "Registre o primeiro peso para acompanhar a evolução no gráfico.",
    vale: (e, g) => g && g.animais.some((id) => !e.pesagens.some((p) => p.animalId === id)),
    destino: { rotulo: "Registrar peso", href: "registrar-peso.html" },
  },
  {
    id: "sem-observacao", titulo: "Primeira observação",
    texto: "Anote como o grupo está hoje: fezes, urina e comportamento. Assim o Cavia compara com os próximos dias.",
    vale: (e, g) => g && !e.observacoes.some((o) => (o.alvo === "grupo" ? o.alvoId === g.id : g.animais.includes(o.alvoId))),
    destino: { rotulo: "Registrar observação", href: "registrar-observacao.html" },
  },
  {
    id: "limpeza-atrasada", titulo: "Limpeza do grupo",
    texto: "Faz alguns dias desde a última limpeza do recinto. Que tal registrar quando fizer?",
    vale: (e, g, hoje) => {
      if (!g || g.animais.length === 0) return false;
      const ultima = ultimoCuidado(e, g.id, ["limpeza-dia", "troca-forracao"]);
      return ultima ? diasEntre(ultima, hoje) >= 5 : false;
    },
    destino: { rotulo: "Registrar cuidados", href: "registrar-cuidados.html" },
  },
  {
    id: "pesar-horario", titulo: "Hora de pesar",
    texto: "Pesar sempre no mesmo horário ajuda a comparar os valores de uma semana para outra.",
    vale: (e, g, hoje) => !!g && g.animais.some((id) => {
      const ultimo = e.pesagens.filter((p) => p.animalId === id).map((p) => p.data).sort().at(-1);
      return ultimo && diasEntre(ultimo, hoje) >= 7;
    }),
    destino: { rotulo: "Registrar peso", href: "registrar-peso.html" },
  },
  {
    id: "feno", titulo: "Bom dia!",
    texto: "Feno fresco à vontade ajuda a manter os dentes e a digestão em dia!",
    vale: () => true, destino: null,
  },
].map((d) => ({ ...d, revisao: "pendente" }));

/** Primeira dica cuja regra vale para o grupo escolhido. */
export function dicaParaGrupo(estado, grupo, hoje) {
  const dica = DICAS.find((d) => d.vale(estado, grupo, hoje)) ?? DICAS.at(-1);
  const destino = typeof dica.destino === "function" ? dica.destino(grupo) : dica.destino;
  return { ...dica, destino };
}
