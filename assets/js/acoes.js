// Operações sobre os dados (criar grupo, criar animal, registrar peso).
// As telas chamam estas funções; só elas escrevem no store.

import { atualizar, obter } from "./store.js";
import { somarDias } from "./datas.js";
import { AVATAR_PADRAO } from "./avatar.js";
import { repete, proximaOcorrencia, somarHoras, divide } from "./lembretes.js";

const uuid = () => crypto.randomUUID();

export function grupoPorId(id) {
  return obter().grupos.find((g) => g.id === id) ?? null;
}

export function animalPorId(id) {
  return obter().animais.find((a) => a.id === id) ?? null;
}

export function grupoDoAnimal(animal) {
  return grupoPorId(animal.grupoId);
}

export function animaisDoGrupo(grupoId) {
  const g = grupoPorId(grupoId);
  if (!g) return [];
  return g.animais.map(animalPorId).filter((a) => a && !a.arquivado);
}

/** Cria um grupo (só o nome é obrigatório). Integrantes escolhidos mudam de grupo. */
export function criarGrupo({ nome, integrantes = [] }) {
  const id = uuid();
  atualizar((e) => {
    e.grupos.push({ id, nome: nome.trim(), animais: [], dieta: { racao: "", vitaminaC: "", feno: "" }, ambiente: { recinto: "", forracao: "" } });
    for (const animalId of integrantes) moverNoEstado(e, animalId, id);
  });
  return id;
}

function moverNoEstado(e, animalId, grupoId) {
  const animal = e.animais.find((a) => a.id === animalId);
  if (!animal) return;
  for (const g of e.grupos) g.animais = g.animais.filter((x) => x !== animalId);
  e.grupos.find((g) => g.id === grupoId)?.animais.push(animalId);
  animal.grupoId = grupoId;
}

/** Cria um animal. Só `nome` e `grupoId` são obrigatórios. */
export function criarAnimal(dados) {
  const id = uuid();
  atualizar((e) => {
    e.animais.push({
      id, nome: dados.nome.trim(), grupoId: dados.grupoId,
      sexo: dados.sexo ?? "", nascimento: dados.nascimento ?? "", nascimentoAproximado: !!dados.nascimentoAproximado,
      raca: dados.raca ?? "", cor: dados.cor ?? "", origem: dados.origem ?? "",
      chegouEm: dados.chegouEm ?? "", castrado: dados.castrado ?? null, marcas: "", observacoes: "", arquivado: false,
      avatar: dados.avatar ?? { ...AVATAR_PADRAO }, foto: dados.foto ?? null,
    });
    e.grupos.find((g) => g.id === dados.grupoId)?.animais.push(id);
  });
  return id;
}

/** Registra o peso. Se já existe uma pesagem do animal nesse dia, ela é atualizada. */
export function registrarPeso({ animalId, data, gramas }) {
  let atualizado = false;
  atualizar((e) => {
    const existente = e.pesagens.find((p) => p.animalId === animalId && p.data === data);
    if (existente) { existente.gramas = gramas; atualizado = true; }
    else e.pesagens.push({ id: uuid(), animalId, data, gramas });
  });
  return { atualizado };
}


// ---------------------------------------------------------------------------
// Fase 3
// ---------------------------------------------------------------------------

/** Grupo escolhido no Início (guardado em config.grupoAtual). Cai no primeiro grupo se não existir mais. */
export function grupoAtual() {
  const e = obter();
  return e.grupos.find((g) => g.id === e.config.grupoAtual) ?? e.grupos[0] ?? null;
}

export function definirGrupoAtual(id) {
  atualizar((e) => { e.config.grupoAtual = id; });
}

/**
 * Salva a observação do dia. Há uma observação por alvo e por dia: se já existe, só os campos
 * preenchidos agora são atualizados. `higiene` = ["unhas", "banho"] marcados.
 */
export function salvarObservacao({ alvo, alvoId, data, campos, higiene = [] }) {
  atualizar((e) => {
    let obs = e.observacoes.find((o) => o.alvo === alvo && o.alvoId === alvoId && o.data === data);
    if (!obs) {
      obs = { id: uuid(), alvo, alvoId, animalAtribuidoId: null, data, apetite: "", fezes: "", urina: "", comportamento: "", agua: "", nota: "" };
      e.observacoes.push(obs);
    }
    for (const [campo, valor] of Object.entries(campos)) if (valor) obs[campo] = valor;
    if (alvo === "animal") {
      for (const tipo of higiene) {
        if (!e.higiene.some((h) => h.animalId === alvoId && h.tipo === tipo && h.data === data)) {
          e.higiene.push({ id: uuid(), animalId: alvoId, tipo, data });
        }
      }
    }
  });
}

