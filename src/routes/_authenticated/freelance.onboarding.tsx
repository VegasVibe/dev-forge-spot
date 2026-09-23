import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AccountTypeBadge } from "@/components/account-switcher";
import { Label, SkillTag } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { useRoleGuard } from "@/lib/auth";
import { ensureFreelanceProfile, initialsOf, useMyFreelanceProfile, type FreelanceRow } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/onboarding")({
  head: () => ({
    meta: [
      { title: "Bienvenue dans l'espace développeur — Nodale" },
      { name: "description", content: "Configurez votre profil freelance : compétences, tarif journalier, disponibilité, expérience et réalisations." },
      { property: "og:title", content: "Bienvenue dans l'espace développeur — Nodale" },
      { property: "og:description", content: "Cinq étapes pour rendre votre profil visible auprès des entreprises." },
    ],
  }),
  component: FreelanceOnboarding,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const steps = ["Compétences", "Tarif", "Disponibilité", "Expérience", "Portfolio"] as const;

const suggestions = ["React", "TypeScript", "Node.js", "Python", "Next.js", "React Native", "PostgreSQL", "AWS", "Django", "Flutter"];

function FreelanceOnboarding() {
  const { profile: account, userId } = useRoleGuard("freelance");
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: profile } = useMyFreelanceProfile(userId);

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    city: "",
    skillsText: "",
    rate: 500,
    available: true,
    startLabel: "Immédiatement",
    experienceYears: 3,
    missionsCount: 0,
    bio: "",
  });
  const [portfolio, setPortfolio] = useState<FreelanceRow["portfolio"]>([]);
  const [newItem, setNewItem] = useState({ title: "", client: "", year: "", result: "" });

  useEffect(() => {
    if (!userId || profile) return;
    void ensureFreelanceProfile(userId, account?.full_name ?? "").then(() =>
      qc.invalidateQueries({ queryKey: ["my-freelance", userId] }),
    );
  }, [userId, profile, account?.full_name, qc]);

  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      title: profile.title ?? f.title,
      city: profile.city ?? f.city,
      skillsText: (profile.skills ?? []).join(", ") || f.skillsText,
      rate: profile.rate ?? f.rate,
      available: profile.available ?? f.available,
      experienceYears: profile.experience_years || f.experienceYears,
      missionsCount: profile.missions_count || f.missionsCount,
      bio: profile.bio || f.bio,
    }));
    setPortfolio((p) => (p.length ? p : profile.portfolio ?? []));
  }, [profile]);

  const skills = form.skillsText.split(",").map((s) => s.trim()).filter(Boolean);

  function toggleSkill(skill: string) {
    setForm((f) => {
      const list = f.skillsText.split(",").map((s) => s.trim()).filter(Boolean);
      const next = list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill];
      return { ...f, skillsText: next.join(", ") };
    });
  }

  function addPortfolioItem() {
    if (!newItem.title.trim()) return;
    setPortfolio((p) => [...p, { ...newItem }]);
    setNewItem({ title: "", client: "", year: "", result: "" });
  }

  async function finish() {
    if (!profile) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("freelance_profiles")
      .update({
        title: form.title || "Développeur freelance",
        city: form.city,
        rate: form.rate,
        available: form.available,
        bio: form.bio,
        skills,
        experience_years: form.experienceYears,
        missions_count: form.missionsCount,
        initials: initialsOf(profile.name),
        portfolio,
        onboarded: true,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (updateError) {
      setError("L'enregistrement a échoué. Réessayez.");
      return;
    }
    await qc.invalidateQueries();
    navigate({ to: "/freelance/dashboard" as never, replace: true });
  }

  const canContinue =
    step === 0 ? form.title.trim().length > 1 && skills.length > 0 : step === 1 ? form.rate > 0 : true;

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />

      <div className="relative mx-auto max-w-[760px] px-4 sm:px-6 py-10 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center size-8 rounded-lg bg-ink text-paper font-display font-semibold text-sm">N</span>
            <span className="font-display font-semibold text-[15px] tracking-tight">Nodale</span>
          </div>
          <AccountTypeBadge role="freelance" />
        </div>

        <div className="mt-8">
          <Label>Bienvenue dans l'espace développeur</Label>
          <h1 className="mt-2 font-display font-semibold text-[32px] sm:text-[40px] leading-[1.05] tracking-tight">
            Configurons votre profil freelance
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Cinq étapes rapides : c'est ce profil que les entreprises consultent avant de vous contacter.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
              <div className={`mt-1.5 text-[10px] font-mono ${i === step ? "text-accent" : "text-ink-faint"}`}>{s}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 glass rounded-2xl ring-1 ring-border p-5 space-y-4">
          {step === 0 && (
            <>
              <h2 className="font-display font-semibold text-base tracking-tight">Vos compétences</h2>
              <div>
                <label className="label-mono">Titre professionnel</label>
                <input
                  className={`${field} mt-1.5`}
                  placeholder="Développeur full-stack React / Node"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="label-mono">Technologies (séparées par des virgules)</label>
                <input
                  className={`${field} mt-1.5`}
                  placeholder="React, TypeScript, PostgreSQL"
                  value={form.skillsText}
                  onChange={(e) => setForm((f) => ({ ...f, skillsText: e.target.value }))}
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`rounded-full px-2.5 py-1 text-xs ring-1 transition-colors ${
                        skills.includes(s) ? "bg-accent-soft text-accent ring-accent/20" : "bg-card text-ink-soft ring-border hover:bg-muted"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-display font-semibold text-base tracking-tight">Votre tarif</h2>
              <div>
                <label className="label-mono">Tarif journalier (€)</label>
                <input
                  type="number"
                  min={0}
                  className={`${field} mt-1.5`}
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) }))}
                />
                <p className="mt-2 text-xs text-ink-soft">
                  Affiché aux entreprises dans l'annuaire et les recommandations. Modifiable à tout moment.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[350, 450, 550, 650, 800].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rate: r }))}
                    className="rounded-full bg-card ring-1 ring-border px-3 py-1 text-xs font-mono hover:bg-muted"
                  >
                    {r} €
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display font-semibold text-base tracking-tight">Votre disponibilité</h2>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, available: !f.available }))}
                className="w-full flex items-center justify-between gap-3 rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3 text-left"
              >
                <span className="text-sm">Disponible pour de nouvelles missions</span>
                <span className={`relative h-5 w-9 rounded-full transition-colors ${form.available ? "bg-accent" : "bg-line"}`}>
                  <span className={`absolute top-0.5 size-4 rounded-full bg-panel transition-all ${form.available ? "left-[18px]" : "left-0.5"}`} />
                </span>
              </button>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-mono">Ville</label>
                  <input
                    className={`${field} mt-1.5`}
                    placeholder="Paris"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label-mono">Démarrage possible</label>
                  <select
                    className={`${field} mt-1.5`}
                    value={form.startLabel}
                    onChange={(e) => setForm((f) => ({ ...f, startLabel: e.target.value }))}
                  >
                    <option>Immédiatement</option>
                    <option>Sous 2 semaines</option>
                    <option>Sous 1 mois</option>
                    <option>Plus tard</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display font-semibold text-base tracking-tight">Votre expérience</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-mono">Années d'expérience</label>
                  <input
                    type="number"
                    min={0}
                    className={`${field} mt-1.5`}
                    value={form.experienceYears}
                    onChange={(e) => setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="label-mono">Missions déjà réalisées</label>
                  <input
                    type="number"
                    min={0}
                    className={`${field} mt-1.5`}
                    value={form.missionsCount}
                    onChange={(e) => setForm((f) => ({ ...f, missionsCount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="label-mono">Présentation</label>
                <textarea
                  rows={4}
                  className={`${field} mt-1.5 resize-none`}
                  placeholder="Ce que vous faites le mieux, vos secteurs, votre façon de travailler."
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="font-display font-semibold text-base tracking-tight">Vos réalisations</h2>
              <div className="space-y-3">
                {portfolio.map((p, i) => (
                  <div key={`${p.title}-${i}`} className="rounded-xl bg-card/70 ring-1 ring-border p-4 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="mt-1 text-xs text-ink-soft">{p.client} · {p.year}</div>
                      <div className="mt-2 text-xs font-mono text-accent">{p.result}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPortfolio((list) => list.filter((_, idx) => idx !== i))}
                      className="text-xs text-ink-soft hover:text-foreground"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
                {portfolio.length === 0 && (
                  <p className="text-xs text-ink-faint">Optionnel, mais un projet décrit augmente nettement vos chances.</p>
                )}
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                <Label>Ajouter une réalisation</Label>
                <input className={field} placeholder="Titre du projet" value={newItem.title} onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))} />
                <div className="grid sm:grid-cols-2 gap-2">
                  <input className={field} placeholder="Client" value={newItem.client} onChange={(e) => setNewItem((n) => ({ ...n, client: e.target.value }))} />
                  <input className={field} placeholder="Année" value={newItem.year} onChange={(e) => setNewItem((n) => ({ ...n, year: e.target.value }))} />
                </div>
                <input className={field} placeholder="Résultat obtenu" value={newItem.result} onChange={(e) => setNewItem((n) => ({ ...n, result: e.target.value }))} />
                <button
                  type="button"
                  onClick={addPortfolioItem}
                  className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
                >
                  Ajouter au portfolio
                </button>
              </div>
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="border-t border-border pt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-sm text-ink-soft hover:text-foreground disabled:opacity-40"
            >
              Retour
            </button>
            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue}
                className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void finish()}
                disabled={saving || !profile}
                className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {saving ? "Enregistrement…" : "Terminer et accéder à mon espace"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
