// Funções de interface compartilhadas: escape de HTML, item ativo da navegação,
// pop-up (<dialog>) e avisos na tela.

import { armazenamentoEmMemoria, hoje as hojeLocal } from "./store.js";
import { icone } from "./icones.js";

/** Escapa texto do usuário antes de pôr em innerHTML. */
export function esc(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

/** Marca o link da barra inferior da aba atual (data-aba da .tela). */
export function marcarAbaAtiva() {
  const aba = document.querySelector(".tela")?.dataset.aba;
  for (const link of document.querySelectorAll(".ds-nav__item")) {
    if (aba && link.dataset.aba === aba) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

let toastAtual = null;

/** Onde ficam avisos e painéis fixos: dentro da tela da moldura do celular, se ela existir. */
export function raizApp() {
  return document.querySelector(".aparelho__tela") ?? document.body;
}

/** Com a moldura do celular (telas grandes), embrulha o conteúdo para parecer um aparelho. */
function montarMoldura() {
  if (!document.documentElement.classList.contains("com-moldura") || document.querySelector(".aparelho")) return;
  const aparelho = document.createElement("div");
  aparelho.className = "aparelho";
  aparelho.innerHTML = `<div class="aparelho__corpo"><div class="aparelho__tela"><div class="aparelho__rolagem"></div></div></div>`;
  const tela = aparelho.querySelector(".aparelho__tela");
  const rolagem = aparelho.querySelector(".aparelho__rolagem");
  const filhos = [...document.body.children].filter((n) => !["SCRIPT", "STYLE", "LINK"].includes(n.tagName));
  document.body.prepend(aparelho);
  // A barra inferior e os avisos ficam fixos na tela; o resto rola.
  for (const n of filhos) (n.matches(".ds-nav, .teste, .ds-toast") ? tela : rolagem).append(n);
}

/** Pop-ups sobem da base da tela do celular, não da base da janela. */
function ajustarNaMoldura(dialogo) {
  const tela = document.querySelector(".aparelho__tela");
  if (!tela) return;
  const r = tela.getBoundingClientRect();
  Object.assign(dialogo.style, {
    position: "fixed", margin: "0", left: `${r.left}px`, width: `${r.width}px`, top: "auto",
    bottom: `${window.innerHeight - r.bottom}px`, maxHeight: `${Math.round(r.height * 0.9)}px`, borderRadius: "28px 28px 42px 42px",
  });
}

/** Aviso discreto, anunciado a leitores de tela. Some sozinho (ou fica, se tiver ação). */
export function avisar(texto, { acao = null, aoAcionar = null, duracao = 4500 } = {}) {
  toastAtual?.remove();
  const el = document.createElement("div");
  el.className = "ds-toast";
  el.setAttribute("role", "status");
  const span = document.createElement("span");
  span.textContent = texto;
  el.append(span);
  if (acao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.textContent = acao;
    botao.addEventListener("click", () => { el.remove(); aoAcionar?.(); });
    el.append(botao);
  }
  raizApp().append(el);
  toastAtual = el;
  if (duracao) setTimeout(() => { if (el.isConnected) el.remove(); }, acao ? Math.max(duracao, 10000) : duracao);
  return el;
}

/** Guarda um aviso para aparecer na PRÓXIMA tela (depois de salvar e navegar). */
export function agendarAviso(texto, { acao = null, href = null } = {}) {
  try { sessionStorage.setItem("cavia:aviso", JSON.stringify({ texto, acao, href })); } catch { /* ignora */ }
}

function mostrarAvisoAgendado() {
  try {
    const bruto = sessionStorage.getItem("cavia:aviso");
    if (!bruto) return;
    sessionStorage.removeItem("cavia:aviso");
    const { texto, acao, href } = JSON.parse(bruto);
    avisar(texto, { acao, aoAcionar: href ? () => { location.href = href; } : null });
  } catch { /* ignora */ }
}

/** Rascunho entre telas (ex.: sair para criar um grupo e voltar sem perder o que foi digitado). */
export function guardarRascunho(chave, dados) {
  try { sessionStorage.setItem(`cavia:rascunho:${chave}`, JSON.stringify(dados)); } catch { /* ignora */ }
}
export function pegarRascunho(chave) {
  try {
    const bruto = sessionStorage.getItem(`cavia:rascunho:${chave}`);
    sessionStorage.removeItem(`cavia:rascunho:${chave}`);
    return bruto ? JSON.parse(bruto) : null;
  } catch { return null; }
}

/** Chip de status do peso: sempre ícone + palavra + cor. */
export function chipStatusPeso(status) {
  if (status === "atencao") return `<span class="ds-chip ds-chip--atencao">${icone("alerta", { tamanho: 14 })}Atenção</span>`;
  if (status === "urgente") return `<span class="ds-chip ds-chip--urgente">${icone("alerta", { tamanho: 14 })}Urgente</span>`;
  if (status === "estavel") return `<span class="ds-chip ds-chip--estavel">${icone("check", { tamanho: 14 })}Peso estável</span>`;
  return `<span class="ds-chip">Sem pesagem</span>`;
}

/**
 * Grupo de opções de escolha única (role="radiogroup"). Setas movem a escolha.
 * `itens`: [{ valor, rotulo }]. `variante`: "opcoes" (botões em pílula) ou "segmentado".
 * Devolve o elemento; `.valor` guarda a escolha atual e `.definir(v)` muda por código.
 */
export function opcoes({ rotulo, itens, valor = null, variante = "opcoes", aoMudar = null }) {
  const raiz = document.createElement("div");
  raiz.setAttribute("role", "radiogroup");
  raiz.setAttribute("aria-label", rotulo);
  raiz.className = variante === "segmentado" ? "ds-segmented" : "ds-opcoes";
  raiz.valor = valor;
  const botoes = itens.map((item) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "radio");
    b.className = variante === "segmentado" ? "" : "ds-opcao";
    b.dataset.valor = item.valor;
    b.textContent = item.rotulo;
    b.addEventListener("click", () => definir(item.valor, true));
    b.addEventListener("keydown", (e) => {
      const i = botoes.indexOf(b);
      const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const prox = botoes[(i + delta + botoes.length) % botoes.length];
      prox.focus();
      definir(prox.dataset.valor, true);
    });
    return b;
  });
  function definir(v, usuario = false) {
    raiz.valor = v;
    for (const b of botoes) {
      const ativo = b.dataset.valor === String(v);
      b.setAttribute("aria-checked", String(ativo));
      b.tabIndex = ativo || (v === null && b === botoes[0]) ? 0 : -1;
    }
    if (usuario) aoMudar?.(v);
  }
  raiz.definir = (v) => definir(v, false);
  raiz.append(...botoes);
  definir(valor);
  return raiz;
}

/**
 * Abas (role="tablist"). `itens`: [{ id, rotulo }]. Devolve { el, selecionar(id) }.
 * O painel é do chamador: use aria-labelledby = `aba-${id}` e role="tabpanel".
 */
export function criarAbas({ rotulo, itens, ativa, aoMudar }) {
  const el = document.createElement("div");
  el.className = "ds-abas";
  el.setAttribute("role", "tablist");
  el.setAttribute("aria-label", rotulo);
  const botoes = itens.map((item) => {
    const b = document.createElement("button");
    b.type = "button";
    b.id = `aba-${item.id}`;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", "painel-abas");
    b.dataset.id = item.id;
    b.textContent = item.rotulo;
    b.addEventListener("click", () => selecionar(item.id, true));
    b.addEventListener("keydown", (e) => {
      const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const prox = botoes[(botoes.indexOf(b) + delta + botoes.length) % botoes.length];
      prox.focus();
      selecionar(prox.dataset.id, true);
    });
    return b;
  });
  function selecionar(id, usuario = false) {
    for (const b of botoes) {
      const ativo = b.dataset.id === id;
      b.setAttribute("aria-selected", String(ativo));
      b.tabIndex = ativo ? 0 : -1;
    }
    if (usuario) aoMudar(id);
  }
  el.append(...botoes);
  selecionar(ativa);
  return { el, selecionar: (id) => selecionar(id) };
}

/** Cabeçalho teal curvo dos perfis e do Início. `conteudo` é HTML já escapado. */
export function cabecalhoTeal({ voltarHref = null, conteudo, classe = "" }) {
  return `<header class="ds-cabecalho ${classe}">
    ${voltarHref ? `<a class="ds-cabecalho__voltar" href="${esc(voltarHref)}" aria-label="Voltar">${icone("seta-esquerda")}</a>` : ""}
    ${conteudo}
  </header>`;
}

/**
 * Escolha de dia: "Hoje" ou "Outro dia" (com campo de data). Devolve { el, valor(), erro(msg) }.
 * `id` serve para ligar o campo de data a mensagens de erro (aria-describedby).
 */
export function campoDia({ id, valor = null, rotulo = "Data", aoMudar = null }) {
  const raiz = document.createElement("div");
  raiz.className = "campo-dia";
  const h = hojeLocal();
  let tipo = valor && valor !== h ? "outro" : "hoje";
  raiz.innerHTML = `<div data-opcoes></div>
    <div data-outro ${tipo === "outro" ? "" : "hidden"}><label class="so-leitor" for="${id}">${esc(rotulo)}</label>
    <input class="ds-input" id="${id}" type="date" max="${h}" value="${valor ?? h}" aria-describedby="${id}-erro"></div>
    <p class="ds-field__erro" id="${id}-erro" hidden></p>`;
  const entrada = raiz.querySelector("input");
  raiz.querySelector("[data-opcoes]").append(opcoes({
    rotulo, valor: tipo, itens: [{ valor: "hoje", rotulo: "Hoje" }, { valor: "outro", rotulo: "Outro dia" }],
    aoMudar: (v) => {
      tipo = v;
      raiz.querySelector("[data-outro]").hidden = v === "hoje";
      erroCampo(entrada, `${id}-erro`, "");
      if (v === "outro") entrada.focus();
      aoMudar?.();
    },
  }));
  entrada.addEventListener("change", () => { erroCampo(entrada, `${id}-erro`, ""); aoMudar?.(); });
  return {
    el: raiz, entrada,
    valor: () => (tipo === "hoje" ? hojeLocal() : entrada.value),
    /** Confere a data; devolve true se estiver ok (não vazia e não no futuro). */
    validar() {
      if (tipo === "hoje") return true;
      if (!entrada.value || entrada.value > hojeLocal()) {
        erroCampo(entrada, `${id}-erro`, "Escolha uma data que não seja no futuro.");
        return false;
      }
      return true;
    },
  };
}

/** Interruptor (role="switch"). `idRotulo` = id do elemento que dá o nome ao interruptor. */
export function interruptor({ idRotulo, ligado, aoMudar }) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "ds-switch";
  b.setAttribute("role", "switch");
  b.setAttribute("aria-labelledby", idRotulo);
  b.setAttribute("aria-checked", String(!!ligado));
  b.addEventListener("click", () => {
    const novo = b.getAttribute("aria-checked") !== "true";
    b.setAttribute("aria-checked", String(novo));
    aoMudar(novo);
  });
  return b;
}

