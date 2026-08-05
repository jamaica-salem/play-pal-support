import { formatPrice, games, mockOrder, stockLabel } from "@/lib/games";
import { QUICK_REPLIES } from "./types";

export type AiReply = {
  text: string;
  quickReplies?: string[];
  confident: boolean;
  escalate?: boolean;
  topic: string;
};

const ESCALATION_WORDS = [
  "agent",
  "human",
  "support representative",
  "real person",
  "representative",
  "speak to someone",
  "talk to someone",
];

export function wantsHuman(input: string) {
  const q = input.toLowerCase();
  return ESCALATION_WORDS.some((w) => q.includes(w));
}

function matchGame(q: string) {
  return games.find((g) => {
    const t = g.title.toLowerCase();
    if (q.includes(t)) return true;
    const keys = [g.id.replace(/-/g, " "), ...(t.split(":")[0] ?? "").split(" ")].filter(
      (k) => k.length > 4,
    );
    return keys.some((k) => q.includes(k.toLowerCase()));
  });
}

export function getAiReply(input: string): AiReply {
  const q = input.toLowerCase().trim();
  const game = matchGame(q);

  if (wantsHuman(input)) {
    return {
      text: "Of course — let me bring in a human specialist.",
      confident: true,
      escalate: true,
      topic: "Human agent requested",
    };
  }

  if (game) {
    if (q.includes("price") || q.includes("how much") || q.includes("cost")) {
      return {
        text: `${game.title} is currently ${formatPrice(game.price)} for the ${game.platform} edition. That price includes all released updates, and digital keys are delivered instantly after checkout.`,
        quickReplies: ["Check Game Availability", "Shipping Information"],
        confident: true,
        topic: `Pricing — ${game.title}`,
      };
    }
    if (q.includes("platform") || q.includes("console") || q.includes("support")) {
      return {
        text: `${game.title} is available on ${game.platforms.join(", ")}. Cross-platform saves are not supported, so pick the platform you play on most.`,
        quickReplies: ["Check Game Availability", "Refund Policy"],
        confident: true,
        topic: `Platform info — ${game.title}`,
      };
    }
    return {
      text: `${game.title} — ${stockLabel[game.stock]}, ${formatPrice(game.price)} on ${game.platform}. ${game.tagline} Want the full details or a stock check on another platform?`,
      quickReplies: ["Check Game Availability", "Refund Policy", "Talk to Human Agent"],
      confident: true,
      topic: `Product question — ${game.title}`,
    };
  }

  if (
    q.includes("track") ||
    q.includes("my order") ||
    q.includes("where is") ||
    q.includes("delivery") ||
    q.includes("purchase")
  ) {
    return {
      text: `Order ${mockOrder.id} (placed ${mockOrder.placed}) is **${mockOrder.status}** with ${mockOrder.carrier}. Tracking number ${mockOrder.tracking}, estimated delivery ${mockOrder.eta}. Items: ${mockOrder.items.join(", ")}.`,
      quickReplies: ["Shipping Information", "Talk to Human Agent"],
      confident: true,
      topic: "Order tracking",
    };
  }

  if (q.includes("refund") || q.includes("return") || q.includes("cancel")) {
    return {
      text: "Physical games can be returned unopened within 30 days for a full refund. Digital keys are refundable within 14 days as long as the key has not been redeemed. Refunds land back on your original payment method in 3–5 business days.",
      quickReplies: ["Track My Order", "Talk to Human Agent"],
      confident: true,
      topic: "Refund policy",
    };
  }

  if (q.includes("ship") || q.includes("shipping") || q.includes("how long")) {
    return {
      text: "Standard shipping takes 3–5 business days and is free over $50. Express is 1–2 business days for $9.99. Digital downloads arrive by email within a minute of your order confirmation.",
      quickReplies: ["Track My Order", "Refund Policy"],
      confident: true,
      topic: "Shipping information",
    };
  }

  if (q.includes("availability") || q.includes("in stock") || q.includes("available")) {
    return {
      text: `Here's live stock right now:\n${games.map((g) => `• ${g.title} — ${stockLabel[g.stock]} (${g.platform})`).join("\n")}`,
      quickReplies: ["Refund Policy", "Shipping Information"],
      confident: true,
      topic: "Availability check",
    };
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return {
      text: "Hey! Happy to help. You can ask me about a specific game, your order status, shipping, or refunds.",
      quickReplies: QUICK_REPLIES,
      confident: true,
      topic: "Greeting",
    };
  }

  return {
    text: "I'm not confident I can answer that correctly. I don't want to guess on something this specific — a human specialist will be better here.",
    confident: false,
    escalate: true,
    topic: "Unresolved question",
  };
}

export function buildSummary(topic: string, reason: string, lastCustomerMessage: string) {
  return `Customer contacted support about: ${topic.toLowerCase()}. Last message: "${lastCustomerMessage}". Escalation reason: ${reason}. AI has already shared the relevant store policy and product details, so the customer does not need to repeat their concern.`;
}
