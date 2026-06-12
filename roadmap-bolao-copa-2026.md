# Roadmap - Bolão Copa 2026

Data: 2026-06-11
Base: `especificacao-bolao-copa-2026-v1.md`
Status: planejamento inicial registrado

## Entendimento operacional

O produto é um app mobile-first/PWA para bolão pago da Copa 2026, com cadastro, pagamento via link NuBank, upload privado de comprovante, validação manual por Super Admin, aposta única e imutável, jogos/times sincronizados por adapter externo, ranking probabilístico com apoio de Claude e premiação final calculada por motor determinístico.

## Princípios de execução

- Usar Supabase Auth para autenticação.
- Usar Supabase Postgres como fonte de verdade.
- Proteger dados sensiveis com RLS e rotas server-side.
- Manter comprovantes em bucket privado.
- Nunca expor service role key, Claude API key, comprovantes ou segredos no cliente.
- Usar Claude apenas como apoio estruturado, nunca como autoridade final para pagamento ou premiação.
- Criar adapter para dados da Copa sem acoplar a UI a um fornecedor unico.
- Implementar app mobile-first antes de otimizar desktop.
- Registrar auditoria para acoes administrativas relevantes.

## Fase 0 - Fundacao do repositorio

Objetivo: preparar a estrutura minima do projeto sem implementar regra de negocio ainda.

Entregas:

- Confirmar stack final antes de scaffold.
- Criar estrutura de projeto aprovada.
- Criar diretivas somente após aprovação explícita.
- Criar scripts determinísticos em `execution/` somente quando houver tarefa repetível clara.
- Manter arquivos temporarios em `.tmp/`.

## Fase 1 - Auth, perfis e gate de pagamento

Objetivo: garantir que o acesso ao app completo dependa do status de pagamento.

Entregas:

- Supabase Auth por email/senha.
- Tabela `profiles`.
- Estados `pendente`, `aguardando`, `pago`.
- Super Admin inicial por configuracao segura.
- Middleware/rotas server-side validando acesso.
- RLS inicial.

## Fase 2 - Cadastro, pagamento e comprovantes

Objetivo: permitir entrada de participantes sem liberar acesso antes da validação manual.

Entregas:

- Fluxo `[Quero participar]`.
- Link fixo NuBank de R$ 50,00.
- Upload de imagem/PDF para bucket privado.
- Tela de confirmacao do comprovante identificado.
- Status `aguardando` apos confirmacao.
- Fallback seguro quando Claude/OCR falhar.

## Fase 3 - Painel Super Admin

Objetivo: validar pagamentos e controlar abertura/fechamento de apostas.

Entregas:

- Area `[Pagamento]`.
- Lista de participantes e comprovantes.
- URL assinada temporaria para comprovantes.
- Acoes `[Recebido]` e `[Rejeitar]`.
- Botao `[Finalizar Apostas]` com reabertura.
- Auditoria em `admin_audit_logs`.

## Fase 4 - Dados da Copa

Objetivo: popular jogos, times e resultados por adapter.

Entregas:

- Interface `syncTeams()`, `syncMatches()`, `syncStandings()`, `syncResults()`.
- Adapter para `rezarahiminia/worldcup2026`.
- Persistencia idempotente em Supabase.
- Fallback por CSV/JSON.
- UI mobile para jogos, fases e times.

## Fase 5 - Apostas

Objetivo: permitir que participante pago registre exatamente uma aposta.

Entregas:

- Seletores dinamicos de campeao, vice e terceiro.
- Bloqueio de times duplicados.
- Confirmacao antes de salvar.
- Imutabilidade no banco e na API.
- Bloqueio quando apostas estiverem fechadas.

## Fase 6 - Arrecadação e premiação

Objetivo: mostrar arrecadacao e calcular ganhadores com regras deterministicas.

Entregas:

- Total arrecadado baseado apenas em `payment_status = pago`.
- Visual do bau animado leve.
- Motor determinístico de enquadramento de prêmios.
- Estado `sem ganhador definido` quando nenhuma regra tiver ganhador.

## Fase 7 - Ranking probabilístico

Objetivo: exibir ranking durante a Copa sem depender de texto livre do LLM.

Entregas:

- Snapshots de ranking.
- Saida estruturada JSON do Claude.
- Campos `probability_score`, `expected_tier`, `expected_prize`.
- Empates preservados com mesma probabilidade.
- Explicacao curta sem raciocinio longo.

## Fase 8 - Realtime, PWA e QA mobile

Objetivo: finalizar experiencia mobile instalavel e segura.

Entregas:

- Supabase Realtime nas tabelas necessarias.
- Manifest PWA.
- Icones e tema visual.
- Service worker sem cache de dados privados.
- QA em largura minima de 360px.
- Validacao de acessibilidade basica.

## Questoes abertas para decisao

1. O apelido deve ser unico?
2. A mensagem de rejeição será fixa ou editável pelo Super Admin?
3. Havera data limite real para cadastro/apostas alem do controle manual?
4. Participante pode trocar comprovante enquanto estiver `aguardando` ou somente apos rejeicao?
5. O projeto deve ser iniciado como Next.js agora ou primeiro como especificação técnica detalhada?
