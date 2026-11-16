// Registrar alimentação (imagens: iPhone 16 - 22 e pop-up 35). Registro por GRUPO:
// feno, ração e vegetais e frutas do dia. O conteúdo nutricional é provisório (revisao: "pendente").

import { obter, hoje } from "../store.js";
import { grupoPorId, grupoAtual, salvarAlimentacao, definirAlimentoNoDia, animaisDoGrupo } from "../acoes.js";
import { ALIMENTOS, CATEGORIAS, alimentoPorId } from "../conteudo/alimentos.js";
import { somarDias } from "../datas.js";
import { inicialDia, diaSemana, dataCurta } from "../formato.js";
import { esc, opcoes, campoDia, abrirFolha, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const ultimos7 = () => Array.from({ length: 7 }, (_, i) => somarDias(hoje(), i - 6));

/** Chip de frequência sugerida: "Todo dia" (estável) ou "1 - 2x/sem" (atenção). */
function chipFrequencia(a) {
  if (!a.frequencia) return "";
  return a.frequencia.max === null
    ? `<span class="ds-chip ds-chip--estavel">${a.frequencia.rotulo}</span>`
    : `<span class="ds-chip ds-chip--atencao">${a.frequencia.rotulo}</span>`;
}

const registroDoDia = (grupoId, data) => obter().alimentacao.find((r) => r.grupoId === grupoId && r.data === data);

/** Pop-up do alimento: informação, sugestão e a semana (dá para ajustar os dias e salvar). */
function abrirAlimento({ alimento, grupoId, aoSalvar }) {
  const dias = ultimos7();
  const marcados = new Set(dias.filter((d) => registroDoDia(grupoId, d)?.alimentos.includes(alimento.id)));
  abrirFolha({
    titulo: alimento.nome,
    montar(corpo, fechar) {
      const cat = CATEGORIAS.find((c) => c.id === alimento.categoria)?.rotulo ?? "";
      const max = alimento.frequencia?.max ?? null;
      corpo.innerHTML = `
        <p class="t-small t-muted">${esc(cat)}</p>
        ${alimento.frequencia ? `<p class="alim-sugestao"><span class="ds-chip ds-chip--saude" data-revisao="pendente">Sugestão: ${esc(alimento.frequencia.texto)}</span></p>` : ""}
        <section class="ds-card ds-card--contorno alim-semana" aria-labelledby="t-semana">
          <header class="dados-topo"><h3 class="t-strong" id="t-semana">Esta semana</h3><span class="t-small alim-contagem" data-contagem></span></header>
          <div class="alim-dias" role="group" aria-label="Dias em que foi oferecido">
            ${dias.map((d) => `<button type="button" class="alim-dia" data-dia="${d}" aria-pressed="false" aria-label="${diaSemana(d)} ${dataCurta(d)}">
              <span class="alim-dia__letra" aria-hidden="true">${inicialDia(d)}</span><span class="alim-dia__ponto" aria-hidden="true">${icone("check", { tamanho: 14 })}</span></button>`).join("")}
          </div>
        </section>
        ${alimento.nutrientes ? `
          <h3 class="t-strong alim-sub">A cada 10 g</h3>
          <ul class="alim-nutrientes" data-revisao="pendente">${alimento.nutrientes.map((n) => `
            <li><span>${esc(n.nome)}</span><span class="alim-nutrientes__valor">${esc(n.valor)}</span>
            <span class="ds-chip ${n.tom === "atencao" ? "ds-chip--atencao" : "ds-chip--estavel"}">${n.nivel === "alto" ? "Alto" : "Normal"}</span></li>`).join("")}</ul>`
        : `<p class="t-small t-muted alim-sub">Os valores nutricionais deste alimento estão em validação.</p>`}
        <div data-aviso></div>
        <div class="ds-folha__acoes"><button type="button" class="ds-button ds-button--registrar ds-button--bloco" data-salvar>Salvar</button></div>`;

      const desenhar = () => {
        const n = marcados.size;
        const acima = max !== null && n > max;
        for (const b of corpo.querySelectorAll("[data-dia]")) b.setAttribute("aria-pressed", String(marcados.has(b.dataset.dia)));
        const c = corpo.querySelector("[data-contagem]");
        c.textContent = `${n} ${n === 1 ? "vez" : "vezes"}${acima ? " - acima da sugestão" : ""}`;
        c.classList.toggle("alim-contagem--acima", acima);
        corpo.querySelector("[data-aviso]").innerHTML = acima && alimento.aviso
          ? `<div class="ds-notice ds-notice--atencao" data-revisao="pendente"><span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span><p>${esc(alimento.aviso)}</p></div>` : "";
      };
      for (const b of corpo.querySelectorAll("[data-dia]")) {
        b.addEventListener("click", () => { marcados.has(b.dataset.dia) ? marcados.delete(b.dataset.dia) : marcados.add(b.dataset.dia); desenhar(); });
      }
      corpo.querySelector("[data-salvar]").addEventListener("click", () => {
        for (const d of dias) definirAlimentoNoDia(grupoId, d, alimento.id, marcados.has(d));
        fechar("salvou");
        aoSalvar();
      });
      desenhar();
    },
  });
}

export function telaRegistrarAlimentacao(raiz) {
  const params = new URLSearchParams(location.search);
  const estado = obter();
  if (!estado.grupos.length) {
    raiz.innerHTML = `
      <header class="ds-header"><a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
        <div><p class="ds-header__sobre">Registrar</p><h1>Alimentação</h1></div></header>
      <div class="ds-card ds-card--contorno form__sem-grupo">
        <p class="t-small">A alimentação é registrada por grupo. Crie um grupo primeiro.</p>
        <a class="ds-button ds-button--secundario" href="grupo-novo.html?voltar=${encodeURIComponent("registrar-alimentacao.html")}">Criar um grupo</a>
      </div>`;
    return;
  }

  let grupoId = estado.grupos.some((g) => g.id === params.get("grupo")) ? params.get("grupo") : grupoAtual()?.id;
  let filtro = "tudo";
  let busca = "";
  let feno = false;
  let racao = false;
  const marcados = new Set();

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Alimentação</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="grupo">Grupo</label>
        <select class="ds-input ds-input--select" id="grupo" name="grupo">
          ${estado.grupos.map((g) => `<option value="${g.id}" ${g.id === grupoId ? "selected" : ""}>${esc(g.nome)}</option>`).join("")}
        </select>
      </div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Dia</span><div data-dia></div></div>

      <section class="ds-card ds-card--contorno" aria-labelledby="t-base">
        <header class="dados-topo"><h2 class="t-title" id="t-base">Base da dieta</h2><span class="t-caption t-muted">Marque o que foi oferecido</span></header>
        <div class="alim-base">
          <button type="button" class="ds-opcao" data-base="feno" aria-pressed="false">Feno</button>
          <button type="button" class="ds-opcao" data-base="racao" aria-pressed="false">Ração</button>
        </div>
      </section>

      <div class="ds-field">
        <h2 class="form__rotulo" id="t-veg">Vegetais e frutas</h2>
        <label class="so-leitor" for="busca">Buscar alimento</label>
        <div class="alim-busca">${icone("busca")}<input class="ds-input" id="busca" type="search" placeholder="Buscar alimento" autocomplete="off"></div>
        <div data-filtro></div>
        <div class="ds-card ds-card--contorno ds-card--lista" data-lista role="group" aria-labelledby="t-veg"></div>
      </div>
      <p class="ds-field__erro" id="erro-alim" role="alert" hidden></p>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar alimentação</button>
    </form>`;

  const form = raiz.querySelector("form");
  const dia = campoDia({ id: "dia-alim", aoMudar: carregarDoDia });
  form.querySelector("[data-dia]").append(dia.el);
  const lista = form.querySelector("[data-lista]");

  function carregarDoDia() {
    const r = registroDoDia(grupoId, dia.valor());
    marcados.clear();
    (r?.alimentos ?? []).forEach((id) => marcados.add(id));
    feno = !!r?.feno;
    racao = !!r?.racao;
    pintarBase();
    pintarLista();
  }

  function pintarBase() {
    form.querySelector('[data-base="feno"]').setAttribute("aria-pressed", String(feno));
    form.querySelector('[data-base="racao"]').setAttribute("aria-pressed", String(racao));
  }

  function pintarLista() {
    const itens = ALIMENTOS.filter((a) => (filtro === "tudo" || a.categoria === filtro) && semAcento(a.nome).includes(semAcento(busca)));
    lista.innerHTML = itens.length ? itens.map((a) => `
      <div class="alim-linha">
        <label class="alim-linha__marcar">
          <input class="ds-caixa" type="checkbox" value="${a.id}" ${marcados.has(a.id) ? "checked" : ""}>
          <span class="ds-lista__texto"><span class="t-strong" data-revisao="pendente">${esc(a.nome)}</span>
            ${a.etiqueta ? `<span class="t-small t-muted" data-revisao="pendente">${esc(a.etiqueta)}</span>` : ""}</span>
          ${chipFrequencia(a)}
        </label>
        <button type="button" class="alim-info" data-info="${a.id}" aria-label="Informações sobre ${esc(a.nome)}">${icone("info", { tamanho: 20 })}</button>
      </div>`).join("")
      : `<p class="t-small t-muted alim-vazio">${filtro === "frutas" ? "Nenhuma fruta cadastrada ainda." : "Nenhum alimento encontrado."}</p>`;
    for (const c of lista.querySelectorAll('input[type="checkbox"]')) {
      c.addEventListener("change", () => { c.checked ? marcados.add(c.value) : marcados.delete(c.value); form.querySelector("#erro-alim").hidden = true; });
    }
    for (const b of lista.querySelectorAll("[data-info]")) {
      b.addEventListener("click", () => abrirAlimento({ alimento: alimentoPorId(b.dataset.info), grupoId, aoSalvar: carregarDoDia }));
    }
  }

  form.querySelector("#grupo").addEventListener("change", (e) => { grupoId = e.target.value; carregarDoDia(); });
  for (const b of form.querySelectorAll("[data-base]")) {
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      if (b.dataset.base === "feno") feno = on; else racao = on;
      pintarBase();
      form.querySelector("#erro-alim").hidden = true;
    });
  }
  form.querySelector("#busca").addEventListener("input", (e) => { busca = e.target.value; pintarLista(); });
  form.querySelector("[data-filtro]").append(opcoes({
    rotulo: "Categoria", valor: filtro,
    itens: [{ valor: "tudo", rotulo: "Tudo" }, ...CATEGORIAS.map((c) => ({ valor: c.id, rotulo: c.rotulo }))],
    aoMudar: (v) => { filtro = v; pintarLista(); },
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const erro = form.querySelector("#erro-alim");
    if (!dia.validar()) return;
    if (!feno && !racao && marcados.size === 0) {
      erro.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>Marque ao menos um item oferecido.</span>`;
      erro.hidden = false;
      return;
    }
    salvarAlimentacao({ grupoId, data: dia.valor(), alimentos: [...marcados], feno, racao });
    agendarAviso("Alimentação salva.");
    location.href = `grupo.html?id=${encodeURIComponent(grupoId)}&aba=alimentacao`;
  });

  carregarDoDia();
}
