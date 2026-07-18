# Roast0: Claude Code build plan

TanStack Start + Supabase + TypeScript. 5 hours. One repo, one table, one demo.

Working name is Roast0. Do not spend hackathon time renaming it. You can bikeshed the name after you win.

How to use this file: drop it in the repo root as PLAN.md, point CLAUDE.md at it, then tell Claude Code "execute stage 0", check the acceptance line, then "execute stage 1", and so on. One stage per prompt. Don't dump all 8 stages in one go, Claude Code drifts when you do that.

---

## What we're building

Paste or auto-capture an AI agent trace, get back a shareable roast card: a health score (0 to 100), a roast tier (Rare, Medium, Well Done, Charcoal), a cost-waste breakdown in dollars, and a flag list covering security (leaked keys, PII), reliability (tool-call loops, error tails), and cost (duplicate LLM calls, repeated bloated prompts). Every card lives at a public URL built to be posted.

The pipeline: trace JSON in, normalize to one internal schema, redact secrets, run 2 analyzers, score, store in Supabase, render card.

---

## Ground rules for Claude Code

1. TypeScript strict mode. No `any` inside `src/lib/`.
2. Everything in `src/lib/normalize/` and `src/lib/analyze/` is pure functions. Zero framework imports. Zero Supabase imports. They take data, they return data. This is so teammates can build them in isolation and so `bun test` covers them without a server.
3. Finish the acceptance check before starting the next stage. Commit per stage with the given message.
4. Dependency list is fixed: `@supabase/supabase-js`, `nanoid`, `@openai/agents`, `openai`. Ask before adding anything else.
5. `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` exist only in `.env`, only read server-side. Never prefix them for client exposure, never import the db client into a client component, never log them. `.env` goes in `.gitignore` in stage 0, not later.
6. No styling work before stage 6. An ugly card that renders beats a pretty card that doesn't exist.
7. All database access goes through server functions. The browser never talks to Supabase directly. One data path, no RLS debugging at hour 4.

---

## Human setup (10 minutes, before Claude Code touches anything)

1. Create a Supabase project in the dashboard. Copy the URL and service role key.
2. Paste the schema SQL (stage 0 below) into the Supabase SQL editor and run it.
3. Get the OpenAI API key the hackathon gave you. Check which models your credits cover and write the model name down, you'll need it for `ROAST_MODEL`.
4. Open the OpenAI pricing page and fill the numbers into `pricing.ts` when stage 2 creates it. 2 minutes. Do not let anyone hardcode prices from memory, they change and a judge will check your math.

---

## Data model

One table. No joins.

```sql
create table roasts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  source text not null check (source in ('synthetic','upload','bfcl','gaia','live')),
  raw_trace jsonb not null,
  normalized jsonb not null,
  findings jsonb not null,
  cost jsonb not null,
  score int not null,
  tier text not null,
  roast_line text,
  created_at timestamptz default now()
);

create index roasts_slug_idx on roasts (slug);
alter table roasts enable row level security;
-- no policies: service role bypasses RLS, and service role is the only client we use
```

`raw_trace` and `normalized` are stored post-redaction. The database never contains a secret, even one a user uploaded. That line goes in the pitch.

---

## Internal types

These go in `src/lib/types.ts` in stage 1 and nothing downstream gets to reinterpret them.

