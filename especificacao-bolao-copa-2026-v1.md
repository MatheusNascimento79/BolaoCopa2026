# Especificacao DEV - Bolao Copa 2026

Versao: v1  
Data: 2026-06-11  
Status: pronto para refinamento tecnico pelo DEV

## 1. Objetivo

Construir uma aplicacao responsiva, mobile-first, chamada **Bolao Copa 2026**, para cadastro pago de participantes, registro imutavel de apostas sobre campeao/vice/terceiro colocado da Copa do Mundo FIFA 2026, acompanhamento da tabela de jogos, ranking probabilistico e calculo de premiacao.

O app deve funcionar principalmente em smartphones, com UI inspirada nas cores da bandeira do Brasil: verde, amarelo, azul e branco.

## 2. Stack recomendada

| Camada | Escolha | Observacoes |
|---|---|---|
| Frontend/backend | Next.js em Vercel Hobby/free | Usar rotas server-side para segredos, Claude e sincronizacao de APIs externas. |
| Banco | Supabase Postgres | Fonte de verdade para usuarios, apostas, jogos, times, ranking e pagamentos. |
| Auth | Supabase Auth | Login por email/senha. Nao criar auth propria. |
| Arquivos | Supabase Storage | Comprovantes em bucket privado, acesso via URL assinada para Super Admin. |
| Realtime | Supabase Realtime | Atualizacoes em tempo real a partir de tabelas publicadas no Realtime. |
| LLM | Claude API | Usar somente no servidor para analise de comprovante e ranking probabilistico. |
| Dados da Copa | API esportiva externa por adapter | Nao acoplar o app diretamente a um unico fornecedor. Criar interface de provider. |

Nota importante: Vercel deve hospedar o app, mas nao deve ser usada como servidor WebSocket proprio. Para tempo real, usar Supabase Realtime.

## 3. Usuarios

| Usuario | Permissoes |
|---|---|
| Visitante | Acessa login e fluxo de cadastro quando os palpites estiverem abertos. |
| Participante pendente | Acessa cadastro e upload de comprovante; nao acessa o restante do app. |
| Participante aguardando | Ja enviou comprovante; ve status aguardando validacao; nao acessa o app completo. |
| Participante pago | Acessa app completo, jogos, times, apostas, ranking e arrecadacao. |
| Super Admin | Acessa tudo e tambem a area `[Pagamento]` para validar recebimentos e `[Finalizar Apostas]` para abrir/fechar cadastros e palpites. |

Super Admin inicial: `matheusan@gmail.com`.

A senha inicial deve ser configurada com seguranca no Supabase Auth ou via processo manual de criacao de usuario. Nao hardcodar senha no codigo, banco, seed publico, logs ou repositorio.

## 4. Regras de acesso

| Status pagamento | O que pode acessar |
|---|---|
| `pendente` | Login/cadastro e tela de upload de comprovante. |
| `aguardando` | Tela de status aguardando validacao. Pode reenviar comprovante se permitido pelo Admin. |
| `pago` | App completo. |

Qualquer rota privada deve validar status no servidor ou por RLS, nao apenas esconder itens no frontend.

## 5. Fluxos principais

### 5.1 Login

1. Usuario informa email e senha.
2. Sistema autentica via Supabase Auth.
3. Sistema consulta perfil/pagamento.
4. A tela de login deve exibir um botao secundario:
   - Se apostas/cadastros estiverem abertos: `[Quero participar]`.
   - Se apostas/cadastros estiverem fechados: `[Palpites encerrados]`, desabilitado ou sem fluxo de cadastro.
5. Redireciona:
   - `pago`: dashboard do app.
   - `aguardando`: tela de aguardando validacao.
   - `pendente`: tela de upload de comprovante.
   - Super Admin: dashboard com itens adicionais `[Pagamento]` e `[Finalizar Apostas]`.

### 5.2 Quero participar

Campos:

- Nome verdadeiro.
- Apelido.
- Email.
- Repetir email.
- Senha.
- Repetir senha.
- Botao `[Pagar Agora]`.
- Upload de comprovante de pagamento Pix de R$ 50,00.

Botao `[Pagar Agora]`:

- Deve abrir o link de pagamento NuBank:
  `https://nubank.com.br/cobrar/12wih4/6a2b139e-244a-4a4c-a02e-852654ee183c`
