# 🎮 GameVault — E-Commerce & Real-Time Gemini AI Customer Support

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini_2.0_Flash-4285F4.svg?style=flat&logo=google-gemini)](https://ai.google.dev/)
[![WebSockets](https://img.shields.io/badge/RealTime-WebSockets-000000.svg?style=flat&logo=websocket)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![Tests](https://img.shields.io/badge/Tests-Pytest_Passed-success.svg?style=flat&logo=pytest)](https://docs.pytest.org/)

**GameVault** is a full-stack e-commerce gaming marketplace featuring an integrated **Real-Time Gemini AI Customer Support Assistant (`GameAssist`)** with automated function calling, prompt injection defenses, multi-turn chat memory, and a seamless **Human Support Escalation Engine**.

---

## ✨ Key Features

### 🛍️ 1. Gaming Storefront
* **Featured Hero & Store Catalog**: Interactive product grid with platform badges (PlayStation, Xbox, PC, Nintendo Switch), prices, and stock indicators (*In Stock*, *Low Stock*, *Pre-Order*).
* **Game Detail Pages**: Detailed views with screenshots, developer specs, release dates, and related titles.

### 🤖 2. Real-Time Gemini AI Support (`GameAssist`)
* **Word-by-Word WebSocket Streaming**: Built with `google-genai` SDK and FastAPI WebSockets (`ws://localhost:8000/api/support/ws/{ticket_id}`). Tokens stream into customer chat bubbles in real-time (~50ms perceived latency).
* **Gemini Function Tools**:
  * `check_game_inventory`: Queries stock and prices for games in catalog.
  * `lookup_order`: Fetches live tracking status, carrier, and estimated delivery dates.
  * `escalate_to_human_agent`: Automatically escalates billing issues (e.g. duplicate charges) or explicit agent requests.
* **Prompt Injection Defenses & Safety Guardrails**: Boundary rules prevent jailbreaks, DAN overrides, off-topic prompts, or fake discount grants.
* **Full Multi-Turn Chat History**: Maintains long-conversation context across chat turns.
* **Distinguishable Sender Badges**: Chat bubbles clearly mark **AI Agent** vs. **Live Agent (Dana)**.

### 🎧 3. Support Agent Dashboard & AI Copilot (`/support`)
* **Live Case Queue**: Real-time ticker tracking active tickets (*AI Handling*, *Waiting for Agent*, *Agent Joined*, *Resolved*).
* **1-Click AI Response Drafts**: Agents can click **✨ Generate AI Draft** to let Gemini compose an empathetic human agent response draft based on case history and summary.
* **Canned Macro Responses**: Pre-built 1-click buttons for common responses (*Refund Approved*, *Shipping Info*, *Key Resent*, *Under Review*).
* **Web Audio Sound Notifications**: Dual-tone audio chime alerts notify agents when a ticket enters the queue.
* **Instant Push Messaging**: Agent replies sent from `/support` push directly into the customer's active chat widget without page refreshes.

---

## 🏗️ Architecture Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TanStack Router, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.13, FastAPI, Uvicorn, WebSockets |
| **AI / LLM** | Google Gemini API (`gemini-2.0-flash` via `google-genai` SDK) |
| **Testing** | Pytest, FastAPI TestClient |

---

## 🛠️ Quickstart & Local Setup

### Prerequisites
* **Node.js** (v18+) & `npm`
* **Python** (v3.10+)

### 1. Environment Configuration
Create a `.env` file in the root directory and add your Google Gemini API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Start Python FastAPI Backend Server
```bash
# Activate virtual environment
source .venv/bin/activate

# Start backend server on http://localhost:8000
python3 -m backend.main
```

### 3. Start React Frontend Dev Server
In a separate terminal window:
```bash
npm run dev
```
Open **`http://localhost:8080`** in your browser to test the storefront and chat widget.  
Open **`http://localhost:8080/support`** to access the Support Agent Dashboard.

---

## 🧪 Running Automated Tests

Run backend unit and integration tests with Pytest:
```bash
source .venv/bin/activate
PYTHONPATH=. pytest backend/tests/test_backend.py
```

---

## 📡 API Endpoint Summary

### REST Endpoints
* `GET /api/games` — Fetch store game catalog.
* `GET /api/games/{id}` — Fetch game details by ID.
* `GET /api/orders/{id}` — Fetch order tracking details.
* `POST /api/support/chat` — HTTP fallback endpoint for chat.
* `GET /api/support/tickets` — Fetch active support tickets.
* `POST /api/support/tickets/{id}/agent-message` — Submit human agent message.
* `POST /api/support/tickets/{id}/resolve` — Resolve support ticket.
* `POST /api/support/tickets/{id}/generate-copilot-draft` — Generate AI agent draft reply.

### WebSockets
* `WS /api/support/ws/{ticket_id}` — Bi-directional real-time streaming endpoint for tokens and instant agent push.

---

## 📜 Git & Commit Strategy
This repository follows **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`).
