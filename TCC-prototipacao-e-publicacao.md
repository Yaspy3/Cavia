# Prototipação e publicação do protótipo Cavia

> Rascunho para o TCC. Trechos entre colchetes **[a confirmar]** dependem de uma checagem sua antes de entrar no texto final. Este arquivo não faz parte do site.

## 1. Decisão de prototipar em código

Para validar o fluxo de uso do Cavia, optou-se por um protótipo funcional em vez de um conjunto de telas estáticas. Um protótipo navegável permite testar não só a aparência das telas, mas o comportamento do aplicativo: registrar o peso de um porquinho, anotar uma observação no diário, fazer um check-up e ver os alertas surgirem a partir do que foi registrado. Isso é relevante porque a proposta do aplicativo depende justamente da relação entre o que a tutora registra e o que o aplicativo devolve a ela.

O protótipo foi construído como um **site estático**, sem servidor nem banco de dados. Todo o processamento acontece no navegador do aparelho e os dados ficam armazenados localmente (`localStorage`). Essa escolha reduz custo e dependências, dispensa cadastro de usuários e é suficiente para os objetivos de um protótipo de design: avaliar interface, linguagem e fluxos, e não a infraestrutura. Em contrapartida, os dados não são sincronizados entre aparelhos nem protegidos por conta, o que é uma limitação assumida do protótipo (seção 6).

O site foi pensado como **aplicativo web progressivo (PWA)**. Isso significa que, aberto no celular, pode ser adicionado à tela inicial, abrir sem a barra do navegador e continuar funcionando sem internet depois do primeiro acesso, por meio de um *service worker* que guarda os arquivos no aparelho. Assim, o protótipo se aproxima da experiência de um aplicativo instalado sem exigir o desenvolvimento de uma versão nativa.

## 2. Ferramentas e organização do código

O site foi gerado com o **Quarto**, que transforma páginas escritas em Markdown (`.qmd`) em páginas HTML. Cada tela do aplicativo corresponde a uma página curta; o comportamento fica em módulos JavaScript simples (sem frameworks), organizados por responsabilidade: armazenamento dos dados, regras de alerta, componentes de interface, gráficos e conteúdos textuais. A tipografia adotada é a Figtree, empregada em todo o aplicativo.

O visual foi definido por meio de **tokens de design**: cores, espaçamentos, raios de borda e tamanhos mínimos de toque recebem nomes e ficam centralizados em um único arquivo de estilos. Quando uma decisão de design muda, como a cor de um alerta, ela é alterada em um lugar e se propaga por todas as telas, o que mantém a consistência visual e facilita os ajustes ao longo do processo.

As regras que decidem quando um alerta aparece ficam separadas da interface, e os textos de orientação ficam em arquivos próprios, marcados como pendentes de revisão veterinária. Essa separação deixa claro o que é decisão de design e o que é conteúdo clínico ainda por validar.

## 3. Processo: referências visuais, fases e iteração

As telas desenhadas pela autora foram tratadas como **fonte de verdade visual**. Em vez de reinterpretar as imagens, os tamanhos, espaçamentos, cores e proporções foram medidos nas próprias imagens e reproduzidos no código. Quando o resultado se afastava da referência, a diferença era apontada e corrigida em novos ciclos. Exemplos desse processo foram os ajustes das caixas de alerta (fundo amarelo claro com símbolo e texto em amarelo escuro), dos botões com texto branco, do botão central de registro, da barra de navegação, do alinhamento dos botões e dos desenhos de fezes e urina.

O desenvolvimento foi dividido em **fases**, cada uma com um conjunto de telas e uma aprovação antes de avançar para a seguinte. Telas fora do escopo do protótipo foram cortadas de forma deliberada: por exemplo, as de entrada e cadastro de conta, já que o aplicativo abre diretamente, sem login. Esse recorte foi registrado, para que a ausência dessas telas seja uma decisão explícita e não uma lacuna.

