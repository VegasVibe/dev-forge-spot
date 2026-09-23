import type { Role } from "@/lib/auth";

/** Espace auquel appartient une URL de l'application. */
export type Space = Role | "commun";

const COMPANY_PREFIX = "/entreprise";
const FREELANCE_PREFIX = "/freelance";

export function spaceForPath(pathname: string): Space {
  const path = pathname.toLowerCase();
  if (path === COMPANY_PREFIX || path.startsWith(`${COMPANY_PREFIX}/`)) return "entreprise";
  if (path === FREELANCE_PREFIX || path.startsWith(`${FREELANCE_PREFIX}/`)) return "freelance";
  return "commun";
}

/** Une entreprise ne peut jamais ouvrir une page freelance, et inversement. */
export function canAccess(role: Role | null | undefined, pathname: string): boolean {
  const space = spaceForPath(pathname);
  if (space === "commun") return true;
  if (!role) return false;
  return space === role;
}

export function homePathFor(role: Role): string {
  return role === "entreprise" ? "/entreprise/dashboard" : "/freelance/dashboard";
}

/** Destination de repli quand l'accès est refusé : l'espace du rôle, sinon la connexion. */
export function redirectFor(role: Role | null | undefined, pathname: string): string | null {
  if (canAccess(role, pathname)) return null;
  return role ? homePathFor(role) : "/auth";
}