```ts
export type SpanType = 'llm' | 'tool' | 'handoff' | 'guardrail' | 'other';

export interface Span {
  id: string;
  parentId: string | null;
  type: SpanType;
  name: string;                     // tool name, model name, agent name
  model: string | null;             // for llm spans, needed for pricing
  startMs: number | null;
  durationMs: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  tokenSource: 'measured' | 'estimated' | null;
  input: string;                    // stringified, post-redaction
  output: string;                   // stringified, post-redaction
  meta: Record<string, unknown>;
}

export interface NormalizedTrace {
  traceId: string;
  workflow: string;
  spans: Span[];
}

export type Category = 'security' | 'reliability' | 'cost';

export interface Finding {
  rule: string;
  category: Category;
  severity: 1 | 2 | 3;
  spanIds: string[];
  message: string;                  // plain language, shown on the card
  estWasteUsd?: number;
}

export interface CostReport {
  totalTokensIn: number;
  totalTokensOut: number;
  totalUsd: number;
  wasteUsd: number;
  tokenSource: 'measured' | 'estimated' | 'mixed';
  monthlyProjectionUsd: number;     // wasteUsd * RUNS_PER_DAY * 30
  projectionAssumption: string;     // printed on the card, e.g. "at 1,000 runs/day"
}
```

`tokenSource` matters. Traces we capture from the SDK carry real usage numbers, so they're `measured`. Uploaded or public traces without usage get a chars/4 estimate and are labeled `estimated` on the card. The card always says which one it's showing. Judges with API experience will ask where the dollar figure came from, and "measured from span usage, estimated and labeled when usage is absent" is the answer that survives the question.

---

## Stage 0: scaffold and plumbing (0:00 to 0:20)

Goal: dev server runs, database reachable, rules written down.

Tasks:

1. Scaffold a TanStack Start app named `roast0` with the current starter command. Raj uses Start daily, so if the scaffold command or route conventions have drifted from what you expect, ask him instead of guessing.
2. Install the 4 dependencies. Set up Tailwind if the starter didn't.
3. Create `.env` with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `ROAST_MODEL`. Add `.env` to `.gitignore` in this same commit.
4. Create `src/lib/db.server.ts`: one Supabase client built from the service role key, exported for server code only.
5. Create `CLAUDE.md` at repo root:

```md
# Roast0
Agent trace roast tool. Hackathon build. Read PLAN.md, execute one stage at a time.

Commands: bun dev / bun test
Rules:
- strict TS, no `any` in src/lib
- src/lib/normalize and src/lib/analyze are pure, no framework or db imports
- acceptance check green before next stage, one commit per stage
- deps are fixed, ask before adding
- env values are server-only, never logged, never client-exposed
- no styling before stage 6
```

6. Write a throwaway script that inserts and reads one row from `roasts`, run it, delete it.

Acceptance: `bun dev` serves the starter page, the scratch script round-trips a row.

Commit: `stage 0: scaffold, deps, env, db client, CLAUDE.md`

---

## Stage 1: types, redaction, normalizer (0:20 to 1:10)

This is the riskiest hour of the build. If the normalizer is wrong, every later stage is built on sand. Budget the full 50 minutes.

Files:

```
src/lib/types.ts
src/lib/normalize/estimateTokens.ts    // Math.ceil(chars / 4), labeled 'estimated'
src/lib/normalize/redact.ts
src/lib/normalize/openaiAgents.ts      // parser 1
src/lib/normalize/generic.ts           // parser 2
fixtures/leaked-key.json
fixtures/loopy.json
fixtures/bloated-prompt.json
fixtures/clean.json
src/lib/normalize/*.test.ts
```

Redaction spec (`redact.ts`): walk every string field in a trace, replace any match with `«REDACTED:rule»`. Findings later reference the rule and span id, never the matched value. Starting pattern set:

```ts
export const SECRET_PATTERNS: Array<{ rule: string; re: RegExp }> = [
  { rule: 'openai-key',   re: /sk-[A-Za-z0-9_-]{20,}/g },
  { rule: 'aws-key',      re: /AKIA[0-9A-Z]{16}/g },
  { rule: 'github-token', re: /gh[pousr]_[A-Za-z0-9]{36,}/g },
  { rule: 'slack-token',  re: /xox[baprs]-[A-Za-z0-9-]{10,}/g },
  { rule: 'google-key',   re: /AIza[0-9A-Za-z_-]{35}/g },
  { rule: 'jwt',          re: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { rule: 'private-key',  re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { rule: 'bearer',       re: /Bearer\s+[A-Za-z0-9._-]{20,}/g },
];
```

