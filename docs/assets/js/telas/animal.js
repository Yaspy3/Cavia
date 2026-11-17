// Perfil do animal (imagens: iPhone 16 - 31 Dados, 5 Peso, 6 e 16 Diário, 32 pop-up do dia, 9 Saúde).
// O animal vem por parâmetro de URL: animal.html?id=...&aba=dados|peso|diario|saude

import { obter, assinar, hoje, somarDias } from "../store.js";
import { animalPorId, grupoPorId, editarAnimal } from "../acoes.js";
import { pesagensDoAnimal, variacaoPeso, alertasDePeso, CHECKUP_PADRAO_DIAS } from "../regras.js";
import { graficoPeso } from "../graficos.js";
import { avatarHtml } from "../avatar.js";
import { abrirOpcoesFoto, abrirMontarAvatar } from "../seletores.js";
import { ilustracao } from "../ilustracoes.js";
import { descreverAlerta } from "../alertas.js";
import { nomeSintoma } from "../conteudo/sintomas.js";
import { CAMPOS, nomeDe } from "../conteudo/observacao.js";
import { gramas, dataCurta, dataLonga, dataRelativa, idade, variacao, inicialDia, diaSemana } from "../formato.js";
import { esc, criarAbas, cabecalhoTeal, opcoes, abrirFolha, avisar } from "../ui.js";
import { icone } from "../icones.js";
import { paraData, diasEntre } from "../datas.js";

const ABAS = [
  { id: "dados", rotulo: "Dados" }, { id: "peso", rotulo: "Peso" },
  { id: "diario", rotulo: "Diário" }, { id: "saude", rotulo: "Saúde" },
];
const SEXO = { femea: "Fêmea", macho: "Macho" };

const linha = (rotulo, valor) => `
  <div class="dados-linha"><dt>${esc(rotulo)}</dt>
  <dd>${valor ? esc(valor) : `<span class="t-muted">Não informado</span>`}</dd></div>`;

// ---------------------------------------------------------------- Dados
function painelDados(animal) {
  const voltar = encodeURIComponent(`animal.html?id=${animal.id}`);
  const editar = `animal-novo.html?id=${encodeURIComponent(animal.id)}&voltar=${voltar}`;
  const nasc = animal.nascimento ? `${dataCurta(animal.nascimento)}${animal.nascimentoAproximado ? " (aproximado)" : ""}` : "";
  const castrado = animal.castrado === null || animal.castrado === undefined ? "" : animal.castrado ? "Sim" : "Não";
  return `
    <section class="ds-card ds-card--contorno" aria-labelledby="t-ident">
      <header class="dados-topo"><h2 class="t-title" id="t-ident">Identificação</h2><a class="animais__ver" href="${editar}">Editar</a></header>
      <dl>${linha("Sexo", SEXO[animal.sexo] ?? "")}${linha("Nascimento", nasc)}${linha("Raça", animal.raca)}${linha("Cor", animal.cor)}</dl>
    </section>
    <section class="ds-card ds-card--contorno" aria-labelledby="t-origem">
      <header class="dados-topo"><h2 class="t-title" id="t-origem">Origem e cuidado</h2><a class="animais__ver" href="${editar}">Editar</a></header>
      <dl>${linha("Chegou em", animal.chegouEm ? dataCurta(animal.chegouEm) : "")}${linha("Castrado", castrado)}${linha("Origem", animal.origem)}</dl>
    </section>`;
}

