// Conta (SEM imagem de referência: proposta mínima). Nome e e-mail ficam só neste aparelho.
// Não existe senha nem login: nada de senha é guardado.

import { obter, zerar } from "../store.js";
import { salvarConta } from "../acoes.js";
import { esc, erroCampo, confirmar, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function telaConta(raiz) {
  const conta = obter().conta;
  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="perfil.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Perfil</p><h1>Conta</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="nome">Nome</label>
        <input class="ds-input" id="nome" name="nome" type="text" autocomplete="off" maxlength="60" aria-describedby="erro-nome" value="${esc(conta?.nome ?? "")}">
        <p class="ds-field__erro" id="erro-nome" hidden></p>
      </div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="email">E-mail</label>
        <input class="ds-input" id="email" name="email" type="email" inputmode="email" autocomplete="off" maxlength="80" aria-describedby="erro-email" value="${esc(conta?.email ?? "")}">
        <p class="ds-field__erro" id="erro-email" hidden></p>
      </div>
      <p class="t-small t-muted">Estes dados ficam só neste aparelho. O Cavia não pede nem guarda senha.</p>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>
    <section class="conta-perigo" aria-labelledby="t-excluir">
      <h2 class="t-title" id="t-excluir">Excluir conta</h2>
      <p class="t-small t-muted">Apaga todos os dados deste aparelho: animais, grupos, registros e lembretes. Não dá para desfazer.</p>
      <button type="button" class="ds-button ds-button--contorno ds-button--bloco" data-excluir>Excluir conta</button>
    </section>`;

  const form = raiz.querySelector("form");
  const { nome, email } = form.elements;
  nome.addEventListener("input", () => erroCampo(nome, "erro-nome", ""));
  email.addEventListener("input", () => erroCampo(email, "erro-email", ""));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let primeiro = null;
    if (!nome.value.trim()) { erroCampo(nome, "erro-nome", "Digite o seu nome."); primeiro ??= nome; }
    if (email.value.trim() && !FORMATO_EMAIL.test(email.value.trim())) {
      erroCampo(email, "erro-email", "O e-mail parece incompleto. Confira se tem @ e o final, como .com.");
      primeiro ??= email;
    }
    if (primeiro) { primeiro.focus(); return; }
    salvarConta({ nome: nome.value, email: email.value });
    agendarAviso("Conta salva.");
    location.href = "perfil.html";
  });

  raiz.querySelector("[data-excluir]").addEventListener("click", async () => {
    const ok = await confirmar({
      titulo: "Excluir a conta?",
      texto: "Todos os dados deste aparelho serão apagados. Isso não pode ser desfeito.",
      rotuloConfirmar: "Excluir tudo", rotuloCancelar: "Cancelar",
    });
    if (!ok) return;
    zerar();
    agendarAviso("Conta e dados excluídos.");
    location.href = "inicio.html";
  });
}
