import { createFileRoute, Link } from "@tanstack/react-router";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";

export const Route = createFileRoute("/produit")({
  head: () => ({
    meta: [
      { title: "Le produit Nodale — publier, sélectionner, piloter, payer" },
      {
        name: "description",
        content:
          "Découvrez comment Nodale structure le cycle complet d'une mission freelance : brief, candidatures, suivi, jalons et paiements.",
      },
      { property: "og:title", content: "Le produit Nodale" },
      { property: "og:description", content: "Le cycle complet d'une mission freelance dans une seule console." },
    ],
  }),
  component: Produit,
});

const steps = [
  {
    n: "01",
    title: "Cadrer le besoin",
    text: "Un formulaire structuré transforme un besoin flou en brief exploitable : périmètre, livrables, stack, budget et échéance.",
  },
  {
    n: "02",
    title: "Recevoir des profils qualifiés",
    text: "Les candidatures arrivent avec portfolio, tarif journalier, disponibilité et évaluations vérifiées des précédentes missions.",
  },
  {
    n: "03",
    title: "Piloter l'exécution",
    text: "Statuts à faire, en cours, terminé, payé, archivé. Jalons, avancement et messagerie contextualisée par mission.",
  },
  {
    n: "04",
    title: "Suivre l'argent",
    text: "Coût par mission, budget consommé, paiements en attente et reçus, historique des collaborations et des montants.",
  },
];

function Produit() {
  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8">
          <div className="lg:col-span-7">
            <Label>Produit</Label>
            <h1 className="mt-4 font-display font-semibold text-[clamp(2.6rem,7vw,6rem)] leading-[0.94] tracking-[-0.04em] text-balance">
              Le cycle complet d'une mission, sans tableur.
            </h1>
          </div>
          <div className="lg:col-span-5 lg:pt-20">
            <p className="text-lg text-ink-soft leading-relaxed text-pretty">
              Nodale remplace les échanges dispersés, les devis perdus et les suivis budgétaires improvisés par une
              console unique, partagée entre l'entreprise et le développeur.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-2 gap-px rounded-2xl overflow-hidden ring-1 ring-border bg-line">
          {steps.map((s) => (
            <div key={s.n} className="glass p-8">
              <span className="font-mono text-xs text-accent">{s.n}</span>
              <h2 className="mt-3 font-display font-semibold text-2xl tracking-tight">{s.title}</h2>
              <p className="mt-3 text-ink-soft leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-t border-border pt-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6">
            <h2 className="font-display font-semibold text-[clamp(1.8rem,4vw,3rem)] leading-[1] tracking-[-0.03em]">
              Conçu pour des décisions, pas pour des to-do lists.
            </h2>
          </div>
          <div className="lg:col-span-6 grid sm:grid-cols-2 gap-6 text-ink-soft">
            <p>Recherche avancée avec filtres par stack, tarif, disponibilité et note.</p>
            <p>Messagerie intégrée rattachée à chaque mission.</p>
            <p>Notifications sur les candidatures, réponses et changements de statut.</p>
            <p>Évaluations réciproques pour bâtir la confiance sur la durée.</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Ouvrir un compte
          </Link>
          <Link
            to="/tarifs"
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>
    </SitePage>
  );
}
