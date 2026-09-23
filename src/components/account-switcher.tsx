import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { homeFor, useMe, type Role } from "@/lib/auth";
import { ensureFreelanceProfile } from "@/lib/db";

export const roleLabels: Record<Role, string> = {
  entreprise: "Entreprise",
  freelance: "Développeur freelance",
};

export const roleShort: Record<Role, string> = {
  entreprise: "Entreprise",
  freelance: "Développeur",
};

/** Bascule le compte d'un espace à l'autre (et ouvre l'onboarding développeur si besoin). */
export function useAccountSwitch() {
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

    let destination = homeFor(role);
    if (role === "freelance") {
      try {
        const profile = await ensureFreelanceProfile(me.userId, me.profile?.full_name ?? "");
        if (!profile?.onboarded) destination = "/freelance/onboarding";
      } catch {
        destination = "/freelance/onboarding";
      }
    }

    await qc.invalidateQueries();
    navigate({ to: destination as never, replace: true });
  }

  return { current, other, busy, error, switchTo };
}

/** Sélecteur d'espace affiché dans l'en-tête, avec confirmation avant bascule. */
export function AccountSwitcher() {
  const { current, other, busy, error, switchTo } = useAccountSwitch();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full glass ring-1 ring-border px-3 h-9 text-xs font-medium hover:bg-card transition-colors"
        aria-label="Changer d'espace"
      >
        <span className={`size-2 rounded-full ${current === "entreprise" ? "bg-accent" : "bg-ok"}`} />
        <span className="hidden sm:inline">Compte {roleShort[current]}</span>
        <span className="sm:hidden">{roleShort[current].slice(0, 4)}.</span>
        <span className="text-ink-faint">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[290px] glass-strong rounded-2xl ring-1 ring-border p-3 shadow-lg z-40">
          <div className="px-1 pb-2">
            <span className="label-mono">Mes espaces</span>
          </div>
          <div className="rounded-xl bg-accent-soft ring-1 ring-accent/20 px-3 py-2.5">
            <div className="text-sm font-medium text-accent">{roleLabels[current]}</div>
            <div className="text-[11px] text-ink-soft">Espace actif</div>
          </div>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="mt-2 w-full text-left rounded-xl bg-card ring-1 ring-border px-3 py-2.5 hover:bg-muted transition-colors"
            >
              <div className="text-sm font-medium">{roleLabels[other]}</div>
              <div className="text-[11px] text-ink-soft">Basculer vers cet espace</div>
            </button>
          ) : (
            <div className="mt-2 rounded-xl bg-card ring-1 ring-border p-3">
              <p className="text-xs text-ink-soft">
                Confirmer le passage en compte <span className="text-foreground font-medium">{roleLabels[other]}</span> ?
                Vous quitterez l'espace {roleShort[current].toLowerCase()} et ses pages.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => void switchTo(other)}
                  disabled={busy}
                  className="rounded-lg bg-accent text-accent-foreground text-xs font-medium py-2 px-3 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
                >
                  {busy ? "Basculement…" : "Confirmer"}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg text-xs font-medium py-2 px-3 text-ink-soft hover:text-foreground"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
          {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
        </div>
      )}
    </div>
  );
}

/** Pastille rappelant le type de compte actif. */
export function AccountTypeBadge({ role }: { role: Role }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent ring-1 ring-accent/20 px-2.5 py-1 text-[11px] font-medium">
      <span className="size-1.5 rounded-full bg-current" />
      Compte {roleLabels[role]}
    </span>
  );
}