/** Vai para a próxima ocorrência; se passar da data final (`ate`), o lembrete termina. */
function avancar(l) {
  const prox = proximaOcorrencia(l.quando, l.repetir, l.cadaDias);
  if (l.ate && divide(prox).data > l.ate) l.concluido = true;
  else l.quando = prox;
}

/**
 * Conclui um lembrete. Se ele se repete, vai para a próxima ocorrência em vez de ficar concluído.
 * Devolve o estado anterior, para desfazer com restaurarLembrete().
 */
export function concluirLembrete(id) {
  let antes = null;
  atualizar((e) => {
    const l = e.lembretes.find((x) => x.id === id);
    if (!l) return;
    antes = { quando: l.quando, concluido: l.concluido };
    if (repete(l)) avancar(l);
    else l.concluido = true;
  });
  return antes;
}

export function restaurarLembrete(id, antes) {
  if (!antes) return;
  atualizar((e) => { const l = e.lembretes.find((x) => x.id === id); if (l) Object.assign(l, antes); });
}

export function lembretePorId(id) {
  return obter().lembretes.find((l) => l.id === id) ?? null;
}

export function criarLembrete(dados) {
  const id = uuid();
  atualizar((e) => {
    e.lembretes.push({
      id, titulo: dados.titulo.trim(), alvo: dados.alvo, alvoId: dados.alvoId, quando: dados.quando,
      repetir: dados.repetir ?? "nunca", cadaDias: dados.cadaDias ?? 1, avisar: dados.avisar ?? "",
      anotacao: (dados.anotacao ?? "").trim(), tipo: "personalizado", concluido: false,
    });
  });
  return id;
}

export function editarLembrete(id, campos) {
  atualizar((e) => { Object.assign(e.lembretes.find((l) => l.id === id) ?? {}, campos); });
}

export function excluirLembrete(id) {
  atualizar((e) => { e.lembretes = e.lembretes.filter((l) => l.id !== id); });
}

/** Em um lembrete que se repete, pula só esta ocorrência (vai para a próxima). */
export function pularOcorrencia(id) {
  atualizar((e) => {
    const l = e.lembretes.find((x) => x.id === id);
    if (l && repete(l)) avancar(l);
  });
}

/** Edita só esta ocorrência de um lembrete que se repete: cria uma cópia única com as mudanças e pula a original. */
export function editarSoEsta(id, campos) {
  let novo = null;
  atualizar((e) => {
    const l = e.lembretes.find((x) => x.id === id);
    if (!l) return;
    novo = uuid();
    e.lembretes.push({ ...l, ...campos, id: novo, repetir: "nunca", ate: "", concluido: false });
    avancar(l);
  });
  return novo;
}

/** Adia um lembrete: daqui a 1 hora ou para amanhã, no mesmo horário. */
export function adiarLembrete(id, modo) {
  atualizar((e) => {
    const l = e.lembretes.find((x) => x.id === id);
    if (!l) return;
    l.quando = modo === "hora" ? somarHoras(l.quando, 1) : proximaOcorrencia(l.quando, "todo-dia");
  });
}

/** Dados do tutor (Conta). Não guarda senha. */
export function salvarConta({ nome, email }) {
  atualizar((e) => {
    e.conta = { nome: nome.trim(), email: email.trim(), criadaEm: e.conta?.criadaEm ?? new Date().toISOString() };
  });
}

export function definirNotificacao(chave, valor) {
  atualizar((e) => { e.config.notificacoes = { ...e.config.notificacoes, [chave]: valor }; });
}

export function definirSilencio(campos) {
  atualizar((e) => { e.config.silencio = { ...e.config.silencio, ...campos }; });
}

/** Edita os dados de um animal (campos soltos). */
export function editarAnimal(id, campos) {
  atualizar((e) => { Object.assign(e.animais.find((a) => a.id === id) ?? {}, campos); });
}

/** Troca o grupo de um animal. */
export function moverAnimal(animalId, grupoId) {
  atualizar((e) => moverNoEstado(e, animalId, grupoId));
}

export function arquivarAnimal(id, arquivado = true) {
  atualizar((e) => { const a = e.animais.find((x) => x.id === id); if (a) a.arquivado = arquivado; });
}

/** Edita o nome do grupo e traz outros animais para ele. Para tirar um animal do grupo,
 *  troque o grupo dele na edição do animal (todo animal precisa ter um grupo). */
export function editarGrupo(id, { nome, integrantes = [] }) {
  atualizar((e) => {
    const g = e.grupos.find((x) => x.id === id);
    if (!g) return;
    g.nome = nome.trim();
    for (const animalId of integrantes) moverNoEstado(e, animalId, id);
  });
}

export function editarGrupoCampos(id, campos) {
  atualizar((e) => { const g = e.grupos.find((x) => x.id === id); if (g) Object.assign(g, campos); });
}


// ---------------------------------------------------------------------------
// Fase 5
// ---------------------------------------------------------------------------

