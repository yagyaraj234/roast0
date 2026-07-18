# Flint brand migration plan

## Goal

Move product-facing identity from Roast0 to Flint. Product category everywhere:
**security scanning for AI agent traces**. Primary tagline: **Catch what your
agents leak.**

This is a copy, visual, metadata, and asset migration. It must not rename the
database table, API routes, payload fields, TypeScript/Python types, files, or
internal helpers: `roasts`, `/roasts`, `RoastRow`, `roast_line`, and related
identifiers remain intact through the hackathon.

## Current-state constraints

- `src/components/Logo.tsx` and `src/components/brand.tsx` both render a
  different Roast0 logo. Consolidate product-facing callers on one Flint mark
  before removing either duplicate.
- Landing, authenticated app, public report, SEO page, root metadata, tests,
  favicon, and manifest all expose Roast0 or fire/roast language.
- The report card is the only user-facing place that keeps roast language and
  tier names (`Rare`, `Medium`, `Well Done`, `Charcoal`).
- Existing untracked `worker.mjs` and `wrangler.jsonc` are unrelated; leave
  them untouched.

## Migration decisions

| Surface | Flint decision |
| --- | --- |
| Product name | `Flint` in UI, metadata, docs, assets, and app titles. |
| Product category | `Security scanning for AI agent traces`. |
| Main CTA | `Scan a trace`; secondary landing CTA `See a live report`. |
| In-app language | scan, report, finding, verdict, Flint score; show severity counts rather than tier labels. |
| Share card | Keep roast card, roast line, tier names, and `Copy roast`; this is distribution-only language. |
| Redaction claim | "Flint redacts on detection. The scanner never stores the secret it found." Only claim this where current pipeline behavior proves it. |
| Palette | Rename `--ink` to `--stone` (`#0C0A09`), `--ember` to `--spark` (`#FF4D00`), add `--graphite` (`#2A2726`); retain existing tier colors for share cards only. |
| Domain/handle | Do not guess. Keep runtime-relative URLs and current repo URL until owner picks an available domain and `useflint` or `flintscan` handle. |

## Work order

### 1. Establish a single Flint brand primitive

1. Replace both current dot/flame marks with one accessible angular flint-flake
   SVG plus a single spark dot. Keep the lowercase `flint` wordmark and current
   Instrument Serif / General Sans / JetBrains Mono stack.
2. Make `src/components/Logo.tsx` and `src/components/brand.tsx` converge on
   that primitive; update landing, app shell, public report, auth shell, and
   tests together. Avoid a third logo wrapper.
3. Replace `DotMatrix` flame path with a strike-spark burst. Update the product
   preview’s fake hostname and its visual labels at the same time.
4. Replace `public/favicon.svg`; regenerate `favicon.ico`, `logo192.png`, and
   `logo512.png` from the new mark; change `public/manifest.json` name,
   short_name, theme, and background colors.

### 2. Migrate serious product surfaces first

1. Update `src/routes/index.tsx` to the locked landing copy and order:
   hero, product shot, **What Flint catches**, feature grid, live wall, footer.
   Use exact hero headline, subhead, CTAs, feature-grid themes, and footer line
   from the Flint brand kit.
2. Add the eight concrete checks to **What Flint catches** exactly as the brand
   kit states. It is marketing for existing rules, not a request to add rules.
3. Replace landing’s fire, grill, roast, and joke copy with plain technical
   scanner language. Do not put “roast” in hero, navigation, footer, feature
   copy, live-wall copy, or empty states.
4. Update `src/routes/ai-agent-trace-analyzer.tsx` and root metadata to Flint,
   using the category phrase in title/description, FAQ, structured data, and
   Open Graph site name. Preserve its supported-rule claims and citations.
5. Rewrite `README.md` and `api/README.md` from the starter/Roast0 copy to the
   canonical GitHub description and the concrete scanner behavior. Do not
   rename the GitHub repository or alter external descriptions in this pass.

### 3. Convert authenticated app language without changing contracts

1. In `app-shell`, dashboard, new-scan, scans list, batch status, profile,
   auth onboarding, tables, and empty/error states, map display copy:
   `New roast` -> `New scan`, `Roasts` -> `Scans`, `Roast a trace` -> `Scan a
   trace`, and `roast` noun -> `scan` or `report` as context requires.
2. Rename only display labels, local CSS class names when practical, and test
   assertions. Do not rename routes (`/app/roasts`), database queries, internal
   type names, Supabase columns, API endpoints, or Python modules.
3. Change dashboard/list/report summaries to call score `Flint score`. Add
   visible per-severity finding counts for in-app rows/details (for example,
   `3 critical, 1 warning`) and stop showing `Rare`/`Medium`/`Well Done`/
   `Charcoal` outside share-card contexts. Reuse each row’s existing `findings`
   payload; extend list/batch mapping only where current selections omit it.
4. Keep form validation, upload behavior, auth flow, routes, and server
   functions byte-for-byte unless a display-string assertion needs updating.

### 4. Preserve the roast-card growth loop

1. Keep `RoastCard`, `ShareButtons`, `fallbackRoastLine`, tier values, and the
   `roast_line` field as the card-only register. Card header calls the result a
   public report, card content may retain roast line/tier/`Copy roast`.
2. Update card chrome, top bar, report stamp, 404 copy, share title, and Open
   Graph metadata to Flint while preserving a concise card roast line and score.
3. Add a static Flint OG image showing Flint score, severity counts, and
   `Secrets don't ship.`; connect it to report and landing metadata with the
   correct absolute deployment URL only after a domain is selected.
4. Do not make the scanner’s serious report copy humorous. Humor remains in
   `roast_line`, tier names, and share-card copy only.

### 5. Apply visual-token and test migration

1. Update `src/styles.css`, `src/shells.css`, and component SVG fills from
   ink/ember/fire terminology to stone/spark/graphite. Preserve contrast,
   focus styles, reduced-motion behavior, and tier-card colors.
2. Update feature icons: security/redaction first, reliability second, cost
   third, share card fourth. No new UI library or dependency.
3. Update route/component tests for Flint labels, accessible names, metadata,
   new report terminology, and card-only roast exceptions. Add one narrow test
   that a scan list presents severity counts without tier labels; retain the
   existing share-card copy test.
4. Update generated route output only through the existing route generator if
   a route changes; no route move is required for this migration.

## Validation gates

1. `rg` review: no `Roast0` remains in shipping UI, metadata, manifest,
   favicon source, or public docs. Internal code/table/API names are expected
   exceptions.
2. `rg` review: user-visible `roast` remains only in share-card components and
   their tests, never hero, dashboard, upload flow, SEO page, or README
   description.
3. `bun run check`, `bun test`, and `bun run build` pass. Run `cd api &&
   pytest` to prove the untouched scanner contract remains green.
4. Browser check at desktop and 390px: landing copy/order, scan upload, scans
   list severity counts, a public report card, copy-roast action, favicon, and
   report/landing metadata.
5. After owner selects domain/handle, replace remaining repo/domain references,
   publish the OG image URL, and verify an external unfurl. This is deployment
   configuration, not a prerequisite for local migration.

## Out of scope

- Renaming `roasts` storage/API/types/files, changing trace analysis behavior,
  changing auth or upload behavior, adding a design system, or changing
  deployment configuration without owner-selected domain/handle.
- Fixing pre-existing architecture divergence from `PLAN.md`; it is unrelated
  to the brand migration and should be handled as a separate task.
