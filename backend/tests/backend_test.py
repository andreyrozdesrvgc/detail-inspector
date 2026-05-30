"""Backend API tests for Detail Inspector BMW Landing."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://bmw-coating.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health ----------
class TestHealth:
    def test_health_ok(self, client):
        r = client.get(f"{API}/health", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert "ts" in data


# ---------- Calculator ----------
class TestCalculate:
    def test_calc_x5_full_new(self, client):
        r = client.post(f"{API}/calculate", json={
            "bmw_model": "X5 G05",
            "task": "Полная оклейка кузова",
            "condition": "Новый автомобиль",
        })
        assert r.status_code == 200
        d = r.json()
        assert d["estimated_price"] == 340000
        assert "price_label" in d and d["price_label"]
        assert d["gift"]
        assert "X5 G05" in d["summary"]

    def test_calc_x5_risk_chips(self, client):
        r = client.post(f"{API}/calculate", json={
            "bmw_model": "X5 G05",
            "task": "Зоны риска",
            "condition": "Есть сколы",
        })
        assert r.status_code == 200
        d = r.json()
        # 340000*0.45 + 18000 = 171000
        assert d["estimated_price"] == 171000

    def test_calc_xm_color_used(self, client):
        r = client.post(f"{API}/calculate", json={
            "bmw_model": "XM",
            "task": "Смена цвета",
            "condition": "После другой студии",
        })
        assert r.status_code == 200
        d = r.json()
        # 450000*1.35 + 35000 = 642500 → 642000 or 643000 (banker's rounding)
        assert d["estimated_price"] > 600000
        assert d["estimated_price"] in (642000, 643000)

    def test_calc_validation_missing_fields(self, client):
        r = client.post(f"{API}/calculate", json={"bmw_model": "X5 G05"})
        assert r.status_code == 422


# ---------- Leads ----------
class TestLeads:
    created_id = None

    def test_create_lead_success(self, client):
        payload = {
            "name": "TEST_Ivan",
            "phone": "+7 999 000-00-01",
            "bmw_model": "X5 G05",
            "task": "Полная оклейка кузова",
            "condition": "Новый автомобиль",
            "source": "test_suite",
            "estimated_price": 340000,
            "extra": {"utm": "pytest"},
        }
        r = client.post(f"{API}/leads", json=payload)
        assert r.status_code == 200
        d = r.json()
        assert d["id"]
        assert d["phone"] == payload["phone"]
        assert d["name"] == "TEST_Ivan"
        assert d["bmw_model"] == "X5 G05"
        assert d["source"] == "test_suite"
        assert d["estimated_price"] == 340000
        assert "created_at" in d
        TestLeads.created_id = d["id"]

    def test_create_lead_empty_phone_400(self, client):
        r = client.post(f"{API}/leads", json={"name": "TEST_NoPhone", "phone": ""})
        assert r.status_code == 400

    def test_create_lead_short_phone_400(self, client):
        r = client.post(f"{API}/leads", json={"name": "TEST_Short", "phone": "12"})
        assert r.status_code == 400

    def test_list_leads_contains_created(self, client):
        r = client.get(f"{API}/leads")
        assert r.status_code == 200
        leads = r.json()
        assert isinstance(leads, list)
        ids = [l["id"] for l in leads]
        assert TestLeads.created_id in ids, "Newly created lead not found in GET /api/leads"

    def test_lead_minimal_payload(self, client):
        r = client.post(f"{API}/leads", json={"phone": "+79990000002"})
        assert r.status_code == 200
        d = r.json()
        assert d["phone"] == "+79990000002"
        assert d["source"] == "website"  # default
