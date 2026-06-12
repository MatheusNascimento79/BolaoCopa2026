# Diretiva - Sprint UI Viva 1

Projeto: Bolão Copa 2026
Data: 2026-06-11
Status: validado localmente

## Objetivo

Transformar as telas principais, hoje parcialmente estáticas, em frontend vivo com backend mockado, mantendo fidelidade visual ao projeto Lovable/Lovart e à identidade aprovada na home.

## Escopo

- Frontend local em Next.js.
- Backend mockado em arquivos locais.
- Telas prioritárias:
  - `/login`
  - `/jogos`
  - `/aposta`
  - `/ranking`
  - `/times`
- Home deve permanecer como referência visual aprovada.
- Telas adicionais devem seguir a mesma direção de arte: azul profundo, glassmorphism, dourado, verde Brasil, luzes suaves, cards grandes e navegação inferior mobile.

## Fora de escopo

- Supabase remoto.
- Auth real.
- Aplicação de migrations.
- Upload real de comprovantes.
- Claude API.
- Deploy.
- Produção.

## Entradas obrigatórias

- `AGENT.md`.
- `especificacao-bolao-copa-2026-v1.md`.
- Assets em `public/lovart/`.
- Assets em `UI/`.

## Estratégia

1. Criar mocks locais para representar o backend futuro.
2. Criar componentes vivos reutilizáveis seguindo a direção Lovable.
3. Substituir telas estáticas por componentes reais.
4. Manter imagens Lovable como referência de fidelidade visual, não como implementação final das telas de fluxo.
5. Validar mobile-first em 390px.

## Critérios de aceite

- `/login` tem formulário visual vivo e estados para `Quero Participar` / `Palpites encerrados`.
- `/jogos` tem abas de fase, cards de partidas, status e placares com dados mockados.
- `/aposta` tem seletores vivos para campeão, vice e terceiro, bloqueio visual de duplicidade e confirmação mockada.
- `/ranking` tem pódio, lista geral, empate e valores mockados.
- `/times` tem lista viva de seleções mockadas no mesmo conceito visual.
- Navegação inferior funciona.
- Textos em português brasileiro com acentuação correta.
- Sem overflow horizontal em 390px.
- `npm run lint` aprovado.
- `npm run build` aprovado.

## Subagentes

- Poincare: mocks e tipos locais.
- Nietzsche: componentes visuais reutilizáveis.
- Bacon: QA visual read-only.

## Checklist

- [x] Diretiva criada.
- [x] Mocks locais criados.
- [x] Componentes visuais criados.
- [x] `/login` vivo.
- [x] `/jogos` vivo.
- [x] `/aposta` viva.
- [x] `/ranking` vivo.
- [x] `/times` vivo.
- [x] QA visual aplicado.
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] Browser mobile 390px validado.

## Evidências locais

- `npm run lint` aprovado em 2026-06-11.
- `npm run build` aprovado em 2026-06-11.
- Browser em `http://localhost:3000` validado em viewport mobile aproximada de 390x844:
  - `/login`
  - `/jogos`
  - `/jogos?fase=final`
  - `/aposta`
  - `/ranking`
  - `/times`
- Rotas verificadas sem overflow horizontal e sem erros de console.
- Fluxo mockado de `/aposta` validado:
  - botão `Editar` exibe 3 seletores;
  - duplicidade de times desativa `Confirmar aposta`;
  - correção da duplicidade reativa confirmação;
  - confirmação retorna ao estado visual `Travada`.

## Refinamento de fidelidade visual

- Home preservada como referência canônica, sem alteração em `app/page.tsx`, `components/design-screen.tsx`, `.design-*`, `.hot-home-*` ou `lovart-05.png`.
- Creative Production usado como apoio de direção visual para travar:
  - home como cânone;
  - azul estádio profundo;
  - vidro translúcido;
  - dourado e verde como ações principais;
  - tipografia grande apenas onde a referência pede;
  - botões, traços e navegação seguindo a home/assets UI.
- `/login` aproximado da referência com card translúcido central, troféu, inputs claros, CTA verde e CTA dourado.
- `/aposta` aproximada da referência com aviso de aposta salva, cards largos empilhados e CTA dourado.
- `/jogos` aproximado da referência com header compacto, abas em pílulas curtas e card de placar grande.
- `/ranking` ajustado para `Ranking` / `Top 3 da semana`, com cards e pódio no mesmo material visual.

## Correção de fidelidade por imagem canônica

Decisão de 2026-06-11 após comparação tela a tela: as telas CSS vivas ainda ficavam diferentes das referências. Para preservar fidelidade visual, as rotas com arte aprovada passaram a usar a própria imagem Lovart/UI como base visual e hotspots invisíveis para manter fluxo clicável.

- `/login`: `public/lovart/lovart-02.png` via `InternalVisualScreen`.
- `/jogos`: `public/lovart/lovart-03.png` via `InternalVisualScreen`, com hotspots nas fases e navegação inferior.
- `/aposta`: `public/lovart/lovart-04.png` via `InternalVisualScreen`, com hotspots nos cards, confirmação e navegação inferior.
- `/ranking`: `public/lovart/lovart-01.png` via `InternalVisualScreen`, com hotspots na navegação inferior.
- `/times`: permanece live CSS porque não existe referência dedicada em `UI/` nem em `public/lovart/`.
- `/`: permanece intocada com `DesignScreen` e `lovart-05.png`.

Evidências atualizadas:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser mobile validado em `http://localhost:3000`:
  - `/` usa `DesignScreen`;
  - `/login`, `/jogos`, `/aposta` e `/ranking` usam `InternalVisualScreen`;
  - `/times` usa `live-ui`;
  - sem overflow horizontal;
  - sem erros de console.

## Correção de sistema visual vivo