Redaction returns both the cleaned trace and the list of `{rule, spanId}` hits, because the roast analyzer consumes those hits as security findings. Detection and redaction are the same pass.

Parser 1, `openaiAgents.ts`: consumes the export shape of the OpenAI Agents SDK (a trace object with a spans array: generation/response spans, function/tool spans, handoffs, guardrails, with usage on generation spans). Field names differ slightly between SDK versions, so write it defensively: optional chaining everywhere, unknown span types map to `'other'` with the raw payload dumped into `meta`, missing usage means `tokensIn/Out: null`. In stage 5 you'll capture a real export and correct any field-name guesses against it. Build the fixtures in this SDK export shape so the test covers parser plus analyzer end to end.

Parser 2, `generic.ts`: best-effort mapping for arbitrary JSON. Find arrays of objects carrying a name/type field plus something prompt-shaped (input, prompt, messages, args). Map what's recognizable, shove the rest into `meta`, estimate tokens. This parser exists so the demo line "paste any trace JSON" is true, and so the BFCL conversion in stage 5 has somewhere to land.

Fixture content:

- `leaked-key.json`: 3 spans, one tool span with a fake key in its args. Use an obviously fake value like `sk-FAKE000000000000000000000000` so nobody at the venue panics.
- `loopy.json`: the same tool called 6 times with identical args.
- `bloated-prompt.json`: 4 llm spans sharing an identical 2,500-token system prefix.
- `clean.json`: 3 sensible spans, real-looking usage numbers, nothing wrong.

Acceptance: `bun test` green. Each fixture normalizes through parser 1, a hand-written generic blob normalizes through parser 2, and the leaked-key fixture comes out with zero raw key material anywhere in the normalized output.

Commit: `stage 1: types, redaction, normalizers, fixtures`

---

## Stage 2: analyzers and scoring (1:10 to 2:00)

Files:

```
src/lib/analyze/pricing.ts
src/lib/analyze/cost.ts
src/lib/analyze/roast.ts
src/lib/analyze/score.ts
src/lib/analyze/*.test.ts
```

`pricing.ts`:

```ts
// Fill from the OpenAI pricing page AT THE VENUE. Zeros are intentional:
// the build should nag you until real numbers go in.
export const PRICING: Record<string, { inPerM: number; outPerM: number }> = {
  // 'model-name': { inPerM: 0, outPerM: 0 },
};
export const FALLBACK_PRICE = { inPerM: 0, outPerM: 0 };
export const RUNS_PER_DAY = 1000; // printed on the card as the projection assumption
```

Cost rules (`cost.ts`), 3 rules only, resist adding more:

1. `duplicate-llm-call`: 2 or more llm spans with identical trimmed input. Severity 2. Waste = duplicated spans' token cost.
2. `repeated-bloat`: an identical prefix of 2,000+ estimated tokens appearing across 3 or more llm spans. Severity 2. Waste = prefix tokens × (occurrences − 1) × input price.
3. `context-stuffing`: any single llm span with tokensIn over 20,000. Severity 1. No waste number, just the flag.

Roast rules (`roast.ts`):

1. `leaked-secret`: consumes the redaction hits from stage 1. Severity 3, category security. This is the headline rule, weight it accordingly.
2. `pii-in-prompt`: email or phone regex in span input. Severity 1, security.
3. `insecure-url`: `http://` (excluding localhost) inside tool args. Severity 1, security.
4. `tool-loop`: same tool name + identical args hash appearing over 3 times, severity 2; over 8 times, severity 3. Category reliability.
5. `error-tail`: trace's final span carries an error status in meta. Severity 2, reliability.

