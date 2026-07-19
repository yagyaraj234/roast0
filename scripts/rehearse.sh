#!/usr/bin/env bash
# Stage 7 rehearsal: the backend demo beats, end to end, from a clean terminal.
# Usage: ./scripts/rehearse.sh          (assumes api server on :8000; starts one if absent)
# PLAN.md says run this twice before going on stage.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API="http://localhost:8000"
PY="$ROOT/api/.venv/bin/python"
PASS=0; FAIL=0
ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
bad()  { echo "  ❌ $1"; FAIL=$((FAIL+1)); }

echo "── preflight ─────────────────────────────────────"
if ! curl -sf "$API/health" >/dev/null; then
  echo "  starting api server..."
  (cd "$ROOT/api" && nohup .venv/bin/uvicorn app.main:app --port 8000 >/tmp/helix-api.log 2>&1 &)
  for _ in $(seq 1 20); do curl -sf "$API/health" >/dev/null && break; sleep 0.5; done
fi
curl -sf "$API/health" >/dev/null && ok "api healthy" || { bad "api unreachable"; exit 1; }
(cd "$ROOT/api" && "$PY" -c "
from app.analyze.pricing import PRICING
from app.config import get_settings
model = get_settings().roast_model
assert PRICING, 'PRICING is empty — fill from the OpenAI pricing page'
assert model in PRICING, f'ROAST_MODEL {model!r} has no PRICING entry'
print(f'  pricing present for {model}')") && ok "pricing preflight" || { bad "pricing preflight"; exit 1; }

echo "── beat 1: live leaky agent → Charcoal card ──────"
CARD_URL=$(cd "$ROOT/api" && .venv/bin/python scripts/agents/leaky.py | tail -1)
SLUG="${CARD_URL##*/}"
ROW=$(curl -sf "$API/roasts/$SLUG")
echo "$ROW" | grep -q '"tier":"Charcoal"' && ok "leaky card is Charcoal ($CARD_URL)" || bad "leaky card is not Charcoal"
echo "$ROW" | grep -q '"rule":"leaked-secret"' && ok "leaked-secret finding present" || bad "no leaked-secret finding"
echo "$ROW" | grep -q 'sk-FAKE' && bad "RAW KEY STORED IN DB" || ok "key redacted in stored trace"
# leaky's findings are security ones (no waste); pricing shows up as total spend
echo "$ROW" | grep -q '"total_usd":0.0,' && bad "total_usd is \$0 — pricing not applied" || ok "nonzero total spend on card"

echo "── beat 2: BFCL trace → estimated label ──────────"
(cd "$ROOT/api" && .venv/bin/python scripts/convert_bfcl.py >/dev/null)
BSLUG=$(curl -sf -X POST "$API/ingest" -H 'content-type: application/json' \
  -d "{\"source\":\"bfcl\",\"title\":\"bfcl demo\",\"format\":\"generic\",\"trace\":$(cat "$ROOT/fixtures/generated/bfcl-simple_python_0.json")}" \
  | "$PY" -c "import sys,json;print(json.load(sys.stdin)['slug'])")
BROW=$(curl -sf "$API/roasts/$BSLUG")
echo "$BROW" | grep -q '"token_source":"estimated"' && ok "estimated label on BFCL card (/r/$BSLUG)" || bad "no estimated label"

echo "── beat 3: roast line (copy-roast source text) ───"
sleep 8  # give the background LLM call time to land
LINE=$(curl -sf "$API/roasts/$SLUG" | "$PY" -c "import sys,json;print(json.load(sys.stdin)['roast_line'])")
[ -n "$LINE" ] && ok "roast line: \"$LINE\"" || bad "roast_line empty"

echo "──────────────────────────────────────────────────"
echo "rehearsal: $PASS passed, $FAIL failed"
echo "demo URLs: $CARD_URL  |  http://localhost:3000/r/$BSLUG"
[ "$FAIL" -eq 0 ]