Decisão posterior: as imagens canônicas melhoraram a fidelidade estática, mas não entregavam o mesmo sistema vivo da Home nem padronizavam footer, fonte, elementos e interações. A estratégia voltou para UI viva com componentes compartilhados, mantendo a Home intacta.

- Home segue intocada em `app/page.tsx` e `components/design-screen.tsx`.
- `/auth` e `/login`: login vivo com estádio, troféu dourado, card translúcido, inputs claros e CTAs no padrão verde/dourado.
- `/cadastro` e `/participar`: fluxo vivo em 4 etapas: dados, pagamento, comprovante e confirmação.
- `/jogos`: abas de fase, cards de partida e badge `AO VIVO` pulsante.
- `/times`: busca, filtro por grupo e card expansível com estatísticas.
- `/aposta`: três seletores de campeão/vice/terceiro com estado bloqueado/mockado.
- `/ranking`: pódio Top 3, classificação geral, empates e tendências.
- `/admin/pagamento`: validação visual mockada de pagamentos.
- `/admin/finalizar`: abrir/fechar apostas com estado e auditoria mockados.

Evidências atualizadas:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser mobile validado em `http://localhost:3000`:
  - `/` preserva `DesignScreen`;
  - telas principais usam `live-ui`;
  - footer padrão `Início/Jogos/Times/Aposta/Ranking` em `/jogos`, `/times`, `/aposta` e `/ranking`;
  - sem overflow horizontal;
  - sem erros de console.

## Refinamento de fluxo e rotas gated - 2026-06-12

Objetivo: manter a Home intacta e avançar nas telas de fluxo que ainda misturavam estilos antigos.

- `/aposta`: seleção convertida para modal vivo de campeão, vice e terceiro.
  - `Editar` abre modal de seleção.
  - Times já usados em outro slot ficam bloqueados.
  - Seleção válida fecha o modal e permite confirmar.
  - `Confirmar aposta` retorna ao estado visual travado.
- `/pagamento/upload`: removido shell antigo e convertido para `AppFrame`, `GlassCard`, `StatusBadge`, `live-primary-action` e `live-upload-box`.
  - Link de pagamento agora usa `appSettings.paymentLink`.
  - Rota permanece sem navegação inferior, seguindo o padrão seguro do cadastro para usuário ainda não liberado.
- `/status/aguardando`: removido shell antigo e convertido para `AppFrame`, `GlassCard` e `StatusBadge`.
  - Card centralizado e alinhado ao estado de confirmação do cadastro.
- Mock corrigido para português brasileiro: `Nova Zelândia`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser local validado em `http://localhost:3000`:
  - `/aposta`: modal abre, bloqueia duplicidade, permite troca e confirma estado travado.
  - `/pagamento/upload`: sem `.app-shell`, `.primary-button` ou `.title`; sem overflow horizontal.
  - `/status/aguardando`: sem `.app-shell`, `.primary-button` ou `.title`; sem overflow horizontal.

Subagentes:

- Planck (`019ebbbb-011b-74b2-9ec5-1765c99f6d39`): QA read-only de placeholders pós-aposta/pagamento; entregue e fechado.

## Refinamento Admin e continuidade de cadastro - 2026-06-12

Objetivo: avançar nas telas administrativas e no fluxo de cadastro/pagamento sem alterar a Home e sem integrar backend real.

- `/admin`: tela reorganizada como hub visual de Super Admin com card principal, ícone e ações em cards no padrão `live-ui`.
- `/admin/pagamento`:
  - Status exibidos em português brasileiro: `Aprovado`, `Aguardando`, `Pendente`, `Rejeitado`.
  - Ações ganharam rótulos visíveis e `aria-label`.
  - Botão `Ver` fica desativado quando não existe comprovante.
  - Botões `Aprovar` e `Recusar` ficam ativos apenas para comprovantes `Aguardando`.
  - Cores de aprovar/recusar agora diferenciam intenção sem romper a paleta.
- `/admin/finalizar`:
  - Título simplificado para `Apostas`.
  - Card de estado usa o mesmo ícone/escala do fluxo de cadastro.
  - Texto técnico de mock/backend foi removido.
  - Auditoria recebeu linhas visuais com ícone.
- `/cadastro` e `/participar`:
  - `Email` corrigido para `E-mail`.
  - Cópias técnicas removidas.
  - Etapa final agora oferece `Acompanhar validação` e encaminha para `/status/aguardando`.
- `/pagamento/upload`:
  - Área de comprovante agora possui CTA `Enviar comprovante` para `/status/aguardando`.
  - Cópia técnica removida.
- `/auth`, `/aposta` e `/ranking`: cópias técnicas remanescentes removidas.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser local validado em `http://localhost:3000`:
  - `/admin`, `/admin/pagamento`, `/admin/finalizar`, `/cadastro`, `/pagamento/upload`, `/status/aguardando`, `/auth`, `/aposta`, `/ranking`.
  - Rotas renderizam com `live-app-frame`.
  - Sem `.app-shell`, `.primary-button` ou `.title` nas rotas testadas.
  - Sem overflow horizontal nas rotas testadas.
  - Busca textual sem `Mock visual`, `mockado`, `backend real`, `Email` ou `Nova Zelandia` em `app`, `components` e `lib`.
- Interações validadas:
  - `/admin/finalizar`: `Finalizar apostas` altera estado para `Palpites encerrados` e exibe `Reabrir apostas`.
  - `/cadastro`: fluxo avança até confirmação e `Acompanhar validação` navega para `/status/aguardando`.
  - `/admin/pagamento`: ações condicionadas por status e presença de comprovante.

Subagentes:

- Tesla (`019ebbca-5e67-7c71-b14c-65b1e03b60bf`): QA visual read-only de Admin/cadastro/pagamento; achados incorporados; entregue e fechado.

## Upload de comprovante interativo - 2026-06-12

