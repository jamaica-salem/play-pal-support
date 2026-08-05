import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Gamepad2, Send, Sparkle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import { useSupport } from "@/lib/support/store";
import type { Conversation } from "@/lib/support/types";
import { formatWaiting, useMounted } from "@/lib/time";
import { cn } from "@/lib/utils";

const order: Record<Conversation["status"], number> = { waiting: 0, agent: 1, ai: 2, resolved: 3 };

export function AgentDashboard() {
  const { conversations, agentTyping, claimConversation, resolveConversation, sendAgentMessage } =
    useSupport();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const mounted = useMounted();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const sorted = useMemo(
    () => [...conversations].sort((a, b) => order[a.status] - order[b.status] || b.createdAt - a.createdAt),
    [conversations],
  );

  const selected = conversations.find((c) => c.id === selectedId) ?? sorted[0];

  const waitingCount = conversations.filter((c) => c.status === "waiting").length;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-semibold tracking-tight">GameVault Support</span>
          </Link>
          <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:inline">
            Agent: Dana R.
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-xs font-medium text-warning-foreground">
              <Clock className="h-3.5 w-3.5" />
              {waitingCount} waiting
            </span>
            <Button variant="outline" asChild>
              <Link to="/">Back to store</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)_340px] sm:p-6">
        <aside className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <p className="text-xs text-muted-foreground">{conversations.length} total</p>
          </div>
          <ul className="max-h-[70vh] divide-y divide-border overflow-y-auto">
            {sorted.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-surface",
                    selected?.id === c.id && "bg-accent/60",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.customer}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{c.topic}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-[11px] text-muted-foreground">
                      {mounted
                        ? `${formatWaiting(c.escalatedAt ?? c.createdAt, now)}${c.status === "waiting" ? " waiting" : " ago"}`
                        : "—"}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-semibold">{selected.customer}</h2>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <StatusBadge status={selected.status} className="ml-auto" />
                {selected.status === "waiting" && (
                  <Button size="sm" onClick={() => claimConversation(selected.id)}>
                    <UserCheck className="h-4 w-4" />
                    Accept chat
                  </Button>
                )}
                {selected.status !== "resolved" && (
                  <Button size="sm" variant="outline" onClick={() => resolveConversation(selected.id)}>
                    <CheckCircle2 className="h-4 w-4" />
                    Resolve
                  </Button>
                )}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                {selected.messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}
                {agentTyping && <TypingIndicator label="Sending agent greeting" />}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendAgentMessage(selected.id, draft);
                  setDraft("");
                }}
                className="border-t border-border p-4"
              >
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    selected.status === "resolved"
                      ? "This conversation is resolved."
                      : "Write a reply to the customer…"
                  }
                  disabled={selected.status === "resolved"}
                  rows={3}
                  className="resize-none rounded-xl"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Replies are delivered straight into the customer's chat widget.
                  </p>
                  <Button type="submit" disabled={selected.status === "resolved" || !draft.trim()}>
                    <Send className="h-4 w-4" />
                    Send reply
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading conversations…
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkle className="h-4 w-4 text-primary" />
              AI summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {selected?.summary ??
                "No escalation yet. GameAssist AI is still handling this conversation on its own."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-sm font-semibold">Case details</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Detail label="Topic" value={selected?.topic ?? "—"} />
              <Detail
                label="Messages"
                value={selected ? String(selected.messages.length) : "—"}
              />
              <Detail
                label="AI replies"
                value={
                  selected ? String(selected.messages.filter((m) => m.role === "ai").length) : "—"
                }
              />
              <Detail label="Priority" value={selected?.priority ?? "—"} />
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-sm font-semibold">How to demo</h2>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>1. Open the store and chat with GameAssist AI.</li>
              <li>2. Ask something it can't answer, or tap “Talk to Human Agent”.</li>
              <li>3. Return here — the chat appears as “Waiting for Agent”.</li>
              <li>4. Accept the chat and reply; the customer sees your messages live.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  );
}