// ---------------------------------------------------------------- Peso
function painelPeso(animal, estado) {
  const pesagens = pesagensDoAnimal(estado, animal.id);
  const recentes = [...pesagens].reverse().slice(0, 10);
  const alerta = alertasDePeso(estado, hoje()).find((a) => a.animalId === animal.id);
  const d = alerta ? descreverAlerta(alerta) : null;
  const avisoPeso = !d ? "" : d.nivel === "urgente"
    ? `<div class="ds-notice ds-notice--urgente" role="note" data-revisao="pendente">
        <span class="ds-notice__icone">${icone("alerta", { tamanho: 22 })}</span>
        <p><strong>${esc(d.titulo)}</strong><br>${esc(d.linha)}</p></div>`
    : `<div class="ds-notice ds-notice--atencao" role="note" data-revisao="pendente">
        <span class="ds-notice__icone">${icone("alerta", { tamanho: 22 })}</span>
        <p>${esc(d.orientacao)}</p></div>`;
  const linhas = recentes.map((p, i) => {
    const anterior = recentes[i + 1];
    const delta = anterior ? p.gramas - anterior.gramas : null;
    return `<tr><td>${dataCurta(p.data)}</td><td class="peso-lista__valor">${gramas(p.gramas)}</td>
      <td class="${delta === null ? "" : delta < 0 ? "delta delta--cai" : "delta delta--sobe"}">${delta === null || delta === 0 ? "" : `${variacao(delta)}<span class="so-leitor"> gramas</span>`}</td></tr>`;
  }).join("");
  return `
    <section class="ds-card ds-card--contorno" aria-labelledby="t-evol">
      <h2 class="t-title" id="t-evol">Evolução do peso</h2>
      ${graficoPeso(pesagens, { rotulo: animal.nome, ultimas: 10 })}
    </section>
    ${recentes.length ? `<section class="ds-card ds-card--contorno" aria-labelledby="t-hist-peso">
      <h2 class="so-leitor" id="t-hist-peso">Pesagens</h2>
      <table class="peso-lista"><tbody>${linhas}</tbody></table></section>` : ""}
    ${avisoPeso}
    <a class="ds-button ds-button--registrar ds-button--bloco" href="registrar-peso.html?animal=${encodeURIComponent(animal.id)}">Registrar peso</a>`;
}

// ---------------------------------------------------------------- Diário
const CAMPOS_DIARIO = ["fezes", "urina", "comportamento"];

/** Observação do animal em um dia (ou undefined). */
const obsDoDia = (estado, animalId, data) => estado.observacoes.find((o) => o.alvo === "animal" && o.alvoId === animalId && o.data === data);

function estadoDaCelula(valor) {
  if (!valor) return "vazio";
  return valor === "normal" ? "normal" : "atencao";
}

function celula({ estadoCel, rotulo, data }) {
  const icones = { normal: icone("check", { tamanho: 12 }), atencao: icone("alerta", { tamanho: 12 }), vazio: "" };
  return `<button type="button" class="dia-celula dia-celula--${estadoCel}" data-dia="${data}" aria-label="${esc(rotulo)}"><span class="dia-celula__bolinha">${icones[estadoCel]}</span></button>`;
}
function grade7(animal, estado) {
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(hoje(), i - 6));
  return `
    <div class="diario-grade" role="group" aria-label="Últimos 7 dias">
      <div class="diario-grade__linha diario-grade__linha--letras" aria-hidden="true"><span></span>${dias.map((d) => `<span class="diario-grade__dia ${d === hoje() ? "diario-grade__dia--hoje" : ""}">${inicialDia(d)}</span>`).join("")}</div>
      ${CAMPOS_DIARIO.map((campo) => `
        <div class="diario-grade__linha diario-grade__linha--dado">
          <span class="diario-grade__rotulo">${CAMPOS[campo].rotulo}</span>
          ${dias.map((d) => {
            const valor = obsDoDia(estado, animal.id, d)?.[campo];
            const txt = valor ? nomeDe(campo, valor) : "sem registro";
            return celula({ estadoCel: estadoDaCelula(valor), data: d, rotulo: `${CAMPOS[campo].rotulo}, ${diaSemana(d)} ${dataCurta(d)}: ${txt}` });
          }).join("")}
        </div>`).join("")}
    </div>`;
}
function grade30(animal, estado) {
  const fim = hoje();
  const inicio = somarDias(fim, -29);
  // começa na segunda-feira da semana do primeiro dia
  const dow = (paraData(inicio).getDay() + 6) % 7;
  const comeco = somarDias(inicio, -dow);
  const total = Math.ceil((diasEntre(comeco, fim) + 1) / 7) * 7;
  const celulas = [];
  for (let i = 0; i < total; i++) {
    const d = somarDias(comeco, i);
    if (d < inicio || d > fim) { celulas.push(`<span class="mes-celula mes-celula--fora"></span>`); continue; }
    const obs = obsDoDia(estado, animal.id, d);
    const valores = CAMPOS_DIARIO.map((c) => obs?.[c]).filter(Boolean);
    const est = !valores.length ? "vazio" : valores.every((v) => v === "normal") ? "normal" : "atencao";
    const texto = est === "vazio" ? "sem registro" : est === "normal" ? "tudo normal" : "com atenção";
    celulas.push(`<button type="button" class="mes-celula mes-celula--${est}" data-dia="${d}" aria-label="${esc(`${diaSemana(d)} ${dataCurta(d)}: ${texto}`)}">
      <span class="mes-celula__num">${Number(d.slice(8))}</span>
      <span class="mes-celula__marca" aria-hidden="true">${est === "normal" ? icone("check", { tamanho: 12 }) : est === "atencao" ? icone("alerta", { tamanho: 12 }) : ""}</span></button>`);
  }
  return `<div class="mes-grade" role="group" aria-label="Últimos 30 dias">
    ${["S", "T", "Q", "Q", "S", "S", "D"].map((l) => `<span class="diario-grade__dia" aria-hidden="true">${l}</span>`).join("")}
    ${celulas.join("")}</div>`;
}