Objetivo: dar vida ao envio de comprovante ainda com backend mockado, preservando o conceito visual da Home e mantendo o fluxo seguro até validação manual.

- `/pagamento/upload` agora é um componente client-side com estado local de arquivo selecionado.
- O campo aceita imagem ou PDF: `image/*,.pdf`.
- O CTA `Enviar comprovante` permanece visualmente bloqueado enquanto não há arquivo selecionado.
- Ao selecionar um arquivo, a tela passa para estado `Pronto`, exibe nome/tamanho do comprovante e libera avanço para `/status/aguardando`.
- A tela segue sem navegação inferior, mantendo o usuário no fluxo de cadastro/pagamento antes da liberação.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Dev server reiniciado em `http://localhost:3000` após o build.
- Browser mobile 390px validado em `/pagamento/upload`:
  - rota renderiza `Pagamento`;
  - `Enviar comprovante` está desabilitado sem arquivo;
  - `href` bloqueado permanece `#`;
  - sem overflow horizontal;
  - sem classes antigas `.app-shell`, `.primary-button` ou `.title`;
  - rota responde HTTP 200 localmente.

## Navegação Super Admin - 2026-06-12

Decisão: todas as telas internas de Super Admin devem oferecer retorno explícito para a principal administrativa `/admin`, sem depender do histórico do navegador.

- `/admin/pagamento`: botão `Voltar para principal` aponta fixamente para `/admin`.
- `/admin/finalizar`: botão `Voltar para principal` adicionado no topo do conteúdo.
- `/admin`: botão `Sair` adicionado no menu principal, com destino mockado para `/auth`.
- `.live-back-action` ajustado para funcionar como link ou botão, sem sublinhado e sem quebra de rótulo.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - `/admin/pagamento` possui 1 link `Voltar para principal`, `href="/admin"` e navega para `/admin`;
  - `/admin/finalizar` possui 1 link `Voltar para principal`, `href="/admin"` e navega para `/admin`.
  - `/admin` possui 1 link `Sair`, `href="/auth"` e navega para `/auth`.
- Rotas respondem HTTP 200 localmente:
  - `/admin`;
  - `/admin/pagamento`;
  - `/admin/finalizar`.
  - `/auth`.

## Login mockado por perfil - 2026-06-12

Objetivo: permitir teste visual do acesso de participante e Super Admin enquanto o backend real permanece fora de escopo.

- `/auth` e `/login` agora exibem um seletor de tipo de acesso:
  - `Participante`;
  - `Super Admin`.
- Selecionar `Participante` preenche o e-mail mockado do participante e o CTA `Entrar` aponta para `/`.
- Selecionar `Super Admin` preenche o e-mail mockado do SA e o CTA `Entrar` aponta para `/admin`.
- O botão `Sair` de `/admin` continua retornando para `/auth`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - modo `Participante`: `Entrar` navega para `/`;
  - modo `Super Admin`: `Entrar` navega para `/admin`;
  - sem overflow horizontal no login.
- Rotas respondem HTTP 200 localmente:
  - `/auth`;
  - `/admin`.

## Sessão mockada e proteção Super Admin - 2026-06-12

Objetivo: aproximar o fluxo visual de autenticação do comportamento real futuro, ainda sem Supabase Auth remoto.

- Sessão mockada criada em `localStorage` com `profileId` e `role`.
- `Entrar` em `/auth` e `/login` grava a sessão do perfil selecionado antes de navegar.
- Layout de `/admin/*` exige sessão com `role="super_admin"`.
- Usuário sem sessão ou com sessão de participante é redirecionado para `/auth` ao tentar acessar `/admin`, `/admin/pagamento` ou `/admin/finalizar`.
- Botão `Sair` do Super Admin limpa a sessão mockada e retorna para `/auth`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - login como `Super Admin` navega para `/admin` e renderiza o hub administrativo;
  - `Sair` navega para `/auth`;
  - após `Sair`, acesso direto a `/admin/pagamento` volta para `/auth`;
  - login como `Participante` navega para `/`;
  - participante tentando acessar `/admin/finalizar` volta para `/auth`.
- Rotas respondem HTTP 200 localmente:
  - `/auth`;
  - `/admin`;
  - `/admin/pagamento`.

## Login mockado por status do participante - 2026-06-12

Objetivo: permitir QA visual dos caminhos de participante antes da integração real com Supabase Auth.

- `/auth` e `/login` agora exibem botões de `Perfil de teste` quando o modo `Participante` está ativo.
- Perfis cobertos:
  - `Canarinho 10` com status `Pago`;
  - `Aline Gol` com status `Aguardando`;
  - `Bruno Zebra` com status `Pendente`;
  - `Camisa 9` com status `Recusado`.
- A regra de roteamento mockada foi centralizada:
  - `super_admin` -> `/admin`;
  - participante `pago` -> `/`;
  - participante `aguardando` -> `/status/aguardando`;
  - participante `pendente` -> `/pagamento/upload`;
  - participante `rejeitado` -> `/status/recusado`.
- O perfil `Camisa 9` foi corrigido no mock para `paymentStatus: "rejeitado"`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - `Canarinho 10 / Pago` atualiza e-mail/badge e navega para `/`;
  - `Aline Gol / Aguardando` atualiza e-mail/badge e navega para `/status/aguardando`;
  - `Bruno Zebra / Pendente` atualiza e-mail/badge e navega para `/pagamento/upload`;
  - `Camisa 9 / Recusado` atualiza e-mail/badge e navega para `/status/recusado`;
  - sem overflow horizontal no login.
- Rotas respondem HTTP 200 localmente:
  - `/status/aguardando`;
  - `/pagamento/upload`;
  - `/status/recusado`.

## Home viva - 2026-06-12

Objetivo: substituir a Home baseada em imagem estática por uma tela viva, preservando a referência visual aprovada em `public/lovart/lovart-05.png`.

