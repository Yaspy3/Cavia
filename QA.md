# QA.md — Fase 6 (polimento): resultados

Data: 2026-11-15. Ambiente: navegador embutido do aplicativo (Chromium), site servido de `docs/`, 30 páginas/estados verificados por script, com dados de exemplo e com o app zerado.

## Resultado do checklist da seção 13.1

| Item | Estado | Como foi verificado |
|---|---|---|
| Confere com a imagem de referência | **Feito, com diferenças registradas** | Comparação visual de cada tela; diferenças em `DECISOES.md`. |
| Só usa tokens e componentes | **Feito, com exceções** | Nenhum hexadecimal em CSS fora de `tokens.css`, exceto a **prévia em A4** (papel branco). Em JS só `avatar.js` e `ilustracoes.js` (ilustração, não tokens) e o fundo branco do JPEG em `foto.js`. |
| Alvos de toque ≥ 44 px, foco visível, ordem lógica | **Feito, com exceções a pedido da designer (Diário)** | Script: 0 alvos abaixo de 44 px em 430 px de largura (corrigidos: avatares do Início, "Editar", dias do Diário, caixas dos Lembretes). Foco: `shadow-focus` em `:focus-visible`. |
| Nenhuma combinação de cor proibida; status com ícone e palavra | **Feito, com uma exceção pedida pela designer** | Contraste calculado para 41 combinações: todos os textos passam de 4,5:1, **exceto o texto branco sobre os botões rosa (2,9:1)**, adotado depois da Fase 6 a pedido da designer (ver `DECISOES.md`). O âmbar escuro passou a `#8E6017` (4,61:1 sobre o fundo do aviso). Chips e células de status levam ícone + palavra (ou nome acessível). |
| Textos conforme a seção 9; sem `[colchetes]` | **Feito** | Busca no código: nenhum colchete visível. |
| Funciona sem dados e com dados de exemplo | **Feito** | Script nos dois estados: 0 problemas. |
| Funciona offline depois de abrir uma vez com rede | **NÃO verificado** | O navegador embutido não registra service workers. Conferido só por análise estática (abaixo). |
| Funciona a 200% de zoom e com `prefers-reduced-motion` | **Feito** | 0 rolagem horizontal em larguras de 430, 320 e 215 px (equivale a cerca de 200% de zoom em um celular). Transições de até 150 ms e regra `prefers-reduced-motion` em `base.css`. |
| Sem erros e sem avisos no console | **Feito** | Console sem erros novos durante as varreduras. |
| `TELAS.md`, `DECISOES.md` e `PENDENCIAS.md` atualizados | **Feito** | |

## Acessibilidade: o que o script confere em cada página
Um único `h1`; `lang="pt-BR"`; sem salto de nível de título; ids únicos; `aria-labelledby`, `aria-describedby` e `aria-controls` apontando para elementos que existem; imagens com `alt`; todo botão, link e campo com nome acessível; landmarks `main` e `nav`; nenhum texto abaixo de 11 px; nenhuma rolagem horizontal.

Correções feitas nesta fase:
- `role="main"` no conteúdo de todas as telas e `h1` oculto na abertura (que não tinha título).
- Diário: o rótulo (Fezes, Urina, Comportamento) passou para cima de cada linha, para cada dia ter 44 px de largura (as imagens têm o rótulo à esquerda; ver `DECISOES.md`).
- Alvos de toque: avatares do Início, links "Editar" e caixas de marcar dos Lembretes.
- Prévia do histórico: títulos de seção sem pular nível.
- Telas estreitas: uma coluna abaixo de 360 px, abas e barra inferior que quebram o texto, quebra de palavras longas.

## Contraste: observação sobre indicadores não textuais
`leaf` e `warn` sozinhos sobre o fundo têm 2,84:1 e 1,85:1. Eles só aparecem como preenchimento de círculos que carregam um ícone em `ink` (4,74:1 e 7,31:1) e um nome acessível; nenhum texto usa essas cores.

## Desempenho
Site renderizado: 83 arquivos, cerca de 445 KB no total (JavaScript 250 KB sem compactação, CSS 48 KB, uma fonte de 20 KB). Sem bibliotecas, sem imagens pesadas (as fotos dos animais são reduzidas a 256 px). O service worker guarda tudo na instalação.

## PWA: análise estática (sem teste real)
- Manifesto válido: `start_url` `./index.html` existe, `scope` `./`, `display` `standalone`, cores e ícones de 192, 512, maskable 512 e Apple 180 px com os tamanhos corretos.
- Nenhum caminho absoluto (`/...`) em HTML, CSS ou JS (o site pode ir para uma subpasta).
- `sw.js` carimbado pelo `pos-render.ts`: sem `__VERSAO__`/`__ARQUIVOS__` sobrando; todos os 82 arquivos da lista respondem 200 no servidor local.
- Ajuste desta fase: endereço de pasta (`.../cavia/`) agora abre o `index.html` guardado, mesmo sem rede.

## O que ainda precisa de teste em aparelho real
1. **Instalação como PWA e uso offline** no Chrome (DevTools > Application > Manifest e Service Workers; depois, modo avião). A tentativa de usar o Chrome por esta ferramenta falhou (extensão não conectada).
2. **Impressão em A4 / PDF** da prévia do histórico (os estilos `@media print` existem, mas não foram vistos em papel).
3. **Android (Chrome) e iPhone (Safari, "Adicionar à Tela de Início")**, que instalam de formas diferentes.
4. **Lighthouse** (instalabilidade, acessibilidade, desempenho).
5. **Fontes ampliadas do sistema** e leitor de tela (TalkBack/VoiceOver): o script confere a estrutura, não a experiência.
6. Publicação em HTTPS (GitHub Pages ou outro) e conferência da URL pública.


## Atualização (2026-11-15): exceções de tamanho de toque
Para seguir fielmente as medidas da aba Diário (imagem 11), as bolinhas têm área de 31 x 38,5 px, o seletor 7/30 dias tem 41 px de altura de toque e o botão "Registrar observação" tem 39 px de altura. Ficam abaixo dos 44 px da seção 8 e acima de 24 px (WCAG 2.2). Os pontos do gráfico de peso têm 44 px.