function abrirDia(animal, data) {
  const estado = obter();
  const obs = obsDoDia(estado, animal.id, data);
  const linhaDia = (campo) => {
    const valor = obs?.[campo];
    const arte = campo === "comportamento" ? `<span class="dia-arte">${icone("olho")}</span>` : `<span class="dia-arte">${ilustracao(campo, valor ?? "", 32)}</span>`;
    return `<div class="dia-linha">${arte}<span><span class="t-small t-muted">${CAMPOS[campo].rotulo}</span><br>
      <strong class="t-title" data-revisao="pendente">${valor ? esc(nomeDe(campo, valor)) : "Sem registro"}</strong></span></div>`;
  };
  abrirFolha({
    titulo: dataLonga(data),
    montar(corpo) {
      corpo.innerHTML = `<div class="ds-lista">${CAMPOS_DIARIO.map(linhaDia).join("")}</div>
        <div class="ds-folha__acoes"><a class="ds-button ds-button--registrar ds-button--bloco"
          href="registrar-observacao.html?animal=${encodeURIComponent(animal.id)}&data=${data}">Editar observações</a></div>`;
    },
  });
}

function cartaoCheckup(animal, estado) {
  const feitos = estado.checkups.filter((c) => c.animalId === animal.id).sort((a, b) => b.data.localeCompare(a.data));
  const freq = estado.checkupFrequencia.porAnimal[animal.id] ?? estado.checkupFrequencia.padraoDias ?? CHECKUP_PADRAO_DIAS;
  const frequenciaTxt = freq === 7 ? "toda semana" : freq === 1 ? "todo dia" : `a cada ${freq} dias`;
  if (!feitos.length) {
    return `<section class="ds-card ds-card--contorno" aria-labelledby="t-check"><h2 class="t-title" id="t-check">Check-up</h2>
      <p class="t-small t-muted">Nenhum check-up registrado ainda.</p>
      <p class="t-small">Frequência: ${frequenciaTxt}</p></section>`;
  }
  const proximo = somarDias(feitos[0].data, freq);
  const atraso = diasEntre(proximo, hoje());
  const chip = atraso === 0 ? `<span class="ds-chip ds-chip--atencao">${icone("triangulo", { tamanho: 14 })}Vence hoje</span>`
    : atraso > 0 ? `<span class="ds-chip ds-chip--atencao">${icone("triangulo", { tamanho: 14 })}Atrasado</span>` : "";
  const normal = (c) => Object.values(c.itens ?? {}).every((v) => v === "normal");
  return `<section class="ds-card ds-card--contorno" aria-labelledby="t-check">
    <header class="dados-topo"><h2 class="t-title" id="t-check">Check-up</h2>${chip}</header>
    <dl><div class="dados-linha"><dt>Próximo</dt><dd>${dataCurta(proximo)}</dd></div></dl>
    <h3 class="t-strong dados-sub">Anteriores</h3>
    <ul class="ds-lista">${feitos.slice(0, 3).map((c) => `<li class="dados-linha"><span>${dataCurta(c.data)}</span>
      ${normal(c) ? `<span class="ds-chip ds-chip--estavel">${icone("check", { tamanho: 14 })}Normal</span>` : `<span class="ds-chip ds-chip--atencao">${icone("triangulo", { tamanho: 14 })}Atenção</span>`}</li>`).join("")}</ul>
    <p class="t-small dados-sub">Frequência: ${frequenciaTxt}</p></section>`;
}

