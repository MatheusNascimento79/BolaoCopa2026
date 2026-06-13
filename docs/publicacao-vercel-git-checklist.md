# Publicacao Vercel + Git - Bolao Copa 2026

Atualizado em: 2026-06-13 09:49:44 -03

## Objetivo

Preparar o projeto para publicacao controlada em Git e Vercel, mantendo gates explicitos antes de qualquer deploy publico.

## Gate 1 - Base local e primeiro commit

- [x] Remover segredos desnecessarios do template de ambiente.
- [x] Validar lint local.
- [x] Validar build local.
- [x] Inicializar repositorio Git local.
- [x] Criar primeiro commit local.
- [x] Confirmar que `.env.local`, `.next`, `.tmp` e `node_modules` nao entram no Git.

## Gate 2 - Repositorio remoto

- [x] Confirmar nome do repositorio GitHub.
- [x] Criar ou conectar remoto.
- [x] Fazer push do branch principal.

## Gate 3 - Vercel

- [x] Criar ou conectar projeto Vercel ao repositorio.
- [x] Configurar variaveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [x] Configurar URL publica no Supabase Auth.
- [x] Fazer deploy de producao aprovado.
- [x] Rodar smoke test na URL publica.

## Observacoes

- GitHub: `MatheusNascimento79/BolaoCopa2026`.
- Vercel: `matheusnascimento79s-projects/bolao-copa-2026`.
- URL publica: `https://bolao-copa-2026-two-alpha.vercel.app`.
- Supabase Auth: URL publica configurada manualmente pelo usuario em 2026-06-13.
- Smoke test em 2026-06-13: `/auth` e `/cadastro` retornaram HTTP 200; `/` retornou HTTP 307 para `/login`, conforme protecao/redirect da rota inicial.
- O frontend usa apenas chave publica/publishable do Supabase.
- `service_role` ou secret key nao deve ser exposta em variaveis `NEXT_PUBLIC_`.
- Deploy de producao depende de aprovacao explicita.