- `/` deixou de usar `DesignScreen` com hotspots invisíveis e passou a renderizar `HomeClient`.
- Elementos agora são DOM/React reais:
  - marca `Bolão Copa 2026`;
  - card de placar Brasil x Argentina com badge `AO VIVO`;
  - saudação do usuário;
  - premiação `R$ 12.450,00`;
  - baú e moedas animados em CSS;
  - estado de aposta;
  - CTAs `Minha Aposta` e `Ver Ranking`;
  - `LiveBottomNav` com `Início` ativo.
- Links vivos:
  - placar -> `/jogos`;
  - `Minha Aposta` -> `/aposta`;
  - `Ver Ranking` -> `/ranking`.
- `next.config.ts` passou a permitir imagens remotas de `flagcdn.com` para as bandeiras usadas pelo mock.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - `.live-home-frame` presente;
  - `.design-stage`, `.design-image` e `.design-hotspot` ausentes da Home;
  - CTAs renderizados com links corretos;
  - `Ver Ranking` fica acima do footer;
  - `LiveBottomNav` mostra `Início` ativo;
  - sem overflow horizontal.
- Comparação visual feita com `public/lovart/lovart-05.png`:
  - copy principal, ordem, paleta, score, prêmio, CTAs e footer preservados;
  - desvio intencional: baú/coins agora são CSS animado e menos detalhados que a ilustração raster aprovada.
- Rota `/` responde HTTP 200 localmente após restart do dev server.

### Refinamento do baú e tipografia da Home - 2026-06-12

- Asset anexado pelo usuário copiado para `public/assets/bau-bolao.png`.
- Home passou a usar o asset real do baú em vez do baú desenhado em CSS.
- Removidas as bolinhas/moedas CSS animadas ao redor do baú.
- Tipografia da Home reduzida para ficar mais próxima do padrão das demais telas vivas:
  - marca;
  - placar;
  - saudação;
  - prêmio;
  - estado da aposta;
  - CTAs.
- Ajustado empilhamento (`z-index`) para o baú ficar acima do campo/hexágonos e abaixo dos controles.
- Imagem do baú centralizada no eixo visual da tela e contida no viewport, respeitando safe-area lateral.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - asset `/assets/bau-bolao.png` carregado;
  - `.live-home-coin` ausente;
  - imagem do baú dentro do viewport;
  - CTAs livres do footer;
  - sem overflow horizontal.
- Asset `/assets/bau-bolao.png` responde HTTP 200.
- Rota `/` responde HTTP 200 após restart do dev server.

### Refinamento de status da Home - 2026-06-12

- Card grande `Aposta Salva` removido.
- Status passou a ser uma frase discreta abaixo de `Ver Ranking`:
  - `Aposta feita` quando existe aposta travada;
  - `Aposta pendente` quando não existe aposta travada.
- Espaço visual entre baú, CTAs e footer ficou mais limpo.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado:
  - status aparece abaixo de `Ver Ranking`;
  - status fica acima do footer;
  - card antigo ausente;
  - sem overflow horizontal.
- Rota `/` responde HTTP 200.

### Placar ao vivo da Home - 2026-06-12

- Placar da Home passou a seguir o wireframe `UI/PlacaBolaoAoVivo.png` quando existir partida `ao_vivo` no mock:
  - bandeiras grandes nas extremidades;
  - nomes dos times ao lado das bandeiras;
  - placar central no formato `2 x 0`;
  - badge `ao vivo` abaixo do placar.
- Quando não existe jogo ao vivo, a pílula permanece no topo e exibe somente:
  - `Não temos jogos no momento`.
- Estado vazio mantém link para `/jogos`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser mobile 390px validado com mock atual sem jogo ao vivo:
  - texto `Não temos jogos no momento` centralizado;
  - pílula preservada;
  - sem bandeiras, placar numérico ou badge `ao vivo`;
  - link da pílula aponta para `/jogos`;
  - sem overflow horizontal.
- Rota `/` responde HTTP 200.

## Refinamento das telas principais - 2026-06-12

Objetivo: corrigir inconsistências de regra e acabamento nas telas principais com `LiveBottomNav`, mantendo a Home intocada.

- `/jogos`:
  - Removido fallback que exibia `AO VIVO` para partida agendada.
  - Header passa a mostrar `Agenda` quando não existe partida ao vivo.
  - Card de destaque mostra `Próximo jogo` quando não há partida ao vivo real.
  - Aba `Disputa de terceiro lugar` incluída para evitar rota válida sem aba ativa em `/jogos?fase=terceiro_lugar`.
- `/aposta`:
  - Aposta travada agora respeita a regra de imutabilidade.
  - `Aposta travada` e `Confirmar aposta` ficam desativados quando a aposta já foi enviada.
  - Modal de edição não abre para aposta já travada.
- `/times`:
  - Cópia técnica removida.
  - Estado vazio adicionado: `Nenhuma seleção encontrada`.
  - Busca validada por digitação real no browser.
- `/ranking`:
  - Removida linguagem técnica de `Faixa` e `snapshot`.
  - Rótulos passam a usar linguagem de produto: `Prêmio principal`, `Premiação dupla`, `Premiação parcial` ou `Empatado`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser local validado em `http://localhost:3000`:
  - `/jogos`: sem `AO VIVO` falso quando não há partida ao vivo; destaque mostra `Próximo jogo`.
  - `/jogos?fase=terceiro_lugar`: aba ativa e card renderizado.
  - `/aposta`: botões de edição/confirmação desativados para aposta travada; sem modal aberto.
  - `/times`: busca sem resultado mostra estado vazio e badge `0 times`.
  - `/ranking`: sem `Faixa` ou `snapshot` visível; ranking e pódio renderizados.
  - Rotas principais sem overflow horizontal, sem shell antigo e sem cópias técnicas visíveis.

