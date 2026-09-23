import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SitePage } from "@/components/site-chrome";
import { BarChart, Label, Meter, StatusBadge, SkillTag, Avatar } from "@/components/ui-kit";
import { formatEuro, freelances, missions, monthlySpend } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { homeFor, type Role } from "@/lib/auth";
import { PENDING_ROLE_KEY } from "./auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nodale — La console des missions techniques freelance" },
      {
        name: "description",
        content:
          "Publiez vos besoins tech, recrutez des développeurs freelances vérifiés et pilotez budgets, statuts et paiements dans un seul espace.",
      },
      { property: "og:title", content: "Nodale — La console des missions techniques freelance" },
      {
        property: "og:description",
        content: "Entreprises et développeurs freelances : deux espaces distincts, missions, budgets et paiements.",
      },
    ],
  }),
  component: Landing,
});

/** Après une connexion Google/Apple, on applique le rôle choisi puis on ouvre le bon espace. */
function useSessionRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user || cancelled) return;

      const pending = window.localStorage.getItem(PENDING_ROLE_KEY) as Role | null;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      let role = (profile?.role as Role | undefined) ?? pending ?? "entreprise";

      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          role,
          full_name: (user.user_metadata?.["full_name"] as string) ?? user.email?.split("@")[0] ?? "",
          email: user.email ?? null,
        });
      } else if (pending && pending !== profile.role) {
        role = profile.role as Role;
      }

      window.localStorage.removeItem(PENDING_ROLE_KEY);
      if (!cancelled) navigate({ to: homeFor(role), replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);
}

function Landing() {
  useSessionRedirect();
  const featured = missions.slice(0, 3);

  return (
    <SitePage>
      {/* Editorial hero */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full glass ring-1 ring-border px-3 py-1">
              <span className="size-1.5 rounded-full bg-ok" />
              <Label>Plateforme de mise en relation tech</Label>
            </div>
            <h1 className="mt-6 font-display font-semibold text-[clamp(3rem,8vw,7rem)] leading-[0.92] tracking-[-0.04em] text-balance">
              Pilotez vos missions techniques, du brief au paiement.
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pt-24 flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-ink-soft text-pretty">
              Nodale connecte les équipes produit aux développeurs freelances qualifiés. Deux espaces distincts, une
              même exigence de clarté.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
              >
                Espace entreprise
              </Link>
              <Link
                to="/auth"
                className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
              >
                Espace développeur
              </Link>
            </div>
          </div>
        </div>

        {/* credibility strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden ring-1 ring-border bg-line">
          {[
            { label: "Développeurs actifs", value: "2 480", hint: "+12 % ce mois", tone: true },
            { label: "Missions actives", value: "186", hint: "dont 42 en cours" },
            { label: "Volume traité", value: "1,9 M€", hint: "12 mois glissants" },
            { label: "Satisfaction", value: "4,8/5", hint: "3 200 évaluations" },
          ].map((s) => (
            <div key={s.label} className="glass p-5">
              <Label>{s.label}</Label>
              <div className="mt-1.5 font-display font-semibold text-[clamp(1.6rem,3vw,2.4rem)] tracking-tight">
                {s.value}
              </div>
              <div className={`mt-1 text-xs ${s.tone ? "text-ok" : "text-ink-soft"}`}>{s.hint}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Magazine grid: console preview + editorial columns */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <Label>Console entreprise</Label>
                <h2 className="mt-1 font-display font-semibold text-2xl tracking-tight">Un seul écran pour tout le tech</h2>
              </div>
              <Link to="/auth" className="text-xs font-medium text-accent hover:text-accent/80">
                Ouvrir mon espace
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                <Label>Dépensé ce mois</Label>
                <div className="mt-2 font-display font-semibold text-2xl tabular-nums">48 200 €</div>
                <div className="mt-3">
                  <Meter value={80} />
                </div>
              </div>
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                <Label>Missions</Label>
                <div className="mt-2 font-display font-semibold text-2xl tabular-nums">7</div>
                <div className="mt-1 text-xs text-ink-soft">3 en cours · 2 terminées</div>
              </div>
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                <Label>En attente</Label>
                <div className="mt-2 font-display font-semibold text-2xl tabular-nums">9 750 €</div>
                <div className="mt-1 text-xs text-warn">2 factures</div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-card/70 ring-1 ring-border p-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Flux de trésorerie</Label>
                <span className="text-[10px] font-mono text-ink-faint">6 mois</span>
              </div>
              <BarChart data={monthlySpend} unit="Dépenses · +18 % vs T1" />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <Label>Missions ouvertes</Label>
              <div className="mt-4 divide-y divide-border">
                {featured.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 py-3 first:pt-0">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.title}</div>
                      <div className="text-xs text-ink-soft">{m.company} · {m.duration}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
                      <div className="mt-1"><StatusBadge status={m.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/auth" className="mt-4 inline-block text-xs font-medium text-accent">
                Voir toutes les missions →
              </Link>
            </div>

            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <Label>Profils vérifiés</Label>
              <div className="mt-4 space-y-3">
                {freelances.slice(0, 3).map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <Avatar initials={f.initials} size="sm" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.name}</div>
                      <div className="text-xs text-ink-soft truncate">{f.title} · {f.city}</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {f.skills.slice(0, 2).map((s) => (
                        <SkillTag key={s}>{s}</SkillTag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial two-column manifesto */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10 border-t border-border pt-10">
          <div className="lg:col-span-5">
            <Label>Deux espaces</Label>
            <h2 className="mt-3 font-display font-semibold text-[clamp(2rem,4.5vw,3.6rem)] leading-[0.98] tracking-[-0.03em] text-balance">
              Une console pour l'entreprise. Un CRM pour le freelance.
            </h2>
          </div>
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-display font-semibold text-lg">Entreprises</h3>
            <p className="text-ink-soft leading-relaxed">
              Publiez un besoin détaillé, comparez les candidatures, suivez le coût par mission, le budget consommé et
              l'historique complet des prestataires avec qui vous avez travaillé.
            </p>
            <Link to="/auth" className="inline-block text-sm font-medium text-accent">
              Créer un espace entreprise →
            </Link>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-display font-semibold text-lg">Freelances</h3>
            <p className="text-ink-soft leading-relaxed">
              Construisez un profil crédible, postulez en deux clics, suivez vos missions acceptées et vos paiements en
              attente comme dans un CRM personnel.
            </p>
            <Link to="/auth" className="inline-block text-sm font-medium text-accent">
              Créer un profil freelance →
            </Link>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
