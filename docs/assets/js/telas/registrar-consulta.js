// Consultas e exames (imagem: iPhone 16 - 24/25 e a referência de medidas "Consultas e exames").
// Campos da imagem: animal, data, veterinário ou clínica, motivo, orientação e anexo. O anexo é uma foto
// (imagem), reduzida; não há gerenciador de anexos (F20 fora do escopo).
// Peso na consulta, retorno e tipo (consulta/exame) NÃO estão na imagem e saíram da tela; as funções
// continuam em acoes.js (salvarConsulta) caso a designer queira trazê-los de volta.

import { salvarConsulta } from "../acoes.js";
import { campoAnimal } from "../seletores.js";
import { MOTIVOS } from "../conteudo/sintomas.js";
import { reduzirFoto } from "../foto.js";
import { esc, opcoes, campoDia, agendarAviso, avisar } from "../ui.js";
import { icone } from "../icones.js";

export function telaRegistrarConsulta(raiz) {
  const params = new URLSearchParams(location.search);
  let motivo = "";
  let anexo = null;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Consultas e exames</h1></div>
    </header>
    <form class="form form--consulta" novalidate>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo--grande">Animal</span><div data-animal></div></div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Data</span><div data-dia></div></div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="clinica">Veterinário ou clínica</label>
        <input class="ds-input" id="clinica" name="clinica" type="text" autocomplete="off" maxlength="60">
      </div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Motivo</span><div data-motivo></div></div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="orientacao">Orientação do veterinário</label>
        <textarea class="ds-input ds-input--area" id="orientacao" name="orientacao" rows="4" maxlength="600"></textarea>
      </div>
      <div class="ds-field consulta-anexo">
        <div data-anexo-previa></div>
        <button type="button" class="anexo-botao" data-anexar>Anexar exame ou receita</button>
        <p class="ds-field__erro" id="erro-anexo" hidden></p>
      </div>
      <button class="ds-button ds-button--registrar ds-button--bloco consulta-salvar" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const animal = campoAnimal({ valor: params.get("animal"), voltarPara: "registrar-consulta.html" });
  form.querySelector("[data-animal]").append(animal.el);
  const dia = campoDia({ id: "dia-consulta", rotulo: "Data da consulta" });
  form.querySelector("[data-dia]").append(dia.el);

  form.querySelector("[data-motivo]").append(opcoes({
    rotulo: "Motivo", valor: null, itens: MOTIVOS.map((m) => ({ valor: m.id, rotulo: m.nome })), aoMudar: (v) => { motivo = v; },
  }));

  const previa = form.querySelector("[data-anexo-previa]");
  const pintarAnexo = () => {
    previa.innerHTML = anexo
      ? `<div class="anexo-previa"><img src="${esc(anexo)}" alt="Foto anexada" width="64" height="64"><button type="button" class="link-botao" data-remover>Remover anexo</button></div>` : "";
    previa.querySelector("[data-remover]")?.addEventListener("click", () => { anexo = null; pintarAnexo(); });
  };
  form.querySelector("[data-anexar]").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", async () => {
      const arquivo = input.files?.[0];
      if (!arquivo) return;
      try { anexo = await reduzirFoto(arquivo); pintarAnexo(); } catch { avisar("A imagem não pôde ser lida. Tente outra foto."); }
    });
    input.click();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let foco = null;
    if (!animal.valor()) { animal.erro("Escolha o porquinho."); foco ??= animal.botao; }
    if (!dia.validar()) foco ??= dia.entrada;
    if (foco) { foco.focus(); return; }

    const id = animal.valor();
    salvarConsulta({
      animalId: id, tipo: "consulta", data: dia.valor(), clinica: form.elements.clinica.value, motivo,
      orientacao: form.elements.orientacao.value, pesoGramas: null, retorno: "", anexo,
    });
    agendarAviso("Consulta salva.");
    location.href = `animal.html?id=${encodeURIComponent(id)}&aba=saude`;
  });
}
