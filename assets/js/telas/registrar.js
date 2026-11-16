// Tela Registrar (imagem: iPhone 16 - 18). Atalhos para cada tipo de registro.

import { obter, hoje } from "../store.js";
import { checkupsVencidos } from "../regras.js";
import { icone } from "../icones.js";

// Ordem e rótulos como na imagem.
const ATALHOS = [
  { rotulo: "Peso", icone: "balanca", href: "registrar-peso.html" },
  { rotulo: "Observações", icone: "olho", href: "registrar-observacao.html" },
  { rotulo: "Alimentação", icone: "folha", href: "registrar-alimentacao.html" },
  { rotulo: "Sintomas e ocorrências", icone: "nota", href: "registrar-sintomas.html" },
  { rotulo: "Consultas e exames", icone: "calendario", href: "registrar-consulta.html" },
  { rotulo: "Tratamentos e medicações", icone: "pilula", href: "registrar-tratamento.html" },
  { rotulo: "Cuidados do grupo", icone: "casa", href: "registrar-cuidados.html", largo: true },
  { rotulo: "Check-up de saúde", icone: "prancheta", href: "registrar-checkup.html", largo: true, checkup: true },
];

function chipCheckup(vencidos) {
  if (!vencidos.length) return "";
  const hojeMesmo = vencidos.every((v) => v.atrasoDias === 0);
  return `<span class="ds-chip ds-chip--atencao">${icone("triangulo")}${hojeMesmo ? "Vence hoje" : "Atrasado"}</span>`;
}

export function telaRegistrar(raiz) {
  const vencidos = checkupsVencidos(obter(), hoje());

  raiz.innerHTML = `
    <header class="registrar__titulo">
      <h1 class="t-h1">Registrar</h1>
      <p>O que você quer registrar agora?</p>
    </header>
    <div class="registrar__grade">
      ${ATALHOS.map((a) => `
        <a class="ds-card registrar__item${a.largo ? " registrar__item--largo" : ""}" href="${a.href}">
          <span class="registrar__icone">${icone(a.icone)}</span>
          <span>${a.rotulo}</span>
          ${a.checkup ? chipCheckup(vencidos) : ""}
        </a>`).join("")}
    </div>`;
}