- O pagamento e fixo em R$ 50,00.
- O app nao deve criar valor dinamico nem link Pix proprio nesta versao.

Validacoes:

- Nome verdadeiro obrigatorio.
- Apelido obrigatorio e usado como nome publico no ranking.
- Emails devem ser iguais.
- Senhas devem ser iguais.
- Senha deve atender minimo de seguranca definido pelo DEV.
- Upload deve aceitar imagem ou PDF.
- Comprovante deve ser armazenado em bucket privado.
- Se os palpites estiverem encerrados, o cadastro nao deve ser aceito.

### 5.3 Identificacao automatica do comprovante

Depois do upload:

1. Backend envia o comprovante para extracao/analise via Claude ou OCR + Claude.
2. Sistema tenta identificar:
   - Valor: R$ 50,00.
   - Beneficiario/link esperado, quando legivel no comprovante NuBank.
   - Data/hora do pagamento, se disponivel.
   - Nome/pagador, se disponivel.
   - Grau de confianca.
3. Sistema mostra ao usuario uma tela de confirmacao:
   - valor identificado;
   - beneficiario identificado;
   - aviso de que o acesso so sera liberado apos validacao do Super Admin.
4. Ao confirmar, status fica `aguardando`.

Regra critica: a identificacao automatica nao libera acesso sozinha. A liberacao depende da validacao manual do Super Admin.

### 5.4 Validacao Super Admin - Pagamento

Area visivel somente para Super Admin: `[Pagamento]`.

Lista de participantes:

| Campo | Descricao |
|---|---|
| Nome verdadeiro/apelido/email | Identificacao do participante. |
| Status | `Pago`, `Pendente` ou `Aguardando`. |
| Valor detectado | Valor identificado no comprovante. |
| Beneficiario detectado | Beneficiario identificado. |
| Data de envio | Timestamp do upload. |
| Acoes | Ver comprovante, marcar recebido, rejeitar. |

Status:

- `Pendente`: cadastrou, mas nao enviou comprovante.
- `Aguardando`: enviou comprovante, falta confirmacao manual.
- `Pago`: Super Admin confirmou recebimento.
- `Rejeitado`: Super Admin rejeitou o comprovante.

Quando status for `Aguardando`, exibir botoes `[Recebido]` e `[Rejeitar]`.

Ao clicar `[Recebido]`:

1. Confirmar acao em modal.
2. Gravar `payment_status = pago`.
3. Gravar `approved_by`, `approved_at`.
4. Liberar acesso completo ao participante.
5. Atualizar valor total arrecadado.

Ao clicar `[Rejeitar]`:

1. Confirmar acao em modal.
2. Gravar status do comprovante como `rejeitado`.
3. Retornar `payment_status` do participante para `pendente`.
4. Exibir ao usuario a mensagem: "Pagamento nao recebido. Reenvie novo comprovante ou efetue o pagamento."
5. Permitir novo upload de comprovante.

### 5.5 Controle Super Admin - Finalizar Apostas

O Super Admin deve ter um botao/acao `[Finalizar Apostas]`.

Comportamento:

- Quando as apostas estiverem abertas, o botao deve permitir finalizar/fechar.
- Quando estiverem fechadas, o Super Admin deve conseguir reabrir.
- Deve ser possivel abrir e fechar apostas quantas vezes o Super Admin quiser.
- Ao fechar apostas:
  - substituir o botao `[Quero participar]` por `[Palpites encerrados]` na tela de login;
  - bloquear novos cadastros;
  - bloquear envio de novas apostas;
  - manter acesso normal para participantes ja pagos consultarem app/ranking/jogos.
- Ao reabrir apostas:
  - voltar a exibir `[Quero participar]`;
  - permitir novos cadastros;
  - permitir apostas de participantes pagos que ainda nao salvaram aposta.

Auditoria obrigatoria:

- Registrar quem abriu/fechou.
- Registrar data/hora.
- Registrar estado anterior e novo estado.

## 6. Dashboard e navegacao

Navegacao mobile recomendada:

- Inicio.
- Jogos.
- Times.
- Aposta.
- Ranking.
- Pagamento, somente Super Admin.

Evitar layouts largos e tabelas impossiveis no celular. Usar cards, filtros e abas.

## 7. Valor total arrecadado

