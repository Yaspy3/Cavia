# DECISOES.md

Decisões tomadas durante a construção. Formato: data, tela(s), decisão, motivo e diferença em relação à imagem de referência.

## [2026-11-15] Estrutura de pastas e arquivos de apoio
- Tela(s): todas
- Decisão: instruções e imagens ficam em `_docs/` (as imagens estavam soltas na raiz e foram movidas). `CLAUDE.md` aponta para as instruções. Fora do site: o Quarto ignora `_docs/` e a lista `project.render` só inclui `index.qmd`, `entrada/` e `app/`.
- Motivo: estrutura da seção 4 das instruções.
- Diferença: nenhuma.

## [2026-11-15] Ambiente sem Git e sem Python
- Tela(s): —
- Decisão: não há Git instalado, então **nenhum commit foi feito** na Fase 1. O servidor local para testar o PWA é um script Node (fora do projeto), em vez de `python3 -m http.server`.
- Motivo: Git e Python não existem nesta máquina.
- Diferença: o comando da seção 15 não funciona aqui; o resultado é o mesmo.

## [2026-11-15] Rótulo da 2ª aba da barra inferior: "Porquinhos"
- Tela(s): todas as de `app/`
- Decisão: a barra mostra "Porquinhos" (como nas imagens); o título da tela de lista continua "Animais". O caminho do arquivo e o `data-aba` seguem `animais`.
- Motivo: regra "se as imagens forem diferentes, siga as imagens" (seção 7.4). A designer ainda não respondeu qual rótulo vale.
- Diferença em relação às instruções: a seção 2.2 diz "Animais".

## [2026-11-15] Sinal de "+" do botão Registrar em `ink`
- Tela(s): barra inferior (iPhone 16 - 18 e outras)
- Decisão: "+" em `ink` sobre `action`, e círculo de 58 px com borda branca. Nas imagens 2 e 11 o círculo aparece sem "+": tratado como descuido do export.
- Motivo: `ink` sobre `action` tem 5,0:1; o "+" marrom-avermelhado da imagem tem contraste menor que 3:1 (seção 8).
- Diferença em relação à imagem: o "+" das imagens parece mais escuro e avermelhado.

## [2026-11-15] Fonte dos títulos de tela
- Tela(s): todas
- Decisão: títulos de tela usam Figtree (variável `--font-tela` em `base.css`), porque as imagens mostram títulos sem serifa. O arquivo do Fraunces continua no projeto e `--font-titulo` fica pronto para os números grandes. Para trocar tudo para Fraunces, basta mudar `--font-tela`.
- Motivo: imagens mandam no visual.
- Diferença em relação às instruções: a seção 7.2 pede Fraunces nos títulos. Aguarda resposta da designer.

## [2026-11-15] Cor da pílula e dos ícones da barra e dos atalhos
- Tela(s): barra inferior, Registrar
- Decisão: usei o token `primary-soft` para a pílula ativa e para os quadrados dos ícones. Nas imagens esses fundos são um teal-acinzentado mais escuro.
- Motivo: "use os tokens pelo nome". A diferença fica registrada para a designer decidir.
- Diferença em relação à imagem: tom mais claro.

## [2026-11-15] Aba de animal sem aba própria de Check-up
- Tela(s): a construir (iPhone 16 - 5, 6, 9, 16, 31)
- Decisão: seguir a imagem: abas Dados, Peso, Diário e Saúde; Check-up e Higiene dentro do Diário.
- Motivo: imagem manda; a seção 2.2 prevê o conflito.

## [2026-11-15] Modelo de dados: campos que as imagens exigem
- Tela(s): cadastro e perfil do animal, grupo, observações
- Decisão: o `seed.js` já inclui `chegouEm`, `castrado`, `avatar { pelagem, marca, fundo }` no animal, `higiene` no estado, `dieta { racao, vitaminaC, feno }` e `ambiente { recinto, forracao }` no grupo, e a pesagem/observação continuam como na seção 10.2. `apetite` segue no modelo da seção 10.2, mas **não aparece em nenhuma imagem**: ver `PENDENCIAS.md`.
- Motivo: as imagens mostram esses dados.

## [2026-11-15] Abertura e destino provisório
- Tela(s): index (iPhone 16 - 44)
- Decisão: abertura com fundo teal e logo provisória, 1,5 s, uma vez por sessão. Como as telas de entrada e o Início ainda não existem, tudo leva a `app/registrar.html`. O destino correto (boas-vindas ou Início) entra na Fase 2.
- Motivo: Fase 1 só tem a tela Registrar.
- Diferença em relação às instruções: a seção 12.4 pede logo em `primary` sobre `bg`; a imagem usa fundo teal.

## [2026-11-15] Service worker em desenvolvimento
- Tela(s): —
- Decisão: em `localhost` o worker só liga com `?sw=1` (guardado em `sessionStorage`); sem isso, registros antigos são removidos.
- Motivo: seção 6.3.
- Observação de teste: o painel do navegador embutido do aplicativo **não registra service workers** (erro "unknown error when fetching the script", mesmo com o arquivo servido normalmente). Foi verificado que todos os 26 arquivos da lista do `sw.js` respondem 200 e que o manifesto e os ícones existem; **a instalação como PWA e o uso offline ainda precisam ser conferidos no Chrome** (DevTools > Application).

## [2026-11-15] Pop-up sem depender do evento `close`
- Tela(s): pop-ups em geral
- Decisão: `abrirFolha` faz a limpeza ao fechar por botão e também pelo evento `close` (Esc), uma única vez.
- Motivo: no navegador embutido o evento `close` do `<dialog>` não dispara; assim o pop-up funciona nos dois casos.

