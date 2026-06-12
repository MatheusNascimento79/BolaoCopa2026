# Checklist - Bolão Copa 2026

Data: 2026-06-11
Base: `especificacao-bolao-copa-2026-v1.md`
Status: checklist inicial registrado

## Checklist de governanca do AGENT.md

- [x] Ler arquivo de instrucoes do agente.
- [x] Identificar que o arquivo presente é `AGENT.md`, não `AGENTS.md`.
- [x] Verificar existencia de `directives/`.
- [x] Verificar existencia de `execution/`.
- [x] Verificar arquivos existentes do workspace.
- [x] Ler especificacao principal.
- [x] Registrar roadmap.
- [x] Registrar checklist.
- [x] Criar diretivas somente com aprovação explícita.
- [ ] Criar scripts em `execution/` somente quando houver tarefa deterministica clara.
- [ ] Manter intermediarios em `.tmp/` quando houver processamento.

## Checklist de diretivas

- [x] Criar diretiva Sprint 0 + Sprint 1.
- [x] Aprovar execução da diretiva Sprint 0 + Sprint 1.
- [x] Criar diretiva Sprint UI Viva 1.
- [ ] Registrar diretiva da Sprint 2 antes de cadastro/pagamento/comprovantes.
- [ ] Registrar diretiva da Sprint 3 antes de painel Super Admin.

## Checklist de decisões antes do scaffold

- [x] Confirmar uso de Next.js.
- [ ] Confirmar uso de Vercel Hobby/free.
- [x] Confirmar uso de Supabase Auth/Postgres/Storage/Realtime.
- [ ] Confirmar Claude API para comprovante e ranking probabilístico.
- [ ] Confirmar provider inicial `rezarahiminia/worldcup2026`.
- [ ] Confirmar estrategia de PWA.
- [ ] Confirmar se o apelido deve ser unico.
- [ ] Confirmar regra de troca de comprovante em status `aguardando`.
- [ ] Confirmar mensagem de rejeicao fixa ou editavel.
- [ ] Confirmar se havera data limite alem do fechamento manual.

## Checklist de segurança obrigatória

- [ ] RLS ativado em tabelas sensiveis.
- [ ] Participante so acessa os proprios dados privados.
- [ ] Ranking público usa apelido, não e-mail ou nome verdadeiro.
- [ ] Bucket de comprovantes privado.
- [ ] Comprovantes acessados pelo Admin via URL assinada temporaria.
- [ ] Service role key nunca enviada ao navegador.
- [ ] Claude API key somente server-side.
- [ ] Senhas nunca salvas em tabela propria.
- [ ] Upload validado por tipo e tamanho.
- [ ] Rotas admin protegidas no servidor.
- [ ] Service worker sem cache de respostas autenticadas ou dados privados.

## Checklist funcional por fase

- [ ] Auth e perfis.
- [ ] Gate por pagamento.
- [ ] Cadastro de participante.
- [ ] Link externo NuBank.
- [ ] Upload privado de comprovante.
- [ ] Identificacao auxiliar por Claude/OCR.
- [ ] Tela de aguardando validação.
- [ ] Painel Super Admin de pagamentos.
- [ ] Aprovar pagamento.
- [ ] Rejeitar pagamento.
- [ ] Controle abrir/fechar apostas.
- [ ] Auditoria de acoes administrativas.
- [ ] Adapter de times/jogos.
- [ ] Fallback por CSV/JSON.
- [ ] Tela de jogos por fase.
- [ ] Tela de times.
- [ ] Aposta única e imutável.
- [ ] Calculo de arrecadacao.
- [ ] Visual do bau animado.
- [ ] Motor determinístico de premiação.
- [ ] Ranking probabilístico por snapshot.
- [ ] Realtime.
- [ ] PWA.
- [ ] QA mobile.

## Checklist de aceite final

- [ ] Usuário cria conta e envia comprovante quando apostas estão abertas.
- [ ] Login mostra `[Palpites encerrados]` quando apostas estão fechadas.
- [ ] Usuário sem pagamento aprovado não acessa app completo.
- [ ] Super Admin aprova ou rejeita comprovantes.
- [ ] Arrecadação considera apenas usuários pagos.
- [ ] Participante pago salva aposta e não consegue editar depois.
- [ ] Jogos aparecem por fase e toleram atualizacao.
- [ ] Times aparecem com informacoes pertinentes.
- [ ] Ranking exibe colocacao, apelido, premio previsto e premio enquadrado.
- [ ] Premiacao final segue a regra mais alta com ganhadores.
- [ ] Fluxos principais funcionam em smartphone.
- [ ] PWA pode ser instalado.
- [ ] Nenhum segredo aparece no cliente, repo ou logs.

## Checklist tecnico Sprint 0 + preparacao Sprint 1

- [x] Scaffold Next.js criado.
- [x] TypeScript configurado.
- [x] ESLint CLI configurado.
- [x] `.env.example` criado sem segredos reais.
- [x] Supabase client browser criado.
- [x] Supabase client server criado.
- [x] Proxy de sessao Supabase criado com `getClaims()`.
- [x] Migration inicial de `profiles`, `app_settings` e `admin_audit_logs` criada localmente.
- [x] RLS inicial escrito localmente.
- [x] Telas mobile-first placeholder criadas com referencia visual de `UI/`.
- [x] `npm run lint` aprovado.
- [x] `npm run build` aprovado.
- [x] Browser interno validou renderizacao da home.
- [x] Browser interno validou viewport mobile basico.
- [ ] Migration aplicada em Supabase aprovado.
- [ ] RLS validado em ambiente Supabase com usuários reais de teste.
