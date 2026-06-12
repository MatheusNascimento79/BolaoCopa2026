# Diretiva - Sprint 0 e Sprint 1

Projeto: Bolão Copa 2026
Data: 2026-06-11
Status: Sprint 0 executada; Sprint 1 parcialmente preparada em migration local

## Objetivo

Preparar a fundação técnica do app e implementar o primeiro eixo seguro: Auth, perfis, estados de pagamento, RLS inicial e gate de acesso por status.

Esta diretiva não autoriza deploy, SQL remoto, produção ou uso de credenciais reais. Todo trabalho deve ser local ou em ambiente explicitamente aprovado pelo usuário.

## Escopo

### Sprint 0 - Fundação do repositório

Entregas esperadas:

- Scaffold do app Next.js.
- Configuração TypeScript.
- Configuração de lint/build.
- Estrutura inicial de pastas.
- `.env.example` sem segredos reais.
- Cliente Supabase separado para browser/server.
- Layout mobile-first inicial baseado nas referências em `UI/`.
- Documentação mínima de setup local.

### Sprint 1 - Auth, perfis e RLS

Entregas esperadas:

- Modelagem inicial para:
  - `profiles`.
  - `app_settings`.
  - `admin_audit_logs`.
- Enums ou checks para:
  - `role`: `participant`, `super_admin`.
  - `payment_status`: `pendente`, `aguardando`, `pago`.
- Políticas RLS iniciais.
- Fluxo de login com Supabase Auth.
- Gate de acesso:
  - `pendente`: upload/status de pagamento.
  - `aguardando`: tela de aguardando validação.
  - `pago`: app completo.
  - `super_admin`: app completo + áreas administrativas.
- Super Admin inicial definido por processo seguro, sem senha hardcoded.

## Fora de escopo

- Deploy em Vercel.
- Criação de projeto Supabase remoto.
- Aplicação de SQL em banco remoto.
- Upload real de comprovantes.
- Claude API.
- Ranking probabilístico.
- Adapter da API da Copa.
- Realtime.
- PWA/service worker.
- Pagamento NuBank além de registrar o link fixo como constante futura.

## Entradas

- `AGENT.md`.
- `especificacao-bolao-copa-2026-v1.md`.
- Imagens em `UI/`.
- Decisões abertas ainda pendentes:
  - apelido único ou não;
  - mensagem de rejeição fixa ou editável;
  - troca de comprovante em `aguardando`;
  - data limite real além do fechamento manual;
  - navegação final entre spec e imagens.

## Referência visual

Usar as imagens em `UI/` como direção visual:

- Fundo escuro com atmosfera de estádio.
- Azul profundo como base.
- Dourado/amarelo para destaque.
- Verde para ação primária.
- Cards translúcidos com bordas suaves.
- Navegação inferior mobile.
- Prioridade para largura mínima de 360px.

As imagens são referência de estilo, não substituem regras de segurança, RLS ou contratos backend.

## Estrutura sugerida

```text
app/
  (auth)/
  (protected)/
  admin/
components/
features/
lib/
  supabase/
  auth/
  access/
supabase/
  migrations/
  seed/
public/
docs/
directives/
execution/
.tmp/
```

## Ferramentas e comandos esperados

Antes de executar qualquer comando de criação/scaffold, apresentar ao usuário:

- comando exato;
- arquivos/pastas que serão criados;
- dependências que serão instaladas;
- critério de sucesso;
- risco e rollback.

Comandos prováveis:

- `npx create-next-app@latest`
- `npm install`
- `npm run lint`
- `npm run build`

Se o comando exigir rede, pedir aprovação/escalonamento antes de prosseguir.

## Regras de segurança

- Nunca commitar segredos.
- Nunca criar senha inicial no código.
- Nunca expor service role key ao browser.
- Nunca depender apenas do frontend para proteger rota privada.
- RLS deve falhar fechado.
- Usuário participante não pode listar perfis privados de outros usuários.
- Ranking futuro deve usar apelido, não nome verdadeiro ou e-mail.
- `full_name` deve ser visível apenas ao próprio usuário e Super Admin.

## Políticas RLS iniciais esperadas

`profiles`:

- Usuário autenticado pode ler o próprio perfil.
- Usuário autenticado pode atualizar campos permitidos do próprio perfil, se aplicável.
- Super Admin pode ler perfis para validação administrativa.
- Usuário comum não pode alterar `role` nem `payment_status`.

`app_settings`:

- Leitura controlada para estado público necessário, como `bets_open`.
- Escrita somente Super Admin.

`admin_audit_logs`:

- Escrita por rotas server-side administrativas.
- Leitura somente Super Admin.

## Critérios de aceite

- App compila localmente.
- Nenhum segredo aparece no repo.
- `.env.example` existe com nomes de variáveis, sem valores reais.
- Login usa Supabase Auth.
- Rotas protegidas validam usuário no servidor.
- Usuário sem perfil/status adequado não acessa app completo.
- RLS inicial cobre tabelas sensíveis.
- Super Admin não depende de senha hardcoded.
- Layout inicial respeita mobile-first e referências visuais.

## Plano de teste

- Build local.
- Lint local.
- Teste manual de redirecionamento por status, quando ambiente Supabase estiver disponível.
- Revisão das migrations antes de qualquer aplicação remota.
- Verificação de que `NEXT_PUBLIC_*` não contém segredos.

## Rollback

Enquanto local:

- Reverter somente arquivos criados nesta sprint.
- Não tocar em specs originais sem pedido explícito.
- Não apagar `UI/`.
- Não apagar arquivos do usuário.

Se houver banco remoto futuramente:

