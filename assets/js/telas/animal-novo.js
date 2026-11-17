// Cadastrar animal (imagem: iPhone 16 - 11). Só nome e grupo são obrigatórios.

import { obter, hoje } from "../store.js";
import { criarAnimal, animalPorId, editarAnimal, moverAnimal } from "../acoes.js";
import { avatarHtml } from "../avatar.js";
import { abrirOpcoesFoto, abrirMontarAvatar } from "../seletores.js";
import { esc, opcoes, erroCampo, avisar, agendarAviso, guardarRascunho, pegarRascunho } from "../ui.js";
import { icone } from "../icones.js";
import { paraData, dataLocal } from "../datas.js";

/** Data de nascimento aproximada a partir de uma idade. */
function nascimentoPelaIdade(numero, unidade) {
  const d = paraData(hoje());
  if (unidade === "anos") d.setFullYear(d.getFullYear() - numero);
  else d.setMonth(d.getMonth() - numero);
  return dataLocal(d);
}

export function telaAnimalNovo(raiz) {
  const params = new URLSearchParams(location.search);
  const voltar = params.get("voltar");
  const estado = obter();
  const grupos = estado.grupos;

  // Modo edição: animal-novo.html?id=... (mesma tela do cadastro, com os dados preenchidos)
  const editando = params.get("id") ? animalPorId(params.get("id")) : null;
  const base = editando
    ? {
      nome: editando.nome, grupoId: editando.grupoId, sexo: editando.sexo || "femea", nascTipo: "data",
      nascData: editando.nascimento || "", idadeNum: "", idadeUnid: "anos", raca: editando.raca, cor: editando.cor,
      origem: editando.origem, chegouEm: editando.chegouEm || "", castrado: editando.castrado ?? null,
      avatar: editando.avatar, foto: editando.foto,
    }
    : {
      nome: "", grupoId: "", sexo: "femea", nascTipo: "data", nascData: "", idadeNum: "", idadeUnid: "anos",
      raca: "", cor: "", origem: "", chegouEm: "", castrado: null, avatar: null, foto: null,
    };
  // O rascunho existe se a pessoa saiu para criar um grupo e voltou
  const f = { ...base, ...(pegarRascunho("animal") ?? {}) };
  const grupoParam = params.get("grupo");
  if (grupoParam && grupos.some((g) => g.id === grupoParam)) f.grupoId = grupoParam;
  if (!f.grupoId && grupos.length === 1) f.grupoId = grupos[0].id;

  const hrefCriarGrupo = `grupo-novo.html?voltar=${encodeURIComponent("animal-novo.html" + (voltar ? `?voltar=${encodeURIComponent(voltar)}` : ""))}`;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="${esc(voltar ?? "animais.html")}" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Animais</p><h1>${editando ? "Editar animal" : "Cadastrar animal"}</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="avatar-escolha">
        <button class="avatar-escolha__botao" type="button" data-avatar aria-label="Escolher foto ou avatar"></button>
        <div><p class="t-title">Avatar</p><p class="t-small t-muted">Ajuda a reconhecer cada porquinho</p></div>
      </div>

      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="nome">Nome</label>
        <input class="ds-input" id="nome" placeholder="Nome do porquinho" name="nome" type="text" autocomplete="off" maxlength="40" aria-describedby="erro-nome" value="${esc(f.nome)}">
        <p class="ds-field__erro" id="erro-nome" hidden></p>
      </div>

      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="grupo">Grupo</label>
        ${grupos.length ? `
          <select class="ds-input ds-input--select" id="grupo" name="grupo" aria-describedby="erro-grupo">
            <option value="">Escolha o grupo</option>
            ${grupos.map((g) => `<option value="${g.id}" ${g.id === f.grupoId ? "selected" : ""}>${esc(g.nome)}</option>`).join("")}
          </select>
          <a class="form__link" href="${hrefCriarGrupo}" data-criar-grupo>+ Criar um grupo</a>`
        : `<div class="ds-card ds-card--contorno form__sem-grupo" id="grupo">
             <p class="t-small">Você ainda não tem um grupo. Crie um para cadastrar o porquinho.</p>
             <a class="ds-button ds-button--secundario" href="${hrefCriarGrupo}" data-criar-grupo>Criar um grupo</a>
           </div>`}
        <p class="ds-field__erro" id="erro-grupo" hidden></p>
      </div>

      <div class="ds-field" data-sexo><span class="ds-field__rotulo form__rotulo" id="rot-sexo">Sexo</span></div>

      <div class="ds-field" data-nasc>
        <span class="ds-field__rotulo form__rotulo" id="rot-nasc">Nascimento</span>
        <div data-nasc-tipo></div>
        <div data-nasc-data>
          <label class="so-leitor" for="nascData">Data de nascimento</label>
          <input class="ds-input" id="nascData" name="nascData" type="date" max="${hoje()}" aria-describedby="erro-nasc" value="${esc(f.nascData)}">
        </div>
        <div class="form__linha" data-nasc-idade hidden>
          <label class="so-leitor" for="idadeNum">Idade</label>
          <input class="ds-input" id="idadeNum" placeholder="Ex.: 8" name="idadeNum" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" aria-describedby="erro-nasc" value="${esc(f.idadeNum)}">
          <div data-idade-unid></div>
        </div>
        <p class="ds-field__erro" id="erro-nasc" hidden></p>
      </div>

      <details class="ds-card ds-card--contorno ds-detalhes" ${editando ? "open" : ""}>
        <summary><span><span class="t-title">Mais detalhes</span><span class="t-small t-muted">Raça, cor, origem, castração</span></span>${icone("seta-baixo")}</summary>
        <div class="ds-detalhes__corpo">
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="raca">Raça</label>
            <input class="ds-input" id="raca" placeholder="Ex.: Abissínio" name="raca" type="text" autocomplete="off" maxlength="40" value="${esc(f.raca)}"></div>
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="cor">Cor</label>
            <input class="ds-input" id="cor" placeholder="Ex.: Branco e caramelo" name="cor" type="text" autocomplete="off" maxlength="40" value="${esc(f.cor)}"></div>
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="origem">Origem</label>
            <input class="ds-input" id="origem" placeholder="Ex.: Pet shop, criador ou adoção" name="origem" type="text" autocomplete="off" maxlength="40" value="${esc(f.origem)}"></div>
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="chegouEm">Chegou em</label>
            <input class="ds-input" id="chegouEm" name="chegouEm" type="date" max="${hoje()}" value="${esc(f.chegouEm)}"></div>
          <div class="ds-field" data-castrado><span class="ds-field__rotulo form__rotulo">Castrado</span></div>
        </div>
      </details>

      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">${editando ? "Salvar alterações" : "Salvar animal"}</button>
    </form>`;

  const form = raiz.querySelector("form");
  const nome = form.elements.nome;
  const grupo = form.elements.grupo?.tagName === "SELECT" ? form.elements.grupo : null;

  // --- Avatar / foto ---
  const botaoAvatar = form.querySelector("[data-avatar]");
  const desenharAvatar = () => {
    botaoAvatar.classList.toggle("avatar-escolha__botao--vazio", !f.foto && !f.avatar);
    botaoAvatar.innerHTML = f.foto || f.avatar ? avatarHtml({ foto: f.foto, avatar: f.avatar }, 72) : icone("camera", { tamanho: 28 });
  };
  desenharAvatar();
  botaoAvatar.addEventListener("click", () => abrirOpcoesFoto({
    aoFoto: (dataUrl, erro) => {
      if (erro) return avisar(erro);
      f.foto = dataUrl;
      desenharAvatar();
    },
    aoMontar: () => abrirMontarAvatar({
      avatar: f.avatar ?? undefined,
      aoSalvar: (av) => { f.avatar = av; f.foto = null; desenharAvatar(); },
    }),
  }));

  // --- Sexo, nascimento, castração ---
  const sexo = opcoes({
    rotulo: "Sexo", variante: "segmentado", valor: f.sexo,
    itens: [{ valor: "femea", rotulo: "Fêmea" }, { valor: "macho", rotulo: "Macho" }],
    aoMudar: (v) => { f.sexo = v; },
  });
  form.querySelector("[data-sexo]").append(sexo);

  const painelData = form.querySelector("[data-nasc-data]");
  const painelIdade = form.querySelector("[data-nasc-idade]");
  const mostrarNasc = () => {
    painelData.hidden = f.nascTipo !== "data";
    painelIdade.hidden = f.nascTipo !== "idade";
    erroCampo(null, "erro-nasc", "");
  };
  form.querySelector("[data-nasc-tipo]").append(opcoes({
    rotulo: "Como informar o nascimento", valor: f.nascTipo,
    itens: [{ valor: "data", rotulo: "Sei a data" }, { valor: "idade", rotulo: "Apenas a idade" }],
    aoMudar: (v) => { f.nascTipo = v; mostrarNasc(); },
  }));
  form.querySelector("[data-idade-unid]").append(opcoes({
    rotulo: "Unidade da idade", variante: "segmentado", valor: f.idadeUnid,
    itens: [{ valor: "anos", rotulo: "anos" }, { valor: "meses", rotulo: "meses" }],
    aoMudar: (v) => { f.idadeUnid = v; },
  }));
  mostrarNasc();
  form.elements.idadeNum.addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, ""); });

  form.querySelector("[data-castrado]").append(opcoes({
    rotulo: "Castrado", valor: f.castrado === null ? null : f.castrado ? "sim" : "nao",
    itens: [{ valor: "sim", rotulo: "Sim" }, { valor: "nao", rotulo: "Não" }],
    aoMudar: (v) => { f.castrado = v === "sim"; },
  }));

  // --- Rascunho ao sair para criar um grupo ---
  const lerCampos = () => ({
    ...f, nome: nome.value, grupoId: grupo?.value ?? f.grupoId, nascData: form.elements.nascData.value,
    idadeNum: form.elements.idadeNum.value, chegouEm: form.elements.chegouEm.value, raca: form.elements.raca.value, cor: form.elements.cor.value, origem: form.elements.origem.value,
  });
  form.querySelector("[data-criar-grupo]").addEventListener("click", () => guardarRascunho("animal", lerCampos()));

  nome.addEventListener("input", () => erroCampo(nome, "erro-nome", ""));
  grupo?.addEventListener("change", () => erroCampo(grupo, "erro-grupo", ""));

  // --- Salvar ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = lerCampos();
    let primeiroErro = null;
    if (!dados.nome.trim()) { erroCampo(nome, "erro-nome", "Digite o nome do porquinho."); primeiroErro ??= nome; }
    if (!dados.grupoId) {
      erroCampo(grupo, "erro-grupo", grupos.length ? "Escolha o grupo." : "Crie um grupo para continuar.");
      primeiroErro ??= grupo ?? form.querySelector("[data-criar-grupo]");
    }

    let nascimento = "";
    let aproximado = false;
    if (dados.nascTipo === "data" && dados.nascData) {
      if (dados.nascData > hoje()) { erroCampo(form.elements.nascData, "erro-nasc", "A data não pode ser no futuro."); primeiroErro ??= form.elements.nascData; }
      else nascimento = dados.nascData;
    } else if (dados.nascTipo === "idade" && dados.idadeNum !== "") {
      nascimento = nascimentoPelaIdade(Number(dados.idadeNum), dados.idadeUnid);
      aproximado = true;
    }
    if (primeiroErro) { primeiroErro.focus(); return; }

    if (dados.chegouEm && dados.chegouEm > hoje()) {
      erroCampo(form.elements.chegouEm, "erro-nasc", "A data de chegada não pode ser no futuro.");
      form.elements.chegouEm.closest("details").open = true;
      form.elements.chegouEm.focus();
      return;
    }

    if (editando) {
      editarAnimal(editando.id, {
        nome: dados.nome.trim(), sexo: dados.sexo,
        // sem preencher nascimento de novo, mantém o que já existe
        ...(nascimento || dados.nascTipo === "data" ? { nascimento, nascimentoAproximado: aproximado } : {}),
        raca: dados.raca.trim(), cor: dados.cor.trim(), origem: dados.origem.trim(), chegouEm: dados.chegouEm,
        castrado: dados.castrado, ...(dados.avatar ? { avatar: dados.avatar } : {}), foto: dados.foto,
      });
      if (dados.grupoId !== editando.grupoId) moverAnimal(editando.id, dados.grupoId);
      agendarAviso("Alterações salvas.");
      location.href = voltar ?? `animal.html?id=${encodeURIComponent(editando.id)}`;
      return;
    }

    const id = criarAnimal({
      nome: dados.nome, grupoId: dados.grupoId, sexo: dados.sexo, nascimento, nascimentoAproximado: aproximado,
      raca: dados.raca.trim(), cor: dados.cor.trim(), origem: dados.origem.trim(), castrado: dados.castrado,
      chegouEm: dados.chegouEm,
      avatar: dados.avatar ?? undefined, foto: dados.foto,
    });
    const alvo = voltar ?? "animais.html";
    const sep = alvo.includes("?") ? "&" : "?";
    agendarAviso(`${dados.nome.trim()} cadastrado.`, voltar ? {} : { acao: "Registrar peso", href: `registrar-peso.html?animal=${encodeURIComponent(id)}` });
    location.href = `${alvo}${sep}animal=${encodeURIComponent(id)}`;
  });
}