Exibir valor total arrecadado em reais, calculado como:

`quantidade de participantes com status pago * R$ 50,00`

Visual:

- Bau verde e amarelo animado.
- Moedas saindo para fora em loop.
- Sensacao de bau quase explodindo.
- Balao de conversa acima do bau com o valor: `R$ X.XXX,XX`.

Requisito tecnico:

- A animacao deve ser leve para smartphone.
- Preferir CSS/Lottie/asset animado otimizado.
- Nao bloquear renderizacao inicial.

## 8. Jogos e organograma da Copa

### 8.1 Organograma grafico fase a fase

Exibir a tabela de jogos por fase:

- Fase de grupos.
- 32 avos/round of 32, se aplicavel ao formato oficial.
- Oitavas.
- Quartas.
- Semifinais.
- Disputa de terceiro lugar.
- Final.

Cada jogo deve mostrar:

- Fase.
- Grupo, quando aplicavel.
- Data/hora.
- Estadio/cidade, se a API fornecer.
- Time A.
- Time B.
- Placar.
- Status: agendado, ao vivo, encerrado, adiado/cancelado.

O organograma deve atualizar automaticamente quando resultados forem sincronizados.

### 8.2 Tabela de times

Listar todos os times da Copa a partir da API/dados sincronizados.

Campos pertinentes:

- Nome.
- Bandeira.
- Grupo.
- Confederacao.
- Ranking FIFA, se disponivel.
- Tecnico, se disponivel.
- Jogos, vitorias, empates, derrotas.
- Gols pro, gols contra, saldo.
- Pontos.
- Status no torneio: ativo, eliminado, campeao, vice, terceiro.

## 9. Apostas

Cada participante pago deve fazer exatamente uma aposta:

- Campeao.
- Vice-campeao.
- Terceiro colocado.

Regras:

- Lista de selecoes deve ser dinamica, vinda da tabela de times.
- O mesmo time nao pode ser selecionado em mais de uma posicao.
- O participante so pode apostar se estiver pago e se as apostas estiverem abertas.
- Antes de salvar, mostrar tela de confirmacao com a aposta completa.
- Depois de salvar, a aposta nao pode mais ser editada.
- Registrar `submitted_at`.
- Se o Super Admin reabrir apostas, isso nao torna editaveis apostas ja salvas; a reabertura so permite novos cadastros e novas apostas de quem ainda nao apostou.

Tela pos-salvamento:

- Mostrar aposta feita.
- Mostrar aviso: "Aposta salva. Nao sera possivel editar."

## 10. Ranking probabilistico

Objetivo: rankear participantes conforme probabilidade estimada de acerto acompanhando os resultados oficiais/sincronizados.

Campos exibidos no ranking:

- Colocacao.
- Nome: usar o apelido do participante.
- Premio previsto.
- Premio enquadrado.

Recomendacao:

- Usar Claude para gerar explicacao e probabilidade, mas nao deixar a premiacao final depender de texto livre do LLM.
- Criar um motor deterministico para avaliar qual regra de premiacao cada aposta atende conforme resultados reais.
- Usar LLM para probabilidade durante o torneio somente com saida estruturada JSON, armazenamento de snapshot e validacao deterministica.
- Nao exibir probabilidade inventada ou decorativa. O ranking deve calcular uma probabilidade viva para cada aposta com base em resultados sincronizados, status dos times e modelo matematico versionado.
- Quando um time escolhido pelo usuario estiver eliminado ou matematicamente impossibilitado de ocupar uma posicao, a probabilidade das categorias dependentes dessa posicao deve ser 0%.
- Em caso de empate na probabilidade, os participantes empatados devem aparecer com a mesma probabilidade de vencer; nao ha criterio adicional de desempate nesta versao.

Exemplo de campos internos do ranking:

- `probability_score`.
- `expected_tier`.
- `expected_prize`.
- `llm_reasoning_summary`.
- `ranking_snapshot_at`.

## 11. Regras de premiacao

Ordem de enquadramento:

1. Acertar campeao, vice e terceiro.
2. Acertar campeao e vice.
3. Acertar campeao e terceiro.
4. Acertar somente campeao.
5. Acertar somente vice e terceiro.
6. Acertar somente vice.
7. Acertar somente terceiro.

Regra de distribuicao:

