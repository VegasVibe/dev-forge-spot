import { describe, expect, it } from "vitest";
import { canAccess, homePathFor, redirectFor, spaceForPath } from "./access";

const companyPages = [
  "/entreprise/dashboard",
  "/entreprise/missions",
  "/entreprise/missions/abc",
  "/entreprise/candidatures",
  "/entreprise/recommandations",
  "/entreprise/paiements",
  "/entreprise/parametres",
];

const freelancePages = [
  "/freelance/dashboard",
  "/freelance/missions",
  "/freelance/missions/abc",
  "/freelance/candidatures",
  "/freelance/revenus",
  "/freelance/profil",
  "/freelance/parametres",
];

describe("spaceForPath", () => {
  it("classe les pages entreprise", () => {
    for (const p of companyPages) expect(spaceForPath(p)).toBe("entreprise");
  });
  it("classe les pages freelance", () => {
    for (const p of freelancePages) expect(spaceForPath(p)).toBe("freelance");
  });
  it("laisse les pages publiques en commun", () => {
    for (const p of ["/", "/tarifs", "/produit", "/auth"]) expect(spaceForPath(p)).toBe("commun");
  });
  it("ne confond pas un préfixe partiel", () => {
    expect(spaceForPath("/entreprises-partenaires")).toBe("commun");
    expect(spaceForPath("/freelancers")).toBe("commun");
  });
});

describe("canAccess", () => {
  it("autorise chaque rôle dans son espace", () => {
    for (const p of companyPages) expect(canAccess("entreprise", p)).toBe(true);
    for (const p of freelancePages) expect(canAccess("freelance", p)).toBe(true);
  });

  it("interdit à une entreprise toutes les pages freelance", () => {
    for (const p of freelancePages) expect(canAccess("entreprise", p)).toBe(false);
  });

  it("interdit à un freelance toutes les pages entreprise", () => {
    for (const p of companyPages) expect(canAccess("freelance", p)).toBe(false);
  });

  it("interdit tout espace privé sans rôle", () => {
    for (const p of [...companyPages, ...freelancePages]) expect(canAccess(null, p)).toBe(false);
    expect(canAccess(null, "/tarifs")).toBe(true);
  });
});

describe("redirectFor", () => {
  it("ne redirige pas quand l'accès est légitime", () => {
    expect(redirectFor("entreprise", "/entreprise/missions")).toBeNull();
    expect(redirectFor("freelance", "/freelance/revenus")).toBeNull();
    expect(redirectFor("freelance", "/tarifs")).toBeNull();
  });

  it("renvoie chaque rôle vers son propre tableau de bord", () => {
    expect(redirectFor("entreprise", "/freelance/revenus")).toBe("/entreprise/dashboard");
    expect(redirectFor("freelance", "/entreprise/paiements")).toBe("/freelance/dashboard");
  });

  it("renvoie vers la connexion sans session", () => {
    expect(redirectFor(null, "/entreprise/dashboard")).toBe("/auth");
  });
});

describe("homePathFor", () => {
  it("associe un espace à chaque rôle", () => {
    expect(homePathFor("entreprise")).toBe("/entreprise/dashboard");
    expect(homePathFor("freelance")).toBe("/freelance/dashboard");
  });
});