Ao longo do processo, algumas decisões de design surgiram da própria avaliação do protótipo em uso. Um caso ilustrativo é a **hierarquia dos alertas**: inicialmente todos os alertas apareciam na tela inicial e ocupavam muito espaço. A solução adotada foi separá-los por gravidade. Os alertas de **urgência** (vermelhos) permanecem na tela inicial, pois pedem ação imediata; os de **atenção** (amarelos) passaram a aparecer apenas onde fazem sentido, no perfil do animal e na tela de registro, logo após salvar. A regra de peso também foi definida nesse processo: diferença de 5% em até uma semana gera atenção, e de 10%, urgência. Esses limites são provisórios e dependem de validação com um veterinário.

## 4. Documentação e verificação

O projeto manteve quatro documentos de apoio, atualizados a cada fase:

- **Inventário de telas**: lista as telas, suas rotas e a prioridade de cada uma.
- **Registro de decisões**: para cada escolha de design, registra o que foi decidido e por quê, incluindo as exceções às regras de acessibilidade feitas para manter a fidelidade às referências.
- **Pendências**: reúne o que depende de revisão externa, sobretudo os limites e textos clínicos.
- **Garantia de qualidade e roteiro de teste**: descrevem as verificações feitas e as que ainda precisam de aparelho real.

A verificação foi feita no navegador, em tela do tamanho de um celular (393 × 852 px), com medição dos elementos e conferência de erros no console. Também foi feita uma auditoria de acessibilidade: contraste de cores, tamanho mínimo de 44 px para áreas de toque e a regra de que nenhum estado dependa só da cor (todo alerta combina ícone, palavra e cor). Onde a fidelidade à referência levou a valores abaixo dessas regras, por exemplo texto branco sobre rosa, botões de 39 px e células do diário de 31 px, a exceção foi documentada. Para apresentações no computador, o protótipo oferece uma moldura de celular opcional e um modo de teste com dados de exemplo, que permite simular situações como um alerta de peso sem esperar dias reais.

## 5. Publicação

O código-fonte foi versionado com **Git** e hospedado no **GitHub** (repositório `Yaspy3/Cavia`), o que preserva o histórico de alterações. O fluxo de publicação é:

1. As páginas `.qmd` e os módulos de estilo e script ficam na raiz do projeto.
2. O comando de geração do Quarto produz o site completo na pasta `docs/`.
3. Um script executado após a geração ajusta a página para celular e grava no *service worker* uma versão e a lista de arquivos, de modo que, quando o site é atualizado, os aparelhos que já o visitaram recebem a nova versão.
4. O conteúdo de `docs/` é publicado como site estático pelo **GitHub Pages**. Um arquivo `.nojekyll` indica ao serviço que a pasta não deve ser processada pelo Jekyll, o que evitaria que alguns arquivos do aplicativo fossem ignorados.

Endereço do protótipo publicado: **[a confirmar: inserir a URL do GitHub Pages]**. Configuração do Pages: **[a confirmar: origem "branch main, pasta /docs" em Settings > Pages]**.

Esse fluxo permite que o protótipo seja aberto por qualquer pessoa com um link, sem instalar nada, o que facilita a avaliação por tutoras, orientadores e banca.

## 6. Limitações

- Os dados ficam apenas no aparelho: não há conta, sincronização nem cópia de segurança.
- Os limites de alerta (5% e 10% em até 7 dias) e os textos de orientação são provisórios e precisam de revisão veterinária antes de qualquer uso real.
- Itens ainda sem teste em aparelho real: instalação como PWA, funcionamento offline, impressão e uso com leitor de tela.
- Os desenhos de fezes e urina estão em imagem e podem ser refeitos em formato vetorial.
- Não houve teste de usabilidade com tutoras; ele é o próximo passo natural.

## Nota para a escrita

Se o texto for para um capítulo de metodologia, vale transformar a seção 3 em um quadro com as fases e o que foi decidido em cada uma, usando o registro de decisões como fonte. Um fluxograma simples ajuda na seção 5: `páginas .qmd → Quarto → pasta docs/ → GitHub Pages → link do protótipo`.