function cartaoHigiene(animal, estado) {
  const ultima = (tipo) => estado.higiene.filter((h) => h.animalId === animal.id && h.tipo === tipo).map((h) => h.data).sort().at(-1);
  const linhaH = (rotulo, data) => `<li class="higiene-linha"><span>${rotulo}</span>${data ? `<span>${dataCurta(data)}</span>` : `<span class="t-muted">Não informado</span>`}</li>`;
  return `<section class="ds-card ds-card--contorno higiene-card" aria-labelledby="t-hig">
    <h2 class="t-title" id="t-hig">Higiene</h2>
    <ul>${linhaH("Corte de unhas", ultima("unhas"))}${linhaH("Banho", ultima("banho"))}</ul></section>`;
}
function painelDiario(animal, estado, vista, aoMudarVista) {
  const html = `
    <section class="ds-card ds-card--contorno diario-card" aria-labelledby="t-diario">
      <header class="diario-card__topo"><h2 class="t-title" id="t-diario">Diário</h2><div data-vista></div></header>
      ${vista === "7" ? grade7(animal, estado) : grade30(animal, estado)}
    </section>
    ${cartaoHigiene(animal, estado)}
    ${cartaoCheckup(animal, estado)}
    <a class="ds-button ds-button--registrar ds-button--bloco" href="registrar-observacao.html?animal=${encodeURIComponent(animal.id)}">Registrar observação</a>`;
  return { html, ligar(painel) {
    painel.querySelector("[data-vista]").append(opcoes({
      rotulo: "Período do diário", variante: "segmentado", valor: vista,
      itens: [{ valor: "7", rotulo: "7 dias" }, { valor: "30", rotulo: "30 dias" }], aoMudar: aoMudarVista,
    }));
    for (const b of painel.querySelectorAll("[data-dia]")) b.addEventListener("click", () => abrirDia(animal, b.dataset.dia));
  } };
}

