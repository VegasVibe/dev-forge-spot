import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Meter, Panel, SkillTag } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { recommendFreelances, type MatchResult } from "@/lib/matching.functions";
import {
  parseBudget,
  sendMessage,
  slugify,
  toMissionCategory,
  useFreelances,
  useShortlist,
  useToggleShortlist,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/recommandations")({
  head: () => ({
    meta: [
      { title: "Recommandation IA — Nodale" },
      { name: "description", content: "Décrivez votre besoin technique et recevez les développeurs freelances les plus pertinents, classés et justifiés." },
      { property: "og:title", content: "Recommandation IA — Nodale" },
      { property: "og:description", content: "Le moteur Nodale analyse votre besoin et classe les freelances les plus pertinents." },
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
  const me = useMe();
  const qc = useQueryClient();
  const userId = me.data?.userId;
  const profile = me.data?.profile;

  const { data: freelances = [] } = useFreelances();
  const { data: shortlistIds = [] } = useShortlist(userId);
  const toggleShortlist = useToggleShortlist(userId);

  const [brief, setBrief] = useState("");
  const [category, setCategory] = useState(categories[0]!);
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [contactId, setContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);

  const tooShort = brief.trim().length < 20;

  async function submit() {
    if (tooShort || loading || freelances.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await run({
        data: { brief: brief.trim(), category, budget, duration, candidateIds: freelances.map((f) => f.id) },
      });
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

  async function publish() {
    if (!result || !userId) return;
    const names = result.recommandations.map((r) => freelances.find((f) => f.id === r.id)?.name).filter(Boolean) as string[];
    const rawTitle = result.synthese.split(/[.!?]/)[0]?.trim() || category;
    const title = rawTitle.length > 72 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
    const id = `${slugify(title)}-${Date.now().toString(36)}`;
    const posted_at = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

    await supabase.from("missions").insert({
      id,
      owner_id: userId,
      title,
      company: profile?.company_name || profile?.full_name || "Votre entreprise",
      team: "Équipe produit",
      category: toMissionCategory(category),
      summary: result.synthese,
      description: brief.trim(),
      deliverables: names.length ? [`Profils recommandés par l'analyse : ${names.join(", ")}.`] : ["Périmètre à préciser avec le freelance retenu."],
      skills: result.competences.slice(0, 6),
      budget: parseBudget(budget),
      duration: duration.trim() || "À définir",
      status: "todo",
      progress: 0,
      applicants: 0,
      posted_at,
      paused: false,
      recommended: result.recommandations.map((r) => r.id),
    });

    for (const rec of result.recommandations) {
      await supabase.from("notifications").insert({
        freelance_id: rec.id,
        title: "Nouvelle mission correspondant à votre profil",
        detail: `${title} · ${parseBudget(budget) ? `${parseBudget(budget)} €` : "budget à définir"}`,
        kind: "mission",
      });
    }

    await qc.invalidateQueries({ queryKey: ["missions"] });
    navigate({ to: "/entreprise/missions/$missionId" as never, params: { missionId: id } as never });
  }

  async function contact(id: string) {
    const f = freelances.find((fr) => fr.id === id);
    if (!f || !draft.trim() || !userId) return;
    await sendMessage({
      companyId: userId,
      freelanceId: f.id,
      freelanceUserId: f.user_id,
      sender: "entreprise",
      subject: category,
      body: draft.trim(),
    });
    setSentTo((s) => [...s, id]);
    setDraft("");
    setContactId(null);
  }

  return (
    <CompanyShell kicker="Moteur de matching" title="Décrivez votre besoin, recevez les bons profils.">
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
                <div className="mt-1.5 text-[11px] font-mono text-ink-faint">{brief.trim().length} caractères · 20 minimum</div>
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
                disabled={tooShort || loading || freelances.length === 0}
                className="w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                {loading ? "Analyse en cours…" : "Recommander des freelances"}
              </button>
              <p className="text-xs text-ink-soft">L'analyse porte sur {freelances.length} profils : compétences, réalisations, disponibilité et tarif.</p>
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
                Rédigez votre besoin à gauche. Vous recevrez un classement argumenté des développeurs les plus pertinents, avec un score, une justification et un point de vigilance pour chacun.
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
                    {result.competences.map((c) => <SkillTag key={c}>{c}</SkillTag>)}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
                  <button
                    onClick={publish}
                    className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                  >
                    Publier comme nouvelle mission
                  </button>
                  {shortlistIds.length > 0 && (
                    <Link to={"/entreprise/shortlist" as never} className="rounded-xl glass text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors">
                      Comparer la shortlist ({shortlistIds.length})
                    </Link>
                  )}
                </div>
              </Panel>

              {result.recommandations.map((rec, i) => {
                const f = freelances.find((fr) => fr.id === rec.id);
                if (!f) return null;
                const inShortlist = shortlistIds.includes(f.id);
                return (
                  <Panel key={rec.id}>
                    <div className="flex items-start gap-4">
                      <Avatar initials={f.initials} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="label-mono">#{i + 1}</span>
                          <Link to={"/entreprise/freelances/$freelanceId" as never} params={{ freelanceId: f.id } as never} className="font-display font-semibold tracking-tight hover:text-accent transition-colors">
                            {f.name}
                          </Link>
                          <span className="text-xs text-ink-soft">{f.title}</span>
                        </div>
                        <div className="mt-1 text-xs font-mono text-ink-soft tabular-nums">
                          {f.rate} € / jour · {f.rating} ★ · {f.missions_count} missions · {f.city}
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1"><Meter value={Math.max(0, Math.min(100, Math.round(rec.score)))} /></div>
                          <span className="text-xs font-mono tabular-nums">{Math.round(rec.score)}/100</span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed">{rec.justification}</p>
                        {rec.point_de_vigilance && <p className="mt-2 text-xs text-warn">Vigilance · {rec.point_de_vigilance}</p>}
                        <div className="mt-3 flex flex-wrap gap-1.5">{f.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}</div>
                        <div className="mt-4 border-t border-border pt-4">
                          {contactId === f.id ? (
                            <div className="space-y-2">
                              <textarea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} className={`${field} resize-none`} placeholder={`Bonjour ${f.name.split(" ")[0]}, nous avons un besoin en ${category.toLowerCase()}…`} />
                              <div className="flex gap-2">
                                <button onClick={() => contact(f.id)} disabled={!draft.trim()} className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2 px-3.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40">
                                  Envoyer le message
                                </button>
                                <button onClick={() => setContactId(null)} className="rounded-xl glass text-sm py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors">
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => toggleShortlist.mutate({ freelanceId: f.id, on: !inShortlist })}
                                className={`rounded-xl text-sm font-medium py-2 px-3.5 ring-1 transition-colors ${inShortlist ? "bg-accent-soft text-accent ring-accent/20" : "glass ring-border hover:bg-card"}`}
                              >
                                {inShortlist ? "Dans la shortlist" : "Ajouter à la shortlist"}
                              </button>
                              {sentTo.includes(f.id) ? (
                                <Link to={"/entreprise/messagerie" as never} className="text-sm text-ok">Message envoyé · ouvrir la conversation</Link>
                              ) : (
                                <button onClick={() => { setContactId(f.id); setDraft(""); }} className="rounded-xl glass text-sm font-medium py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors">
                                  Envoyer un message
                                </button>
                              )}
                            </div>
                          )}
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
    </CompanyShell>
  );
}
