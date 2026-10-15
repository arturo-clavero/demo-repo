from shopfloor_worker import create_app
from shopfloor_worker.auth import key_matches


def test_key_matches():
    assert key_matches("k-123", "k-123")
    assert not key_matches("k-124", "k-123")
    assert not key_matches("", "")


def test_exports_need_the_api_key():
    client = create_app({"API_KEY": "k-123"}).test_client()
    response = client.post("/exports", json={"kind": "products"})
    assert response.status_code == 401


def test_health_is_open():
    client = create_app({"API_KEY": "k-123"}).test_client()
    assert client.get("/health").get_json() == {"ok": True}
