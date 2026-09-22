import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BarChart, Label, Meter, SkillTag, StatCard, StatusBadge } from "@/components/ui-kit";
import { formatEuro, freelances, missions, monthlySpend, payments } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/freelance")({
  head: () => ({
    meta: [
      { title: "Tableau de bord freelance — Nodale" },
      { name: "description", content: "Missions acceptées, rémunérations en attente et visibilité de votre profil freelance." },
      { property: "og:title", content: "Tableau de bord freelance — Nodale" },
      { property: "og:description", content: "Vos missions, vos paiements et votre profil dans un mini CRM." },
    ],
  }),
  component: DashboardFreelance,
});

function DashboardFreelance() {
  const me = freelances[0]!;
  const mine = missions.filter((m) => m.freelanceId === me.id || m.status === "todo").slice(0, 4);
  const pending = payments.filter((p) => p.state !== "paid");

  return (
    <AppShell
      kicker={`Espace freelance · ${me.title}`}
      title={`Bonjour, ${me.name.split(" ")[0]}`}
      actions={
        <>
          <Link
            to="/missions"
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Trouver une mission
          </Link>
          <Link
            to="/freelances/$freelanceId"
            params={{ freelanceId: me.id }}
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Voir mon profil public
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Missions actives" value="2" hint="1 candidature en attente" tone="info" />
        <StatCard label="Revenus encaissés" value="112 400 €" hint="En avance de 8 %" tone="ok" />
        <StatCard label="Paiements en attente" value="11 950 €" hint="3 jalons à venir" tone="warn" />
        <StatCard label="Note moyenne" value={`${me.rating}/5`} hint={`${me.reviews} évaluations`} />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Mes missions</h2>
            <Link to="/suivi" className="text-xs font-medium text-accent hover:text-accent/80">Suivi détaillé</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {mine.map((m) => (
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
                <div className="mt-2 text-xs text-ink-soft">{m.company} · {m.duration}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono">{formatEuro(m.budget)}</span>
                  <span className="text-ink-faint">{m.progress}%</span>
                </div>
                <div className="mt-2">
                  <Meter value={m.progress} tone={m.status === "paid" ? "ok" : "accent"} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Revenus</h2>
            <span className="text-[10px] font-mono text-ink-faint">6 mois</span>
          </div>
          <BarChart data={monthlySpend} unit="Trimestre en hausse" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Paiements à venir</h2>
            <Link to="/paiements" className="text-xs font-medium text-accent hover:text-accent/80">Tout voir</Link>
          </div>
          <div className="divide-y divide-border">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.label}</div>
                  <div className="text-xs text-ink-soft">{p.counterpart} · {p.date}</div>
                </div>
                <div className="text-sm font-mono">{formatEuro(p.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <Label>Mon profil</Label>
          <h2 className="mt-2 font-display font-semibold text-lg">{me.title}</h2>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">{me.bio}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {me.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{me.rate} €</div>
              <div className="label-mono">/ jour</div>
            </div>
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{me.missions}</div>
              <div className="label-mono">Missions</div>
            </div>
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{me.rating}</div>
              <div className="label-mono">Note</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
