import { Link } from "@tanstack/react-router";
import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Gamepad2 className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-semibold">GameVault</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A modern games marketplace with AI-first customer support and real human backup.
          </p>
        </div>
        <FooterCol
          title="Store"
          links={[
            { label: "Browse games", to: "/games" },
            { label: "PC Games", to: "/games" },
            { label: "PlayStation", to: "/games" },
            { label: "Nintendo Switch", to: "/games" },
          ]}
        />
        <FooterCol
          title="Support"
          links={[
            { label: "Agent dashboard", to: "/support" },
            { label: "Shipping", to: "/games" },
            { label: "Returns", to: "/games" },
          ]}
        />
        <div>
          <h3 className="text-sm font-semibold">Prototype notice</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            All games, orders and support conversations shown here are mock data for demo purposes.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 GameVault Demo. Built as a product prototype.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
