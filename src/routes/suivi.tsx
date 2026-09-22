import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Label, Meter, StatusBadge } from "@/components/ui-kit";
import { formatEuro, getFreelance, missions, statusLabels, type MissionStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/suivi")({
  head: () => ({
    meta: [
      { title: "Suivi des missions — Nodale" },
      { name: "description", content: "Vue kanban des missions par statut : à faire, en cours, terminé, payé, archivé." },
      { property: "og:title", content: "Suivi des missions — Nodale" },
      { property: "og:description", content: "Kanban des statuts de mission, du brief à l'archivage." },
    ],
  }),
  component: Suivi,
});

const columns: MissionStatus[] = ["todo", "active", "done", "paid", "archived"];

function Suivi() {
  return (
    <AppShell kicker="Pilotage" title="Suivi des missions">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {columns.map((col) => {
          const items = missions.filter((m) => m.status === col);
          return (
            <div key={col} className="glass rounded-2xl ring-1 ring-border p-4">
              <div className="flex items-center justify-between mb-4">
                <Label>{statusLabels[col]}</Label>
                <span className="text-[10px] font-mono text-ink-faint">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((m) => (
                  <Link
                    key={m.id}
                    to="/missions/$missionId"
                    params={{ missionId: m.id }}
                    className="block rounded-xl bg-card/70 ring-1 ring-border p-3.5 hover:ring-accent/30 transition-colors"
                  >
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="mt-1 text-xs text-ink-soft">{m.company}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono">{formatEuro(m.budget)}</span>
                      <span className="text-ink-faint">{getFreelance(m.freelanceId)?.initials ?? "—"}</span>
                    </div>
                    <div className="mt-2">
                      <Meter value={m.progress} tone={col === "paid" || col === "done" ? "ok" : col === "archived" ? "arch" : "accent"} />
                    </div>
                  </Link>
                ))}
                {items.length === 0 && <p className="text-xs text-ink-faint">Aucune mission.</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 glass rounded-2xl ring-1 ring-border p-5">
        <h2 className="font-display font-semibold text-base tracking-tight mb-4">Toutes les missions</h2>
        <div className="divide-y divide-border">
          {missions.map((m) => (
            <div key={m.id} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center py-3">
              <div className="text-sm font-medium">{m.title}</div>
              <div className="hidden md:block text-xs text-ink-soft">{m.company}</div>
              <div className="hidden md:block text-xs text-ink-soft">{getFreelance(m.freelanceId)?.name ?? "À attribuer"}</div>
              <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
              <div className="justify-self-end md:justify-self-start"><StatusBadge status={m.status} /></div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
