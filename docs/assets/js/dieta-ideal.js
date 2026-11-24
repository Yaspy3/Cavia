// Folha "Dieta ideal": resumo das recomendações de duas fontes para porquinhos-da-índia.
//  - Keeble E. (2023). Clinical review – Guinea pig nutrition – what do we know? In Practice 45(4):200-210.
//    doi:10.1002/inpr.309 (quadros 1 a 5).
//  - Animal Care Centers of NYC (ACC): guia de adoção de porquinhos-da-índia (Diet Guide e tabela
//    "Feeding Your Guinea Pigs").
// Tradução e resumo do app, sem validação veterinária (revisao: "pendente"). Quando as fontes divergem,
// as duas aparecem.

import { abrirFolha } from "./ui.js";
import { VITC_DIARIA_MG_POR_KG } from "./conteudo/alimentos.js";

export function abrirDietaIdeal() {
  abrirFolha({
    titulo: "Dieta ideal",
    montar(corpo, fechar) {
      corpo.innerHTML = `
        <div class="dieta-ideal" data-revisao="pendente">
          <p class="t-small t-muted">Resumo de duas fontes: Keeble (2023), artigo de revisão em In Practice, e o guia de adoção do Animal Care Centers of NYC (ACC).</p>

          <section><h3 class="t-strong">Feno e ração</h3>
            <ul class="dieta-ideal__lista">
              <li><strong>Feno à vontade</strong>: é de 85% a 90% da dieta (Keeble). Prefira feno de capim-timóteo; o de alfafa tem muito cálcio e é petisco para adultos (ACC).</li>
              <li><strong>Ração peletizada</strong>: 1 colher de sopa por dia (Keeble) ou 1/8 de xícara para começar (ACC). Combine a quantidade com o veterinário.</li>
              <li>A ração boa tem base de feno e não tem frutas secas, sementes, nozes nem pedaços coloridos. Ela precisa ter vitamina C. Nunca use ração de coelho ou de outros roedores.</li>
            </ul></section>

          <section><h3 class="t-strong">Vegetais</h3>
            <ul class="dieta-ideal__lista">
              <li><strong>Cerca de 1 xícara (240 mL) por dia</strong>, nas duas fontes. Escolha 2 a 3 folhas e 1 a 2 outros vegetais (ACC).</li>
              <li>Comece com um tipo de folha e acrescente outras aos poucos. Introduza qualquer alimento novo ao longo de uma semana, de olho nas fezes.</li>
              <li>Divida em duas refeições, de manhã e no fim do dia, quando eles estão mais ativos (ACC).</li>
              <li>Lave tudo muito bem. Se você não sabe se um vegetal é seguro, não ofereça.</li>
              <li>Muito cálcio com pouca água favorece pedras urinárias (Keeble): alterne as folhas.</li>
            </ul></section>

          <section><h3 class="t-strong">Frutas e petiscos</h3>
            <ul class="dieta-ideal__lista">
              <li><strong>Frutas</strong>: 1 ou 2 vezes por semana, em pouca quantidade, por causa do açúcar (ACC). Keeble diz que as orientações sobre frutas são contraditórias.</li>
              <li>Banana, bem pouco: pode causar prisão de ventre (ACC).</li>
              <li><strong>Evite</strong>: nozes, feijão, cereais, chocolate, pão, bolacha e petiscos de loja, como gotas de iogurte, milho e misturas de frutas e sementes (ACC). Mistura de grãos (muesli) também (Keeble).</li>
            </ul></section>

          <section><h3 class="t-strong">Vitamina C e água</h3>
            <ul class="dieta-ideal__lista">
              <li><strong>Vitamina C todo dia</strong>: ${VITC_DIARIA_MG_POR_KG} mg por kg (de 2 a 3 vezes isso na gestação). O porquinho não produz vitamina C (Keeble).</li>
              <li>Base diária sugerida pelo ACC: cerca de 20 ramos de coentro e uma fatia de 1/8 de pimentão por porquinho.</li>
              <li>Gotas de vitamina C na água se estragam rápido depois de abertas e ao sol.</li>
              <li><strong>Água fresca todo dia</strong>, em bebedouro e em pote.</li>
            </ul></section>

          <p class="t-small t-muted">Na lista, cada alimento mostra o que as duas fontes dizem. Quando elas diferem, o app usa a frequência mais cautelosa. Valores nutricionais: TACO (4ª ed., NEPA/UNICAMP, 2011) e, para alguns itens, USDA FoodData Central.</p>
        </div>
        <div class="ds-folha__acoes"><button type="button" class="ds-button ds-button--contorno ds-button--bloco" data-fechar>Fechar</button></div>`;
      corpo.querySelector("[data-fechar]").addEventListener("click", () => fechar("fechar"));
    },
  });
}
