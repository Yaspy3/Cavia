// Cuidados do grupo (imagem: iPhone 16 - 27): água e limpeza, com a data da última vez.
// Feno e ração ficam em Alimentação (a imagem não os traz aqui).

import { obter, hoje } from "../store.js";
import { grupoAtual, salvarCuidados } from "../acoes.js";
import { dataCurta } from "../formato.js";
import { esc, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

const BLOCOS = [
  { titulo: "Água", itens: [{ id: "agua-trocada", rotulo: "Água trocada" }, { id: "bebedouro-lavado", rotulo: "Bebedouro lavado" }] },
  { titulo: "Limpeza", itens: [{ id: "limpeza-dia", rotulo: "Limpeza do dia" }, { id: "troca-forracao", rotulo: "Troca completa da forração" }] },
];

export function telaRegistrarCuidados(raiz) {
  const params = new URLSearchParams(location.search);
  const estado = obter();
  if (!estado.grupos.length) {
    raiz.innerHTML = `
      <header class="ds-header"><a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
        <div><p class="ds-header__sobre">Registrar</p><h1>Cuidados do grupo</h1></div></header>
      <div class="ds-card ds-card--contorno form__sem-grupo">
        <p class="t-small">Os cuidados são registrados por grupo. Crie um grupo primeiro.</p>
        <a class="ds-button ds-button--secundario" href="grupo-novo.html?voltar=${encodeURIComponent("registrar-cuidados.html")}">Criar um grupo</a>
      </div>`;
    return;
  }

  let grupoId = estado.grupos.some((g) => g.id === params.get("grupo")) ? params.get("grupo") : grupoAtual()?.id;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Cuidados do grupo</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo--grande" for="grupo">Grupo</label>
        <select class="ds-input ds-input--select" id="grupo" name="grupo">
          ${estado.grupos.map((g) => `<option value="${g.id}" ${g.id === grupoId ? "selected" : ""}>${esc(g.nome)}</option>`).join("")}
        </select>
      </div>
      <p class="t-small t-muted">Marque o que você fez hoje.</p>
      <div data-blocos class="form"></div>
      <p class="ds-field__erro" id="erro-cuidados" role="alert" hidden></p>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const caixa = form.querySelector("[data-blocos]");

  function pintar() {
    const e = obter();
    const ultima = (tipo) => e.cuidadosGrupo.filter((c) => c.grupoId === grupoId && c.tipo === tipo).map((c) => c.data).sort().at(-1);
    caixa.innerHTML = BLOCOS.map((b) => `
      <fieldset class="form__bloco">
        <legend class="form__rotulo--grande ds-field__rotulo">${b.titulo}</legend>
        <div class="ds-card ds-card--contorno ds-card--lista">
          ${b.itens.map((i) => {
            const u = ultima(i.id);
            const feitoHoje = u === hoje();
            return `<label class="ds-lista__linha ds-lista__linha--caixa">
              <input class="ds-caixa" type="checkbox" value="${i.id}" ${feitoHoje ? "checked disabled" : ""}>
              <span class="ds-lista__texto"><span class="t-strong">${i.rotulo}</span>
                <span class="t-small t-muted">${feitoHoje ? "Já registrado hoje" : `Última vez: <strong>${u ? dataCurta(u) : "Não informado"}</strong>`}</span></span>
            </label>`;
          }).join("")}
        </div>
      </fieldset>`).join("");
    for (const c of caixa.querySelectorAll("input")) c.addEventListener("change", () => { form.querySelector("#erro-cuidados").hidden = true; });
  }
  pintar();
  form.elements.grupo.addEventListener("change", (e) => { grupoId = e.target.value; pintar(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const tipos = [...caixa.querySelectorAll("input:checked:not(:disabled)")].map((c) => c.value);
    if (!tipos.length) {
      const erro = form.querySelector("#erro-cuidados");
      erro.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>Marque ao menos um cuidado feito.</span>`;
      erro.hidden = false;
      return;
    }
    salvarCuidados({ grupoId, data: hoje(), tipos });
    agendarAviso("Cuidados salvos.");
    location.href = `inicio.html?grupo=${encodeURIComponent(grupoId)}`;
  });
}
