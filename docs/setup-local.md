# Setup local - Bolão Copa 2026

## Requisitos

- Node.js compativel com Next.js 15.
- Projeto Supabase aprovado pelo usuário para testes.
- Variaveis copiadas de `.env.example` para `.env.local`.

## Variaveis

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
WORLDCUP_PROVIDER=
WORLDCUP2026_API_BASE_URL=
```

`SUPABASE_SECRET_KEY` não deve ser usada em componentes client-side nem exposta com prefixo `NEXT_PUBLIC_`.

`WORLDCUP_PROVIDER` é opcional. Quando vazio, o app usa o fallback local mockado. Para testar o adapter externo, use:

```text
WORLDCUP_PROVIDER=worldcup2026
WORLDCUP2026_API_BASE_URL=https://worldcup26.ir
```

Se o provider externo falhar, `/api/ranking/snapshot` volta para `mock-local` e informa `fallbackReason` na resposta.

## Comandos

```bash
npm install
npm run dev
npm run build
```

## Banco

A migration inicial está em `supabase/migrations/20260611190000_initial_auth_profiles_rls.sql`.

Nao aplique em projeto remoto sem gate explicito.
