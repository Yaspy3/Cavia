// Registrar observação (imagens: iPhone 16 - 20, 39, 40, 41 e 34). Animal ou grupo.
// Ao salvar vale o Fluxo 2: o app compara com os registros anteriores e, se houver mudança
// relevante, o alerta e o "o que fazer" aparecem no Início.

import { obter, hoje } from "../store.js";
import { salvarObservacao, animalPorId, grupoPorId, grupoAtual } from "../acoes.js";
import { avatarHtml, avatarGrupoHtml } from "../avatar.js";
import { escolherAnimal, escolherGrupo } from "../seletores.js";
import { ilustracao } from "../ilustracoes.js";
import { FEZES, URINA, COMPORTAMENTO, AGUA, HIGIENE } from "../conteudo/observacao.js";
import { dataCurta, dataLonga } from "../formato.js";
import { esc, opcoes, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

/** Última data de um item de higiene do animal. */
function ultimaHigiene(estado, animalId, tipo) {
  return estado.higiene.filter((h) => h.animalId === animalId && h.tipo === tipo).map((h) => h.data).sort().at(-1) ?? null;
}

function listaDeTipos(campo, lista) {
  return `<div class="obs-tipos obs-tipos--${campo === "Fezes" ? "fezes" : "urina"}" role="radiogroup" aria-label="${esc(campo)}">
    ${lista.map((t) => `
      <button type="button" class="obs-tipo" role="radio" aria-checked="false" data-valor="${t.id}" data-revisao="${t.revisao}">
        ${ilustracao(campo === "Fezes" ? "fezes" : "urina", t.id)}
        <span class="obs-tipo__nome t-strong">${esc(t.nome)}</span>
        <span class="obs-tipo__desc t-caption">${esc(t.descricao)}</span>
      </button>`).join("")}
  </div>`;
}

export function telaRegistrarObservacao(raiz) {
  const params = new URLSearchParams(location.search);
  const estado0 = obter();
  const ativos = estado0.animais.filter((a) => !a.arquivado);
  const dataObs = /^\d{4}-\d{2}-\d{2}$/.test(params.get("data") ?? "") ? params.get("data") : hoje();

  let alvo = params.get("alvo") === "grupo" ? "grupo" : "animal";
  let animalId = params.get("animal");
  if (!animalId || !ativos.some((a) => a.id === animalId)) animalId = ativos.length === 1 ? ativos[0].id : null;
  let grupoId = params.get("grupo");
  if (!grupoId || !estado0.grupos.some((g) => g.id === grupoId)) {
    grupoId = estado0.grupos.length === 1 ? estado0.grupos[0].id : (animalId ? animalPorId(animalId)?.grupoId : null) ?? grupoAtual()?.id ?? null;
  }
  if (!animalId && params.get("alvo") !== "grupo" && ativos.length === 0 && estado0.grupos.length) alvo = "grupo";

  const valores = { fezes: "", urina: "", comportamento: "", agua: "" };
  const higiene = new Set();
  let aberto = alvo === "animal" ? "fezes" : "comportamento";

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Observações</h1></div>
    </header>
    <form class="form" novalidate>
      <div data-alvo></div>
      ${dataObs !== hoje() ? `<p class="t-small t-muted">Dia: ${dataLonga(dataObs)}</p>` : ""}
      <div class="ds-field">
        <button class="ds-seletor" type="button" data-seletor aria-haspopup="dialog"></button>
        <p class="ds-field__erro" id="erro-alvo" hidden></p>
      </div>
      <div data-secoes class="obs-secoes"></div>
      <p class="ds-field__erro" id="erro-obs" role="alert" hidden></p>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar observação</button>
    </form>`;

  const form = raiz.querySelector("form");
  const seletor = form.querySelector("[data-seletor]");
  const secoes = form.querySelector("[data-secoes]");
  const erroObs = form.querySelector("#erro-obs");

  // ---- animal / grupo ----
  const alternar = opcoes({
    rotulo: "Registrar para", variante: "segmentado", valor: alvo,
    itens: [{ valor: "animal", rotulo: "Animal" }, { valor: "grupo", rotulo: "Grupo" }],
    aoMudar: (v) => { alvo = v; aberto = v === "animal" ? "fezes" : "comportamento"; limpar(); desenharSeletor(); desenharSecoes(); },
  });
  form.querySelector("[data-alvo]").append(alternar);

  function limpar() { Object.keys(valores).forEach((k) => (valores[k] = "")); higiene.clear(); erroObs.hidden = true; }

  function desenharSeletor() {
    const rotuloVazio = alvo === "animal" ? "Escolher porquinho" : "Escolher grupo";
    if (alvo === "animal") {
      const a = animalId ? animalPorId(animalId) : null;
      seletor.innerHTML = a
        ? `${avatarHtml(a, 32)}<span class="ds-seletor__texto">${esc(a.nome)}</span>${icone("seta-baixo")}`
        : `<span class="ds-seletor__texto ds-seletor__texto--vazio">${rotuloVazio}</span>${icone("seta-baixo")}`;
    } else {
      const g = grupoId ? grupoPorId(grupoId) : null;
      const animais = g ? g.animais.map(animalPorId).filter(Boolean) : [];
      seletor.innerHTML = g
        ? `<span class="ds-seletor__texto">${esc(g.nome)}</span>${avatarGrupoHtml(animais, 28)}${icone("seta-baixo")}`
        : `<span class="ds-seletor__texto ds-seletor__texto--vazio">${rotuloVazio}</span>${icone("seta-baixo")}`;
    }
  }

  seletor.addEventListener("click", () => {
    if (alvo === "animal") {
      escolherAnimal({
        atualId: animalId, hrefCadastrar: `animal-novo.html?voltar=${encodeURIComponent("registrar-observacao.html")}`,
        aoEscolher: (id) => { animalId = id; limpar(); desenharSeletor(); desenharSecoes(); },
      });
    } else {
      escolherGrupo({ atualId: grupoId, hrefCriar: `grupo-novo.html?voltar=${encodeURIComponent("registrar-observacao.html?alvo=grupo")}`,
        aoEscolher: (id) => { grupoId = id; desenharSeletor(); } });
    }
  });

  // ---- seções (sanfona: uma aberta por vez, como nas imagens) ----
  function secao({ id, titulo, corpo, dica = "" }) {
    // No grupo, Água e Comportamento ficam sempre à mostra (como na imagem 34).
    if (alvo === "grupo" && (id === "agua" || id === "comportamento")) {
      return `<section class="ds-card ds-card--contorno obs-secao" data-secao="${id}">
        <h2 class="t-title obs-secao__fixo">${titulo}</h2>
        <div id="sec-${id}" class="obs-secao__corpo">${corpo}</div></section>`;
    }
    const abertaAgora = aberto === id;
    return `
      <section class="ds-card ds-card--contorno obs-secao" data-secao="${id}">
        <h2 class="obs-secao__titulo">
          <button type="button" class="obs-secao__botao" aria-expanded="${abertaAgora}" aria-controls="sec-${id}" data-abrir="${id}">
            <span class="t-title">${titulo}</span>
            ${abertaAgora && dica ? `<span class="t-caption t-muted obs-secao__dica">${dica}</span>` : ""}
            ${icone("seta-baixo")}
          </button>
        </h2>
        <div id="sec-${id}" class="obs-secao__corpo" ${abertaAgora ? "" : "hidden"}>${corpo}</div>
      </section>`;
  }

  function desenharSecoes() {
    const dica = "Escolha o que mais se parece";
    if (alvo === "animal") {
      const hig = animalId ? HIGIENE.map((h) => {
        const ultima = ultimaHigiene(obter(), animalId, h.id);
        return `<label class="ds-lista__linha ds-lista__linha--caixa">
          <input class="ds-caixa" type="checkbox" data-higiene="${h.id}" ${higiene.has(h.id) ? "checked" : ""}>
          <span class="ds-lista__texto"><span class="t-strong">${h.nome}</span>
          <span class="t-small t-muted">Última vez: <strong>${ultima ? dataCurta(ultima) : "Não informado"}</strong></span></span></label>`;
      }).join("") : `<p class="t-small t-muted">Escolha o porquinho para ver a higiene.</p>`;
      secoes.innerHTML = [
        secao({ id: "fezes", titulo: "Fezes", corpo: listaDeTipos("Fezes", FEZES), dica }),
        secao({ id: "urina", titulo: "Urina", corpo: listaDeTipos("Urina", URINA), dica }),
        secao({ id: "comportamento", titulo: "Comportamento", corpo: `<div data-comp></div>`, dica }),
        secao({ id: "higiene", titulo: "Higiene", corpo: `<div class="ds-lista">${hig}</div>` }),
      ].join("");
    } else {
      secoes.innerHTML = [
        secao({ id: "agua", titulo: "Água", corpo: `<div data-agua></div>` }),
        secao({ id: "comportamento", titulo: "Comportamento do grupo", corpo: `<div data-comp></div>` }),
        secao({
          id: "fezes", titulo: "Fezes do grupo",
          corpo: `<p class="t-caption t-muted obs-nota">Quando você sabe de qual porquinho é, registre em <strong>animal</strong>. Se não sabe, registre aqui como do grupo.</p>${listaDeTipos("Fezes", FEZES)}`,
        }),
        secao({
          id: "urina", titulo: "Urina do grupo",
          corpo: `<p class="t-caption t-muted obs-nota">Quando você sabe de qual porquinho é, registre em <strong>animal</strong>. Se não sabe, registre aqui como do grupo.</p>${listaDeTipos("Urina", URINA)}`,
        }),
      ].join("");
    }

    // opções simples
    const comp = secoes.querySelector("[data-comp]");
    if (comp) comp.append(opcoes({
      rotulo: "Comportamento", valor: valores.comportamento || null,
      itens: COMPORTAMENTO.map((c) => ({ valor: c.id, rotulo: c.nome })),
      aoMudar: (v) => { valores.comportamento = v; erroObs.hidden = true; },
    }));
    const agua = secoes.querySelector("[data-agua]");
    if (agua) agua.append(opcoes({
      rotulo: "Água", valor: valores.agua || null,
      itens: AGUA.map((c) => ({ valor: c.id, rotulo: c.nome })),
      aoMudar: (v) => { valores.agua = v; erroObs.hidden = true; },
    }));

    // tipos de fezes e urina
    for (const sec of secoes.querySelectorAll("[data-secao]")) {
      const campo = sec.dataset.secao;
      if (campo !== "fezes" && campo !== "urina") continue;
      for (const b of sec.querySelectorAll(".obs-tipo")) {
        b.setAttribute("aria-checked", String(valores[campo] === b.dataset.valor));
        b.addEventListener("click", () => {
          valores[campo] = b.dataset.valor;
          erroObs.hidden = true;
          for (const o of sec.querySelectorAll(".obs-tipo")) o.setAttribute("aria-checked", String(o === b));
        });
      }
    }
    for (const c of secoes.querySelectorAll("[data-higiene]")) {
      c.addEventListener("change", () => { c.checked ? higiene.add(c.dataset.higiene) : higiene.delete(c.dataset.higiene); erroObs.hidden = true; });
    }
    for (const b of secoes.querySelectorAll("[data-abrir]")) {
      b.addEventListener("click", () => { aberto = aberto === b.dataset.abrir ? null : b.dataset.abrir; desenharSecoes(); secoes.querySelector(`[data-abrir="${b.dataset.abrir}"]`)?.focus(); });
    }
  }

  // ---- salvar ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const erroAlvo = form.querySelector("#erro-alvo");
    const id = alvo === "animal" ? animalId : grupoId;
    erroAlvo.hidden = true;
    erroObs.hidden = true;
    if (!id) {
      erroAlvo.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>${alvo === "animal" ? "Escolha o porquinho." : "Escolha o grupo."}</span>`;
      erroAlvo.hidden = false;
      seletor.focus();
      return;
    }
    const campos = alvo === "animal"
      ? { fezes: valores.fezes, urina: valores.urina, comportamento: valores.comportamento }
      : { agua: valores.agua, comportamento: valores.comportamento, fezes: valores.fezes, urina: valores.urina };
    if (!Object.values(campos).some(Boolean) && higiene.size === 0) {
      erroObs.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>Escolha ao menos um item para salvar.</span>`;
      erroObs.hidden = false;
      erroObs.focus?.();
      return;
    }
    salvarObservacao({ alvo, alvoId: id, data: dataObs, campos, higiene: [...higiene] });
    const grupoDoAlvo = alvo === "grupo" ? id : animalPorId(id)?.grupoId;
    agendarAviso("Observação salva.");
    location.href = `inicio.html${grupoDoAlvo ? `?grupo=${encodeURIComponent(grupoDoAlvo)}` : ""}`;
  });

  desenharSeletor();
  desenharSecoes();
}
