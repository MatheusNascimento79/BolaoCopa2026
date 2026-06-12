# Publicacao Vercel + Git - Bolao Copa 2026

Atualizado em: 2026-06-12 19:23:01 -03

## Objetivo

Preparar o projeto para publicacao controlada em Git e Vercel, mantendo gates explicitos antes de qualquer deploy publico.

## Gate 1 - Base local e primeiro commit

- [x] Remover segredos desnecessarios do template de ambiente.
- [x] Validar lint local.
- [x] Validar build local.
- [ ] Inicializar repositorio Git local.
- [ ] Criar primeiro commit local.
- [ ] Confirmar que `.env.local`, `.next` e `node_modules` nao entram no Git.

## Gate 2 - Repositorio remoto

- [ ] Confirmar nome do repositorio GitHub.
- [ ] Criar ou conectar remoto.
- [ ] Fazer push do branch principal.

## Gate 3 - Vercel

- [ ] Criar ou conectar projeto Vercel ao repositorio.
- [ ] Configurar variaveis de ambiente:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Configurar URL publica no Supabase Auth.
- [ ] Fazer deploy de producao aprovado.
- [ ] Rodar smoke test na URL publica.

## Observacoes

- O frontend usa apenas chave publica/publishable do Supabase.
- `service_role` ou secret key nao deve ser exposta em variaveis `NEXT_PUBLIC_`.
- Deploy de producao depende de aprovacao explicita.
