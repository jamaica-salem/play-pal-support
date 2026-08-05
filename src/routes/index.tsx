import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Gamepad, Gamepad2, Joystick, Monitor, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoreLayout } from "@/components/StoreLayout";
import { ProductGrid } from "@/components/ProductGrid";
import { categories, games } from "@/lib/games";
import heroImage from "@/assets/hero-featured.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GameVault — Buy PC & Console Games with AI Support" },
      {
        name: "description",
        content:
          "Shop PC, PlayStation, Xbox and Nintendo Switch games at GameVault, with instant AI customer support and human agents when you need them.",
      },
      { property: "og:title", content: "GameVault — Buy PC & Console Games with AI Support" },
      {
        property: "og:description",
        content:
          "A modern games marketplace with an AI support assistant and seamless human agent escalation.",
      },
    ],
  }),
  component: Home,
});

const icons = { Monitor, Gamepad2, Joystick, Gamepad, Download } as const;

function Home() {
  return (
    <StoreLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-accent-foreground">
              <Sparkle className="h-3.5 w-3.5" />
              Featured this week
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Discover Your Next Adventure
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              Thousands of PC and console titles, instant digital delivery, and a support assistant
              that actually answers — with a human specialist one tap away.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/games">
                  Browse Games
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/games/$gameId" params={{ gameId: "elden-ring" }}>
                  See featured title
                </Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
              {[
                { k: "2,000+", v: "Titles" },
                { k: "< 60s", v: "Digital delivery" },
                { k: "24/7", v: "AI support" },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-xl font-semibold">{s.k}</dt>
                  <dd className="text-xs text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
            <img
              src={heroImage}
              alt="Featured adventure game key art with an explorer overlooking a vast landscape"
              width={1600}
              height={900}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Featured games</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked releases our players are buying right now.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/games">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8">
          <ProductGrid games={games} />
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">Shop by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every platform, one storefront.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((c) => {
              const Icon = icons[c.icon as keyof typeof icons];
              return (
                <Link
                  key={c.name}
                  to="/games"
                  search={{ category: c.name }}
                  className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-colors hover:border-primary"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.count} titles</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-card)] lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Support that starts instantly, escalates smartly
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              GameAssist AI answers product, order, shipping and refund questions in seconds. When a
              case gets complicated, it hands the conversation to a human specialist — with the full
              context attached, so customers never repeat themselves.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/support">Open agent dashboard</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/games">Keep browsing</Link>
              </Button>
            </div>
          </div>
          <ol className="space-y-3">
            {[
              "Customer asks a question in the chat widget",
              "AI answers using product, order and policy data",
              "Unclear or repeated case triggers escalation",
              "Customer sees “Waiting for Agent” status",
              "Agent joins with an AI summary of the whole thread",
            ].map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </StoreLayout>
  );
}
