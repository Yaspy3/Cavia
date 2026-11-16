// Notificações (SEM imagem de referência: proposta mínima). Os avisos são simulados dentro do app;
// aqui só se guardam as preferências. Alertas e doses ignoram o horário de silêncio (a confirmar).

import { obter } from "../store.js";
import { definirNotificacao, definirSilencio } from "../acoes.js";
import { interruptor } from "../ui.js";
import { icone } from "../icones.js";

const TIPOS = [
  { id: "alertas", titulo: "Alertas de atenção", sub: "Peso e observações fora do padrão" },
  { id: "checkup", titulo: "Check-up de saúde", sub: "Quando o check-up vence" },
  { id: "dose", titulo: "Doses de medicação", sub: "Cada dose do tratamento" },
  { id: "consulta", titulo: "Consultas e retornos", sub: "Dia da consulta ou do retorno" },
  { id: "limpeza", titulo: "Limpeza do grupo", sub: "Quando a limpeza está atrasada" },
  { id: "personalizados", titulo: "Lembretes personalizados", sub: "Os que você criou" },
];

export function telaNotificacoes(raiz) {
  const { config } = obter();
  const ligado = (id) => config.notificacoes?.[id] !== false; // por padrão tudo ligado
  const silencio = config.silencio;

  raiz.innerHTML = `
    <header class="ds-header">
      <a class="ds-header__voltar" href="perfil.html" aria-label="Voltar">${icone("seta-esquerda")}</a>
      <div><p class="ds-header__sobre">Perfil</p><h1>Notificações</h1></div>
    </header>
    <section class="ds-card ds-card--contorno" aria-labelledby="t-avisos">
      <h2 class="t-title" id="t-avisos">Avisos</h2>
      <ul class="notif-lista" data-tipos></ul>
    </section>
    <section class="ds-card ds-card--contorno" aria-labelledby="t-silencio">
      <div class="notif-linha">
        <span class="ds-lista__texto"><span class="t-title" id="t-silencio">Horário de silêncio</span>
          <span class="t-small t-muted">Sem avisos neste intervalo</span></span>
        <span data-silencio></span>
      </div>
      <div class="notif-horas" data-horas ${silencio.ativo ? "" : "hidden"}>
        <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="de">De</label>
          <input class="ds-input" id="de" type="time" value="${silencio.de}"></div>
        <div class="ds-field"><label class="ds-field__rotulo form__rotulo" for="ate">Até</label>
          <input class="ds-input" id="ate" type="time" value="${silencio.ate}"></div>
      </div>
      <p class="t-small t-muted">Alertas de atenção e doses ignoram o horário de silêncio.</p>
    </section>
    <a class="ds-button ds-button--secundario ds-button--bloco" href="lembretes.html">Ver lembretes personalizados</a>`;

  const lista = raiz.querySelector("[data-tipos]");
  for (const t of TIPOS) {
    const li = document.createElement("li");
    li.className = "notif-linha";
    li.innerHTML = `<span class="ds-lista__texto"><span class="t-strong" id="n-${t.id}">${t.titulo}</span><span class="t-small t-muted">${t.sub}</span></span>`;
    li.append(interruptor({ idRotulo: `n-${t.id}`, ligado: ligado(t.id), aoMudar: (v) => definirNotificacao(t.id, v) }));
    lista.append(li);
  }

  const horas = raiz.querySelector("[data-horas]");
  raiz.querySelector("[data-silencio]").append(interruptor({
    idRotulo: "t-silencio", ligado: silencio.ativo,
    aoMudar: (v) => { definirSilencio({ ativo: v }); horas.hidden = !v; },
  }));
  raiz.querySelector("#de").addEventListener("change", (e) => definirSilencio({ de: e.target.value || "22:00" }));
  raiz.querySelector("#ate").addEventListener("change", (e) => definirSilencio({ ate: e.target.value || "07:00" }));
}
