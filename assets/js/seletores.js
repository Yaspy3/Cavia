// Pop-ups de escolha reutilizados em várias telas: animal, foto e avatar montável.

import { obter } from "./store.js";
import { abrirFolha, esc } from "./ui.js";
import { icone } from "./icones.js";
import { avatarHtml, avatarGrupoHtml, avatarSvg, PELAGENS, MARCAS, FUNDOS, AVATAR_PADRAO } from "./avatar.js";
import { reduzirFoto } from "./foto.js";

/** Escolher um porquinho (lista com avatar). `hrefCadastrar` leva ao cadastro e volta à mesma tela. */
export function escolherAnimal({ atualId = null, hrefCadastrar, aoEscolher }) {
  const estado = obter();
  const animais = estado.animais.filter((a) => !a.arquivado);
  abrirFolha({
    titulo: "Escolher porquinho",
    montar(corpo, fechar) {
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      lista.setAttribute("role", "radiogroup");
      lista.setAttribute("aria-label", "Porquinho");
      if (!animais.length) {
        lista.innerHTML = `<p class="t-body t-muted">Você ainda não cadastrou nenhum porquinho.</p>`;
      }
      for (const a of animais) {
        const grupo = estado.grupos.find((g) => g.id === a.grupoId);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ds-lista__linha";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(a.id === atualId));
        b.innerHTML = `${avatarHtml(a, 40)}
          <span class="ds-lista__texto"><span class="t-strong">${esc(a.nome)}</span><span class="t-small t-muted">${esc(grupo?.nome ?? "")}</span></span>
          ${a.id === atualId ? icone("check") : ""}`;
        b.addEventListener("click", () => { fechar("escolheu"); aoEscolher(a.id); });
        lista.append(b);
      }
      const mais = document.createElement("a");
      mais.className = "ds-lista__linha ds-lista__linha--link";
      mais.href = hrefCadastrar;
      mais.textContent = "+ Cadastrar um animal";
      corpo.append(lista, mais);
    },
  });
}

/**
 * Campo "Animal" completo: botão com o animal escolhido (avatar e nome) que abre o pop-up de escolha,
 * mais a mensagem de erro. `voltarPara` = página a que o cadastro volta (ex.: "registrar-sintomas.html").
 * Com um único animal, ele já vem escolhido. Devolve { el, valor(), erro(msg) }.
 */
