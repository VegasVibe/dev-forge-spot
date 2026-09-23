import { createFileRoute } from "@tanstack/react-router";
import { FreelanceShell } from "@/components/console-shell";
import { BarChart, StatCard } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { formatEuro, monthlySpend, usePayments, useMyFreelanceProfile } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/revenus")({
  head: () => ({
    meta: [
      { title: "Mes rémunérations — Nodale" },
      { name: "description", content: "Suivez vos revenus reçus, en attente et programmés pour vos missions freelance." },
      { property: "og:title", content: "Mes rémunérations — Nodale" },
      { property: "og:description", content: "Le détail de vos paiements, mission par mission." },
    ],
  }),
  component: FreelanceRevenus,
});

const stateLabel = { pending: "En attente", paid: "Payé", scheduled: "Programmé" } as const;
const stateClass = {
  pending: "bg-warn-soft text-warn ring-warn/20",
  paid: "bg-ok-soft text-ok ring-ok/20",
  scheduled: "bg-info-soft text-info ring-info/20",
} as const;

function FreelanceRevenus() {
  const { data: me } = useMe();
  const { data: profile } = useMyFreelanceProfile(me?.userId);
  const { data: payments = [] } = usePayments(profile?.id ? { freelanceId: profile.id } : undefined);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter((p) => p.state === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.state === "pending").reduce((s, p) => s + p.amount, 0);
  const scheduled = payments.filter((p) => p.state === "scheduled").reduce((s, p) => s + p.amount, 0);

  return (
    <FreelanceShell kicker="Finances" title="Mes rémunérations">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total cumulé" value={formatEuro(total)} hint={`${payments.length} jalon(s)`} />
        <StatCard label="Encaissé" value={formatEuro(paid)} tone="ok" />
        <StatCard label="En attente" value={formatEuro(pending)} tone="warn" />
        <StatCard label="Programmé" value={formatEuro(scheduled)} tone="info" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Jalons de paiement</h2>
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_0.7fr_0.8fr] gap-3 px-2.5 pb-2 label-mono">
            <span>Jalon</span>
            <span>Contrepartie</span>
            <span>Montant</span>
            <span>Statut</span>
          </div>
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_0.7fr_0.8fr] gap-3 items-center px-2.5 py-3">
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-ink-soft">{p.due_label}</div>
                </div>
                <div className="hidden md:block text-xs text-ink-soft">{p.counterpart}</div>
                <div className="text-sm font-mono">{formatEuro(p.amount)}</div>
                <div className="justify-self-end md:justify-self-start">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${stateClass[p.state]}`}>
                    {stateLabel[p.state]}
                  </span>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="py-8 text-sm text-ink-soft text-center">Aucun paiement enregistré pour le moment.</p>}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Flux mensuel</h2>
          <BarChart data={monthlySpend} unit="Tendance indicative" />
        </div>
      </div>
    </FreelanceShell>
  );
}
