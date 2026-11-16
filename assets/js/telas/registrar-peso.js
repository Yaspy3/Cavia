// Registrar peso (imagem: iPhone 16 - 19). Fluxo 1: Registrar > Peso > animal > peso > Salvar.

import { obter, hoje } from "../store.js";
import { registrarPeso, animalPorId } from "../acoes.js";
import { pesagensDoAnimal, avaliarPeso } from "../regras.js";
import { graficoPeso } from "../graficos.js";
import { avatarHtml } from "../avatar.js";
import { escolherAnimal } from "../seletores.js";
import { gramas, dataCurta, dataRelativa } from "../formato.js";
import { esc, opcoes, erroCampo } from "../ui.js";
import { icone } from "../icones.js";

const PASSO_GRAMAS = 10;

/** Entrada do peso isolada em um componente (botões de 10 em 10 g + digitação),
 *  para poder trocar a variação depois. Devolve { el, valor(), limpar(), aoMudar(fn) }. */
function entradaPeso({ base }) {
  const el = document.createElement("div");
  el.className = "peso-entrada";
  el.innerHTML = `
    <button class="peso-entrada__passo" type="button" data-passo="-1" aria-label="Diminuir ${PASSO_GRAMAS} gramas">${icone("menos")}</button>
    <div class="peso-entrada__campo">
      <input id="peso" name="peso" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off"
             aria-label="Peso em gramas" aria-describedby="erro-peso aviso-peso">
      <span class="peso-entrada__unidade" aria-hidden="true">g</span>
    </div>
    <button class="peso-entrada__passo" type="button" data-passo="1" aria-label="Aumentar ${PASSO_GRAMAS} gramas">${icone("mais")}</button>`;
  const input = el.querySelector("input");
  const ouvintes = [];
  const avisar = () => ouvintes.forEach((fn) => fn());
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, ""); avisar(); });
  for (const b of el.querySelectorAll("[data-passo]")) {
    b.addEventListener("click", () => {
      const inicio = input.value !== "" ? Number(input.value) : (base() ?? 0);
      input.value = String(Math.max(0, inicio + Number(b.dataset.passo) * PASSO_GRAMAS));
      avisar();
    });
  }
  return {
    el, input,
    valor: () => (input.value === "" ? null : Number(input.value)),
    limpar: () => { input.value = ""; avisar(); },
    aoMudar: (fn) => ouvintes.push(fn),
  };
}

