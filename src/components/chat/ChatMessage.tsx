import { Bot, Headset, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessageData } from "@/lib/support/types";
import { formatTime, useMounted } from "@/lib/time";

function Timestamp({ ts }: { ts: number }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return <span className="text-[11px] text-muted-foreground">{formatTime(ts)}</span>;
}

export function ChatMessage({ message }: { message: ChatMessageData }) {
  if (message.role === "system") {
    return (
      <div className="my-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="rounded-full bg-surface-strong px-3 py-1 text-center text-[11px] font-medium text-muted-foreground">
          {message.text}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  }

  const isCustomer = message.role === "customer";
  const isAgent = message.role === "agent";
  const isAi = message.role === "ai";

  return (
    <div className={cn("flex gap-2", isCustomer ? "flex-row-reverse" : "flex-row")}>
      <Avatar role={message.role} />
      <div className={cn("flex max-w-[80%] flex-col gap-1", isCustomer && "items-end")}>
        <div className={cn("flex items-center gap-1.5 text-[11px] font-semibold", isCustomer ? "flex-row-reverse text-muted-foreground" : "flex-row text-foreground")}>
          {isCustomer && <span>You</span>}
          {isAi && (
            <>
              <span className="text-primary font-bold">AI Agent</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                Bot
              </span>
            </>
          )}
          {isAgent && (
            <>
              <span className="text-success-foreground font-bold">Live Agent (Dana)</span>
              <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[9px] font-medium text-success-foreground">
                Human
              </span>
            </>
          )}
        </div>
        <div
          className={cn(
            "whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
            isCustomer
              ? "rounded-br-md bg-primary text-primary-foreground"
              : isAgent
                ? "rounded-bl-md border border-success/30 bg-success/10 text-foreground"
                : "rounded-bl-md border border-border bg-surface text-foreground",
          )}
        >
          {message.text}
        </div>
        <Timestamp ts={message.ts} />
      </div>
    </div>
  );
}

export function Avatar({ role }: { role: ChatMessageData["role"] }) {
  const styles =
    role === "customer"
      ? "bg-secondary text-secondary-foreground"
      : role === "agent"
        ? "bg-success text-success-foreground"
        : "bg-primary text-primary-foreground";
  const Icon = role === "customer" ? User : role === "agent" ? Headset : Bot;
  return (
    <span
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        styles,
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex gap-1 rounded-full border border-border bg-surface px-3 py-2">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
      {label}
    </div>
  );
}
