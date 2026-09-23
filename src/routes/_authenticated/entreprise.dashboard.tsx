import { createFileRoute, Link } from "@tanstack/react-router";
import { CompanyShell } from "@/components/console-shell";
import { Avatar, BarChart, Label, Meter, PrimaryButton, SkillTag, StatCard, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { formatEuro, monthlySpend, useFreelances, useMissions, useNotifications } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/dashboard")({
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
  const me = useMe();
  const userId = me.data?.userId;
  const profile = me.data?.profile;
  const who = profile?.company_name || profile?.full_name || "votre entreprise";

  const { data: missions = [] } = useMissions();
  const { data: freelances = [] } = useFreelances();
  const { data: notifications = [] } = useNotifications(userId);

  const myMissions = missions.filter((m) => m.owner_id === userId);
  const active = myMissions.filter((m) => m.status === "active" || m.status === "todo");
  const totalBudget = myMissions.reduce((s, m) => s + m.budget, 0);
  const spent = myMissions
    .filter((m) => m.status === "done" || m.status === "paid")
    .reduce((s, m) => s + m.budget, 0);

  const collaborators = Array.from(
    new Map(
      myMissions
        .filter((m) => m.freelance_id)
        .map((m) => [m.freelance_id!, m]),
    ).values(),
  );

  return (
    <CompanyShell
      kicker={`Espace entreprise · ${who}`}
      title={`Bonjour, ${who}`}
      actions={
        <>
          <PrimaryButton to="/entreprise/missions">Publier une mission</PrimaryButton>
          <Link
            to={"/entreprise/freelances" as never}
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Voir les développeurs
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Budget engagé"
          value={formatEuro(totalBudget)}
          hint={`${myMissions.length} mission${myMissions.length > 1 ? "s" : ""} publiée${myMissions.length > 1 ? "s" : ""}`}
          meter={totalBudget ? Math.min(100, Math.round((spent / totalBudget) * 100)) : 0}
        />
        <StatCard label="Missions actives" value={String(active.length)} hint="En cours ou à pourvoir" tone="info" />
        <StatCard label="Dépensé" value={formatEuro(spent)} hint="Missions terminées ou payées" />
        <StatCard label="Développeurs mobilisés" value={String(collaborators.length)} hint="Missions confiées" tone="warn" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Missions en cours</h2>
            <Link to={"/entreprise/missions" as never} className="text-xs font-medium text-accent hover:text-accent/80">
              Tout voir
            </Link>
          </div>
          {active.length === 0 ? (
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-6 text-center">
              <p className="text-sm text-ink-soft">Aucune mission active pour l'instant.</p>
              <PrimaryButton to="/entreprise/missions" className="mt-4 mx-auto w-fit">
                Publier votre première mission
              </PrimaryButton>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {active.slice(0, 4).map((m) => {
                const freelance = freelances.find((f) => f.id === m.freelance_id);
                return (
                  <Link
                    key={m.id}
                    to={"/entreprise/missions/$missionId" as never}
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
                      <span className="text-ink-faint">{freelance?.name ?? "À attribuer"}</span>
                    </div>
                    <div className="mt-2">
                      <Meter value={m.progress} tone={m.status === "done" || m.status === "paid" ? "ok" : "accent"} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Dépenses</h2>
            <span className="text-[10px] font-mono text-ink-faint">6 mois</span>
          </div>
          <BarChart data={monthlySpend} unit="Estimation indicative" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Développeurs déjà mobilisés</h2>
            <Link to={"/entreprise/historique" as never} className="text-xs font-medium text-accent hover:text-accent/80">
              Historique
            </Link>
          </div>
          {collaborators.length === 0 ? (
            <p className="text-sm text-ink-soft">Aucune collaboration pour le moment.</p>
          ) : (
            <div className="divide-y divide-border">
              {collaborators.slice(0, 4).map((m) => {
                const f = freelances.find((fr) => fr.id === m.freelance_id);
                if (!f) return null;
                return (
                  <Link
                    key={f.id}
                    to={"/entreprise/freelances/$freelanceId" as never}
                    params={{ freelanceId: f.id }}
                    className="flex items-center gap-3 py-3 first:pt-0 group"
                  >
                    <Avatar initials={f.initials} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium group-hover:text-accent transition-colors">{f.name}</div>
                      <div className="text-xs text-ink-soft truncate">{m.title}</div>
                    </div>
                    <div className="ml-auto hidden sm:flex gap-1">
                      {f.skills.slice(0, 2).map((s) => <SkillTag key={s}>{s}</SkillTag>)}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
                      <div className="text-[10px] font-mono text-ink-faint">{f.rating}/5</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="mb-4">
            <Label>Notifications</Label>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune notification pour l'instant.</p>
            ) : (
              notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="flex gap-3">
                  <span className="mt-1.5 size-1.5 rounded-full bg-accent shrink-0" />
                  <div>
                    <div className="text-sm font-medium">{n.title}</div>
                    <div className="text-xs text-ink-soft">{n.detail}</div>
                    <div className="text-[10px] font-mono text-ink-faint mt-0.5">
                      {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </CompanyShell>
  );
}
