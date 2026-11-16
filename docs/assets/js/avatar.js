// Avatar do porquinho: desenho único (viewBox 64) com pelagem, marca e fundo trocáveis.
// As opções vêm das imagens (iPhone 16 - 38); os tons exatos são ESTIMADOS (ver PENDENCIAS.md).
// As cores de avatar são ilustração, não tokens do sistema.

import { esc } from "./ui.js";

export const PELAGENS = {
  laranja: { nome: "Laranja", pelo: "#C98B4E", orelha: "#A9692F", olho: "#1E2B2D", nariz: "#7A3E2B" },
  creme:   { nome: "Creme",   pelo: "#F1E1C6", orelha: "#D9BE93", olho: "#1E2B2D", nariz: "#E8A99A" },
  marrom:  { nome: "Marrom",  pelo: "#6B4423", orelha: "#4F2F14", olho: "#1E2B2D", nariz: "#E8A0A8" },
  grafite: { nome: "Grafite", pelo: "#3E3535", orelha: "#2B2424", olho: "#F6EBDD", nariz: "#F2B8A0" },
  cinza:   { nome: "Cinza",   pelo: "#A8A39B", orelha: "#8A857D", olho: "#1E2B2D", nariz: "#E8A0A8" },
};
export const MARCAS = { nenhuma: "Nenhuma", lateral: "Lateral", testa: "Testa", focinho: "Focinho" };
export const FUNDOS = {
  rosa: { nome: "Rosa", cor: "#F9C3E4" },
  ambar: { nome: "Âmbar", cor: "#F8D590" },
  azul: { nome: "Azul", cor: "#C9F1F8" },
  lilas: { nome: "Lilás", cor: "#E4DFF2" },
  pessego: { nome: "Pêssego", cor: "#FCE5DF" },
};
export const AVATAR_PADRAO = { pelagem: "marrom", marca: "nenhuma", fundo: "azul" };

const MARCA_COR = "#FFF8EC";

/** SVG do avatar (decorativo: aria-hidden). */
export function avatarSvg({ pelagem, marca, fundo } = AVATAR_PADRAO, tamanho = 52) {
  const p = PELAGENS[pelagem] ?? PELAGENS.marrom;
  const f = FUNDOS[fundo]?.cor ?? FUNDOS.azul.cor;
  const marcas = {
    testa: `<path d="M32 22c-5 6-4 13-2 17h4c2-4 3-11-2-17z" fill="${MARCA_COR}"/>`,
    lateral: `<ellipse cx="43" cy="38" rx="8" ry="10" fill="${MARCA_COR}"/>`,
    focinho: `<ellipse cx="32" cy="46" rx="9" ry="7" fill="${MARCA_COR}"/>`,
  };
  return `<svg viewBox="0 0 64 64" width="${tamanho}" height="${tamanho}" aria-hidden="true" focusable="false" class="ds-avatar__svg">
    <circle cx="32" cy="32" r="32" fill="${f}"/>
    <ellipse cx="16" cy="25" rx="7" ry="8" fill="${p.orelha}"/>
    <ellipse cx="48" cy="25" rx="7" ry="8" fill="${p.orelha}"/>
    <ellipse cx="32" cy="38" rx="20" ry="18" fill="${p.pelo}"/>
    ${marcas[marca] ?? ""}
    <circle cx="23" cy="36" r="2.6" fill="${p.olho}"/>
    <circle cx="41" cy="36" r="2.6" fill="${p.olho}"/>
    <ellipse cx="32" cy="45" rx="3.4" ry="2.4" fill="${p.nariz}"/>
  </svg>`;
}

/** Avatar de um animal: foto (se houver) ou desenho. Decorativo. */
export function avatarHtml(animal, tamanho = 52) {
  const estilo = `width:${tamanho}px;height:${tamanho}px`;
  if (animal?.foto) {
    return `<span class="ds-avatar" style="${estilo}" aria-hidden="true"><img src="${esc(animal.foto)}" alt="" width="${tamanho}" height="${tamanho}"></span>`;
  }
  return `<span class="ds-avatar" style="${estilo}" aria-hidden="true">${avatarSvg(animal?.avatar ?? AVATAR_PADRAO, tamanho)}</span>`;
}

/** Avatares sobrepostos do grupo (até 3, -10 px). */
export function avatarGrupoHtml(animais, tamanho = 44) {
  return `<span class="ds-avatar-grupo" aria-hidden="true">${animais.slice(0, 3).map((a) => avatarHtml(a, tamanho)).join("")}</span>`;
}