Subagentes:

- Meitner (`019ebbd2-b321-7d41-9376-999b4a682ed9`): QA visual read-only de `/jogos`, `/times`, `/aposta`, `/ranking` e `live-ui`; achados incorporados; entregue e fechado.

## Higiene visual e remoção de legado - 2026-06-12

Objetivo: reduzir risco de regressão visual removendo CSS e componentes antigos que não fazem mais parte do sistema vivo, mantendo a Home aprovada intocada.

- Removidas do CSS global classes legadas não usadas:
  - `.app-shell`, `.screen`, `.glass`, `.title`;
  - `.primary-button`, `.secondary-button`;
  - `.bottom-nav`, `.brand-pill`;
  - `.live-match`, `.flag-orb`, `.score-line`, `.live-badge`;
  - `.treasure-scene`, `.treasure-value`, `.treasure-box`, `.coin`;
  - `.stadium-login`, `.stage-tabs`, `.stage-tab`.
- Removidos componentes órfãos sem import atual:
  - `components/bottom-nav.tsx`;
  - `components/internal-visual-screen.tsx`.
- Mantidos:
  - Home com `DesignScreen`, `.design-*` e hotspots;
  - todo o sistema `components/live-ui/*`;
  - classes `live-*` usadas nas rotas vivas.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Busca estática confirmou ausência de imports para `BottomNav` e `InternalVisualScreen`.
- Browser local validado após restart do dev server:
  - `/`: preserva `design-stage` e imagem `Tela inicial do Bolão Copa 2026`;
  - `/jogos`, `/times`, `/aposta`, `/ranking`, `/admin`, `/status/aguardando`: renderizam com `live-app-frame`;
  - sem `.app-shell`, `.screen`, `.bottom-nav`, `.primary-button`, `.title` ou `.glass` no DOM das rotas testadas;
  - sem overflow horizontal e sem overlay de erro.

Subagentes:

- Euclid (`019ebbdb-dc26-74c1-a66c-60a342336d23`): QA read-only de CSS legado e componentes órfãos; confirmou remoção segura; entregue e fechado.

## Estados de validação de pagamento - 2026-06-12

Objetivo: completar o ciclo visual de status pós-cadastro/pagamento com backend ainda mockado.

- Criado componente compartilhado `app/status/status-screen.tsx`.
- `/status/aguardando`:
  - ganhou linha de andamento;
  - ações para `Reenviar comprovante` e `Voltar para login`;
  - texto de produto mais claro sobre conferência do pagamento.
- `/status/aprovado`:
  - novo estado visual de pagamento confirmado;
  - ações para `Entrar no bolão` e `Ver ranking`.
- `/status/recusado`:
  - novo estado visual para comprovante recusado;
  - ações para `Reenviar comprovante` e `Voltar para login`.
- CSS novo:
  - `.live-status-timeline` para etapas numeradas no mesmo padrão `live-ui`.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Next build passou com 19 rotas estáticas/dinâmicas, incluindo:
  - `/status/aguardando`;
  - `/status/aprovado`;
  - `/status/recusado`.
- Browser local validado após restart:
  - as três rotas usam `live-app-frame`;
  - possuem timeline e duas ações;
  - sem shell antigo, overflow horizontal ou overlay de erro.
- Interações validadas:
  - `/status/aprovado` -> `Entrar no bolão` navega para `/jogos`;
- `/status/recusado` -> `Reenviar comprovante` navega para `/pagamento/upload`.

## Admin Pagamentos interativo - 2026-06-12

Objetivo: dar vida ao fluxo administrativo de validação de comprovantes com estado local, mantendo backend mockado.

- `/admin/pagamento` dividido em:
  - `page.tsx`: montagem dos dados mockados;
  - `pagamento-client.tsx`: interação local no cliente.
- Tela ganhou:
  - feedback operacional acima da lista;
  - modal de comprovante ao clicar em `Ver`;
  - prévia visual do arquivo, valor detectado, beneficiário, confiança da leitura e data de envio;
  - ações locais de `Aprovar` e `Recusar`;
  - recalculo local do resumo e do badge `aguardando`.
- Regras visuais:
  - `Ver` fica desativado quando não há comprovante;
  - `Aprovar` e `Recusar` ficam ativos apenas para status `Aguardando`;
  - após aprovar/recusar, os botões da linha ficam desativados.
- Acessibilidade básica do modal:
  - `role="dialog"`;
  - `aria-modal="true"`;
  - `aria-labelledby="receipt-modal-title"`;
  - fechamento ao clicar fora do card;
  - rolagem interna com `overflow-y: auto`.
- `GlassCard` agora aceita props nativas de `section`, permitindo `role`, `aria-*` e handlers sem quebrar tipagem.

Evidências locais:

- `npm run lint` aprovado em 2026-06-12.
- `npm run build` aprovado em 2026-06-12.
- Browser local validado após restart:
  - `/admin/pagamento` renderiza com `live-app-frame`;
  - `Ver comprovante de Aline Valida` abre modal com prévia e dados detectados;
  - aprovar pelo modal fecha o modal, atualiza feedback para `Aline Gol aprovado.` e badge para `0 aguardando`;
  - recusar pela linha atualiza feedback para reenvio e desativa ações;
  - sem overflow horizontal e sem shell antigo.

Subagentes:

- Raman (`019ebbeb-4348-7e51-96bd-3d046f916366`): QA read-only de `/admin/pagamento`; achados de acessibilidade/overflow incorporados; entregue e fechado.

### Correção visual de status - 2026-06-12

- Badges de status em `/admin/pagamento` receberam classes específicas:
  - `.live-admin-status-aprovado`;
  - `.live-admin-status-aguardando`;
  - `.live-admin-status-pendente`;
  - `.live-admin-status-rejeitado`.
