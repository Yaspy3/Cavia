# TELAS.md — inventário das telas (Fase 0)

Gerado a partir das 35 imagens em `_docs/` (`iPhone 16 - N.png`, quadro de 393 × 852 px, uma tela por arquivo).
Os números que **faltam** na sequência (1, 4, 7, 8, 10, 13, 21, 23, 30, 33) podem ser telas removidas ou não exportadas: ver pergunta 1 em "Perguntas".

Legenda de prioridade: **P0** = necessária para os 4 fluxos e para a navegação; **P1** = resto do app que aparece nas imagens; **P2** = não implementar.
Prioridades são **propostas**, aguardando confirmação.

## entrada/ (sem barra inferior)

| Imagem | Tela | Seção | Arquivo | Prior. | Fluxo | Observações |
|---|---|---|---|---|---|---|
| 44 | Abertura (splash) | — | `index.qmd` | P0 | — | Fundo teal com a logo horizontal (caderno rosa + "Cavia"). Ver divergência D1. |
| — | Boas-vindas | — | — | **cortada** | — | Cortada do protótipo por decisão da designer (2026-11-15). |
| — | Entrar | — | — | **cortada** | — | Idem. |
| — | Criar conta | — | — | **cortada** | — | Idem. O app abre direto, sem conta. |

## app/ — Início

| Imagem | Tela | Seção | Arquivo | Prior. | Fluxo | Observações |
|---|---|---|---|---|---|---|
| 3 | Início | Início | `app/inicio.qmd` | P0 | 2, 3 | Cabeçalho teal curvo, seletor de grupo, avatares, 3 cartões-resumo (Animais, Última limpeza, Última observação), dica "Bom dia!", Lembretes e tarefas. **Não mostra** o cartão de Alertas de atenção nem estado vazio (sem imagem). |
| 43 | Lembretes (lista) | Início | `app/lembretes.qmd` | P1 | — | "Hoje" e "Próximos", botão "Novo Lembrete". Sem opções concluir/adiar/editar/excluir desenhadas. |
| 45 | Novo lembrete | Início | `app/lembrete-novo.qmd` | P1 | — | Faltam "Para", "Avisar" e "Anotação" (seção 9.6). Contém `[n]` em "A cada [n] dias". |

## app/ — Animais (rotulada **Porquinhos** na barra inferior das imagens)

| Imagem | Tela | Seção | Arquivo | Prior. | Fluxo | Observações |
|---|---|---|---|---|---|---|
| 2 | Lista de animais por grupo | Animais | `app/animais.qmd` | P0 | 1, 3 | Botões "Criar um grupo" e "Cadastrar um animal"; chips de status "Peso estável" / "Atenção". |
| 11 | Cadastrar animal | Animais | `app/animal-novo.qmd` | P0 | 1, 3 | Avatar, Nome, Grupo (seletor), Sexo, Nascimento ("Sei a data" / "Apenas a idade"), "Mais detalhes" (recolhível, sem estado aberto desenhado). |
| 37 | Pop-up de foto/avatar | Animais | pop-up em `animal-novo` e `animal` | P1 | 3 | Tirar foto, Escolher da galeria, Montar um avatar. |
| 38 | Montar avatar | Animais | pop-up | P1 | 3 | 5 pelagens, 4 marcas, 5 fundos. Ver D6. |
| 12 | Criar grupo | Animais | `app/grupo-novo.qmd` | P0 | 3 | Nome + integrantes (checkbox) + "Cadastrar um animal". Aviso âmbar explicando grupo. |
| 14 | Grupo · Integrantes | Animais | `app/grupo.qmd?id=` | P1 | — | Aba 1 de 3; botão "Editar grupo" (tela de edição sem imagem). |
| 15 | Grupo · Alimentação | Animais | `app/grupo.qmd?id=` | P1 | — | Dieta (Ração, Vitamina C, Feno com marca) e "Vegetais da semana" em grade 7 dias; "Editar Alimentação" (edição sem imagem). |
| 17 | Grupo · Ambiente | Animais | `app/grupo.qmd?id=` | P1 | — | Recinto, Forração, Última Limpeza; "Editar" e "Registrar Cuidados do grupo". |
| 31 | Animal · Dados | Animais | `app/animal.qmd?id=` | P0 | 3 | Identificação (sexo, nascimento, raça, cor) e Origem e Cuidado (chegou em, castrado, origem); "Editar" (telas de edição sem imagem). |
| 5 | Animal · Peso | Animais | `app/animal.qmd?id=` | P0 | 1 | Gráfico "Evolução do peso", lista com variação (+14 / −50), aviso âmbar de queda, botão "Registrar Peso". |
| 6 | Animal · Diário (7 dias) | Animais | `app/animal.qmd?id=` | P0 | 2 | Grade Fezes/Urina/Comportamento × 7 dias, alternância 7/30 dias, cartão Higiene. |
| 16 | Animal · Diário (Higiene + Check-up) | Animais | `app/animal.qmd?id=` | P1 | — | Rolagem da mesma aba: Check-up com "Vence hoje", anteriores, "Frequência: toda semana" (tela da frequência sem imagem). |
| 32 | Pop-up do dia no Diário | Animais | pop-up | P1 | 2 | "Segunda, 30.05.2026": Fezes, Urina, Comportamento; "Editar Observações". |
| 9 | Animal · Saúde | Animais | `app/animal.qmd?id=` | P1 | — | Próxima consulta, Tratamento, Histórico com filtros (Tudo, Consultas, Exames, Medicamento). "Registrar Saúde" (sem imagem do destino). |

