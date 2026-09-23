import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Panel, SkillTag } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import {
  applicationStatusLabels,
  pushNotification,
  useApplications,
  useFreelances,
  useMissions,
  type ApplicationRow,
  type ApplicationStatus,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/candidatures")({
  head: () => ({
    meta: [
      { title: "Candidatures reçues — Nodale" },
      { name: "description", content: "Consultez, comparez et acceptez les candidatures reçues sur vos missions." },
      { property: "og:title", content: "Candidatures reçues — Nodale" },
      { property: "og:description", content: "Comparer les profils candidats mission par mission." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CandidaturesPage,
});

function CandidaturesPage() {
  const me = useMe();
  const userId = me.data?.userId;
  const qc = useQueryClient();
  const { data: applications = [] } = useApplications({ companyId: userId ?? null });
  const { data: missions = [] } = useMissions();
  const { data: freelances = [] } = useFreelances();

  const byMission = new Map<string, ApplicationRow[]>();
  applications.forEach((a) => {
    byMission.set(a.mission_id, [...(byMission.get(a.mission_id) ?? []), a]);
  });

  async function setStatus(app: ApplicationRow, status: ApplicationStatus) {
    await supabase.from("applications").update({ status }).eq("id", app.id);
    if (status === "acceptee") {
      await supabase
        .from("missions")
        .update({ freelance_id: app.freelance_id, status: "active" })
        .eq("id", app.mission_id);
    }
    await pushNotification({
      userId: app.freelance_user_id,
      freelanceId: app.freelance_id,
      title: `Candidature ${applicationStatusLabels[status].toLowerCase()}`,
      detail: app.mission_title,
      kind: "candidature",
    });
    void qc.invalidateQueries({ queryKey: ["applications"] });
    void qc.invalidateQueries({ queryKey: ["missions"] });
  }

  return (
    <CompanyShell kicker="Recrutement" title="Candidatures reçues">
      {applications.length === 0 ? (
        <Panel>
          <Label>Aucune candidature</Label>
          <p className="mt-3 text-sm text-ink-soft max-w-[54ch]">
            Publiez une mission pour recevoir des candidatures de développeurs.
          </p>
          <Link
            to={"/entreprise/missions" as never}
            className="mt-4 inline-block rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Publier une mission
          </Link>
        </Panel>
      ) : (
        <div className="space-y-4">
          {Array.from(byMission.entries()).map(([missionId, apps]) => {
            const mission = missions.find((m) => m.id === missionId);
            return (
              <Panel key={missionId}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Label>Mission</Label>
                    <h2 className="mt-1 font-display font-semibold text-lg tracking-tight">
                      {mission?.title ?? apps[0]?.mission_title}
                    </h2>
                  </div>
                  <span className="label-mono">{apps.length} candidature{apps.length > 1 ? "s" : ""}</span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {apps.map((a) => {
                    const f = freelances.find((fr) => fr.id === a.freelance_id);
                    return (
                      <div key={a.id} className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                        <div className="flex items-start gap-3">
                          <Avatar initials={f?.initials ?? "ND"} size="sm" />
                          <div className="min-w-0 flex-1">
                            <Link
                              to={"/entreprise/freelances/$freelanceId" as never}
                              params={{ freelanceId: a.freelance_id } as never}
                              className="text-sm font-medium hover:text-accent transition-colors"
                            >
                              {f?.name ?? a.freelance_id}
                            </Link>
                            <div className="text-xs text-ink-soft">{f?.title}</div>
                          </div>
                          <span className="label-mono">{applicationStatusLabels[a.status]}</span>
                        </div>

                        <dl className="mt-3 space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <dt className="label-mono">TJM proposé</dt>
                            <dd className="font-mono">{a.rate} €</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="label-mono">Disponibilité</dt>
                            <dd className="font-mono">{a.availability}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="label-mono">Note</dt>
                            <dd className="font-mono">{f ? `${f.rating} / 5` : "—"}</dd>
                          </div>
                        </dl>

                        {a.pitch && <p className="mt-3 text-sm text-ink-soft leading-relaxed">{a.pitch}</p>}

                        {f && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {f.skills.slice(0, 4).map((s) => (
                              <SkillTag key={s}>{s}</SkillTag>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => void setStatus(a, "acceptee")}
                            className="rounded-xl bg-accent text-accent-foreground text-xs font-medium py-2 px-3 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                          >
                            Accepter
                          </button>
                          <button
                            onClick={() => void setStatus(a, "entretien")}
                            className="rounded-xl glass text-xs font-medium py-2 px-3 ring-1 ring-border hover:bg-card transition-colors"
                          >
                            Proposer un entretien
                          </button>
                          <button
                            onClick={() => void setStatus(a, "refusee")}
                            className="rounded-xl glass text-xs font-medium py-2 px-3 ring-1 ring-border hover:bg-card transition-colors text-ink-faint"
                          >
                            Écarter
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </CompanyShell>
  );
}
