"""Model pricing used by the cost analyzer.

Verified 2026-07-18 against the official OpenAI pricing docs:
- gpt-5.6 family: https://developers.openai.com/api/docs/pricing
  (luna $1.00 in / $6.00 out per 1M, standard tier)
- gpt-4.1-mini: https://developers.openai.com/api/docs/models/gpt-4.1-mini
  ($0.40 in / $1.60 out per 1M; legacy, absent from the main pricing table)
Re-check on demo day if OpenAI ships anything new.
"""

PRICING: dict[str, dict[str, float]] = {
    "gpt-5.6-luna": {"in_per_m": 1.00, "out_per_m": 6.00},
    "gpt-5.6-terra": {"in_per_m": 2.50, "out_per_m": 15.00},
    "gpt-5.6-sol": {"in_per_m": 5.00, "out_per_m": 30.00},
    "gpt-4.1-mini": {"in_per_m": 0.40, "out_per_m": 1.60},
}
FALLBACK_PRICE = {"in_per_m": 0.0, "out_per_m": 0.0}
RUNS_PER_DAY = 1000  # printed on the card as the projection assumption
