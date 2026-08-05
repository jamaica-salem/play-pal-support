import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { Input } from "@/components/ui/input";
import { categories, games } from "@/lib/games";
import { cn } from "@/lib/utils";

type GamesSearch = { category?: string };

export const Route = createFileRoute("/games/")({
  validateSearch: (search: Record<string, unknown>): GamesSearch =>
    typeof search["category"] === "string" ? { category: search["category"] } : {},
  head: () => ({
    meta: [
      { title: "Browse Games — GameVault Store" },
      {
        name: "description",
        content:
          "Search and filter PC, PlayStation, Xbox, Nintendo Switch and digital download games with live availability and pricing.",
      },
      { property: "og:title", content: "Browse Games — GameVault Store" },
      {
        property: "og:description",
        content: "Search the full GameVault catalogue by platform, price and availability.",
      },
    ],
  }),
  component: BrowseGames,
});

function BrowseGames() {
  const { category } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>(category ?? "All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter((g) => {
      const matchesCategory =
        active === "All" || g.category === active || g.platforms.some((p) => p.includes(active));
      const matchesQuery =
        !q || g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [active, query]);

  return (
    <StoreLayout>
      <div className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight">Browse games</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {filtered.length} of {games.length} titles shown
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or genre…"
              className="h-11 rounded-xl bg-background pl-9"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {["All", ...categories.map((c) => c.name)].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <ProductGrid games={filtered} action="details" />
      </div>
    </StoreLayout>
  );
}
