import { createFileRoute, Link } from "@tanstack/react-router";
import { FreelanceShell } from "@/components/console-shell";
import { Label } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { applicationStatusLabels, formatEuro, useApplications, useMissions, type ApplicationStatus } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/candidatures")({
  head: () => ({
    meta: [
      { title: "Mes candidatures — Nodale" },
      { name: "description", content: "Suivez le statut de toutes vos candidatures envoyées aux entreprises." },
      { property: "og:title", content: "Mes candidatures — Nodale" },
      { property: "og:description", content: "Reçue, entretien, acceptée ou écartée : le statut de chaque candidature." },
    ],
  }),
  component: FreelanceCandidatures,
});

const statusClass: Record<ApplicationStatus, string> = {
  recue: "bg-info-soft text-info ring-info/20",
  entretien: "bg-warn-soft text-warn ring-warn/20",
  acceptee: "bg-ok-soft text-ok ring-ok/20",
  refusee: "bg-muted text-muted-foreground ring-border",
};

function FreelanceCandidatures() {
  const { data: me } = useMe();
  const { data: applications = [] } = useApplications({ freelanceUserId: me?.userId ?? undefined });
  const { data: missions = [] } = useMissions();

  return (
    <FreelanceShell kicker="Suivi" title="Mes candidatures">
      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.8fr_1fr] gap-3 px-2.5 pb-2 label-mono">
          <span>Mission</span>
          <span>TJM proposé</span>
          <span>Disponibilité</span>
          <span>Statut</span>
        </div>
        <div className="divide-y divide-border">
          {applications.map((a) => {
            const mission = missions.find((m) => m.id === a.mission_id);
            return (
              <Link
                key={a.id}
                to="/freelance/missions/$missionId"
                params={{ missionId: a.mission_id }}
                className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_0.8fr_1fr] gap-3 items-center px-2.5 py-3.5 hover:bg-card/60 rounded-lg transition-colors"
              >
                <div>
                  <div className="text-sm font-medium">{a.mission_title}</div>
                  <div className="text-xs text-ink-soft">{mission?.company ?? "—"}</div>
                </div>
                <div className="text-sm font-mono">{formatEuro(a.rate)} / j</div>
                <div className="hidden md:block text-xs text-ink-soft">{a.availability}</div>
                <div className="justify-self-end md:justify-self-start">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusClass[a.status]}`}>
                    {applicationStatusLabels[a.status]}
                  </span>
                </div>
              </Link>
            );
          })}
          {applications.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-ink-soft">Vous n'avez pas encore postulé.</p>
              <Link to={"/freelance/missions" as never} className="mt-2 inline-block text-xs font-medium text-accent hover:text-accent/80">
                Parcourir les missions
              </Link>
            </div>
          )}
        </div>
      </div>
    </FreelanceShell>
  );
}
