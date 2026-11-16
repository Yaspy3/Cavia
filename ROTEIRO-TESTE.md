# Roteiro de teste em aparelho real

O que o `QA.md` não conseguiu verificar. Marque cada item e anote o que viu na última tabela. Tempo estimado: cerca de 1 hora e meia, com um computador (Chrome), um Android e um iPhone.

**Dica geral.** Abra qualquer tela com `?teste=1` no endereço (por exemplo `.../index.html?teste=1`) para mostrar o painel "Modo de teste": restaurar ou zerar os dados, simular outro dia, simular um lembrete, destacar o conteúdo clínico a validar e ver a versão do cache. O painel nunca aparece sem esse parâmetro.

---

## 0. Preparar o site

O service worker só funciona em **HTTPS** (ou em `localhost`). Escolha uma forma:

**A. No computador, em `localhost`** (para os testes 1, 4 e 5)

```bash
npx --yes http-server docs -p 8080 -c-1
```

Abra `http://localhost:8080/?sw=1`. O `?sw=1` liga o service worker (em `localhost` ele fica desligado por padrão). Se o Python estiver instalado, também serve: `python -m http.server -d docs 8080`.

**B. Publicado, com HTTPS** (obrigatório para os celulares, testes 2 e 3)

- GitHub Pages: envie a pasta `docs/` e ative o Pages para ela; a URL será parecida com `https://usuario.github.io/cavia/`.
- Ou Netlify: arraste a pasta `docs/` em app.netlify.com/drop.

Anote a URL: `____________________________`

**C. Celular Android com cabo, sem publicar:** no Chrome do computador, abra `chrome://inspect/#devices`, ative "Port forwarding" `8080 → localhost:8080` e abra `http://localhost:8080/?sw=1` no Chrome do celular.

> Depois de publicar uma versão nova, o app mostra "Há uma versão nova do Cavia" com o botão "Atualizar". Isso também deve ser testado (item 1.7).

---

## 1. PWA no Chrome do computador

Abra o site, aperte **F12** e vá em **Application**.

- [ ] 1.1 **Manifest:** aparece "Cavia", cor do tema teal, os 3 ícones (192, 512 e maskable) sem aviso de erro.
- [ ] 1.2 **Service Workers:** estado "activated and is running" para `sw.js`.
- [ ] 1.3 **Cache Storage:** existe `cavia-xxxxxxxxxx` com cerca de 80 arquivos.
- [ ] 1.4 **Instalável:** aparece o ícone de instalar na barra de endereço (ou menu ⋮ > "Instalar Cavia"). Instale.
- [ ] 1.5 **Janela instalada:** abre sem a barra do navegador, com a abertura teal por 1,5 s e depois o Início.
- [ ] 1.6 **Offline:** em **Network**, marque **Offline** (ou desligue a internet) e **recarregue**. Navegue por Início, Animais, Registrar, Perfil e abra um animal: tudo deve abrir. Registre um peso offline e confira que salvou.
- [ ] 1.7 **Atualização:** altere qualquer texto, rode `quarto render`, recarregue o site com rede. Deve aparecer "Há uma versão nova do Cavia"; ao tocar em "Atualizar", a página recarrega com a versão nova. (Opcional: `?teste=1` > "Ver versão" mostra o código da versão do cache.)
- [ ] 1.8 **Dados persistem:** feche e reabra o app instalado; os dados continuam.

## 2. Android (Chrome)

Use o site publicado (HTTPS).

- [ ] 2.1 Aparece "Adicionar à tela inicial" / "Instalar app". Instale.
- [ ] 2.2 O ícone na tela inicial está nítido; o **ícone maskable** (recorte redondo) não corta a arte.
- [ ] 2.3 Abre em tela cheia, sem barra do navegador; a barra de status fica teal.
- [ ] 2.4 Modo avião: o app abre e funciona (registrar peso, abrir um animal).
- [ ] 2.5 Barra inferior: o botão **Registrar** fica elevado no centro, sem cobrir o conteúdo; em celular com **gestos de navegação**, a barra respeita a área segura embaixo.
- [ ] 2.6 Teclado aberto em um formulário (por exemplo, Cadastrar animal): o botão "Salvar" continua alcançável rolando a tela.
- [ ] 2.7 Tirar foto / Escolher da galeria no cadastro do animal: a foto aparece no avatar.
- [ ] 2.8 Campo de peso: o teclado que abre é **numérico**.
- [ ] 2.9 Campos de data e hora (Novo lembrete, "Outro dia"): abrem o seletor do sistema.

## 3. iPhone (Safari)

Use o site publicado (HTTPS).

- [ ] 3.1 Compartilhar > **Adicionar à Tela de Início**. O nome é "Cavia" e o ícone está correto (180 px).
- [ ] 3.2 Abre em tela cheia, sem a barra do Safari.
- [ ] 3.3 **Barra inferior e entalhe (notch):** a barra não fica atrás da barra de início do iPhone (área segura). Topo: o cabeçalho teal não fica sob o relógio.
- [ ] 3.4 Modo avião: o app abre e funciona.
- [ ] 3.5 Os mesmos itens 2.6 a 2.9.
- [ ] 3.6 Os dados **não somem** ao fechar e reabrir o app. (O Safari pode limpar os dados de um site depois de uns dias sem uso; é esperado em protótipo. "Restaurar dados de exemplo" resolve.)

## 4. Salvar o histórico em PDF (Fluxo 4)

No Chrome do computador.

