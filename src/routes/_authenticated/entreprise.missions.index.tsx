import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CompanyShell } from "@/components/console-shell";
import { Chip, Label, Panel, SkillTag, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatEuro,
  parseBudget,
  slugify,
  statusLabels,
  toMissionCategory,
  useMissions,
  type MissionStatus,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/missions/")({
  head: () => ({
    meta: [
      { title: "Mes missions — Nodale" },
      { name: "description", content: "Publiez un nouveau besoin technique et suivez l'ensemble des missions publiées par votre entreprise." },
      { property: "og:title", content: "Mes missions — Nodale" },
      { property: "og:description", content: "Publication et suivi des missions de votre entreprise." },
    ],
  }),
  component: MesMissions,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const statuses: (MissionStatus | "tous")[] = ["tous", "todo", "active", "done", "paid", "archived"];

const categories = [
  "Micro-logiciel sur mesure",
  "Site web",
  "Application mobile",
  "Automatisation",
  "Correction de bugs",
  "Maintenance",
  "Intégration API",
  "Amélioration d'outils internes",
];

function MesMissions() {
  const me = useMe();
  const userId = me.data?.userId;
  const profile = me.data?.profile;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: missions = [] } = useMissions();
  const myMissions = missions.filter((m) => m.owner_id === userId);

  const [status, setStatus] = useState<MissionStatus | "tous">("tous");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: categories[0]!,
    team: "Équipe produit",
    summary: "",
    description: "",
    budget: "",
    duration: "",
    skills: "",
  });

  const visible = useMemo(
    () => myMissions.filter((m) => status === "tous" || m.status === status),
    [myMissions, status],
  );

  async function publish() {
    if (!userId || !form.title.trim() || !form.summary.trim()) return;
    setSaving(true);
    const id = `${slugify(form.title)}-${Date.now().toString(36)}`;
    const posted_at = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    const { error } = await supabase.from("missions").insert({
      id,
      owner_id: userId,
      title: form.title.trim(),
      company: profile?.company_name || profile?.full_name || "Votre entreprise",
      team: form.team.trim() || "Équipe produit",
      category: toMissionCategory(form.category),
      summary: form.summary.trim(),
      description: form.description.trim() || form.summary.trim(),
      deliverables: ["Périmètre à préciser avec le freelance retenu."],
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budget: parseBudget(form.budget),
      duration: form.duration.trim() || "À définir",
      status: "todo",
      progress: 0,
      applicants: 0,
      posted_at,
      paused: false,
      recommended: [],
    });
    setSaving(false);
    if (error) return;
    await qc.invalidateQueries({ queryKey: ["missions"] });
    navigate({ to: "/entreprise/missions/$missionId" as never, params: { missionId: id } });
  }

  return (
    <CompanyShell
      kicker="Vos besoins"
      title="Mes missions"
      actions={
        <button
          onClick={() => setCreating((c) => !c)}
          className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
        >
          {creating ? "Annuler" : "Publier une mission"}
        </button>
      }
    >
      {creating && (
        <Panel className="mb-4">
          <Label>Nouveau besoin</Label>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="label-mono">Titre</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={`${field} mt-1.5`}
                placeholder="Refonte de l'application de gestion des stocks"
              />
            </div>
            <div>
              <label className="label-mono">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={`${field} mt-1.5`}
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-mono">Équipe</label>
              <input
                value={form.team}
                onChange={(e) => setForm((f) => ({ ...f, team: e.target.value }))}
                className={`${field} mt-1.5`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono">Résumé</label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                className={`${field} mt-1.5 resize-none`}
                placeholder="Une phrase qui décrit le besoin."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono">Description détaillée</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={`${field} mt-1.5 resize-none`}
                placeholder="Contexte, objectifs, contraintes techniques…"
              />
            </div>
            <div>
              <label className="label-mono">Budget (€)</label>
              <input
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                className={`${field} mt-1.5`}
                placeholder="15 000"
              />
            </div>
            <div>
              <label className="label-mono">Durée</label>
              <input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className={`${field} mt-1.5`}
                placeholder="6 semaines"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-mono">Compétences (séparées par des virgules)</label>
              <input
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                className={`${field} mt-1.5`}
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={publish}
              disabled={saving || !form.title.trim() || !form.summary.trim()}
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              {saving ? "Publication…" : "Publier la mission"}
            </button>
          </div>
        </Panel>
      )}

      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="flex flex-wrap items-center rounded-full glass ring-1 ring-border p-0.5 w-fit">
          {statuses.map((s) => (
            <button key={s} onClick={() => setStatus(s)}>
              <Chip active={status === s}>{s === "tous" ? "Toutes" : statusLabels[s]}</Chip>
            </button>
          ))}
        </div>

        {myMissions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-ink-soft">Vous n'avez publié aucune mission pour l'instant.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
            >
              Publier votre première mission
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr] gap-3 px-2.5 pt-6 pb-2 label-mono">
              <span>Mission</span>
              <span>Compétences</span>
              <span>Budget</span>
              <span>Durée</span>
              <span>Statut</span>
            </div>
            <div className="divide-y divide-border">
              {visible.map((m) => (
                <Link
                  key={m.id}
                  to={"/entreprise/missions/$missionId" as never}
                  params={{ missionId: m.id }}
                  className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr] gap-3 items-center px-2.5 py-3.5 hover:bg-card/60 rounded-lg transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="text-xs text-ink-soft">{m.team} · {m.applicants} candidature{m.applicants > 1 ? "s" : ""}</div>
                  </div>
                  <div className="hidden md:flex flex-wrap gap-1">
                    {m.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
                  </div>
                  <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
                  <div className="hidden md:block text-xs text-ink-soft">{m.duration}</div>
                  <div className="justify-self-end md:justify-self-start"><StatusBadge status={m.status} /></div>
                </Link>
              ))}
              {visible.length === 0 && (
                <p className="py-10 text-center text-sm text-ink-soft">Aucune mission ne correspond à ce filtre.</p>
              )}
            </div>
          </>
        )}
      </div>
    </CompanyShell>
  );
}
