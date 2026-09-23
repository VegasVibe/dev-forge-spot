import { createFileRoute, Link } from "@tanstack/react-router";
import { ProfileVisibilityCard } from "@/components/profile-visibility";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FreelanceShell } from "@/components/console-shell";
import { Label, SkillTag } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { ensureFreelanceProfile, initialsOf, useMyFreelanceProfile, type FreelanceRow } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil & portfolio — Nodale" },
      { name: "description", content: "Éditez votre profil public : titre, ville, TJM, disponibilité, bio, compétences et réalisations." },
      { property: "og:title", content: "Mon profil & portfolio — Nodale" },
      { property: "og:description", content: "Le profil que les entreprises consultent avant de vous contacter." },
    ],
  }),
  component: FreelanceProfil,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function FreelanceProfil() {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const fullName = me?.profile?.full_name ?? "";
  const qc = useQueryClient();
  const { data: profile } = useMyFreelanceProfile(userId);

  const [form, setForm] = useState({ title: "", city: "", rate: 500, available: true, bio: "", skillsText: "" });
  const [portfolio, setPortfolio] = useState<FreelanceRow["portfolio"]>([]);
  const [newItem, setNewItem] = useState({ title: "", client: "", year: "", result: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || profile) return;
    void ensureFreelanceProfile(userId, fullName).then(() => {
      qc.invalidateQueries({ queryKey: ["my-freelance", userId] });
    });
  }, [userId, profile, fullName, qc]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      title: profile.title ?? "",
      city: profile.city ?? "",
      rate: profile.rate ?? 500,
      available: profile.available ?? true,
      bio: profile.bio ?? "",
      skillsText: (profile.skills ?? []).join(", "),
    });
    setPortfolio(profile.portfolio ?? []);
  }, [profile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setFeedback(null);
    const skills = form.skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    const { error } = await supabase
      .from("freelance_profiles")
      .update({
        title: form.title,
        city: form.city,
        rate: form.rate,
        available: form.available,
        bio: form.bio,
        skills,
        initials: initialsOf(profile.name),
        portfolio,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      setFeedback("Une erreur est survenue lors de l'enregistrement.");
      return;
    }
    setFeedback("Profil mis à jour.");
    qc.invalidateQueries({ queryKey: ["my-freelance", userId] });
    qc.invalidateQueries({ queryKey: ["freelances"] });
    qc.invalidateQueries({ queryKey: ["freelance", profile.id] });
  }

  function addPortfolioItem() {
    if (!newItem.title.trim()) return;
    setPortfolio((p) => [...p, { ...newItem }]);
    setNewItem({ title: "", client: "", year: "", result: "" });
  }

  function removePortfolioItem(index: number) {
    setPortfolio((p) => p.filter((_, i) => i !== index));
  }

  if (!profile) {
    return (
      <FreelanceShell kicker="Profil public" title="Mon profil & portfolio">
        <p className="text-sm text-ink-soft">Préparation de votre profil…</p>
      </FreelanceShell>
    );
  }

  return (
    <FreelanceShell
      kicker="Profil public"
      title="Mon profil & portfolio"
      actions={
        <Link
          to={"/freelance/apercu" as never}
          className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
        >
          Voir l'aperçu public
        </Link>
      }
    >
      <div className="mb-4">
        <ProfileVisibilityCard />
      </div>
      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5 space-y-3">
          <h2 className="font-display font-semibold text-base tracking-tight">Informations générales</h2>
          <div>
            <label className="label-mono">Titre</label>
            <input className={`${field} mt-1.5`} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label-mono">Ville</label>
              <input className={`${field} mt-1.5`} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div>
              <label className="label-mono">TJM (€)</label>
              <input
                type="number"
                min={0}
                className={`${field} mt-1.5`}
                value={form.rate}
                onChange={(e) => setForm((f) => ({ ...f, rate: Number(e.target.value) }))}
              />
            </div>
          </div>
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
          <div>
            <label className="label-mono">Bio</label>
            <textarea rows={4} className={`${field} mt-1.5 resize-none`} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </div>
          <div>
            <label className="label-mono">Compétences (séparées par des virgules)</label>
            <input className={`${field} mt-1.5`} value={form.skillsText} onChange={(e) => setForm((f) => ({ ...f, skillsText: e.target.value }))} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {form.skillsText.split(",").map((s) => s.trim()).filter(Boolean).map((s) => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          {feedback && <p className="text-xs text-accent">{feedback}</p>}
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight mb-4">Portfolio</h2>
          <div className="space-y-3">
            {portfolio.map((p, i) => (
              <div key={`${p.title}-${i}`} className="rounded-xl bg-card/70 ring-1 ring-border p-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{p.client} · {p.year}</div>
                  <div className="mt-2 text-xs font-mono text-accent">{p.result}</div>
                </div>
                <button type="button" onClick={() => removePortfolioItem(i)} className="text-xs text-ink-soft hover:text-foreground">
                  Retirer
                </button>
              </div>
            ))}
            {portfolio.length === 0 && <p className="text-xs text-ink-faint">Aucune réalisation ajoutée pour le moment.</p>}
          </div>

          <div className="mt-4 border-t border-border pt-4 space-y-2">
            <Label>Ajouter une réalisation</Label>
            <input className={field} placeholder="Titre" value={newItem.title} onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))} />
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
        </div>
      </form>
    </FreelanceShell>
  );
}