- [ ] 4.1 Perfil > Exportar histórico > escolha o animal (Pudim), período "6 meses", marque todos os itens > **Ver prévia do PDF**.
- [ ] 4.2 Na prévia, **Salvar PDF**. No diálogo de impressão, destino **Salvar como PDF**, papel **A4**.
- [ ] 4.3 No PDF: a **logo** aparece no topo (versão escura); **não** aparecem a barra inferior, os botões nem o painel de teste.
- [ ] 4.4 As tabelas não são cortadas nas laterais; o cabeçalho das tabelas se repete se a tabela passar para a página seguinte; nenhuma linha fica partida entre páginas.
- [ ] 4.5 Depois de fechar o diálogo, a tela mostra **"Histórico pronto"**.
- [ ] 4.6 Repita com **Grupo** em vez de Animal. O PDF tem uma seção por animal.
- [ ] 4.7 No celular (Android ou iPhone), "Salvar PDF" abre o diálogo de impressão/compartilhamento do sistema. Anote se foi possível salvar ou compartilhar.

## 5. Lighthouse (Chrome, F12 > Lighthouse)

Rode em **Mobile**, categorias Desempenho, Acessibilidade, Boas práticas e SEO, em duas páginas: `index.html` e `app/inicio.html`. Marque "Progressive Web App" se a sua versão tiver.

| Página | Desempenho | Acessibilidade | Boas práticas | Instalável |
|---|---|---|---|---|
| `index.html` | | | | |
| `app/inicio.html` | | | | |

Meta: acessibilidade **100** (ou perto, com itens explicados) e "instalável" aprovado. Anote os itens reprovados.

## 6. Leitor de tela

**Android: TalkBack** (Configurações > Acessibilidade > TalkBack). **iPhone: VoiceOver** (Configurações > Acessibilidade > VoiceOver). Deslize para a direita para avançar e toque duas vezes para ativar.

Fluxo 1, registrar o peso:

- [ ] 6.1 A barra inferior é anunciada como navegação "Principal", e o item atual como "página atual" (ou equivalente).
- [ ] 6.2 Registrar > Peso: o botão "Escolher porquinho" é lido com a função; o pop-up abre e o foco vai para dentro dele; ao escolher, o foco volta ao botão ou segue o fluxo.
- [ ] 6.3 O campo de peso é lido como "Peso em gramas" e os botões como "Aumentar 10 gramas" e "Diminuir 10 gramas".
- [ ] 6.4 Ao salvar, o "Peso salvo" é anunciado sem você procurar.
- [ ] 6.5 O gráfico é lido como uma frase ("Peso subiu de … para … em … pesagens").

Fluxo 2, observação e alerta:

- [ ] 6.6 Em Observação, a sanfona (Fezes, Urina…) é anunciada como expandida ou recolhida; as opções de fezes são lidas como "botão de opção, marcado/não marcado".
- [ ] 6.7 No Início, o alerta é lido com "Atenção", o texto e "O que fazer".

Outros:

- [ ] 6.8 Diário: cada círculo é lido com o campo, o dia e o estado (por exemplo, "Fezes, quinta-feira 12.11.26: Gota").
- [ ] 6.9 Erros de formulário são anunciados (tente salvar o cadastro sem nome).
- [ ] 6.10 Os pop-ups prendem o foco; o gesto de voltar/Esc fecha.

## 7. Zoom e fonte grande

- [ ] 7.1 Chrome do computador, zoom **200%** e depois **300%**: nenhuma tela corta texto nem esconde botões; nada rola para o lado.
- [ ] 7.2 Celular: aumente a fonte do sistema ao máximo e abra Início, Registrar peso, Cadastrar animal, Check-up e Perfil: o texto cresce, os botões continuam alcançáveis.
- [ ] 7.3 Ative **"Reduzir movimento"** no sistema: o interruptor e os botões mudam sem animação.
- [ ] 7.4 Tema escuro do sistema: o app continua legível (o visual é um só, claro, por decisão do projeto; só confira que nada some).

## 8. Fluxos do teste de usabilidade

Faça com o app **zerado** (`?teste=1` > "Zerar dados") e depois com os **dados de exemplo**. Conte os toques e anote tropeços.

| Fluxo | Caminho | Critério | Toques | Tropeços |
|---|---|---|---|---|
| 1. Registrar o peso | Registrar > Peso > animal > peso > Salvar peso | até 4 toques, mais a digitação | | |
| 2. Observação até o alerta | Registrar > Observações > escolher > Salvar observação | o alerta aparece no Início quando há mudança; nenhum alerta quando está tudo normal | | |
| 3. Grupo e primeiro registro | Animais > Criar um grupo > Cadastrar um animal > Registrar | só nome e grupo obrigatórios; o Início mostra dicas do que foi cadastrado | | |
| 4. Exportar para o veterinário | Perfil > Exportar histórico > opções > prévia > Salvar PDF | 5 passos; confirmação no final | | |

Para testar alertas em outros dias: `?teste=1` > "Dia simulado".

## 9. Registro dos resultados

Copie para um arquivo e preencha. Para cada problema, anote **aparelho, navegador, tela, o que aconteceu e uma foto ou vídeo curto**.

| # | Item do roteiro | Aparelho / navegador | Resultado (OK / falhou / não deu para testar) | Observação |
|---|---|---|---|---|
| | | | | |

Quando terminar, me mande a tabela (ou as fotos) e eu corrijo o que falhou e atualizo o `QA.md`.
