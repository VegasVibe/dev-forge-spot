import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Avatar, Label, Meter, Panel, SkillTag } from "@/components/ui-kit";
import { formatEuro, getFreelance } from "@/lib/mock-data";
import {
  applicationStatusLabels,
  setApplicationStatus,
  useApplications,
  type Application,
  type ApplicationStatus,
} from "@/lib/applications";
import { usePublishedMissions } from "@/lib/published-missions";
import { pushNotifications } from "@/lib/notifications-store";

export const Route = createFileRoute("/candidatures")({
  head: () => ({
    meta: [
      { title: "Candidatures reçues — Nodale" },
      {
        name: "description",
        content:
          "Consultez, comparez et acceptez les candidatures reçues sur chacune de vos missions publiées : tarif, disponibilité, expérience et motivation.",
      },
      { property: "og:title", content: "Candidatures reçues — Nodale" },
      {
        property: "og:description",
        content: "Comparez les candidatures de chaque mission et retenez le bon développeur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Candidatures,
});

const statusTone: Record<ApplicationStatus, string> = {
  recue: "bg-muted text-muted-foreground ring-border",
  entretien: "bg-info-soft text-info ring-info/20",
  acceptee: "bg-ok-soft text-ok ring-ok/20",
  refusee: "bg-arch-soft text-arch ring-border",
};

export function ApplicationCard({ app }: { app: Application }) {
  const f = getFreelance(app.freelanceId);
  if (!f) return null;

  function decide(status: ApplicationStatus) {
    setApplicationStatus(app.id, status);
    pushNotifications([
      {
        title:
          status === "acceptee"
            ? "Candidature acceptée"
            : status === "entretien"
              ? "Entretien proposé"
              : "Candidature écartée",
        detail: `${f!.name} · ${app.missionTitle}`,
        kind: "candidature",
        audience: f!.name,
      },
    ]);
  }

  return (
    <Panel>
      <div className="flex items-start gap-3">
        <Avatar initials={f.initials} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/freelances/$freelanceId"
              params={{ freelanceId: f.id }}
              className="font-display font-semibold tracking-tight hover:text-accent transition-colors"
            >
              {f.name}
            </Link>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusTone[app.status]}`}
            >
              {applicationStatusLabels[app.status]}
            </span>
          </div>
          <div className="text-xs text-ink-soft">{f.title} · {f.city}</div>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-xs font-mono tabular-nums">
        <div className="flex justify-between">
          <dt className="label-mono">TJM proposé</dt>
          <dd>{app.rate} €</dd>
        </div>
        <div className="flex justify-between">
          <dt className="label-mono">Disponibilité</dt>
          <dd className={f.available ? "text-ok" : "text-ink-soft"}>{app.availability}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="label-mono">Expérience</dt>
          <dd>{f.missions} missions · {f.rating} ★</dd>
        </div>
        <div className="flex justify-between">
          <dt className="label-mono">Reçue le</dt>
          <dd>{app.receivedAt}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <Meter value={Math.round((f.rating / 5) * 100)} tone="ok" />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{app.pitch}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {f.skills.map((s) => (
          <SkillTag key={s}>{s}</SkillTag>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          onClick={() => decide("acceptee")}
          disabled={app.status === "acceptee"}
          className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2 px-3.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
        >
          {app.status === "acceptee" ? "Retenu" : "Accepter"}
        </button>
        <Link
          to="/entretiens"
          search={{ freelance: f.id }}
          onClick={() => decide("entretien")}
          className="rounded-xl glass text-sm font-medium py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors"
        >
          Planifier un entretien
        </Link>
        <button
          onClick={() => decide("refusee")}
          className="rounded-xl glass text-sm py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors"
        >
          Écarter
        </button>
      </div>
    </Panel>
  );
}

function Candidatures() {
  const applications = useApplications();
  const missions = usePublishedMissions();
  const [activeMission, setActiveMission] = useState<string>("all");

  const missionsWithApps = useMemo(() => {
    const ids = Array.from(new Set(applications.map((a) => a.missionId)));
    return ids.map((id) => ({
      id,
      title: applications.find((a) => a.missionId === id)!.missionTitle,
      budget: missions.find((m) => m.id === id)?.budget ?? 0,
      count: applications.filter((a) => a.missionId === id).length,
    }));
  }, [applications, missions]);

  const visible = activeMission === "all" ? applications : applications.filter((a) => a.missionId === activeMission);

  return (
    <AppShell kicker="Recrutement" title="Candidatures reçues">
      {applications.length === 0 ? (
        <Panel>
          <Label>Aucune candidature</Label>
          <p className="mt-3 text-sm text-ink-soft max-w-[54ch]">
            Publiez une mission depuis la recommandation IA : les développeurs recommandés sont notifiés et leurs
            candidatures arrivent ici.
          </p>
          <Link
            to="/recommandations"
            className="mt-4 inline-flex rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Lancer une recommandation
          </Link>
        </Panel>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              onClick={() => setActiveMission("all")}
              className={`rounded-full px-3.5 py-1.5 text-xs ring-1 transition-colors ${
                activeMission === "all" ? "bg-ink text-paper ring-ink" : "glass ring-border text-ink-soft"
              }`}
            >
              Toutes ({applications.length})
            </button>
            {missionsWithApps.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMission(m.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs ring-1 transition-colors ${
                  activeMission === m.id ? "bg-ink text-paper ring-ink" : "glass ring-border text-ink-soft"
                }`}
              >
                {m.title} ({m.count}){m.budget ? ` · ${formatEuro(m.budget)}` : ""}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((a) => (
              <ApplicationCard key={a.id} app={a} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
