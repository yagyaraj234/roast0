import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app
from app import roast_line
from app.roast_line import (
    FALLBACK_LINES,
    _PROMPT,
    fallback_detailed_report,
    fallback_line,
    generate_luna_assessment,
)
from app.types import CostReport, Finding, NormalizedTrace, Span
from tests.conftest import FakeSupabase

client = TestClient(app)

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"


def test_fallback_line_per_tier() -> None:
    assert set(FALLBACK_LINES) == {"Rare", "Medium", "Well Done", "Charcoal"}
    assert all(len(line) <= 120 for line in FALLBACK_LINES.values())
    assert fallback_line("Charcoal") == FALLBACK_LINES["Charcoal"]
    assert fallback_line("unknown-tier") in FALLBACK_LINES.values()


def test_luna_prompt_requires_specific_nonduplicated_actions() -> None:
    assert "Good roast_line:" in _PROMPT
    assert "specific rule and affected span(s)" in _PROMPT
    assert "Fix the flagged step, then rerun this trace." in _PROMPT
    assert "two actions\nfor the same rule" in _PROMPT


def test_generate_returns_none_without_api_key(monkeypatch) -> None:
    # no key configured in tests -> must fail soft, never raise
    monkeypatch.setattr(
        "app.roast_line.get_settings",
        lambda: type("S", (), {"openai_api_key": "", "roast_model": "gpt-5.6-luna"})(),
    )
    assert generate_luna_assessment([], empty_cost(), empty_trace(), 50, "Well Done") is None


def test_fallback_report_explains_existing_findings() -> None:
    report = fallback_detailed_report(
        [
            Finding(
                rule="tool-loop",
                category="reliability",
                severity=2,
                span_ids=["tool-1"],
                message="Repeated weather tool call.",
            )
        ],
        empty_cost(),
    )
    assert report.generated is False
    assert report.actions[0].rule == "tool-loop"
    assert fallback_detailed_report([], empty_cost()).actions == []


def test_luna_response_is_filtered_and_bounded(monkeypatch) -> None:
    class Completions:
        def create(self, **_: object) -> object:
            content = json.dumps({
                "roast_line": '"' + "x" * 130 + '"',
                "summary": "s" * 610,
                "actions": [
                    {"rule": "known", "issue": "i", "impact": "p", "fix": "f", "verification": "v"},
                    {"rule": "unknown", "issue": "i", "impact": "p", "fix": "f", "verification": "v"},
                ],
            })
            return type("Response", (), {"choices": [type("Choice", (), {"message": type("Message", (), {"content": content})()})()]})()

    class Client:
        chat = type("Chat", (), {"completions": Completions()})()

    monkeypatch.setattr(roast_line, "get_settings", lambda: type("Settings", (), {"openai_api_key": "key", "roast_model": "model"})())
    monkeypatch.setattr(roast_line, "OpenAI", lambda **_: Client())
    trace = NormalizedTrace(
        trace_id="trace", workflow="workflow", spans=[Span(id="span", parent_id=None, type="llm", name="model", model="model", start_ms=0, duration_ms=1, tokens_in=1, tokens_out=2, token_source="measured", input="in", output="out", meta={"status": "ok"})]
    )
    line, report = generate_luna_assessment([Finding(rule="known", category="cost", severity=1, span_ids=["span"], message="message")], empty_cost(), trace, 80, "Rare") or ("", None)
    assert len(line) == 120
    assert report and report.summary == "s" * 600
    assert [action.rule for action in report.actions] == ["known"]
    assert report.generated and report.model == "model"


def test_luna_returns_fallback_line_or_none_for_invalid_responses(monkeypatch) -> None:
    class Completions:
        def __init__(self, content: str) -> None: self.content = content
        def create(self, **_: object) -> object:
            return type("Response", (), {"choices": [type("Choice", (), {"message": type("Message", (), {"content": self.content})()})()]})()

    class Client:
        def __init__(self, content: str) -> None:
            self.chat = type("Chat", (), {"completions": Completions(content)})()

    monkeypatch.setattr(roast_line, "get_settings", lambda: type("Settings", (), {"openai_api_key": "key", "roast_model": "model"})())
    monkeypatch.setattr(roast_line, "OpenAI", lambda **_: Client(json.dumps({"summary": "summary", "actions": []})))
    result = generate_luna_assessment([], empty_cost(), empty_trace(), 50, "Medium")
    assert result and result[0] == FALLBACK_LINES["Medium"]
    monkeypatch.setattr(roast_line, "OpenAI", lambda **_: Client(json.dumps({"summary": "", "actions": []})))
    assert generate_luna_assessment([], empty_cost(), empty_trace(), 50, "Medium") is None
    monkeypatch.setattr(roast_line, "OpenAI", lambda **_: Client("not-json"))
    assert generate_luna_assessment([], empty_cost(), empty_trace(), 50, "Medium") is None


def empty_trace() -> NormalizedTrace:
    return NormalizedTrace(trace_id="trace-1", workflow="test", spans=[])


def empty_cost() -> CostReport:
    return CostReport(
        total_tokens_in=0,
        total_tokens_out=0,
        total_usd=0,
        waste_usd=0,
        token_source="estimated",
        monthly_projection_usd=0,
        projection_assumption="at 1,000 runs/day",
        unpriced_models=[],
    )


def test_ingest_stores_fallback_report_immediately(fake_db: FakeSupabase) -> None:
    trace = json.loads((FIXTURES / "leaked-key.json").read_text())
    resp = client.post("/ingest", json={"source": "upload", "trace": trace})
    assert resp.status_code == 200
    row = fake_db.rows[0]
    assert row["tier"] == "Charcoal"
    assert row["roast_line"] == FALLBACK_LINES["Charcoal"]
    assert row["detailed_report"]["generated"] is False