## [2026-11-15] Fonte: Figtree em todo o app (resposta da designer)
- Tela(s): todas
- Decisão: Figtree é a única fonte. Fraunces foi removida do projeto (arquivo, `@font-face` e preload); `--font-titulo` e `--font-tela` apontam para Figtree.
- Motivo: a designer definiu a fonte. Substitui a entrada anterior sobre os títulos de tela.
- Diferença em relação às instruções: a seção 7.2 pedia Fraunces nos títulos e números grandes.

## [2026-11-15] Fase 2: telas de entrada não construídas
- Tela(s): boas-vindas, entrar, criar conta
- Decisão: não foram construídas, porque não há imagem (seção 12.5). O app abre direto, sem exigir conta. A abertura (`index`) ainda leva ao Registrar; o Início entra na Fase 3.
- Motivo: não inventar visual. Aguarda a designer decidir entre desenhar ou cortar.
- Consequência: o critério "o fluxo de entrada leva ao primeiro animal" da Fase 2 fica pendente.

## [2026-11-15] Cartões de lista com contorno
- Tela(s): iPhone 16 - 2, 12, 19 e outras
- Decisão: variante `ds-card--contorno` (borda de 1 px em um teal derivado de `primary`, sem sombra) nos cartões de lista e formulário, como nas imagens. Cartões de atalho (Registrar) seguem sem borda.
- Diferença em relação às instruções: a seção 7.3 diz "sem borda". A cor da borda é derivada com `color-mix` do token `primary`.

## [2026-11-15] Botão voltar rosa e botões de ação em rosa com texto `ink`
- Tela(s): todas com cabeçalho simples; formulários
- Decisão: voltar em `action` com ícone `ink` e botões Salvar em `action` com texto `ink`, como nas imagens. Nas imagens o texto dos botões rosa é branco, o que a seção 8 proíbe (branco sobre `action`).
- Diferença em relação às imagens: texto escuro em vez de branco.

## [2026-11-15] Controle segmentado com opção ativa em `primary`
- Tela(s): Cadastrar animal (sexo), unidade da idade
- Decisão: ativa em `primary` com texto branco; inativa em `surface-sunken` com `ink-muted`. As imagens mostram o inativo em cinza-azulado com texto branco, de contraste baixo.
- Diferença em relação às instruções: a seção 7.5 diz "opção ativa em `surface`".

## [2026-11-15] Seletor de animal em pop-up (Peso)
- Tela(s): iPhone 16 - 19
- Decisão: o seletor é um botão que abre um pop-up com a lista de animais (avatar, nome e grupo) e o atalho "+ Cadastrar um animal", em vez de uma lista suspensa nativa. O atalho leva ao cadastro e volta à mesma tela com o animal escolhido; se não houver grupo, passa por "Criar grupo" e também volta.
- Motivo: a imagem mostra avatar no seletor, o que um `<select>` nativo não permite; o atalho "Cadastrar" é pedido no Fluxo 1.
- Contagem de toques (Fluxo 1): Registrar > Peso (1), abrir o seletor (2), escolher o animal (3), Salvar peso (4), mais a digitação. Com um único animal ele já vem escolhido: 2 toques.

## [2026-11-15] Entrada do peso
- Tela(s): iPhone 16 - 19
- Decisão: botões − / + de 10 g mais campo digitável (`inputmode="numeric"`), isolados em `entradaPeso()`. A ordem dos botões segue a imagem (+ à esquerda, − à direita). Sem pesagem anterior, os botões partem de 0. Mostra "g" ao lado do número. Salvar sem peso mostra erro; uma segunda pesagem no mesmo dia atualiza a primeira e avisa.
- Diferença em relação às instruções: a seção 12.4 pede só o campo; a imagem traz os botões.

## [2026-11-15] Confirmação e aviso de conferência do peso
- Tela(s): iPhone 16 - 19
- Decisão: depois de salvar, aparece "Peso salvo" no topo (leitura anunciada), o campo é limpo e o gráfico ganha o novo ponto destacado. O aviso de conferência é condicional e não bloqueia: "Diferença maior do que o usual…" (texto da imagem) com variação de 10% ou mais (antes 15%; alinhado ao limite de urgência), e "O valor parece alto. Confira se está em gramas." acima de 2.000 g. Limites provisórios em `regras.js`.
- Diferença em relação à imagem: na imagem o aviso aparece sempre; aqui só quando cabe.

## [2026-11-15] Status de peso na lista de animais
- Tela(s): iPhone 16 - 2
- Decisão: "Atenção" quando a última pesagem caiu 5% ou mais em relação à anterior; "Peso estável" nos demais; "Sem pesagem" quando não há dado. Regra provisória (`QUEDA_ATENCAO_PCT`).

## [2026-11-15] Cadastro do animal
- Tela(s): iPhone 16 - 11, 37, 38
- Decisão: só nome e grupo são obrigatórios (erros em texto, ligados ao campo, com foco no primeiro). Com um único grupo, ele vem escolhido. "Fêmea" vem marcada, como na imagem. "Apenas a idade" guarda um nascimento aproximado (`nascimentoAproximado`). "Tirar foto" e "Escolher da galeria" usam o seletor de arquivo (a foto é reduzida a 256 px, JPEG). O avatar tem 5 pelagens, 4 marcas e 5 fundos, como na imagem 38; os tons são estimados.
- Se a pessoa sai para criar um grupo, o que foi digitado é guardado no `sessionStorage` e volta ao retornar.

