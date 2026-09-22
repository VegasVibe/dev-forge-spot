import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Label } from "@/components/ui-kit";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres du compte — Nodale" },
      { name: "description", content: "Gérez votre profil, vos notifications, votre facturation et la sécurité de votre compte Nodale." },
      { property: "og:title", content: "Paramètres du compte — Nodale" },
      { property: "og:description", content: "Profil, notifications, facturation et sécurité." },
    ],
  }),
  component: Parametres,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const toggles = [
  { id: "missions", label: "Nouvelles missions correspondant à mes filtres" },
  { id: "candidatures", label: "Candidatures reçues" },
  { id: "statuts", label: "Changements de statut de mission" },
  { id: "paiements", label: "Paiements et factures" },
  { id: "messages", label: "Nouveaux messages" },
];

function Parametres() {
  const [on, setOn] = useState<Record<string, boolean>>({
    missions: true,
    candidatures: true,
    statuts: true,
    paiements: true,
    messages: false,
  });

  return (
    <AppShell kicker="Compte" title="Paramètres">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Profil</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label-mono">Nom affiché</label>
              <input className={`${field} mt-1.5`} defaultValue="Atelier Nord" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-mono">E-mail</label>
                <input className={`${field} mt-1.5`} defaultValue="contact@ateliernord.fr" />
              </div>
              <div>
                <label className="label-mono">Téléphone</label>
                <input className={`${field} mt-1.5`} defaultValue="+33 1 84 00 00 00" />
              </div>
            </div>
            <div>
              <label className="label-mono">Description publique</label>
              <textarea rows={3} className={`${field} mt-1.5 resize-none`} defaultValue="PME industrielle, 80 personnes, digitalisation de nos outils internes." />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Notifications</h2>
          <div className="mt-4 space-y-2">
            {toggles.map((t) => (
              <button
                key={t.id}
                onClick={() => setOn((s) => ({ ...s, [t.id]: !s[t.id] }))}
                className="w-full flex items-center justify-between gap-3 rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3 text-left"
              >
                <span className="text-sm">{t.label}</span>
                <span className={`relative h-5 w-9 rounded-full transition-colors ${on[t.id] ? "bg-accent" : "bg-line"}`}>
                  <span
                    className={`absolute top-0.5 size-4 rounded-full bg-panel transition-all ${on[t.id] ? "left-[18px]" : "left-0.5"}`}
                  />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Facturation</h2>
          <div className="mt-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-mono">Raison sociale</label>
                <input className={`${field} mt-1.5`} defaultValue="Atelier Nord SAS" />
              </div>
              <div>
                <label className="label-mono">TVA intracommunautaire</label>
                <input className={`${field} mt-1.5`} defaultValue="FR76 000 000 000" />
              </div>
            </div>
            <div>
              <label className="label-mono">Adresse de facturation</label>
              <input className={`${field} mt-1.5`} defaultValue="12 rue des Ateliers, 59000 Lille" />
            </div>
            <div className="rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Offre Entreprise</div>
                <div className="text-xs text-ink-soft">149 € / mois · sans engagement</div>
              </div>
              <span className="text-xs font-medium text-accent">Gérer</span>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Sécurité</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label-mono">Nouveau mot de passe</label>
              <input type="password" className={`${field} mt-1.5`} placeholder="••••••••" />
            </div>
            <div>
              <label className="label-mono">Confirmation</label>
              <input type="password" className={`${field} mt-1.5`} placeholder="••••••••" />
            </div>
            <div className="pt-1">
              <Label>Sessions actives : 2 appareils</Label>
            </div>
            <button className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors">
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
