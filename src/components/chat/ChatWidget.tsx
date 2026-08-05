import { useEffect, useRef, useState } from "react";
import { Bot, CheckCircle2, ChevronDown, Download, Headset, Mail, MessageCircle, Paperclip, RotateCcw, Send, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, TypingIndicator } from "@/components/chat/ChatMessage";
import { useSupport } from "@/lib/support/store";
import { QUICK_REPLIES, type Conversation } from "@/lib/support/types";
import { cn } from "@/lib/utils";

const statusStrip = {
  ai: { label: "AI Assistant", tone: "bg-info text-info-foreground" },
  waiting: { label: "Waiting for Agent", tone: "bg-warning text-warning-foreground" },
  agent: { label: "Agent Joined — Dana", tone: "bg-success text-success-foreground" },
  resolved: { label: "Conversation Resolved", tone: "bg-secondary text-secondary-foreground" },
} as const;

const CSAT_TAGS = ["Fast Resolution", "Clear Explanation", "Friendly Agent", "Easy Handoff"];

function downloadTranscript(conversation: Conversation) {
  if (!conversation || !conversation.messages.length) {
    toast.error("No transcript available to export.");
    return;
  }

  const lines: string[] = [];
  lines.push("==================================================");
  lines.push("           GAMEVAULT STORE SUPPORT TRANSCRIPT      ");
  lines.push("==================================================");
  lines.push(`Ticket ID:   ${conversation.id}`);
  lines.push(`Customer:    ${conversation.customer} (${conversation.email})`);
  lines.push(`Topic:       ${conversation.topic}`);
  lines.push(`Status:      ${conversation.status.toUpperCase()}`);
  lines.push(`Date:        ${new Date().toLocaleDateString()}`);
  lines.push("--------------------------------------------------\n");

  conversation.messages.forEach((msg) => {
    const timeStr = new Date(msg.ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let sender = "CUSTOMER";
    if (msg.role === "ai") sender = "GAMEASSIST (AI AGENT)";
    if (msg.role === "agent") sender = "DANA (SUPPORT SPECIALIST)";
    if (msg.role === "system") sender = "SYSTEM";

    lines.push(`[${timeStr}] ${sender}:`);
    lines.push(`  ${msg.text}`);
    if (msg.attachment) {
      lines.push(`  📎 [Attached File: Screenshot/Receipt]`);
    }
    lines.push("");
  });

  lines.push("==================================================");
  lines.push("       Thank you for choosing GameVault Support!  ");
  lines.push("==================================================");

  const textContent = lines.join("\n");
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `GameVault_Support_Transcript_${conversation.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast.success("Support transcript downloaded!");
}

function emailTranscript(conversation: Conversation) {
  if (!conversation || !conversation.messages.length) {
    toast.error("No transcript available to email.");
    return;
  }
  toast.success(`Transcript emailed to ${conversation.email || "player@gamevault.com"}!`);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState<string | null>(null);
  const { live, aiTyping, agentTyping, sendCustomerMessage, resetLive, submitFeedback } = useSupport();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSAT Survey state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["Fast Resolution"]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [live?.messages.length, aiTyping, agentTyping, open, live?.status, submitted, attachment]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setAttachment(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const send = (text: string) => {
    sendCustomerMessage(text, attachment ?? undefined);
    setInput("");
    setAttachment(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleFeedbackSubmit = () => {
    if (!live) return;
    submitFeedback(live.id, {
      rating,
      tags: selectedTags,
    });
    setSubmitted(true);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[580px] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-float)] sm:right-6">
          <div
            className={cn(
              "flex items-center gap-3 border-b border-border px-4 py-3 transition-colors",
              status === "agent" ? "bg-emerald-700" : "bg-primary",
            )}
          >
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
                GameVault Store Support
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              {live && (
                <>
                  <button
                    type="button"
                    onClick={() => downloadTranscript(live)}
                    title="Download chat transcript (.txt)"
                    className="rounded-lg p-1.5 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => emailTranscript(live)}
                    title="Email chat transcript"
                    className="rounded-lg p-1.5 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={resetLive}
                title="Reset conversation"
                className="rounded-lg p-1.5 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={cn("px-4 py-1 text-center text-xs font-medium", strip.tone)}>
            {strip.label}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {live?.messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {aiTyping && <TypingIndicator label="GameAssist is typing…" />}
            {agentTyping && <TypingIndicator label="Dana is typing…" />}

            {/* End-of-Chat CSAT & Feedback Survey */}
            {status === "resolved" && (
              <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-center shadow-sm space-y-3">
                {submitted || live?.feedback ? (
                  <div className="space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-semibold">Thank you for your feedback!</h4>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= (live?.feedback?.rating ?? rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30",
                          )}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {(live?.feedback?.tags ?? selectedTags).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">How was your support experience?</h4>
                    <p className="text-xs text-muted-foreground">
                      Rate your session to help us improve.
                    </p>

                    {/* 5-Star Rating Buttons */}
                    <div className="flex justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-125"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 transition-colors",
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30",
                            )}
                          />
                        </button>
                      ))}
                    </div>

                    {/* CSAT Quick Tag Pills */}
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {CSAT_TAGS.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground hover:border-primary/50",
                            )}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleFeedbackSubmit}
                      className="mt-2 w-full rounded-xl"
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}

                {/* Export & Email Transcript Buttons inside Resolved Card */}
                {live && (
                  <div className="mt-3 flex items-center justify-center gap-2 border-t border-border pt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => downloadTranscript(live)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download Transcript
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => emailTranscript(live)}
                      className="h-8 rounded-lg text-xs"
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" /> Email Transcript
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {status !== "resolved" && quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border bg-surface px-3 py-2">
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

          {/* Attachment Preview Bar */}
          {attachment && (
            <div className="flex items-center gap-2 border-t border-border bg-surface px-3.5 py-2 text-xs">
              <Paperclip className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate">1 Image attached</span>
              <img src={attachment} alt="Upload preview" className="h-7 w-7 rounded object-cover border border-border" />
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="ml-auto rounded p-0.5 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-1.5 border-t border-border p-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={status === "resolved"}
              onClick={() => fileInputRef.current?.click()}
              title="Attach screenshot or receipt image"
              className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-primary"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status === "resolved"}
              placeholder={
                status === "resolved"
                  ? "Conversation resolved."
                  : status === "agent"
                    ? "Message Dana…"
                    : "Ask question or attach image…"
              }
              className="h-10 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={status === "resolved" || (!input.trim() && !attachment)}
              className="h-10 w-10 shrink-0 rounded-xl"
            >
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
