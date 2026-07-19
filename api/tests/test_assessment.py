import json
from pathlib import Path

import pytest

from app import assessment
from app.models import IngestRequest


FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"


def test_assessment_is_redacted_and_ready_to_persist(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(assessment, "generate_luna_assessment", lambda *_: None)
    request = IngestRequest(
        source="upload",
        trace=json.loads((FIXTURES / "leaked-key.json").read_text()),
    )

    result = assessment.assess_trace(request)

    assert "leaked-secret" in {finding.rule for finding in result.findings}
    assert result.tier == "Charcoal"
    assert "sk-FAKE" not in str(result.raw_trace)


def test_parse_trace_uses_requested_and_fallback_normalizers() -> None:
    generic = {"events": [{"type": "tool", "name": "call", "args": {}}]}
    assert assessment.parse_trace(IngestRequest(source="upload", format="generic", trace=generic)).spans[0].type == "tool"
    assert assessment.parse_trace(IngestRequest(source="upload", trace=generic)).spans[0].type == "tool"
    sdk = json.loads((FIXTURES / "clean.json").read_text())
    assert assessment.parse_trace(IngestRequest(source="upload", format="openai-agents", trace=sdk)).spans
