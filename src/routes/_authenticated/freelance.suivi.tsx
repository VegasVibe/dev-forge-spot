import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { FreelanceShell } from "@/components/console-shell";
import { Label, Meter, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { formatEuro, statusLabels, useMissions, useMyFreelanceProfile, type MissionStatus } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/suivi")({
  head: () => ({
    meta: [
      { title: "Missions en cours — Nodale" },
      { name: "description", content: "Vue kanban de vos missions acceptées, en cours et terminées, avec leur avancement." },
      { property: "og:title", content: "Missions en cours — Nodale" },
      { property: "og:description", content: "Suivez l'avancement de chaque mission qui vous a été confiée." },
    ],
  }),
  component: FreelanceSuivi,
});

const columns: MissionStatus[] = ["todo", "active", "done", "paid", "archived"];

function FreelanceSuivi() {
  const { data: me } = useMe();
  const { data: profile } = useMyFreelanceProfile(me?.userId);
  const { data: missions = [] } = useMissions();

  const mine = useMemo(() => missions.filter((m) => profile && m.freelance_id === profile.id), [missions, profile]);

  return (
    <FreelanceShell kicker="Pilotage" title="Missions en cours">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {columns.map((col) => {
          const items = mine.filter((m) => m.status === col);
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
                    to="/freelance/missions/$missionId"
                    params={{ missionId: m.id } as never}
                    className="block rounded-xl bg-card/70 ring-1 ring-border p-3.5 hover:ring-accent/30 transition-colors"
                  >
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="mt-1 text-xs text-ink-soft">{m.company}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono">{formatEuro(m.budget)}</span>
                      <span className="text-ink-faint">{m.progress}%</span>
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
        <h2 className="font-display font-semibold text-base tracking-tight mb-4">Toutes mes missions</h2>
        <div className="divide-y divide-border">
          {mine.map((m) => (
            <div key={m.id} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center py-3">
              <div className="text-sm font-medium">{m.title}</div>
              <div className="hidden md:block text-xs text-ink-soft">{m.company}</div>
              <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
              <div className="justify-self-end md:justify-self-start"><StatusBadge status={m.status} /></div>
            </div>
          ))}
          {mine.length === 0 && <p className="py-6 text-sm text-ink-soft text-center">Aucune mission attribuée pour le moment.</p>}
        </div>
      </div>
    </FreelanceShell>
  );
}
