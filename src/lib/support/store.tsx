import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChatMessageData, Conversation, MessageRole } from "./types";
import {
  sendSupportChat,
  sendAgentMessage as sendAgentMessageApi,
  resolveSupportTicket as resolveSupportTicketApi,
  fetchSupportTickets,
  getSupportWebSocketUrl,
} from "@/lib/api";

const STORAGE_KEY = "gamevault-support-v1";
export const LIVE_ID = "live-visitor";

let seq = 0;
const uid = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

const MIN = 60_000;

function seedConversations(now: number): Conversation[] {
  return [
    {
      id: LIVE_ID,
      customer: "You (store visitor)",
      email: "visitor@gamevault.demo",
      status: "ai",
      priority: "normal",
      topic: "New session",
      createdAt: now,
      isLive: true,
      messages: [
        {
          id: "greeting",
          role: "ai",
          text: "Hi! I'm GameAssist AI. I can help you with games, orders, shipping, and returns.",
          ts: now,
          quickReplies: [
            "Track My Order",
            "Check Game Availability",
            "Refund Policy",
            "Shipping Information",
            "Talk to Human Agent",
          ],
        },
      ],
    },
    {
      id: "c-2",
      customer: "Marcus Reyes",
      email: "marcus.reyes@mail.com",
      status: "waiting",
      priority: "high",
      topic: "Delayed order GV-48102",
      createdAt: now - 22 * MIN,
      escalatedAt: now - 6 * MIN,
      summary:
        "Customer is asking about a delayed game order. AI provided shipping information and tracking details, but the parcel is 4 days past its estimated delivery date so the customer requested human assistance.",
      messages: [
        {
          id: "c2-1",
          role: "ai",
          text: "Hi! I'm GameAssist AI. I can help you with games, orders, shipping, and returns.",
          ts: now - 22 * MIN,
        },
        {
          id: "c2-2",
          role: "customer",
          text: "My order GV-48102 was supposed to arrive Saturday and it's still not here.",
          ts: now - 21 * MIN,
        },
        {
          id: "c2-3",
          role: "ai",
          text: "Order GV-48102 is marked In transit with GameVault Express, tracking GVX-8812-3390. Standard shipping is 3–5 business days.",
          ts: now - 20 * MIN,
        },
        {
          id: "c2-4",
          role: "customer",
          text: "That's what it said 4 days ago. I need a real person to look at this.",
          ts: now - 7 * MIN,
        },
        {
          id: "c2-5",
          role: "system",
          text: "Escalated to human support — customer requested an agent.",
          ts: now - 6 * MIN,
        },
      ],
    },
    {
      id: "c-3",
      customer: "Aiko Tanaka",
      email: "aiko.t@mail.com",
      status: "agent",
      priority: "normal",
      topic: "Duplicate digital key charge",
      createdAt: now - 40 * MIN,
      escalatedAt: now - 30 * MIN,
      summary:
        "Customer was charged twice for a Cyberpunk 2077 digital key. AI confirmed the refund window but could not process a billing reversal, so the case was escalated.",
      messages: [
        {
          id: "c3-1",
          role: "customer",
          text: "I was charged twice for the same digital key.",
          ts: now - 40 * MIN,
        },
        {
          id: "c3-2",
          role: "ai",
          text: "Digital keys are refundable within 14 days if unredeemed. I can't reverse a duplicate charge myself — connecting you with a specialist.",
          ts: now - 39 * MIN,
        },
        {
          id: "c3-3",
          role: "system",
          text: "Escalated to human support — AI could not resolve billing issue.",
          ts: now - 30 * MIN,
        },
        {
          id: "c3-4",
          role: "agent",
          text: "Hi Aiko, this is Dana from GameVault support. I can see both charges and I've started the reversal on the duplicate.",
          ts: now - 28 * MIN,
        },
      ],
    },
  ];
}

type Ctx = {
  conversations: Conversation[];
  live: Conversation | undefined;
  aiTyping: boolean;
  agentTyping: boolean;
  sendCustomerMessage: (text: string) => void;
  sendAgentMessage: (conversationId: string, text: string) => void;
  claimConversation: (conversationId: string) => void;
  resolveConversation: (conversationId: string) => void;
  resetLive: () => void;
};

const SupportContext = createContext<Ctx | null>(null);

