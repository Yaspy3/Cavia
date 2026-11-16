// Prévia do histórico em A4 (SEM imagem de referência: proposta). "Salvar PDF" chama window.print();
// o navegador salva como PDF. Os estilos de impressão (@media print) escondem a barra e os botões.

import { obter, hoje } from "../store.js";
import { montarHistorico, intervaloDoPeriodo, ITENS } from "../historico.js";
import { dataCurta, dataCompleta } from "../formato.js";
import { esc, avisar } from "../ui.js";
import { icone } from "../icones.js";

function tabela({ colunas, linhas }) {
  if (!linhas.length) return `<p class="previa__vazio">Nenhum registro no período.</p>`;
  return `<table class="previa__tabela">
    <thead><tr>${colunas.map((c) => `<th scope="col">${esc(c)}</th>`).join("")}</tr></thead>
    <tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

export function telaExportarPrevia(raiz) {
  const params = new URLSearchParams(location.search);
  const alvo = params.get("alvo") === "grupo" ? "grupo" : "animal";
  const id = params.get("id");
  const periodo = params.get("periodo") ?? "3m";
  const itens = (params.get("itens") ?? "peso").split(",").filter((i) => ITENS.some((x) => x.id === i));
  const { de, ate } = intervaloDoPeriodo(periodo, params.get("de") ?? "", params.get("ate") ?? "");
  const estado = obter();
  const dados = montarHistorico(estado, { alvo, id, de, ate, itens });
  const voltarHref = `exportar.html?${params}`;

  if (!dados) {
    raiz.innerHTML = `<header class="ds-header"><a class="ds-header__voltar" href="exportar.html" aria-label="Voltar">${icone("seta-esquerda")}</a><div><h1>Prévia indisponível</h1></div></header>
      <p class="t-body">Não encontramos o que você escolheu. Volte e escolha de novo.</p>
      <a class="ds-button ds-button--bloco" href="exportar.html">Voltar</a>`;
    return;
  }

  const rotulosItens = itens.map((i) => ITENS.find((x) => x.id === i).rotulo).join(", ");
  const tutor = estado.conta?.nome;

  raiz.innerHTML = `
    <header class="ds-header previa__acoes-topo">
      <a class="ds-header__voltar" href="${esc(voltarHref)}" aria-label="Voltar e ajustar as opções">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Exportar histórico</p><h1>Prévia</h1></div>
    </header>
    <div data-confirmacao role="status" aria-live="polite"></div>

    <article class="previa" aria-label="Prévia do histórico">
      <header class="previa__cabecalho">
        <img class="previa__logo" src="../assets/logo/cavia-logo.svg" alt="Cavia" width="150" height="52">
        <p class="previa__tipo">${esc(dados.tipo)}</p>
      </header>
      <h2 class="previa__titulo">${esc(dados.titulo)}</h2>
      <ul class="previa__info">
        ${dados.info.map((i) => `<li>${esc(i)}</li>`).join("")}
        <li>Período: ${dataCompleta(de)} a ${dataCompleta(ate)}</li>
        <li>Incluído: ${esc(rotulosItens)}</li>
        ${tutor ? `<li>Tutor: ${esc(tutor)}</li>` : ""}
      </ul>
      ${dados.blocos.map((b) => `
        <section class="previa__bloco">
          ${b.titulo ? `<h3 class="previa__bloco-titulo">${esc(b.titulo)}</h3>` : ""}
          ${b.secoes.map((s) => { const n = b.titulo ? 4 : 3; return `<div class="previa__secao"><h${n}>${esc(s.titulo)}</h${n}>${tabela(s)}</div>`; }).join("")}
        </section>`).join("")}
      <footer class="previa__rodape">
        Gerado pelo Cavia em ${dataCurta(hoje())}. Os registros foram feitos pelo tutor e não substituem a avaliação do veterinário.
      </footer>
    </article>

    <div class="previa__botoes">
      <button type="button" class="ds-button ds-button--registrar ds-button--bloco" data-salvar>Salvar PDF</button>
      <a class="ds-button ds-button--contorno ds-button--bloco" href="${esc(voltarHref)}">Ajustar opções</a>
    </div>`;

  const confirmacao = raiz.querySelector("[data-confirmacao]");
  const mostrarPronto = () => {
    confirmacao.innerHTML = `<div class="ds-notice ds-notice--ok"><span class="ds-notice__icone">${icone("check", { tamanho: 20 })}</span>
      <div><p class="t-title">Histórico pronto</p><p>Se você escolheu salvar como PDF, o arquivo está no seu aparelho. Pode compartilhar com o veterinário.</p></div></div>`;
    confirmacao.firstElementChild.scrollIntoView({ block: "nearest" });
  };
  window.addEventListener("afterprint", mostrarPronto);
  raiz.querySelector("[data-salvar]").addEventListener("click", () => {
    try { window.print(); } catch { avisar("Não foi possível abrir a impressão neste navegador."); }
  });
}
