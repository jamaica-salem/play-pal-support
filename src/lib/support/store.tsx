import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildSummary, getAiReply } from "./ai";
import type { ChatMessageData, Conversation, MessageRole } from "./types";

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
    {
      id: "c-4",
      customer: "Priya Nair",
      email: "priya.nair@mail.com",
      status: "ai",
      priority: "low",
      topic: "Platform question — Elden Ring",
      createdAt: now - 4 * MIN,
      messages: [
        {
          id: "c4-1",
          role: "customer",
          text: "What platforms support Elden Ring?",
          ts: now - 4 * MIN,
        },
        {
          id: "c4-2",
          role: "ai",
          text: "Elden Ring is available on PC, PlayStation 5, and Xbox Series X|S. Cross-platform saves are not supported.",
          ts: now - 4 * MIN,
        },
      ],
    },
    {
      id: "c-5",
      customer: "Tom Becker",
      email: "tbecker@mail.com",
      status: "resolved",
      priority: "low",
      topic: "Refund policy question",
      createdAt: now - 90 * MIN,
      summary:
        "Customer asked about the return window for an unopened Switch game. AI answered with the 30-day policy and the customer confirmed no further help was needed.",
      messages: [
        {
          id: "c5-1",
          role: "customer",
          text: "Can I return an unopened Switch game?",
          ts: now - 90 * MIN,
        },
        {
          id: "c5-2",
          role: "ai",
          text: "Yes — unopened physical games can be returned within 30 days for a full refund.",
          ts: now - 89 * MIN,
        },
        {
          id: "c5-3",
          role: "customer",
          text: "Perfect, thanks!",
          ts: now - 88 * MIN,
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
  const [aiTyping, setAiTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        setConversations(JSON.parse(e.newValue) as Conversation[]);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

  const escalate = useCallback(
    (reason: string, topic: string, lastCustomerMessage: string) => {
      patch(LIVE_ID, (c) => ({
        ...c,
        status: "waiting",
        priority: "high",
        topic,
        escalatedAt: Date.now(),
        summary: buildSummary(topic, reason, lastCustomerMessage),
        messages: [
          ...c.messages,
          {
            id: uid(),
            role: "system" as MessageRole,
            text: "Connecting you with a support specialist...",
            ts: Date.now(),
          },
        ],
      }));
    },
    [patch],
  );

  const sendCustomerMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      setConversations((prev) => {
        const live = prev.find((c) => c.id === LIVE_ID);
        if (!live) return prev;

        const withMsg: Conversation = {
          ...live,
          messages: [
            ...live.messages,
            { id: uid(), role: "customer" as MessageRole, text: trimmed, ts: Date.now() },
          ],
        };
        return prev.map((c) => (c.id === LIVE_ID ? withMsg : c));
      });

      const live = conversations.find((c) => c.id === LIVE_ID);
      if (!live || live.status === "waiting" || live.status === "agent") return;

      const repeated =
        live.messages.filter((m) => m.role === "customer" && m.text.trim().toLowerCase() === trimmed.toLowerCase())
          .length >= 1;

      setAiTyping(true);
      window.setTimeout(() => {
        setAiTyping(false);
        const reply = getAiReply(trimmed);

        if (repeated && reply.confident && !reply.escalate) {
          append(LIVE_ID, {
            role: "ai",
            text: "It looks like I've already answered that and it didn't help. Let me hand you to a human specialist.",
          });
          window.setTimeout(
            () => escalate("customer repeated the same question", reply.topic, trimmed),
            600,
          );
          return;
        }

        append(LIVE_ID, {
          role: "ai",
          text: reply.text,
          quickReplies: reply.quickReplies,
        });

        if (reply.escalate) {
          const reason = reply.confident
            ? "customer asked for a human agent"
            : "AI could not answer confidently";
          window.setTimeout(() => escalate(reason, reply.topic, trimmed), 700);
        } else {
          patch(LIVE_ID, (c) => ({ ...c, topic: reply.topic }));
        }
      }, 1100);
    },
    [append, conversations, escalate, patch],
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
    (id: string, text: string) => {
      if (!text.trim()) return;
      append(id, { role: "agent", text: text.trim() });
      patch(id, (c) => (c.status === "waiting" ? { ...c, status: "agent" } : c));
    },
    [append, patch],
  );

  const resolveConversation = useCallback(
    (id: string) => {
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
    },
    [patch],
  );

  const resetLive = useCallback(() => {
    const fresh = seedConversations(Date.now()).find((c) => c.id === LIVE_ID)!;
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
