// Criar grupo (imagem: iPhone 16 - 12). Só o nome é obrigatório; os integrantes podem entrar depois.

import { obter } from "../store.js";
import { criarGrupo, editarGrupo, grupoPorId } from "../acoes.js";
import { avatarHtml } from "../avatar.js";
import { esc, erroCampo, agendarAviso, guardarRascunho, pegarRascunho } from "../ui.js";
import { icone } from "../icones.js";

export function telaGrupoNovo(raiz) {
  const params = new URLSearchParams(location.search);
  const voltar = params.get("voltar");
  const estado = obter();
  const editando = params.get("id") ? grupoPorId(params.get("id")) : null;
  const rascunho = pegarRascunho("grupo") ?? { nome: editando?.nome ?? "", integrantes: [] };

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="${esc(voltar ?? "animais.html")}" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Animais</p><h1>${editando ? "Editar grupo" : "Criar grupo"}</h1></div>
    </header>
    <div class="ds-notice ds-notice--atencao" role="note">
      <span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span>
      <p>Um grupo reúne os porquinhos que vivem juntos. Alimentação, água e limpeza são registradas por grupo.</p>
    </div>
    <form class="form" novalidate>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="nome">Nome do grupo</label>
        <input class="ds-input" id="nome" name="nome" type="text" autocomplete="off" maxlength="40"
               aria-describedby="erro-nome" value="${esc(rascunho.nome)}">
        <p class="ds-field__erro" id="erro-nome" hidden></p>
      </div>
      <fieldset class="ds-field form__bloco">
        <legend class="ds-field__rotulo form__rotulo">Integrantes</legend>
        <div class="ds-card ds-card--contorno ds-card--lista">
          ${estado.animais.filter((a) => !a.arquivado).map((a) => {
            const grupo = estado.grupos.find((g) => g.id === a.grupoId);
            const jaEsta = !!editando && a.grupoId === editando.id;
            return `
            <label class="ds-lista__linha ds-lista__linha--caixa">
              ${avatarHtml(a, 40)}
              <span class="ds-lista__texto"><span class="t-strong">${esc(a.nome)}</span>
                ${jaEsta ? `<span class="t-small t-muted">Já está neste grupo</span>` : grupo ? `<span class="t-small t-muted">Hoje em ${esc(grupo.nome)}</span>` : ""}</span>
              <input class="ds-caixa" type="checkbox" name="integrante" value="${a.id}"
                     ${jaEsta || rascunho.integrantes.includes(a.id) ? "checked" : ""} ${jaEsta ? "disabled" : ""}>
            </label>`;
          }).join("")}
          <a class="ds-lista__linha ds-lista__linha--link" href="animal-novo.html?voltar=${encodeURIComponent("grupo-novo.html")}" data-cadastrar>+ Cadastrar um animal</a>
        </div>
      </fieldset>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">${editando ? "Salvar alterações" : "Salvar grupo"}</button>
    </form>`;

  const form = raiz.querySelector("form");
  const nome = form.elements.nome;

  const lerRascunho = () => ({
    nome: nome.value,
    integrantes: [...form.querySelectorAll('[name="integrante"]:checked:not(:disabled)')].map((c) => c.value),
  });
  raiz.querySelector("[data-cadastrar]").addEventListener("click", () => guardarRascunho("grupo", lerRascunho()));
  nome.addEventListener("input", () => erroCampo(nome, "erro-nome", ""));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!nome.value.trim()) {
      erroCampo(nome, "erro-nome", "Digite o nome do grupo.");
      nome.focus();
      return;
    }
    const { integrantes } = lerRascunho();
    if (editando) {
      editarGrupo(editando.id, { nome: nome.value, integrantes });
      agendarAviso("Alterações salvas.");
      location.href = voltar ?? `grupo.html?id=${encodeURIComponent(editando.id)}`;
      return;
    }
    const id = criarGrupo({ nome: nome.value, integrantes });
    agendarAviso(
      `Grupo criado: ${nome.value.trim()}.`,
      voltar ? {} : { acao: "Cadastrar animal", href: `animal-novo.html?grupo=${encodeURIComponent(id)}` },
    );
    location.href = voltar ? `${voltar}${voltar.includes("?") ? "&" : "?"}grupo=${encodeURIComponent(id)}` : "animais.html";
  });
}
