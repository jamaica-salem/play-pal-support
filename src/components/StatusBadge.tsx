import { cn } from "@/lib/utils";
import type { ConversationStatus, Priority } from "@/lib/support/types";
import { statusLabel } from "@/lib/support/types";
import type { Game } from "@/lib/games";
import { stockLabel } from "@/lib/games";

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

const statusStyles: Record<ConversationStatus, string> = {
  ai: "bg-info text-info-foreground",
  waiting: "bg-warning text-warning-foreground",
  agent: "bg-success text-success-foreground",
  resolved: "bg-secondary text-secondary-foreground",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ConversationStatus;
  className?: string;
}) {
  return (
    <span className={cn(base, statusStyles[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel[status]}
    </span>
  );
}

const stockStyles: Record<Game["stock"], string> = {
  in_stock: "bg-success text-success-foreground",
  low_stock: "bg-warning text-warning-foreground",
  preorder: "bg-info text-info-foreground",
  out_of_stock: "bg-secondary text-secondary-foreground",
};

export function StockBadge({ stock }: { stock: Game["stock"] }) {
  return <span className={cn(base, stockStyles[stock])}>{stockLabel[stock]}</span>;
}

export function PlatformBadge({ platform }: { platform: string }) {
  return (
    <span className={cn(base, "border border-border bg-surface text-muted-foreground")}>
      {platform}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  high: "bg-warning text-warning-foreground",
  normal: "bg-info text-info-foreground",
  low: "bg-secondary text-secondary-foreground",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, "capitalize", priorityStyles[priority])}>{priority}</span>;
}