## app/ — Registrar

| Imagem | Tela | Seção | Arquivo | Prior. | Fluxo | Observações |
|---|---|---|---|---|---|---|
| 18 | Registrar (atalhos) | Registrar | `app/registrar.qmd` | P0 | 1–3 | 8 atalhos. Sem aviso de check-up vencido na imagem (seção 12.4 pede). |
| 19 | Registrar peso | Registrar | `app/registrar-peso.qmd` | P0 | 1 | Seletor de animal, Hoje/Outra data, botões − / + de 10 g, últimas pesagens, aviso "Diferença maior do que o usual…". "Cadastrar" aparece só pelo seletor (ver pergunta 5). |
| 20 | Observações · Animal · Fezes | Registrar | `app/registrar-observacao.qmd` | P0 | 2 | 6 tipos de fezes com ilustração. |
| 39 | Observações · Animal · Urina | Registrar | idem | P0 | 2 | 6 tipos de urina. |
| 40 | Observações · Animal · Comportamento | Registrar | idem | P0 | 2 | Normal, Quieto, Agitado, Violento. |
| 41 | Observações · Animal · Higiene | Registrar | idem | P1 | 2 | Corte de unhas, Banho (caixas de marcar). |
| 34 | Observações · Grupo | Registrar | idem | P0 | 2 | Água (Normal/Menos/Mais), Comportamento do grupo, Fezes/Urina do grupo (texto orientando registrar no animal). |
| 22 | Registrar alimentação | Registrar | `app/registrar-alimentacao.qmd` | P1 | — | Grupo, data, Feno/Ração, busca, filtros, lista com chips de frequência. |
| 35 | Pop-up do alimento (Couve) | Registrar | pop-up | P1 | — | Semana, nutrientes "a cada 10 g", aviso. Conteúdo clínico pendente. |
| 24 | Sintomas e ocorrências | Registrar | `app/registrar-sintomas.qmd` | P1 | — | Chips de sintomas, "Desde quando?", observação, aviso urgente. Sem foto na imagem. |
| 25 | Consultas e exames | Registrar | `app/registrar-consulta.qmd` | P1 | — | Tem "Anexar exame ou receita"; falta peso e retorno. Ver D8. |
| 26 | Tratamentos e medicações | Registrar | `app/registrar-tratamento.qmd` | P1 | — | Dose em texto livre, vezes/dia, horários, duração, lembrete. |
| 27 | Cuidados do grupo | Registrar | `app/registrar-cuidados.qmd` | P1 | — | Água trocada, bebedouro lavado, limpeza do dia, troca da forração. |
| 28 | Check-up de saúde | Registrar | `app/registrar-checkup.qmd` | P1 | — | Cabeça (olhos, orelhas, nariz, boca e dentes) e Corpo (pele e pelo, patas e unhas, parte de trás). |
| 36 | Pop-up do item de check-up | Registrar | pop-up | P1 | — | "Boca e dentes: o que você viu?" com opções e observação. Conteúdo clínico pendente. |

## app/ — Perfil

