# New Features & Optimization Plan — Next Release

Status: proposed. Source: full codebase audit (backend, frontend, plans-vs-shipped) on 2026-07-19.

---

## Feature 1 — Professional Report View + Team Sharing (headline feature)

### Why
Current report at `/r/$slug` is the joke-styled `RoastCard`. The serious content already exists in the backend — `DetailedReport` (`api/app/models.py:46`) carries `summary` + `actions[{rule, issue, impact, fix, verification}]`, plus `findings`, `cost`, `score` — it's just never rendered professionally. Also every scan is public today with no access control: no private mode, no team sharing.

### API contract (frozen — build both sides against this)

**Schema (`api/schema.sql`)**
```sql
alter table public.roasts
  add column if not exists visibility text not null default 'public';
-- check constraint: visibility in ('private','public')  (idempotent do-block, same style as existing)

create table if not exists public.report_shares (
  id uuid primary key default gen_random_uuid(),
  roast_id uuid not null references public.roasts(id) on delete cascade,
  email text not null,               -- store lowercased
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (roast_id, email)
);
create index if not exists report_shares_roast_idx on public.report_shares (roast_id);
alter table public.report_shares enable row level security;  -- no policies, service-role only
```
Existing rows default `public` — old links keep working.

**Endpoints**
- `GET /roasts/{slug}` — now accepts OPTIONAL bearer auth.
  - `visibility='public'` → serve anyone.
  - `visibility='private'` → serve only owner (`user_id` match) or requester whose email (lowercased) is in `report_shares`.
  - Otherwise **404** (never 403 — don't leak existence).
  - `PublicRoast` gains `visibility: str` and `is_owner: bool = False`.
- `GET /roasts/recent` — filter `visibility='public'`.
- Owner sharing endpoints (auth via existing `required_user_id`, owner check else 404):
  - `GET /me/roasts/{slug}/sharing` → `{"visibility": "public"|"private", "shares": [{"email", "created_at"}]}`
  - `PUT /me/roasts/{slug}/visibility` body `{"visibility": ...}` → sharing payload
  - `POST /me/roasts/{slug}/shares` body `{"email": ...}` → sharing payload (lowercase, validate, idempotent)
  - `DELETE /me/roasts/{slug}/shares/{email}` → sharing payload
- `OwnerRoast` gains `visibility`.
- No email SENDING this release — adding an email grants access; owner copies and shares the link. (Add Resend/SMTP later if wanted.)

### Backend work (files)
- `api/schema.sql` — columns/table above, existing idempotent style.
- `api/app/models.py` — `Visibility` literal, `SharingShare`, `SharingInfo`, `ShareCreate`, `VisibilityUpdate`; extend `PublicRoast`/`OwnerRoast`.
- `api/app/auth.py` — new `AuthUser {id, email|None}` + `optional_auth_user`/`required_auth_user` deps (Supabase `auth.get_user(token)` already returns email). Keep `optional_user_id`/`required_user_id` intact — ingest/billing/integrations depend on them.
- `api/app/routers/roasts.py` — access rules; keep `.neq("source","langsmith")` filters.
- `api/app/routers/me.py` — sharing endpoints.
- `api/tests/` — access-rule + sharing tests; follow `conftest.py` FakeQuery pattern (extend fake for `upsert`/`delete` — it lacks them today).

### Frontend work (files)
- `src/components/ReportView.tsx` (NEW) — professional single-column report (~760px, print-friendly):
  1. Header: title, mono meta line (source · date · trace id), large score with tier — severity-graded color (≥80 green, 50–79 amber, <50 red) from existing tokens.
  2. Executive summary from `detailed_report.summary`; quiet fallback when `!generated`.
  3. Findings grouped by category (security first), severity badges rendered High/Medium/Low, rule id in mono.
  4. Recommended actions: issue → impact → fix → verification as definition-list blocks.
  5. Cost: tokens in/out, total USD, waste USD, monthly projection + `projection_assumption`; `unpriced_models` caveat.
  6. `roast_line` demoted to muted footer aside or dropped.
- `src/routes/r/$slug.tsx` — swap `RoastCard` → `ReportView`; loader forwards session token (follow Authorization pattern in `src/lib/roast-functions.ts` / `billing.functions.ts`) so private reports work. Do NOT touch `RoastCard.tsx` — landing page still uses it.
- `src/lib/public-roasts.ts` + tests — add `visibility`/`is_owner` parsing.
- `src/lib/shares.ts` + `src/lib/shares.functions.ts` (NEW) — typed client for the 4 sharing endpoints, `createServerFn` + Authorization header, strict TS.
- `src/components/ShareDialog.tsx` (NEW) — native `<dialog>` (no new deps):
  - "Link access": Public / Private segmented toggle; public shows report URL + Copy button ("Copied" flash 1.5s).
  - "People with access": email input + Add, list with remove ×; re-render from server-fn response; inline error text.
  - Owner-only (gate on `is_owner`).
- `src/styles.css` — appended, clearly-marked report-view + share-dialog sections reusing existing tokens.

### Design rules (Emil Kowalski design-engineering skill — apply to all new UI)
- Professional dashboard mood: crisp, fast. Page load: opacity + translateY(8px), 200ms, `cubic-bezier(0.23, 1, 0.32, 1)` ease-out, 30–50ms stagger between sections. Nothing bouncy.
- Transition only `transform`/`opacity`, never `all`. Never `scale(0)`. Never `ease-in`.
- Buttons/links: `:active { transform: scale(0.97) }`, 160ms ease-out. Hover behind `@media (hover: hover) and (pointer: fine)`.
- Modal: transform-origin center; enter `scale(0.96)`+opacity ~180ms ease-out; exit faster ~140ms.
- `@media (prefers-reduced-motion: reduce)`: drop translate/scale, keep short opacity fade.
- Typography carries hierarchy; reuse `.mono-label` convention.

### Multi-agent build orchestration (as requested)
Master orchestrator (Workflow) spawning agents:
1. **Build phase** — 3 agents: `backend-sharing` ∥ (`report-view` → `share-ui`). Backend and frontend own disjoint files; share-ui runs after report-view because both touch `r/$slug.tsx`.
2. **Verify phase** — 1 agent: `pytest`, `bun test`, `tsc --noEmit`, `vite build`, static contract check frontend↔backend; fixes breakage until green.
3. **Review phase** — 2 parallel reviewers: backend (access-control holes, existence leaks, email-case bugs, missing owner checks) + frontend (token forwarding, SSR hazards, `any` leaks, dialog states, animation-rule violations).
4. **Fix phase** — 1 agent applies confirmed medium/high findings, re-runs all tests.
No commits by agents; single commit at end after human review.

### Acceptance
- Private report: 404 anonymously, 200 for owner and shared email, still 404 for other logged-in user.
- Public toggle round-trips; recent list excludes private.
- Report page renders summary/findings/actions/cost with no roast joke in main flow.
- Share dialog add/remove/copy work; all tests + typecheck + build green.

---

## Release backlog (from codebase audit)

### P0 — revenue + abuse holes (bugs in money paths, ship first)
1. **Anonymous ingest bypasses quota** — `api/app/routers/ingest.py:72`: no user → unlimited free scans, each triggers paid OpenAI call. Fix: quota by IP or require auth.
2. **No rate limiting anywhere** — public `/ingest`, `/roasts/*` unthrottled (add slowapi or proxy-level limits).
3. **Credit balance never enforced** — `api/app/routers/billing.py:127`: Pro user at 0 credits keeps scanning.
4. **Usage-event double billing** — `api/app/billing/dodo_client.py:139` fresh `uuid4` per call defeats idempotency; retries double-bill. Also isolate Dodo failure from ingest response (`ingest.py:80-98` 500s after roast stored).
5. **Two divergent monthly-scan counters** — `billing.py:114` vs `ingest.py:33` (one O(all-rows)). Unify one helper.
6. **Webhook replay guard** — only 5-min timestamp window (`billing.py:176-206`); add event-id idempotency.
7. **Live Dodo verification** — payments tested against mocks only; run real checkout → webhook → `subscriptions.status=active` before release (PAYMENTS-PLAN.md deferred item).

### P1 — user-facing gaps
1. **Subscription management** — Pro users have no cancel / portal / buy-credits (`src/routes/app.billing.tsx:79-91`); checkout has no success/return route (`src/lib/billing.functions.ts:40-54`).
2. **Scan-limit gating in UI** — `src/routes/app.new.tsx` never checks `scans_used_this_month` vs limit; over-cap free users get raw error instead of upgrade prompt. Direct conversion lever.
3. **Report privacy** — covered by Feature 1 above (visibility + shares).
4. **More trace formats** — only `openai-agents` + `generic`; add LangFuse or OTLP connector ("Integrations" page has one item; landing promises OpenAI Agents live ingest with no dedicated connector).
5. **Pagination** — roasts table unbounded; `src/lib/roast-functions.ts:23` hardcodes slice(0,10) for recent.

### P2 — reliability + hygiene
1. **Zero logging in backend** — Luna/Dodo/LangSmith failures silently swallowed (`roast_line.py:125`, `integrations/langsmith.py:461`). Add structured logging; add timeout to OpenAI client (`roast_line.py:88` has none).
2. **Batch ingest synchronous** — 25 traces × OpenAI calls in one request (`pipeline.py:148`); move to background job.
3. **Stale pricing table** — `analyze/pricing.py` hackathon-dated; `FALLBACK_PRICE=0` makes unpriced models read $0; `roast_model` default is placeholder id.
4. **Redaction is 8 regexes** — secrets outside patterns land in DB despite "never store secrets" guarantee (`analyze/roast.py:9-16`). Add entropy-based detection.
5. **Tests + CI** — no tests for `pipeline.py`, `security/credentials.py`, webhook/quota paths; shared FakeQuery lacks `gte/or_/upsert/delete/count`; no CI. Add GitHub Actions: pytest + bun test + tsc.
6. **Deploy story** — Worker scaffolded but no `deploy` script/docs; FastAPI has no deploy config at all.
7. **Frontend polish** — no `errorComponent`/`pendingComponent` on app routes; dead `AppPage` scaffold + hardcoded "Ingest/Idle" pill (`app-shell.tsx`); global search wired only to roast table; multi-trace batches never auto-navigate (`app.roasts.$batch.tsx:47-52`); landing has no Sign-up CTA (unauthed CTA lands on /login not /signup); profile lacks change-password/email/delete-account.

### Deferred (decide keep-dead or revive)
Ragas quality analyzer (PLAN.md stage 7, "cut first"), GAIA converter, LangSmith live-verification checklist, KMS key rotation (`security/credentials.py` half-built: `key_version` column exists, single hardcoded v1).

---

## Suggested release cut
**Feature 1 (report view + sharing) + all P0 + P1.1–1.2.** Closes every money leak, completes the paid loop, ships the headline feature with privacy built in. P1.4 integration is the marketing headline if capacity allows; P2 rides along opportunistically.