// ---------------------------------------------------------------- Saúde
function painelSaude(animal, estado, filtro, aoMudarFiltro) {
  const h = hoje();
  const consultas = estado.consultas.filter((c) => c.animalId === animal.id);
  const proxima = consultas.map((c) => ({ data: c.retorno, clinica: c.clinica })).filter((c) => c.data && c.data >= h).sort((a, b) => a.data.localeCompare(b.data))[0];
  const tratamentos = estado.tratamentos.filter((t) => t.animalId === animal.id);
  const ativo = tratamentos.find((t) => t.inicio && somarDias(t.inicio, Math.max(0, t.dias - 1)) >= h);

  const historico = [
    ...consultas.map((c) => ({ tipo: c.tipo === "exame" ? "exame" : "consulta", data: c.data })),
    ...tratamentos.map((t) => ({ tipo: "medicamento", data: t.inicio, detalhe: t.nome })),
    // Sintomas e ocorrências ficam no histórico (aparecem em "Tudo") e nunca geram alerta.
    ...estado.sintomas.filter((s) => s.animalId === animal.id).map((s) => ({ tipo: "sintoma", data: s.data, detalhe: (s.sintomas ?? []).map(nomeSintoma).join(", ") })),
  ].filter((i) => i.data && (filtro === "tudo" || i.tipo === filtro)).sort((a, b) => b.data.localeCompare(a.data));
  const ROTULO = { consulta: "Consulta", exame: "Exame", medicamento: "Medicamento", sintoma: "Sintoma" };
  const ICONE = { consulta: "calendario", exame: "frasco", medicamento: "pilula", sintoma: "nota" };

  const html = `
    <div class="saude-resumo">
      <section class="ds-card ds-card--contorno" aria-labelledby="t-prox"><h2 class="t-small" id="t-prox">Próxima consulta</h2>
        ${proxima ? `<p class="t-strong saude-valor">${dataCurta(proxima.data)}</p><p class="t-small">${esc(proxima.clinica || "")}</p>` : `<p class="t-small t-muted">Sem consulta marcada</p>`}</section>
      <section class="ds-card ds-card--contorno" aria-labelledby="t-trat"><h2 class="t-small" id="t-trat">Tratamento</h2>
        ${ativo ? `<p class="t-strong saude-valor">${esc(ativo.nome)}</p><p class="t-small">${ativo.vezesPorDia}x ao dia</p>` : `<p class="t-small t-muted">Sem tratamento em andamento</p>`}</section>
    </div>
    <section class="ds-card ds-card--contorno" aria-labelledby="t-historico">
      <h2 class="t-title" id="t-historico">Histórico</h2>
      <div data-filtro class="saude-filtro"></div>
      ${historico.length ? `<ul class="ds-lista">${historico.map((i) => `
        <li class="saude-item"><span class="ds-lista__icone">${icone(ICONE[i.tipo])}</span>
          <span class="ds-lista__texto"><span class="t-strong">${ROTULO[i.tipo]}</span>${i.detalhe ? `<span class="t-small t-muted">${esc(i.detalhe)}</span>` : ""}</span>
          <span class="t-small">${dataCurta(i.data)}</span></li>`).join("")}</ul>` : `<p class="t-small t-muted">Nada registrado nesta categoria.</p>`}
    </section>
    <button type="button" class="ds-button ds-button--registrar ds-button--bloco" data-registrar-saude>Registrar saúde</button>`;
  return { html, ligar(painel) {
    painel.querySelector("[data-filtro]").append(opcoes({
      rotulo: "Filtrar histórico", valor: filtro,
      itens: [{ valor: "tudo", rotulo: "Tudo" }, { valor: "consulta", rotulo: "Consultas" }, { valor: "exame", rotulo: "Exames" }, { valor: "medicamento", rotulo: "Medicamento" }],
      aoMudar: aoMudarFiltro,
    }));
    painel.querySelector("[data-registrar-saude]").addEventListener("click", () => abrirFolha({
      titulo: "Registrar saúde",
      montar(corpo) {
        const id = encodeURIComponent(animal.id);
        corpo.innerHTML = `<div class="ds-lista">
          <a class="ds-lista__linha" href="registrar-consulta.html?animal=${id}"><span class="ds-lista__icone">${icone("calendario")}</span><span class="t-strong">Consulta ou exame</span></a>
          <a class="ds-lista__linha" href="registrar-tratamento.html?animal=${id}"><span class="ds-lista__icone">${icone("pilula")}</span><span class="t-strong">Tratamento ou medicação</span></a>
          <a class="ds-lista__linha" href="registrar-sintomas.html?animal=${id}"><span class="ds-lista__icone">${icone("nota")}</span><span class="t-strong">Sintomas e ocorrências</span></a></div>`;
      },
    }));
  } };
}

