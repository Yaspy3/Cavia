// Novo lembrete / Editar lembrete (imagem: iPhone 16 - 45). Obrigatórios: o que lembrar, para quem e quando.
// Opcionais: repetir, avisar e anotação. "Para", "Avisar" e "Anotação" não estão na imagem (seção 9.6 das instruções).

import { obter, hoje } from "../store.js";
import { grupoAtual, lembretePorId, criarLembrete, editarLembrete, editarSoEsta } from "../acoes.js";
import { REPETICOES, AVISOS, divide, junta, repete } from "../lembretes.js";
import { dataCurta } from "../formato.js";
import { somarDias } from "../datas.js";
import { esc, opcoes, erroCampo, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

const HORA_PADRAO = "18:00";

/** A hora cai no intervalo de silêncio (que pode atravessar a meia-noite)? */
function dentroDoSilencio(hora, { ativo, de, ate }) {
  if (!ativo || !hora) return false;
  return de <= ate ? hora >= de && hora < ate : hora >= de || hora < ate;
}

function rotuloData(data) {
  if (data === hoje()) return "Hoje";
  if (data === somarDias(hoje(), 1)) return "Amanhã";
  return dataCurta(data);
}

export function telaLembreteNovo(raiz) {
  const params = new URLSearchParams(location.search);
  const editando = params.get("id") ? lembretePorId(params.get("id")) : null;
  const escopo = params.get("escopo") === "este" ? "este" : "proximos";
  const estado = obter();
  const animais = estado.animais.filter((a) => !a.arquivado);

  if (!estado.grupos.length && !animais.length) {
    raiz.innerHTML = `
      <header class="ds-header"><a class="ds-header__voltar" href="lembretes.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
        <div><p class="ds-header__sobre">Início</p><h1>Lembretes</h1></div></header>
      <div class="ds-card ds-card--contorno form__sem-grupo">
        <p class="t-small">Para criar um lembrete, cadastre antes um grupo ou um porquinho.</p>
        <a class="ds-button ds-button--secundario" href="grupo-novo.html">Criar um grupo</a>
      </div>`;
    return;
  }

  const base = editando
    ? { titulo: editando.titulo, para: `${editando.alvo}:${editando.alvoId}`, ...divide(editando.quando), repetir: editando.repetir ?? "nunca",
      cadaDias: editando.cadaDias ?? 1, avisar: editando.avisar ?? "", anotacao: editando.anotacao ?? "" }
    : { titulo: "", para: grupoAtual() ? `grupo:${grupoAtual().id}` : `animal:${animais[0].id}`, data: hoje(), hora: HORA_PADRAO,
      repetir: "nunca", cadaDias: 1, avisar: "", anotacao: "" };
  const f = { ...base };

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="lembretes.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Início</p><h1>${editando ? "Editar lembrete" : "Novo lembrete"}</h1></div>
    </header>
    ${editando && repete(editando) ? `<p class="t-small t-muted lembrete-escopo">${escopo === "este" ? "As mudanças valem só para esta ocorrência." : "As mudanças valem para este e os próximos."}</p>` : ""}
    <form class="form" novalidate>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="titulo">O que lembrar</label>
        <input class="ds-input" id="titulo" name="titulo" type="text" autocomplete="off" maxlength="80" aria-describedby="erro-titulo" value="${esc(f.titulo)}">
        <p class="ds-field__erro" id="erro-titulo" hidden></p>
      </div>

      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="para">Para</label>
        <select class="ds-input ds-input--select" id="para" name="para">
          ${estado.grupos.length ? `<optgroup label="Grupos">${estado.grupos.map((g) => `<option value="grupo:${g.id}" ${f.para === `grupo:${g.id}` ? "selected" : ""}>${esc(g.nome)}</option>`).join("")}</optgroup>` : ""}
          ${animais.length ? `<optgroup label="Animais">${animais.map((a) => `<option value="animal:${a.id}" ${f.para === `animal:${a.id}` ? "selected" : ""}>${esc(a.nome)}</option>`).join("")}</optgroup>` : ""}
        </select>
      </div>

      <div class="ds-field">
        <span class="ds-field__rotulo form__rotulo">Quando</span>
        <div class="form__linha">
          <label class="ds-chip-campo"><span>Data: <strong data-rot-data>${rotuloData(f.data)}</strong></span>
            <input type="date" name="data" aria-label="Data do lembrete" ${editando ? "" : `min="${hoje()}"`} value="${f.data}"></label>
          <label class="ds-chip-campo"><span>Hora: <strong data-rot-hora>${f.hora}</strong></span>
            <input type="time" name="hora" aria-label="Hora do lembrete" value="${f.hora}"></label>
        </div>
        <p class="ds-field__erro" id="erro-quando" hidden></p>
        <div data-silencio></div>
      </div>

      <div class="ds-field" data-repetir><span class="ds-field__rotulo form__rotulo">Repetir</span></div>
      <div class="ds-field" data-cada hidden>
        <label class="ds-field__rotulo form__rotulo" for="cadaDias">A cada quantos dias?</label>
        <input class="ds-input" id="cadaDias" name="cadaDias" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" aria-describedby="erro-cada" value="${esc(f.cadaDias)}">
        <p class="ds-field__erro" id="erro-cada" hidden></p>
      </div>

      <details class="ds-card ds-card--contorno ds-detalhes" ${f.avisar || f.anotacao ? "open" : ""}>
        <summary><span><span class="t-title">Mais opções</span><span class="t-small t-muted">Avisar e anotação</span></span>${icone("seta-baixo")}</summary>
        <div class="ds-detalhes__corpo">
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="avisar">Avisar</label>
            <select class="ds-input ds-input--select" id="avisar" name="avisar">${AVISOS.map((a) => `<option value="${a.valor}" ${f.avisar === a.valor ? "selected" : ""}>${a.rotulo}</option>`).join("")}</select></div>
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="anotacao">Anotação</label>
            <textarea class="ds-input ds-input--area" id="anotacao" name="anotacao" rows="3" maxlength="300">${esc(f.anotacao)}</textarea></div>
        </div>
      </details>

      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const el = form.elements;
  const caixaCada = form.querySelector("[data-cada]");

  form.querySelector("[data-repetir]").append(opcoes({
    rotulo: "Repetir", valor: f.repetir,
    itens: REPETICOES.map((r) => ({ valor: r.valor, rotulo: r.rotulo })),
    aoMudar: (v) => { f.repetir = v; caixaCada.hidden = v !== "cada-n"; if (v === "cada-n") el.cadaDias.focus(); },
  }));
  caixaCada.hidden = f.repetir !== "cada-n";
  el.cadaDias.addEventListener("input", () => { el.cadaDias.value = el.cadaDias.value.replace(/\D/g, ""); erroCampo(el.cadaDias, "erro-cada", ""); });

  const silencioEl = form.querySelector("[data-silencio]");
  const atualizarSilencio = () => {
    silencioEl.innerHTML = dentroDoSilencio(el.hora.value, estado.config.silencio)
      ? `<div class="ds-notice ds-notice--atencao"><span class="ds-notice__icone">${icone("alerta", { tamanho: 20 })}</span><p>Este horário está no seu horário de silêncio. O aviso só aparece depois dele.</p></div>` : "";
  };
  el.data.addEventListener("change", () => { form.querySelector("[data-rot-data]").textContent = el.data.value ? rotuloData(el.data.value) : "Escolher"; erroCampo(el.data, "erro-quando", ""); });
  el.hora.addEventListener("change", () => { form.querySelector("[data-rot-hora]").textContent = el.hora.value || "Escolher"; atualizarSilencio(); });
  el.titulo.addEventListener("input", () => erroCampo(el.titulo, "erro-titulo", ""));
  atualizarSilencio();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let primeiro = null;
    if (!el.titulo.value.trim()) { erroCampo(el.titulo, "erro-titulo", "Digite o que lembrar."); primeiro ??= el.titulo; }
    if (!el.data.value || !el.hora.value) { erroCampo(el.data, "erro-quando", "Escolha a data e a hora."); primeiro ??= el.data; }
    else if (!editando && el.data.value < hoje()) { erroCampo(el.data, "erro-quando", "Escolha uma data que ainda não passou."); primeiro ??= el.data; }
    const cada = Number(el.cadaDias.value);
    if (f.repetir === "cada-n" && !(cada >= 1)) { erroCampo(el.cadaDias, "erro-cada", "Digite de quantos em quantos dias (1 ou mais)."); primeiro ??= el.cadaDias; }
    if (primeiro) { primeiro.focus(); return; }

    const [alvo, alvoId] = el.para.value.split(":");
    const dados = {
      titulo: el.titulo.value, alvo, alvoId, quando: junta(el.data.value, el.hora.value),
      repetir: f.repetir, cadaDias: f.repetir === "cada-n" ? cada : 1, avisar: el.avisar.value, anotacao: el.anotacao.value,
    };
    if (editando) {
      const campos = { ...dados, titulo: dados.titulo.trim(), anotacao: dados.anotacao.trim() };
      if (repete(editando) && escopo === "este") editarSoEsta(editando.id, campos);
      else editarLembrete(editando.id, campos);
    } else {
      criarLembrete(dados);
    }
    agendarAviso("Lembrete salvo.");
    location.href = "lembretes.html";
  });
}
