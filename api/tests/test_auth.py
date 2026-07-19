from typing import Any

import pytest
from fastapi import HTTPException

from app import auth


@pytest.mark.parametrize(
    ("header", "expected"),
    [(None, None), ("Basic token", None), ("Bearer ", None), ("bearer token", "token"), ("Bearer  token ", "token")],
)
def test_token_from_header(header: str | None, expected: str | None) -> None:
    assert auth._token_from_header(header) == expected


def test_auth_user_accepts_object_and_mapping_responses(monkeypatch: pytest.MonkeyPatch) -> None:
    object_user = type("User", (), {"id": "object-id", "email": 3})()
    object_response = type("Response", (), {"user": object_user})()

    class Db:
        class Auth:
            def get_user(self, token: str) -> Any:
                return object_response if token == "object" else {"user": {"id": "mapping-id", "email": "user@example.com"}}

        auth = Auth()

    monkeypatch.setattr(auth, "get_supabase", lambda: Db())
    assert auth._auth_user_for_token("object") == auth.AuthUser(id="object-id")
    assert auth._auth_user_for_token("mapping") == auth.AuthUser(id="mapping-id", email="user@example.com")
    assert auth._user_id_for_token("mapping") == "mapping-id"
    assert auth.optional_auth_user() is None
    assert auth.optional_user_id() is None
    assert auth.required_auth_user("Bearer mapping").id == "mapping-id"
    assert auth.required_user_id("Bearer mapping") == "mapping-id"


@pytest.mark.parametrize("response", [{}, {"user": {}}, type("Response", (), {"user": None})()])
def test_auth_rejects_missing_user_identity(monkeypatch: pytest.MonkeyPatch, response: Any) -> None:
    class Db:
        class Auth:
            def get_user(self, _: str) -> Any:
                return response

        auth = Auth()

    monkeypatch.setattr(auth, "get_supabase", lambda: Db())
    for call in (
        lambda: auth._auth_user_for_token("token"),
        lambda: auth.optional_auth_user("Bearer token"),
        lambda: auth.optional_user_id("Bearer token"),
        lambda: auth.required_auth_user(),
        lambda: auth.required_user_id(),
    ):
        with pytest.raises(HTTPException, match="invalid or missing authorization") as error:
            call()
        assert error.value.status_code == 401


def test_auth_rejects_provider_failures(monkeypatch: pytest.MonkeyPatch) -> None:
    class Db:
        class Auth:
            def get_user(self, _: str) -> Any:
                raise RuntimeError("provider unavailable")

        auth = Auth()

    monkeypatch.setattr(auth, "get_supabase", lambda: Db())
    with pytest.raises(HTTPException, match="invalid or missing authorization"):
        auth._auth_user_for_token("token")
