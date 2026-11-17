// Perfil do grupo (imagens: iPhone 16 - 14 Integrantes, 15 Alimentação, 17 Ambiente).
// O grupo vem por parâmetro de URL: grupo.html?id=...&aba=integrantes|alimentacao|ambiente

import { obter, assinar, hoje, somarDias } from "../store.js";
import { grupoPorId, animaisDoGrupo, editarGrupoCampos } from "../acoes.js";
import { statusPeso } from "../regras.js";
import { avatarHtml, avatarGrupoHtml } from "../avatar.js";
import { abrirFormularioTexto } from "../seletores.js";
import { alimentoPorId } from "../conteudo/alimentos.js";
import { dataCurta, inicialDia, diaSemana, intervalo } from "../formato.js";
import { esc, criarAbas, cabecalhoTeal, chipStatusPeso } from "../ui.js";
import { icone } from "../icones.js";

const ABAS = [
  { id: "integrantes", rotulo: "Integrantes" }, { id: "alimentacao", rotulo: "Alimentação" }, { id: "ambiente", rotulo: "Ambiente" },
];

const linha = (rotulo, valor) => `<div class="dados-linha"><dt>${esc(rotulo)}</dt>
  <dd>${valor ? esc(valor) : `<span class="t-muted">Não informado</span>`}</dd></div>`;

function painelIntegrantes(grupo) {
  const estado = obter();
  const animais = animaisDoGrupo(grupo.id);
  const voltar = encodeURIComponent(`grupo.html?id=${grupo.id}`);
  return `
    <section class="ds-card ds-card--contorno" aria-label="Integrantes do grupo">
      ${animais.length ? `<ul>${animais.map((a) => `<li><a class="animais__linha" href="animal.html?id=${encodeURIComponent(a.id)}">
        ${avatarHtml(a, 40)}<span class="animais__nome t-title">${esc(a.nome)}</span>${chipStatusPeso(statusPeso(estado, a.id))}</a></li>`).join("")}</ul>`
      : `<p class="t-small t-muted">Nenhum porquinho neste grupo ainda.</p>
         <a class="form__link" href="animal-novo.html?grupo=${encodeURIComponent(grupo.id)}&voltar=${voltar}">Cadastrar um animal</a>`}
    </section>
    <a class="ds-button ds-button--registrar ds-button--bloco" href="grupo-novo.html?id=${encodeURIComponent(grupo.id)}&voltar=${voltar}">Editar grupo</a>`;
}

function painelAlimentacao(grupo, estado) {
  const fim = hoje();
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(fim, i - 6));
  const registros = estado.alimentacao.filter((r) => r.grupoId === grupo.id && dias.includes(r.data));
  const ids = [...new Set(registros.flatMap((r) => r.alimentos))];
  const ordem = (id) => -registros.filter((r) => r.alimentos.includes(id)).length;
  ids.sort((a, b) => ordem(a) - ordem(b));
  const d = grupo.dieta ?? {};
  return `
    <section class="ds-card ds-card--contorno" aria-labelledby="t-dieta">
      <header class="dados-topo"><h2 class="t-title" id="t-dieta">Dieta</h2><button type="button" class="animais__ver link-botao" data-editar-dieta>Editar</button></header>
      <dl>${linha("Ração", d.racao)}${linha("Vitamina C", d.vitaminaC)}${linha("Feno", d.feno)}</dl>
    </section>
    <section class="ds-card ds-card--contorno" aria-labelledby="t-veg">
      <header class="dados-topo"><h2 class="t-title" id="t-veg">Vegetais da semana</h2>
        <span class="ds-chip ds-chip--afetivo">${intervalo(dias[0], dias[6])}</span></header>
      ${ids.length ? `<table class="veg-tabela"><caption class="so-leitor">Vegetais e frutas oferecidos nos últimos 7 dias</caption>
        <thead><tr><td></td>${dias.map((x) => `<th scope="col" abbr="${diaSemana(x)}"><span aria-hidden="true">${inicialDia(x)}</span><span class="so-leitor">${diaSemana(x)}</span></th>`).join("")}</tr></thead>
        <tbody>${ids.map((id) => `<tr><th scope="row" data-revisao="${alimentoPorId(id)?.revisao ?? ""}">${esc(alimentoPorId(id)?.nome ?? id)}</th>
          ${dias.map((x) => {
            const deu = registros.some((r) => r.data === x && r.alimentos.includes(id));
            return `<td><span class="veg-ponto ${deu ? "veg-ponto--sim" : ""}">${deu ? icone("check", { tamanho: 12 }) : ""}</span><span class="so-leitor">${deu ? "oferecido" : "não oferecido"}</span></td>`;
          }).join("")}</tr>`).join("")}</tbody></table>`
      : `<p class="t-small t-muted">Nenhum vegetal ou fruta registrado nesta semana.</p>`}
    </section>
    <a class="ds-button ds-button--registrar ds-button--bloco" href="registrar-alimentacao.html?grupo=${encodeURIComponent(grupo.id)}">Registrar alimentação</a>`;
}

