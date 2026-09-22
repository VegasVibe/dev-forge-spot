import { useEffect, useState } from "react";
import { getFreelance } from "./mock-data";
import { sendDirectMessage } from "./direct-messages";
import { pushNotifications } from "./notifications-store";

const KEY = "nodale.interviews";
const EVENT = "nodale-interviews";

export type Interview = {
  id: string;
  freelanceId: string;
  date: string; // AAAA-MM-JJ
  time: string; // HH:MM
  duration: string;
  subject: string;
  channel: "Visio" | "Téléphone" | "Sur site";
};

export function readInterviews(): Interview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Interview[]) : [];
  } catch {
    return [];
  }
}

function write(items: Interview[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function formatFrenchDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Planifie un entretien et envoie automatiquement l'invitation au freelance. */
export function scheduleInterview(input: Omit<Interview, "id">) {
  const f = getFreelance(input.freelanceId);
  if (!f) return null;

  const interview: Interview = { ...input, id: `${input.freelanceId}-${input.date}-${input.time}` };
  write([interview, ...readInterviews().filter((i) => i.id !== interview.id)]);

  sendDirectMessage(
    { freelanceId: f.id, name: f.name, initials: f.initials, role: f.title, subject: "Entretien" },
    `Invitation à un entretien ${input.channel.toLowerCase()} le ${formatFrenchDate(input.date)} à ${input.time} (${input.duration}). Sujet : ${input.subject}.`,
  );

  pushNotifications([
    {
      title: "Invitation d'entretien envoyée",
      detail: `${f.name} · ${formatFrenchDate(input.date)} à ${input.time}`,
      kind: "entretien",
      audience: f.name,
    },
  ]);

  return interview;
}

export function cancelInterview(id: string) {
  write(readInterviews().filter((i) => i.id !== id));
}

export function useInterviews() {
  const [items, setItems] = useState<Interview[]>([]);

  useEffect(() => {
    const sync = () => setItems(readInterviews());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return items;
}
