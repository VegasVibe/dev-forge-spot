import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BarChart, StatCard } from "@/components/ui-kit";
import { formatEuro, getMission, monthlySpend, payments } from "@/lib/mock-data";

export const Route = createFileRoute("/paiements")({
  head: () => ({
    meta: [
      { title: "Suivi des paiements — Nodale" },
      { name: "description", content: "Paiements reçus, en attente et programmés, rattachés à chaque mission et à chaque prestataire." },
      { property: "og:title", content: "Suivi des paiements — Nodale" },
      { property: "og:description", content: "Reçus, en attente, programmés : la trésorerie de vos missions." },
    ],
  }),
  component: Paiements,
});

const stateLabel = { pending: "En attente", paid: "Payé", scheduled: "Programmé" } as const;
const stateClass = {
  pending: "bg-warn-soft text-warn ring-warn/20",
  paid: "bg-ok-soft text-ok ring-ok/20",
  scheduled: "bg-info-soft text-info ring-info/20",
} as const;

function Paiements() {
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter((p) => p.state === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.state === "pending").reduce((s, p) => s + p.amount, 0);
  const scheduled = payments.filter((p) => p.state === "scheduled").reduce((s, p) => s + p.amount, 0);

  return (
    <AppShell kicker="Finances" title="Suivi des paiements">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Volume total" value={formatEuro(total)} hint="6 jalons" />
        <StatCard label="Réglé" value={formatEuro(paid)} hint="3 factures" tone="ok" />
        <StatCard label="En attente" value={formatEuro(pending)} hint="Échéance sous 14 j" tone="warn" />
        <StatCard label="Programmé" value={formatEuro(scheduled)} hint="Acompte à venir" tone="info" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Jalons et factures</h2>
          <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr] gap-3 px-2.5 pb-2 label-mono">
            <span>Jalon</span>
            <span>Mission</span>
            <span>Contrepartie</span>
            <span>Montant</span>
            <span>Statut</span>
          </div>
          <div className="divide-y divide-border">
            {payments.map((p) => (
              <div key={p.id} className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_0.7fr_0.8fr] gap-3 items-center px-2.5 py-3">
                <div>
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-ink-soft">{p.date}</div>
                </div>
                <div className="hidden md:block text-xs text-ink-soft">{getMission(p.missionId)?.title}</div>
                <div className="hidden md:block text-xs text-ink-soft">{p.counterpart}</div>
                <div className="text-sm font-mono">{formatEuro(p.amount)}</div>
                <div className="justify-self-end md:justify-self-start">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${stateClass[p.state]}`}>
                    {stateLabel[p.state]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Flux mensuel</h2>
          <BarChart data={monthlySpend} unit="Encaissements et décaissements" />
        </div>
      </div>
    </AppShell>
  );
}
