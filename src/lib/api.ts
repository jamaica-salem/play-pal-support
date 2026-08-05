import { Game } from "./games";
import { Conversation, ChatMessageData } from "./support/types";

const API_BASE = typeof window !== "undefined" ? "" : "http://127.0.0.1:8000";

export async function fetchGames(params?: {
  category?: string;
  platform?: string;
  search?: string;
}): Promise<Game[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.platform) query.set("platform", params.platform);
  if (params?.search) query.set("search", params.search);

  const url = `${API_BASE}/api/games${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch games: ${res.statusText}`);
  return res.json();
}

export async function fetchGameById(gameId: string): Promise<Game> {
  const res = await fetch(`${API_BASE}/api/games/${gameId}`);
  if (!res.ok) throw new Error(`Failed to fetch game details: ${res.statusText}`);
  return res.json();
}

export async function fetchCategories(): Promise<{ name: string; count: number; icon: string }[]> {
  const res = await fetch(`${API_BASE}/api/games/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.statusText}`);
  return res.json();
}

export async function fetchSupportTickets(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/support/tickets`);
  if (!res.ok) throw new Error(`Failed to fetch support tickets: ${res.statusText}`);
  return res.json();
}

export async function sendSupportChat(data: {
  ticket_id?: string;
  message: string;
  customer_name?: string;
  customer_email?: string;
}): Promise<{ ticket: Conversation; reply: ChatMessageData; escalated: boolean }> {
  const res = await fetch(`${API_BASE}/api/support/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to send support chat message: ${res.statusText}`);
  return res.json();
}

export async function sendAgentMessage(ticketId: string, text: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/agent-message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Failed to send agent message: ${res.statusText}`);
  return res.json();
}

export async function resolveSupportTicket(ticketId: string, resolution?: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/support/tickets/${ticketId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resolution }),
  });
  if (!res.ok) throw new Error(`Failed to resolve ticket: ${res.statusText}`);
  return res.json();
}