- O valor total arrecadado sera dividido igualmente entre os acertadores da regra mais alta que possuir pelo menos um ganhador.
- Se nao houver ganhador na regra 1, passa para regra 2.
- Se nao houver ganhador na regra 2, passa para regra 3, e assim por diante.
- Se nao houver ganhador em nenhuma regra, status deve ficar "sem ganhador definido" e Super Admin decide manualmente.

Exemplo:

- Total arrecadado: R$ 1.000,00.
- Ninguem acertou regra 1.
- 2 pessoas acertaram regra 2.
- Cada uma recebe R$ 500,00.

## 12. Modelo de dados sugerido

### `profiles`

| Campo | Tipo | Observacao |
|---|---|---|
| `id` | uuid | Mesmo id do Supabase Auth. |
| `email` | text | Unico. |
| `full_name` | text | Nome verdadeiro, visivel apenas ao proprio usuario e Super Admin. |
| `nickname` | text | Apelido publico usado no ranking. |
| `role` | enum | `participant`, `super_admin`. |
| `payment_status` | enum | `pendente`, `aguardando`, `pago`. Rejeicao retorna para `pendente`. |
| `created_at` | timestamptz | Criacao. |

### `payment_receipts`

| Campo | Tipo | Observacao |
|---|---|---|
| `id` | uuid | PK. |
| `user_id` | uuid | Dono do comprovante. |
| `storage_path` | text | Caminho no Supabase Storage. |
| `detected_amount_cents` | int | Valor extraido. |
| `detected_beneficiary` | text | Beneficiario extraido. |
| `detected_confidence` | numeric | 0 a 1. |
| `status` | enum | `pendente`, `aguardando`, `aprovado`, `rejeitado`. |
| `rejection_reason` | text | Motivo mostrado ao usuario quando rejeitado. |
| `approved_by` | uuid | Super Admin. |
| `approved_at` | timestamptz | Data de aprovacao. |
| `created_at` | timestamptz | Upload. |

### `teams`

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `external_id` | text |
| `name` | text |
| `flag_url` | text |
| `group_name` | text |
| `confederation` | text |
| `fifa_ranking` | int |
| `stats` | jsonb |
| `status` | text |

### `matches`

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `external_id` | text |
| `stage` | text |
| `group_name` | text |
| `home_team_id` | uuid |
| `away_team_id` | uuid |
| `home_score` | int |
| `away_score` | int |
| `status` | text |
| `kickoff_at` | timestamptz |
| `venue` | text |
| `raw_payload` | jsonb |

### `bets`

| Campo | Tipo | Observacao |
|---|---|---|
| `id` | uuid | PK. |
| `user_id` | uuid | Unico por usuario. |
| `champion_team_id` | uuid | Obrigatorio. |
| `runner_up_team_id` | uuid | Obrigatorio. |
| `third_place_team_id` | uuid | Obrigatorio. |
| `submitted_at` | timestamptz | Imutavel. |

### `app_settings`

| Campo | Tipo | Observacao |
|---|---|---|
| `key` | text | PK. Exemplo: `bets_open`. |
| `value` | jsonb | Exemplo: `{ "open": true }`. |
| `updated_by` | uuid | Super Admin que alterou. |
| `updated_at` | timestamptz | Data da alteracao. |

### `admin_audit_logs`

| Campo | Tipo | Observacao |
|---|---|---|
| `id` | uuid | PK. |
| `actor_id` | uuid | Super Admin. |
| `action` | text | Ex.: `bets_closed`, `bets_opened`, `payment_approved`, `payment_rejected`. |
| `target_user_id` | uuid | Usuario afetado, se houver. |
| `metadata` | jsonb | Estado anterior/novo, comprovante, observacoes. |
| `created_at` | timestamptz | Data da acao. |

### `ranking_snapshots`

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `generated_at` | timestamptz |
| `source_match_version` | text |
| `payload` | jsonb |

### `ranking_entries`

| Campo | Tipo |
|---|---|
| `id` | uuid |
| `snapshot_id` | uuid |
| `user_id` | uuid |
| `position` | int |
| `probability_score` | numeric |
| `expected_prize_cents` | int |
| `expected_tier` | int |
| `nickname` | text |

## 13. Integracoes

### 13.1 API de jogos da Copa

Fonte escolhida para esta versao:

