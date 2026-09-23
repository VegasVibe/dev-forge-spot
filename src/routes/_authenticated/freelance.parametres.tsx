import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FreelanceShell } from "@/components/console-shell";
import { Label } from "@/components/ui-kit";
import { AccountTypeCard } from "@/components/account-type";
import { useMe, useSignOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/freelance/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres du compte — Nodale" },
      { name: "description", content: "Gérez vos informations de compte et vos préférences de notification en tant que freelance." },
      { property: "og:title", content: "Paramètres du compte — Nodale" },
      { property: "og:description", content: "Identité, notifications et déconnexion." },
    ],
  }),
  component: FreelanceParametres,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow disabled:opacity-60";

const toggles = [
  { id: "missions", label: "Nouvelles missions correspondant à mon profil" },
  { id: "candidatures", label: "Réponses à mes candidatures" },
  { id: "paiements", label: "Paiements et échéances" },
  { id: "messages", label: "Nouveaux messages" },
];

function FreelanceParametres() {
  const { data: me } = useMe();
  const signOut = useSignOut();
  const [on, setOn] = useState<Record<string, boolean>>({
    missions: true,
    candidatures: true,
    paiements: true,
    messages: true,
  });

  return (
    <FreelanceShell kicker="Compte" title="Paramètres">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Identité</h2>
          <div className="mt-4 space-y-3">
            <div>
              <label className="label-mono">Nom</label>
              <input className={`${field} mt-1.5`} defaultValue={me?.profile?.full_name ?? ""} disabled />
            </div>
            <div>
              <label className="label-mono">E-mail</label>
              <input className={`${field} mt-1.5`} value={me?.email ?? ""} disabled />
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

        <AccountTypeCard />

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <h2 className="font-display font-semibold text-base tracking-tight">Session</h2>
          <div className="mt-4 space-y-3">
            <Label>Compte connecté en tant que développeur freelance</Label>
            <button
              onClick={() => void signOut()}
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </FreelanceShell>
  );
}