export function telaRegistrarPeso(raiz) {
  const params = new URLSearchParams(location.search);
  const estado0 = obter();
  const ativos = estado0.animais.filter((a) => !a.arquivado);

  let animalId = params.get("animal");
  if (!animalId || !ativos.some((a) => a.id === animalId)) animalId = ativos.length === 1 ? ativos[0].id : null;
  let dataTipo = "hoje";

  const hrefCadastrar = `animal-novo.html?voltar=${encodeURIComponent("registrar-peso.html")}`;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Peso</h1></div>
    </header>
    <div data-confirmacao role="status" aria-live="polite"></div>
    <form class="form" novalidate>
      <div class="ds-field">
        <span class="ds-field__rotulo form__rotulo--grande" id="rot-animal">Animal</span>
        <button class="ds-seletor" type="button" data-animal aria-haspopup="dialog" aria-labelledby="rot-animal animal-atual"></button>
        <p class="ds-field__erro" id="erro-animal" hidden></p>
      </div>

      <div class="ds-field">
        <div class="form__linha form__linha--centro">
          <span class="ds-field__rotulo form__rotulo--grande" id="rot-data">Data</span>
          <div data-data-tipo></div>
        </div>
        <div data-data-outra hidden>
          <label class="so-leitor" for="data-outra">Data da pesagem</label>
          <input class="ds-input" id="data-outra" type="date" max="${hoje()}" value="${hoje()}" aria-describedby="erro-data">
        </div>
        <p class="ds-field__erro" id="erro-data" hidden></p>
      </div>

      <section class="ds-card ds-card--contorno peso-cartao" aria-labelledby="titulo-peso">
        <h2 class="t-title" id="titulo-peso">Peso de hoje</h2>
        <div data-entrada></div>
        <p class="t-small t-muted peso-cartao__ajuda">Toque nos botões para ajustar de 10 em 10 g ou toque no número para digitar</p>
        <p class="ds-field__erro" id="erro-peso" hidden></p>
      </section>

      <section class="ds-card ds-card--contorno" aria-labelledby="titulo-grafico">
        <h2 class="t-title" id="titulo-grafico">Últimas pesagens</h2>
        <p class="t-small t-muted" data-ultimo></p>
        <div data-grafico></div>
      </section>

      <div id="aviso-peso" data-aviso aria-live="polite"></div>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar peso</button>
    </form>`;

  const form = raiz.querySelector("form");
  const botaoAnimal = form.querySelector("[data-animal]");
  const painelOutra = form.querySelector("[data-data-outra]");
  const dataOutra = form.querySelector("#data-outra");
  const tituloPeso = form.querySelector("#titulo-peso");
  const avisoEl = form.querySelector("[data-aviso]");
  const confirmacao = raiz.querySelector("[data-confirmacao]");

  const historico = () => (animalId ? pesagensDoAnimal(obter(), animalId) : []);
  const entrada = entradaPeso({ base: () => historico().at(-1)?.gramas ?? null });
  form.querySelector("[data-entrada]").append(entrada.el);

  const dataEscolhida = () => (dataTipo === "hoje" ? hoje() : dataOutra.value);

  function desenharAnimal() {
    const a = animalId ? animalPorId(animalId) : null;
    botaoAnimal.innerHTML = a
      ? `${avatarHtml(a, 32)}<span class="ds-seletor__texto" id="animal-atual">${esc(a.nome)}</span>${icone("seta-baixo")}`
      : `<span class="ds-seletor__texto ds-seletor__texto--vazio" id="animal-atual">Escolher porquinho</span>${icone("seta-baixo")}`;
  }

  function desenharGrafico() {
    const a = animalId ? animalPorId(animalId) : null;
    const h = historico();
    form.querySelector("[data-grafico]").innerHTML = a ? graficoPeso(h, { rotulo: a.nome }) : `<p class="t-small t-muted">Escolha o porquinho para ver as últimas pesagens.</p>`;
    const ultimo = h.at(-1);
    form.querySelector("[data-ultimo]").textContent = ultimo ? `Último peso: ${gramas(ultimo.gramas)}, ${dataRelativa(ultimo.data)}` : "";
  }

  function conferirPeso() {
    erroCampo(entrada.input, "erro-peso", "");
    const v = entrada.valor();
    const alerta = v ? avaliarPeso(historico(), v) : null;
    avisoEl.innerHTML = alerta
      ? `<div class="ds-notice ds-notice--atencao"><span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span><p>${esc(alerta.texto)}</p></div>`
      : "";
  }
  entrada.aoMudar(conferirPeso);

  form.querySelector("[data-data-tipo]").append(opcoes({
    rotulo: "Data da pesagem", valor: dataTipo,
    itens: [{ valor: "hoje", rotulo: "Hoje" }, { valor: "outra", rotulo: "Outra data" }],
    aoMudar: (v) => {
      dataTipo = v;
      painelOutra.hidden = v === "hoje";
      tituloPeso.textContent = v === "hoje" ? "Peso de hoje" : "Peso do dia";
      erroCampo(null, "erro-data", "");
      if (v === "outra") dataOutra.focus();
    },
  }));

  botaoAnimal.addEventListener("click", () => escolherAnimal({
    atualId: animalId, hrefCadastrar,
    aoEscolher: (id) => {
      animalId = id;
      erroCampo(botaoAnimal, "erro-animal", "");
      confirmacao.innerHTML = "";
      desenharAnimal(); desenharGrafico(); conferirPeso();
      entrada.input.focus();
    },
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let primeiro = null;
    const v = entrada.valor();
    if (!animalId) { erroCampo(botaoAnimal, "erro-animal", "Escolha o porquinho."); primeiro ??= botaoAnimal; }
    if (dataTipo === "outra" && (!dataOutra.value || dataOutra.value > hoje())) {
      erroCampo(dataOutra, "erro-data", "Escolha uma data que não seja no futuro.");
      primeiro ??= dataOutra;
    }
    if (!v || v < 1) { erroCampo(entrada.input, "erro-peso", "Digite o peso em gramas."); primeiro ??= entrada.input; }
    if (primeiro) { primeiro.focus(); return; }

    const data = dataEscolhida();
    const { atualizado } = registrarPeso({ animalId, data, gramas: v });
    const a = animalPorId(animalId);
    confirmacao.innerHTML = `
      <div class="ds-notice ds-notice--ok" tabindex="-1">
        <span class="ds-notice__icone">${icone("check", { tamanho: 20 })}</span>
        <div>
          <p class="t-title">Peso salvo</p>
          <p>${esc(a.nome)}: ${gramas(v)} ${data === hoje() ? "hoje" : `em ${dataCurta(data)}`}.${atualizado ? " O peso desse dia foi atualizado." : ""}</p>
          <a class="form__link" href="animal.html?id=${encodeURIComponent(a.id)}">Ver o perfil de ${esc(a.nome)}</a>
        </div>
      </div>`;
    entrada.limpar();
    avisoEl.innerHTML = "";
    desenharGrafico();
    const caixa = confirmacao.firstElementChild;
    caixa.scrollIntoView({ block: "nearest" });
    caixa.focus();
  });

  desenharAnimal();
  desenharGrafico();
}
