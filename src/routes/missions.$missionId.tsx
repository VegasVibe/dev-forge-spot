import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, Label, Meter, SkillTag, StatusBadge } from "@/components/ui-kit";
import { formatEuro, getFreelance, getMission } from "@/lib/mock-data";
import { getPublishedMission, type PublishedMission } from "@/lib/published-missions";

export const Route = createFileRoute("/missions/$missionId")({
  loader: ({ params }) => ({ mission: getMission(params.missionId) ?? null }),
  head: ({ loaderData }) => {
    if (!loaderData?.mission) {
      return { meta: [{ title: "Mission introuvable — Nodale" }, { name: "robots", content: "noindex" }] };
    }
    const { mission } = loaderData;
    const description = `${mission.summary} Budget ${formatEuro(mission.budget)} · ${mission.duration}.`;
    return {
      meta: [
        { title: `${mission.title} — mission freelance chez ${mission.company}` },
        { name: "description", content: description },
        { property: "og:title", content: `${mission.title} — ${mission.company}` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: MissionDetail,
});

function MissionDetail() {
  const { missionId } = Route.useParams();
  const { mission: base } = Route.useLoaderData();
  const [local, setLocal] = useState<PublishedMission | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!base) setLocal(getPublishedMission(missionId));
  }, [base, missionId]);

  const mission = base ?? local;
  const freelance = getFreelance(mission?.freelanceId);

  if (!mission) {
    return (
      <AppShell kicker="Mission" title="Mission introuvable">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <p className="text-sm text-ink-soft">Cette mission n'existe pas ou n'est plus publiée.</p>
          <Link to="/missions" className="mt-4 inline-flex rounded-xl glass ring-1 ring-border px-4 py-2.5 text-sm">
            Retour aux missions
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      kicker={`${mission.company} · ${mission.team}`}
      title={mission.title}
      actions={
        <>
          <button
            onClick={() => setApplied(true)}
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            {applied ? "Candidature envoyée" : "Postuler à la mission"}
          </button>
          <Link
            to="/messagerie"
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Contacter l'entreprise
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={mission.status} />
              <span className="label-mono">Publiée le {mission.postedAt}</span>
              <span className="label-mono">{mission.applicants} candidatures</span>
            </div>
            <p className="mt-4 text-lg leading-relaxed text-pretty">{mission.summary}</p>
            <p className="mt-3 text-ink-soft leading-relaxed">{mission.description}</p>

            <div className="mt-6">
              <Label>Livrables attendus</Label>
              <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                {mission.deliverables.map((d) => (
                  <li key={d} className="flex items-center gap-2.5 rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-2.5 text-sm">
                    <span className="size-1.5 rounded-full bg-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <Label>Compétences</Label>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {mission.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <h2 className="font-display font-semibold text-base tracking-tight mb-4">Avancement</h2>
            <Meter value={mission.progress} tone={mission.status === "paid" || mission.status === "done" ? "ok" : "accent"} />
            <div className="mt-3 flex items-center justify-between text-xs text-ink-soft">
              <span>{mission.progress}% réalisé</span>
              <span>{mission.duration}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <Label>Conditions</Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">Budget</span>
                <span className="font-display font-semibold text-xl">{formatEuro(mission.budget)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Durée</span>
                <span>{mission.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-soft">Catégorie</span>
                <span>{mission.category}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <Label>{freelance ? "Développeur assigné" : "Aucun développeur assigné"}</Label>
            {freelance ? (
              <Link
                to="/freelances/$freelanceId"
                params={{ freelanceId: freelance.id }}
                className="mt-4 flex items-center gap-3 group"
              >
                <Avatar initials={freelance.initials} />
                <div>
                  <div className="text-sm font-medium group-hover:text-accent transition-colors">{freelance.name}</div>
                  <div className="text-xs text-ink-soft">{freelance.title} · {freelance.rating}/5</div>
                </div>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-ink-soft">
                {mission.applicants} candidatures en cours d'examen. Les profils proposés correspondent à la stack demandée.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
