import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Avatar, Label, Meter, Panel, SkillTag } from "@/components/ui-kit";
import { freelances, getFreelance } from "@/lib/mock-data";
import { recommendFreelances, type MatchResult } from "@/lib/matching.functions";
import { parseBudget, publishMission, slugify, toMissionCategory } from "@/lib/published-missions";
import { useSession } from "@/lib/session";
import { useShortlist } from "@/lib/shortlist";
import { sendDirectMessage } from "@/lib/direct-messages";

const allTechs = Array.from(new Set(freelances.flatMap((f) => f.skills))).sort((a, b) => a.localeCompare(b));
const experienceLevels = [
  { label: "Toute expérience", value: 0 },
  { label: "10 missions et +", value: 10 },
  { label: "20 missions et +", value: 20 },
  { label: "30 missions et +", value: 30 },
];

export const Route = createFileRoute("/recommandations")({
  head: () => ({
    meta: [
      { title: "Recommandation IA — Nodale" },
      {
        name: "description",
        content:
          "Décrivez votre besoin technique et recevez en quelques secondes les développeurs freelances les plus pertinents, classés et justifiés.",
      },
      { property: "og:title", content: "Recommandation IA — Nodale" },
      {
        property: "og:description",
        content: "Le moteur Nodale analyse votre besoin et classe les freelances les plus pertinents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recommandations,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

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

function Recommandations() {
  const run = useServerFn(recommendFreelances);
  const navigate = useNavigate();
  const session = useSession();
  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState(categories[0]!);
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);

  const tooShort = brief.trim().length < 20;

  async function submit() {
    if (tooShort || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await run({ data: { brief: brief.trim(), category, budget, duration } });
      setResult(res);
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("Configuration")
          ? "Le moteur de recommandation n'est pas disponible pour le moment."
          : "L'analyse n'a pas abouti. Réessayez dans un instant.",
      );
    } finally {
      setLoading(false);
    }
  }

  function publish() {
    if (!result) return;
    const names = result.recommandations
      .map((r) => getFreelance(r.id)?.name)
      .filter(Boolean) as string[];
    const rawTitle = result.synthese.split(/[.!?]/)[0]?.trim() || category;
    const title = rawTitle.length > 72 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
    const id = `${slugify(title)}-${Date.now().toString(36)}`;

    publishMission({
      id,
      title,
      company: session?.name ?? "Votre entreprise",
      team: "Équipe produit",
      category: toMissionCategory(category),
      summary: result.synthese,
      description: brief.trim(),
      deliverables: names.length
        ? [`Profils recommandés par l'analyse : ${names.join(", ")}.`]
        : ["Périmètre à préciser avec le freelance retenu."],
      skills: result.competences.slice(0, 6),
      budget: parseBudget(budget),
      duration: duration.trim() || "À définir",
      status: "todo",
      progress: 0,
      applicants: 0,
      postedAt: "À l'instant",
      recommended: result.recommandations.map((r) => r.id),
    });

    navigate({ to: "/missions/$missionId", params: { missionId: id } });
  }

  return (
    <AppShell
      kicker="Moteur de matching"
      title="Décrivez votre besoin, recevez les bons profils."
    >
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <Panel>
            <Label>Votre besoin technique</Label>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label-mono">Catégorie</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${field} mt-1.5`}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-mono">Description</label>
                <textarea
                  rows={7}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className={`${field} mt-1.5 resize-none`}
                  placeholder="Contexte, objectif, contraintes techniques, outils existants…"
                />
                <div className="mt-1.5 text-[11px] font-mono text-ink-faint">
                  {brief.trim().length} caractères · 20 minimum
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-mono">Budget (€)</label>
                  <input value={budget} onChange={(e) => setBudget(e.target.value)} className={`${field} mt-1.5`} placeholder="15 000" />
                </div>
                <div>
                  <label className="label-mono">Durée</label>
                  <input value={duration} onChange={(e) => setDuration(e.target.value)} className={`${field} mt-1.5`} placeholder="6 semaines" />
                </div>
              </div>
              <button
                onClick={submit}
                disabled={tooShort || loading}
                className="w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                {loading ? "Analyse en cours…" : "Recommander des freelances"}
              </button>
              <p className="text-xs text-ink-soft">
                L'analyse compare votre besoin aux {freelances.length} profils de la plateforme : compétences,
                réalisations, disponibilité et tarif.
              </p>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {error && (
            <Panel className="ring-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </Panel>
          )}

          {loading && (
            <Panel>
              <Label>Analyse</Label>
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            </Panel>
          )}

          {!loading && !result && !error && (
            <Panel>
              <Label>En attente d'un besoin</Label>
              <p className="mt-3 text-sm text-ink-soft max-w-[52ch]">
                Rédigez votre besoin à gauche. Vous recevrez un classement argumenté des développeurs les plus
                pertinents, avec un score, une justification et un point de vigilance pour chacun.
              </p>
            </Panel>
          )}

          {result && (
            <>
              <Panel>
                <Label>Synthèse du besoin</Label>
                <p className="mt-3 text-sm leading-relaxed">{result.synthese}</p>
                {result.competences.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {result.competences.map((c) => (
                      <SkillTag key={c}>{c}</SkillTag>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <button
                    onClick={publish}
                    className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                  >
                    Publier comme nouvelle mission
                  </button>
                  <span className="text-xs text-ink-soft">
                    Le besoin analysé et les profils recommandés sont repris dans la mission.
                  </span>
                </div>
              </Panel>

              {result.recommandations.map((rec, i) => {
                const f = getFreelance(rec.id);
                if (!f) return null;
                return (
                  <Panel key={rec.id}>
                    <div className="flex items-start gap-4">
                      <Avatar initials={f.initials} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="label-mono">#{i + 1}</span>
                          <Link
                            to="/freelances/$freelanceId"
                            params={{ freelanceId: f.id }}
                            className="font-display font-semibold tracking-tight hover:text-accent transition-colors"
                          >
                            {f.name}
                          </Link>
                          <span className="text-xs text-ink-soft">{f.title}</span>
                          <span className={`text-[10px] font-mono ${f.available ? "text-ok" : "text-ink-faint"}`}>
                            {f.available ? "Disponible" : "Indisponible"}
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-mono text-ink-soft tabular-nums">
                          {f.rate} € / jour · {f.rating} ★ · {f.missions} missions · {f.city}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <Meter value={Math.max(0, Math.min(100, Math.round(rec.score)))} />
                          </div>
                          <span className="text-xs font-mono tabular-nums">{Math.round(rec.score)}/100</span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed">{rec.justification}</p>
                        {rec.point_de_vigilance && (
                          <p className="mt-2 text-xs text-warn">Vigilance · {rec.point_de_vigilance}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {f.skills.map((s) => (
                            <SkillTag key={s}>{s}</SkillTag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Panel>
                );
              })}
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
