// Sintomas e ocorrências (imagem: iPhone 16 - 24). Anota algo fora do normal.
// NÃO gera alerta: vai para o histórico de Saúde. Sinais de urgência mostram a orientação na própria tela.

import { obter } from "../store.js";
import { salvarSintoma } from "../acoes.js";
import { campoAnimal } from "../seletores.js";
import { SINTOMAS } from "../conteudo/sintomas.js";
import { esc, campoDia, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

export function telaRegistrarSintomas(raiz) {
  const params = new URLSearchParams(location.search);
  const escolhidos = new Set();

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Sintomas e ocorrências</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo--grande">Animal</span><div data-animal></div></div>
      <fieldset class="form__bloco ds-field">
        <legend class="ds-field__rotulo form__rotulo">O que você notou?</legend>
        <div class="ds-opcoes" data-sintomas>
          ${SINTOMAS.map((s) => `<button type="button" class="ds-opcao" aria-pressed="false" data-sintoma="${s.id}" data-revisao="${s.revisao}">${esc(s.nome)}</button>`).join("")}
        </div>
        <p class="ds-field__erro" id="erro-sintomas" hidden></p>
      </fieldset>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Desde quando?</span><div data-dia></div></div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="nota">Observação</label>
        <textarea class="ds-input ds-input--area" id="nota" name="nota" rows="3" maxlength="400"></textarea>
      </div>
      <div data-urgente aria-live="polite"></div>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const animal = campoAnimal({ valor: params.get("animal"), voltarPara: "registrar-sintomas.html" });
  form.querySelector("[data-animal]").append(animal.el);
  const dia = campoDia({ id: "dia-sintoma", rotulo: "Desde quando" });
  form.querySelector("[data-dia]").append(dia.el);
  const urgenteEl = form.querySelector("[data-urgente]");
  const erroSint = form.querySelector("#erro-sintomas");

  const urgentes = () => SINTOMAS.filter((s) => s.urgente && escolhidos.has(s.id));
  function pintarUrgente() {
    urgenteEl.innerHTML = urgentes().map((s) => `
      <div class="ds-notice ds-notice--urgente" role="note" data-revisao="pendente">
        <span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span>
        <p><strong>${esc(s.orientacao.titulo)}</strong><br>${esc(s.orientacao.texto)}</p>
      </div>`).join("");
  }

  for (const b of form.querySelectorAll("[data-sintoma]")) {
    b.addEventListener("click", () => {
      const id = b.dataset.sintoma;
      const on = !escolhidos.has(id);
      on ? escolhidos.add(id) : escolhidos.delete(id);
      b.setAttribute("aria-pressed", String(on));
      erroSint.hidden = true;
      pintarUrgente();
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let foco = null;
    if (!animal.valor()) { animal.erro("Escolha o porquinho."); foco ??= animal.botao; }
    if (!escolhidos.size) {
      erroSint.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>Escolha ao menos um sintoma.</span>`;
      erroSint.hidden = false;
      foco ??= form.querySelector("[data-sintoma]");
    }
    if (!dia.validar()) foco ??= dia.entrada;
    if (foco) { foco.focus(); return; }

    const id = animal.valor();
    salvarSintoma({ animalId: id, data: dia.valor(), sintomas: [...escolhidos], nota: form.elements.nota.value });
    agendarAviso(urgentes().length ? "Sintomas salvos. Procure um veterinário, sem esperar piorar." : "Sintomas salvos no histórico de Saúde.");
    location.href = `animal.html?id=${encodeURIComponent(id)}&aba=saude`;
  });
}