- Repositorio/API: `rezarahiminia/worldcup2026`
- GitHub: `https://github.com/rezarahiminia/worldcup2026`
- Endpoint publico informado no README: `https://worldcup26.ir`

Escopo verificado do projeto:

- REST API em Node.js/Express com MongoDB.
- Dados para 48 times, 12 grupos, 104 jogos e 16 estadios.
- Arquivos CSV/JSON disponiveis no repositorio.
- Endpoints REST para jogos, grupos, times e estadios.

Criar adapter com interface:

- `syncTeams()`.
- `syncMatches()`.
- `syncStandings()`.
- `syncResults()`.

Requisitos:

- Salvar `external_id`.
- Salvar payload bruto em `raw_payload`.
- Ser idempotente: rodar duas vezes nao duplica dados.
- Permitir troca de fornecedor sem reescrever UI.
- Ter fallback manual via seed/import se a API ficar indisponivel ou cara.
- Nao herdar a autenticacao/JWT do repositorio `worldcup2026`; a autenticacao do Bolao deve continuar sendo Supabase Auth.
- Nao migrar a arquitetura para MongoDB; o banco oficial do Bolao permanece Supabase Postgres.
- Usar CSV/JSON do repositorio como fallback de seed caso o endpoint publico fique indisponivel.

### 13.2 Claude API

Usos:

1. Extracao/validacao auxiliar de comprovante.
2. Ranking probabilistico durante a Copa.

Regras:

- API key somente em variavel de ambiente server-side.
- Usar saida estruturada JSON.
- Registrar snapshots para auditoria.
- Nao expor raciocinio longo do modelo ao usuario.
- Nao usar LLM como autoridade final para liberar pagamento ou definir campeao real.

### 13.3 Pagamento NuBank

Pagamento fixo:

- Valor: R$ 50,00.
- Link: `https://nubank.com.br/cobrar/12wih4/6a2b139e-244a-4a4c-a02e-852654ee183c`.

Regras:

- Exibir botao `[Pagar Agora]` no fluxo de cadastro/upload.
- Abrir link em nova aba ou redirecionamento externo claro.
- O app nao recebe webhook do NuBank nesta versao.
- A comprovacao depende de upload de comprovante e validacao manual do Super Admin.

### 13.4 PWA

O app deve ser instalavel como PWA.

Requisitos:

- Manifest com nome `Bolao Copa 2026`.
- Icones em tamanhos adequados para Android/iOS.
- Tema visual com cores brasileiras.
- Service worker com cache seguro de assets estaticos.
- Nao cachear dados privados, comprovantes, ranking sensivel ou respostas autenticadas de usuario.
- Funcionar bem quando "adicionado a tela inicial" no smartphone.

## 14. Seguranca e privacidade

Requisitos obrigatorios:

- Ativar Row Level Security em tabelas sensiveis.
- Participante so pode ler e escrever seus proprios dados, exceto rankings publicos.
- Comprovantes ficam em bucket privado.
- Super Admin pode ver comprovantes por URL assinada temporaria.
- Service role key nunca deve ir para o navegador.
- Nao salvar senha em tabela propria.
- Nao logar imagens, PDFs ou dados completos do comprovante.
- Validar tipos e tamanhos de upload.
- Proteger rotas admin no servidor, nao apenas no menu.

## 15. Estados de erro e casos de borda

| Cenario | Comportamento esperado |
|---|---|
| Usuario cadastra sem comprovante | Status `pendente`; permanece na tela de upload. |
| Usuario tenta cadastrar com palpites fechados | Cadastro bloqueado; login mostra `[Palpites encerrados]`. |
| Upload ilegivel | Status pode ficar `aguardando`, mas com alerta para Admin revisar manualmente. |
| Valor detectado diferente de R$ 50,00 | Mostrar alerta ao usuario e ao Admin; nao liberar automaticamente. |
| Beneficiario diferente | Mostrar alerta ao usuario e ao Admin; nao liberar automaticamente. |
| Super Admin rejeita comprovante | Usuario volta para status `pendente` e ve mensagem de pagamento nao recebido. |
| Usuario tenta acessar app sem pagamento | Redirecionar para status/upload. |
| Usuario tenta editar aposta salva | Bloquear no backend e frontend. |
| Usuario tenta apostar com apostas fechadas | Bloquear no backend e frontend. |
| API de jogos falha | Manter ultimo snapshot e avisar que dados podem estar desatualizados. |
| Claude falha | Nao quebrar app; registrar pendencia para processamento posterior. |
| Dois admins aprovam ao mesmo tempo | Operacao idempotente; manter primeiro `approved_by/approved_at`. |

