from typing import Any

from app import db


def test_get_supabase_uses_server_only_settings(monkeypatch: Any) -> None:
    expected = object()
    settings = type("Settings", (), {"supabase_url": "https://db.example", "supabase_service_role_key": "service-key"})()
    db.get_supabase.cache_clear()
    monkeypatch.setattr(db, "get_settings", lambda: settings)
    monkeypatch.setattr(db, "create_client", lambda url, key: expected if (url, key) == (settings.supabase_url, settings.supabase_service_role_key) else None)
    assert db.get_supabase() is expected
    db.get_supabase.cache_clear()
