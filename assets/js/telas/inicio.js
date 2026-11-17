// Início (imagem: iPhone 16 - 3): grupo, resumo, alertas de atenção, dica e lembretes.
// O cartão de alertas SÓ aparece quando há alerta.

import { obter, assinar, hoje } from "../store.js";
import { grupoAtual, definirGrupoAtual, animalPorId, concluirLembrete, restaurarLembrete } from "../acoes.js";
import { alertas, checkupsVencidos } from "../regras.js";
import { descreverAlerta } from "../alertas.js";
import { dicaParaGrupo } from "../conteudo/dicas.js";
import { avatarHtml } from "../avatar.js";
import { dataTopo, dataCurta, dataRelativa, hora } from "../formato.js";
import { esc, abrirFolha, avisar, cabecalhoTeal } from "../ui.js";
import { icone } from "../icones.js";

function abrirOqueFazer(a) {
  const { titulo, orientacao, animal } = descreverAlerta(a);
  abrirFolha({
    titulo: "O que fazer",
    montar(corpo, fechar) {
      corpo.innerHTML = `
        <p class="t-strong">${esc(titulo)}</p>
        <p class="t-body obs-oque" data-revisao="pendente">${esc(orientacao)}</p>
        <div class="ds-folha__acoes">
          <a class="ds-button ds-button--secundario ds-button--bloco" href="animal.html?id=${encodeURIComponent(animal.id)}&aba=${a.tipo === "peso" ? "peso" : "diario"}">Ver perfil de ${esc(animal.nome)}</a>
          <button type="button" class="ds-button ds-button--bloco" data-fechar>Fechar</button>
        </div>`;
      corpo.querySelector("[data-fechar]").addEventListener("click", () => fechar("fechar"));
    },
  });
}

function ultimaData(datas) {
  return datas.sort().at(-1) ?? null;
}

