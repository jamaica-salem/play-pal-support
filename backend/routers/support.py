import asyncio
import json
import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from backend.schemas import (
    Conversation, ChatMessage, ChatRequest, ChatResponse,
    SendAgentMessageRequest, ResolveTicketRequest, CSATFeedback
)
from backend.data import CONVERSATIONS_DB
from backend.support_ai import get_ai_reply, get_gemini_reply_stream, build_summary, generate_copilot_draft
from backend.websocket_manager import manager

router = APIRouter(prefix="/api/support", tags=["support"])

@router.get("/tickets", response_model=List[Conversation])
def get_all_tickets():
    return list(CONVERSATIONS_DB.values())

@router.get("/tickets/{ticket_id}", response_model=Conversation)
def get_ticket(ticket_id: str):
    if ticket_id in CONVERSATIONS_DB:
        return CONVERSATIONS_DB[ticket_id]
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.post("/chat", response_model=ChatResponse)
def handle_chat(req: ChatRequest):
    now = time.time()
    customer_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:8]}",
        role="customer",
        text=req.message,
        ts=now
    )

    ticket_id = req.ticket_id
    if not ticket_id or ticket_id not in CONVERSATIONS_DB:
        ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
        ticket = Conversation(
            id=ticket_id,
            customer=req.customer_name or "Gamer",
            email=req.customer_email or "player@gamevault.com",
            status="ai",
            priority="normal",
            topic="General inquiry",
            messages=[customer_msg],
            createdAt=now,
            isLive=True
        )
        CONVERSATIONS_DB[ticket_id] = ticket
    else:
        ticket = CONVERSATIONS_DB[ticket_id]
        ticket.messages.append(customer_msg)

    # Get AI response using support_ai engine with multi-turn history
    reply_res = get_ai_reply(req.message, history=ticket.messages)
    ticket.topic = reply_res.topic

    should_escalate = reply_res.escalate or (not reply_res.confident)
    
    if should_escalate:
        ticket.status = "waiting"
        ticket.escalatedAt = now
        reason = "Customer explicitly asked for a human agent" if reply_res.escalate else "Low confidence response"
        ticket.summary = build_summary(reply_res.topic, reason, req.message)

    ai_reply_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:8]}",
        role="ai",
        text=reply_res.text,
        ts=now + 0.01,
        quickReplies=reply_res.quick_replies
    )

    ticket.messages.append(ai_reply_msg)

    return ChatResponse(
        ticket=ticket,
        reply=ai_reply_msg,
        escalated=should_escalate
    )

@router.post("/tickets/{ticket_id}/agent-message", response_model=Conversation)
async def send_agent_message(ticket_id: str, req: SendAgentMessageRequest):
    if ticket_id not in CONVERSATIONS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = CONVERSATIONS_DB[ticket_id]
    now = time.time()
    
    agent_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:8]}",
        role="agent",
        text=req.text,
        ts=now
    )
    
    ticket.messages.append(agent_msg)
    ticket.status = "agent"

    # Instantly push human agent message to customer via WebSocket
    await manager.broadcast_to_ticket(ticket_id, {
        "type": "agent_message",
        "message": agent_msg.model_dump(),
        "status": ticket.status
    })

    return ticket

@router.post("/tickets/{ticket_id}/resolve", response_model=Conversation)
async def resolve_ticket(ticket_id: str, req: ResolveTicketRequest):
    if ticket_id not in CONVERSATIONS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket = CONVERSATIONS_DB[ticket_id]
    now = time.time()
    
    sys_msg = ChatMessage(
        id=f"msg_{uuid.uuid4().hex[:8]}",
        role="system",
        text=f"Ticket closed. Resolution: {req.resolution or 'Resolved by agent.'}",
        ts=now
    )
    
    ticket.messages.append(sys_msg)
    ticket.status = "resolved"

    await manager.broadcast_to_ticket(ticket_id, {
        "type": "ticket_resolved",
        "message": sys_msg.model_dump(),
        "status": ticket.status
    })

    return ticket

