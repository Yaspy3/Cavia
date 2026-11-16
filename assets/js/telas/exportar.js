// Exportar histórico (imagem: iPhone 16 - 42). Fluxo 4: Perfil > Exportar histórico >
// animal ou grupo, período e o que incluir > prévia > Salvar PDF.

import { obter, hoje } from "../store.js";
import { animalPorId, grupoPorId, grupoAtual } from "../acoes.js";
import { ITENS, PERIODOS } from "../historico.js";
import { avatarHtml, avatarGrupoHtml } from "../avatar.js";
import { escolherAnimal, escolherGrupo } from "../seletores.js";
import { esc, opcoes, erroCampo } from "../ui.js";
import { icone } from "../icones.js";

export function telaExportar(raiz) {
  const params = new URLSearchParams(location.search);
  const estado = obter();
  const ativos = estado.animais.filter((a) => !a.arquivado);

  let alvo = params.get("alvo") === "grupo" ? "grupo" : "animal";
  let animalId = ativos.some((a) => a.id === params.get("animal") || a.id === params.get("id")) && alvo === "animal"
    ? (params.get("animal") ?? params.get("id")) : (ativos.length === 1 ? ativos[0].id : ativos[0]?.id ?? null);
  let grupoId = alvo === "grupo" && estado.grupos.some((g) => g.id === params.get("id")) ? params.get("id") : grupoAtual()?.id ?? null;
  let periodo = PERIODOS.some((p) => p.id === params.get("periodo")) ? params.get("periodo") : "3m";
  const itens = new Set((params.get("itens") ?? "peso").split(",").filter((i) => ITENS.some((x) => x.id === i)));
  if (!itens.size) itens.add("peso");

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="perfil.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Perfil</p><h1>Exportar histórico</h1></div>
    </header>
    <form class="form" novalidate>
      <div data-alvo></div>
      <div class="ds-field">
        <button class="ds-seletor" type="button" data-seletor aria-haspopup="dialog"></button>
        <p class="ds-field__erro" id="erro-alvo" hidden></p>
      </div>

      <div class="ds-field" data-periodo><span class="ds-field__rotulo form__rotulo" id="rot-periodo">Período</span></div>
      <div class="form__linha" data-pers hidden>
        <div class="ds-field exportar-data"><label class="ds-field__rotulo form__rotulo" for="de">De</label>
          <input class="ds-input" id="de" name="de" type="date" max="${hoje()}" value="${esc(params.get("de") ?? "")}"></div>
        <div class="ds-field exportar-data"><label class="ds-field__rotulo form__rotulo" for="ate">Até</label>
          <input class="ds-input" id="ate" name="ate" type="date" max="${hoje()}" value="${esc(params.get("ate") ?? "")}"></div>
      </div>
      <p class="ds-field__erro" id="erro-periodo" hidden></p>

      <fieldset class="form__bloco ds-field">
        <legend class="ds-field__rotulo form__rotulo">O que incluir?</legend>
        <div class="ds-opcoes" data-itens>
          ${ITENS.map((i) => `<button type="button" class="ds-opcao" aria-pressed="${itens.has(i.id)}" data-item="${i.id}">${i.rotulo}</button>`).join("")}
        </div>
        <p class="ds-field__erro" id="erro-itens" hidden></p>
      </fieldset>

      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Ver prévia do PDF</button>
    </form>`;

  const form = raiz.querySelector("form");
  const seletor = form.querySelector("[data-seletor]");
  const painelPers = form.querySelector("[data-pers]");

  form.querySelector("[data-alvo]").append(opcoes({
    rotulo: "Exportar de", variante: "segmentado", valor: alvo,
    itens: [{ valor: "animal", rotulo: "Animal" }, { valor: "grupo", rotulo: "Grupo" }],
    aoMudar: (v) => { alvo = v; erroCampo(seletor, "erro-alvo", ""); desenharSeletor(); },
  }));

  function desenharSeletor() {
    if (alvo === "animal") {
      const a = animalId ? animalPorId(animalId) : null;
      seletor.innerHTML = a
        ? `${avatarHtml(a, 32)}<span class="ds-seletor__texto">${esc(a.nome)}</span>${icone("seta-baixo")}`
        : `<span class="ds-seletor__texto ds-seletor__texto--vazio">Escolher porquinho</span>${icone("seta-baixo")}`;
    } else {
      const g = grupoId ? grupoPorId(grupoId) : null;
      const animais = g ? g.animais.map(animalPorId).filter(Boolean) : [];
      seletor.innerHTML = g
        ? `<span class="ds-seletor__texto">${esc(g.nome)}</span>${avatarGrupoHtml(animais, 28)}${icone("seta-baixo")}`
        : `<span class="ds-seletor__texto ds-seletor__texto--vazio">Escolher grupo</span>${icone("seta-baixo")}`;
    }
  }
  seletor.addEventListener("click", () => {
    if (alvo === "animal") {
      escolherAnimal({ atualId: animalId, hrefCadastrar: `animal-novo.html?voltar=${encodeURIComponent("exportar.html")}`,
        aoEscolher: (id) => { animalId = id; erroCampo(seletor, "erro-alvo", ""); desenharSeletor(); } });
    } else {
      escolherGrupo({ atualId: grupoId, hrefCriar: `grupo-novo.html?voltar=${encodeURIComponent("exportar.html?alvo=grupo")}`,
        aoEscolher: (id) => { grupoId = id; erroCampo(seletor, "erro-alvo", ""); desenharSeletor(); } });
    }
  });

  form.querySelector("[data-periodo]").append(opcoes({
    rotulo: "Período", valor: periodo,
    itens: PERIODOS.map((p) => ({ valor: p.id, rotulo: p.rotulo })),
    aoMudar: (v) => { periodo = v; painelPers.hidden = v !== "pers"; erroCampo(null, "erro-periodo", ""); },
  }));
  painelPers.hidden = periodo !== "pers";

  for (const b of form.querySelectorAll("[data-item]")) {
    b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      on ? itens.add(b.dataset.item) : itens.delete(b.dataset.item);
      erroCampo(null, "erro-itens", "");
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = alvo === "animal" ? animalId : grupoId;
    let primeiro = null;
    if (!id) { erroCampo(seletor, "erro-alvo", alvo === "animal" ? "Escolha o porquinho." : "Escolha o grupo."); primeiro ??= seletor; }
    const { de, ate } = form.elements;
    if (periodo === "pers") {
      if (!de.value || !ate.value) { erroCampo(de, "erro-periodo", "Escolha a data inicial e a final."); primeiro ??= de; }
      else if (de.value > ate.value) { erroCampo(de, "erro-periodo", "A data inicial precisa ser antes da final."); primeiro ??= de; }
    }
    if (!itens.size) { erroCampo(null, "erro-itens", "Escolha ao menos um item para incluir."); primeiro ??= form.querySelector("[data-item]"); }
    if (primeiro) { primeiro.focus(); return; }

    const q = new URLSearchParams({ alvo, id, periodo, itens: [...itens].join(",") });
    if (periodo === "pers") { q.set("de", de.value); q.set("ate", ate.value); }
    location.href = `exportar-previa.html?${q}`;
  });

  desenharSeletor();
}
