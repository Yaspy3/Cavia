// Dados de exemplo. Todo nome, peso e data é FICTÍCIO.
// As datas são calculadas a partir de hoje(), para os exemplos nunca ficarem velhos.
// Fase 1: conta, grupos, animais, pesagens, lembretes, cuidados, check-ups, consulta e tratamento.
// Ainda falta (fases 3 e 5): observações dos últimos 14 dias com uma mudança recente,
// alimentos da semana e sintomas.

import { hoje, somarDias } from "./datas.js";

export const VERSAO_ESTADO = 1;

export function estadoVazio() {
  return {
    versao: VERSAO_ESTADO,
    conta: null,
    config: { silencio: { ativo: false, de: "22:00", ate: "07:00" }, notificacoes: {} },
    grupos: [],
    animais: [],
    pesagens: [],
    observacoes: [],
    alimentacao: [],
    cuidadosGrupo: [],
    higiene: [],
    checkups: [],
    checkupFrequencia: { padraoDias: 7, porAnimal: {} },
    sintomas: [],
    consultas: [],
    tratamentos: [],
    lembretes: [],
  };
}

const uuid = () => crypto.randomUUID();

export function criarExemplo() {
  const h = hoje();
  const d = (n) => somarDias(h, n);
  const e = estadoVazio();

  e.conta = { nome: "Marina Lima", email: "marina@exemplo.com", criadaEm: new Date().toISOString() };

  const g1 = uuid();
  const g2 = uuid();
  const mk = (nome, grupoId, extra) => ({
    id: uuid(), nome, grupoId, sexo: "", nascimento: "", raca: "", cor: "", origem: "",
    chegouEm: "", castrado: false, marcas: "", observacoes: "", arquivado: false,
    nascimentoAproximado: false,
    avatar: { pelagem: "marrom", marca: "nenhuma", fundo: "azul" }, foto: null, ...extra,
  });

  const pudim = mk("Pudim", g1, {
    sexo: "femea", nascimento: d(-1500), raca: "Inglês", cor: "Marrom", origem: "Resgate",
    chegouEm: d(-1470), avatar: { pelagem: "marrom", marca: "nenhuma", fundo: "azul" },
  });
  const mimi = mk("Mimi", g1, {
    sexo: "femea", nascimento: d(-900), raca: "Abissínio", cor: "Creme", origem: "Criador",
    avatar: { pelagem: "creme", marca: "nenhuma", fundo: "rosa" },  });
  const pedrinho = mk("Pedrinho", g1, {
    sexo: "macho", nascimento: d(-700), raca: "Inglês", cor: "Preto", origem: "Adoção",
    avatar: { pelagem: "grafite", marca: "nenhuma", fundo: "ambar" },
  });
  const anabelle = mk("Anabelle", g2, {
    sexo: "femea", nascimento: d(-500), raca: "Peruano", cor: "Caramelo", origem: "Criador",
    avatar: { pelagem: "laranja", marca: "focinho", fundo: "pessego" },
  });
  e.animais = [pudim, mimi, pedrinho, anabelle];
  e.grupos = [
    { id: g1, nome: "Grupo 1", animais: [pudim.id, mimi.id, pedrinho.id],
      dieta: { racao: "Megazoo", vitaminaC: "Medoxon", feno: "Sem marca" },
      ambiente: { recinto: "120 x 120 cm", forracao: "Tecido" } },
    { id: g2, nome: "Grupo 2", animais: [anabelle.id],
      dieta: { racao: "", vitaminaC: "", feno: "" }, ambiente: { recinto: "", forracao: "" } },
  ];

  // 8 semanas de pesagens (uma por semana). Pudim: queda gradual, com 50 g na última.
  const series = [
    [pudim, [730, 724, 716, 708, 700, 692, 686, 636]],
    [mimi, [820, 822, 819, 824, 826, 823, 827, 828]],
    [pedrinho, [1040, 1044, 1041, 1046, 1049, 1047, 1050, 1052]],
    [anabelle, [780, 783, 781, 786, 788, 787, 790, 791]],
  ];
  for (const [animal, valores] of series) {
    valores.forEach((gramas, i) => {
      e.pesagens.push({ id: uuid(), animalId: animal.id, data: d(-7 * (valores.length - 1 - i)), gramas });
    });
  }

  // Cuidados do grupo
  e.cuidadosGrupo = [
    { id: uuid(), grupoId: g1, tipo: "agua-trocada", data: d(-1) },
    { id: uuid(), grupoId: g1, tipo: "bebedouro-lavado", data: d(-3) },
    { id: uuid(), grupoId: g1, tipo: "limpeza-dia", data: d(-2) },
    { id: uuid(), grupoId: g1, tipo: "troca-forracao", data: d(-6) },
  ];

  // Check-up: o último foi há 7 dias, então vence hoje.
  e.checkups = [
    { id: uuid(), animalId: pudim.id, data: d(-7), itens: {} },
    { id: uuid(), animalId: pudim.id, data: d(-14), itens: {} },
    { id: uuid(), animalId: pudim.id, data: d(-21), itens: {} },
  ];

  // Observações dos últimos 14 dias (fezes, urina e comportamento) e água/comportamento do grupo.
  // Mimi: sem registro hoje e fezes "mole" ontem -> gera o alerta de observação no Início.
  // Pudim: fezes "gota" há 3 dias (aparece no Diário) e a última pesagem caiu 50 g -> alerta de peso.
  for (let n = -13; n <= 0; n++) {
    for (const a of [pudim, mimi, pedrinho]) {
      if (a === mimi && n === 0) continue;
      if ((n + 13) % 5 === 4 && a !== pudim) continue; // alguns dias sem registro
      e.observacoes.push({
        id: uuid(), alvo: "animal", alvoId: a.id, animalAtribuidoId: null, data: d(n), apetite: "",
        fezes: a === mimi && n === -1 ? "mole" : a === pudim && n === -3 ? "gota" : "normal",
        urina: "normal", comportamento: "normal", agua: "", nota: "",
      });
    }
    e.observacoes.push({
      id: uuid(), alvo: "grupo", alvoId: g1, animalAtribuidoId: null, data: d(n), apetite: "",
      fezes: "", urina: "", comportamento: "normal", agua: "normal", nota: "",
    });
  }
  e.higiene = [
    { id: uuid(), animalId: pudim.id, tipo: "unhas", data: d(-5) },
    { id: uuid(), animalId: pudim.id, tipo: "banho", data: d(-5) },
  ];

  // Vegetais da semana do Grupo 1 (últimos 7 dias): pimentão todo dia, o resto em alguns dias.
  const semana = { "pimentao-verde": [0, 1, 2, 3, 4, 5, 6], cenoura: [1, 4], couve: [3], rucula: [1, 3, 5] };
  for (let i = 0; i < 7; i++) {
    e.alimentacao.push({
      id: uuid(), grupoId: g1, data: d(-6 + i),
      alimentos: Object.keys(semana).filter((id) => semana[id].includes(i)), feno: true, racao: i % 2 === 0,
    });
  }

  // Consulta marcada para amanhã e tratamento em andamento (dose é texto livre da receita)
  e.consultas = [
    { id: uuid(), animalId: pudim.id, tipo: "consulta", data: d(-30), clinica: "Dra. Amanda", motivo: "rotina",
      orientacao: "", pesoGramas: null, retorno: d(1) },
  ];
  e.tratamentos = [
    { id: uuid(), animalId: pudim.id, nome: "Luftal", dose: "Conforme a receita", vezesPorDia: 2,
      horarios: ["08:00", "20:00"], inicio: h, dias: 3 },
  ];

  // Lembretes
  e.lembretes = [
    { id: uuid(), titulo: "Vitamina C para os porquinhos", alvo: "grupo", alvoId: g1, quando: `${h}T18:00`,
      repetir: "nunca", avisar: "", anotacao: "", tipo: "personalizado", concluido: false },
    { id: uuid(), titulo: "Limpeza do grupo", alvo: "grupo", alvoId: g1, quando: `${h}T18:00`,
      repetir: "nunca", avisar: "", anotacao: "", tipo: "limpeza", concluido: false },
    { id: uuid(), titulo: "Consulta", alvo: "animal", alvoId: pudim.id, quando: `${d(1)}T18:00`,
      repetir: "nunca", avisar: "", anotacao: "", tipo: "consulta", concluido: false },
    { id: uuid(), titulo: "Banho na Pudim", alvo: "animal", alvoId: pudim.id, quando: `${d(1)}T18:00`,
      repetir: "nunca", avisar: "", anotacao: "", tipo: "personalizado", concluido: false },
  ];

  return e;
}
