import base64
import hashlib
import hmac
import time
from typing import Any

import httpx
import pytest

from app.billing import dodo_client

_HTTP_CLIENT = httpx.Client


def _mock_httpx(monkeypatch: pytest.MonkeyPatch, handler: Any) -> None:
    transport = httpx.MockTransport(handler)
    monkeypatch.setattr(
        dodo_client.httpx,
        "Client",
        lambda **kwargs: _HTTP_CLIENT(transport=transport, **kwargs),
    )


def test_create_checkout_session(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url == "https://test.dodopayments.com/checkouts"
        assert request.headers["Authorization"] == "Bearer api-key"
        assert request.method == "POST"
        assert request.read()
        return httpx.Response(
            200, json={"session_id": "checkout-1", "checkout_url": "https://checkout.test/1"}
        )

    _mock_httpx(monkeypatch, handler)
    assert dodo_client.create_checkout_session(
        "user-1",
        "user@example.com",
        api_key="api-key",
        environment="test_mode",
        product_id="product-1",
    ) == "https://checkout.test/1"


def test_get_customer_balance(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/subscriptions":
            assert request.url.params["customer_id"] == "customer-1"
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "status": "active",
                            "credit_entitlement_cart": [
                                {"credit_entitlement_id": "credits-1"},
                                {"credit_entitlement_id": "credits-2"},
                            ],
                        },
                        {
                            "status": "cancelled",
                            "credit_entitlement_cart": [
                                {"credit_entitlement_id": "ignored"}
                            ],
                        },
                    ]
                },
            )
        balances = {"credits-1": "12.5", "credits-2": "2"}
        entitlement_id = request.url.path.split("/")[2]
        return httpx.Response(200, json={"balance": balances[entitlement_id]})

    _mock_httpx(monkeypatch, handler)
    assert dodo_client.get_customer_balance(
        "customer-1", api_key="api-key", environment="test_mode"
    ) == 14.5


def test_ingest_usage_event(monkeypatch: pytest.MonkeyPatch) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url == "https://live.dodopayments.com/events/ingest"
        body = request.content.decode()
        assert '"customer_id":"customer-1"' in body.replace(" ", "")
        assert '"event_name":"roast.scan"' in body.replace(" ", "")
        return httpx.Response(200, json={"ingested_count": 1})

    _mock_httpx(monkeypatch, handler)
    dodo_client.ingest_usage_event(
        "customer-1", api_key="api-key", environment="live_mode"
    )


def _signature(payload: bytes, secret: str, webhook_id: str, timestamp: str) -> str:
    key = base64.b64decode(secret.removeprefix("whsec_"))
    message = b".".join((webhook_id.encode(), timestamp.encode(), payload))
    value = base64.b64encode(hmac.new(key, message, hashlib.sha256).digest()).decode()
    return f"v1,{value}"


def test_webhook_signature_valid_invalid_and_missing() -> None:
    payload = b'{"type":"subscription.active"}'
    secret = "whsec_c2VjcmV0"
    timestamp = str(int(time.time()))
    headers = {
        "webhook-id": "webhook-1",
        "webhook-timestamp": timestamp,
        "webhook-signature": _signature(payload, secret, "webhook-1", timestamp),
    }
    assert dodo_client.verify_webhook_signature(payload, headers, secret)
    assert not dodo_client.verify_webhook_signature(payload + b" ", headers, secret)
    assert not dodo_client.verify_webhook_signature(payload, {}, secret)
    headers["webhook-timestamp"] = "1"
    assert not dodo_client.verify_webhook_signature(payload, headers, secret)


