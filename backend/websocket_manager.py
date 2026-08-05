import json
import logging
from typing import Dict, List, Set
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Maps ticket_id -> set of active WebSockets (customer + agents viewing ticket)
        self.ticket_rooms: Dict[str, Set[WebSocket]] = {}
        # Global set of connected support agents
        self.agent_connections: Set[WebSocket] = set()

    async def connect_ticket(self, websocket: WebSocket, ticket_id: str):
        await websocket.accept()
        if ticket_id not in self.ticket_rooms:
            self.ticket_rooms[ticket_id] = set()
        self.ticket_rooms[ticket_id].add(websocket)
        logging.info(f"WebSocket connected to ticket room {ticket_id}")

    async def connect_agent(self, websocket: WebSocket):
        await websocket.accept()
        self.agent_connections.add(websocket)
        logging.info("WebSocket connected to global agent channel")

    def disconnect_ticket(self, websocket: WebSocket, ticket_id: str):
        if ticket_id in self.ticket_rooms:
            self.ticket_rooms[ticket_id].discard(websocket)
            if not self.ticket_rooms[ticket_id]:
                del self.ticket_rooms[ticket_id]
        logging.info(f"WebSocket disconnected from ticket room {ticket_id}")

    def disconnect_agent(self, websocket: WebSocket):
        self.agent_connections.discard(websocket)
        logging.info("WebSocket disconnected from global agent channel")

    async def broadcast_to_ticket(self, ticket_id: str, message: dict):
        if ticket_id in self.ticket_rooms:
            dead_sockets = set()
            for ws in list(self.ticket_rooms[ticket_id]):
                try:
                    await ws.send_json(message)
                except Exception as e:
                    logging.warning(f"Error sending to ticket socket: {e}")
                    dead_sockets.add(ws)
            for ws in dead_sockets:
                self.disconnect_ticket(ws, ticket_id)

    async def broadcast_to_agents(self, message: dict):
        dead_sockets = set()
        for ws in list(self.agent_connections):
            try:
                await ws.send_json(message)
            except Exception as e:
                logging.warning(f"Error sending to agent socket: {e}")
                dead_sockets.add(ws)
        for ws in dead_sockets:
            self.disconnect_agent(ws)

manager = ConnectionManager()
