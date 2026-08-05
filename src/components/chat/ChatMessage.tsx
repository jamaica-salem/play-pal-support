import { useState } from "react";
import { Bot, Check, Headset, ShoppingCart, Star, User, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatMessageData } from "@/lib/support/types";
import { games, ORDERS, type Game, type Order } from "@/lib/games";
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

  // Client-side card detection fallback if backend didn't populate gameCard or orderCard
  let gameCard = message.gameCard;
  let orderCard = message.orderCard;

  if (!gameCard && isAi && message.text) {
    const lowerText = message.text.toLowerCase();
    if (lowerText.includes("elden ring")) {
      gameCard = games.find((g) => g.id === "elden-ring");
    } else if (lowerText.includes("cyberpunk")) {
      gameCard = games.find((g) => g.id === "cyberpunk-2077");
    } else if (lowerText.includes("zelda")) {
      gameCard = games.find((g) => g.id === "zelda-breath-of-the-wild");
    } else if (lowerText.includes("gta") || lowerText.includes("grand theft auto")) {
      gameCard = games.find((g) => g.id === "grand-theft-auto-v");
    } else if (lowerText.includes("spider-man") || lowerText.includes("spiderman")) {
      gameCard = games.find((g) => g.id === "marvels-spider-man-2");
    }
  }

  if (!orderCard && isAi && message.text) {
    const lowerText = message.text.toLowerCase();
    if (lowerText.includes("gv-48219") || lowerText.includes("gamevault express")) {
      orderCard = ORDERS["GV-48219"];
    }
  }

  return (
    <div className={cn("flex gap-2", isCustomer ? "flex-row-reverse" : "flex-row")}>
      <Avatar role={message.role} />
      <div className={cn("flex max-w-[85%] flex-col gap-1", isCustomer && "items-end")}>
        <div
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-semibold",
            isCustomer ? "flex-row-reverse text-muted-foreground" : "flex-row text-foreground",
          )}
        >
          {isCustomer && <span>You</span>}
          {isAi && (
            <>
              <span className="font-bold text-primary">AI Agent</span>
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                Bot
              </span>
            </>
          )}
          {isAgent && (
            <>
              <span className="font-bold text-emerald-600">Live Agent (Dana)</span>
              <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600">
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
                ? "rounded-bl-md border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-foreground"
                : "rounded-bl-md border border-border bg-surface text-foreground",
          )}
        >
          {message.text}
        </div>

        {/* Uploaded Image / Receipt Attachment Preview */}
        {message.attachment && (
          <div className="mt-1 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-sm">
            <a href={message.attachment} target="_blank" rel="noreferrer" title="Click to view full image">
              <img
                src={message.attachment}
                alt="Attachment preview"
                className="max-h-48 max-w-full rounded-lg object-contain transition-transform hover:scale-105"
              />
            </a>
          </div>
        )}

        {/* Rich Interactive Game Card */}
        {gameCard && <GameCardWidget game={gameCard} />}

        {/* Rich Interactive Order Tracker Stepper */}
        {orderCard && <OrderTrackerWidget order={orderCard} />}

        <Timestamp ts={message.ts} />
      </div>
    </div>
  );
}

function GameCardWidget({ game }: { game: Game }) {
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-1.5 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40">
      <div className="flex items-center gap-3 p-2.5">
        <img
          src={game.cover}
          alt={game.title}
          className="h-16 w-12 shrink-0 rounded-lg object-cover shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="truncate text-xs font-bold text-foreground">{game.title}</h4>
            <span className="shrink-0 font-bold text-primary text-xs">${game.price.toFixed(2)}</span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{game.platform}</p>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {game.rating}
            </span>
            <Button
              type="button"
              size="sm"
              variant={added ? "secondary" : "default"}
              onClick={() => {
                setAdded(true);
                toast.success(`Added ${game.title} to cart!`);
                setTimeout(() => setAdded(false), 2500);
              }}
              className="h-7 px-2.5 text-[11px] font-medium"
            >
              {added ? (
                <>
                  <Check className="mr-1 h-3 w-3 text-emerald-500" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1 h-3 w-3" /> Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderTrackerWidget({ order }: { order: Order }) {
  const steps = [
    { label: "Placed", date: order.placed, done: true },
    { label: "Processing", date: "Aug 2", done: true },
    { label: "In Transit", date: "Aug 5", current: true, done: true },
    { label: "Delivered", date: order.eta, done: false },
  ];

  return (
    <div className="mt-1.5 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-1.5">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground">{order.id}</span>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          {order.carrier}
        </span>
      </div>

      <div className="mt-3">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-3 right-3 top-3 h-0.5 bg-border -z-0" />
          <div className="absolute left-3 top-3 h-0.5 bg-primary transition-all w-2/3 -z-0" />

          {steps.map((s, idx) => (
            <div key={s.label} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-transform",
                  s.current
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105 animate-pulse"
                    : s.done
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface border border-border text-muted-foreground",
                )}
              >
                {s.done ? <Check className="h-3 w-3" /> : idx + 1}
              </div>
              <span className="mt-1 text-[10px] font-medium text-foreground">{s.label}</span>
              <span className="text-[9px] text-muted-foreground">{s.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-surface px-2.5 py-1.5 text-[11px]">
        <span className="text-muted-foreground">Tracking Number:</span>
        <span className="font-mono font-medium text-foreground">{order.tracking}</span>
      </div>
    </div>
  );
}

export function Avatar({ role }: { role: ChatMessageData["role"] }) {
  const styles =
    role === "customer"
      ? "bg-secondary text-secondary-foreground"
      : role === "agent"
        ? "bg-emerald-600 text-white"
        : "bg-primary text-primary-foreground";
  const Icon = role === "customer" ? User : role === "agent" ? Headset : Bot;
  return (
    <span
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-xs",
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