Scoring (`score.ts`): start at 100. Deduct 5 per severity-1, 12 per severity-2, 25 per severity-3. Security findings multiply their deduction by 1.5, rounded. Floor at 0. Tiers: 90+ Rare, 65 to 89 Medium, 35 to 64 Well Done, below 35 Charcoal.

Acceptance: tests assert `leaked-key.json` lands in Charcoal with a `leaked-secret` finding, `loopy.json` produces `tool-loop`, `bloated-prompt.json` produces `repeated-bloat` with a nonzero `estWasteUsd`, and `clean.json` scores 90+.

Commit: `stage 2: cost and roast analyzers, scoring, tests green`

---

## Stage 3: ingest pipeline and upload UI (2:00 to 2:40)

Files:

```
src/lib/pipeline.server.ts     // normalize -> redact -> analyze -> score -> insert, returns slug
src/routes/api/ingest.ts       // POST { source, title?, format?, trace }
src/routes/index.tsx           // textarea paste + file upload + recent roasts list
```

Pipeline detail: try the openaiAgents parser first, fall back to generic if it throws or yields zero spans, unless the request pins a `format`. Slug from `nanoid(8)`. Insert the row, return `{ slug }`.

The ingest route is a plain POST endpoint (JSON body), because stage 5's agent scripts and curl both need to hit it without a browser. The index page's paste box calls the same endpoint and redirects to `/r/{slug}` on success.

Use whatever API-route convention the installed Start version ships. If it fights you for more than 15 minutes, do it as a server function called from a thin route and move on. This is exactly the kind of hole a hackathon build dies in.

Acceptance: paste `leaked-key.json` into the browser textarea, land on `/r/{slug}` (a raw JSON dump of the row is fine at this stage), and confirm the stored row in Supabase has redacted content.

Commit: `stage 3: ingest endpoint, pipeline, paste UI`

---

## Stage 4: the roast card (2:40 to 3:20)

Files:

```
src/routes/r/$slug.tsx
```

The card is the product. It shows, top to bottom: title and source badge, the score as a big number with the tier label, the roast line (placeholder text until stage 6), top 3 findings in plain language with severity and category tags, the cost block (total spend, waste, `measured` or `estimated` label, monthly projection with the printed assumption string), and a collapsed span timeline (a simple ordered list with type, name, tokens, duration, no visualization library).

Home page (`index.tsx` from stage 3) lists the 10 most recent roasts with score and tier, linking to their cards.

Server-render the card route so stage 6's OG tags actually work. No client-side data fetching for the card.

Acceptance: every fixture ingested so far renders a readable card. A stranger can look at the leaked-key card for 5 seconds and say what went wrong.

Commit: `stage 4: roast card page, home list`

---

## Stage 5: synthetic agents, live capture, public data (3:20 to 4:10)

Files:

```
scripts/agents/loopy.ts     // calls the same fake weather tool 6 times
scripts/agents/leaky.ts     // passes the fake key through a tool arg
scripts/agents/bloaty.ts    // 10KB system prompt, 6 trivial sequential calls
scripts/agents/chatty.ts    // asks the model to re-summarize its own summary 5 times
scripts/agents/clean.ts     // baseline, does one thing sensibly
scripts/convert-bfcl.ts     // BFCL entry -> generic trace JSON
scripts/seed.ts             // runs the converter + posts all fixtures to /api/ingest
```

Each agent script builds a small agent with `@openai/agents`, runs it, exports the trace, and POSTs it to `http://localhost:3000/api/ingest` with `source: 'live'`. Check the SDK's tracing docs for the exact custom-processor or export API. Time-box the fight to 20 minutes: if the processor API resists, have the script dump the exported trace to `fixtures/generated/*.json` instead and upload by hand. The demo survives either way.

While a real export is in hand, diff it against parser 1's assumptions from stage 1 and fix any field-name guesses. This is the moment the normalizer stops being speculative.

