from typing import Any

import pytest

from app import pipeline


def test_insert_row_retries_only_optional_schema_columns(monkeypatch: pytest.MonkeyPatch) -> None:
    inserted: list[dict[str, Any]] = []

    class Query:
        def __init__(self, row: dict[str, Any]) -> None: self.row = row
        def execute(self) -> None:
            if "detailed_report" in self.row:
                raise RuntimeError("column detailed_report does not exist")
            inserted.append(self.row)

    class Db:
        def table(self, _: str) -> "Db": return self
        def insert(self, row: dict[str, Any]) -> Query: return Query(row)

    monkeypatch.setattr(pipeline, "get_supabase", lambda: Db())
    pipeline._insert_row({"slug": "slug", "detailed_report": {}, "langsmith_connection_id": "connection", "external_trace_id": "trace"})
    assert inserted == [{"slug": "slug"}]


def test_insert_row_preserves_non_optional_storage_errors(monkeypatch: pytest.MonkeyPatch) -> None:
    class Db:
        def table(self, _: str) -> "Db": return self
        def insert(self, _: dict[str, Any]) -> "Db": return self
        def execute(self) -> None: raise RuntimeError("connection lost")

    monkeypatch.setattr(pipeline, "get_supabase", lambda: Db())
    with pytest.raises(RuntimeError, match="connection lost"):
        pipeline._insert_row({"slug": "slug"})
