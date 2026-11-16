const VERSAO = "667c3c142d";
const CACHE = `cavia-${VERSAO}`;
const ARQUIVOS = [
  "./.nojekyll",
  "./app/animais.html",
  "./app/animal-novo.html",
  "./app/animal.html",
  "./app/conta.html",
  "./app/exportar-previa.html",
  "./app/exportar.html",
  "./app/grupo-novo.html",
  "./app/grupo.html",
  "./app/inicio.html",
  "./app/lembrete-novo.html",
  "./app/lembretes.html",
  "./app/notificacoes.html",
  "./app/perfil.html",
  "./app/registrar-alimentacao.html",
  "./app/registrar-checkup.html",
  "./app/registrar-consulta.html",
  "./app/registrar-cuidados.html",
  "./app/registrar-observacao.html",
  "./app/registrar-peso.html",
  "./app/registrar-sintomas.html",
  "./app/registrar-tratamento.html",
  "./app/registrar.html",
  "./assets/css/base.css",
  "./assets/css/componentes.css",
  "./assets/css/fontes.css",
  "./assets/css/telas.css",
  "./assets/css/tokens.css",
  "./assets/fonts/figtree-latin-wght-normal.woff2",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/img/obs/fezes-anormal.png",
  "./assets/img/obs/fezes-empelotado.png",
  "./assets/img/obs/fezes-gota.png",
  "./assets/img/obs/fezes-mole.png",
  "./assets/img/obs/fezes-normal.png",
  "./assets/img/obs/fezes-viscoso.png",
  "./assets/img/obs/urina-branco-turva.png",
  "./assets/img/obs/urina-com-esforco.png",
  "./assets/img/obs/urina-com-sangue.png",
  "./assets/img/obs/urina-cor-diferente.png",
  "./assets/img/obs/urina-muito-ou-pouca.png",
  "./assets/img/obs/urina-normal.png",
  "./assets/js/acoes.js",
  "./assets/js/app.js",
  "./assets/js/avatar.js",
  "./assets/js/conteudo/alimentos.js",
  "./assets/js/conteudo/checkup.js",
  "./assets/js/conteudo/dicas.js",
  "./assets/js/conteudo/observacao.js",
  "./assets/js/conteudo/oque-fazer.js",
  "./assets/js/conteudo/sintomas.js",
  "./assets/js/datas.js",
  "./assets/js/formato.js",
  "./assets/js/foto.js",
  "./assets/js/graficos.js",
  "./assets/js/historico.js",
  "./assets/js/icones.js",
  "./assets/js/ilustracoes.js",
  "./assets/js/lembretes.js",
  "./assets/js/pwa.js",
  "./assets/js/regras.js",
  "./assets/js/seed.js",
  "./assets/js/seletores.js",
  "./assets/js/store.js",
  "./assets/js/telas/animais.js",
  "./assets/js/telas/animal-novo.js",
  "./assets/js/telas/animal.js",
  "./assets/js/telas/conta.js",
  "./assets/js/telas/exportar-previa.js",
  "./assets/js/telas/exportar.js",
  "./assets/js/telas/grupo-novo.js",
  "./assets/js/telas/grupo.js",
  "./assets/js/telas/inicio.js",
  "./assets/js/telas/lembrete-novo.js",
  "./assets/js/telas/lembretes.js",
  "./assets/js/telas/notificacoes.js",
  "./assets/js/telas/perfil.js",
  "./assets/js/telas/registrar-alimentacao.js",
  "./assets/js/telas/registrar-checkup.js",
  "./assets/js/telas/registrar-consulta.js",
  "./assets/js/telas/registrar-cuidados.js",
  "./assets/js/telas/registrar-observacao.js",
  "./assets/js/telas/registrar-peso.js",
  "./assets/js/telas/registrar-sintomas.js",
  "./assets/js/telas/registrar-tratamento.js",
  "./assets/js/telas/registrar.js",
  "./assets/js/teste.js",
  "./assets/js/ui.js",
  "./assets/logo/cavia-icone.svg",
  "./assets/logo/cavia-logo-clara.svg",
  "./assets/logo/cavia-logo.svg",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(
        ks.filter((k) => k.startsWith("cavia-") && k !== CACHE).map((k) => caches.delete(k)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (e) => {
  if (e.data === "pular-espera") self.skipWaiting();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const url = new URL(req.url);
  // Endereço de pasta (".../cavia/") abre o index.html guardado, mesmo sem rede.
  const alvo = url.pathname.endsWith("/") ? new Request(new URL("index.html", url)) : req;
  e.respondWith(caches.match(alvo, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
