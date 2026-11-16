// Check-up de saúde (imagens: iPhone 16 - 28 e pop-up 36). Tudo já vem como normal: a pessoa marca
// só o que estranhar. "Atenção" abre o pop-up "O que você viu?". O "i" mostra como olhar (texto a validar).
// Itens com atenção geram "item com atenção" no Início, com o "o que fazer".

import { obter, hoje } from "../store.js";
import { salvarCheckup } from "../acoes.js";
import { campoAnimal } from "../seletores.js";
import { GRUPOS_CHECKUP, ITENS_CHECKUP, itemCheckup } from "../conteudo/checkup.js";
import { esc, abrirFolha, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

/** Pop-up "O que você viu?" de um item marcado com atenção. */
function abrirAchados({ item, atual, aoSalvar }) {
  const marcados = new Set(atual?.achados ?? []);
  abrirFolha({
    titulo: item.rotulo,
    montar(corpo, fechar) {
      corpo.innerHTML = `
        <p class="t-small t-muted">O que você viu?</p>
        ${item.achados.length ? `<div class="ds-opcoes" data-achados>
          ${item.achados.map((a) => `<button type="button" class="ds-opcao" aria-pressed="${marcados.has(a)}" data-achado="${esc(a)}" data-revisao="pendente">${esc(a)}</button>`).join("")}</div>` : ""}
        <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="obs-item">Observação (opcional)</label>
          <textarea class="ds-input ds-input--area" id="obs-item" rows="3" maxlength="300">${esc(atual?.nota ?? "")}</textarea></div>
        <div class="ds-folha__acoes"><button type="button" class="ds-button ds-button--registrar ds-button--bloco" data-salvar>Salvar</button></div>`;
      for (const b of corpo.querySelectorAll("[data-achado]")) {
        b.addEventListener("click", () => {
          const on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", String(on));
          on ? marcados.add(b.dataset.achado) : marcados.delete(b.dataset.achado);
        });
      }
      corpo.querySelector("[data-salvar]").addEventListener("click", () => {
        fechar("salvou");
        aoSalvar({ achados: [...marcados], nota: corpo.querySelector("#obs-item").value.trim() });
      });
    },
  });
}

function abrirComoOlhar(item) {
  abrirFolha({
    titulo: item.rotulo,
    montar(corpo, fechar) {
      corpo.innerHTML = `<p class="t-body" data-revisao="${item.revisao}">${esc(item.olhar)}</p>
        <div class="ds-folha__acoes"><button type="button" class="ds-button ds-button--bloco" data-fechar>Fechar</button></div>`;
      corpo.querySelector("[data-fechar]").addEventListener("click", () => fechar("fechar"));
    },
  });
}

export function telaRegistrarCheckup(raiz) {
  const params = new URLSearchParams(location.search);
  const itens = {};
  const detalhes = {};

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Check-up de saúde</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo--grande">Animal</span><div data-animal></div></div>
      <div class="ds-notice ds-notice--atencao" role="note">
        <span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span>
        <p>Tudo já vem como normal. Marque o que estranhar. Aperte em <strong>i</strong> para ver como olhar.</p>
      </div>
      <div data-grupos class="form"></div>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const animal = campoAnimal({ valor: params.get("animal"), voltarPara: "registrar-checkup.html", aoMudar: carregar });
  form.querySelector("[data-animal]").append(animal.el);
  const caixa = form.querySelector("[data-grupos]");

  /** Começa tudo "normal"; se já há check-up do animal hoje, parte dele. */
  function carregar() {
    for (const i of ITENS_CHECKUP) { itens[i.id] = "normal"; delete detalhes[i.id]; }
    const existente = animal.valor() ? obter().checkups.find((c) => c.animalId === animal.valor() && c.data === hoje()) : null;
    if (existente) { Object.assign(itens, existente.itens); Object.assign(detalhes, existente.detalhes ?? {}); }
    pintar();
  }

  function pintar() {
    caixa.innerHTML = GRUPOS_CHECKUP.map((g) => `
      <fieldset class="form__bloco">
        <legend class="form__rotulo--grande ds-field__rotulo">${g.rotulo}</legend>
        <div class="ds-card ds-card--contorno ds-card--lista">
          ${g.itens.map((id) => {
            const i = itemCheckup(id);
            const atencao = itens[id] === "atencao";
            return `<div class="chk-linha" data-item="${id}">
              <span class="chk-icone">${icone(i.icone)}</span>
              <span class="chk-nome t-strong">${esc(i.rotulo)}</span>
              <button type="button" class="alim-info" data-como="${id}" aria-label="Como olhar: ${esc(i.rotulo)}">${icone("info", { tamanho: 20 })}</button>
              <div class="chk-estado" role="radiogroup" aria-label="${esc(i.rotulo)}">
                <button type="button" role="radio" class="chk-opcao chk-opcao--normal" aria-checked="${!atencao}" data-estado="normal">${!atencao ? icone("check", { tamanho: 14 }) : ""}Normal</button>
                <button type="button" role="radio" class="chk-opcao chk-opcao--atencao" aria-checked="${atencao}" data-estado="atencao">${atencao ? icone("triangulo", { tamanho: 14 }) : ""}Atenção</button>
              </div>
            </div>`;
          }).join("")}
        </div>
      </fieldset>`).join("");

    for (const linha of caixa.querySelectorAll("[data-item]")) {
      const id = linha.dataset.item;
      const item = itemCheckup(id);
      linha.querySelector('[data-estado="normal"]').addEventListener("click", () => { itens[id] = "normal"; delete detalhes[id]; pintar(); focar(id, "normal"); });
      linha.querySelector('[data-estado="atencao"]').addEventListener("click", () => {
        itens[id] = "atencao";
        pintar();
        abrirAchados({ item, atual: detalhes[id], aoSalvar: (d) => { detalhes[id] = d; } });
      });
      linha.querySelector("[data-como]").addEventListener("click", () => abrirComoOlhar(item));
    }
  }
  function focar(id, estado) { caixa.querySelector(`[data-item="${id}"] [data-estado="${estado}"]`)?.focus(); }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!animal.valor()) { animal.erro("Escolha o porquinho."); animal.botao.focus(); return; }
    const id = animal.valor();
    salvarCheckup({ animalId: id, data: hoje(), itens: { ...itens }, detalhes: { ...detalhes } });
    const comAtencao = Object.values(itens).some((v) => v === "atencao");
    const grupo = obter().animais.find((a) => a.id === id)?.grupoId;
    if (comAtencao) {
      agendarAviso("Check-up salvo. Há itens com atenção: veja o que fazer no Início.");
      location.href = `inicio.html${grupo ? `?grupo=${encodeURIComponent(grupo)}` : ""}`;
    } else {
      agendarAviso("Check-up salvo. Tudo normal.");
      location.href = `animal.html?id=${encodeURIComponent(id)}&aba=diario`;
    }
  });

  carregar();
}
