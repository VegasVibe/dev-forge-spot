import { useEffect, useState } from "react";
import { freelances } from "./mock-data";
import { pushNotifications } from "./notifications-store";

const KEY = "nodale.alerts";
const EVENT = "nodale-alerts";

export type SavedCriteria = {
  id: string;
  label: string;
  category: string;
  maxRate: number;
  availableOnly: boolean;
  minMissions: number;
  techs: string[];
  createdAt: string;
  knownIds: string[];
};

export function matchingFreelances(c: Pick<SavedCriteria, "maxRate" | "availableOnly" | "minMissions" | "techs">) {
  return freelances.filter((f) => {
    if (c.maxRate && f.rate > c.maxRate) return false;
    if (c.availableOnly && !f.available) return false;
    if (f.missions < c.minMissions) return false;
    if (c.techs.length && !c.techs.every((t) => f.skills.includes(t))) return false;
    return true;
  });
}

export function readAlerts(): SavedCriteria[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedCriteria[]) : [];
  } catch {
    return [];
  }
}

function write(items: SavedCriteria[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function saveCriteria(input: Omit<SavedCriteria, "id" | "createdAt" | "knownIds">) {
  const criteria: SavedCriteria = {
    ...input,
    id: `alerte-${Date.now().toString(36)}`,
    createdAt: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    knownIds: matchingFreelances(input).map((f) => f.id),
  };
  write([criteria, ...readAlerts()]);
  return criteria;
}

export function deleteCriteria(id: string) {
  write(readAlerts().filter((c) => c.id !== id));
}

/** Compare les profils correspondants aux profils déjà vus et notifie les nouveautés. */
export function checkAlerts() {
  const all = readAlerts();
  let found = 0;

  const next = all.map((c) => {
    const matches = matchingFreelances(c);
    const fresh = matches.filter((f) => !c.knownIds.includes(f.id));
    if (fresh.length) {
      found += fresh.length;
      pushNotifications(
        fresh.map((f) => ({
          title: "Nouveau profil correspondant",
          detail: `${f.name} · ${f.title} · ${f.rate} €/j — alerte « ${c.label} »`,
          kind: "alerte" as const,
          audience: "Vous",
        })),
      );
    }
    return { ...c, knownIds: matches.map((f) => f.id) };
  });

  if (all.length) write(next);
  return found;
}

export function useAlerts() {
  const [items, setItems] = useState<SavedCriteria[]>([]);

  useEffect(() => {
    const sync = () => setItems(readAlerts());
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