## 16. Requisitos nao funcionais

- Mobile-first.
- Carregamento inicial leve.
- Layout responsivo para 360px de largura.
- Acessibilidade basica: contraste, foco visivel, labels nos campos.
- Formatos monetarios em `pt-BR`.
- Datas e horarios em timezone local configurado.
- Ranking e jogos devem tolerar atualizacao em tempo real sem recarregar a pagina.
- Dados sensiveis protegidos por RLS e rotas server-side.
- PWA instalavel em smartphones.
- Nao cachear informacoes privadas no service worker.

## 17. Criterios de aceite

| Area | Criterio |
|---|---|
| Cadastro | Usuario consegue criar conta com nome verdadeiro, apelido, email/senha, pagar pelo link NuBank e enviar comprovante quando palpites estiverem abertos. |
| Palpites encerrados | Quando Super Admin fecha apostas, login mostra `[Palpites encerrados]` e novos cadastros/apostas sao bloqueados. |
| Validacao | Usuario sem pagamento aprovado nao acessa app completo. |
| Admin | Super Admin ve lista de pagamentos e consegue marcar `Aguardando` como `Pago` ou rejeitar comprovante. |
| Arrecadacao | Valor total reflete apenas usuarios pagos. |
| Aposta | Participante pago escolhe campeao, vice e terceiro e nao consegue editar apos salvar. |
| Jogos | App exibe jogos por fase e atualiza resultados sincronizados. |
| Times | App lista times com informacoes pertinentes. |
| Ranking | Ranking exibe colocacao, apelido, premio previsto e premio enquadrado. |
| Premio | Sistema calcula enquadramento final pela regra mais alta com ganhadores. |
| Mobile | Fluxos principais funcionam bem em smartphone. |
| PWA | App pode ser instalado/adicionado a tela inicial e nao vaza dados privados em cache. |
| Seguranca | Nenhum segredo aparece no cliente, repo ou logs. |

## 18. Recomendacoes de implementacao

1. Comecar por Auth, perfis, RLS e gate de pagamento.
2. Implementar upload privado de comprovante e painel Super Admin.
3. Implementar configuracao global `bets_open` e botao `[Finalizar Apostas]`.
4. Implementar times/jogos com adapter `rezarahiminia/worldcup2026` e seed inicial.
5. Implementar aposta imutavel.
6. Implementar arrecadacao e visual do bau.
7. Implementar ranking deterministico basico.
8. Adicionar Claude para comprovante e ranking probabilistico.
9. Ativar Realtime nas tabelas necessarias.
10. Implementar PWA.
11. Fazer QA mobile.

## 19. Decisoes fechadas nesta revisao

1. Ranking usa apelido, nao email nem nome verdadeiro.
2. O Super Admin pode abrir e fechar apostas/cadastros quantas vezes quiser.
3. Quando fechado, a tela de login mostra `[Palpites encerrados]`.
4. Super Admin pode rejeitar comprovante e usuario deve reenviar ou pagar novamente.
5. Empates no ranking probabilistico permanecem empatados, com mesma probabilidade.
6. Pagamento usa link fixo NuBank.
7. Fonte de dados da Copa: `rezarahiminia/worldcup2026`.
8. Valor do pagamento: fixo em R$ 50,00.
9. App deve ser PWA.

## 20. Questoes ainda em aberto

1. O apelido precisa ser unico?
2. O Super Admin tera tela para editar mensagem de rejeicao ou a mensagem sera fixa?
3. A reabertura de apostas permite cadastro ate qual data limite real, se houver?
4. O participante podera trocar comprovante enquanto estiver `aguardando` ou somente depois de rejeicao?

## 21. Fontes tecnicas consultadas

- Supabase Realtime Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Claude Messages API: https://platform.claude.com/docs/en/api/messages
- Claude tool use/structured workflows: https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview
- Vercel limits: https://vercel.com/docs/limits
- World Cup 2026 API repository: https://github.com/rezarahiminia/worldcup2026
