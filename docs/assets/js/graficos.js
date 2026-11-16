// Gráficos em SVG gerados por JavaScript, sem biblioteca.
// Cada gráfico leva role="img" com a leitura em palavras e uma tabela de dados acessível.

import { gramas, dataCurta } from "./formato.js";
import { esc } from "./ui.js";

const L = 330, A = 150;               // viewBox
const MARGEM = { esq: 34, dir: 14, topo: 14, base: 14 };

/** Leitura em palavras da série (usada no aria-label). */
export function leituraPeso(pontos, rotulo = "") {
  const prefixo = rotulo ? `${rotulo}: ` : "";
  if (pontos.length === 1) return `${prefixo}uma pesagem, ${gramas(pontos[0].gramas)} em ${dataCurta(pontos[0].data)}`;
  const primeiro = pontos[0].gramas;
  const ultimo = pontos[pontos.length - 1].gramas;
  const verbo = ultimo > primeiro ? "subiu" : ultimo < primeiro ? "caiu" : "ficou igual";
  const de = verbo === "ficou igual" ? `em ${gramas(ultimo)}` : `de ${gramas(primeiro)} para ${gramas(ultimo)}`;
  return `${prefixo}peso ${verbo} ${de} em ${pontos.length} pesagens`;
}

/**
 * Gráfico de linha do peso. `pesagens` = [{ data, gramas }]. Mostra as últimas `ultimas`.
 * Devolve HTML (SVG + tabela acessível) ou uma mensagem se não houver dados.
 */
export function graficoPeso(pesagens, { rotulo = "", ultimas = 8 } = {}) {
  const pontos = [...pesagens].sort((a, b) => a.data.localeCompare(b.data)).slice(-ultimas);
  if (!pontos.length) {
    return `<p class="t-small t-muted">Ainda não há pesagens. Salve a primeira para ver o gráfico.</p>`;
  }

  const valores = pontos.map((p) => p.gramas);
  let baixo = Math.floor((Math.min(...valores) - 10) / 50) * 50;
  let alto = Math.ceil((Math.max(...valores) + 10) / 50) * 50;
  if (alto - baixo < 100) alto = baixo + 100;

  const util = { l: L - MARGEM.esq - MARGEM.dir, a: A - MARGEM.topo - MARGEM.base };
  const x = (i) => (pontos.length === 1 ? MARGEM.esq + util.l / 2 : MARGEM.esq + (i * util.l) / (pontos.length - 1));
  const y = (v) => MARGEM.topo + ((alto - v) / (alto - baixo)) * util.a;

  const linhas = [0, 1, 2, 3, 4].map((i) => {
    const yy = MARGEM.topo + (i * util.a) / 4;
    return `<line x1="${MARGEM.esq}" x2="${L - MARGEM.dir}" y1="${yy}" y2="${yy}" stroke="var(--line)" stroke-width="1"/>`;
  }).join("");
  const caminho = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.gramas).toFixed(1)}`).join(" ");
  const bolinhas = pontos.map((p, i) => {
    const ultimo = i === pontos.length - 1;
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(p.gramas).toFixed(1)}" r="${ultimo ? 5 : 4}" fill="${ultimo ? "var(--primary)" : "var(--surface)"}" stroke="var(--primary)" stroke-width="2"/>`;
  }).join("");

  const tabela = pontos.map((p) => `<tr><td>${dataCurta(p.data)}</td><td>${gramas(p.gramas)}</td></tr>`).join("");
  // Pontos tocáveis: botões HTML por cima do SVG (alvo de 44 px), cada um com o valor e a data.
  const botoes = pontos.map((p, i) => `<button type="button" class="grafico__ponto" aria-pressed="false"
      style="left:${((x(i) / L) * 100).toFixed(2)}%;top:${((y(p.gramas) / A) * 100).toFixed(2)}%"
      data-valor="${gramas(p.gramas)}" data-data="${dataCurta(p.data)}" aria-label="${dataCurta(p.data)}: ${gramas(p.gramas)}"></button>`).join("");
  return `
    <div class="grafico-caixa">
      <svg class="grafico" viewBox="0 0 ${L} ${A}" role="img" aria-label="${esc(leituraPeso(pontos, rotulo))}" preserveAspectRatio="xMidYMid meet">
        ${linhas}
        <text x="0" y="${MARGEM.topo + 4}" class="grafico__eixo">${alto}</text>
        <text x="0" y="${A - MARGEM.base + 4}" class="grafico__eixo">${baixo}</text>
        ${pontos.length > 1 ? `<polyline points="${caminho}" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` : ""}
        ${bolinhas}
      </svg>
      ${botoes}
      <div class="grafico__dica" role="status" hidden></div>
    </div>
    <table class="so-leitor"><caption>Pesagens${rotulo ? ` de ${esc(rotulo)}` : ""}</caption>
      <thead><tr><th>Data</th><th>Peso</th></tr></thead><tbody>${tabela}</tbody></table>`;
}

// Tocar em um ponto mostra o valor e a data; tocar de novo, fora ou Esc esconde.
function esconderDicas(exceto = null) {
  for (const caixa of document.querySelectorAll(".grafico-caixa")) {
    if (caixa === exceto) continue;
    caixa.querySelector(".grafico__dica").hidden = true;
    for (const b of caixa.querySelectorAll('.grafico__ponto[aria-pressed="true"]')) b.setAttribute("aria-pressed", "false");
  }
}
document.addEventListener("click", (e) => {
  const ponto = e.target.closest?.(".grafico__ponto");
  const caixa = ponto?.closest(".grafico-caixa") ?? null;
  esconderDicas(caixa);
  if (!ponto) return;
  const dica = caixa.querySelector(".grafico__dica");
  const ligado = ponto.getAttribute("aria-pressed") === "true";
  for (const b of caixa.querySelectorAll(".grafico__ponto")) b.setAttribute("aria-pressed", "false");
  if (ligado) { dica.hidden = true; return; }
  ponto.setAttribute("aria-pressed", "true");
  dica.innerHTML = `<strong>${esc(ponto.dataset.valor)}</strong><span>${esc(ponto.dataset.data)}</span>`;
  const esq = parseFloat(ponto.style.left);
  const topo = parseFloat(ponto.style.top);
  dica.style.left = ponto.style.left;
  dica.style.top = ponto.style.top;
  dica.dataset.lado = esq < 22 ? "esq" : esq > 78 ? "dir" : "meio";
  dica.dataset.pos = topo < 30 ? "abaixo" : "acima";
  dica.hidden = false;
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape") esconderDicas(); });