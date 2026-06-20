# Tele Member

Monorepo MVP for a Telegram community loyalty platform.

## Structure

- `apps/api`: Fastify API for bot and admin endpoints
- `apps/web`: Next.js + MUI mini app and admin UI
- `packages/shared`: Shared Zod schemas and types
- `supabase/migrations`: Supabase PostgreSQL schema

## P1 Scope

- Auto-create users from Telegram
- Point wallet and transaction ledger
- Daily check-in in `Asia/Ho_Chi_Minh`
- Basic admin panel
- Mini app dashboard, check-in, and wallet screens

## Notes

- Business logic is isolated behind shared schemas and API routes so it can move to VPS later without rewriting the core flow.
- Database access layer is intentionally left thin for the MVP and should be wired to Supabase client/server helpers next.

## Deploy Layout

- Render hosts `apps/api`
- Vercel hosts `apps/web`
- Root `pnpm dev` now starts only the API to avoid port conflicts in single-service environments like Render