## [2026-11-15] Criar grupo
- Tela(s): iPhone 16 - 12
- Decisão: só o nome é obrigatório. A lista de integrantes mostra o grupo atual de cada animal; escolher um animal o move para o grupo novo (um animal só pode estar em um grupo).

## [2026-11-15] Telas de entrada cortadas do protótipo (resposta da designer)
- Tela(s): boas-vindas, entrar, criar conta
- Decisão: cortadas. A pasta `entrada/` e o item correspondente em `project.render` foram removidos; o app abre direto, sem conta. A abertura segue por 1,5 s e depois leva à primeira tela do app (Registrar até o Início existir, na Fase 3).
- Consequências: o critério "o fluxo de entrada leva ao primeiro animal" da Fase 2 deixa de valer; o Fluxo 3 começa em Animais > Criar grupo. Termos de uso e Política de privacidade, que ficariam nessas telas, só aparecem em "Sobre o Cavia". Em Perfil, nome e e-mail do tutor não vêm de um cadastro: a tela Perfil (Fase 4) mostra "Nome do tutor" até a pessoa preencher em Conta (que ainda não tem imagem).
- Diferença em relação às instruções: as seções 12.4 e 13 previam essas telas.

## [2026-11-15] Fase 3: decisões gerais
- Tela(s): Início, Observações, Perfil do animal, Perfil do grupo
- A abertura agora leva ao Início.
- Os alertas são **calculados na hora** a partir dos registros (nada é guardado): somem sozinhos quando entra um registro novo e normal. Valem por poucos dias (observação: 2; peso: 7; constantes provisórias em `regras.js`).
- Sintomas e ocorrências nunca geram alerta (a tela é da Fase 5).
- Datas "da semana" (Diário 7 dias e Vegetais da semana) mostram os **últimos 7 dias até hoje**, com a inicial do dia correspondente, em vez da semana de segunda a domingo.
- A data do cabeçalho do Início aparece como "dom, 15 nov" (a imagem traz "ter, out.27").

## [2026-11-15] Observação: sem "apetite"
- Tela(s): iPhone 16 - 20, 39, 40, 41, 34
- Decisão: nenhuma imagem de Observações tem apetite; o alerta compara **fezes, urina e comportamento** do registro mais recente com o padrão (valor mais frequente) dos 14 dias anteriores. Sem histórico, o padrão é "normal". Há alerta se o valor não é "normal" e é diferente do padrão do animal. O campo `apetite` continua no modelo, vazio.
- A observação de grupo não tem seleção de "de qual porquinho" (F14): a imagem 34 não mostra; fica para a designer decidir.
- Uma observação por animal (ou grupo) por dia: salvar de novo no mesmo dia atualiza os campos escolhidos. Higiene (corte de unhas, banho) é gravada à parte, com a data.
- Observação: Água e Comportamento do grupo ficam sempre à mostra; as demais seções são sanfona (uma aberta por vez), como nas imagens. `?data=AAAA-MM-DD` edita um dia passado (usado pelo pop-up do Diário).

## [2026-11-15] Início sem imagem de estado vazio e de alertas
- Tela(s): iPhone 16 - 3
- Decisão: **estado vazio** (sem grupo): só o cabeçalho com a data e o cartão de dica "Vamos começar" com o botão "Criar um grupo". O **cartão de alertas** (não desenhado) segue o visual do aviso de atenção: fundo `warn-soft`, chip "Atenção" com ícone, texto e "O que fazer ›", que abre um pop-up com o texto e o link para o perfil.
- Dicas: cartão em âmbar, como na imagem; 7 dicas com regra de exibição, a primeira que vale aparece.
- Lembretes do Início: os 3 próximos não concluídos do grupo, mais "Check-up de {animal}" com "Fazer ›" quando vence. Marcar um lembrete risca o item até a próxima visita e oferece "Desfazer".

## [2026-11-15] Telas de edição sem imagem
- Tela(s): Editar dados do animal, Editar grupo, Editar dieta, Editar ambiente, "Registrar saúde"
- Decisão: as imagens mostram os botões "Editar" mas não as telas. Para não deixar botões mortos:
  - Editar animal e Editar grupo **reaproveitam** as telas de cadastro (Cadastrar animal e Criar grupo), preenchidas. O cadastro ganhou o campo "Chegou em", e em "Editar grupo" só é possível trazer animais; para tirar um, troque o grupo na edição do animal.
  - Dieta e Ambiente editam em um pop-up simples de campos de texto (marca da ração, vitamina C, feno; recinto, forração).
  - "Registrar saúde" abre uma lista com Consulta ou exame, Tratamento ou medicação e Sintomas e ocorrências.
- Isto foge da regra "sem imagem, não construa" (seção 12.5): fica como proposta até a designer desenhar. **Arquivar e restaurar animal não foi construído**, porque a restauração depende da tela Conta (sem imagem).

## [2026-11-15] Perfil do animal: Diário e Peso
- Tela(s): iPhone 16 - 5, 6, 16, 32
- Decisão: Diário em grade de 7 dias (cada círculo é um botão que abre o pop-up do dia) e visão de 30 dias em calendário (a imagem não traz essa visão): cada dia mostra o número e a marca "normal" ou "atenção". Estados sempre com ícone (check ou alerta) além da cor. Variação de peso: positiva em `ok`, negativa em `warn-ink` (o vermelho é só para urgência), sempre com o sinal.
- O cartão de Check-up do Diário é só de leitura; "Frequência" não é link (a tela da frequência não tem imagem).
- Na Saúde, a lista "Histórico" junta consultas e tratamentos; o filtro "Exames" fica vazio até a Fase 5 definir o registro de exames.