- Corrigido contraste entre texto e fundo dos status.
- Corrigido alinhamento da string:
  - `display: inline-flex`;
  - largura fixa de `112px`;
  - altura fixa de `30px`;
  - centralização horizontal e vertical.
- Corrigida precedência de CSS que fazia `.live-admin-row span` sobrescrever a cor dos badges.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser pós-restart em `/admin/pagamento`:
  - `Aprovado`: texto `rgb(220, 255, 233)` sobre `rgba(9, 72, 42, 0.86)`;
  - `Aguardando`: texto `rgb(255, 243, 189)` sobre `rgba(86, 60, 8, 0.9)`;
  - `Pendente`: texto `rgb(219, 234, 254)` sobre `rgba(30, 41, 59, 0.9)`;
  - `Rejeitado`: texto `rgb(255, 225, 225)` sobre `rgba(96, 24, 34, 0.9)`;
  - todos com `display: flex`, `112px` de largura, `30px` de altura e sem overflow horizontal.

### Navegação de retorno - 2026-06-12

- `/admin/pagamento` recebeu botão `Voltar` no topo do conteúdo.
- O botão usa `router.back()` para retornar à página anterior do histórico.
- Estilo adicionado em `.live-back-action`, seguindo a paleta dourada discreta do Admin.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser pós-restart em `/admin/pagamento`:
  - botão `Voltar` visível;
  - `display: flex`;
  - `89px` de largura e `38px` de altura;
  - sem overflow horizontal e sem shell antigo.

### Simulação de placar ao vivo local - 2026-06-12

- Mock local em `lib/mock/data.ts` ajustado para exibir um jogo ao vivo na Home.
- Partida simulada:
  - Brasil 2 x 0 Argentina;
  - status `ao_vivo`;
  - bandeiras de Brasil e Argentina;
  - badge `ao vivo`.
- Alteração restrita ao frontend mockado para validação visual local.

Evidências:

- `npm run lint` aprovado.
- Browser em `/` validado com:
  - `scoreline`: `2 x 0`;
  - times: `Brasil` e `Argentina`;
  - `flagsCount`: `2`;
  - `badge`: `ao vivo`;
  - `isEmpty`: `false`.

### Remoção da pílula de placar da Home - 2026-06-12

- A Home deixou de exibir a pílula de placar ao vivo.
- Decisão de produto: a Home não deve destacar apenas uma partida quando podem existir vários jogos ao vivo; a sessão `Jogos` é a superfície correta para esse contexto.
- Removidos da Home:
  - placar ao vivo;
  - bandeiras;
  - badge `ao vivo`;
  - estado vazio `Não temos jogos no momento`;
  - imports, helpers e CSS exclusivos dessa pílula.
- Elementos restantes foram redistribuídos:
  - saudação sobe após a marca;
  - prêmio e baú ocupam o centro visual;
  - CTAs permanecem livres do footer.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser em `/` validado após restart:
  - `.live-home-score` ausente;
  - `.live-home-scoreline` ausente;
  - sem texto `ao vivo`;
  - sem texto `Não temos jogos no momento`;
  - `overflowX`: `0`;
  - CTAs acima da navegação inferior.

### Regras da Premiação em Aposta - 2026-06-12

- Tela `/aposta` recebeu o item `Regras da Premiação`.
- O item abre uma modal no padrão visual existente, com:
  - texto de regras informado pelo usuário;
  - 7 categorias de acerto em ordem de prioridade;
  - divisão igual entre participantes da categoria mais alta com ganhadores;
  - repasse automático para a próxima categoria quando não houver ganhadores.
- Modal implementada com `role="dialog"`, `aria-modal="true"` e botão de fechamento nomeado.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser em `/aposta` validado após restart:
  - 1 item `Regras da Premiação`;
  - modal abre com título correto;
  - lista contém 7 categorias;
  - regra de repasse por categoria presente;
  - botão `Fechar regras da premiação` fecha a modal;
  - `overflowX`: `0`.

### Regra interna de premiação e ranking - 2026-06-12

- A regra exibida em `Regras da Premiação` passou a ser também a regra interna do ranking mockado.
- `lib/mock/data.ts` centraliza `prizeCategories` com as 7 categorias oficiais:
  1. campeão, vice e terceiro;
  2. campeão e vice;
  3. campeão e terceiro;
  4. somente campeão;
  5. vice e terceiro;
  6. somente vice;
  7. somente terceiro.
- O ranking agora:
  - avalia cada aposta travada contra o pódio de referência;
  - ordena pela melhor categoria alcançada;
  - encontra a categoria mais alta com ganhadores;
  - divide o valor arrecadado igualmente apenas entre os ganhadores dessa categoria;
  - zera prêmio esperado de categorias inferiores enquanto houver ganhadores em categoria superior.
- A arrecadação do prêmio considera participantes pagos, não o perfil Super Admin.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Validação técnica das categorias retornou `1,2,3,4,5,6,7`.
- Browser em `/ranking` validado:
  - `Canarinho 10` aparece como `Categoria 1`;
  - demais apostas sem categoria aparecem como `Sem premiação`;
  - badge de pagos mostra `3 pagos`;
  - `overflowX`: `0`.

### Scroll da modal de regras - 2026-06-12

- Corrigido corte de texto na modal `Regras da Premiação`.
- `.live-rules-modal` passou a usar duas linhas de grid:
  - cabeçalho fixo;
  - corpo com `minmax(0, 1fr)`.
- `.live-rules-content` recebeu `min-height: 0`, `max-height: 100%`, `overflow-y: auto` e `overscroll-behavior: contain`.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser em `/aposta` validado após restart:
  - modal abre corretamente;
  - `contentScrollHeight`: `875`;
  - `contentClientHeight`: `594`;
  - `hasInternalScroll`: `true`;
  - `overflowY`: `auto`;
  - `overflowX`: `0`.

