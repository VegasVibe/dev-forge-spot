import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { FreelanceShell } from "@/components/console-shell";
import { Label, SkillTag } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import {
  formatEuro,
  missionMatchesAlert,
  pushNotification,
  useAlerts,
  useMissions,
  useMyFreelanceProfile,
  type AlertCriteria,
  type AlertRow,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/alertes")({
  head: () => ({
    meta: [
      { title: "Alertes missions — Nodale" },
      { name: "description", content: "Recevez une alerte dès qu'une mission correspond à vos compétences, votre tarif et votre disponibilité." },
      { property: "og:title", content: "Alertes missions — Nodale" },
      { property: "og:description", content: "Vos critères, vos alertes, vos missions pertinentes." },
    ],
  }),
  component: FreelanceAlertes,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const categories = ["Backend", "Frontend", "Mobile", "Automatisation", "Maintenance"];

function FreelanceAlertes() {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const qc = useQueryClient();
  const { data: profile } = useMyFreelanceProfile(userId);
  const { data: missions = [] } = useMissions();
  const { data: allAlerts = [] } = useAlerts(userId);

  const alerts = useMemo(() => allAlerts.filter((a) => a.criteria?.scope === "mission"), [allAlerts]);

  const [label, setLabel] = useState("Missions pour moi");
  const [techsText, setTechsText] = useState("");
  const [minBudget, setMinBudget] = useState(0);
  const [cats, setCats] = useState<string[]>([]);
  const [onlyIfAvailable, setOnlyIfAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanned = useRef(false);

  useEffect(() => {
    if (!profile) return;
    setTechsText((t) => t || (profile.skills ?? []).join(", "));
    setMinBudget((b) => b || profile.rate * 5);
  }, [profile]);

  /* Notifie les nouvelles missions correspondant aux alertes enregistrées. */
  useEffect(() => {
    if (scanned.current || !userId || !alerts.length || !missions.length) return;
    scanned.current = true;
    void (async () => {
      for (const alert of alerts) {
        const matches = missions.filter(
          (m) => missionMatchesAlert(m, alert.criteria, profile) && !alert.known_ids.includes(m.id),
        );
        if (!matches.length) continue;
        for (const m of matches.slice(0, 5)) {
          await pushNotification({
            userId,
            title: `Nouvelle mission : ${m.title}`,
            detail: `${m.company} · ${formatEuro(m.budget)} — correspond à votre alerte « ${alert.label} »`,
            kind: "mission",
            entityType: "mission",
            entityId: m.id,
            link: `/freelance/missions/${m.id}`,
          });
        }
        await supabase
          .from("saved_alerts")
          .update({ known_ids: [...alert.known_ids, ...matches.map((m) => m.id)] })
          .eq("id", alert.id);
      }
      await qc.invalidateQueries({ queryKey: ["alerts", userId] });
      await qc.invalidateQueries({ queryKey: ["notifications", userId] });
    })();
  }, [alerts, missions, userId, profile, qc]);

  const draftCriteria: AlertCriteria = {
    scope: "mission",
    techs: techsText.split(",").map((s) => s.trim()).filter(Boolean),
    minBudget,
    categories: cats,
    onlyIfAvailable,
  };

  const preview = missions.filter((m) => missionMatchesAlert(m, draftCriteria, profile));

  async function createAlert() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("saved_alerts").insert({
      user_id: userId,
      label: label.trim() || "Missions pour moi",
      criteria: draftCriteria,
      known_ids: preview.map((m) => m.id),
    });
    setSaving(false);
    if (insertError) {
      setError("La création de l'alerte a échoué. Réessayez.");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["alerts", userId] });
  }

  async function removeAlert(alert: AlertRow) {
    await supabase.from("saved_alerts").delete().eq("id", alert.id);
    await qc.invalidateQueries({ queryKey: ["alerts", userId] });
  }

  return (
    <FreelanceShell kicker="Veille" title="Alertes missions">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5 space-y-3">
          <h2 className="font-display font-semibold text-base tracking-tight">Nouvelle alerte</h2>
          <p className="text-sm text-ink-soft">
            Décrivez le type de mission qui vous intéresse : vous recevrez une notification dès qu'une mission correspondante est publiée.
          </p>

          <div>
            <label className="label-mono">Nom de l'alerte</label>
            <input className={`${field} mt-1.5`} value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>

          <div>
            <label className="label-mono">Mes compétences recherchées (séparées par des virgules)</label>
            <input className={`${field} mt-1.5`} value={techsText} onChange={(e) => setTechsText(e.target.value)} placeholder="React, Node.js" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draftCriteria.techs?.map((t) => <SkillTag key={t}>{t}</SkillTag>)}
            </div>
          </div>

          <div>
            <label className="label-mono">Budget minimum de la mission (€)</label>
            <input
              type="number"
              min={0}
              step={500}
              className={`${field} mt-1.5`}
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
            />
            {profile ? (
              <p className="mt-1.5 text-xs text-ink-soft">
                Votre tarif est de {profile.rate} € / jour — soit environ {formatEuro(profile.rate * 5)} pour une semaine.
              </p>
            ) : null}
          </div>

          <div>
            <label className="label-mono">Types de mission</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCats((list) => (list.includes(c) ? list.filter((x) => x !== c) : [...list, c]))}
                  className={`rounded-full px-2.5 py-1 text-xs ring-1 transition-colors ${
                    cats.includes(c) ? "bg-accent-soft text-accent ring-accent/20" : "bg-card text-ink-soft ring-border hover:bg-muted"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {cats.length === 0 && <p className="mt-1.5 text-xs text-ink-faint">Aucun filtre : tous les types de mission.</p>}
          </div>

          <button
            type="button"
            onClick={() => setOnlyIfAvailable((v) => !v)}
            className="w-full flex items-center justify-between gap-3 rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3 text-left"
          >
            <span className="text-sm">M'alerter seulement quand je suis disponible</span>
            <span className={`relative h-5 w-9 rounded-full transition-colors ${onlyIfAvailable ? "bg-accent" : "bg-line"}`}>
              <span className={`absolute top-0.5 size-4 rounded-full bg-panel transition-all ${onlyIfAvailable ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>

          <div className="rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3 text-sm text-ink-soft">
            <span className="text-foreground font-medium">{preview.length}</span> mission(s) publiée(s) correspondent déjà à ces critères.
          </div>

          <button
            onClick={() => void createAlert()}
            disabled={saving}
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Créer l'alerte"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <h2 className="font-display font-semibold text-base tracking-tight mb-3">Mes alertes</h2>
            {alerts.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune alerte enregistrée pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium">{a.label}</div>
                        <div className="mt-1 text-xs text-ink-soft">
                          {(a.criteria.techs ?? []).join(", ") || "Toutes technologies"} ·{" "}
                          {a.criteria.minBudget ? `à partir de ${formatEuro(a.criteria.minBudget)}` : "tous budgets"}
                          {a.criteria.categories?.length ? ` · ${a.criteria.categories.join(", ")}` : ""}
                          {a.criteria.onlyIfAvailable ? " · seulement si disponible" : ""}
                        </div>
                      </div>
                      <button onClick={() => void removeAlert(a)} className="text-xs text-ink-soft hover:text-foreground">
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex items-center justify-between mb-3">
              <Label>Missions correspondantes</Label>
              <Link to={"/freelance/missions" as never} className="text-xs font-medium text-accent hover:text-accent/80">
                Tout voir
              </Link>
            </div>
            {preview.length === 0 ? (
              <p className="text-sm text-ink-soft">Aucune mission ne correspond à ces critères pour l'instant.</p>
            ) : (
              <div className="divide-y divide-border">
                {preview.slice(0, 6).map((m) => (
                  <Link
                    key={m.id}
                    to={"/freelance/missions/$missionId" as never}
                    params={{ missionId: m.id } as never}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 group"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium group-hover:text-accent transition-colors truncate">{m.title}</div>
                      <div className="text-xs text-ink-soft truncate">{m.company} · {m.category}</div>
                    </div>
                    <span className="text-sm font-mono shrink-0">{formatEuro(m.budget)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FreelanceShell>
  );
}
