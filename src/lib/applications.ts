import { useEffect, useState } from "react";
import { getFreelance } from "./mock-data";

const KEY = "nodale.applications";
const EVENT = "nodale-applications";

export type ApplicationStatus = "recue" | "entretien" | "acceptee" | "refusee";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  recue: "Reçue",
  entretien: "Entretien",
  acceptee: "Acceptée",
  refusee: "Écartée",
};

export type Application = {
  id: string;
  missionId: string;
  missionTitle: string;
  freelanceId: string;
  status: ApplicationStatus;
  pitch: string;
  rate: number;
  availability: string;
  receivedAt: string;
};

export function readApplications(): Application[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Application[]) : [];
  } catch {
    return [];
  }
}

function write(items: Application[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

/** Crée les candidatures des freelances recommandés sur une mission publiée. */
export function createApplications(missionId: string, missionTitle: string, freelanceIds: string[]) {
  if (typeof window === "undefined") return [];
  const existing = readApplications();
  const created: Application[] = [];

  freelanceIds.forEach((freelanceId, i) => {
    if (existing.some((a) => a.missionId === missionId && a.freelanceId === freelanceId)) return;
    const f = getFreelance(freelanceId);
    if (!f) return;
    created.push({
      id: `${missionId}-${freelanceId}`,
      missionId,
      missionTitle,
      freelanceId,
      status: "recue",
      pitch: `${f.bio.split(".")[0]?.trim() ?? f.title}. Disponible pour cadrer le besoin cette semaine.`,
      rate: f.rate,
      availability: f.available ? "Sous 1 semaine" : "Sous 1 mois",
      receivedAt: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }),
    });
    void i;
  });

  if (created.length) write([...created, ...existing]);
  return created;
}

export function setApplicationStatus(id: string, status: ApplicationStatus) {
  const all = readApplications();
  const target = all.find((a) => a.id === id);
  if (!target) return;
  write(
    all.map((a) => {
      if (a.id === id) return { ...a, status };
      // Une seule candidature acceptée par mission.
      if (status === "acceptee" && a.missionId === target.missionId && a.status === "acceptee") {
        return { ...a, status: "refusee" as ApplicationStatus };
      }
      return a;
    }),
  );
}

export function useApplications(missionId?: string) {
  const [items, setItems] = useState<Application[]>([]);

  useEffect(() => {
    const sync = () => setItems(readApplications());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return missionId ? items.filter((a) => a.missionId === missionId) : items;
}