## [2026-11-15] Telas de edição sem imagem: mantidas (resposta da designer)
- Tela(s): Editar animal, Editar grupo, Editar dieta, Editar ambiente, "Registrar saúde", visão de 30 dias do Diário, estado vazio e cartão de alertas do Início
- Decisão: a designer confirmou que ficam no protótipo como estão, até desenhar a versão final. Substitui a ressalva da entrada "Telas de edição sem imagem".

## [2026-11-15] Fase 4: Perfil, Lembretes e Exportar histórico
- Tela(s): iPhone 16 - 29, 42, 43, 45
- **Perfil:** as três linhas da imagem (Conta, Notificações, Exportar histórico). O subtítulo de Conta é "Nome e e-mail" (a imagem diz "Nome, e-mail, senha"; o Cavia não tem senha). Sem conta cadastrada, mostra "Nome do tutor" e "E-mail não informado". "Sobre o Cavia" não está na imagem e não foi construído.
- **Conta (sem imagem, proposta mínima):** nome e e-mail só neste aparelho, sem senha, e "Excluir conta", que apaga todos os dados depois de confirmação em pop-up. Como as telas de entrada foram cortadas, é aqui que a pessoa informa o nome.
- **Notificações (sem imagem, proposta mínima):** interruptores por tipo (alertas, check-up, doses, consultas, limpeza, lembretes personalizados), horário de silêncio e atalho para os lembretes. As preferências só ficam guardadas; os avisos continuam simulados. Alertas e doses ignoram o silêncio (proposta, a confirmar).
- **Lembretes:** "Hoje" (inclui atrasados) e "Próximos", como na imagem. Tocar no texto abre as opções **Concluir, Adiar, Editar e Excluir** (sem imagem). Adiar: daqui a 1 hora ou para amanhã. **Em lembretes que se repetem**, Editar e Excluir mostram as duas opções "Só este" e "Este e os próximos" (resolve a pergunta em aberto da seção 9.6). Concluir um lembrete que se repete leva à próxima ocorrência.
- **Novo lembrete:** campos da imagem (o que lembrar, data, hora, repetir) mais "Para" (obrigatório pelas instruções), "Avisar" e "Anotação", em "Mais opções". O padrão de "Repetir" é "Não repetir" (a imagem mostra "Toda semana" marcado). "A cada [n] dias" virou "A cada N dias" com campo numérico. Se a hora cai no horário de silêncio, aparece um aviso.
- **Exportar histórico:** a opção "Gerar PDF" da imagem virou **"Ver prévia do PDF"**, porque leva à prévia; "Salvar PDF" fica na prévia (seção 11). "Personalizar" abre duas datas. Os itens são de escolha múltipla.
- **Prévia (sem imagem, proposta):** folha em A4 com a logo (versão escura), dados do animal ou do grupo, período, uma tabela por item e um rodapé de aviso. Para um grupo, mostra os dados do grupo e uma seção por animal. "Salvar PDF" chama `window.print()` e, ao fechar a impressão, aparece "Histórico pronto". Estilos de impressão em `@media print` (A4, margens de 16 mm, esconde a barra e os botões).
- **Correção:** os perfis de animal e de grupo não falham mais quando o item deixa de existir (por exemplo, depois de "Excluir conta").

## [2026-11-15] Fase 5: Alimentação
- Tela(s): iPhone 16 - 22 e 35
- Decisão: registro por grupo: Feno/Ração (botões de marcar), busca, filtros por categoria e lista de alimentos com etiqueta e frequência sugerida. O dia é escolhido com "Hoje / Outro dia" (a imagem tem uma lista suspensa "Hoje"). Um registro por grupo e dia; ao trocar o dia, a tela carrega o que já foi salvo.
- **Pop-up do alimento (ⓘ):** mostra a sugestão, a semana (os 7 dias podem ser ajustados e "Salvar" grava nos registros), os nutrientes "a cada 10 g" e o aviso quando passa da frequência sugerida. **Só a Couve tem números** (vêm da imagem 35); os demais mostram "valores em validação". Todo o conteúdo é `revisao: "pendente"`.
- O "3 vezes - acima da sugestão", que a imagem pinta de vermelho, usa `warn-ink` (vermelho é só para urgência); o nível "Alto" do cálcio usa o chip de atenção.
- "Frutas" existe como filtro, mas não há frutas no catálogo (a imagem não traz nenhuma).

## [2026-11-15] Fase 5: Sintomas, Consulta, Tratamento, Cuidados do grupo
- **Sintomas (imagem 24):** lista da imagem; "Respiração difícil" mostra a orientação de urgência na própria tela (aviso `urgente`, com ícone e texto). Vai para o histórico de Saúde (aparece em "Tudo") e **não gera alerta**. A foto opcional da seção 12.4 não está na imagem e não foi construída.
- **Consulta (imagem 25):** além da imagem, entram o tipo (Consulta ou Exame, para o filtro "Exames" da Saúde) e, em "Mais detalhes", o **peso na consulta** (também entra em Pesagens) e o **retorno** (cria um lembrete às 09:00). **Anexo:** o botão "Anexar exame ou receita" da imagem aceita **uma foto** (reduzida), sem gerenciador de anexos (F20 fora do escopo).
- **Tratamento (imagem 26):** a dose é texto livre ("Copie da receita… O Cavia não sugere dose"). Horários vêm preenchidos como sugestão e podem ser editados; "+ Horário" acrescenta um. Duração: de 1 a 30 dias ou uso contínuo. Com "Lembrete de cada dose" ligado, cria **um lembrete diário por horário, que termina no último dia** (campo novo `ate` nos lembretes).
- **Cuidados do grupo (imagem 27):** água e limpeza, com "Última vez". Feno e ração não aparecem aqui, porque a imagem não os traz (ficam em Alimentação). O que já foi registrado hoje aparece marcado e bloqueado, para não duplicar.