export function campoAnimal({ valor = null, voltarPara, idErro = "erro-animal", aoMudar = null }) {
  const ativos = obter().animais.filter((a) => !a.arquivado);
  let id = valor && ativos.some((a) => a.id === valor) ? valor : ativos.length === 1 ? ativos[0].id : null;
  const el = document.createElement("div");
  el.className = "ds-field";
  el.innerHTML = `<button class="ds-seletor" type="button" aria-haspopup="dialog" aria-describedby="${idErro}"></button>
    <p class="ds-field__erro" id="${idErro}" hidden></p>`;
  const botao = el.querySelector("button");
  const erroEl = el.querySelector("p");
  const desenhar = () => {
    const a = id ? ativos.find((x) => x.id === id) : null;
    botao.innerHTML = a
      ? `${avatarHtml(a, 32)}<span class="ds-seletor__texto">${esc(a.nome)}</span>${icone("seta-baixo")}`
      : `<span class="ds-seletor__texto ds-seletor__texto--vazio">Escolher porquinho</span>${icone("seta-baixo")}`;
  };
  const erro = (msg) => {
    if (msg) {
      erroEl.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>${esc(msg)}</span>`;
      erroEl.hidden = false;
      botao.setAttribute("aria-invalid", "true");
    } else {
      erroEl.hidden = true;
      botao.removeAttribute("aria-invalid");
    }
  };
  botao.addEventListener("click", () => escolherAnimal({
    atualId: id, hrefCadastrar: `animal-novo.html?voltar=${encodeURIComponent(voltarPara)}`,
    aoEscolher: (novo) => { id = novo; erro(""); desenhar(); aoMudar?.(novo); },
  }));
  desenhar();
  return { el, botao, valor: () => id, erro };
}

/** Pop-up com campos de texto simples (ex.: marcas da dieta, medidas do recinto). */
export function abrirFormularioTexto({ titulo, campos, aoSalvar }) {
  abrirFolha({
    titulo,
    montar(corpo, fechar) {
      const form = document.createElement("form");
      form.className = "form";
      form.noValidate = true;
      form.innerHTML = `${campos.map((c) => `
        <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="f-${c.id}">${esc(c.rotulo)}</label>
        <input class="ds-input" id="f-${c.id}" name="${c.id}" type="text" autocomplete="off" maxlength="60" value="${esc(c.valor ?? "")}"></div>`).join("")}
        <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
        <button class="ds-button ds-button--contorno ds-button--bloco" type="button" data-cancelar>Cancelar</button>`;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const valores = Object.fromEntries(campos.map((c) => [c.id, form.elements[c.id].value.trim()]));
        fechar("salvou");
        aoSalvar(valores);
      });
      form.querySelector("[data-cancelar]").addEventListener("click", () => fechar("cancelar"));
      corpo.append(form);
    },
  });
}

/** Escolher um grupo (lista com os avatares dos integrantes). */
export function escolherGrupo({ atualId = null, hrefCriar, aoEscolher }) {
  const estado = obter();
  abrirFolha({
    titulo: "Escolher grupo",
    montar(corpo, fechar) {
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      lista.setAttribute("role", "radiogroup");
      lista.setAttribute("aria-label", "Grupo");
      if (!estado.grupos.length) lista.innerHTML = `<p class="t-body t-muted">Você ainda não criou nenhum grupo.</p>`;
      for (const g of estado.grupos) {
        const animais = g.animais.map((id) => estado.animais.find((a) => a.id === id)).filter((a) => a && !a.arquivado);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ds-lista__linha";
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", String(g.id === atualId));
        b.innerHTML = `${avatarGrupoHtml(animais, 32)}<span class="ds-lista__texto"><span class="t-strong">${esc(g.nome)}</span></span>${g.id === atualId ? icone("check") : ""}`;
        b.addEventListener("click", () => { fechar("escolheu"); aoEscolher(g.id); });
        lista.append(b);
      }
      const mais = document.createElement("a");
      mais.className = "ds-lista__linha ds-lista__linha--link";
      mais.href = hrefCriar;
      mais.textContent = "+ Criar um grupo";
      corpo.append(lista, mais);
    },
  });
}

function pedirArquivo({ camera, aoFoto }) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  if (camera) input.setAttribute("capture", "environment");
  input.addEventListener("change", async () => {
    const arquivo = input.files?.[0];
    if (!arquivo) return;
    try { aoFoto(await reduzirFoto(arquivo)); } catch { aoFoto(null, "A imagem não pôde ser lida. Tente outra foto."); }
  });
  input.click();
}

/** Pop-up "Tirar foto / Escolher da galeria / Montar um avatar" (iPhone 16 - 37). */
export function abrirOpcoesFoto({ aoFoto, aoMontar }) {
  abrirFolha({
    titulo: "Foto ou avatar",
    montar(corpo, fechar) {
      const itens = [
        { rotulo: "Tirar foto", icone: "camera", agir: () => pedirArquivo({ camera: true, aoFoto }) },
        { rotulo: "Escolher da galeria", icone: "imagem", agir: () => pedirArquivo({ camera: false, aoFoto }) },
        { rotulo: "Montar um avatar", icone: "porquinho", agir: aoMontar },
      ];
      const lista = document.createElement("div");
      lista.className = "ds-lista";
      for (const item of itens) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "ds-lista__linha";
        b.innerHTML = `<span class="ds-lista__icone">${icone(item.icone)}</span><span class="t-strong">${item.rotulo}</span>`;
        b.addEventListener("click", () => { fechar("escolheu"); item.agir(); });
        lista.append(b);
      }
      const cancelar = document.createElement("button");
      cancelar.type = "button";
      cancelar.className = "ds-button ds-button--contorno ds-button--bloco";
      cancelar.textContent = "Cancelar";
      cancelar.addEventListener("click", () => fechar("cancelar"));
      corpo.append(lista, cancelar);
    },
  });
}

/** Montar avatar: pelagem, marcas e fundo, com prévia ao vivo (iPhone 16 - 38). */
export function abrirMontarAvatar({ avatar = AVATAR_PADRAO, aoSalvar }) {
  const atual = { ...AVATAR_PADRAO, ...avatar };
  abrirFolha({
    titulo: "Montar avatar",
    montar(corpo, fechar) {
      corpo.innerHTML = `
        <div class="avatar-previa" aria-hidden="true"></div>
        <fieldset class="avatar-grupo"><legend class="t-strong">Pelagem</legend><div class="avatar-opcoes" data-campo="pelagem"></div></fieldset>
        <fieldset class="avatar-grupo"><legend class="t-strong">Marcas</legend><div class="avatar-opcoes avatar-opcoes--marcas" data-campo="marca"></div></fieldset>
        <fieldset class="avatar-grupo"><legend class="t-strong">Fundo</legend><div class="avatar-opcoes" data-campo="fundo"></div></fieldset>
        <button type="button" class="ds-button ds-button--registrar ds-button--bloco" data-salvar>Salvar avatar</button>`;
      const previa = corpo.querySelector(".avatar-previa");
      const desenharPrevia = () => { previa.innerHTML = avatarSvg(atual, 120); };

      const montarCampo = (campo, chaves, rotuloDe, miniatura) => {
        const caixa = corpo.querySelector(`[data-campo="${campo}"]`);
        caixa.setAttribute("role", "radiogroup");
        caixa.setAttribute("aria-label", { pelagem: "Pelagem", marca: "Marcas", fundo: "Fundo" }[campo]);
        const atualizar = () => {
          for (const b of caixa.children) b.setAttribute("aria-checked", String(b.dataset.valor === atual[campo]));
        };
        for (const chave of chaves) {
          const b = document.createElement("button");
          b.type = "button";
          b.setAttribute("role", "radio");
          b.className = "avatar-opcao";
          b.dataset.valor = chave;
          b.setAttribute("aria-label", rotuloDe(chave));
          b.innerHTML = miniatura(chave);
          b.addEventListener("click", () => { atual[campo] = chave; atualizar(); desenharPrevia(); montarMiniaturas(); });
          caixa.append(b);
        }
        atualizar();
      };
      const montarMiniaturas = () => {
        for (const b of corpo.querySelectorAll('[data-campo="marca"] .avatar-opcao')) {
          b.innerHTML = `${avatarSvg({ ...atual, marca: b.dataset.valor }, 40)}<span class="t-caption">${MARCAS[b.dataset.valor]}</span>`;
        }
      };

      montarCampo("pelagem", Object.keys(PELAGENS), (c) => PELAGENS[c].nome,
        (c) => `<span class="avatar-cor" style="background:${PELAGENS[c].pelo}"></span>`);
      montarCampo("marca", Object.keys(MARCAS), (c) => MARCAS[c], () => "");
      montarCampo("fundo", Object.keys(FUNDOS), (c) => FUNDOS[c].nome,
        (c) => `<span class="avatar-cor" style="background:${FUNDOS[c].cor}"></span>`);
      desenharPrevia();
      montarMiniaturas();

      corpo.querySelector("[data-salvar]").addEventListener("click", () => { fechar("salvou"); aoSalvar({ ...atual }); });
    },
  });
}
