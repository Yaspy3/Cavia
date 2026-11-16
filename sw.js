const VERSAO = "__VERSAO__";
const CACHE = `cavia-${VERSAO}`;
const ARQUIVOS = __ARQUIVOS__;

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
