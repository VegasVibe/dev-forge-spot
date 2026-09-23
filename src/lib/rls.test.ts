import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

function env(name: string): string {
  if (process.env[name]) return process.env[name] as string;
  const file = readFileSync(".env", "utf8");
  const line = file.split("\n").find((l) => l.startsWith(`${name}=`));
  return (line?.slice(name.length + 1) ?? "").trim().replace(/^["']|["']$/g, "");
}

const anon = createClient(env("VITE_SUPABASE_URL"), env("VITE_SUPABASE_PUBLISHABLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Ces tests vérifient que la base refuse les écritures et les lectures privées
// à un visiteur non authentifié : la séparation des rôles ne dépend pas de l'interface.
describe("règles d'autorisation en base", () => {
  it("laisse lire les missions publiques", async () => {
    const { error } = await anon.from("missions").select("id").limit(1);
    expect(error).toBeNull();
  });

  it("refuse la publication d'une mission sans compte", async () => {
    const { error } = await anon
      .from("missions")
      .insert({ title: "Test RLS", owner_id: "00000000-0000-0000-0000-000000000000", budget: 1 });
    expect(error).not.toBeNull();
  });

  it("refuse la candidature sans compte", async () => {
    const { error } = await anon
      .from("applications")
      .insert({ mission_id: "00000000-0000-0000-0000-000000000000", freelance_id: "00000000-0000-0000-0000-000000000000" });
    expect(error).not.toBeNull();
  });

  it("ne laisse fuiter ni messages, ni paiements, ni notifications", async () => {
    for (const table of ["messages", "payments", "notifications"] as const) {
      const { data, error } = await anon.from(table).select("id").limit(1);
      expect(error !== null || (data ?? []).length === 0).toBe(true);
    }
  });
});
