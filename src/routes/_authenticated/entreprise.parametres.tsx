import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CompanyShell } from "@/components/console-shell";
import { Label, Panel } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useSignOut } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/entreprise/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres du compte entreprise — Nodale" },
      { name: "description", content: "Gérez le nom de votre entreprise, vos coordonnées et votre session." },
      { property: "og:title", content: "Paramètres du compte entreprise — Nodale" },
      { property: "og:description", content: "Coordonnées, identité de l'entreprise et déconnexion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParametresPage,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function ParametresPage() {
  const me = useMe();
  const qc = useQueryClient();
  const signOut = useSignOut();
  const profile = me.data?.profile;

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.company_name ?? "");
    setFullName(profile.full_name ?? "");
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    await supabase
      .from("profiles")
      .update({ company_name: companyName, full_name: fullName })
      .eq("id", profile.id);
    setSaved(true);
    void qc.invalidateQueries({ queryKey: ["me"] });
  }

  return (
    <CompanyShell kicker="Compte" title="Paramètres">
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <Label>Identité de l'entreprise</Label>
          <form onSubmit={save} className="mt-4 space-y-3">
            <div>
              <label className="label-mono">Nom de l'entreprise</label>
              <input className={`${field} mt-1.5`} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label className="label-mono">Contact principal</label>
              <input className={`${field} mt-1.5`} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="label-mono">E-mail</label>
              <input className={`${field} mt-1.5 opacity-70`} value={profile?.email ?? ""} readOnly />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
            >
              Enregistrer
            </button>
            {saved && <p className="text-xs text-ok">Modifications enregistrées.</p>}
          </form>
        </Panel>

        <Panel>
          <Label>Session</Label>
          <p className="mt-3 text-sm text-ink-soft max-w-[48ch]">
            Votre compte est de type entreprise : vous accédez uniquement à l'espace entreprise. Pour un compte
            développeur, créez un compte séparé.
          </p>
          <button
            onClick={() => void signOut()}
            className="mt-4 rounded-xl glass text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Se déconnecter
          </button>
        </Panel>
      </div>
    </CompanyShell>
  );
}
