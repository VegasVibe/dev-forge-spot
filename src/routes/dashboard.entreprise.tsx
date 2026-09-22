import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, BarChart, Label, Meter, SkillTag, StatCard, StatusBadge } from "@/components/ui-kit";
import {
  collaborations,
  formatEuro,
  getFreelance,
  missions,
  monthlySpend,
  notifications,
} from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/entreprise")({
  head: () => ({
    meta: [
      { title: "Tableau de bord entreprise — Nodale" },
      { name: "description", content: "Suivez vos missions en cours, votre budget consommé et vos paiements en attente." },
      { property: "og:title", content: "Tableau de bord entreprise — Nodale" },
      { property: "og:description", content: "Missions, budget consommé et paiements en attente en un écran." },
    ],
  }),
  component: DashboardEntreprise,
});

function DashboardEntreprise() {
  const companyMissions = missions.filter((m) => m.company === "Atelier Nord" || m.status === "active");

  return (
    <AppShell
      kicker="Espace entreprise · Atelier Nord"
      title="Bonjour, Atelier Nord"
      actions={
        <>
          <Link
            to="/onboarding/entreprise"
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Publier une mission
          </Link>
          <Link
            to="/freelances"
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Voir les développeurs
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Dépensé ce mois" value="48 200 €" hint="Budget alloué : 60 000 €" meter={80} />
        <StatCard label="Missions actives" value="3" hint="2 à faire · 2 terminées" tone="info" />
        <StatCard label="Total dépensé" value="178 050 €" hint="Sur 14 missions" />
        <StatCard label="En attente de paiement" value="9 750 €" hint="2 factures · échéance 14 j" tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Missions en cours</h2>
            <Link to="/suivi" className="text-xs font-medium text-accent hover:text-accent/80">Tout voir</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {companyMissions.slice(0, 4).map((m) => (
              <Link
                key={m.id}
                to="/missions/$missionId"
                params={{ missionId: m.id }}
                className="rounded-xl bg-card/70 ring-1 ring-border p-4 hover:ring-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{m.title}</span>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-2 text-xs text-ink-soft">{m.team} · {m.duration}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono">{formatEuro(m.budget)}</span>
                  <span className="text-ink-faint">{getFreelance(m.freelanceId)?.name ?? "À attribuer"}</span>
                </div>
                <div className="mt-2">
                  <Meter value={m.progress} tone={m.status === "done" || m.status === "paid" ? "ok" : "accent"} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Dépenses</h2>
            <span className="text-[10px] font-mono text-ink-faint">6 mois</span>
          </div>
          <BarChart data={monthlySpend} unit="+18 % vs T1" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Développeurs déjà mobilisés</h2>
            <Link to="/historique" className="text-xs font-medium text-accent hover:text-accent/80">Historique</Link>
          </div>
          <div className="divide-y divide-border">
            {collaborations.slice(0, 4).map((c) => {
              const f = getFreelance(c.freelanceId)!;
              return (
                <Link
                  key={c.freelanceId}
                  to="/freelances/$freelanceId"
                  params={{ freelanceId: f.id }}
                  className="flex items-center gap-3 py-3 first:pt-0 group"
                >
                  <Avatar initials={f.initials} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium group-hover:text-accent transition-colors">{f.name}</div>
                    <div className="text-xs text-ink-soft truncate">{c.lastMission}</div>
                  </div>
                  <div className="ml-auto hidden sm:flex gap-1">
                    {f.skills.slice(0, 2).map((s) => <SkillTag key={s}>{s}</SkillTag>)}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono">{formatEuro(c.total)}</div>
                    <div className="text-[10px] font-mono text-ink-faint">{c.missions} missions · {c.rating}/5</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="mb-4">
            <Label>Notifications</Label>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3">
                <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                <div>
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-ink-soft">{n.detail}</div>
                  <div className="text-[10px] font-mono text-ink-faint mt-0.5">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
