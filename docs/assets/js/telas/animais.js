// Lista de animais por grupo (imagem: iPhone 16 - 2).

import { obter, assinar } from "../store.js";
import { statusPeso } from "../regras.js";
import { avatarHtml } from "../avatar.js";
import { chipStatusPeso, esc } from "../ui.js";
import { icone } from "../icones.js";
import { animaisDoGrupo } from "../acoes.js";

const contar = (n) => (n === 0 ? "Sem animais" : n === 1 ? "1 animal" : `${n} animais`);

function cartaoGrupo(grupo, estado) {
  const animais = animaisDoGrupo(grupo.id);
  const linhas = animais.length
    ? animais.map((a) => `
        <li>
          <a class="animais__linha" href="animal.html?id=${encodeURIComponent(a.id)}">
            ${avatarHtml(a, 40)}
            <span class="animais__nome t-title">${esc(a.nome)}</span>
            ${chipStatusPeso(statusPeso(estado, a.id))}
          </a>
        </li>`).join("")
    : `<li class="animais__vazio t-small t-muted">Nenhum porquinho neste grupo ainda.
         <a href="animal-novo.html?grupo=${encodeURIComponent(grupo.id)}">Cadastrar um animal</a></li>`;
  return `
    <section class="ds-card ds-card--contorno animais__grupo" aria-labelledby="g-${grupo.id}">
      <header class="animais__grupo-topo">
        <h2 class="t-title" id="g-${grupo.id}">${esc(grupo.nome)}</h2>
        <span class="ds-chip">${contar(animais.length)}</span>
        <a class="animais__ver" href="grupo.html?id=${encodeURIComponent(grupo.id)}">Ver grupo ${icone("seta-direita", { tamanho: 16 })}</a>
      </header>
      <ul>${linhas}</ul>
    </section>`;
}

export function telaAnimais(raiz) {
  const desenhar = () => {
    const estado = obter();
    raiz.innerHTML = `
      <header class="registrar__titulo">
        <h1 class="t-h1">Animais</h1>
        <p>Seus grupos e porquinhos</p>
      </header>
      <div class="animais__acoes">
        <a class="ds-button" href="grupo-novo.html">Criar um grupo</a>
        <a class="ds-button ds-button--contorno" href="animal-novo.html">Cadastrar um animal</a>
      </div>
      ${estado.grupos.length
        ? estado.grupos.map((g) => cartaoGrupo(g, estado)).join("")
        : `<div class="ds-card ds-card--contorno">
             <p class="t-title">Você ainda não tem grupos</p>
             <p class="t-small t-muted">Um grupo reúne os porquinhos que vivem juntos. Crie o primeiro para cadastrar seus animais.</p>
           </div>`}`;
  };
  desenhar();
  assinar(desenhar);
}
