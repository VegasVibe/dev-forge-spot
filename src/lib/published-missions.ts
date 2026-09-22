import { useEffect, useState } from "react";
import type { Mission } from "./mock-data";

const KEY = "nodale.missions";
const EVENT = "nodale-missions";

export type PublishedMission = Mission & { recommended?: string[]; paused?: boolean };

export function readPublishedMissions(): PublishedMission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PublishedMission[]) : [];
  } catch {
    return [];
  }
}

export function getPublishedMission(id: string) {
  return readPublishedMissions().find((m) => m.id === id) ?? null;
}

export function publishMission(mission: PublishedMission) {
  const all = [mission, ...readPublishedMissions().filter((m) => m.id !== mission.id)];
  window.localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
  return mission.id;
}

export function updatePublishedMission(id: string, patch: Partial<PublishedMission>) {
  const all = readPublishedMissions();
  const next = all.map((m) => (m.id === id ? { ...m, ...patch } : m));
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
  return next.find((m) => m.id === id) ?? null;
}

export function usePublishedMission(id: string) {
  const [mission, setMission] = useState<PublishedMission | null>(null);

  useEffect(() => {
    const sync = () => setMission(getPublishedMission(id));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);

  return mission;
}

export function usePublishedMissions() {
  const [items, setItems] = useState<PublishedMission[]>([]);

  useEffect(() => {
    const sync = () => setItems(readPublishedMissions());
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

const categoryMap: Record<string, Mission["category"]> = {
  "Micro-logiciel sur mesure": "Backend",
  "Site web": "Frontend",
  "Application mobile": "Mobile",
  Automatisation: "Automatisation",
  "Correction de bugs": "Maintenance",
  Maintenance: "Maintenance",
  "Intégration API": "Backend",
  "Amélioration d'outils internes": "Backend",
};

export function toMissionCategory(label: string): Mission["category"] {
  return categoryMap[label] ?? "Backend";
}

export function parseBudget(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "mission"
  );
}