## [2026-11-15] Fase 5: Check-up
- Tela(s): iPhone 16 - 28 e 36
- Decisão: sete itens em Cabeça e Corpo, como na imagem (a lista das instruções tinha também "caroços e barriga" e "peso"). Tudo vem "Normal"; "Atenção" abre o pop-up "O que você viu?". **Só "Boca e dentes" tem as opções da imagem 36**; nos demais itens só há a observação livre. O "i" abre "como olhar", com texto provisório ("em validação com a veterinária"), porque a imagem não traz o conteúdo.
- Selecionado, "Normal" usa verde com ✓ e "Atenção" usa âmbar com ▲ (a imagem usa vermelho-rosado para "Atenção").
- **Alerta de check-up:** item com atenção no check-up mais recente gera "Animal: check-up com atenção (…)" no Início, por 7 dias, com o "o que fazer" provisório. Um check-up por animal por dia (salvar de novo atualiza).
- A tela de **Frequência do check-up** continua sem imagem e não foi construída; o cartão do Diário mostra a frequência só como texto.

## [2026-11-15] Fase 6: polimento, acessibilidade e responsividade
- Tela(s): todas
- Resultados completos em `QA.md`.
- **Diário (7 dias):** o rótulo de cada linha (Fezes, Urina, Comportamento) foi para cima das células, em vez de à esquerda como na imagem 6. Com o rótulo à esquerda, cada dia ficava com 39 px de largura; assim chega a 52 px e cumpre os 44 px de toque (seção 8).
- **Telas estreitas:** abaixo de 360 px de largura (zoom grande), cartões e grades passam para uma coluna e o texto quebra em vez de rolar para o lado.
- **Landmark:** o conteúdo de cada tela recebe `role="main"`; a abertura ganhou um `h1` visível só para leitores de tela.
- **Service worker:** endereço de pasta abre o `index.html` guardado. O carimbo de versão não inclui o próprio `sw.js`, então uma mudança só no `sw.js` mantém o nome do cache (o navegador ainda detecta o arquivo novo).
- **Prévia do histórico:** única tela com cores fora dos tokens (papel branco para impressão).
- **Não foi possível** testar instalação, offline e impressão: ver `QA.md`.

## [2026-11-15] Moldura de celular em telas grandes
- Tela(s): todas
- Decisão: em janelas de pelo menos 700 x 640 px, fora do app instalado, o app aparece dentro de uma **moldura de celular** (aparelho escuro de 390 x 868 px, que encolhe na altura se a janela for baixa). Fica **ligada por padrão** no computador. Para desligar, abra qualquer endereço com `?moldura=0` (e `?moldura=1` volta a ligar; a escolha vale durante a sessão). No modo de teste (`?teste=1`) há também o botão "Moldura do celular: ligar ou desligar".
- Como funciona: `ui.js` embrulha o conteúdo em `.aparelho`; a barra inferior, os avisos e o painel de teste ficam presos à tela do aparelho; os pop-ups sobem da base da tela do aparelho. No celular, no app instalado e na impressão não há moldura; se a janela ficar estreita, a moldura some.
- Motivo: pedido da designer, como em uma versão anterior do app. Responde em parte à pergunta 7 da seção 16 (enquadramento no computador).

## [2026-11-15] Logo e favicon oficiais; ajuste na tela de Peso
- Tela(s): abertura, prévia do histórico, ícone do app, iPhone 16 - 19 (atualizada pela designer)
- **Logo e favicon:** os arquivos oficiais (`cavia.svg` e `Favicon.svg`) substituíram os provisórios.
  - `assets/logo/cavia-logo.svg`: logo oficial para fundo claro (usada na prévia do histórico).
  - `assets/logo/cavia-logo-clara.svg`: **derivada** da oficial para fundo teal (palavra e detalhes em creme, caderno rosa, porquinho teal), como na imagem da abertura. Usada na abertura. **A designer deve conferir** esta versão, porque ela não veio pronta.
  - `assets/logo/cavia-icone.svg` e `assets/icons/favicon.svg`: o ícone do caderno com o porquinho.
  - Ícones do PWA (192, 512, maskable 512 e Apple 180) regerados a partir do favicon, sobre fundo creme; no maskable a arte fica dentro dos 80% centrais. O manifesto e as páginas também apontam para o `favicon.svg`.
- **Peso:** o botão − ficou à esquerda do número e o + à direita, como na imagem atualizada (antes estavam trocados, como na versão anterior da imagem).

## [2026-11-15] Nova logo da abertura, novo ícone de "Porquinhos" e medidas da tela Registrar
- Tela(s): abertura, barra inferior, iPhone 16 - 18
- **Logo da abertura:** `assets/logo/cavia-logo-clara.svg` agora é o arquivo da designer ("Group 24"), no lugar da versão que eu tinha derivado.
- **Ícone de "Porquinhos":** o desenho `iconoven_guinea-pig` foi convertido para a grade de 24 px do sistema de ícones (coordenadas multiplicadas por 24/35, traço de 2 px que vira 1,8 px na barra e 2,2 px quando ativo, olho como ponto cheio). Vale na barra inferior e no pop-up "Montar um avatar".
- **Registrar, medidas da imagem (quadro de 393 px):** cartões de atalho com **124 px de altura**, cartões largos com **63 px**; **15 px** entre as colunas e **18 px** entre as linhas; ícone de **50 x 45 px**, a 13 px da borda esquerda; texto do cartão centralizado na área abaixo do ícone (a 17 px da borda). Conferido por medição no navegador a 393 px: oito cartões nas posições e tamanhos esperados.
- **Correção:** os cartões depois do primeiro ganhavam 12 px de margem superior por uma regra geral de cartões em coluna, o que desalinhava a segunda coluna e abria os espaços entre as linhas. A regra não vale mais dentro da grade do Registrar.

