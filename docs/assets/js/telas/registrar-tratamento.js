// Tratamentos e medicações (imagem: iPhone 16 - 26). A dose é TEXTO LIVRE copiado da receita:
// o app nunca calcula nem sugere dose. Com "Lembrete de cada dose", cria um lembrete diário por horário,
// que termina no último dia do tratamento.

import { hoje } from "../store.js";
import { salvarTratamento } from "../acoes.js";
import { campoAnimal } from "../seletores.js";
import { esc, opcoes, campoDia, erroCampo, interruptor, agendarAviso } from "../ui.js";
import { icone } from "../icones.js";

const DURACOES = [
  { valor: 1, rotulo: "1 dia" }, { valor: 2, rotulo: "2 dias" }, { valor: 3, rotulo: "3 dias" }, { valor: 5, rotulo: "5 dias" },
  { valor: 7, rotulo: "7 dias" }, { valor: 10, rotulo: "10 dias" }, { valor: 14, rotulo: "14 dias" }, { valor: 21, rotulo: "21 dias" },
  { valor: 30, rotulo: "30 dias" }, { valor: 0, rotulo: "Uso contínuo" },
];
// Horários iniciais só para facilitar o preenchimento; a pessoa ajusta conforme a receita.
const HORARIOS_SUGERIDOS = ["08:00", "20:00", "14:00", "02:00", "11:00", "17:00"];

