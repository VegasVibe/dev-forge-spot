import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { clearSession, useSession } from "@/lib/session";
import { Label } from "@/components/ui-kit";
import { markAllRead, useNotifications } from "@/lib/notifications-store";

const nav = [
  { to: "/dashboard/entreprise", label: "Tableau de bord entreprise" },
  { to: "/dashboard/freelance", label: "Tableau de bord freelance" },
  { to: "/missions", label: "Missions" },
  { to: "/recommandations", label: "Recommandation IA" },
  { to: "/freelances", label: "Développeurs" },
  { to: "/shortlist", label: "Shortlist" },
  { to: "/candidatures", label: "Candidatures" },
  { to: "/entretiens", label: "Entretiens" },
  { to: "/suivi", label: "Suivi des missions" },
  { to: "/paiements", label: "Paiements" },
  { to: "/messagerie", label: "Messagerie" },
  { to: "/historique", label: "Historique" },
];

const account = [
  { to: "/parametres", label: "Paramètres" },
  { to: "/tarifs", label: "Facturation" },
];

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to as never}
      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
        active ? "bg-accent-soft text-accent font-medium ring-1 ring-accent/15" : "text-ink-soft hover:bg-card"
      }`}
    >
      <span className="size-4 grid place-items-center shrink-0">
        <span className={`size-2.5 rounded-[3px] border ${active ? "border-accent" : "border-ink-soft"}`} />
      </span>
      {label}
    </Link>
  );
}

export function AppShell({
  children,
  title,
  kicker,
  actions,
}: {
  children: ReactNode;
  title: string;
  kicker?: string;
  actions?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useSession();
  const notifications = useNotifications();
  const [openBell, setOpenBell] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <header className="glass-strong sticky top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 ring-1 ring-border">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid place-items-center size-8 rounded-lg bg-ink text-paper font-display font-semibold text-sm">N</span>
              <span className="font-display font-semibold text-[15px] tracking-tight">Nodale</span>
              <span className="hidden sm:inline label-mono border-l border-border pl-2.5">Console</span>
            </Link>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Link
                to="/missions"
                className="hidden md:flex items-center gap-2 rounded-full glass ring-1 ring-border px-3 py-1.5 text-xs text-ink-soft"
              >
                Rechercher une mission, un profil…
                <span className="text-[10px] font-mono text-ink-faint border border-border rounded px-1">⌘K</span>
              </Link>
              <div className="hidden sm:flex items-center rounded-full glass ring-1 ring-border p-0.5 text-xs">
                <Link
                  to="/dashboard/entreprise"
                  className={`px-3 py-1 rounded-full ${pathname.includes("entreprise") ? "bg-ink text-paper font-medium" : "text-ink-soft"}`}
                >
                  Entreprise
                </Link>
                <Link
                  to="/dashboard/freelance"
                  className={`px-3 py-1 rounded-full ${pathname.includes("freelance") && !pathname.startsWith("/freelances") ? "bg-ink text-paper font-medium" : "text-ink-soft"}`}
                >
                  Freelance
                </Link>
              </div>
              <div className="relative">
                <button
                  onClick={() => {
                    setOpenBell((o) => !o);
                    if (!openBell) markAllRead();
                  }}
                  className="relative grid place-items-center size-9 rounded-full glass ring-1 ring-border hover:bg-card transition-colors"
                  aria-label="Notifications"
                >
                  <span className="size-3.5 rounded-t-full border border-ink-soft border-b-0" />
                  {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-4 h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-medium">
                      {unread}
                    </span>
                  )}
                </button>
                {openBell && (
                  <div className="absolute right-0 mt-2 w-[320px] max-h-[380px] overflow-y-auto glass-strong rounded-2xl ring-1 ring-border p-3 shadow-lg">
                    <div className="px-1 pb-2">
                      <Label>Notifications</Label>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-1 py-3 text-xs text-ink-soft">
                        Aucune notification pour l'instant.
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {notifications.slice(0, 20).map((n) => (
                          <li key={n.id} className="rounded-xl px-2.5 py-2 hover:bg-card">
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-ink-soft">{n.detail}</div>
                            <div className="mt-0.5 text-[10px] font-mono text-ink-faint">
                              {n.audience} · {n.time}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <span className="grid place-items-center size-9 rounded-full bg-accent-soft text-accent font-display font-semibold text-sm ring-1 ring-accent/20">
                {(session?.name ?? "Nodale").slice(0, 2).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[248px_1fr] gap-4 lg:gap-6 py-6 pb-16">
          <aside className="lg:sticky lg:top-[76px] self-start">
            <div className="glass rounded-2xl ring-1 ring-border p-3">
              <div className="px-2 py-2">
                <Label>Navigation</Label>
              </div>
              <nav className="flex flex-col gap-0.5">
                {nav.map((item) => (
                  <NavLink key={item.to} {...item} active={pathname === item.to} />
                ))}
              </nav>
              <div className="my-3 h-px bg-line" />
              <div className="px-2 py-2">
                <Label>Compte</Label>
              </div>
              <nav className="flex flex-col gap-0.5">
                {account.map((item) => (
                  <NavLink key={item.to} {...item} active={pathname === item.to} />
                ))}
                <button
                  onClick={() => clearSession()}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-soft hover:bg-card text-left"
                >
                  <span className="size-4 grid place-items-center shrink-0">
                    <span className="size-2.5 rounded-full border border-ink-soft" />
                  </span>
                  Déconnexion
                </button>
              </nav>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
              <div>
                {kicker && <Label>{kicker}</Label>}
                <h1 className="mt-1 font-display font-semibold text-[32px] sm:text-[40px] leading-[1.05] tracking-tight">
                  {title}
                </h1>
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
