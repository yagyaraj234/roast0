from app.analyze.pricing import FALLBACK_PRICE, PRICING, RUNS_PER_DAY


def test_pricing_is_filled_with_real_positive_rates() -> None:
    # filled 2026-07-18 from the OpenAI pricing docs; see pricing.py docstring
    assert "gpt-5.6-luna" in PRICING  # ROAST_MODEL — live agent runs
    assert "gpt-4.1-mini" in PRICING  # fixtures
    for model, price in PRICING.items():
        assert price["in_per_m"] > 0, model
        assert price["out_per_m"] > price["in_per_m"] > 0, model


def test_fallback_and_projection_constants() -> None:
    assert FALLBACK_PRICE == {"in_per_m": 0.0, "out_per_m": 0.0}
    assert RUNS_PER_DAY == 1000
