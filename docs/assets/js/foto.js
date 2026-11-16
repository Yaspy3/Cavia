// Foto do animal: reduz a 256 px no maior lado e devolve um JPEG em data URL (~30 KB).

const LADO_MAXIMO = 256;

function carregar(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolver(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rejeitar(new Error("Imagem inválida")); };
    img.src = url;
  });
}

/** Recebe o File do <input type="file"> e devolve o data URL reduzido. */
export async function reduzirFoto(arquivo) {
  const img = await carregar(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * escala));
  const h = Math.max(1, Math.round(img.naturalHeight * escala));
  const tela = document.createElement("canvas");
  tela.width = w;
  tela.height = h;
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return tela.toDataURL("image/jpeg", 0.8);
}
