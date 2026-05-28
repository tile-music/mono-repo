# tile.music mono-repo

Self-hosted music listening history visualization system. Pulls play data from Spotify and Apple Music, enriches it via MusicBrainz, stores it in a self-hosted Supabase (PostgreSQL + auth), and visualizes it in a SvelteKit frontend.

## Architecture

```
mono-repo/
├── frontend/          # SvelteKit app (Node runtime)
├── data-acquisition/  # Deno service: polling, enrichment, job queue
├── lib/               # Shared TypeScript (no build step, imported directly)
└── supabase/          # Self-hosted Supabase (git submodule)
```

The shared `lib/` is consumed as a path alias in both runtimes — no compilation needed:
- Frontend: `$shared` → `../lib/` (svelte.config.js)
- Data-acquisition: `_shared/` → `../lib/` (deno.json)

## Running the stack

```bash
docker-compose up          # full dev stack (supabase, redis, frontend, data-acq, nginx)
docker-compose -f docker-compose-prod.yaml up  # production
```

Individual components (outside Docker):

```bash
cd frontend && npm run dev          # http://localhost:5173
cd data-acquisition && deno task start  # http://localhost:3001
```

## Frontend (`frontend/`)

- **SvelteKit 2 + Svelte 5**, Vite, TypeScript
- **Auth**: Supabase JS SDK + `@supabase/ssr`, jose for JWT
- **Validation**: zod

Key scripts:
```bash
npm run dev          # dev server (0.0.0.0:5173)
npm run build        # production build
npm run check        # svelte-check type checking
npm test             # Vitest unit tests
npm run coverage     # coverage report
npx playwright test  # E2E tests
npm run format       # Prettier
```

Routes live under `src/routes/`:
- `(app)/` — main app (studio, listening history, profile)
- `(account-creation)/` — login/register
- `oauth/` — Spotify and Apple Music OAuth callbacks
- `health/` — health check endpoint

## Data Acquisition (`data-acquisition/`)

- **Deno** runtime, TypeScript
- **BullMQ** (Redis-backed) for scheduled job processing
- **Express** for the HTTP server / health endpoint
- Integrates with: Spotify API, Apple Music API, MusicBrainz

Key tasks (deno.json):
```bash
deno task start   # start service (port 3001)
deno task test    # run tests
```

Entry point: `src/app.ts` — initializes the job queue and webserver.

## Shared Library (`lib/`)

Plain TypeScript, no build step. Key files:
- `schema.ts` — generated Supabase types (`Database`, `Tables<T>`, etc.)
- `musicbrainz.ts` — MusicBrainz API helpers
- `Song.ts` — shared song data model
- `Request.ts` — HTTP request types
- `log.ts` — logging utility

## Database (Supabase / PostgreSQL)

Schema defined in `supabase/docker/volumes/db/init/data.sql`. Generated types in `lib/schema.ts`.

Core tables:
- `albums` — source album records (Spotify/Apple Music)
- `tracks` — source track records, FK → albums
- `plays` — user play events with unix timestamp, FK → tracks + auth.users
- `mb_releases` — MusicBrainz release records
- `mb_album_releases` — album ↔ MusicBrainz release mapping
- `mb_track_recordings` — track ↔ MusicBrainz recording mapping
- `mb_album_art` — cover art URLs per release
- `profiles` — user profiles (username, theme, avatar)
- `connected_accounts` — OAuth tokens for `spotify` or `apple` providers

RLS is enabled on all tables. Only `service_role` can insert albums/tracks/plays; authenticated users manage their own profiles and connected accounts.

## Supporting services (Docker)

| Service | Purpose |
|---|---|
| supabase (db + auth) | PostgreSQL + JWT auth |
| redis | BullMQ job queue backing |
| nginx | Reverse proxy (ports 80/443) |
| kong | API gateway (via supabase compose) |
| lib-node / lib-deno | Base Docker images built from `Dockerfile.lib` |

## Environment

Secrets and env vars are configured via `env.sh` and `.env` files under `secrets/`. The `Dockerfile.lib` builds base images (`mdv-lib-node`, `mdv-lib-deno`) used by both the frontend and data-acquisition Dockerfiles.

MusicBrainz can optionally be run locally via the `musicbrainz-docker/` directory (commented out in the default compose).
