// Perfil (imagem: iPhone 16 - 29): tutor, Conta, Notificações e Exportar histórico.

import { obter, assinar } from "../store.js";
import { esc } from "../ui.js";
import { icone } from "../icones.js";

const LINHAS = [
  { href: "conta.html", icone: "usuario", titulo: "Conta", sub: "Nome e e-mail" },
  { href: "notificacoes.html", icone: "sino", titulo: "Notificações", sub: "Alertas, lembretes e horários" },
  { href: "exportar.html", icone: "baixar", titulo: "Exportar histórico", sub: "Resumo em PDF da saúde do seu porquinho" },
];

const contar = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export function telaPerfil(raiz) {
  const desenhar = () => {
    const e = obter();
    const animais = e.animais.filter((a) => !a.arquivado).length;
    raiz.innerHTML = `
      <header class="registrar__titulo">
        <h1 class="t-h1">Perfil</h1>
        <p>Sua conta e configurações</p>
      </header>
      <section class="ds-card ds-card--contorno perfil-tutor" aria-label="Tutor">
        <span class="perfil-tutor__avatar" aria-hidden="true">${icone("usuario", { tamanho: 36 })}</span>
        <div class="perfil-tutor__texto">
          <h2 class="t-h2">${e.conta?.nome ? esc(e.conta.nome) : "Nome do tutor"}</h2>
          <p class="t-small t-muted">${e.conta?.email ? esc(e.conta.email) : "E-mail não informado"}</p>
          <ul class="perfil-tutor__tags">
            <li class="ds-chip ds-chip--tag-claro">${contar(animais, "animal", "animais")}</li>
            <li class="ds-chip ds-chip--tag-claro">${contar(e.grupos.length, "grupo", "grupos")}</li>
          </ul>
        </div>
      </section>
      <nav class="ds-card ds-card--contorno ds-card--lista" aria-label="Configurações">
        ${LINHAS.map((l) => `
          <a class="perfil-linha" href="${l.href}">
            <span class="ds-lista__icone">${icone(l.icone)}</span>
            <span class="ds-lista__texto"><span class="t-title">${l.titulo}</span><span class="t-small t-muted">${l.sub}</span></span>
            ${icone("seta-direita")}
          </a>`).join("")}
      </nav>`;
  };
  desenhar();
  assinar(desenhar);
}
