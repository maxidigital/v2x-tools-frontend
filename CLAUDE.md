# `v2x-tools-frontend` — cheat-sheet

> Quick-ref operativo (se auto-carga). **Arquitectura / decisiones →
> [`v2x-tools-docs/services/frontend/`](../v2x-tools-docs/services/frontend/README.md)**. Auth → `AUTH.md`. Este archivo: lo operativo.

**Qué es**: el **converter público "Web Tools"** (`v2x.tools`) — encode/decode/generate/convert. SPA estático +
Caddy (reverse-proxy same-origin). React 18 · Vite · TS · Caddy.

## Rutas (Caddy — el orden importa: auth antes de `/api/*`)
| Path | Va a |
|---|---|
| `/api/contact*` · `/api/access-stats*` · `/api/monitoring*` | `backend` (legacy) |
| `/api/auth/*` | `users:8095` |
| `/api/*` | `hub:8080` |
| resto | SPA (`dist`, fallback `index.html`) |

## Config / Build
- Env: `PORT` (8080), `VITE_API_*` (base API), `VITE_APP_URL`/`VITE_LANDING_URL`/`VITE_LOGIN_URL` (SSO). Sin DB.
- `npm run build` (`tsc --noEmit && vite build`) → `dist` → Dockerfile (Caddy). Push a `maxidigital/v2x-tools-frontend` → Railway. Dominio `v2x.tools`.

## Gotchas
- **Docs** = páginas estáticas en `public/doc/` (`index`, `web-tools`, `messages`, `mcp`, `api`, estilo común `doc.css`), servidas por Caddy en `/doc/`. Links absolutos (`/doc/…`): `/doc` sin barra también sirve el índice.
- **Orden del Caddyfile**: `/api/auth/*` **antes** que `/api/*` (si no, auth cae al hub).
- Node: el de sistema (`/usr/bin/node` v18) alcanza para este repo (build y vitest). No hay un Node 20 local (2026-11-24).
- SSO por redirect top-level (cookie `sso` en el host de v2x.tools). Ver `AUTH.md`.
