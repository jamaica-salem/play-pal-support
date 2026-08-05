import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, ShoppingCart, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { PlatformBadge, StockBadge } from "@/components/StatusBadge";
import { formatPrice, games, getGame } from "@/lib/games";

export const Route = createFileRoute("/games/$gameId")({
  loader: ({ params }) => {
    const game = getGame(params.gameId);
    if (!game) throw notFound();
    return { game };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Game not found — GameVault" }, { name: "robots", content: "noindex" }],
      };
    }
    const { game } = loaderData;
    const title = `${game.title} (${game.platform}) — GameVault`;
    return {
      meta: [
        { title },
        { name: "description", content: game.tagline },
        { property: "og:title", content: title },
        { property: "og:description", content: game.tagline },
      ],
    };
  },
  component: GameDetail,
});

function GameDetail() {
  const { game } = Route.useLoaderData();
  const related = games.filter((g) => g.id !== game.id).slice(0, 4);

  return (
    <StoreLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/games"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to browse
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <img
              src={game.cover}
              alt={`${game.title} cover art`}
              width={768}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PlatformBadge platform={game.platform} />
              <StockBadge stock={game.stock} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-current text-warning-foreground" />
                {game.rating} / 5
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{game.title}</h1>
            <p className="mt-2 text-base text-muted-foreground">{game.tagline}</p>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{game.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-5">
              <span className="text-3xl font-semibold">{formatPrice(game.price)}</span>
              <Button
                size="lg"
                disabled={game.stock === "out_of_stock"}
                onClick={() => toast.success(`${game.title} added to cart`)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5" /> Free shipping over $50
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" /> 30-day returns
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <InfoCard title="Platform availability">
                <ul className="space-y-1.5">
                  {game.platforms.map((p: string) => (
                    <li key={p} className="flex items-center justify-between text-sm">
                      <span>{p}</span>
                      <span className="text-xs text-success-foreground">Available</span>
                    </li>
                  ))}
                </ul>
              </InfoCard>
              <InfoCard title="Product information">
                <dl className="space-y-1.5 text-sm">
                  <Row label="Publisher" value={game.publisher} />
                  <Row label="Released" value={game.released} />
                  <Row label="Genre" value={game.genre} />
                  <Row label="Category" value={game.category} />
                </dl>
              </InfoCard>
            </div>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight">Related games</h2>
          <div className="mt-6">
            <ProductGrid games={related} action="details" />
          </div>
        </section>
      </div>
    </StoreLayout>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
