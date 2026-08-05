import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDown, Headset, MessageCircle, RotateCcw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import { useSupport } from "@/lib/support/store";
import { QUICK_REPLIES } from "@/lib/support/types";
import { cn } from "@/lib/utils";

const statusStrip = {
  ai: { label: "AI Assistant", tone: "bg-info text-info-foreground" },
  waiting: { label: "Waiting for Agent", tone: "bg-warning text-warning-foreground" },
  agent: { label: "Agent Joined — Dana", tone: "bg-success text-success-foreground" },
  resolved: { label: "Conversation Resolved", tone: "bg-secondary text-secondary-foreground" },
} as const;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { live, aiTyping, agentTyping, sendCustomerMessage, resetLive } = useSupport();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [live?.messages.length, aiTyping, agentTyping, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, live?.messages.length]);

  const status = live?.status ?? "ai";
  const strip = statusStrip[status];
  const lastAiMessage = [...(live?.messages ?? [])]
    .reverse()
    .find((m) => m.role === "ai" && m.quickReplies?.length);
  const quickReplies =
    status === "ai" ? (lastAiMessage?.quickReplies ?? QUICK_REPLIES) : [];

  const send = (text: string) => {
    sendCustomerMessage(text);
    setInput("");
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-float)] sm:right-6">
          <div className={cn("flex items-center gap-3 border-b border-border px-4 py-3 transition-colors", status === "agent" ? "bg-emerald-700" : "bg-primary")}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/15">
              {status === "agent" ? (
                <Headset className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Bot className="h-5 w-5 text-primary-foreground" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary-foreground">
                {status === "agent" ? "Dana (Live Agent)" : "GameAssist (AI Agent)"}
              </p>
              <p className="truncate text-xs text-primary-foreground/80">
                {status === "agent" ? "Human Support Specialist" : "AI Automated Support"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={resetLive}
                aria-label="Restart conversation"
                className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Minimize chat"
                className="rounded-lg p-1.5 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                strip.tone,
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {strip.label}
            </span>
            {status === "waiting" && (
              <span className="text-xs text-muted-foreground">Avg. wait 2 min</span>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {live?.messages.map((m) => <ChatMessage key={m.id} message={m} />)}
            {aiTyping && <TypingIndicator label="GameAssist is typing" />}
            {agentTyping && <TypingIndicator label="Dana is typing" />}
            {status === "waiting" && !agentTyping && (
              <p className="rounded-xl border border-border bg-surface p-3 text-xs text-muted-foreground">
                A specialist has your full conversation history — including everything you told
                GameAssist. Open the{" "}
                <span className="font-medium text-foreground">Agent Dashboard</span> to accept this
                chat as the support agent.
              </p>
            )}
          </div>

          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                status === "agent" ? "Message Dana…" : "Ask about games, orders, refunds…"
              }
              className="h-10 rounded-xl"
            />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-transform hover:scale-105 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
