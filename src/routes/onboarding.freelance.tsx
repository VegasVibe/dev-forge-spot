import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";

export const Route = createFileRoute("/onboarding/freelance")({
  head: () => ({
    meta: [
      { title: "Onboarding freelance — Nodale" },
      { name: "description", content: "Construisez un profil freelance crédible : stack, portfolio, tarif et disponibilité." },
      { property: "og:title", content: "Onboarding freelance — Nodale" },
      { property: "og:description", content: "Stack, portfolio, tarif et disponibilité en trois étapes." },
    ],
  }),
  component: OnboardingFreelance,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const steps = ["Profil", "Stack & portfolio", "Tarif & disponibilité"];

function OnboardingFreelance() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-5">
            <Label>Onboarding freelance</Label>
            <h1 className="mt-4 font-display font-semibold text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.04em] max-w-[13ch]">
              Un profil qui inspire confiance dès la première ligne.
            </h1>
            <ol className="mt-8 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span
                    className={`grid place-items-center size-7 rounded-lg text-xs font-mono ring-1 ${
                      i <= step ? "bg-accent-soft text-accent ring-accent/25" : "bg-card text-ink-faint ring-border"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className={i <= step ? "text-sm font-medium" : "text-sm text-ink-soft"}>{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="glass rounded-2xl ring-1 ring-border p-6 sm:p-7">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl">Qui êtes-vous ?</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-mono">Nom complet</label>
                      <input className={`${field} mt-1.5`} placeholder="Léa Martin" />
                    </div>
                    <div>
                      <label className="label-mono">Ville</label>
                      <input className={`${field} mt-1.5`} placeholder="Paris" />
                    </div>
                  </div>
                  <div>
                    <label className="label-mono">Titre professionnel</label>
                    <input className={`${field} mt-1.5`} placeholder="Senior Frontend Engineer" />
                  </div>
                  <div>
                    <label className="label-mono">Présentation</label>
                    <textarea rows={3} className={`${field} mt-1.5 resize-none`} placeholder="Votre spécialité en deux phrases." />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl">Stack et réalisations</h2>
                  <div>
                    <label className="label-mono">Compétences techniques</label>
                    <input className={`${field} mt-1.5`} placeholder="React, TypeScript, Next.js" />
                  </div>
                  <div>
                    <label className="label-mono">Projet marquant</label>
                    <input className={`${field} mt-1.5`} placeholder="Design system multi-produit" />
                  </div>
                  <div>
                    <label className="label-mono">Résultat obtenu</label>
                    <input className={`${field} mt-1.5`} placeholder="-40 % de temps d'intégration" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl">Conditions</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-mono">Tarif journalier (€)</label>
                      <input className={`${field} mt-1.5`} placeholder="650" />
                    </div>
                    <div>
                      <label className="label-mono">Disponibilité</label>
                      <select className={`${field} mt-1.5`}>
                        <option>Disponible immédiatement</option>
                        <option>Sous 2 semaines</option>
                        <option>Sous 1 mois</option>
                        <option>Indisponible</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label-mono">Volume hebdomadaire</label>
                    <input className={`${field} mt-1.5`} placeholder="3 jours / semaine" />
                  </div>
                </div>
              )}

              <div className="mt-7 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-xl glass ring-1 ring-border text-sm py-2.5 px-4 disabled:opacity-40"
                >
                  Retour
                </button>
                <button
                  onClick={() => (step < 2 ? setStep((s) => s + 1) : navigate({ to: "/dashboard/freelance" }))}
                  className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                >
                  {step < 2 ? "Continuer" : "Publier mon profil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
