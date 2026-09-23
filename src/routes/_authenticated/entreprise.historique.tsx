import { createFileRoute, Link } from "@tanstack/react-router";

import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Panel, StatCard, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { formatEuro, useFreelances, useMissions } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/historique")({
  head: () => ({
    meta: [
      { title: "Historique des collaborations — Nodale" },
      { name: "description", content: "Retrouvez vos anciens projets, les développeurs mobilisés et les montants associés." },
      { property: "og:title", content: "Historique des collaborations — Nodale" },
      { property: "og:description", content: "Anciens projets, prestataires et montants en un seul endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoriquePage,
});

function HistoriquePage() {
  const me = useMe();
  const userId = me.data?.userId;
  const { data: missions = [] } = useMissions();
  const { data: freelances = [] } = useFreelances();

  const mine = missions.filter((m) => m.owner_id === userId);
  const closed = mine.filter((m) => m.status === "done" || m.status === "paid" || m.status === "archived");
  const total = closed.reduce((s, m) => s + m.budget, 0);
  const partners = new Set(closed.map((m) => m.freelance_id).filter(Boolean));

  return (
    <CompanyShell kicker="Archives" title="Historique des collaborations">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Missions terminées" value={String(closed.length)} hint="Terminées, payées ou archivées" />
        <StatCard label="Montant total" value={formatEuro(total)} tone="ok" hint="Sur les missions clôturées" />
        <StatCard label="Développeurs" value={String(partners.size)} hint="Prestataires mobilisés" tone="info" />
      </div>

      <div className="mt-4">
        <Panel>
          <Label>Projets clôturés</Label>
          {closed.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Aucune collaboration terminée pour l'instant. Vos missions clôturées apparaîtront ici.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-border">
              {closed.map((m) => {
                const f = freelances.find((fr) => fr.id === m.freelance_id);
                return (
                  <div key={m.id} className="flex flex-wrap items-center gap-3 py-3">
                    <Avatar initials={f?.initials ?? "ND"} size="sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={"/entreprise/missions/$missionId" as never}
                        params={{ missionId: m.id }}
                        className="text-sm font-medium hover:text-accent transition-colors"
                      >
                        {m.title}
                      </Link>
                      <div className="text-xs text-ink-soft">
                        {f?.name ?? "Non attribué"} · {m.duration} · {m.posted_at}
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                    <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>
    </CompanyShell>
  );
}