- Preparar migration reversa antes de aplicar.
- Validar em ambiente de teste antes de produção.
- Não aplicar SQL remoto sem gate explícito.

## Checklist de saída da diretiva

- [x] Usuário aprovou scaffold.
- [x] Usuário aprovou instalação de dependências.
- [x] Scaffold criado.
- [x] `.env.example` criado.
- [x] Estrutura inicial criada.
- [x] Supabase client/server separados.
- [x] Migrations iniciais escritas.
- [x] RLS revisado.
- [x] Build local executado.
- [x] Lint local executado.
- [x] Pendências e decisões abertas registradas.

## Evidências do gate local

- `npm install` executado com sucesso.
- `npm run lint` executado com sucesso.
- `npm run build` executado com sucesso.
- Browser interno abriu `http://localhost:3000/` com título `Bolão Copa 2026`.
- Checagem mobile em viewport de 390px sem erro de console e sem overflow horizontal relevante.

## Pendências registradas

- Migration ainda não foi aplicada em projeto Supabase remoto.
- RLS ainda não foi validado com usuários reais/autenticados.
- `npm audit` reportou vulnerabilidade moderada transitiva em `postcss` via `next`; `npm audit fix --force` tentaria downgrade quebrador para `next@9.3.3`, portanto não foi aplicado.

## Expansão local de schema - 2026-06-12

Objetivo: preparar o domínio completo da Spec para Supabase sem aplicar SQL remoto.

- Criada migration local `supabase/migrations/20260612202000_core_domain_schema_rls.sql`.
- Cobertura adicionada:
  - `payment_receipts`;
  - `teams`;
  - `matches`;
  - `bets`;
  - `ranking_snapshots`;
  - `ranking_entries`;
  - view mínima `public_ranking_entries`;
  - policies RLS do domínio principal.
- Hardening aplicado:
  - helper de Super Admin migrada para schema privado `private`;
  - helper `private.current_user_can_access_app()` restringe dados do app a Super Admin ou participante pago;
  - jogos, times e ranking não ficam disponíveis para qualquer usuário apenas autenticado;
  - `bets` só aceita insert do próprio participante pago com apostas abertas;
  - apostas seguem imutáveis sem policy de update/delete para participante.
- Criado plano local `docs/supabase-schema-plan.md`.
- Criado script determinístico `execution/check_supabase_migrations.py` para auditar:
  - tabelas públicas sem RLS;
  - funções `security definer` expostas em `public` sem hardening posterior;
  - uso de metadata editável em autorização.
- Criada migration local `supabase/migrations/20260612203000_payment_receipt_decision_rpc.sql`.
- A decisão de pagamento agora tem desenho local idempotente:
  - remove update administrativo direto amplo em `payment_receipts`;
  - usa `private.decide_payment_receipt()` com `for update`;
  - expõe wrapper `public.decide_payment_receipt()` sem `security definer`;
  - rejeita decisão nula/inválida;
  - preserva o primeiro `approved_by/approved_at` em concorrência;
  - não rebaixa perfil já pago quando existir outro comprovante aprovado;
  - atualiza perfil e registra auditoria somente quando a decisão muda o status.
- Pauli (`019ebd8b-6b9c-7af2-a160-a37cd54bb9a3`) fez QA read-only do RPC; achados incorporados:
  - `p_decision is null`;
  - `grant usage on schema private to authenticated`;
  - `search_path` endurecido;
  - proteção contra downgrade por múltiplos comprovantes;

## Expansão local de Storage - 2026-06-12

Objetivo: preparar o armazenamento privado de comprovantes sem criar bucket remoto ou aplicar SQL fora do repo.

- Criada migration local `supabase/migrations/20260612204000_payment_receipts_storage.sql`.
- Criado/atualizado bucket `payment-receipts` como privado.
- Restrições locais do bucket:
  - limite de 10 MB por arquivo;
  - tipos aceitos: PDF, JPEG, PNG e WebP.
- Policies em `storage.objects`:
  - participante autenticado pode inserir apenas no próprio prefixo `{auth.uid()}/...`;
  - objeto precisa estar vinculado ao `owner_id` do usuário autenticado;
  - participante pode ler apenas objetos próprios;
  - Super Admin pode ler objetos para validação administrativa;
  - não há policy de `update` ou `delete` para comprovantes nesta etapa.
- Criada migration local `supabase/migrations/20260612205000_payment_receipt_storage_path_guard.sql`.
- Novo guardrail:
  - comprovante `aguardando` ou `aprovado` exige `storage_path` preenchido;
  - evita fila administrativa sem arquivo para validar.
- Boyle (`019ebd94-052c-7f70-b237-758b2c55d93c`) fez QA read-only de Storage/RLS; achados incorporados:
  - manter bucket privado;
  - filtrar todas as policies por `bucket_id`;
  - não criar acesso `anon`;
  - evitar upsert destrutivo;
  - exigir amarração entre status de validação e `storage_path`.
  - checker expandido para cobrir esses riscos.

Evidências locais:

- `python3 execution/check_supabase_migrations.py` aprovado.
- `PYTHONPYCACHEPREFIX=.tmp/pycache python3 -m py_compile execution/check_supabase_migrations.py` aprovado.
- `npm run lint` aprovado.
- `npm run build` aprovado.
- Huygens (`019ebd83-f318-7c90-95f7-6ec647256397`) fez QA read-only de SQL/RLS; achados incorporados.

Fora de escopo preservado:

- Nenhum projeto Supabase remoto criado.
- Nenhum SQL remoto aplicado.
- Nenhum bucket real criado.
- Nenhum deploy Vercel ou Git remoto iniciado.