// ---------------------------------------------------------------- Tela
export function telaAnimal(raiz) {
  raiz.classList.add("tela--topo");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  let aba = ABAS.some((a) => a.id === params.get("aba")) ? params.get("aba") : "dados";
  let vistaDiario = "7";
  let filtroSaude = "tudo";

  const naoEncontrado = () => {
    raiz.classList.remove("tela--topo");
    raiz.innerHTML = `<header class="ds-header"><a class="ds-header__voltar" href="animais.html" aria-label="Voltar">${icone("seta-esquerda")}</a><div><h1>Animal não encontrado</h1></div></header>
      <p class="t-body">Este porquinho não está mais na sua lista.</p><a class="ds-button ds-button--bloco" href="animais.html">Ver animais</a>`;
  };

  const desenhar = () => {
    const estado = obter();
    const animal = animalPorId(id);
    if (!animal) return naoEncontrado();
    raiz.classList.add("tela--topo");
    const grupo = grupoPorId(animal.grupoId);
    const tags = [idade(animal.nascimento) !== "Não informado" ? idade(animal.nascimento) : "", SEXO[animal.sexo] ?? "", animal.raca].filter(Boolean);

    raiz.innerHTML = `
      ${cabecalhoTeal({
        voltarHref: "animais.html",
        conteudo: `<div class="perfil-topo">
          <button type="button" class="perfil-topo__avatar" data-avatar aria-label="Trocar foto ou avatar de ${esc(animal.nome)}">${avatarHtml(animal, 96)}</button>
          <div><h1 class="t-h1">${esc(animal.nome)}</h1><p class="perfil-topo__grupo">${esc(grupo?.nome ?? "")}</p>
          <ul class="perfil-topo__tags">${tags.map((t) => `<li class="ds-chip ds-chip--tag">${esc(t)}</li>`).join("")}</ul></div></div>`,
      })}
      <div class="perfil-corpo"><div data-abas></div><div id="painel-abas" role="tabpanel" class="perfil-painel" tabindex="-1"></div></div>`;

    const painel = raiz.querySelector("#painel-abas");
    const abas = criarAbas({ rotulo: "Seções do perfil", itens: ABAS, ativa: aba, aoMudar: (novo) => {
      aba = novo;
      const u = new URL(location.href); u.searchParams.set("aba", novo); history.replaceState(null, "", u);
      pintar();
    } });
    raiz.querySelector("[data-abas]").append(abas.el);

    function pintar() {
      painel.setAttribute("aria-labelledby", `aba-${aba}`);
      const est = obter();
      const a = animalPorId(id);
      if (aba === "dados") painel.innerHTML = painelDados(a);
      else if (aba === "peso") painel.innerHTML = painelPeso(a, est);
      else if (aba === "diario") {
        const p = painelDiario(a, est, vistaDiario, (v) => { vistaDiario = v; pintar(); });
        painel.innerHTML = p.html; p.ligar(painel);
      } else {
        const p = painelSaude(a, est, filtroSaude, (v) => { filtroSaude = v; pintar(); });
        painel.innerHTML = p.html; p.ligar(painel);
      }
    }
    pintar();

    raiz.querySelector("[data-avatar]").addEventListener("click", () => abrirOpcoesFoto({
      aoFoto: (url, erro) => { if (erro) avisar(erro); else editarAnimal(id, { foto: url }); },
      aoMontar: () => abrirMontarAvatar({ avatar: animal.avatar, aoSalvar: (av) => editarAnimal(id, { avatar: av, foto: null }) }),
    }));
  };

  desenhar();
  let ultimo = JSON.stringify(animalPorId(id)?.avatar) + animalPorId(id)?.foto + animalPorId(id)?.nome;
  assinar(() => {
    const a = animalPorId(id);
    const atual = JSON.stringify(a?.avatar) + a?.foto + a?.nome;
    if (atual !== ultimo) { ultimo = atual; desenhar(); }
  });
}
