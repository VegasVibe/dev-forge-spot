import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { useMyFreelanceProfile } from "@/lib/db";

/** Rend le profil visible ou masqué pour les entreprises. */
export function ProfileVisibilityCard({ compact = false }: { compact?: boolean }) {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const { data: profile } = useMyFreelanceProfile(userId);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = profile?.visible ?? true;

  async function toggle() {
    if (!profile) return;
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase
      .from("freelance_profiles")
      .update({ visible: !visible })
      .eq("id", profile.id);
    setBusy(false);
    if (updateError) {
      setError("Le changement de visibilité a échoué. Réessayez.");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["my-freelance", userId] });
    await qc.invalidateQueries({ queryKey: ["freelances"] });
  }

  return (
    <div className={compact ? "" : "glass rounded-2xl ring-1 ring-border p-5"}>
      {!compact && <h2 className="font-display font-semibold text-base tracking-tight">Visibilité du profil</h2>}
      <div className={compact ? "" : "mt-3"}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${
            visible ? "bg-ok-soft text-ok ring-ok/20" : "bg-muted text-muted-foreground ring-border"
          }`}
        >
          <span className={`size-1.5 rounded-full ${visible ? "bg-ok" : "bg-muted-foreground"}`} />
          {visible ? "Profil visible par les entreprises" : "Profil masqué"}
        </span>
        <p className="mt-2 text-sm text-ink-soft">
          {visible
            ? "Votre profil apparaît dans l'annuaire, les recherches et les recommandations."
            : "Votre profil est temporairement retiré de l'annuaire et des recommandations. Vos missions et messages en cours ne sont pas affectés."}
        </p>
        <button
          onClick={() => void toggle()}
          disabled={busy || !profile}
          className="mt-3 rounded-xl bg-card ring-1 ring-border text-sm font-medium py-2.5 px-4 hover:bg-muted transition-colors disabled:opacity-60"
        >
          {busy ? "Mise à jour…" : visible ? "Masquer temporairement mon profil" : "Rendre mon profil visible"}
        </button>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
