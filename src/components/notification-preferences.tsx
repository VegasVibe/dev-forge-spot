import { useEffect, useState } from "react";
import { Label } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import {
  defaultNotificationPreferences,
  digestLabels,
  useNotificationPreferences,
  useSaveNotificationPreferences,
  type DigestFrequency,
  type NotificationPreferences,
} from "@/lib/db";

type Prefs = Omit<NotificationPreferences, "user_id">;

const categories = [
  { key: "mission", label: "Nouvelles missions compatibles" },
  { key: "message", label: "Messages reçus" },
  { key: "candidature", label: "Changements de candidature" },
] as const;

function Toggle({ on, onClick, title }: { on: boolean; onClick: () => void; title: string }) {
  return (
    <button type="button" title={title} aria-label={title} aria-pressed={on} onClick={onClick} className="shrink-0">
      <span className={`relative block h-5 w-9 rounded-full transition-colors ${on ? "bg-accent" : "bg-line"}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-panel transition-all ${on ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

/** Canaux (application / e-mail) par catégorie + fréquence des résumés. */
export function NotificationPreferencesCard() {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const { data } = useNotificationPreferences(userId);
  const save = useSaveNotificationPreferences(userId);
  const [prefs, setPrefs] = useState<Prefs>(defaultNotificationPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      const { user_id: _ignored, ...rest } = data;
      setPrefs(rest);
    }
  }, [data]);

  function update(patch: Partial<Prefs>) {
    setPrefs((p) => ({ ...p, ...patch }));
    save.mutate(patch, { onSuccess: () => setSaved(true) });
  }

  return (
    <div className="glass rounded-2xl ring-1 ring-border p-5">
      <h2 className="font-display font-semibold text-base tracking-tight">Notifications</h2>
      <p className="mt-1.5 text-sm text-ink-soft max-w-[52ch]">
        Choisissez, pour chaque catégorie, si vous êtes prévenu dans l'application, par e-mail, ou les deux.
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-1">
        <span />
        <span className="label-mono text-center">App</span>
        <span className="label-mono text-center">E-mail</span>
        {categories.map((c) => {
          const inAppKey = `${c.key}_in_app` as keyof Prefs;
          const emailKey = `${c.key}_email` as keyof Prefs;
          return (
            <div key={c.key} className="contents">
              <span className="text-sm py-2.5">{c.label}</span>
              <div className="flex justify-center">
                <Toggle
                  on={Boolean(prefs[inAppKey])}
                  title={`${c.label} — dans l'application`}
                  onClick={() => update({ [inAppKey]: !prefs[inAppKey] } as Partial<Prefs>)}
                />
              </div>
              <div className="flex justify-center">
                <Toggle
                  on={Boolean(prefs[emailKey])}
                  title={`${c.label} — par e-mail`}
                  onClick={() => update({ [emailKey]: !prefs[emailKey] } as Partial<Prefs>)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <Label>Fréquence des e-mails</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(digestLabels) as DigestFrequency[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => update({ digest_frequency: f })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                prefs.digest_frequency === f
                  ? "bg-accent-soft text-accent ring-accent/20"
                  : "bg-card text-ink-soft ring-border hover:bg-muted"
              }`}
            >
              {digestLabels[f]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          « Immédiat » envoie un e-mail par événement, les résumés regroupent les alertes de la période.
        </p>
      </div>

      {saved && <p className="mt-3 text-xs text-ok">Préférences enregistrées.</p>}
    </div>
  );
}
