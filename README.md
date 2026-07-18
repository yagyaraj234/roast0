# Flint

Security scanning for AI agent traces.

Flint scans agent traces for leaked secrets, unsafe tool calls, loops, failures,
and cost waste. It redacts supported secrets before storing a trace, then returns
a report with findings, a Flint score, and a shareable roast card.

## What Flint catches

- OpenAI, AWS, GitHub, Slack, and Google API keys in trace data
- JWTs, bearer tokens, private keys, emails, and phone numbers
- Plain-http tool URLs, repeated tool calls, and error tails
- Duplicate LLM calls, repeated prompt bloat, and oversized context

## Run

```bash
# terminal 1
cd api && uvicorn app.main:app --reload --port 8000

# terminal 2
bun dev
```

The FastAPI backend owns normalize, redact, analyze, score, and Supabase
storage. The TanStack Start frontend fetches report data from the backend.

## Verify

```bash
bun run check
bun test
bun run build
cd api && pytest
```

Internal `roasts` table, API routes, and field names stay stable during the
hackathon. The roast language belongs only to share cards.
