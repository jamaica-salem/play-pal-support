from typing import List, Optional, Literal
from pydantic import BaseModel, Field

# Game models
StockStatus = Literal["in_stock", "low_stock", "preorder", "out_of_stock"]

class Game(BaseModel):
    id: str
    title: str
    platform: str
    platforms: List[str]
    category: str
    price: float
    rating: float
    stock: StockStatus
    cover: str
    tagline: str
    description: str
    publisher: str
    released: str
    genre: str

class Category(BaseModel):
    name: str
    count: int
    icon: str

# Order models
class Order(BaseModel):
    id: str
    placed: str
    items: List[str]
    status: str
    carrier: str
    eta: str
    tracking: str

# Support & Chat models
MessageRole = Literal["customer", "ai", "agent", "system"]
ConversationStatus = Literal["ai", "waiting", "agent", "resolved"]
Priority = Literal["low", "normal", "high"]

class ChatMessage(BaseModel):
    id: str
    role: MessageRole
    text: str
    ts: float
    quickReplies: Optional[List[str]] = None

class Conversation(BaseModel):
    id: str
    customer: str
    email: str
    status: ConversationStatus
    priority: Priority
    topic: str
    messages: List[ChatMessage]
    createdAt: float
    escalatedAt: Optional[float] = None
    summary: Optional[str] = None
    isLive: Optional[bool] = False

class ChatRequest(BaseModel):
    ticket_id: Optional[str] = None
    message: str
    customer_name: Optional[str] = "Gamer"
    customer_email: Optional[str] = "player@gamevault.com"

class ChatResponse(BaseModel):
    ticket: Conversation
    reply: ChatMessage
    escalated: bool = False

class SendAgentMessageRequest(BaseModel):
    text: str

class ResolveTicketRequest(BaseModel):
    resolution: Optional[str] = None