@router.post("/tickets/{ticket_id}/generate-copilot-draft")
def get_copilot_draft(ticket_id: str):
    if ticket_id not in CONVERSATIONS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket = CONVERSATIONS_DB[ticket_id]
    draft = generate_copilot_draft(ticket.topic, ticket.summary or "", ticket.messages)
    return {"draft": draft}

@router.post("/tickets/{ticket_id}/feedback", response_model=Conversation)
async def submit_ticket_feedback(ticket_id: str, feedback: CSATFeedback):
    if ticket_id not in CONVERSATIONS_DB:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket = CONVERSATIONS_DB[ticket_id]
    ticket.feedback = feedback
    await manager.broadcast_to_ticket(ticket_id, {
        "type": "feedback_submitted",
        "feedback": feedback.model_dump()
    })
    return ticket

@router.websocket("/ws/{ticket_id}")
async def websocket_endpoint(websocket: WebSocket, ticket_id: str):
    await manager.connect_ticket(websocket, ticket_id)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                payload = json.loads(data_str)
            except Exception:
                payload = {"type": "chat", "message": data_str}

            user_text = payload.get("message", "").strip()
            if not user_text:
                continue

            # Create & save customer message
            now = time.time()
            customer_msg = ChatMessage(
                id=f"msg_{uuid.uuid4().hex[:8]}",
                role="customer",
                text=user_text,
                ts=now
            )

            if ticket_id not in CONVERSATIONS_DB:
                ticket = Conversation(
                    id=ticket_id,
                    customer=payload.get("customer_name") or "Gamer",
                    email=payload.get("customer_email") or "player@gamevault.com",
                    status="ai",
                    priority="normal",
                    topic="General inquiry",
                    messages=[customer_msg],
                    createdAt=now,
                    isLive=True
                )
                CONVERSATIONS_DB[ticket_id] = ticket
            else:
                ticket = CONVERSATIONS_DB[ticket_id]
                ticket.messages.append(customer_msg)

            # Echo customer message back to ticket
            await manager.broadcast_to_ticket(ticket_id, {
                "type": "customer_message",
                "message": customer_msg.model_dump()
            })

            # Check if current ticket status is in human agent mode
            if ticket.status in ["waiting", "agent"]:
                continue

            # Create AI message container
            ai_msg_id = f"msg_{uuid.uuid4().hex[:8]}"
            await manager.broadcast_to_ticket(ticket_id, {
                "type": "ai_stream_start",
                "msg_id": ai_msg_id,
                "ts": time.time()
            })

            # Stream Gemini AI response word-by-word with multi-turn history
            full_reply_text = ""
            for chunk in get_gemini_reply_stream(user_text, history=ticket.messages):
                full_reply_text += chunk
                await manager.broadcast_to_ticket(ticket_id, {
                    "type": "ai_stream_chunk",
                    "msg_id": ai_msg_id,
                    "chunk": chunk
                })
                await asyncio.sleep(0.02) # Smooth typing delay

            # Evaluate final response status & escalation
            reply_eval = get_ai_reply(user_text, history=ticket.messages)
            ticket.topic = reply_eval.topic
            should_escalate = reply_eval.escalate or (not reply_eval.confident)

            if should_escalate:
                ticket.status = "waiting"
                ticket.escalatedAt = time.time()
                reason = "Customer asked for agent or complex inquiry"
                ticket.summary = build_summary(reply_eval.topic, reason, user_text)

            ai_reply_msg = ChatMessage(
                id=ai_msg_id,
                role="ai",
                text=full_reply_text or reply_eval.text,
                ts=time.time(),
                quickReplies=reply_eval.quick_replies
            )
            ticket.messages.append(ai_reply_msg)

            await manager.broadcast_to_ticket(ticket_id, {
                "type": "ai_stream_end",
                "msg_id": ai_msg_id,
                "message": ai_reply_msg.model_dump(),
                "status": ticket.status,
                "summary": ticket.summary
            })

    except WebSocketDisconnect:
        manager.disconnect_ticket(websocket, ticket_id)

