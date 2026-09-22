import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, StatCard, StatusBadge } from "@/components/ui-kit";
import { collaborations, formatEuro, getFreelance, missions } from "@/lib/mock-data";

export const Route = createFileRoute("/historique")({
  head: () => ({
    meta: [
      { title: "Historique des collaborations — Nodale" },
      { name: "description", content: "Retrouvez les anciens projets, les prestataires mobilisés et les montants associés." },
      { property: "og:title", content: "Historique des collaborations — Nodale" },
      { property: "og:description", content: "Projets passés, prestataires et montants, centralisés." },
    ],
  }),
  component: Historique,
});

function Historique() {
  const totalSpent = collaborations.reduce((s, c) => s + c.total, 0);
  const totalMissions = collaborations.reduce((s, c) => s + c.missions, 0);
  const past = missions.filter((m) => ["done", "paid", "archived"].includes(m.status));

  return (
    <AppShell kicker="Archives" title="Historique des collaborations">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total dépensé" value={formatEuro(totalSpent)} hint="Toutes missions confondues" />
        <StatCard label="Missions réalisées" value={String(totalMissions)} hint="Depuis 2023" />
        <StatCard label="Prestataires" value={String(collaborations.length)} hint="Développeurs fidélisés" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Par prestataire</h2>
          <div className="divide-y divide-border">
            {collaborations.map((c) => {
              const f = getFreelance(c.freelanceId)!;
              return (
                <Link
                  key={c.freelanceId}
                  to="/freelances/$freelanceId"
                  params={{ freelanceId: f.id }}
                  className="flex items-center gap-3 py-3.5 first:pt-0 group"
                >
                  <Avatar initials={f.initials} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium group-hover:text-accent transition-colors">{f.name}</div>
                    <div className="text-xs text-ink-soft truncate">{c.lastMission} · {c.period}</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-sm font-mono">{formatEuro(c.total)}</div>
                    <div className="text-[10px] font-mono text-ink-faint">{c.missions} missions · {c.rating}/5</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Projets clôturés</h2>
          <div className="divide-y divide-border">
            {past.map((m) => (
              <Link
                key={m.id}
                to="/missions/$missionId"
                params={{ missionId: m.id }}
                className="flex items-center justify-between gap-3 py-3.5 first:pt-0 group"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium group-hover:text-accent transition-colors truncate">{m.title}</div>
                  <div className="text-xs text-ink-soft truncate">
                    {m.company} · {getFreelance(m.freelanceId)?.name ?? "—"}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-mono">{formatEuro(m.budget)}</span>
                  <StatusBadge status={m.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