export function telaInicio(raiz) {
  raiz.classList.add("tela--topo");
  const antes = {}; // estado anterior de cada lembrete concluído, para desfazer
  const params = new URLSearchParams(location.search);
  const doParam = params.get("grupo");
  if (doParam && obter().grupos.some((g) => g.id === doParam)) definirGrupoAtual(doParam);

  const desenhar = () => {
    const estado = obter();
    const h = hoje();
    const grupo = grupoAtual();
    const animais = grupo ? grupo.animais.map(animalPorId).filter((a) => a && !a.arquivado) : [];

    // --- sem nenhum porquinho cadastrado (imagem da tela inicial vazia) ---
    if (!estado.animais.some((a) => !a.arquivado)) {
      const hrefCadastrar = grupo ? `animal-novo.html?grupo=${encodeURIComponent(grupo.id)}` : "animal-novo.html";
      raiz.innerHTML = `
        ${cabecalhoTeal({
          classe: "ds-cabecalho--inicio",
          conteudo: `<div class="inicio-topo"><h1 class="t-h2">Início</h1><p class="inicio-topo__data t-small">${dataTopo(h)}</p></div>`,
        })}
        <div class="inicio-corpo">
          <section class="ds-card inicio-vazio" aria-labelledby="t-vazio">
            <h2 class="t-title" id="t-vazio">Nenhum porquinho por aqui</h2>
            <p class="inicio-vazio__texto">Só precisamos do nome e do grupo. O resto você pode completar depois.</p>
            <a class="ds-button ds-button--registrar ds-button--bloco inicio-vazio__botao" href="${hrefCadastrar}">+ Cadastrar porquinho</a>
          </section>
          <section class="ds-card inicio-explica" aria-labelledby="t-explica">
            <h2 class="t-strong" id="t-explica">O que o Cavia faz</h2>
            <ul>
              <li><span class="inicio-explica__icone inicio-explica__icone--peso">${icone("balanca", { tamanho: 18 })}</span>Acompanha o peso de cada porquinho</li>
              <li><span class="inicio-explica__icone inicio-explica__icone--rotina">${icone("caderno", { tamanho: 18 })}</span>Registra a rotina, dieta e check-ups</li>
              <li><span class="inicio-explica__icone inicio-explica__icone--aviso">${icone("sino", { tamanho: 18 })}</span>Avisa quando algo muda e diz o que fazer</li>
            </ul>
          </section>
        </div>`;
      return;
    }

    // --- resumo do grupo ---
    const limpeza = grupo ? ultimaData(estado.cuidadosGrupo.filter((c) => c.grupoId === grupo.id && ["limpeza-dia", "troca-forracao"].includes(c.tipo)).map((c) => c.data)) : null;
    const observacao = grupo ? ultimaData(estado.observacoes
      .filter((o) => (o.alvo === "grupo" ? o.alvoId === grupo.id : grupo.animais.includes(o.alvoId))).map((o) => o.data)) : null;

    const topo = cabecalhoTeal({
      classe: "ds-cabecalho--inicio",
      conteudo: `
        <div class="inicio-topo">
          <h1 class="t-h2">Início</h1>
          <p class="inicio-topo__data t-small">${dataTopo(h)}</p>
        </div>
        ${grupo ? `
        <div class="inicio-grupo">
          <label class="so-leitor" for="grupo-inicio">Grupo</label>
          <select id="grupo-inicio" class="inicio-select">
            ${estado.grupos.map((g) => `<option value="${g.id}" ${g.id === grupo.id ? "selected" : ""}>${esc(g.nome)}</option>`).join("")}
          </select>
        </div>
        <div class="inicio-avatares" aria-label="Animais do grupo">${animais.map((a) => `<a href="animal.html?id=${encodeURIComponent(a.id)}" aria-label="${esc(a.nome)}">${avatarHtml(a, 40)}</a>`).join("")}</div>
        <dl class="inicio-resumo">
          <div><dt>Animais</dt><dd class="t-figure">${animais.length}</dd></div>
          <div><dt>Última limpeza</dt><dd>${limpeza ? dataCurta(limpeza) : "Não informado"}</dd></div>
          <div><dt>Última observação</dt><dd>${observacao ? dataCurta(observacao) : "Não informado"}</dd></div>
        </dl>` : ""}`,
    });

    // --- alertas: avisos de urgência (vermelho) e um cartão compacto de atenção ---
    const lista = grupo ? alertas(estado, h, grupo.id) : [];
    const descritos = lista.map((a, i) => ({ i, ...descreverAlerta(a) }));
    const urgentes = descritos.filter((d) => d.nivel === "urgente");
    const atencao = descritos.filter((d) => d.nivel !== "urgente");
    const avisosUrgentes = urgentes.map((d) => `
      <button type="button" class="ds-notice ds-notice--urgente alerta-urgente" data-alerta="${d.i}">
        <span class="ds-notice__icone">${icone("alerta", { tamanho: 22 })}</span>
        <span class="alerta-urgente__texto"><strong>${esc(d.titulo)}</strong><br>${esc(d.linha)}</span>
      </button>`).join("");
    const cartaoAlertas = atencao.length ? `
      <section class="ds-card ds-card--alertas" aria-labelledby="titulo-alertas">
        <h2 id="titulo-alertas">Alertas de atenção</h2>
        <ul>
          ${atencao.map((d) => `<li><button type="button" class="alerta-compacto" data-alerta="${d.i}" aria-label="${esc(d.resumo)}. Ver o que fazer">
            <span class="alerta-compacto__icone">${icone("alerta", { tamanho: 16 })}</span>
            <span class="alerta-compacto__texto">${esc(d.resumo)}</span>
            ${icone("seta-direita", { tamanho: 16 })}
          </button></li>`).join("")}
        </ul>
      </section>` : "";
    // --- dica ---
    const dica = dicaParaGrupo(estado, grupo, h);
    const cartaoDica = `
      <section class="ds-card ds-card--dica" aria-labelledby="titulo-dica" data-revisao="${dica.revisao}">
        <h2 class="t-title" id="titulo-dica">${esc(dica.titulo)}</h2>
        <p class="t-body">${esc(dica.texto)}</p>
        ${dica.destino ? `<a class="form__link" href="${esc(dica.destino.href)}">${esc(dica.destino.rotulo)} ${icone("seta-direita", { tamanho: 16 })}</a>` : ""}
      </section>`;

    // --- lembretes e tarefas ---
    const idsDoGrupo = new Set(grupo?.animais ?? []);
    const lembretes = grupo ? estado.lembretes
      .filter((l) => !l.concluido && (l.alvo === "grupo" ? l.alvoId === grupo.id : idsDoGrupo.has(l.alvoId)))
      .sort((a, b) => a.quando.localeCompare(b.quando)).slice(0, 3) : [];
    const checkups = grupo ? checkupsVencidos(estado, h).filter((c) => idsDoGrupo.has(c.animalId)) : [];
    const linhasLembrete = lembretes.map((l) => `
      <li><label class="tarefa">
        <input class="ds-caixa" type="checkbox" data-lembrete="${l.id}">
        <span class="ds-lista__texto"><span class="tarefa__titulo">${esc(l.titulo)}</span>
        <span class="t-small t-muted">${dataRelativa(l.quando.slice(0, 10))}${hora(l.quando) ? `, ${hora(l.quando)}` : ""}</span></span>
      </label></li>`).join("");
    const linhasCheckup = checkups.map((c) => `
      <li class="tarefa tarefa--checkup">
        <span class="ds-lista__texto"><span class="tarefa__titulo">Check-up de ${esc(animalPorId(c.animalId).nome)}</span>
        <span class="t-small t-muted">${c.atrasoDias === 0 ? "Vence hoje" : "Atrasado"}</span></span>
        <a class="ds-button ds-button--secundario tarefa__fazer" href="registrar-checkup.html?animal=${encodeURIComponent(c.animalId)}">Fazer ${icone("seta-direita", { tamanho: 16 })}</a>
      </li>`).join("");
    const cartaoLembretes = grupo ? `
      <section class="ds-card ds-card--contorno" aria-labelledby="titulo-lembretes">
        <header class="lembretes-topo">
          <h2 class="t-title" id="titulo-lembretes">Lembretes e tarefas</h2>
          <a class="animais__ver" href="lembretes.html">Ver mais</a>
        </header>
        ${linhasLembrete || linhasCheckup ? `<ul class="lembretes-lista">${linhasCheckup}${linhasLembrete}</ul>` : `<p class="t-small t-muted">Nenhum lembrete por enquanto.</p>`}
      </section>` : "";

    raiz.innerHTML = `${topo}<div class="inicio-corpo">${avisosUrgentes}${cartaoAlertas}${cartaoDica}${cartaoLembretes}</div>`;

    // --- eventos ---
    raiz.querySelector("#grupo-inicio")?.addEventListener("change", (e) => definirGrupoAtual(e.target.value));
    for (const b of raiz.querySelectorAll("[data-alerta]")) {
      b.addEventListener("click", () => abrirOqueFazer(lista[Number(b.dataset.alerta)]));
    }
    for (const c of raiz.querySelectorAll("[data-lembrete]")) {
      c.addEventListener("change", () => {
        const id = c.dataset.lembrete;
        const rotulo = c.closest("label");
        if (!c.checked) { restaurarLembrete(id, antes[id]); rotulo.classList.remove("tarefa--feita"); return; }
        antes[id] = concluirLembrete(id);
        rotulo.classList.add("tarefa--feita");
        avisar("Lembrete concluído.", { acao: "Desfazer", aoAcionar: () => { restaurarLembrete(id, antes[id]); c.checked = false; rotulo.classList.remove("tarefa--feita"); } });
      });
    }
  };

  desenhar();
  // Só redesenha por mudança de grupo; marcar lembrete não recarrega a lista (o item fica riscado até a próxima visita).
  let ultimoGrupo = grupoAtual()?.id;
  assinar(() => { const g = grupoAtual()?.id; if (g !== ultimoGrupo) { ultimoGrupo = g; desenhar(); } });
}
