# Helix

AI agent cost and risk scanner.

Helix scans agent traces for duplicate model calls, bloated prompts, tool loops,
failed steps, and exposed credentials. It estimates avoidable LLM spend, redacts
supported secrets before storage, and returns a report with findings, a Helix
score, and a shareable roast card.

## What Helix finds

- Duplicate LLM calls, repeated prompt bloat, and oversized context
- Repeated tool calls, failed tools without retry, slow spans, and error tails
- OpenAI, AWS, GitHub, Slack, and Google API keys in trace data
- JWTs, bearer tokens, private keys, emails, phone numbers, and plain-http URLs

## Run

```bash
# terminal 1
cd api && uvicorn app.main:app --reload --port 8000

# terminal 2
bun dev
```

The FastAPI backend owns normalize, redact, analyze, score, and Supabase
storage — it is the only process holding the Supabase service-role key, and
all `roasts` reads and writes go through it. The TanStack Start frontend uses
Supabase directly for auth only (publishable key); its server functions
forward the session's access token to FastAPI, which validates it and derives
the user. Public report reads return a minimal card DTO — never the raw trace.

Endpoints: `POST /ingest` (token optional), `POST /ingest/batch` (token
required), `GET /roasts/{slug}` and `GET /roasts/recent` (public card DTOs),
`GET /me/roasts?batch_id=` (owner reads). Full contract in PLAN.md.

Frontend env is `API_URL` plus the Supabase URL/publishable key for auth.
Server secrets live only in `api/.env`.

## Verify (mandatory before any PR)

```bash
bun run check
bun run test
bun run build
cd api && pytest
```

`api/tests/test_contract_e2e.py` locks the privacy boundary end to end:
fixture in through `/ingest`, public read carries no secrets or private
fields, owner read requires the token.

Internal `roasts` table, API routes, and field names stay stable during the
hackathon. The roast language belongs only to share cards.
