import { createFileRoute } from "@tanstack/react-router";

import { CompanyShell } from "@/components/console-shell";
import { Label, Panel, StatCard } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { formatEuro, useFreelances, useMissions, usePayments } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/paiements")({
  head: () => ({
    meta: [
      { title: "Dépenses et paiements — Nodale" },
      { name: "description", content: "Suivez les jalons payés, programmés et en attente pour chacune de vos missions." },
      { property: "og:title", content: "Dépenses et paiements — Nodale" },
      { property: "og:description", content: "Jalons payés, programmés et en attente, mission par mission." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PaiementsPage,
});

const stateLabels: Record<string, string> = { pending: "En attente", paid: "Payé", scheduled: "Programmé" };

function PaiementsPage() {
  const me = useMe();
  const userId = me.data?.userId;
  const { data: payments = [] } = usePayments();
  const { data: missions = [] } = useMissions();
  const { data: freelances = [] } = useFreelances();

  const myMissions = missions.filter((m) => m.owner_id === userId);
  const engaged = myMissions.reduce((s, m) => s + m.budget, 0);
  const paid = payments.filter((p) => p.state === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.state !== "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <CompanyShell kicker="Finances" title="Dépenses et paiements">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Budget engagé" value={formatEuro(engaged)} hint={`${myMissions.length} mission(s)`} />
        <StatCard label="Déjà réglé" value={formatEuro(paid)} tone="ok" hint="Jalons payés" />
        <StatCard label="À venir" value={formatEuro(pending)} tone="warn" hint="Jalons en attente" />
      </div>

      <div className="mt-4">
        <Panel>
          <Label>Jalons</Label>
          {payments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Aucun paiement enregistré pour l'instant.</p>
          ) : (
            <div className="mt-3 divide-y divide-border">
              {payments.map((p) => {
                const f = freelances.find((fr) => fr.id === p.freelance_id);
                return (
                  <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p.label}</div>
                      <div className="text-xs text-ink-soft">{f?.name ?? p.counterpart} · {p.due_label}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="label-mono">{stateLabels[p.state] ?? p.state}</span>
                      <span className="text-sm font-mono">{formatEuro(p.amount)}</span>
                    </div>
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
