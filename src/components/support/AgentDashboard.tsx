import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Gamepad2, Loader2, Send, Sparkle, UserCheck, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import { PriorityBadge, StatusBadge } from "@/components/StatusBadge";
import { useSupport } from "@/lib/support/store";
import type { Conversation } from "@/lib/support/types";
import { formatWaiting, useMounted } from "@/lib/time";
import { fetchCopilotDraft } from "@/lib/api";
import { cn } from "@/lib/utils";

const order: Record<Conversation["status"], number> = { waiting: 0, agent: 1, ai: 2, resolved: 3 };

const CANNED_MACROS = [
  {
    label: "🔄 Refund Approved",
    text: "I have processed a full refund to your original payment method. Please allow 3–5 business days for the funds to land in your account.",
  },
  {
    label: "📦 Shipping Info",
    text: "Your order is currently in transit with GameVault Express. Tracking number: GVX-9931-4471, estimated delivery in 2 business days.",
  },
  {
    label: "🔑 Key Resent",
    text: "Your digital game key has been re-sent to your registered email address. Please check your inbox and spam folder.",
  },
  {
    label: "⏳ Under Review",
    text: "I'm escalating this issue to our senior logistics team for further investigation. We will update you within 24 hours.",
  },
];

function playChimeAlert() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc2.frequency.setValueAtTime(880.0, ctx.currentTime); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.6);
    osc2.stop(ctx.currentTime + 0.6);
  } catch {
    /* Ignore audio restriction errors */
  }
}

export function AgentDashboard() {
  const { conversations, agentTyping, claimConversation, resolveConversation, sendAgentMessage } =
    useSupport();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
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
  const prevWaitingCount = useRef(waitingCount);

  // Play audio chime notification when new ticket escalates to waiting
  useEffect(() => {
    if (waitingCount > prevWaitingCount.current) {
      playChimeAlert();
    }
    prevWaitingCount.current = waitingCount;
  }, [waitingCount]);

  const handleGenerateAiDraft = async () => {
    if (!selected) return;
    setLoadingDraft(true);
    try {
      const res = await fetchCopilotDraft(selected.id);
      setDraft(res.draft);
    } catch {
      setDraft(`Hi ${selected.customer.split(" ")[0]}, I've reviewed your conversation regarding ${selected.topic.toLowerCase()} and I am ready to help resolve this for you.`);
    } finally {
      setLoadingDraft(false);
    }
  };

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
            <button
              type="button"
              onClick={playChimeAlert}
              title="Test Chime Sound"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Volume2 className="h-3.5 w-3.5" />
              Sound On
            </button>
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
                {/* 1-Click AI Copilot Draft & Canned Macros Toolbar */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">Canned Macros:</span>
                    {CANNED_MACROS.map((macro) => (
                      <button
                        key={macro.label}
                        type="button"
                        onClick={() => setDraft(macro.text)}
                        className="rounded-lg border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:bg-card"
                      >
                        {macro.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={loadingDraft || selected.status === "resolved"}
                    onClick={handleGenerateAiDraft}
                    className="h-8 gap-1.5 border-primary/40 bg-primary/5 text-xs text-primary hover:bg-primary/10"
                  >
                    {loadingDraft ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkle className="h-3.5 w-3.5" />
                    )}
                    Generate AI Draft
                  </Button>
                </div>

                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={
                    selected.status === "resolved"
                      ? "This conversation is resolved."
                      : "Write a reply or click 'Generate AI Draft'…"
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
            <h2 className="text-sm font-semibold">Support Copilot Features</h2>
            <ol className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
              <li>1. <strong>Audio Chime:</strong> Plays a sound whenever a new ticket arrives.</li>
              <li>2. <strong>AI Draft:</strong> Click ✨ <em>Generate AI Draft</em> for Gemini to draft a reply.</li>
              <li>3. <strong>Macros:</strong> Click 🔄 <em>Refund Approved</em> or 📦 <em>Shipping Info</em> for 1-click templates.</li>
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
