import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Meter, Panel, SkillTag, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { applicationStatusLabels, formatEuro, useApplications, useFreelance, useMission } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/missions/$missionId")({
  head: () => ({
    meta: [
      { title: "Détail de la mission — Nodale" },
      { name: "description", content: "Consultez le détail de votre mission, son avancement et les candidatures reçues." },
      { property: "og:title", content: "Détail de la mission — Nodale" },
      { property: "og:description", content: "Avancement, conditions et candidatures d'une mission publiée." },
    ],
  }),
  component: MissionDetail,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none";

function MissionDetail() {
  const { missionId } = Route.useParams();
  const me = useMe();
  const userId = me.data?.userId;
  const qc = useQueryClient();

  const { data: mission, isLoading } = useMission(missionId);
  const { data: freelance } = useFreelance(mission?.freelance_id ?? "");
  const { data: applications = [] } = useApplications({ missionId });

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", budget: "", duration: "" });

  const owned = mission?.owner_id === userId;

  function startEdit() {
    if (!mission) return;
    setForm({
      title: mission.title,
      summary: mission.summary,
      budget: String(mission.budget),
      duration: mission.duration,
    });
    setEditing(true);
  }

  async function saveEdit() {
    if (!mission) return;
    await supabase
      .from("missions")
      .update({
        title: form.title.trim() || mission.title,
        summary: form.summary.trim() || mission.summary,
        budget: Number(form.budget.replace(/\D/g, "")) || mission.budget,
        duration: form.duration.trim() || mission.duration,
      })
      .eq("id", mission.id);
    await qc.invalidateQueries({ queryKey: ["mission", missionId] });
    await qc.invalidateQueries({ queryKey: ["missions"] });
    setEditing(false);
  }

  async function togglePause() {
    if (!mission) return;
    const paused = !mission.paused;
    await supabase
      .from("missions")
      .update({ paused, status: paused ? "todo" : "active" })
      .eq("id", mission.id);
    await qc.invalidateQueries({ queryKey: ["mission", missionId] });
    await qc.invalidateQueries({ queryKey: ["missions"] });
  }

  async function closeMission() {
    if (!mission) return;
    await supabase.from("missions").update({ status: "archived", paused: false, progress: 100 }).eq("id", mission.id);
    await qc.invalidateQueries({ queryKey: ["mission", missionId] });
    await qc.invalidateQueries({ queryKey: ["missions"] });
  }

  async function decide(appId: string, status: "acceptee" | "entretien" | "refusee") {
    await supabase.from("applications").update({ status }).eq("id", appId);
    const app = applications.find((a) => a.id === appId);
    if (app) {
      await supabase.from("notifications").insert({
        freelance_id: app.freelance_id,
        title:
          status === "acceptee" ? "Candidature acceptée" : status === "entretien" ? "Entretien proposé" : "Candidature écartée",
        detail: app.mission_title,
        kind: "candidature",
      });
    }
    await qc.invalidateQueries({ queryKey: ["applications"] });
  }

  if (isLoading) {
    return (
      <CompanyShell kicker="Mission" title="Chargement…">
        <div className="glass rounded-2xl ring-1 ring-border p-5 h-40 animate-pulse" />
      </CompanyShell>
    );
  }

  if (!mission) {
    return (
      <CompanyShell kicker="Mission" title="Mission introuvable">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <p className="text-sm text-ink-soft">Cette mission n'existe pas ou n'est plus publiée.</p>
          <Link to={"/entreprise/missions" as never} className="mt-4 inline-flex rounded-xl glass ring-1 ring-border px-4 py-2.5 text-sm">
            Retour aux missions
          </Link>
        </div>
      </CompanyShell>
    );
  }

  return (
    <CompanyShell
      kicker={`${mission.company} · ${mission.team}`}
      title={mission.title}
      actions={
        owned ? (
          <>
            <button
              onClick={startEdit}
              className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
            >
              Modifier la mission
            </button>
            <button
              onClick={togglePause}
              disabled={mission.status === "archived"}
              className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors disabled:opacity-40"
            >
              {mission.paused ? "Reprendre" : "Mettre en pause"}
            </button>
            <button
              onClick={closeMission}
              disabled={mission.status === "archived"}
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              {mission.status === "archived" ? "Mission clôturée" : "Clôturer la mission"}
            </button>
          </>
        ) : (
          <span className="label-mono">Mission publiée par une autre entreprise</span>
        )
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          {editing && (
            <Panel>
              <Label>Modifier la mission</Label>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="label-mono">Titre</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    className={`${field} mt-1.5`}
                  />
                </div>
                <div>
                  <label className="label-mono">Résumé</label>
                  <textarea
                    rows={3}
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                    className={`${field} mt-1.5`}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-mono">Budget (€)</label>
                    <input
                      value={form.budget}
                      onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                      className={`${field} mt-1.5`}
                    />
                  </div>
                  <div>
                    <label className="label-mono">Durée</label>
                    <input
                      value={form.duration}
                      onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      className={`${field} mt-1.5`}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2 px-3.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                  >
                    Enregistrer
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-xl glass text-sm py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </Panel>
          )}

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={mission.status} />
              {mission.paused && (
                <span className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 bg-arch-soft text-arch ring-border">
                  En pause
                </span>
              )}
              <span className="label-mono">Publiée le {mission.posted_at}</span>
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

          {owned && applications.length > 0 && (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
                <div>
                  <Label>Recrutement</Label>
                  <h2 className="mt-1 font-display font-semibold text-xl tracking-tight">
                    {applications.length} candidature{applications.length > 1 ? "s" : ""} reçue{applications.length > 1 ? "s" : ""}
                  </h2>
                </div>
                <Link
                  to={"/entreprise/candidatures" as never}
                  className="rounded-xl glass text-sm font-medium py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors"
                >
                  Tout comparer
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {applications.map((a) => (
                  <Panel key={a.id}>
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={"/entreprise/freelances/$freelanceId" as never}
                        params={{ freelanceId: a.freelance_id } as never}
                        className="font-medium hover:text-accent transition-colors"
                      >
                        {a.freelance_id}
                      </Link>
                      <span className="label-mono">{applicationStatusLabels[a.status]}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{a.pitch}</p>
                    <div className="mt-2 text-xs font-mono text-ink-soft">{a.rate} €/j · {a.availability}</div>
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                      <button
                        onClick={() => decide(a.id, "acceptee")}
                        className="rounded-xl bg-accent text-accent-foreground text-xs font-medium py-1.5 px-3 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => decide(a.id, "entretien")}
                        className="rounded-xl glass text-xs font-medium py-1.5 px-3 ring-1 ring-border hover:bg-card transition-colors"
                      >
                        Entretien
                      </button>
                      <button
                        onClick={() => decide(a.id, "refusee")}
                        className="rounded-xl glass text-xs py-1.5 px-3 ring-1 ring-border hover:bg-card transition-colors"
                      >
                        Écarter
                      </button>
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          )}
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
                to={"/entreprise/freelances/$freelanceId" as never}
                params={{ freelanceId: freelance.id } as never}
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
    </CompanyShell>
  );
}