## [2026-11-15] Início sem porquinhos (imagem nova) e folha creme sobre o teal
- Tela(s): Início (imagem nova da tela vazia e iPhone 16 - 3)
- **Início vazio:** quando não há nenhum porquinho cadastrado (mesmo havendo grupo), o Início mostra só o cabeçalho com "Início" e a data, o cartão "Nenhum porquinho por aqui / Só precisamos do nome e do grupo. O resto você pode completar depois." com o botão **"+ Cadastrar porquinho"**, e o cartão "O que o Cavia faz" com três linhas (peso, rotina/dieta/check-ups, avisos). Substitui a dica "Vamos começar" e o seletor de grupo nesse estado. O botão leva ao cadastro; se já existe um grupo, ele vem escolhido.
- **Botão com 44 px:** na imagem o botão tem cerca de 39 px; usei 44 px, o mínimo de toque da seção 8.
- **Cabeçalho do Início:** passou a ser uma **folha creme de cantos arredondados (36 px) sobre o teal**, como nas imagens 3 e 4; antes o teal tinha cantos arredondados embaixo. Vale para o Início com e sem porquinhos. Os perfis de animal e de grupo continuam com o teal arredondado, como nas imagens deles.
- Ícone novo "caderno" (da rotina). Cores dos quadradinhos: `primary-soft`, `leaf-soft` e `rose-soft`.

## [2026-11-15] Avisos, botões em branco, botão Registrar e cabeçalho com seta de voltar (imagens de referência)
Medidas tiradas das imagens de referência (quadro de 393 px) e conferidas no navegador a 393 px.
- **Caixas de aviso:** fundo âmbar claro (`warn-soft`) com **ícone de contorno e texto em âmbar escuro**, sem o círculo preenchido atrás do símbolo. Ícone de 22 px a 19 px da borda, texto a 52 px, 12 px/18 px (a frase da imagem cabe em 2 linhas). O mesmo padrão vale para os avisos de urgência (vermelho), de dica e de confirmação (verde), todos com ícone de contorno na cor do texto.
- **Âmbar escuro:** a imagem usa cerca de `#93651C` (4,29:1 sobre o fundo do aviso). Para chegar a 4,5:1 usei **`#8E6017`** (4,61:1), que passou a ser o token `--warn-ink` (antes `#6B4300`). Vale para todos os usos do âmbar escuro (chips de atenção, variação de peso negativa, etc.).
- **Botões rosa com texto branco:** `--on-action` agora é `#FFFFFF` (botões Salvar, Registrar etc.), como na imagem. **Contraste de 2,9:1**, abaixo dos 4,5:1 e até dos 3:1 de texto grande da seção 8, que proibia branco sobre `action`. Foi decisão da designer; se for preciso voltar, basta restaurar `--on-action: #1E2B2D` em `tokens.css`.
- **Botão Registrar da barra:** círculo rosa de **72 px com borda branca de 4 px (80 px no total)**, 38 px acima da barra; sinal de **+ de 36 px com traço de 4 px em vermelho-escuro (`--action-icone: #600000`, 4,8:1 sobre o rosa)**. Antes o círculo tinha 58 px no total e o sinal tinha 17 px. O rótulo continua alinhado com os outros itens.
- **Cabeçalho das páginas e seta de voltar:** círculo rosa de **38 px** (área de toque de 44 px), seta escura de 12 px com traço de 3 px, 12 px de distância do texto; sobrerrótulo de 12 px e **título de 20 px** (antes 24 px), centralizados na altura do círculo.
- Fundo da página: nas imagens novas ele mede `#FFF8F3`, e o token `--bg` é `#FFF4EC`. Mantive o token; se a designer quiser o novo valor, é uma troca em `tokens.css`.

## [2026-11-15] Gráfico de peso interativo, Saúde alinhada, Diário nas medidas da imagem e cores da variação
- Tela(s): Perfil do animal (Peso, Diário, Saúde), Registrar peso; imagens de referência 9 a 12
- **Gráfico de peso:** tocar em um ponto mostra um balão com o **valor e a data** ("636 g / 15.11.26") e destaca o ponto; tocar de novo, tocar fora ou apertar Esc esconde. Os pontos são botões HTML por cima do SVG, com área de toque de 44 px e nome acessível ("15.11.26: 636 g"), então funcionam com teclado e leitor de tela. Vale também para o gráfico da tela Registrar peso.
- **Variação de peso (lista):** **verde ao ganhar** (`--ok`) e **vermelho ao perder** (`--danger`), sempre com o sinal (+ ou −). Antes a queda era âmbar. É uma exceção à regra "vermelho só para urgência e erro", a pedido da designer; o contraste do vermelho sobre o branco é 6,96:1.
- **Saúde:** os dois cartões do topo ("Próxima consulta" e "Tratamento") agora ficam alinhados, com a mesma altura (105 px) e 16 px entre eles. A causa era a regra de espaço entre cartões, que empurrava o segundo cartão 12 px para baixo; ela agora vale só para cartões soltos na tela. Isso também tirou o espaço dobrado entre cartões em outros painéis.
- **Diário (imagem 11, quadro de 393 px), conferido por medição no navegador:** cartão de 361 x 197 px; seletor 7/30 dias de 115 x 25 px; grade de 323 px com coluna de rótulo de 106 px e dias de 31 px; bolinhas de 21 px; linhas de 38,5 px; letras e rótulos de 11 px; Higiene com linhas de 39 px; 20 px entre os cartões do painel; botão de 39 px de altura, 17 px mais estreito de cada lado (como os botões da imagem). O rótulo voltou para a **esquerda** das bolinhas, como na imagem (na Fase 6 eu o tinha colocado acima).
- **Exceção de toque:** para seguir as medidas, as bolinhas do Diário têm área de 31 x 38,5 px, o seletor de 7/30 dias tem área de toque de 41 px de altura e o botão tem 39 px, abaixo dos 44 px da seção 8 (todos acima do mínimo de 24 px da WCAG 2.2). Status continua com ícone, não só cor.
- Abas do perfil: sublinhado de 2 px (antes 3 px), como na imagem.