function painelAmbiente(grupo, estado) {
  const a = grupo.ambiente ?? {};
  const limpeza = estado.cuidadosGrupo.filter((c) => c.grupoId === grupo.id && ["limpeza-dia", "troca-forracao"].includes(c.tipo)).map((c) => c.data).sort().at(-1);
  return `
    <section class="ds-card ds-card--contorno" aria-labelledby="t-amb">
      <header class="dados-topo"><h2 class="t-title" id="t-amb">Ambiente e limpeza</h2><button type="button" class="animais__ver link-botao" data-editar-ambiente>Editar</button></header>
      <dl>${linha("Recinto", a.recinto)}${linha("Forração", a.forracao)}${linha("Última limpeza", limpeza ? dataCurta(limpeza) : "")}</dl>
    </section>
    <a class="ds-button ds-button--registrar ds-button--bloco" href="registrar-cuidados.html?grupo=${encodeURIComponent(grupo.id)}">Registrar cuidados do grupo</a>`;
}

export function telaGrupo(raiz) {
  raiz.classList.add("tela--topo");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  let aba = ABAS.some((a) => a.id === params.get("aba")) ? params.get("aba") : "integrantes";

  const naoEncontrado = () => {
    raiz.classList.remove("tela--topo");
    raiz.innerHTML = `<header class="ds-header"><a class="ds-header__voltar" href="animais.html" aria-label="Voltar">${icone("seta-esquerda")}</a><div><h1>Grupo não encontrado</h1></div></header>
      <a class="ds-button ds-button--bloco" href="animais.html">Ver animais</a>`;
  };

  const desenhar = () => {
    const grupo = grupoPorId(id);
    if (!grupo) return naoEncontrado();
    raiz.classList.add("tela--topo");
    const animais = animaisDoGrupo(id);
    raiz.innerHTML = `
      ${cabecalhoTeal({
        voltarHref: "animais.html",
        conteudo: `<div class="perfil-topo">${avatarGrupoHtml(animais, 56)}
          <div><h1 class="t-h1">${esc(grupo.nome)}</h1><ul class="perfil-topo__tags"><li class="ds-chip ds-chip--tag">${animais.length === 1 ? "1 animal" : `${animais.length} animais`}</li></ul></div></div>`,
      })}
      <div class="perfil-corpo"><div data-abas></div><div id="painel-abas" role="tabpanel" class="perfil-painel" tabindex="-1"></div></div>`;

    const painel = raiz.querySelector("#painel-abas");
    const pintar = () => {
      painel.setAttribute("aria-labelledby", `aba-${aba}`);
      const estado = obter();
      const g = grupoPorId(id);
      painel.innerHTML = aba === "integrantes" ? painelIntegrantes(g) : aba === "alimentacao" ? painelAlimentacao(g, estado) : painelAmbiente(g, estado);
      painel.querySelector("[data-editar-dieta]")?.addEventListener("click", () => abrirFormularioTexto({
        titulo: "Editar dieta",
        campos: [{ id: "racao", rotulo: "Ração", dica: "Marca da ração", valor: g.dieta?.racao }, { id: "vitaminaC", rotulo: "Vitamina C", dica: "Marca da vitamina C", valor: g.dieta?.vitaminaC }, { id: "feno", rotulo: "Feno", dica: "Marca do feno", valor: g.dieta?.feno }],
        aoSalvar: (v) => editarGrupoCampos(id, { dieta: { ...g.dieta, ...v } }),
      }));
      painel.querySelector("[data-editar-ambiente]")?.addEventListener("click", () => abrirFormularioTexto({
        titulo: "Editar ambiente",
        campos: [{ id: "recinto", rotulo: "Recinto", dica: "Tipo e medidas, ex.: gaiola 120 x 60 cm", valor: g.ambiente?.recinto }, { id: "forracao", rotulo: "Forração", dica: "Material usado, ex.: maravalha ou fleece", valor: g.ambiente?.forracao }],
        aoSalvar: (v) => editarGrupoCampos(id, { ambiente: { ...g.ambiente, ...v } }),
      }));
    };
    const abas = criarAbas({ rotulo: "Seções do grupo", itens: ABAS, ativa: aba, aoMudar: (novo) => {
      aba = novo;
      const u = new URL(location.href); u.searchParams.set("aba", novo); history.replaceState(null, "", u);
      pintar();
    } });
    raiz.querySelector("[data-abas]").append(abas.el);
    pintar();
  };

  desenhar();
  assinar(desenhar);
}