export function telaRegistrarTratamento(raiz) {
  const params = new URLSearchParams(location.search);
  let vezes = 1;
  let outra = false;
  let horarios = [HORARIOS_SUGERIDOS[0]];
  let lembrete = true;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="registrar.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Registrar</p><h1>Tratamentos e medicações</h1></div>
    </header>
    <form class="form" novalidate>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo--grande">Animal</span><div data-animal></div></div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="nome">Medicamento ou tratamento</label>
        <input class="ds-input" id="nome" name="nome" type="text" autocomplete="off" maxlength="60" aria-describedby="erro-nome">
        <p class="ds-field__erro" id="erro-nome" hidden></p>
      </div>
      <div class="ds-field">
        <label class="ds-field__rotulo form__rotulo" for="dose">Dose</label>
        <input class="ds-input" id="dose" name="dose" type="text" autocomplete="off" maxlength="80" aria-describedby="ajuda-dose">
        <p class="t-caption t-muted" id="ajuda-dose">Copie da receita do veterinário. O Cavia não sugere dose.</p>
      </div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Quantas vezes por dia</span><div data-vezes></div>
        <div data-outra hidden>
          <label class="so-leitor" for="outra">Número de vezes por dia</label>
          <input class="ds-input" id="outra" name="outra" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" aria-describedby="erro-vezes" placeholder="Quantas vezes">
        </div>
        <p class="ds-field__erro" id="erro-vezes" hidden></p></div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Horários</span>
        <div class="trat-horarios" data-horarios></div>
        <button type="button" class="ds-opcao trat-mais" data-mais>+ Horário</button>
        <p class="ds-field__erro" id="erro-horarios" hidden></p></div>
      <div class="ds-field"><span class="ds-field__rotulo form__rotulo">Duração</span>
        <div class="form__linha trat-duracao">
          <div class="trat-inicio"><span class="t-small t-muted">Início</span><div data-inicio></div></div>
          <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="dias">Por</label>
            <select class="ds-input ds-input--select" id="dias" name="dias">${DURACOES.map((d) => `<option value="${d.valor}" ${d.valor === 3 ? "selected" : ""}>${d.rotulo}</option>`).join("")}</select></div>
        </div>
      </div>
      <div class="ds-card ds-card--contorno trat-lembrete">
        <span class="t-strong" id="rot-lembrete">Lembrete de cada dose</span><span data-lembrete></span>
      </div>
      <button class="ds-button ds-button--registrar ds-button--bloco" type="submit">Salvar</button>
    </form>`;

  const form = raiz.querySelector("form");
  const animal = campoAnimal({ valor: params.get("animal"), voltarPara: "registrar-tratamento.html" });
  form.querySelector("[data-animal]").append(animal.el);
  const inicio = campoDia({ id: "dia-trat", rotulo: "Início do tratamento" });
  form.querySelector("[data-inicio]").append(inicio.el);
  form.querySelector("[data-lembrete]").append(interruptor({ idRotulo: "rot-lembrete", ligado: lembrete, aoMudar: (v) => { lembrete = v; } }));

  const caixaOutra = form.querySelector("[data-outra]");
  const grupoVezes = opcoes({
    rotulo: "Quantas vezes por dia", valor: "1",
    itens: [{ valor: "1", rotulo: "1x" }, { valor: "2", rotulo: "2x" }, { valor: "3", rotulo: "3x" }, { valor: "outra", rotulo: "Outra" }],
    aoMudar: (v) => {
      outra = v === "outra";
      caixaOutra.hidden = !outra;
      erroCampo(null, "erro-vezes", "");
      if (outra) { form.elements.outra.focus(); return; }
      ajustar(Number(v));
    },
  });
  form.querySelector("[data-vezes]").append(grupoVezes);

  function ajustar(n) {
    vezes = n;
    horarios = Array.from({ length: n }, (_, i) => horarios[i] ?? HORARIOS_SUGERIDOS[i] ?? "12:00");
    pintarHorarios();
  }

  function pintarHorarios() {
    const caixa = form.querySelector("[data-horarios]");
    caixa.innerHTML = horarios.map((h, i) => `
      <div class="trat-hora"><label class="so-leitor" for="h${i}">Horário ${i + 1}</label>
      <input class="ds-input" id="h${i}" type="time" value="${h}" data-h="${i}"></div>`).join("");
    for (const inp of caixa.querySelectorAll("[data-h]")) {
      inp.addEventListener("change", () => { horarios[Number(inp.dataset.h)] = inp.value; erroCampo(null, "erro-horarios", ""); });
    }
  }
  form.querySelector("[data-mais]").addEventListener("click", () => {
    horarios.push(HORARIOS_SUGERIDOS[horarios.length] ?? "12:00");
    vezes = horarios.length;
    outra = ![1, 2, 3].includes(vezes);
    grupoVezes.definir(outra ? "outra" : String(vezes));
    caixaOutra.hidden = !outra;
    if (outra) form.elements.outra.value = String(vezes);
    pintarHorarios();
    form.querySelector(`[data-h="${horarios.length - 1}"]`).focus();
  });
  form.elements.outra.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "");
    erroCampo(null, "erro-vezes", "");
    const n = Number(e.target.value);
    if (n >= 1 && n <= 12) ajustar(n);
  });
  form.elements.nome.addEventListener("input", () => erroCampo(form.elements.nome, "erro-nome", ""));
  pintarHorarios();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let foco = null;
    if (!animal.valor()) { animal.erro("Escolha o porquinho."); foco ??= animal.botao; }
    if (!form.elements.nome.value.trim()) { erroCampo(form.elements.nome, "erro-nome", "Digite o nome do medicamento ou tratamento."); foco ??= form.elements.nome; }
    if (outra && !(Number(form.elements.outra.value) >= 1 && Number(form.elements.outra.value) <= 12)) {
      erroCampo(form.elements.outra, "erro-vezes", "Digite um número de vezes por dia entre 1 e 12."); foco ??= form.elements.outra;
    }
    if (horarios.some((h) => !h)) {
      const el = form.querySelector("#erro-horarios");
      el.innerHTML = `${icone("alerta", { tamanho: 16 })}<span>Preencha todos os horários.</span>`;
      el.hidden = false;
      foco ??= form.querySelector("[data-h]");
    }
    if (!inicio.validar()) foco ??= inicio.entrada;
    if (foco) { foco.focus(); return; }

    const id = animal.valor();
    salvarTratamento({
      animalId: id, nome: form.elements.nome.value, dose: form.elements.dose.value, vezesPorDia: horarios.length,
      horarios: [...horarios].sort(), inicio: inicio.valor(), dias: Number(form.elements.dias.value), lembrete,
    });
    agendarAviso(lembrete ? "Tratamento salvo. Os lembretes das doses foram criados." : "Tratamento salvo.");
    location.href = `animal.html?id=${encodeURIComponent(id)}&aba=saude`;
  });
}
