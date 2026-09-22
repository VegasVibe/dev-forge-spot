import { useEffect, useState } from "react";

const KEY = "nodale.direct-messages";
const EVENT = "nodale-direct-messages";

export type DirectThread = {
  freelanceId: string;
  name: string;
  initials: string;
  role: string;
  subject: string;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

export function readThreads(): DirectThread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DirectThread[]) : [];
  } catch {
    return [];
  }
}

export function sendDirectMessage(
  target: { freelanceId: string; name: string; initials: string; role: string; subject: string },
  text: string,
) {
  const all = readThreads();
  const existing = all.find((t) => t.freelanceId === target.freelanceId);
  const message = { from: "me" as const, text, time: "à l'instant" };

  const next = existing
    ? all.map((t) => (t.freelanceId === target.freelanceId ? { ...t, messages: [...t.messages, message] } : t))
    : [{ ...target, messages: [message] }, ...all];

  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT));
}

export function useDirectThreads() {
  const [threads, setThreads] = useState<DirectThread[]>([]);

  useEffect(() => {
    const sync = () => setThreads(readThreads());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return threads;
}