def test_provider_errors_do_not_leak_response_details(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _mock_httpx(monkeypatch, lambda _: httpx.Response(500, text="secret provider detail"))
    with pytest.raises(dodo_client.DodoError, match="provider_unavailable"):
        dodo_client.ingest_usage_event(
            "customer-1", api_key="api-key", environment="test_mode"
        )


@pytest.mark.parametrize(
    ("api_key", "environment", "code"),
    [
        ("", "test_mode", "provider_not_configured"),
        ("api-key", "unknown", "Dodo environment must be test_mode or live_mode"),
    ],
)
def test_request_rejects_invalid_provider_configuration(
    api_key: str, environment: str, code: str
) -> None:
    with pytest.raises((dodo_client.DodoError, ValueError), match=code):
        dodo_client._request("GET", "/anything", api_key=api_key, environment=environment)


@pytest.mark.parametrize(
    ("response", "code"),
    [
        (httpx.Response(400, json={"error": "bad"}), "provider_request_failed"),
        (httpx.Response(200, content=b"not json"), "provider_response_invalid"),
        (httpx.Response(200, json=[]), "provider_response_invalid"),
    ],
)
def test_request_rejects_bad_provider_responses(
    monkeypatch: pytest.MonkeyPatch, response: httpx.Response, code: str
) -> None:
    _mock_httpx(monkeypatch, lambda _: response)
    with pytest.raises(dodo_client.DodoError, match=code):
        dodo_client._request("GET", "/anything", api_key="api-key", environment="test_mode")


@pytest.mark.parametrize(
    ("error", "code"),
    [
        (httpx.TimeoutException("slow"), "provider_timeout"),
        (httpx.ConnectError("down"), "provider_unavailable"),
    ],
)
def test_request_maps_transport_errors(
    monkeypatch: pytest.MonkeyPatch, error: httpx.HTTPError, code: str
) -> None:
    def client(**_: Any) -> Any:
        raise error

    monkeypatch.setattr(dodo_client.httpx, "Client", client)
    with pytest.raises(dodo_client.DodoError, match=code):
        dodo_client._request("GET", "/anything", api_key="api-key", environment="test_mode")


def test_checkout_and_balance_reject_invalid_payloads(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    with pytest.raises(dodo_client.DodoError, match="provider_not_configured"):
        dodo_client.create_checkout_session("user", "user@example.com", api_key="key", environment="test_mode", product_id="")
    _mock_httpx(monkeypatch, lambda _: httpx.Response(200, json={}))
    with pytest.raises(dodo_client.DodoError, match="provider_response_invalid"):
        dodo_client.create_checkout_session("user", "user@example.com", api_key="key", environment="test_mode", product_id="product")
    _mock_httpx(monkeypatch, lambda _: httpx.Response(200, json={"items": "not-a-list"}))
    with pytest.raises(dodo_client.DodoError, match="provider_response_invalid"):
        dodo_client.get_customer_balance("customer", api_key="key", environment="test_mode")


def test_balance_ignores_invalid_carts_and_rejects_bad_balance(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/subscriptions":
            return httpx.Response(200, json={"items": [None, {"status": "active", "credit_entitlement_cart": "bad"}, {"status": "active", "credit_entitlement_cart": [None, {}, {"credit_entitlement_id": "credit/id"}]}]})
        assert "credit%2Fid" in str(request.url)
        return httpx.Response(200, json={"balance": "not-a-number"})

    _mock_httpx(monkeypatch, handler)
    with pytest.raises(dodo_client.DodoError, match="provider_response_invalid"):
        dodo_client.get_customer_balance("customer/id", api_key="key", environment="test_mode")


def test_webhook_signature_rejects_malformed_values() -> None:
    payload = b"{}"
    headers = {"webhook-id": "id", "webhook-timestamp": "not-a-time", "webhook-signature": "v2,anything broken"}
    assert not dodo_client.verify_webhook_signature(payload, headers, "whsec_not-base64")
    headers["webhook-timestamp"] = str(int(time.time()))
    assert not dodo_client.verify_webhook_signature(payload, headers, "whsec_not-base64")
    assert not dodo_client.verify_webhook_signature(payload, {**headers, "webhook-signature": "v2,value v1"}, "whsec_c2VjcmV0")
