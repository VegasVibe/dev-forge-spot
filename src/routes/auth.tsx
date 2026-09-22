import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";
import { writeSession, type Role } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion et inscription — Nodale" },
      {
        name: "description",
        content: "Créez votre compte entreprise ou freelance, ou connectez-vous à votre console Nodale.",
      },
      { property: "og:title", content: "Connexion et inscription — Nodale" },
      { property: "og:description", content: "Deux parcours : entreprise ou développeur freelance." },
    ],
  }),
  component: Auth,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<Role>("entreprise");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    writeSession({ role, name: name || (role === "entreprise" ? "Atelier Nord" : "Léa Martin"), email });
    if (mode === "signup") {
      navigate({ to: role === "entreprise" ? "/onboarding/entreprise" : "/onboarding/freelance" });
    } else {
      navigate({ to: role === "entreprise" ? "/dashboard/entreprise" : "/dashboard/freelance" });
    }
  }

  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10 items-start">
          <div className="lg:col-span-6">
            <Label>{mode === "signup" ? "Inscription" : "Connexion"}</Label>
            <h1 className="mt-4 font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em] max-w-[14ch]">
              {mode === "signup" ? "Choisissez votre parcours." : "Retour dans la console."}
            </h1>
            <p className="mt-5 text-ink-soft max-w-[48ch] leading-relaxed">
              Entreprise ou développeur freelance : l'espace de travail s'adapte à votre rôle dès la première connexion.
            </p>
          </div>

          <div className="lg:col-span-6 lg:col-start-8">
            <form onSubmit={submit} className="glass rounded-2xl ring-1 ring-border p-6 sm:p-7">
              <div className="flex items-center rounded-full glass ring-1 ring-border p-0.5 text-xs w-fit">
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`px-3 py-1 rounded-full ${mode === "signup" ? "bg-ink text-paper font-medium" : "text-ink-soft"}`}
                >
                  Créer un compte
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`px-3 py-1 rounded-full ${mode === "login" ? "bg-ink text-paper font-medium" : "text-ink-soft"}`}
                >
                  Se connecter
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {(["entreprise", "freelance"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-xl px-4 py-3 text-left ring-1 transition-colors ${
                      role === r ? "bg-accent-soft ring-accent/30" : "bg-card ring-border hover:bg-muted"
                    }`}
                  >
                    <div className={`text-sm font-medium ${role === r ? "text-accent" : ""}`}>
                      {r === "entreprise" ? "Entreprise" : "Freelance"}
                    </div>
                    <div className="mt-1 text-xs text-ink-soft">
                      {r === "entreprise" ? "Publier et piloter des missions" : "Trouver des missions"}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {mode === "signup" && (
                  <div>
                    <label className="label-mono">{role === "entreprise" ? "Nom de l'entreprise" : "Nom complet"}</label>
                    <input
                      className={`${field} mt-1.5`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={role === "entreprise" ? "Atelier Nord" : "Léa Martin"}
                    />
                  </div>
                )}
                <div>
                  <label className="label-mono">E-mail professionnel</label>
                  <input
                    type="email"
                    required
                    className={`${field} mt-1.5`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                  />
                </div>
                <div>
                  <label className="label-mono">Mot de passe</label>
                  <input type="password" required className={`${field} mt-1.5`} placeholder="••••••••" />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
              >
                {mode === "signup" ? "Créer mon compte" : "Me connecter"}
              </button>
              <p className="mt-4 text-xs text-ink-faint">
                Démo produit : les comptes sont simulés dans votre navigateur.{" "}
                <Link to="/dashboard/entreprise" className="text-accent">
                  Voir la console directement
                </Link>
                .
              </p>
            </form>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
