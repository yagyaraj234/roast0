import pytest

from app.normalize import generic
from app.normalize.generic import parse


def test_hand_written_generic_blob_parses_nested_span_array() -> None:
    raw = {
        "id": "generic-17",
        "name": "Support workflow",
        "payload": {
            "events": [
                {
                    "id": "ask",
                    "type": "llm_call",
                    "name": "draft",
                    "model": "demo-model",
                    "messages": [{"role": "user", "content": "Where is my order?"}],
                    "response": "Let me check.",
                    "vendor_field": "preserved",
                },
                {
                    "id": "lookup",
                    "type": "tool_call",
                    "name": "get_order",
                    "args": {"order_id": "R0-123"},
                    "result": {"status": "shipped"},
                },
            ]
        },
    }

    trace = parse(raw)

    assert trace.trace_id == "generic-17"
    assert trace.workflow == "Support workflow"
    assert [span.type for span in trace.spans] == ["llm", "tool"]
    assert trace.spans[0].tokens_in is not None
    assert trace.spans[0].tokens_out is not None
    assert trace.spans[0].token_source == "estimated"
    assert trace.spans[0].meta == {"vendor_field": "preserved"}
    assert trace.spans[1].name == "get_order"


@pytest.mark.parametrize(
    "raw",
    [None, {}, {"events": []}, {"events": [{"name": "missing prompt"}]}],
)
def test_generic_raises_only_when_no_span_like_items_exist(raw: object) -> None:
    with pytest.raises(ValueError):
        parse(raw)


def test_generic_helpers_cover_trace_shapes_and_coercions() -> None:
    assert generic._as_dict(["not-a-dict"]) == {}
    assert generic._first({"first": None, "second": "value"}, ("first", "second")) == "value"
    assert generic._stringify(None) == ""
    assert generic._stringify("plain") == "plain"
    assert generic._stringify({"b": 2, "a": 1}) == '{"a": 1, "b": 2}'
    assert generic._stringify({object(): "value"}).startswith("{")
    assert generic._find_span_array({"nested": [{"type": "tool", "args": {}, "name": "call"}]})
    assert generic._find_span_array([[{"type": "tool", "args": {}, "name": "call"}]])
    assert generic._find_span_array(["none"]) is None
    assert generic._span_type({"type": "handoff"}) == "handoff"
    assert generic._span_type({"type": "guardrail"}) == "guardrail"
    assert generic._span_type({"type": "function"}) == "tool"
    assert generic._span_type({"type": "completion"}) == "llm"
    assert generic._span_type({"name": "handoff agent", "input": "x"}) == "handoff"
    assert generic._span_type({"name": "guardrail check", "input": "x"}) == "guardrail"
    assert generic._span_type({"name": "tool runner", "input": "x"}) == "tool"
    assert generic._span_type({"name": "chat responder", "input": "x"}) == "llm"
    assert generic._span_type({"model": "model", "input": "x"}) == "llm"
    assert generic._span_type({"args": {}, "input": "x"}) == "tool"
    assert generic._span_type({"name": "plain", "input": "x"}) == "other"
    assert generic._number(True) is None
    assert generic._number("bad") is None
    assert generic._number("2.5") == 2.5
    assert generic._token_count(-1) is None
    assert generic._token_count("3.9") == 3


def test_generic_parse_uses_defaults_and_measured_usage() -> None:
    trace = parse([
        {"span_type": "generation", "prompt": {"message": "hi"}, "completion": ["hello"], "usage_metadata": {"input_tokens": "4", "output_tokens": 5}, "start": "1.5", "duration": "2", "extra": True},
        {"event": "other", "messages": [], "response": None},
    ])
    assert (trace.trace_id, trace.workflow) == ("generic-trace", "generic")
    first, second = trace.spans
    assert first.id == "span-1" and first.type == "llm"
    assert (first.tokens_in, first.tokens_out, first.token_source) == (4, 5, "measured")
    assert first.start_ms == 1.5 and first.duration_ms == 2.0 and first.meta == {"extra": True}
    assert second.id == "span-2" and second.type == "llm" and second.token_source == "estimated"
