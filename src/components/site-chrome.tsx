import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SiteHeader() {
  return (
    <header className="glass-strong sticky top-0 z-30 ring-1 ring-border">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid place-items-center size-8 rounded-lg bg-ink text-paper font-display font-semibold text-sm">N</span>
          <span className="font-display font-semibold text-[15px] tracking-tight">Nodale</span>
        </Link>
        <nav className="ml-8 hidden md:flex items-center gap-7 text-sm text-ink-soft">
          <Link to="/produit" className="hover:text-foreground transition-colors">Produit</Link>
          <Link to="/missions" className="hover:text-foreground transition-colors">Missions</Link>
          <Link to="/freelances" className="hover:text-foreground transition-colors">Développeurs</Link>
          <Link to="/tarifs" className="hover:text-foreground transition-colors">Tarifs</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/auth" className="text-sm text-ink-soft hover:text-foreground transition-colors">Connexion</Link>
          <Link
            to="/auth"
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center size-7 rounded-lg bg-ink text-paper font-display font-semibold text-xs">N</span>
          <span className="font-display font-semibold tracking-tight">Nodale</span>
        </div>
        <p className="text-xs font-mono text-ink-faint">© 2026 Nodale — Missions techniques, du brief au paiement.</p>
      </div>
    </footer>
  );
}

export function SitePage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="relative">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