| Imagem | Tela | Seção | Arquivo | Prior. | Fluxo | Observações |
|---|---|---|---|---|---|---|
| 29 | Perfil | Perfil | `app/perfil.qmd` | P0 | 4 | Conta, Notificações, Exportar histórico. **Falta "Sobre o Cavia"**. |
| 42 | Exportar histórico (opções) | Perfil | `app/exportar.qmd` | P0 | 4 | Animal/Grupo, período, o que incluir, "Gerar PDF". |
| — | Prévia do histórico (A4) | Perfil | `app/exportar-previa.qmd` | P0 | 4 | **sem imagem** |
| — | Conta | Perfil | `app/conta.qmd` | P1 | — | **sem imagem** |
| — | Notificações | Perfil | `app/notificacoes.qmd` | P1 | — | **sem imagem** |
| — | Sobre o Cavia | Perfil | `app/sobre.qmd` | P1 | — | **sem imagem** |

## Funcionalidades da seção 12.4 sem imagem (resumo)

Boas-vindas, Entrar, Criar conta, Conta (inclui excluir conta e animais arquivados), Notificações (horário de silêncio), Sobre o Cavia (instalar, termos), Prévia da exportação, Editar grupo, Editar dieta, Editar ambiente, Editar dados do animal, Frequência do check-up, opções do lembrete (concluir/adiar/editar/excluir), cartão de Alertas de atenção no Início, estado vazio do Início, tela de "o que fazer" do alerta, Dicas para o seu grupo (só há um exemplo, "Bom dia!").
Pela seção 12.5: **não construo nem invento o visual** até a designer decidir (desenhar ou cortar).

## Divergências entre as imagens e as instruções

| # | Assunto | Imagens | Instruções | Preciso saber |
|---|---|---|---|---|
| D1 | Logo / abertura | Fundo **teal** com logo horizontal: caderno rosa com porquinho + "Cavia" em creme e folhas rosa (img 44). | Direção 5 "Traço contínuo", verde-petróleo sobre fundo concha, versão vertical. | Qual logo vale? Os SVGs existem? |
| D2 | Nome da 2ª aba | "**Porquinhos**" | "**Animais**" | Qual rótulo? (Afeta também o título da lista de animais, que na img 2 diz "Animais".) |
| D3 | Botão Registrar | Círculo rosa com **"+" escuro** e rótulo "Registrar" (nas imgs 2 e 11 o círculo está **sem o "+"**). | "+" em `ink`, rótulo `rose-ink`. | O "+" ausente é descuido do export? Assumo que sim. |
| D4 | Entrada do peso | Botões −/+ de 10 g e toque no número para digitar (img 19). | Campo numérico `inputmode="numeric"`. | Posso fazer os dois (botões + campo digitável)? |
| D5 | Estrutura do Perfil do animal | Abas **Dados · Peso · Diário · Saúde**; Check-up e Higiene ficam **dentro do Diário**. | Check-up "numa aba própria". | Sigo a imagem (Check-up dentro do Diário). |
| D6 | Avatar | Fundos e pelagens diferentes dos propostos: 5 pelagens (laranja, creme, marrom, grafite, cinza), 4 marcas (Nenhuma, Lateral, Testa, Focinho), 5 fundos (rosa, amarelo, azul-claro, lilás, rosa-claro). Rosto de "urso". | 3 pelagens (caramelo, creme, chocolate). | Sigo as imagens (instruções dizem para usar as das imagens). Preciso das cores exatas. |
| D7 | Cor de dica no Início | Cartão "Bom dia!" em **âmbar** (`warn-soft`). | Dica = `leaf-soft`; âmbar = atenção. | Sigo a imagem ou o sistema? |
| D8 | Anexo na Consulta | "Anexar exame ou receita" aparece (img 25). | F20 (anexos) fora do escopo; só foto opcional. | Mantenho um botão simples de foto/arquivo único ou corto? Faltam também peso na consulta e retorno. |
| D9 | Vermelho para algo não urgente | "Alto" do cálcio em vermelho-rosado (img 35); "Atenção" selecionado no check-up (img 28); "−50" no peso (img 5). | `danger` só para urgência e erro; `rose` não é status. | Quais cores usar nesses três casos? |
| D10 | Itens do check-up | Olhos, orelhas, nariz, boca e dentes, pele e pelo, patas e unhas, parte de trás. | Lista traz também "caroços e barriga" e "peso". | Sigo a imagem (7 itens, sem caroços/barriga e peso). |
| D11 | "Higiene" | Existe em Observações (Corte de unhas, Banho) e no Diário. | Não está no modelo de dados nem em 12.4. | Incluo `higiene` no modelo (decisão a registrar). |
| D12 | Campos extras | Dados do animal: "Chegou em", "Castrado"; Grupo: recinto (medidas), forração; Dieta: marca de ração/vitamina C/feno. | Não estão no modelo. | Incluo no modelo (decisão a registrar). |
| D13 | Exportar | Botão "**Gerar PDF**" direto da tela de opções; "Personalizar" no período. | Fluxo com **prévia** e "Salvar PDF". | Mantenho a prévia entre as duas telas? Preciso da imagem da prévia. |
| D14 | Lembrete novo | Sem "Para", "Avisar", "Anotação"; "Repetir" inclui "A cada [n] dias". | "Para" é obrigatório. | Acrescento "Para" (animal ou grupo)? |
| D15 | Tipografia | Títulos parecem sem serifa (Figtree), não Fraunces. | Fraunces nos títulos e números grandes. | Em qual tela o Fraunces aparece? (Não consigo confirmar na imagem.) |
| D16 | Datas | `25.05.26`, `ter, out.27`, `30.05.2026`. | "hoje", "amanhã", 1.020 g. | Padronizo pelo `formato.js` mantendo `dd.mm.aa` onde a imagem usa? |
| D17 | Barra inferior | Pílula ativa e círculo central batem; **altura/arredondamento** parecem corretos. Aba Início fica ativa na tela de Lembretes. | Idem. | Sem dúvida. |
| D18 | Cabeçalho de perfil | Teal um pouco mais **claro** no grupo (img 14) do que no animal (img 5). | Um único `primary`. | Intencional? |
| D19 | Idade no perfil | "4 anos" com nascimento 19.11.21 e hoje fictício 2025/26. | — | Os dados de exemplo precisam de datas coerentes (vou ajustar no seed). |

