# PENDENCIAS.md

Conteúdo que a designer precisa revisar. Tipos: `exemplo` (texto fictício), `clínico` (revisão veterinária), `jurídico`, `sugestão` (texto proposto pelo Claude Code).

| Tela | Texto ou dado | Tipo | O que falta |
|---|---|---|---|
| Abertura | Tempo de 1,5 s | sugestão | Definir o tempo. |
| Manifesto | "Acompanhe a saúde e o bem-estar dos seus porquinhos-da-índia." | sugestão | Confirmar a frase. |
| PWA | "Há uma versão nova do Cavia." / "Atualizar" | sugestão | Confirmar o texto. |
| Aviso de erro | "Não foi possível guardar os dados neste aparelho. O Cavia vai funcionar só até você fechar esta página." | sugestão | Confirmar o texto. |
| Registrar | Chips "Vence hoje" e "Atrasado" no Check-up de saúde | sugestão | A imagem 18 não traz esse aviso; seção 12.4 pede. Confirmar o texto e o visual. |
| Dados de exemplo | Tutora "Marina Lima", e-mail, 4 animais, pesagens, lembretes, "Luftal 2x ao dia", "Dra. Amanda", marcas de ração | exemplo | Nomes, marcas e medicamento são fictícios; confirmar se podem ficar. |
| Dados de exemplo | Dose do tratamento: "Conforme a receita" | exemplo | Nunca sugerir dose; revisar. |
| Modelo | Campo `apetite` nas observações | clínico | Nenhuma imagem de Observações tem "apetite", mas o Fluxo 2 e as regras (seção 9.4) o citam. Manter ou trocar a base do alerta por fezes, urina e comportamento? |
| Regras | Check-up semanal (7 dias) em `regras.js` | clínico | Frequência provisória; revisão veterinária. |
| Dados de exemplo | Falta: observações dos últimos 14 dias com uma mudança, alimentos da semana, sintomas | exemplo | Entram nas Fases 3 e 5. |
| Avatar | Cores das 5 pelagens, 4 marcas e 5 fundos | exemplo | Tons estimados a partir da imagem 38; enviar os valores exatos. |
| Peso | "Diferença maior do que o usual…" e "O valor parece alto. Confira se está em gramas." | clínico | Limites provisórios (15% e 2.000 g) a validar. |
| Lista de animais | "Atenção" com queda de 5% ou mais | clínico | Limite provisório; revisão veterinária. |
| Registrar peso | "Peso salvo", "O peso desse dia foi atualizado.", "Escolha o porquinho.", "Digite o peso em gramas." | sugestão | Confirmar os textos. |
| Cadastrar animal | Erros: "Digite o nome do porquinho.", "Escolha o grupo.", "Crie um grupo para continuar.", "A data não pode ser no futuro."; "Você ainda não tem um grupo…" | sugestão | Confirmar os textos. |
| Criar grupo / Animais | "Grupo criado: …", "Nenhum porquinho neste grupo ainda.", "Você ainda não tem grupos…" | sugestão | Confirmar os textos. |
| Alertas | Janela de 14 dias, validade de 2 dias (observação) e 7 dias (peso), "padrão" = valor mais frequente | clínico | Regras provisórias em `regras.js`; revisão veterinária. |
| Alertas | "O que fazer" da observação: "Observe o seu porquinho nas próximas horas e registre de novo amanhã. Se a mudança continuar ou ele piorar, procure um veterinário." | clínico | Texto sugerido; revisão veterinária. O de peso é da imagem 5. |
| Observação | Tipos de fezes e urina, comportamento e água (listas das imagens) | clínico | `revisao: "pendente"`; revisão veterinária. As ilustrações das opções são desenhos simplificados. |
| Observação | Campo `apetite` não está nas imagens | clínico | Decidir se entra uma pergunta de apetite. |
| Observação de grupo | Associar fezes/urina do grupo a um porquinho (F14) | sugestão | Não está desenhado; desenhar ou cortar. |
| Início | Dicas (7): "Vamos começar", "Primeiro porquinho", "Primeiro peso", "Primeira observação", "Limpeza do grupo", "Hora de pesar" e "Bom dia!" (esta da imagem) | sugestão | Textos fictícios e regras de exibição a confirmar. |
| Início | Estado vazio e cartão de Alertas de atenção | sugestão | Não desenhados; confirmar o visual. |
| Perfil do animal | Pop-up "Registrar saúde" e botões "Editar" (telas sem imagem) | sugestão | Desenhar ou cortar. |
| Perfil do animal | Visão de 30 dias do Diário | sugestão | Não desenhada; confirmar. |
| Perfil do grupo | Pop-ups de Editar dieta e Editar ambiente | sugestão | Não desenhados; confirmar. |
| Alimentos | Pimentão, Salsinha, Couve, Pepino, Cenoura, Rúcula (sem dados nutricionais) | clínico | Informação nutricional e frequência sugerida entram na Fase 5, com revisão. |
| Dados de exemplo | Observações, higiene e alimentos da semana agora existem | exemplo | Nomes e valores fictícios. |
| Perfil | "Nome do tutor" e "E-mail não informado" quando não há conta | sugestão | Confirmar os textos. |
| Conta | Tela inteira e "Excluir conta" (sem imagem) | sugestão | Desenhar ou cortar. Mensagens de erro e textos a confirmar. |
| Notificações | Tela inteira (sem imagem), tipos de aviso e "Alertas de atenção e doses ignoram o horário de silêncio." | sugestão | Desenhar ou cortar; confirmar a regra do silêncio. |
| Lembretes | Opções Concluir, Adiar, Editar, Excluir e o pop-up "Só este / Este e os próximos" (sem imagem) | sugestão | Desenhar ou confirmar. |
| Novo lembrete | Campos "Para", "Avisar" ("Na hora", "10 minutos antes", "1 hora antes", "1 dia antes") e "Anotação"; "A cada N dias" | sugestão | Confirmar os campos e os textos; "Repetir" começa em "Não repetir". |
| Exportar histórico | "Ver prévia do PDF" no lugar de "Gerar PDF" | sugestão | Confirmar. |
| Prévia do histórico | Layout em A4, rodapé "Gerado pelo Cavia… não substituem a avaliação do veterinário." e a mensagem "Histórico pronto" | sugestão | Desenhar a prévia; confirmar os textos. A impressão em A4 ainda não foi conferida em papel/PDF. |
| Alimentação | Etiquetas e frequências da lista (Vit C alta, Cálcio alto, "Todo dia", "1 - 2x/sem") e dados da Couve | clínico | Revisão veterinária. Faltam os valores dos demais alimentos e as frutas. |
| Alimentação | "Cálcio em excesso pode favorecer problemas urinários. Alterne com folhas mais leves" (imagem 35) | clínico | Texto da imagem; revisão veterinária. |
| Sintomas | Lista de sintomas e orientação "Respiração difícil ou com ruído pode ser urgente. Procure um veterinário, sem esperar piorar" | clínico | Da imagem; revisão veterinária. Definir se outros sintomas também são urgentes. |
| Check-up | Itens e opções de "Boca e dentes" (imagem 36) | clínico | Faltam as opções dos demais itens. |
| Check-up | Texto de "como olhar" de cada item ("em validação com a veterinária") | clínico | Escrever com a revisão veterinária. |
| Check-up | "O que fazer" do alerta: "Olhe esse item de novo nos próximos dias e registre. Se continuar ou piorar, procure um veterinário." | clínico | Texto sugerido; revisão veterinária. |
| Consulta | Campos "Tipo", "Peso na consulta" e "Retorno"; botão de anexo só com foto | sugestão | Confirmar os campos; decidir sobre anexos de PDF. |
| Tratamento | Horários sugeridos (08:00, 20:00, 14:00…), durações e texto "Copie da receita do veterinário. O Cavia não sugere dose." | sugestão | Confirmar. Nenhuma dose é sugerida. |
| Cuidados do grupo | Feno e ração fora desta tela | sugestão | A seção 14.1 pedia manter nos dois; a imagem só tem água e limpeza. |
| Dados de exemplo | Observações de Pudim e Mimi, alimentos da semana, retorno de consulta | exemplo | Fictícios. |
| PWA | Instalação, uso offline, Android e iPhone | verificação | Testar em aparelho real; ver `QA.md`. |
| Prévia do histórico | Impressão em A4 / "Salvar PDF" | verificação | Conferir em papel ou PDF; ver `QA.md`. |
| Acessibilidade | Leitor de tela e fonte ampliada do sistema | verificação | O script confere a estrutura; falta teste com TalkBack/VoiceOver. |
| Revisão final | Conteúdo clínico (`revisao: "pendente"`) | clínico | Use `?teste=1` e "Destacar conteúdo a validar" para ver tudo o que falta validar. |
| Observação | Desenhos das fezes e da urina recortados das imagens (PNG 2x) | arte | Enviar os desenhos em SVG para trocar os PNG e ganhar nitidez em qualquer tamanho. |
