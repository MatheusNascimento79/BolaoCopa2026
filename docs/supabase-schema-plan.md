# Plano local de schema Supabase

Projeto: Bolao Copa 2026
Status: local, nao aplicado em projeto remoto
Data: 2026-06-12

## Escopo

Este documento acompanha as migrations locais em `supabase/migrations/` e registra o plano para a futura criacao/configuracao do Supabase real.

Nenhum SQL remoto foi aplicado nesta etapa.

## Migrations locais

- `20260611190000_initial_auth_profiles_rls.sql`
  - `profiles`;
  - `app_settings`;
  - `admin_audit_logs`;
  - RLS inicial.

- `20260612202000_core_domain_schema_rls.sql`
  - hardening da funcao de Super Admin para schema `private`;
  - helper privada `current_user_can_access_app()` para restringir dados do app a Super Admin ou participante pago;
  - `payment_receipts`;
  - `teams`;
  - `matches`;
  - `bets`;
  - `ranking_snapshots`;
  - `ranking_entries`;
  - view `public_ranking_entries` com campos minimos para exposicao de ranking;
  - RLS para dominio principal;
  - publicacao Realtime para jogos, times e ranking.

- `20260612203000_payment_receipt_decision_rpc.sql`
  - remove policy ampla de update administrativo direto em `payment_receipts`;
  - cria `private.decide_payment_receipt()` como funcao transacional idempotente;
  - cria wrapper publico `public.decide_payment_receipt()` sem `security definer`;
  - rejeita decisao nula ou diferente de `aprovado`/`rejeitado`;
  - aprova/rejeita comprovante somente quando status atual e `aguardando`;
  - mantem o primeiro `approved_by/approved_at` quando duas decisoes concorrem;
  - nao rebaixa perfil que ja tenha outro comprovante aprovado;
  - atualiza `profiles.payment_status`;
  - registra `admin_audit_logs` apenas quando a decisao muda o status.

- `20260612204000_payment_receipts_storage.sql`
  - cria/atualiza o bucket privado `payment-receipts`;
  - restringe tipos aceitos a PDF, JPEG, PNG e WebP;
  - limita cada arquivo a 10 MB;
  - permite que participante autenticado envie somente para a propria pasta `{auth.uid()}/...`;
  - vincula o objeto ao `owner_id` do usuario autenticado;
  - permite leitura/listagem do proprio participante e do Super Admin;
  - nao concede update/delete em objetos nesta etapa; reenvio deve criar novo objeto e novo registro de comprovante.

- `20260612205000_payment_receipt_storage_path_guard.sql`
  - impede que um comprovante fique `aguardando` ou `aprovado` sem `storage_path`;
  - garante no banco que a validacao administrativa sempre tenha um arquivo vinculado.

- `20260612212000_advisor_performance_indexes.sql`
  - adiciona indices para FKs apontadas pelos advisors de performance;
  - remove o indice duplicado `bets_user_id_idx`, mantendo o indice unico criado pela constraint `bets_user_id_key`;
  - nao altera RLS, dados, Auth ou Storage.

- `20260612213000_payment_receipt_awaiting_profile_sync.sql`
  - sincroniza `profiles.payment_status` para `aguardando` quando um comprovante e registrado nesse status;
  - evita rebaixar perfil que ja esteja `pago`;
  - permite que o fluxo de upload libere a tela de aguardando sem depender de update direto no perfil pelo frontend.

## Regras de seguranca preservadas

- Auth deve continuar sendo Supabase Auth.
- `service_role` nunca deve ir para o browser.
- Autorizacao nao deve depender de `user_metadata` editavel pelo usuario.
- RLS fica habilitado em todas as tabelas de `public`.
- Comprovantes devem ficar em bucket privado.
- Super Admin acessa comprovantes por rota server-side e URL assinada temporaria.
- Participante nao lista dados privados de outros participantes.
- Storage deve ser operado pela API do Supabase; migrations nao devem alterar o schema `storage`, apenas bucket e policies.
- Upload de comprovante nao deve usar upsert destrutivo na etapa atual.
- Comprovante em status `aguardando` ou `aprovado` deve ter `storage_path` preenchido.
- Registro de comprovante `aguardando` deve refletir `profiles.payment_status = 'aguardando'`, exceto para perfil ja pago.
- Tabelas de jogos, times e ranking ficam restritas a Super Admin ou participante pago.
- Ranking deve ser consumido preferencialmente pela view minima `public_ranking_entries` ou por rota server-side.
- Apostas sao imutaveis: nao ha policy de update/delete para participante.
- Decisao de comprovante deve passar por `public.decide_payment_receipt()`, que chama funcao privada com lock de linha.
- Schema `private` tem `usage` para `authenticated`, mas funcoes privilegiadas seguem fora do schema exposto e com `search_path` reduzido.
- Aposta nova exige:
  - usuario autenticado;
  - perfil participante;
  - pagamento aprovado;
  - apostas abertas em `app_settings`.

## Gaps antes do gate remoto

- Criar projeto Supabase real somente apos aprovacao explicita.
- Confirmar ref/organizacao do projeto antes de qualquer SQL.
- Rodar advisors de seguranca/performance antes de aplicar migration.
- Criar bucket privado para comprovantes em ambiente real a partir da migration versionada.
- Definir fluxo seguro de criacao do primeiro Super Admin sem senha hardcoded.
- Testar RLS com usuarios reais:
  - participante pendente;
  - participante aguardando;
  - participante pago;
  - Super Admin.
- Confirmar se tabelas publicas devem ficar expostas na Data API ou acessadas apenas por server routes.
- A partir do changelog Supabase de 2026-04-28, novas tabelas podem nao ser expostas automaticamente na Data API; confirmar grants/exposicao por ambiente antes de trocar o mock pelo Supabase real.
- Validar Realtime apenas para tabelas sem dados privados.
- Revisar o uso do wrapper `public.decide_payment_receipt()` na camada server-side antes de trocar o mock pelo Supabase real.
- Rodar advisors de seguranca/performance novamente apos aplicar a migration de performance.

## Gate para execucao remota

Antes de usar o plugin Supabase em projeto real:

1. Confirmar organizacao e projeto/ref.
2. Confirmar ambiente: desenvolvimento, staging ou producao.
3. Confirmar rollback esperado.
4. Aplicar primeiro em ambiente nao produtivo.
5. Executar post-checks read-only:
   - tabelas criadas;
   - RLS habilitado;
   - policies presentes;
   - bucket privado;
   - usuario participante nao acessa dados de outro;
   - Super Admin acessa areas administrativas.

## Fora desta etapa

- Criacao de projeto Supabase remoto.
- Aplicacao de SQL remoto.
- Criacao de bucket real.
- Auth real em producao.
- Deploy Vercel.
- Configuracao de Git remoto.
