import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";

export const Route = createFileRoute("/onboarding/entreprise")({
  head: () => ({
    meta: [
      { title: "Onboarding entreprise — Nodale" },
      { name: "description", content: "Trois étapes pour configurer votre espace entreprise et publier votre premier besoin technique." },
      { property: "og:title", content: "Onboarding entreprise — Nodale" },
      { property: "og:description", content: "Configurez votre espace et publiez votre premier besoin technique." },
    ],
  }),
  component: OnboardingEntreprise,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const steps = ["Entreprise", "Besoin technique", "Budget"];

function OnboardingEntreprise() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10">
          <div className="lg:col-span-5">
            <Label>Onboarding entreprise</Label>
            <h1 className="mt-4 font-display font-semibold text-[clamp(2.4rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.04em] max-w-[13ch]">
              Votre premier besoin, cadré en 3 minutes.
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
                  <h2 className="font-display font-semibold text-xl">Votre entreprise</h2>
                  <div>
                    <label className="label-mono">Raison sociale</label>
                    <input className={`${field} mt-1.5`} placeholder="Atelier Nord" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-mono">Secteur</label>
                      <input className={`${field} mt-1.5`} placeholder="Industrie" />
                    </div>
                    <div>
                      <label className="label-mono">Taille</label>
                      <select className={`${field} mt-1.5`}>
                        <option>1 – 10</option>
                        <option>11 – 50</option>
                        <option>51 – 250</option>
                        <option>250+</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl">Votre besoin technique</h2>
                  <div>
                    <label className="label-mono">Type de besoin</label>
                    <select className={`${field} mt-1.5`}>
                      <option>Micro-logiciel sur mesure</option>
                      <option>Site web</option>
                      <option>Application mobile</option>
                      <option>Automatisation</option>
                      <option>Correction de bugs</option>
                      <option>Maintenance</option>
                      <option>Intégration API</option>
                      <option>Amélioration d'outils internes</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-mono">Description</label>
                    <textarea rows={4} className={`${field} mt-1.5 resize-none`} placeholder="Contexte, objectif, contraintes…" />
                  </div>
                  <div>
                    <label className="label-mono">Compétences attendues</label>
                    <input className={`${field} mt-1.5`} placeholder="React, Node.js, PostgreSQL" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-display font-semibold text-xl">Budget et échéance</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label-mono">Budget estimé (€)</label>
                      <input className={`${field} mt-1.5`} placeholder="15 000" />
                    </div>
                    <div>
                      <label className="label-mono">Durée souhaitée</label>
                      <input className={`${field} mt-1.5`} placeholder="6 semaines" />
                    </div>
                  </div>
                  <div>
                    <label className="label-mono">Démarrage</label>
                    <input className={`${field} mt-1.5`} placeholder="Dès que possible" />
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
                  onClick={() =>
                    step < 2 ? setStep((s) => s + 1) : navigate({ to: "/dashboard/entreprise" })
                  }
                  className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
                >
                  {step < 2 ? "Continuer" : "Publier la mission"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
