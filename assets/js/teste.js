// Modo de teste: só existe com ?teste=1 (guardado em sessionStorage durante a sessão).
// Sem o parâmetro, nada disto aparece.

import { carregarExemplo, zerar, obter, hoje, definirHoje, diaSimulado } from "./store.js";
import { avisar, confirmar, raizApp } from "./ui.js";
import { hora } from "./formato.js";

const CHAVE = "cavia:teste";
const CHAVE_DESTAQUE = "cavia:teste-destaque";

function ligado() {
  try {
    const param = new URLSearchParams(location.search).get("teste");
    if (param === "1") sessionStorage.setItem(CHAVE, "1");
    if (param === "0") sessionStorage.removeItem(CHAVE);
    return sessionStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

function botao(texto, aoClicar) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = texto;
  b.addEventListener("click", aoClicar);
  return b;
}

async function versaoDoCache() {
  try {
    const nomes = await caches.keys();
    const cavia = nomes.find((n) => n.startsWith("cavia-"));
    return cavia ? cavia.slice("cavia-".length) : "sem cache (desenvolvimento)";
  } catch {
    return "indisponível";
  }
}

export function iniciarTeste() {
  if (!ligado()) return;

  let destaque = false;
  try { destaque = sessionStorage.getItem(CHAVE_DESTAQUE) === "1"; } catch { /* ignora */ }
  document.documentElement.classList.toggle("destacar-pendente", destaque);

  const painel = document.createElement("details");
  painel.className = "teste";
  const resumo = document.createElement("summary");
  resumo.textContent = "Modo de teste";
  const corpo = document.createElement("div");
  corpo.className = "teste__corpo";
  painel.append(resumo, corpo);

  corpo.append(
    botao("Restaurar dados de exemplo", async () => {
      if (await confirmar({
        titulo: "Restaurar dados de exemplo?",
        texto: "Os dados atuais deste aparelho serão substituídos pelos de exemplo.",
        rotuloConfirmar: "Restaurar",
      })) { carregarExemplo(); location.reload(); }
    }),
    botao("Zerar dados", async () => {
      if (await confirmar({
        titulo: "Zerar todos os dados?",
        texto: "Isso apaga tudo o que está guardado neste aparelho. Não dá para desfazer.",
        rotuloConfirmar: "Zerar dados",
      })) { zerar(); location.reload(); }
    }),
  );

  const linha = document.createElement("div");
  linha.className = "teste__linha";
  const dia = document.createElement("input");
  dia.type = "date";
  dia.value = hoje();
  dia.setAttribute("aria-label", "Dia simulado");
  linha.append(dia, botao("Usar", () => { definirHoje(dia.value || null); location.reload(); }));
  const rotuloDia = document.createElement("p");
  rotuloDia.className = "t-label";
  rotuloDia.textContent = diaSimulado() ? `Dia simulado: ${diaSimulado()}` : "Dia simulado: hoje (real)";
  corpo.append(rotuloDia, linha);
  if (diaSimulado()) corpo.append(botao("Voltar ao dia real", () => { definirHoje(null); location.reload(); }));

  corpo.append(
    botao("Simular lembrete", () => {
      const l = obter().lembretes.find((x) => !x.concluido);
      avisar(l ? `Lembrete: ${l.titulo}${hora(l.quando) ? `, às ${hora(l.quando)}` : ""}` : "Lembrete: exemplo de aviso do Cavia");
    }),
    botao("Destacar conteúdo a validar", () => {
      destaque = !destaque;
      document.documentElement.classList.toggle("destacar-pendente", destaque);
      try { sessionStorage.setItem(CHAVE_DESTAQUE, destaque ? "1" : "0"); } catch { /* ignora */ }
    }),
    botao("Moldura do celular: ligar ou desligar", () => {
      try { sessionStorage.setItem("cavia:moldura", document.documentElement.classList.contains("com-moldura") ? "0" : "1"); } catch { /* ignora */ }
      location.reload();
    }),
    botao("Ver versão", async () => avisar(`Versão: ${await versaoDoCache()}`, { duracao: 7000 })),
  );

  raizApp().append(painel);
}
