import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_get_games():
    response = client.get("/api/games")
    assert response.status_code == 200
    games = response.json()
    assert len(games) >= 5
    assert games[0]["id"] == "cyberpunk-2077"

def test_get_game_by_id():
    response = client.get("/api/games/elden-ring")
    assert response.status_code == 200
    game = response.json()
    assert game["title"] == "Elden Ring"
    assert game["price"] == 49.99

def test_get_categories():
    response = client.get("/api/games/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) == 5

def test_get_order():
    response = client.get("/api/orders/GV-48219")
    assert response.status_code == 200
    order = response.json()
    assert order["carrier"] == "GameVault Express"

def test_support_chat_flow():
    # Send a message to chat
    payload = {"message": "How much is Elden Ring?"}
    response = client.post("/api/support/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Elden Ring" in data["reply"]["text"]
    assert data["escalated"] is False

    # Send an escalation message
    escalate_payload = {"ticket_id": data["ticket"]["id"], "message": "I need to talk to a human agent"}
    esc_response = client.post("/api/support/chat", json=escalate_payload)
    assert esc_response.status_code == 200
    esc_data = esc_response.json()
    assert esc_data["ticket"]["status"] == "waiting"
    assert esc_data["escalated"] is True

def test_double_charge_escalation():
    payload = {"message": "I was double charged on my credit card and need a refund right now."}
    response = client.post("/api/support/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["escalated"] is True
    assert data["ticket"]["status"] == "waiting"
    assert "billing" in data["reply"]["text"].lower() or "human" in data["reply"]["text"].lower()
