import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge, StockBadge } from "@/components/StatusBadge";
import { formatPrice, type Game } from "@/lib/games";
import { toast } from "sonner";

export function ProductCard({ game, action = "cart" }: { game: Game; action?: "cart" | "details" }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)]">
      <Link
        to="/games/$gameId"
        params={{ gameId: game.id }}
        className="relative block aspect-[3/4] overflow-hidden bg-surface-strong"
      >
        <img
          src={game.cover}
          alt={`${game.title} cover art`}
          loading="lazy"
          width={768}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3">
          <StockBadge stock={game.stock} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug">
            <Link to="/games/$gameId" params={{ gameId: game.id }} className="hover:text-primary">
              {game.title}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-current text-warning-foreground" />
            {game.rating}
          </span>
        </div>

        <PlatformBadge platform={game.platform} />

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-semibold">{formatPrice(game.price)}</span>
          {action === "cart" ? (
            <Button
              size="sm"
              disabled={game.stock === "out_of_stock"}
              onClick={() => toast.success(`${game.title} added to cart`)}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
          ) : (
            <Button size="sm" variant="outline" asChild>
              <Link to="/games/$gameId" params={{ gameId: game.id }}>
                View Details
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
