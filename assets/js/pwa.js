// Registro do service worker, aviso de versão nova e captura do convite de instalação.

import { avisar } from "./ui.js";

let eventoInstalar = null;

export function podeInstalar() {
  return eventoInstalar !== null;
}

/** Chama o convite de instalação do navegador (Android/Chrome). No iPhone não existe. */
export async function instalar() {
  if (!eventoInstalar) return false;
  eventoInstalar.prompt();
  const { outcome } = await eventoInstalar.userChoice;
  eventoInstalar = null;
  return outcome === "accepted";
}

function ehDesenvolvimento() {
  return ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
}

function swLigado() {
  try {
    if (new URLSearchParams(location.search).get("sw") === "1") sessionStorage.setItem("cavia:sw", "1");
    return sessionStorage.getItem("cavia:sw") === "1";
  } catch {
    return false;
  }
}

function mostrarAtualizacao(registro) {
  avisar("Há uma versão nova do Cavia.", {
    acao: "Atualizar",
    aoAcionar: () => {
      navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
      registro.waiting?.postMessage("pular-espera");
    },
  });
}

export async function iniciarPwa() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalar = e;
    window.dispatchEvent(new CustomEvent("cavia:pode-instalar"));
  });
  window.addEventListener("appinstalled", () => { eventoInstalar = null; });

  if (!("serviceWorker" in navigator)) return;

  // Em desenvolvimento (localhost sem ?sw=1) não registra, e limpa o que ficou de testes antigos.
  if (ehDesenvolvimento() && !swLigado()) {
    const registros = await navigator.serviceWorker.getRegistrations();
    for (const r of registros) await r.unregister();
    return;
  }

  try {
    const registro = await navigator.serviceWorker.register(new URL("../../sw.js", import.meta.url));
    if (registro.waiting && navigator.serviceWorker.controller) mostrarAtualizacao(registro);
    registro.addEventListener("updatefound", () => {
      const novo = registro.installing;
      novo?.addEventListener("statechange", () => {
        if (novo.state === "installed" && navigator.serviceWorker.controller) mostrarAtualizacao(registro);
      });
    });
  } catch (erro) {
    console.warn("Service worker não registrado:", erro);
  }
}