## [2026-11-15] Desenhos de fezes e urina da designer, medidas das opções e botões centralizados
- Tela(s): Observação (fezes, urina), pop-up do dia no Diário; imagens de referência 13, 14 e 15
- **Desenhos:** as 12 ilustrações (6 de fezes, 6 de urina) agora são **os desenhos das imagens da designer**, recortados com fundo transparente e salvos em `assets/img/obs/` (arquivos em 2x, com tamanhos calibrados no quadro de 393 px). Substituem os desenhos simplificados que eu tinha feito. Atenção: como foram recortados de imagens com cerca de 1,18x, o resultado é nítido em telas comuns e um pouco menos em telas de altíssima densidade; **se a designer tiver os arquivos vetoriais (SVG) desses desenhos, é só trocar os arquivos** `fezes-*.png` e `urina-*.png`. As fezes "Anormal" agora são verdes, como na imagem nova (antes vermelhas).
- **Medidas (conferidas a 393 px):** cartão de 361 px; opções de 154 x 56 px, 16 px entre colunas e 9 px entre linhas; ícone centralizado; texto a 58,6 px da borda nas fezes e a 52,5 px na urina (como nas imagens); título "Fezes"/"Urina" à esquerda e "Escolha o que mais se parece" à direita; sem seta quando a seção está aberta.
- **Tamanho das letras:** pelas larguras do texto nas imagens, os tamanhos são aproximadamente título 14,6 px, nome 12,8 px, descrição 9,9 px e dica 10,5 px. Usei **título 15 px, nome 13 px, descrição 11 px e dica 11 px**: a descrição e a dica ficam no mínimo de 11 px do projeto (seção 7.2), um pouco maiores que na imagem; o espaçamento entre letras da descrição é reduzido em 0,1 px para os textos caberem em 2 linhas como na imagem.
- **Botões centralizados:** os botões largos dos painéis do perfil de animal e de grupo ("Registrar alimentação", "Registrar peso" etc.) tinham 17 px de margem de cada lado mas largura de 100%, então estouravam e apareciam deslocados para a direita. Agora ficam centralizados. Verifiquei por script, em 27 páginas e abas, que todos os botões largos têm a mesma distância da esquerda e da direita.
- **Correção:** o sinal de + do botão Registrar voltava a ficar fino quando a página atual era a do Registrar (a regra da aba ativa tinha prioridade); agora o traço é de 4 px sempre.

## [2026-11-16] Consultas e exames segue a imagem de referência
- Tela(s): Consultas e exames (imagem de referência nova)
- **Campos como na imagem:** Animal, Data (Hoje / Outro dia), Veterinário ou clínica, Motivo (Rotina, Sintoma, Pós-operatório, Outro), Orientação do veterinário, "Anexar exame ou receita" (borda pontilhada) e Salvar. **Saíram da tela** os itens que eu tinha acrescentado e que a imagem não tem: o seletor Consulta/Exame, o texto "Aceita uma foto…", e o bloco "Mais detalhes" com **peso na consulta** e **retorno**. Consequências: toda consulta é gravada como "consulta" (o filtro "Exames" da Saúde fica sem itens), o peso informado numa consulta não entra mais em Pesagens por esta tela e o retorno não cria lembrete. As funções continuam em `acoes.js`; se a designer quiser esses campos, é só dizer onde entram.
- **Medidas (quadro de 393 px; conferidas no navegador, com diferença de 0 px em todas as posições verticais, descontada a barra de status da imagem):** campos de 37 px; caixa de texto de 78 px (sem alça de redimensionar); seletor de animal de 53 px; chips de 38 px com borda de 2 px e cantos de 14 px, largura mínima de 90 px, 9 px entre eles e 8 px entre as linhas; botão de anexo de 38 px; botão Salvar de 39 x 327 px, centralizado. Rótulos de 15,5 px, texto dos chips de 13,5 px, anexo de 15 px e Salvar de 18 px (tamanhos tirados das larguras do texto na imagem). Borda dos campos em tom teal-acinzentado, como na imagem.
- Diferença: o chip "Sintoma" tem 90 px aqui e 82 px na imagem (a largura mínima vale para todos os chips).
- Observação técnica: a renderização do Quarto falhou duas vezes no meio do trabalho com um erro de arquivo ("rename … NotFound"); limpar os arquivos soltos em `app/` e rodar `quarto render` de novo resolveu. Nada ficou fora do lugar (`docs/` está completo e o `sw.js` foi carimbado).

