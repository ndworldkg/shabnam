"""Backend tests for Shabnam Elegant: health, auth, settings, no-translate."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://is-elbiseleri--2pews7sp.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "test_admin@shabnam.test"
ADMIN_PASSWORD = "TestAdmin123!"


@pytest.fixture(scope="session")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return s


# ---------- Health ----------
def test_health():
    r = requests.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json() == {"ok": True}


# ---------- Auth ----------
def test_login_success():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "user" in data or "role" in data or "id" in data or "ok" in data


def test_login_wrong_password_turkish_error():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "WRONG_PASS_123"})
    assert r.status_code in (400, 401)
    # Backend returns Turkish error; frontend maps to RU when needed
    body = r.text
    assert "parola" in body.lower() or "e-posta" in body.lower() or "detail" in body.lower()


def test_auth_me(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    assert r.json().get("email") == ADMIN_EMAIL


# ---------- Settings ----------
def test_get_settings_defaults():
    r = requests.get(f"{API}/settings")
    assert r.status_code == 200
    data = r.json()
    for k in ["map_location", "instagram", "telegram", "facebook", "tiktok"]:
        assert k in data, f"Missing field: {k}"


def test_update_settings_social_and_map(admin_session):
    # Save original then restore
    original = requests.get(f"{API}/settings").json()
    try:
        payload = {
            **{k: original.get(k, "") for k in [
                "company_name", "tagline", "about", "phone", "email", "address",
                "whatsapp", "working_hours", "notification_email", "telegram_chat_id"
            ]},
            "map_location": "Toshkent shahar, Chilonzor tumani, 85-uy",
            "instagram": "@test_shabnam",
            "telegram": "https://t.me/test_shabnam",
            "facebook": "test.shabnam",
            "tiktok": "@test_tt",
            "i18n": original.get("i18n", {}),
        }
        r = admin_session.put(f"{API}/settings", json=payload)
        assert r.status_code == 200, r.text
        got = r.json()
        assert got["instagram"] == "@test_shabnam"
        assert got["telegram"] == "https://t.me/test_shabnam"
        assert got["facebook"] == "test.shabnam"
        assert got["tiktok"] == "@test_tt"
        assert got["map_location"] == "Toshkent shahar, Chilonzor tumani, 85-uy"

        # Verify via GET
        got2 = requests.get(f"{API}/settings").json()
        assert got2["instagram"] == "@test_shabnam"
    finally:
        # restore
        restore = {
            **{k: original.get(k, "") for k in [
                "company_name", "tagline", "about", "phone", "email", "address",
                "whatsapp", "working_hours", "notification_email", "telegram_chat_id",
                "instagram", "telegram", "facebook", "tiktok", "map_location",
            ]},
            "i18n": original.get("i18n", {}),
        }
        admin_session.put(f"{API}/settings", json=restore)


# ---------- No AI translation endpoint ----------
def test_translate_missing_endpoint_removed(admin_session):
    r = admin_session.post(f"{API}/admin/translate-missing", json={})
    assert r.status_code in (404, 405), f"Expected 404/405, got {r.status_code}"


# ---------- Public: no admin link exposed in product/categories ----------
def test_products_list_public():
    r = requests.get(f"{API}/products")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_categories_list_public():
    r = requests.get(f"{API}/categories")
    assert r.status_code == 200