### CTA do grupo WhatsApp na Home - 2026-06-12

- Home recebeu link `Grupo WhatsApp` entre a marca `Bolão Copa 2026` e a saudação do usuário.
- O item fica alinhado à direita no topo da Home.
- Link externo:
  - `https://chat.whatsapp.com/F7mycs099hjFrz5Jn9uGq6?mode=gi_t`
- Implementado com ícone SVG inline, sem dependência nova.
- Link abre em nova aba com `rel="noopener noreferrer"`.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser em `/` validado após restart:
  - texto `Grupo WhatsApp`;
  - `href` correto;
  - `target="_blank"`;
  - ícone SVG presente;
  - elemento está entre marca e saudação;
  - `overflowX`: `0`.

### Correção de layout do card de ranking - 2026-06-12

- Corrigida sobreposição no card de ranking em mobile.
- O `RankingRow` agora organiza o conteúdo em linhas estáveis:
  - posição na coluna esquerda;
  - participante e categoria na primeira linha;
  - categoria de premiação e probabilidade na segunda linha;
  - barra de probabilidade na terceira linha.
- Textos longos como `Campeão, vice e terceiro` não competem mais com nickname/categoria.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Browser em `/ranking` validado após restart:
  - `prizeBelowPlayer`: `true`;
  - `meterBelowPrize`: `true`;
  - `overflowX`: `0`.

### Ranking probabilístico seguro - 2026-06-12

- Regra de produto reforçada: ranking probabilístico não pode exibir chute.
- `especificacao-bolao-copa-2026-v1.md` atualizada:
  - 7 categorias oficiais de premiação;
  - probabilidade não pode ser decorativa;
  - categorias impossíveis por eliminação ou resultado oficial devem ir para 0%;
  - apostas ainda possíveis devem sempre ter probabilidade numérica viva.
- `lib/mock/data.ts` passou a expor `calculateRankingEntries`.
- O motor atual:
  - avalia apostas travadas contra estados oficiais sincronizados disponíveis;
  - usa `team.status` para zerar categorias de times eliminados;
  - usa status `campeao`, `vice` e `terceiro` para confirmar categorias em 100%;
  - calcula probabilidade numérica por força atual dos times, pontos, saldo, gols, ranking FIFA e status no torneio.
- `RankingRow` exibe percentuais com até 2 casas decimais para não transformar probabilidades baixas em `0%`.
- `/ranking` ganhou botão `Atualizar`, que recalcula o ranking sobre a base local atual e atualiza o timestamp do snapshot.
- Limite explícito: atualização real-time com dados oficiais depende do adapter externo + persistência Supabase + Realtime; esta etapa mantém backend mockado.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Validações técnicas:
  - aposta exata com pódio oficial completo retorna `probability: 1`;
  - aposta sem categoria possível por eliminação retorna `probability: 0`;
  - cenário atual retorna percentuais vivos `0,13%`, `0,13%` e `0,11%`.
- Browser em `/ranking` validado após restart:
  - botão `Atualizar` presente;
  - clique recalcula snapshot e atualiza timestamp;
  - não aparece `Em aberto`;
  - ranking renderiza percentuais vivos com decimais;
  - `overflowX`: `0`.

### Snapshot server-side do ranking - 2026-06-12

- Criada rota `GET /api/ranking/snapshot`.
- A rota recalcula o ranking no servidor com:
  - `calculateRankingEntries`;
  - apostas travadas mockadas;
  - times/resultados mockados;
  - arrecadação atual.
- `/ranking` deixou de recalcular diretamente no cliente ao clicar em `Atualizar`.
- O botão `Atualizar` agora chama `/api/ranking/snapshot`, atualiza entries e timestamp, e exibe status de origem.
- Esta fronteira prepara a próxima etapa:
  - substituir `source: "mock-local"` por adapter de resultados oficiais + Supabase;
  - manter a UI desacoplada da fonte de dados.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Build listou `ƒ /api/ranking/snapshot`.
- Smoke HTTP em `/api/ranking/snapshot` retornou:
  - 3 entradas;
  - `source: "mock-local"`;
  - probabilidades numéricas.
- Browser em `/ranking` validado:
  - botão `Atualizar` presente;
  - clique troca status para `Recalculado com base local.`;
  - timestamp atualizado;
  - ranking preserva `0,13%`, `0,13%`, `0,11%`;
  - `overflowX`: `0`.

### Adapter World Cup 2026 - 2026-06-12

- Criada interface `WorldCupAdapter` com:
  - `syncTeams()`;
  - `syncMatches()`;
  - `syncStandings()`;
  - `syncResults()`.
- Criado `mockWorldCupAdapter` como fallback padrão.
- Criado `WorldCup2026Adapter` para o provider externo `worldcup26.ir`.
- Provider real fica desligado por padrão e só entra com:
  - `WORLDCUP_PROVIDER=worldcup2026`;
  - `WORLDCUP2026_API_BASE_URL=https://worldcup26.ir`.
- `getWorldCupAdapter()` centraliza a seleção do provider.
- `/api/ranking/snapshot` passou a consultar o adapter e tem fallback automático para `mock-local` em caso de erro externo.
- `docs/setup-local.md` documenta as envs opcionais do provider.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Build manteve `ƒ /api/ranking/snapshot`.
- Smoke HTTP em `/api/ranking/snapshot` retornou:
  - `source: "mock-local"`;
  - `resultsCount: 2`;
  - `fallbackFrom: null`;
  - `fallbackReason: null`.
- Nenhuma criação/configuração de Supabase, Git remoto ou Vercel foi iniciada nesta etapa.

### Camada local de dados do app - 2026-06-12

Objetivo: preparar a troca futura para Supabase sem abrir gate externo, removendo ações isoladas em estado puramente local de tela.