/** Mostra (ou limpa) a mensagem de erro de um campo e liga os atributos de acessibilidade. */
export function erroCampo(campo, idErro, mensagem) {
  const el = document.getElementById(idErro);
  if (!el) return;
  if (mensagem) {
    el.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>${esc(mensagem)}</span>`;
    el.hidden = false;
    campo?.setAttribute("aria-invalid", "true");
  } else {
    el.hidden = true;
    el.textContent = "";
    campo?.removeAttribute("aria-invalid");
  }
}

/**
 * Pop-up como <dialog> com showModal(): foco preso, Esc fecha, o foco volta ao botão que abriu,
 * título ligado por aria-labelledby. No celular aparece como folha que sobe da base.
 * `montar(corpo, fechar)` preenche o conteúdo. Devolve { fechar }.
 */
export function abrirFolha({ titulo, montar, aoFechar = null }) {
  const origem = document.activeElement;
  const dialogo = document.createElement("dialog");
  dialogo.className = "ds-folha";
  const idTitulo = `folha-${Math.random().toString(36).slice(2, 8)}`;
  dialogo.setAttribute("aria-labelledby", idTitulo);
  const h = document.createElement("h2");
  h.className = "ds-folha__titulo";
  h.id = idTitulo;
  h.textContent = titulo;
  const corpo = document.createElement("div");
  dialogo.append(h, corpo);

  // Limpeza feita uma única vez, venha o fechamento do botão ou do Esc (evento "close").
  let concluido = false;
  const concluir = () => {
    if (concluido) return;
    concluido = true;
    dialogo.remove();
    origem?.focus?.();
    aoFechar?.(dialogo.returnValue);
  };
  const fechar = (valor) => { dialogo.close(valor); concluir(); };
  dialogo.addEventListener("close", concluir);
  dialogo.addEventListener("click", (e) => { if (e.target === dialogo) fechar("cancelar"); });

  document.body.append(dialogo);
  ajustarNaMoldura(dialogo);
  montar(corpo, fechar);
  dialogo.showModal();
  return { fechar };
}

/** Confirmação em pop-up. Devolve uma Promise<boolean>. */
export function confirmar({ titulo, texto, rotuloConfirmar = "Confirmar", rotuloCancelar = "Cancelar" }) {
  return new Promise((resolver) => {
    abrirFolha({
      titulo,
      montar(corpo, fechar) {
        const p = document.createElement("p");
        p.className = "t-body";
        p.textContent = texto;
        const acoes = document.createElement("div");
        acoes.className = "ds-folha__acoes";
        const ok = document.createElement("button");
        ok.type = "button";
        ok.className = "ds-button ds-button--bloco";
        ok.textContent = rotuloConfirmar;
        ok.addEventListener("click", () => fechar("confirmar"));
        const nao = document.createElement("button");
        nao.type = "button";
        nao.className = "ds-button ds-button--secundario ds-button--bloco";
        nao.textContent = rotuloCancelar;
        nao.addEventListener("click", () => fechar("cancelar"));
        acoes.append(ok, nao);
        corpo.append(p, acoes);
      },
      aoFechar: (valor) => resolver(valor === "confirmar"),
    });
  });
}

export function iniciarUi() {
  montarMoldura();
  // Conteúdo principal como landmark (as telas são montadas por JavaScript dentro de .tela).
  document.querySelector(".tela")?.setAttribute("role", "main");
  marcarAbaAtiva();
  mostrarAvisoAgendado();
  window.addEventListener("cavia:erro-armazenamento", () => {
    avisar("Não foi possível guardar os dados neste aparelho. O Cavia vai funcionar só até você fechar esta página.", { duracao: 9000 });
  });
  if (armazenamentoEmMemoria()) window.dispatchEvent(new CustomEvent("cavia:erro-armazenamento"));
}
