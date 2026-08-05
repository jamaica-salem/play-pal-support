import { ProductCard } from "@/components/ProductCard";
import type { Game } from "@/lib/games";

export function ProductGrid({
  games,
  action = "cart",
}: {
  games: Game[];
  action?: "cart" | "details";
}) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
        <p className="font-medium">No games match your filters</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search term or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {games.map((game) => (
        <ProductCard key={game.id} game={game} action={action} />
      ))}
    </div>
  );
}