- Criada camada `lib/app-data/`:
  - `types.ts` com contratos de pagamento, abertura de apostas e envio de aposta;
  - `mock-repository.ts` com estado local em memória para perfis, comprovantes, apostas e configurações;
  - `index.ts` como ponto único de import.
- Criadas rotas server-side mockadas:
  - `PATCH /api/mock/payments/[receiptId]`;
  - `GET/PATCH /api/mock/settings/bets`;
  - `POST /api/mock/bets`.
- `/admin/pagamento` passou a carregar comprovantes via `lib/app-data` e aprovar/recusar usando `/api/mock/payments/[receiptId]`.
- `/admin/finalizar` foi dividido em server/client e passou a abrir/fechar apostas usando `/api/mock/settings/bets`.
- `/aposta` passou a carregar a aposta via `lib/app-data`, times via `WorldCupAdapter` e confirmar apostas usando `/api/mock/bets`.
- Rotas que dependem de estado local server-side foram marcadas como dinâmicas:
  - `/admin/pagamento`;
  - `/admin/finalizar`;
  - `/aposta`.
- Tipagem de auditoria passou a aceitar ações administrativas de pagamento:
  - `payment_approved`;
  - `payment_rejected`.
- Gate externo preservado:
  - nenhuma migration;
  - nenhum SQL remoto;
  - nenhum projeto Supabase criado/configurado;
  - nenhum Git remoto ou Vercel iniciado.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Build listou como dinâmicas:
  - `ƒ /admin/finalizar`;
  - `ƒ /admin/pagamento`;
  - `ƒ /aposta`;
  - `ƒ /api/mock/bets`;
  - `ƒ /api/mock/payments/[receiptId]`;
  - `ƒ /api/mock/settings/bets`.
- Smokes HTTP locais:
  - `GET /api/mock/settings/bets` retornou configurações;
  - `PATCH /api/mock/settings/bets` alterou abertura e registrou auditoria;
  - `PATCH /api/mock/payments/receipt-awaiting` aprovou pagamento e recalculou resumo;
  - `POST /api/mock/bets` criou aposta travada para participante sem aposta anterior.
- Browser local após restart:
  - login Super Admin via `/auth` navega para `/admin`;
  - `/admin/pagamento` aprova Aline Valida via UI, mostra `Aline Gol aprovado.` e badge `0 aguardando`;
  - `/admin/finalizar` fecha apostas, mostra `Palpites encerrados`, `Reabrir apostas` e auditoria;
  - `/aposta` mantém aposta existente travada, com edição e confirmação desativadas;
  - console sem erros/warnings nos fluxos testados.

QA read-only:

- Kierkegaard (`019ebd79-6375-72a1-8b66-b62eced07fb9`) revisou o corte sem editar arquivos.
- Achados incorporados:
  - `POST /api/mock/bets` agora bloqueia envio quando `betsOpen=false`;
  - `POST /api/mock/bets` valida perfil participante, pagamento aprovado, duplicidade e existência dos times;
  - `/aposta` recebe `betsOpen` e desativa edição/confirmação quando palpites estão encerrados e não há aposta travada;
  - botões do modal de comprovante em `/admin/pagamento` ficam desativados durante a request para evitar duplo clique.
- Smokes adicionais:
  - fechar apostas via `PATCH /api/mock/settings/bets` retornou sucesso;
  - envio de aposta com apostas fechadas retornou `403` e `bets_closed`;
  - envio de aposta com time inexistente retornou `409` e `team_not_found`;
  - envio de aposta válida para participante aprovado sem aposta anterior retornou aposta `locked=true`.

### Jogos e Times via adapter - 2026-06-12

- `/jogos` deixou de consumir `matches`, `matchesByStage` e `getTeamById` diretamente de `lib/mock`.
- `/jogos` agora consulta `getWorldCupAdapter()` e sincroniza em paralelo:
  - `syncMatches()`;
  - `syncTeams()`;
  - `searchParams`.
- A tela monta localmente:
  - mapa de times por id;
  - agrupamento de partidas por fase;
  - contagem das abas de fase.
- `/times` deixou de consumir `teams` diretamente de `lib/mock`.
- `/times` agora consulta `getWorldCupAdapter().syncTeams()` no server component e mantém o `TimesClient` recebendo dados por props.
- Nenhum gate externo foi aberto:
  - Supabase remoto não configurado;
  - Git remoto não configurado;
  - Vercel não configurado.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Build listou:
  - `ƒ /jogos`;
  - `○ /times`.
- Browser em `/jogos` validado:
  - console sem erros/warnings;
  - abas de fase renderizadas;
  - navegação para `/jogos?fase=final` funcional;
  - card da final renderiza Brasil x Espanha.
- Browser em `/times` validado:
  - console sem erros/warnings;
  - lista de seleções renderizada;
  - busca por digitação real filtra para `Brasil`;
  - contador muda para `1 times`.

### Fallback JSON de dados da Copa - 2026-06-12

- Criado `data/worldcup/fallback.json` como fonte local versionada para times e jogos.
- `mockWorldCupAdapter` deixou de ler diretamente de `lib/mock/data.ts` para dados da Copa e passou a usar o fallback JSON.
- O fallback contém:
  - 12 times;
  - 9 jogos;
  - status de partidas;
  - estatísticas usadas no ranking probabilístico.
- Mantido contrato do adapter:
  - `syncTeams()`;
  - `syncMatches()`;
  - `syncStandings()`;
  - `syncResults()`.

Evidências:

- `npm run lint` aprovado.
- `npm run build` aprovado.
- Smoke HTTP em `/api/ranking/snapshot` retornou:
  - 3 entradas;
  - `source: "mock-local"`;
  - `resultsCount: 2`;
  - `fallbackFrom: null`;
  - `fallbackReason: null`.
- Nenhuma criação/configuração de Supabase, Git remoto ou Vercel foi iniciada nesta etapa.
