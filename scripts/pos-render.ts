// Roda depois de `quarto render` (project.post-render em _quarto.yml).
// 1) troca a meta viewport do Quarto pela do app (viewport-fit=cover);
// 2) carimba a versão do cache e a lista de arquivos no sw.js.

const saida = Deno.env.get("QUARTO_PROJECT_OUTPUT_DIR") ?? "docs";
const VIEWPORT =
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">';

function listar(dir: string): string[] {
  const arquivos: string[] = [];
  for (const item of Deno.readDirSync(dir)) {
    const caminho = `${dir}/${item.name}`;
    if (item.isDirectory) arquivos.push(...listar(caminho));
    else arquivos.push(caminho);
  }
  return arquivos;
}

// 1) viewport
for (const f of listar(saida).filter((f) => f.endsWith(".html"))) {
  let html = Deno.readTextFileSync(f);
  html = html.replace(/<meta name="viewport"[^>]*>\s*/g, "");
  html = html.replace("</head>", `${VIEWPORT}\n</head>`);
  Deno.writeTextFileSync(f, html);
}

// 2) service worker
const ignorar = ["sw.js", "robots.txt", "sitemap.xml"];
const arquivos = listar(saida)
  .map((f) => f.slice(saida.length + 1))
  .filter((f) => !ignorar.includes(f) && !f.endsWith(".map"))
  .sort();

const dados = new Uint8Array(
  await new Blob(arquivos.map((f) => Deno.readFileSync(`${saida}/${f}`))).arrayBuffer(),
);
const digest = await crypto.subtle.digest("SHA-1", dados);
const versao = [...new Uint8Array(digest)]
  .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 10);

const swPath = `${saida}/sw.js`;
const sw = Deno.readTextFileSync(swPath)
  .replace("__VERSAO__", versao)
  .replace("__ARQUIVOS__", JSON.stringify(arquivos.map((f) => `./${f}`), null, 2));
Deno.writeTextFileSync(swPath, sw);
console.log(`pos-render: ${arquivos.length} arquivos no cache, versão ${versao}`);