export function SupportProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [backendTicketId, setBackendTicketId] = useState<string | null>(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const backendTickets = await fetchSupportTickets();
        if (backendTickets.length > 0) {
          const seeds = seedConversations(Date.now());
          const liveVisitor = seeds.find((c) => c.id === LIVE_ID)!;
          setConversations([liveVisitor, ...backendTickets]);
          return;
        }
      } catch {
        /* Fall back to local seed if backend is offline */
      }
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setConversations(JSON.parse(raw) as Conversation[]);
          return;
        } catch {
          /* fall through to seed */
        }
      }
      setConversations(seedConversations(Date.now()));
    };
    loadTickets();
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const patch = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const append = useCallback(
    (id: string, msg: Omit<ChatMessageData, "id" | "ts"> & { role: MessageRole }) => {
      patch(id, (c) => ({
        ...c,
        messages: [...c.messages, { ...msg, id: uid(), ts: Date.now() }],
      }));
    },
    [patch],
  );

  // Establish WebSocket connection when ticket ID is active
  useEffect(() => {
    if (!backendTicketId) return;

    const wsUrl = getSupportWebSocketUrl(backendTicketId);
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected to backend ticket room:", backendTicketId);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ai_stream_start") {
            setAiTyping(true);
            patch(LIVE_ID, (c) => ({
              ...c,
              messages: [
                ...c.messages,
                { id: data.msg_id, role: "ai", text: "", ts: data.ts },
              ],
            }));
          } else if (data.type === "ai_stream_chunk") {
            patch(LIVE_ID, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === data.msg_id ? { ...m, text: m.text + data.chunk } : m,
              ),
            }));
          } else if (data.type === "ai_stream_end") {
            setAiTyping(false);
            patch(LIVE_ID, (c) => ({
              ...c,
              status: data.status ?? c.status,
              summary: data.summary ?? c.summary,
              messages: c.messages.map((m) =>
                m.id === data.msg_id
                  ? {
                      ...m,
                      text: data.message?.text || m.text,
                      quickReplies: data.message?.quickReplies,
                    }
                  : m,
              ),
            }));
          } else if (data.type === "agent_message") {
            setAgentTyping(false);
            patch(LIVE_ID, (c) => {
              const exists = c.messages.some((m) => m.id === data.message.id);
              if (exists) return c;
              return {
                ...c,
                status: data.status ?? "agent",
                messages: [
                  ...c.messages,
                  {
                    id: data.message.id,
                    role: "agent",
                    text: data.message.text,
                    ts: data.message.ts,
                  },
                ],
              };
            });
          }
        } catch (e) {
          console.error("Error parsing WebSocket frame:", e);
        }
      };

      ws.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };
    } catch (e) {
      console.warn("Could not create WebSocket, falling back to HTTP:", e);
    }

    return () => {
      ws?.close();
    };
  }, [backendTicketId, patch]);

  const sendCustomerMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // If WebSocket is connected, send over WebSocket for instant streaming
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            message: trimmed,
            customer_name: "Gamer",
            customer_email: "player@gamevault.com",
          }),
        );
        return;
      }

      // Fallback to HTTP POST if WebSocket is connecting or offline
      append(LIVE_ID, { role: "customer", text: trimmed });
      setAiTyping(true);

      try {
        const res = await sendSupportChat({
          ticket_id: backendTicketId || undefined,
          message: trimmed,
        });

        setBackendTicketId(res.ticket.id);
        setAiTyping(false);

        patch(LIVE_ID, (c) => ({
          ...c,
          topic: res.ticket.topic,
          status: res.ticket.status,
          summary: res.ticket.summary ?? c.summary,
          messages: [
            ...c.messages,
            {
              id: res.reply.id,
              role: res.reply.role,
              text: res.reply.text,
              ts: res.reply.ts,
              quickReplies: res.reply.quickReplies,
            },
            ...(res.escalated
              ? [
                  {
                    id: uid(),
                    role: "system" as MessageRole,
                    text: "Connecting you with a support specialist...",
                    ts: Date.now(),
                  },
                ]
              : []),
          ],
        }));

        setConversations((prev) => {
          const exists = prev.some((t) => t.id === res.ticket.id);
          if (!exists) return [res.ticket, ...prev];
          return prev.map((t) => (t.id === res.ticket.id ? res.ticket : t));
        });
      } catch (err) {
        console.warn("Backend chat request failed, falling back to local engine:", err);
        setAiTyping(false);
      }
    },
    [append, backendTicketId, patch],
  );

  const claimConversation = useCallback(
    (id: string) => {
      patch(id, (c) => ({
        ...c,
        status: "agent",
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "system" as MessageRole,
            text: "Dana (Support Specialist) joined the conversation.",
            ts: Date.now(),
          },
        ],
      }));
      setAgentTyping(true);
      window.setTimeout(() => {
        setAgentTyping(false);
        append(id, {
          role: "agent",
          text: "Hi, this is Dana from GameVault support. I've read your conversation with GameAssist — no need to repeat anything. Let me take a look at this for you.",
        });
      }, 1400);
    },
    [append, patch],
  );

  const sendAgentMessage = useCallback(
    async (id: string, text: string) => {
      if (!text.trim()) return;
      append(id, { role: "agent", text: text.trim() });
      patch(id, (c) => (c.status === "waiting" ? { ...c, status: "agent" } : c));

      try {
        if (id !== LIVE_ID) {
          const updated = await sendAgentMessageApi(id, text);
          setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)));
        }
      } catch {
        /* Ignore if offline */
      }
    },
    [append, patch],
  );

  const resolveConversation = useCallback(
    async (id: string) => {
      patch(id, (c) => ({
        ...c,
        status: "resolved",
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "system" as MessageRole,
            text: "Conversation marked as resolved by Dana.",
            ts: Date.now(),
          },
        ],
      }));

      try {
        if (id !== LIVE_ID) {
          await resolveSupportTicketApi(id);
        }
      } catch {
        /* Ignore if offline */
      }
    },
    [patch],
  );

  const resetLive = useCallback(() => {
    const fresh = seedConversations(Date.now()).find((c) => c.id === LIVE_ID)!;
    setBackendTicketId(null);
    setConversations((prev) => prev.map((c) => (c.id === LIVE_ID ? fresh : c)));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      conversations,
      live: conversations.find((c) => c.id === LIVE_ID),
      aiTyping,
      agentTyping,
      sendCustomerMessage,
      sendAgentMessage,
      claimConversation,
      resolveConversation,
      resetLive,
    }),
    [
      agentTyping,
      aiTyping,
      claimConversation,
      conversations,
      resolveConversation,
      resetLive,
      sendAgentMessage,
      sendCustomerMessage,
    ],
  );

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error("useSupport must be used inside SupportProvider");
  return ctx;
}
