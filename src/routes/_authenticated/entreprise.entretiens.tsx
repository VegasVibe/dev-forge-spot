import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { CompanyShell } from "@/components/console-shell";
import { Label, Panel } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/lib/auth";
import { pushNotification, sendMessage, useFreelances, useInterviews } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/entretiens")({
  head: () => ({
    meta: [
      { title: "Entretiens planifiés — Nodale" },
      { name: "description", content: "Planifiez des entretiens avec les développeurs et envoyez l'invitation automatiquement." },
      { property: "og:title", content: "Entretiens planifiés — Nodale" },
      { property: "og:description", content: "Calendrier des entretiens et invitations automatiques." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EntretiensPage,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function monthMatrix(base: Date) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d += 1) {
    cells.push(
      `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  return cells;
}

function EntretiensPage() {
  const me = useMe();
  const userId = me.data?.userId;
  const qc = useQueryClient();
  const { data: interviews = [] } = useInterviews(userId);
  const { data: freelances = [] } = useFreelances();

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [day, setDay] = useState<string>("");
  const [freelanceId, setFreelanceId] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("45 min");
  const [channel, setChannel] = useState("Visioconférence");
  const [subject, setSubject] = useState("Entretien de cadrage");

  const cells = monthMatrix(cursor);
  const monthLabel = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    const f = freelances.find((fr) => fr.id === freelanceId);
    if (!userId || !day || !f) return;

    await supabase.from("interviews").insert({
      company_id: userId,
      freelance_id: f.id,
      freelance_user_id: f.user_id,
      day,
      time,
      duration,
      subject,
      channel,
    });
    await sendMessage({
      companyId: userId,
      freelanceId: f.id,
      freelanceUserId: f.user_id,
      sender: "entreprise",
      subject: "Invitation à un entretien",
      body: `${subject} le ${new Date(day).toLocaleDateString("fr-FR")} à ${time} (${duration}, ${channel}).`,
    });
    await pushNotification({
      userId: f.user_id,
      freelanceId: f.id,
      title: "Invitation à un entretien",
      detail: `${new Date(day).toLocaleDateString("fr-FR")} à ${time}`,
      kind: "entretien",
    });
    void qc.invalidateQueries({ queryKey: ["interviews"] });
    void qc.invalidateQueries({ queryKey: ["messages"] });
    setDay("");
  }

  return (
    <CompanyShell kicker="Planification" title="Entretiens">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel>
          <div className="flex items-center justify-between">
            <Label>Calendrier</Label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                className="rounded-lg glass ring-1 ring-border px-2 py-1 text-xs hover:bg-card"
              >
                Mois précédent
              </button>
              <span className="text-sm font-medium capitalize">{monthLabel}</span>
              <button
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                className="rounded-lg glass ring-1 ring-border px-2 py-1 text-xs hover:bg-card"
              >
                Mois suivant
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center label-mono">
            {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((iso, i) => {
              if (!iso) return <span key={`empty-${i}`} />;
              const planned = interviews.filter((it) => it.day === iso);
              const active = day === iso;
              return (
                <button
                  key={iso}
                  onClick={() => setDay(iso)}
                  className={`aspect-square rounded-lg text-xs ring-1 transition-colors ${
                    active ? "bg-accent-soft text-accent ring-accent/30" : "bg-card/60 ring-border hover:bg-card"
                  }`}
                >
                  <span className="block font-mono">{Number(iso.slice(-2))}</span>
                  {planned.length > 0 && <span className="mx-auto mt-0.5 block size-1.5 rounded-full bg-accent" />}
                </button>
              );
            })}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <Label>Entretiens à venir</Label>
            {interviews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">Aucun entretien planifié.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {interviews.map((it) => {
                  const f = freelances.find((fr) => fr.id === it.freelance_id);
                  return (
                    <li key={it.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{f?.name ?? it.freelance_id}</div>
                        <div className="text-xs text-ink-soft">{it.subject} · {it.channel}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono">{new Date(it.day).toLocaleDateString("fr-FR")}</div>
                        <div className="text-[10px] font-mono text-ink-faint">{it.time} · {it.duration}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>

        <Panel>
          <Label>Planifier un entretien</Label>
          <form onSubmit={schedule} className="mt-4 space-y-3">
            <div>
              <label className="label-mono">Date sélectionnée</label>
              <div className="mt-1.5 rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm">
                {day ? new Date(day).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : "Choisissez une date dans le calendrier"}
              </div>
            </div>
            <div>
              <label className="label-mono">Développeur</label>
              <select className={`${field} mt-1.5`} value={freelanceId} onChange={(e) => setFreelanceId(e.target.value)} required>
                <option value="">Sélectionner…</option>
                {freelances.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} — {f.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-mono">Heure</label>
                <input type="time" className={`${field} mt-1.5`} value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <label className="label-mono">Durée</label>
                <select className={`${field} mt-1.5`} value={duration} onChange={(e) => setDuration(e.target.value)}>
                  {["30 min", "45 min", "1 h"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label-mono">Format</label>
              <select className={`${field} mt-1.5`} value={channel} onChange={(e) => setChannel(e.target.value)}>
                {["Visioconférence", "Téléphone", "Sur site"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-mono">Objet</label>
              <input className={`${field} mt-1.5`} value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <button
              type="submit"
              disabled={!day || !freelanceId}
              className="w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
            >
              Planifier et envoyer l'invitation
            </button>
          </form>
        </Panel>
      </div>
    </CompanyShell>
  );
}
