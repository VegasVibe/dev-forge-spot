import { useEffect, useState } from "react";

export type Role = "entreprise" | "freelance";

const KEY = "nodale.session";

export type Session = { role: Role; name: string; email: string };

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("nodale-session"));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("nodale-session"));
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    window.addEventListener("nodale-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("nodale-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return session;
}
