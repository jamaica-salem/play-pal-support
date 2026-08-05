import { Link } from "@tanstack/react-router";
import { Gamepad2, Search, ShoppingCart, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">GameVault</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" label="Home" exact />
          <NavLink to="/games" label="Browse Games" />
          <NavLink to="/support" label="Agent Dashboard" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/games"
            className="hidden items-center gap-2 rounded-full border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
            Search games
          </Link>
          <Button variant="outline" size="icon" aria-label="Cart">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/support">
              <LifeBuoy className="h-4 w-4" />
              Support
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: exact ?? false }}
      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
    >
      {label}
    </Link>
  );
}