## Pendências de conteúdo vistas nas imagens

- `[n]` em "A cada [n] dias" (img 45): exemplo; vira campo numérico.
- Tipos de fezes, urina, comportamento, sintomas e itens do check-up: usar as listas das imagens, `revisao: "pendente"`.
- Info nutricional da Couve e chips "Todo dia", "1–2x/sem": `revisao: "pendente"`.
- Textos de aviso (queda de 50 g, cálcio, urgência): `revisao: "pendente"`.

## Perguntas

Ver a mensagem de conversa: as perguntas da seção 16, com o que já descobri.


## Estado após a Fase 3 (2026-11-15)

Construídas: Abertura, Início, Animais, Cadastrar animal (+ foto e avatar), Criar grupo, Perfil do animal (Dados, Peso, Diário + pop-up do dia, Saúde), Perfil do grupo (Integrantes, Alimentação, Ambiente), Registrar, Peso, Observações (animal e grupo).

Adicionadas sem imagem (ver DECISOES.md): edição de animal e de grupo (reaproveitando o cadastro), pop-ups de Editar dieta e Editar ambiente, pop-up Registrar saúde, visão de 30 dias do Diário, estado vazio e cartão de alertas do Início.

Pendentes: Lembretes e Novo lembrete, Perfil, Exportar histórico (Fase 4); Alimentação, Sintomas, Consulta, Tratamento, Cuidados do grupo, Check-up e pop-ups de alimento/item (Fase 5); Conta, Notificações e Sobre (sem imagem).

## Estado após a Fase 4 (2026-11-15)

Construídas: Perfil, Lembretes, Novo/Editar lembrete e Exportar histórico (com imagem); Conta, Notificações, Prévia do histórico e as opções dos lembretes (sem imagem, ver DECISOES.md).

Pendentes (Fase 5): Alimentação (com pop-up do alimento), Sintomas e ocorrências, Consulta ou exame, Tratamento ou medicação, Cuidados do grupo e Check-up de saúde (com pop-up do item). Sem imagem e não construída: Sobre o Cavia.

## Estado após a Fase 5 (2026-11-15)

Construídas (com imagem): Alimentação e pop-up do alimento, Sintomas e ocorrências, Consultas e exames, Tratamentos e medicações, Cuidados do grupo, Check-up de saúde e pop-up do item.

Sem imagem e não construídas: Sobre o Cavia, Frequência do check-up, Arquivar e restaurar animal, Termos de uso e Política de privacidade. Falta ainda a Fase 6 (polimento: acessibilidade, desempenho e revisão visual).

## Estado após a Fase 6 (2026-11-15)

Todas as fases do plano foram executadas. Resultados da verificação em QA.md. Faltam apenas as verificações em aparelho real (PWA, offline, impressão, leitor de tela) e a revisão veterinária do conteúdo clínico.
