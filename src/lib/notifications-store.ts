import { useEffect, useState } from "react";

const KEY = "nodale.notifications";
const EVENT = "nodale-notifications";

export type AppNotification = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "mission" | "candidature" | "entretien" | "alerte";
  audience: string;
  read: boolean;
};

export function readNotifications(): AppNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function write(items: AppNotification[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function pushNotifications(
  items: Omit<AppNotification, "id" | "time" | "read">[],
) {
  if (typeof window === "undefined" || items.length === 0) return;
  const stamped = items.map((n, i) => ({
    ...n,
    id: `${Date.now().toString(36)}-${i}`,
    time: new Date().toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
    read: false,
  }));
  write([...stamped, ...readNotifications()].slice(0, 80));
}

export function markAllRead() {
  write(readNotifications().map((n) => ({ ...n, read: true })));
}

export function clearNotifications() {
  write([]);
}

export function useNotifications() {
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    const sync = () => setItems(readNotifications());
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
