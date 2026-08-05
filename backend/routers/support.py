import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from backend.schemas import (
    Conversation, ChatMessage, ChatRequest, ChatResponse,
    SendAgentMessageRequest, ResolveTicketRequest
)
from backend.data import CONVERSATIONS_DB
from backend.support_ai import get_ai_reply, build_summary

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

    # Get AI response using support_ai engine
    reply_res = get_ai_reply(req.message)
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
def send_agent_message(ticket_id: str, req: SendAgentMessageRequest):
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
    return ticket

@router.post("/tickets/{ticket_id}/resolve", response_model=Conversation)
def resolve_ticket(ticket_id: str, req: ResolveTicketRequest):
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
    return ticket
