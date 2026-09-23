import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Label } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { homeFor, useMe, type Role } from "@/lib/auth";

const labels: Record<Role, string> = {
  entreprise: "Entreprise",
  freelance: "Développeur freelance",
};

/** Permet de basculer le compte d'un espace à l'autre. */
export function AccountTypeCard() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = (me?.profile?.role ?? "entreprise") as Role;
  const other: Role = current === "entreprise" ? "freelance" : "entreprise";

  async function switchTo(role: Role) {
    if (!me?.userId) return;
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", me.userId);
    if (updateError) {
      setError("Le changement d'espace a échoué. Réessayez.");
      setBusy(false);
      return;
    }
    await qc.invalidateQueries();
    navigate({ to: homeFor(role) as never, replace: true });
  }

  return (
    <div className="glass rounded-2xl ring-1 ring-border p-5">
      <h2 className="font-display font-semibold text-base tracking-tight">Type de compte</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Votre compte est actuellement un compte <span className="text-foreground font-medium">{labels[current]}</span>.
        Chaque espace a ses propres pages : vous ne voyez que celles de votre type de compte.
      </p>
      <div className="mt-4 space-y-3">
        <Label>Basculer vers l'autre espace</Label>
        <button
          onClick={() => void switchTo(other)}
          disabled={busy}
          className="rounded-xl bg-card ring-1 ring-border text-sm font-medium py-2.5 px-4 hover:bg-muted transition-colors disabled:opacity-60"
        >
          {busy ? "Basculement…" : `Passer en compte ${labels[other]}`}
        </button>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
