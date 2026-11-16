// Lembretes (imagem: iPhone 16 - 43). Lista "Hoje" e "Próximos".
// As opções (concluir, adiar, editar, excluir) NÃO têm imagem: abrem em um pop-up simples.
// Em lembretes que se repetem, editar e excluir mostram as duas opções: "só este" e "este e os próximos".

import { obter, assinar, hoje } from "../store.js";
import { concluirLembrete, restaurarLembrete, adiarLembrete, excluirLembrete, pularOcorrencia } from "../acoes.js";
import { repete, divide, rotuloRepeticao } from "../lembretes.js";
import { dataCompleta } from "../formato.js";
import { esc, abrirFolha, confirmar, avisar } from "../ui.js";
import { icone } from "../icones.js";

function linhaOpcao(rotulo, aoClicar, fechar) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "ds-lista__linha";
  b.innerHTML = `<span class="t-strong">${esc(rotulo)}</span>`;
  b.addEventListener("click", () => { fechar("escolheu"); aoClicar(); });
  return b;
}

function pedirEscopo(titulo, aoEscolher) {
  abrirFolha({
    titulo,
    montar(corpo, fechar) {
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      lista.append(
        linhaOpcao("Só este", () => aoEscolher("este"), fechar),
        linhaOpcao("Este e os próximos", () => aoEscolher("proximos"), fechar),
      );
      corpo.append(lista);
    },
  });
}

function abrirAdiar(l) {
  abrirFolha({
    titulo: "Adiar lembrete",
    montar(corpo, fechar) {
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      lista.append(
        linhaOpcao("Daqui a 1 hora", () => { adiarLembrete(l.id, "hora"); avisar("Lembrete adiado."); }, fechar),
        linhaOpcao("Para amanhã, no mesmo horário", () => { adiarLembrete(l.id, "amanha"); avisar("Lembrete adiado."); }, fechar),
      );
      corpo.append(lista);
    },
  });
}

function aoExcluir(l) {
  const apagar = (escopo) => {
    if (escopo === "este") { pularOcorrencia(l.id); avisar("Esta ocorrência foi removida."); }
    else { excluirLembrete(l.id); avisar("Lembrete excluído."); }
  };
  if (repete(l)) return pedirEscopo("Excluir lembrete que se repete", apagar);
  confirmar({ titulo: "Excluir lembrete?", texto: `“${l.titulo}” será excluído.`, rotuloConfirmar: "Excluir" })
    .then((ok) => { if (ok) apagar("proximos"); });
}

function abrirOpcoes(l) {
  abrirFolha({
    titulo: l.titulo,
    montar(corpo, fechar) {
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      if (repete(l)) {
        const p = document.createElement("p");
        p.className = "t-small t-muted";
        p.textContent = `Se repete: ${rotuloRepeticao(l).toLowerCase()}.`;
        corpo.append(p);
      }
      lista.append(
        linhaOpcao("Concluir", () => {
          const antes = concluirLembrete(l.id);
          avisar("Lembrete concluído.", { acao: "Desfazer", aoAcionar: () => restaurarLembrete(l.id, antes) });
        }, fechar),
        linhaOpcao("Adiar", () => abrirAdiar(l), fechar),
        linhaOpcao("Editar", () => {
          if (repete(l)) pedirEscopo("Editar lembrete que se repete", (e) => { location.href = `lembrete-novo.html?id=${encodeURIComponent(l.id)}&escopo=${e}`; });
          else location.href = `lembrete-novo.html?id=${encodeURIComponent(l.id)}`;
        }, fechar),
        linhaOpcao("Excluir", () => aoExcluir(l), fechar),
      );
      corpo.append(lista);
    },
  });
}

export function telaLembretes(raiz) {
  const desenhar = () => {
    const todos = obter().lembretes.filter((l) => !l.concluido).sort((a, b) => a.quando.localeCompare(b.quando));
    const h = hoje();
    const deHoje = todos.filter((l) => divide(l.quando).data <= h);
    const proximos = todos.filter((l) => divide(l.quando).data > h);

    const item = (l, comData) => `
      <li class="tarefa">
        <label class="caixa-alvo"><input class="ds-caixa" type="checkbox" data-concluir="${l.id}" aria-label="Concluir: ${esc(l.titulo)}"></label>
        <button type="button" class="tarefa__abrir" data-opcoes="${l.id}">
          <span class="tarefa__titulo">${esc(l.titulo)}</span>
          <span class="t-small t-muted">${comData ? `${dataCompleta(divide(l.quando).data)} ${divide(l.quando).hora}` : divide(l.quando).hora}${repete(l) ? ` · ${esc(rotuloRepeticao(l))}` : ""}</span>
        </button>
      </li>`;

    raiz.innerHTML = `
      <header class="ds-header">
        <a class="ds-header__voltar" href="inicio.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
        <div><p class="ds-header__sobre">Início</p><h1>Lembretes</h1></div>
      </header>
      <section class="lembretes-bloco" aria-labelledby="t-hoje">
        <h2 class="form__rotulo" id="t-hoje">Hoje</h2>
        ${deHoje.length ? `<div class="ds-card ds-card--contorno"><ul class="lembretes-lista">${deHoje.map((l) => item(l, false)).join("")}</ul></div>`
          : `<p class="t-small t-muted">Nenhum lembrete para hoje.</p>`}
      </section>
      <section class="lembretes-bloco" aria-labelledby="t-prox">
        <h2 class="form__rotulo" id="t-prox">Próximos</h2>
        ${proximos.length ? `<div class="ds-card ds-card--contorno"><ul class="lembretes-lista">${proximos.map((l) => item(l, true)).join("")}</ul></div>`
          : `<p class="t-small t-muted">Nenhum lembrete agendado.</p>`}
      </section>
      <a class="ds-button ds-button--registrar ds-button--bloco" href="lembrete-novo.html">Novo lembrete</a>`;

    for (const c of raiz.querySelectorAll("[data-concluir]")) {
      c.addEventListener("change", () => {
        const id = c.dataset.concluir;
        const antes = concluirLembrete(id);
        avisar("Lembrete concluído.", { acao: "Desfazer", aoAcionar: () => restaurarLembrete(id, antes) });
      });
    }
    for (const b of raiz.querySelectorAll("[data-opcoes]")) {
      b.addEventListener("click", () => abrirOpcoes(obter().lembretes.find((l) => l.id === b.dataset.opcoes)));
    }
  };
  desenhar();
  assinar(desenhar);
}