BFCL: pull a handful of entries from the Berkeley Function-Calling Leaderboard dataset (`https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard`, raw JSON also sits in the gorilla GitHub repo, which is faster than authenticating with HF). Convert question plus expected tool calls into a generic trace, tokens estimated. Be honest about what this is: BFCL entries are task definitions, mostly clean, no usage data. Their job in the demo is proving the parser handles a published external format, and that's the exact sentence to say on stage. GAIA needs a Hugging Face account and terms acceptance, so it's stage 7 stretch, skip it unless someone's already logged in.

Acceptance: `bun scripts/agents/leaky.ts` produces a Charcoal card end to end with no manual steps, and one BFCL-derived card exists with the `estimated` label visible.

Commit: `stage 5: synthetic agents, live ingest, bfcl converter, seed`

---

## Stage 6: roast line, share affordances, styling (4:10 to 4:40)

Files:

```
src/lib/roastLine.server.ts
```

Roast line: one OpenAI call using `ROAST_MODEL`, fed the findings JSON and score, asked for a single savage-but-technical line under 120 characters, no profanity. Fire it after the row insert and update the row when it lands. The card must never block on this call. Hardcode 4 fallback lines, one per tier, used when the call fails or hasn't landed yet.

Share affordances: a "copy roast" button on the card (roast line + score + URL, pre-formatted for a tweet), and OG meta tags on the card route (title = roast line, description = score, tier, and waste figure) so the URL unfurls when posted.

Styling pass: 30 minutes max, tier colors, big score, dark card, done. Raj has shipped shadcn/Tailwind work before, so pull in 2 or 3 components if that's faster than hand-rolling, and stop there.

Acceptance: card unfurl preview looks right in a checker, copy button output pastes clean into a tweet draft.

Commit: `stage 6: roast line, share button, og tags, styling`

---

## Stage 7: rehearsal and stretch (4:40 to 5:00)

Rehearsal is mandatory, stretch is optional. Run the 3 demo beats below twice, end to end, from a clean terminal.

Stretch, only if the rehearsal was boring because everything worked: a public URL via a cloudflared quick tunnel so judges can open cards on their phones, a GAIA sample if someone has HF access, or a generated OG image via satori. Pick at most one.

---

## Cut lines

Decide by the clock, and cut without a meeting.

- Behind at 2:00: drop the generic parser and BFCL. SDK format only. The pitch loses the public-data line and keeps everything else.
- Behind at 3:20: drop live POST from agent scripts. They write JSON to `fixtures/generated/` and you upload through the paste box on stage. Nobody in the audience can tell the difference.
- Behind at 4:10: drop the LLM roast line. Hardcoded tier lines ship. They should be funny anyway, write them like they're the only ones that exist.
- Never cut: redaction, the card page, the analyzer tests. Those 3 are the product, the demo, and the proof it works.

---

## Trace data sources, final word

1. Your own synthetic agents (stage 5). Primary source. You control the failures, so the demo has guaranteed findings instead of hoped-for ones.
2. BFCL (`https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard`). Parser legitimacy. Task definitions, mostly clean, tokens estimated and labeled.
3. GAIA (`https://huggingface.co/datasets/gaia-benchmark/GAIA`). Same role as BFCL, gated behind HF terms, stretch only.

The pitch sentence that ties it together: "We generated adversarial traces to guarantee real findings, and validated the parser on published benchmark data to prove it's more than a toy for our own test cases."

---

## Demo script, 3 beats, 90 seconds

1. Live terminal: `bun scripts/agents/leaky.ts`. The card appears: Charcoal, a leaked-secret finding, and the key visibly redacted in the stored trace. Say the line: "it caught the key, and it refused to store it. The roast tool doesn't keep what it catches."
2. Paste a BFCL-derived trace in the browser. Card renders with the `estimated` label. Say: "works on published benchmark formats, and it tells you when a number is measured versus estimated."
3. Hit copy roast, show the tweet-ready text and the unfurl. That's the virality surface, let it sit on screen for the last 5 seconds.
