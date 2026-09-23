import { createFileRoute, Link } from "@tanstack/react-router";
import { FreelanceShell } from "@/components/console-shell";
import { ProfileVisibilityCard } from "@/components/profile-visibility";
import { Avatar, Label, SkillTag } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { useMyFreelanceProfile } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/apercu")({
  head: () => ({
    meta: [
      { title: "Aperçu public de mon profil — Nodale" },
      { name: "description", content: "Visualisez votre profil freelance exactement comme les entreprises le voient avant de le rendre visible." },
      { property: "og:title", content: "Aperçu public de mon profil — Nodale" },
      { property: "og:description", content: "Le rendu exact de votre profil côté entreprise." },
    ],
  }),
  component: FreelanceApercu;
});

function FreelanceApercu() {
  const { data: me } = useMe();
  const { data: profile } = useMyFreelanceProfile(me?.userId ?? null);

  if (!profile) {
    return (
      <FreelanceShell kicker="Aperçu public" title="Mon profil vu par les entreprises">
        <p className="text-sm text-ink-soft">Chargement de votre profil…</p>
      </FreelanceShell>
    );
  }

  return (
    <FreelanceShell
      kicker="Aperçu public"
      title="Mon profil vu par les entreprises"
      actions={
        <Link
          to={"/freelance/profil" as never}
          className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
        >
          Modifier mon profil
        </Link>
      }
    >
      <div className="glass rounded-2xl ring-1 ring-border p-4 mb-4">
        <ProfileVisibilityCard compact />
      </div>

      <div className="rounded-2xl ring-1 ring-dashed ring-border p-4 sm:p-6 bg-card/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Label>Rendu côté entreprise</Label>
          <span className="text-[10px] font-mono text-ink-faint">Prévisualisation</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 space-y-4">
            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <div className="flex items-center gap-4">
                <Avatar initials={profile.initials} size="lg" />
                <div>
                  <div className="font-display font-semibold text-lg">{profile.name}</div>
                  <div className="text-sm text-ink-soft">
                    {profile.title || "Titre non renseigné"}
                    {profile.city ? ` · ${profile.city}` : ""}
                  </div>
                </div>
                <span
                  className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ${
                    profile.available ? "bg-ok-soft text-ok ring-ok/20" : "bg-muted text-muted-foreground ring-border"
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${profile.available ? "bg-ok" : "bg-muted-foreground"}`} />
                  {profile.available ? "Disponible" : "Occupé"}
                </span>
              </div>
              <p className="mt-4 text-ink-soft leading-relaxed">
                {profile.bio || "Aucune présentation renseignée — les entreprises verront cet espace vide."}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(profile.skills ?? []).length === 0 ? (
                  <span className="text-xs text-ink-faint">Aucune compétence affichée.</span>
                ) : (
                  profile.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)
                )}
              </div>
            </div>

            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <h2 className="font-display font-semibold text-base tracking-tight mb-4">Portfolio</h2>
              {(profile.portfolio ?? []).length === 0 ? (
                <p className="text-sm text-ink-soft">
                  Aucune réalisation publiée.{" "}
                  <Link to={"/freelance/profil" as never} className="underline">Ajouter un projet</Link>
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {profile.portfolio.map((p, i) => (
                    <div key={`${p.title}-${i}`} className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                      <div className="text-sm font-medium">{p.title}</div>
                      <div className="mt-1 text-xs text-ink-soft">{p.client} · {p.year}</div>
                      <div className="mt-3 text-xs font-mono text-accent">{p.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <Label>Conditions</Label>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                  <div className="font-display font-semibold text-lg">{profile.rate} €</div>
                  <div className="label-mono">/ jour</div>
                </div>
                <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                  <div className="font-display font-semibold text-lg">{profile.rating}</div>
                  <div className="label-mono">Note</div>
                </div>
                <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                  <div className="font-display font-semibold text-lg">{profile.missions_count}</div>
                  <div className="label-mono">Missions</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-soft">
                {profile.experience_years > 0 ? `${profile.experience_years} an(s) d'expérience` : "Expérience non renseignée"}
              </div>
            </div>

            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <Label>Évaluations ({profile.reviews})</Label>
              {(profile.testimonials ?? []).length === 0 ? (
                <p className="mt-3 text-sm text-ink-soft">Aucune évaluation pour le moment.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {profile.testimonials.map((t, i) => (
                    <figure key={`${t.author}-${i}`}>
                      <blockquote className="text-sm leading-relaxed">« {t.text} »</blockquote>
                      <figcaption className="mt-2 text-xs text-ink-soft">{t.author} · {t.company} · {t.rating}/5</figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FreelanceShell>
  );
}