## [2026-11-16] Barra de navegação com ícones e rótulos maiores
- Tela(s): barra inferior (imagem de referência 17)
- **Ícones maiores:** caixas de 27 px (Início), 38 px (Porquinhos) e 31 px (Perfil), para o desenho ficar com cerca de 20 x 20, 28 x 23 e 21 x 23 px, como na imagem; traço de cerca de 2,3 px (2,5 px no item ativo). Antes todos tinham 22 px.
- **Rótulos:** 13,5 px em negrito (antes 12 px), em tom escuro quando inativos e em `primary` quando ativos (a imagem usa preto; usei `--ink`). Ícones inativos também em `--ink` (antes cinza).
- **Pílula ativa:** 50 x 32 px, a 11 px do topo da barra (antes 56 px de largura e centralizada na barra); rótulo 3 px abaixo da pílula.
- **Espaçamento:** as quatro colunas continuam iguais (a imagem de referência 3 confirma isso: Início ~49, Porquinhos ~147, Registrar ~252, Perfil ~344 px). Os centros diferentes que aparecem no recorte da referência 17 não foram reproduzidos.
- A cor da pílula segue o token `primary-soft` (na imagem é um tom mais escuro).

## Alertas de peso, urgência e Início resumido (ajuste a pedido da designer)

- **Regra de peso:** a diferença entre a última pesagem e as pesagens de 1 a 7 dias antes (a maior delas) gera **atenção a partir de 5%** e **urgência a partir de 10%**. Vale para perda e para ganho ("diferença"). Constantes em `regras.js` (`PESO_ATENCAO_PCT`, `PESO_URGENCIA_PCT`, `PESO_JANELA_DIAS`); limites provisórios, a validar com veterinário (`PENDENCIAS.md`). O alerta vale por 7 dias; `statusPeso` ganhou o estado `urgente` (chip vermelho com ícone e a palavra "Urgente").
- **Aviso de urgência:** segue a imagem de referência: caixa vermelha clara (`#FED9D1`), ícone de contorno e texto vinho (`#600000`), primeira linha em negrito ("Pudim: peso caiu 17% em 7 dias") e segunda linha "Procure um veterinário, sem esperar piorar". Aparece no topo do Início (um por alerta, toque abre "O que fazer") e na aba Peso do animal.
- **Início resumido:** os alertas de atenção viraram um cartão compacto com **uma linha por alerta** ("Pudim: peso caiu 50 g"), sem a etiqueta "Atenção" e sem o botão "O que fazer"; a linha inteira abre a folha "O que fazer". Textos e lógica de descrição em `assets/js/alertas.js`.
- **Lembretes e tarefas:** o título ficou no topo do cartão, alinhado como em "Bom dia!"; o link "Ver mais" mantém o alvo de toque de 44 px, mas saiu do fluxo (margem negativa).

## Dicas dentro dos campos de texto (placeholder)

- Os campos de texto aberto ganharam uma dica em cinza mais claro (`#7F8A88`, contraste cerca de 3,6:1 sobre o branco; mais claro que o texto digitado, a pedido da designer). Na dieta: "Marca da ração", "Marca da vitamina C", "Marca do feno"; no ambiente: Recinto e Forração com exemplos. Também receberam dica: conta, novo grupo, novo porquinho (nome, raça, cor, origem, idade), lembrete (o que lembrar, a cada quantos dias, anotação), consulta, tratamento (nome e dose), sintomas e check-up (observação).
- A dica não substitui o rótulo, que continua visível acima do campo e é o nome acessível; a dica só dá o exemplo. Em `abrirFormularioTexto` cada campo aceita `dica`.
- Não receberam dica: campos de data, hora, busca (já tinha) e o peso (campo numérico grande com aviso próprio).

## Alertas de atenção fora do Início

- A pedido da designer, o **Início não mostra mais os alertas de atenção (amarelos)**, para não poluir a tela. O Início mantém só os avisos de **urgência** (vermelhos), que pedem ação imediata.
- Os alertas de atenção agora aparecem: (1) **no perfil do animal**: aba Peso (variação de peso de 5% a menos de 10%) e aba Diário (observações e check-up com atenção); (2) **na tela de registro, logo depois de salvar**: Registrar observação e Check-up mostram "Observação salva"/"Check-up salvo", o aviso amarelo com o "o que fazer" e os atalhos "Ver o diário de …" e "Voltar ao início". Sem alerta, o fluxo segue como antes (volta ao Início com o aviso "salva").
- O aviso usa a mesma caixa do restante (primeira linha em negrito, orientação abaixo); em `assets/js/alertas.js` (`avisoDeAlerta`, `mostrarResultadoComAlertas`). O cartão "Alertas de atenção" e o botão "O que fazer" do Início foram removidos; o aviso de urgência no Início segue abrindo a folha "O que fazer".

## Desenhos de fezes e urina em SVG

- Os desenhos de fezes e urina agora são os **SVGs exportados do Figma** pela designer (`assets/img/obs/*.svg`), no tamanho de cada arquivo. Isso resolve a pendência de versão vetorial e deixa os desenhos nítidos em qualquer tela.
- Correspondência: fezes normal, gota, empelotado, viscoso e mole usam o SVG de formato equivalente; urina normal (gota amarela), cor diferente (rosa), com sangue (vermelha), branco ou turva (contorno) e muito ou pouca (três gotas).
- **"Fezes anormal"**: não veio SVG próprio; usa a forma de "Fezes normal" (as três elipses) em verde `#447213`, a cor do desenho anterior. **"Urina com esforço"** continua em PNG (gota com raios), à espera do SVG.
