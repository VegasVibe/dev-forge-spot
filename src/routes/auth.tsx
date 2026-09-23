import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SitePage } from "@/components/site-chrome";
import { Label } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { homeFor, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion et inscription — Nodale" },
      {
        name: "description",
        content: "Connectez-vous à votre espace entreprise ou à votre espace développeur freelance sur Nodale.",
      },
      { property: "og:title", content: "Connexion et inscription — Nodale" },
      { property: "og:description", content: "Deux espaces distincts : entreprise ou développeur freelance." },
    ],
  }),
  component: Auth,
});

const field =
  "w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

export const PENDING_ROLE_KEY = "nodale.pending-role";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [role, setRole] = useState<Role>("entreprise");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Déjà connecté : on renvoie directement vers le bon espace.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || cancelled) return;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      navigate({ to: homeFor(((profile?.role as Role) ?? "entreprise")), replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function goToSpace() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
    navigate({ to: homeFor(((profile?.role as Role) ?? role)), replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              role,
              full_name: name || email.split("@")[0],
              company_name: role === "entreprise" ? name : null,
            },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setInfo("Compte créé. Ouvrez l'e-mail de confirmation pour activer votre accès, puis connectez-vous.");
          setMode("login");
          return;
        }
        await goToSpace();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        await goToSpace();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setError(null);
    setBusy(true);
    try {
      window.localStorage.setItem(PENDING_ROLE_KEY, role);
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) {
        setError("La connexion a échoué. Réessayez.");
        return;
      }
      if (result.redirected) return;
      await goToSpace();
    } catch {
      setError("La connexion a échoué. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SitePage>
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10 items-start">
          <div className="lg:col-span-6">
            <Label>{mode === "signup" ? "Inscription" : "Connexion"}</Label>
            <h1 className="mt-4 font-display font-semibold text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em] max-w-[14ch]">
              {mode === "signup" ? "Choisissez votre espace." : "Retour dans votre espace."}
            </h1>
            <p className="mt-5 text-ink-soft max-w-[48ch] leading-relaxed">
              Deux univers distincts : les entreprises publient et pilotent leurs besoins techniques, les développeurs
              freelances trouvent des missions et gèrent leur activité. Vous arrivez directement dans le bon espace.
            </p>
            <ul className="mt-8 space-y-3 max-w-[46ch]">
              <li className="glass rounded-2xl ring-1 ring-border p-4">
                <div className="text-sm font-medium">Espace entreprise</div>
                <p className="mt-1 text-xs text-ink-soft">
                  Publier des besoins, comparer les candidatures, suivre les projets et les dépenses.
                </p>
              </li>
              <li className="glass rounded-2xl ring-1 ring-border p-4">
                <div className="text-sm font-medium">Espace développeur freelance</div>
                <p className="mt-1 text-xs text-ink-soft">
                  Trouver des missions, postuler, suivre ses projets, ses revenus et son portfolio.
                </p>
              </li>
            </ul>
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

              <div className="mt-6">
                <label className="label-mono">Je suis</label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
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
                        {r === "entreprise" ? "Une entreprise" : "Un développeur"}
                      </div>
                      <div className="mt-1 text-xs text-ink-soft">
                        {r === "entreprise" ? "Publier et piloter des missions" : "Trouver et gérer des missions"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void oauth("google")}
                  className="w-full rounded-xl bg-card ring-1 ring-border text-sm font-medium py-2.5 hover:bg-muted transition-colors disabled:opacity-60"
                >
                  Continuer avec Google
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void oauth("apple")}
                  className="w-full rounded-xl bg-card ring-1 ring-border text-sm font-medium py-2.5 hover:bg-muted transition-colors disabled:opacity-60"
                >
                  Continuer avec Apple
                </button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="label-mono">ou par e-mail</span>
                <span className="h-px flex-1 bg-line" />
              </div>

              <div className="space-y-3">
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
                  <label className="label-mono">E-mail</label>
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
                  <input
                    type="password"
                    required
                    minLength={6}
                    className={`${field} mt-1.5`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-xs text-destructive">{error}</p>}
              {info && <p className="mt-4 text-xs text-ok">{info}</p>}

              <button
                type="submit"
                disabled={busy}
                className="mt-6 w-full rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-60"
              >
                {busy ? "Un instant…" : mode === "signup" ? "Créer mon compte" : "Me connecter"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </SitePage>
  );
}
