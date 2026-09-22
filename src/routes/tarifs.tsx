import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";

export const Route = createFileRoute("/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs Nodale — offres entreprise et freelance" },
      {
        name: "description",
        content: "Trois offres claires : Freelance gratuit, Entreprise à 149 €/mois, Scale sur mesure. Sans engagement.",
      },
      { property: "og:title", content: "Tarifs Nodale" },
      { property: "og:description", content: "Freelance gratuit, Entreprise 149 €/mois, Scale sur mesure." },
    ],
  }),
  component: Tarifs,
});

const plans = [
  {
    name: "Freelance",
    price: "0 €",
    period: "toujours",
    text: "Profil, portfolio, candidatures illimitées et suivi de vos paiements.",
    features: ["Profil et portfolio", "Candidatures illimitées", "Suivi des paiements", "Évaluations vérifiées"],
    cta: "Créer mon profil",
    to: "/onboarding/freelance",
    featured: false,
  },
  {
    name: "Entreprise",
    price: "149 €",
    period: "par mois",
    text: "Publication illimitée, console budgétaire et historique complet des collaborations.",
    features: ["Missions illimitées", "Console budgétaire", "Historique prestataires", "Messagerie et jalons", "Support prioritaire"],
    cta: "Démarrer",
    to: "/onboarding/entreprise",
    featured: true,
  },
  {
    name: "Scale",
    price: "Sur mesure",
    period: "annuel",
    text: "Multi-équipes, validation budgétaire, exports comptables et accompagnement dédié.",
    features: ["Multi-entités", "Workflows de validation", "Exports comptables", "Account manager"],
    cta: "Nous contacter",
    to: "/auth",
    featured: false,
  },
];

function Tarifs() {
  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <Label>Offres</Label>
        <h1 className="mt-4 font-display font-semibold text-[clamp(2.6rem,7vw,6rem)] leading-[0.94] tracking-[-0.04em] max-w-[16ch]">
          Un prix lisible, comme le reste du produit.
        </h1>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-7 ring-1 ${p.featured ? "bg-ink text-paper ring-ink" : "glass ring-border"}`}
            >
              <div className={`font-mono text-[10px] uppercase tracking-[0.13em] ${p.featured ? "text-paper/60" : "text-ink-faint"}`}>
                {p.name}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display font-semibold text-[clamp(2.2rem,4vw,3.2rem)] tracking-tight">{p.price}</span>
                <span className={`text-xs ${p.featured ? "text-paper/60" : "text-ink-faint"}`}>{p.period}</span>
              </div>
              <p className={`mt-3 text-sm leading-relaxed ${p.featured ? "text-paper/75" : "text-ink-soft"}`}>{p.text}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className={`size-1.5 rounded-full ${p.featured ? "bg-paper/60" : "bg-accent"}`} />
                    <span className={p.featured ? "text-paper/90" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.to as never}
                className={`mt-7 block text-center rounded-xl text-sm font-medium py-2.5 px-4 transition-colors ${
                  p.featured
                    ? "bg-paper text-ink hover:bg-paper/90"
                    : "bg-accent text-accent-foreground ring-1 ring-accent/40 hover:bg-accent/90"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-ink-faint font-mono">
          Commission de 5 % sur les missions réglées via la plateforme. Sans engagement de durée.
        </p>
      </section>
    </SitePage>
  );
}
