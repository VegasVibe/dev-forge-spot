import { useState } from "react";
import { Label } from "@/components/ui-kit";
import { roleLabels, useAccountSwitch } from "@/components/account-switcher";

/** Permet de basculer le compte d'un espace à l'autre, depuis les paramètres. */
export function AccountTypeCard() {
  const { current, other, busy, error, switchTo } = useAccountSwitch();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="glass rounded-2xl ring-1 ring-border p-5">
      <h2 className="font-display font-semibold text-base tracking-tight">Type de compte</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Votre compte est actuellement un compte <span className="text-foreground font-medium">{roleLabels[current]}</span>.
        Chaque espace a ses propres pages : vous ne voyez que celles de votre type de compte.
      </p>
      <div className="mt-4 space-y-3">
        <Label>Basculer vers l'autre espace</Label>
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="rounded-xl bg-card ring-1 ring-border text-sm font-medium py-2.5 px-4 hover:bg-muted transition-colors"
          >
            Passer en compte {roleLabels[other]}
          </button>
        ) : (
          <div className="rounded-xl bg-card ring-1 ring-border p-4">
            <p className="text-sm text-ink-soft">
              Confirmer le passage en compte <span className="text-foreground font-medium">{roleLabels[other]}</span> ?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => void switchTo(other)}
                disabled={busy}
                className="rounded-lg bg-accent text-accent-foreground text-sm font-medium py-2 px-3.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {busy ? "Basculement…" : "Confirmer"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg text-sm font-medium py-2 px-3.5 text-ink-soft hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
