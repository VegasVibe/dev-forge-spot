import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Avatar, Label, Panel } from "@/components/ui-kit";
import { freelances, getFreelance } from "@/lib/mock-data";
import { cancelInterview, formatFrenchDate, scheduleInterview, useInterviews } from "@/lib/interviews";
import { useShortlist } from "@/lib/shortlist";

const searchSchema = z.object({
  freelance: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/entretiens")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Calendrier des entretiens — Nodale" },
      {
        name: "description",
        content:
          "Planifiez vos entretiens avec les développeurs freelances retenus : le créneau est enregistré et l'invitation part automatiquement.",
      },
      { property: "og:title", content: "Calendrier des entretiens — Nodale" },
      {
        property: "og:description",
        content: "Choisissez un créneau, l'invitation part automatiquement au développeur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entretiens,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

const weekDays = ["L", "M", "M", "J", "V", "S", "D"];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function Entretiens() {
  const { freelance: preselect } = Route.useSearch();
  const interviews = useInterviews();
  const shortlist = useShortlist();

  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(isoDate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [freelanceId, setFreelanceId] = useState(preselect || shortlist.ids[0] || freelances[0]!.id);
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("45 min");
  const [channel, setChannel] = useState<"Visio" | "Téléphone" | "Sur site">("Visio");
  const [subject, setSubject] = useState("Cadrage du besoin et organisation");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const first = new Date(cursor.year, cursor.month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const options = shortlist.ids.length
    ? freelances.filter((f) => shortlist.ids.includes(f.id) || f.id === preselect)
    : freelances;

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  function plan() {
    const created = scheduleInterview({ freelanceId, date: selected, time, duration, subject, channel });
    if (!created) return;
    const f = getFreelance(freelanceId);
    setConfirmation(`Invitation envoyée à ${f?.name} pour le ${formatFrenchDate(selected)} à ${time}.`);
  }

  return (
    <AppShell kicker="Planification" title="Calendrier des entretiens">
      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <Panel>
            <div className="flex items-center justify-between">
              <Label>{monthLabel}</Label>
              <div className="flex gap-1">
                <button onClick={() => shift(-1)} className="rounded-lg glass ring-1 ring-border px-2.5 py-1 text-xs">
                  ←
                </button>
                <button onClick={() => shift(1)} className="rounded-lg glass ring-1 ring-border px-2.5 py-1 text-xs">
                  →
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-1.5 text-center">
              {weekDays.map((d, i) => (
                <div key={i} className="label-mono py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const date = isoDate(cursor.year, cursor.month, i + 1);
                const dayInterviews = interviews.filter((it) => it.date === date);
                const active = selected === date;
                return (
                  <button
                    key={date}
                    onClick={() => setSelected(date)}
                    className={`aspect-square rounded-xl text-sm flex flex-col items-center justify-center gap-1 ring-1 transition-colors ${
                      active ? "bg-accent text-accent-foreground ring-accent/40" : "glass ring-border hover:bg-card"
                    }`}
                  >
                    <span className="tabular-nums">{i + 1}</span>
                    {dayInterviews.length > 0 && (
                      <span className={`size-1.5 rounded-full ${active ? "bg-accent-foreground" : "bg-accent"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="mt-4">
            <Label>Entretiens planifiés</Label>
            {interviews.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">
                Aucun entretien pour l'instant. Choisissez une date et un développeur pour envoyer une invitation.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {interviews.map((it) => {
                  const f = getFreelance(it.freelanceId);
                  return (
                    <li key={it.id} className="flex items-center gap-3 rounded-xl bg-card/70 ring-1 ring-border px-3.5 py-3">
                      <Avatar initials={f?.initials ?? "??"} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{f?.name}</div>
                        <div className="text-xs text-ink-soft truncate">
                          {formatFrenchDate(it.date)} · {it.time} · {it.duration} · {it.channel}
                        </div>
                      </div>
                      <button
                        onClick={() => cancelInterview(it.id)}
                        className="text-xs text-ink-faint hover:text-destructive"
                      >
                        Annuler
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="lg:col-span-5">
          <Panel>
            <Label>Nouvel entretien</Label>
            <div className="mt-4 space-y-4">
              <div>
                <label className="label-mono">Date retenue</label>
                <div className={`${field} mt-1.5 text-ink-soft`}>{formatFrenchDate(selected)}</div>
              </div>
              <div>
                <label className="label-mono">Développeur</label>
                <select value={freelanceId} onChange={(e) => setFreelanceId(e.target.value)} className={`${field} mt-1.5`}>
                  {options.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-mono">Heure</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${field} mt-1.5`} />
                </div>
                <div>
                  <label className="label-mono">Durée</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className={`${field} mt-1.5`}>
                    {["30 min", "45 min", "1 h"].map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-mono">Format</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as typeof channel)}
                  className={`${field} mt-1.5`}
                >
                  {["Visio", "Téléphone", "Sur site"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-mono">Sujet</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className={`${field} mt-1.5`} />
              </div>

              <button
                onClick={plan}
                className="w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
              >
                Planifier et envoyer l'invitation
              </button>

              {confirmation && (
                <p className="text-sm text-ok">
                  {confirmation}{" "}
                  <Link to="/messagerie" className="underline">
                    Voir la conversation
                  </Link>
                </p>
              )}
              <p className="text-xs text-ink-soft">
                L'invitation part automatiquement dans la messagerie du développeur, avec la date, l'heure et le sujet.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