/** Registro de alimentação de um grupo em um dia (um por grupo e dia). */
export function salvarAlimentacao({ grupoId, data, alimentos, feno, racao }) {
  atualizar((e) => {
    let r = e.alimentacao.find((x) => x.grupoId === grupoId && x.data === data);
    if (!r) { r = { id: uuid(), grupoId, data, alimentos: [], feno: false, racao: false }; e.alimentacao.push(r); }
    r.alimentos = [...alimentos];
    r.feno = !!feno;
    r.racao = !!racao;
  });
}

/** Liga ou desliga um alimento em um dia do grupo (usado pelo pop-up do alimento). */
export function definirAlimentoNoDia(grupoId, data, alimentoId, oferecido) {
  atualizar((e) => {
    let r = e.alimentacao.find((x) => x.grupoId === grupoId && x.data === data);
    if (!r) {
      if (!oferecido) return;
      r = { id: uuid(), grupoId, data, alimentos: [], feno: false, racao: false };
      e.alimentacao.push(r);
    }
    r.alimentos = r.alimentos.filter((a) => a !== alimentoId);
    if (oferecido) r.alimentos.push(alimentoId);
  });
}

/** Sintomas e ocorrências: vão para o histórico de Saúde e NUNCA geram alerta. */
export function salvarSintoma({ animalId, data, sintomas, nota }) {
  atualizar((e) => { e.sintomas.push({ id: uuid(), animalId, data, sintomas, nota: (nota ?? "").trim(), foto: null }); });
}

/**
 * Consulta ou exame. O peso informado também entra em Pesagens (regra do projeto) e o retorno
 * cria um lembrete.
 */
export function salvarConsulta({ animalId, data, tipo, clinica, motivo, orientacao, pesoGramas, retorno, anexo }) {
  const animal = animalPorId(animalId);
  atualizar((e) => {
    e.consultas.push({
      id: uuid(), animalId, tipo, data, clinica: clinica.trim(), motivo, orientacao: orientacao.trim(),
      pesoGramas: pesoGramas || null, retorno: retorno || "", anexo: anexo ?? null,
    });
    if (pesoGramas) {
      const existente = e.pesagens.find((p) => p.animalId === animalId && p.data === data);
      if (existente) existente.gramas = pesoGramas;
      else e.pesagens.push({ id: uuid(), animalId, data, gramas: pesoGramas });
    }
    if (retorno) {
      e.lembretes.push({
        id: uuid(), titulo: `Retorno de ${animal?.nome ?? "animal"}`, alvo: "animal", alvoId: animalId, quando: `${retorno}T09:00`,
        repetir: "nunca", cadaDias: 1, avisar: "", anotacao: clinica.trim(), tipo: "consulta", concluido: false,
      });
    }
  });
}

/**
 * Tratamento ou medicação. A dose é texto livre copiado da receita: o app nunca calcula nem sugere.
 * Com `lembrete`, cria um lembrete diário por horário, que termina no último dia do tratamento.
 */
export function salvarTratamento({ animalId, nome, dose, vezesPorDia, horarios, inicio, dias, lembrete }) {
  const animal = animalPorId(animalId);
  atualizar((e) => {
    const id = uuid();
    e.tratamentos.push({ id, animalId, nome: nome.trim(), dose: dose.trim(), vezesPorDia, horarios, inicio, dias, lembrete: !!lembrete });
    if (lembrete) {
      const fim = dias > 0 ? somarDias(inicio, dias - 1) : "";
      for (const hora of horarios) {
        e.lembretes.push({
          id: uuid(), titulo: `Dose de ${nome.trim()} (${animal?.nome ?? ""})`, alvo: "animal", alvoId: animalId,
          quando: `${inicio}T${hora}`, repetir: "todo-dia", cadaDias: 1, ate: fim, avisar: "", anotacao: "",
          tipo: "dose", tratamentoId: id, concluido: false,
        });
      }
    }
  });
}

/** Cuidados do grupo feitos em um dia (sem duplicar o mesmo tipo no mesmo dia). */
export function salvarCuidados({ grupoId, data, tipos }) {
  atualizar((e) => {
    for (const tipo of tipos) {
      if (!e.cuidadosGrupo.some((c) => c.grupoId === grupoId && c.tipo === tipo && c.data === data)) {
        e.cuidadosGrupo.push({ id: uuid(), grupoId, tipo, data });
      }
    }
  });
}

/** Check-up: um por animal e dia. `itens` = { olhos: "normal" | "atencao", ... }; `detalhes` = { boca: { achados, nota } }. */
export function salvarCheckup({ animalId, data, itens, detalhes }) {
  atualizar((e) => {
    let c = e.checkups.find((x) => x.animalId === animalId && x.data === data);
    if (!c) { c = { id: uuid(), animalId, data, itens: {}, detalhes: {} }; e.checkups.push(c); }
    c.itens = { ...itens };
    c.detalhes = { ...detalhes };
  });
}