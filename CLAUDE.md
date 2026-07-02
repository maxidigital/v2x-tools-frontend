# `v2x-tools-frontend` — el converter público ("Web Tools")

> Doc por-servicio (se auto-carga al entrar). Lo transversal (arquitectura, refs, auth) vive en
> **`v2x-tools-docs/`** (`SYSTEM.md`, `ADDRESSING.md`, `AUTH.md`).

**Propósito**: la interfaz pública **"Web Tools"** de asn1click (en `v2x.tools`) — encode / decode / generate /
convert de mensajes V2X entre UPER, WER, XML, JSON. Es un **SPA estático** + un **reverse-proxy** (Caddy) que
da same-origin al resto de los servicios.
**Tecnología**: React 18 · Vite · TypeScript · Tailwind · Radix UI · CodeMirror (editores JSON/XML) · Caddy.

## Qué hace / qué NO hace
- ✅ UI del converter + `dev-console`; llama al **hub** (`/api/*`) para las operaciones; Caddy sirve el `dist`
  estático y proxya la API (same-origin → sin CORS).
- ❌ **NO** corre codecs ni parsea ASN.1 (eso es engine/repo vía el hub) · **NO** tiene backend propio.
  El account app (`app.asn1click.com`) es **otro** frontend (`v2x-tools-app`), no este.

## Rutas (Caddy — `Caddyfile`)
El proxy rutea por red **privada** de Railway (`<svc>.railway.internal`):
| Path | Va a |
|---|---|
| `/api/contact*` · `/api/access-stats*` · `/api/monitoring*` | `v2x-tools-backend` (legacy no-V2X) |
| `/api/auth/*` | `users:8095` (identidad; **antes** del `/api/*` genérico) |
| `/api/*` | `v2x-tools-hub:8080` (convert/generate/messages/aliases/modules) |
| resto | SPA estático (`dist`, fallback a `index.html`) |

## Parámetros / config (env vars)
| Variable | Para qué |
|---|---|
| `PORT` | Puerto que sirve Caddy (default 8080). |
| `VITE_API_BASE` / `VITE_API_TARGET` / `VITE_API_URL` | Base de la API (build-time; en prod same-origin `/api`). |
| `VITE_APP_URL` / `VITE_LANDING_URL` / `VITE_LOGIN_URL` | URLs de account app / landing / login (SSO, ver `AUTH.md`). |

## DB
Sin DB (es frontend + proxy).

## Deploy
Railway — push a `git@github.com:maxidigital/v2x-tools-frontend.git` (auto-deploy). Build: `npm run build`
(`tsc --noEmit && vite build`) → `dist` → `Dockerfile` (Caddy sirve `dist` + proxya). Dominio: `v2x.tools`.

## Gotchas
- El **orden en el Caddyfile importa**: `/api/auth/*` **antes** que `/api/*` (si no, auth cae al hub).
- Toolchain **userspace**: no hay Node/npm de sistema; usar el Node 20 de `~/.local` (exportar PATH).
- El SSO es por redirect top-level (cookie `sso` en el host de v2x.tools); ver `v2x-tools-docs/AUTH.md`.

## Ver también
`v2x-tools-docs/SYSTEM.md` · `ADDRESSING.md` · `AUTH.md` · `v2x-tools-hub/CLAUDE.md` (el backend que consume).
