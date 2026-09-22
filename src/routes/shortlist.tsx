import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Avatar, Label, Meter, Panel, SkillTag } from "@/components/ui-kit";
import { getFreelance } from "@/lib/mock-data";
import { useShortlist } from "@/lib/shortlist";
import { sendDirectMessage } from "@/lib/direct-messages";

export const Route = createFileRoute("/shortlist")({
  head: () => ({
    meta: [
      { title: "Shortlist et comparaison — Nodale" },
      {
        name: "description",
        content:
          "Comparez côte à côte les développeurs freelances retenus : tarif, disponibilité, expérience, note et compétences, puis contactez-les.",
      },
      { property: "og:title", content: "Shortlist et comparaison — Nodale" },
      {
        property: "og:description",
        content: "Tarif, disponibilité, expérience et compétences des freelances retenus, côte à côte.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShortlistPage,
});

function ShortlistPage() {
  const { ids, remove, clear } = useShortlist();
  const [contactId, setContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);

  const profiles = ids.map((id) => getFreelance(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof getFreelance>
  >[];

  const bestRate = Math.min(...profiles.map((f) => f.rate));
  const bestRating = Math.max(...profiles.map((f) => f.rating));
  const bestMissions = Math.max(...profiles.map((f) => f.missions));

  function send(id: string) {
    const f = getFreelance(id);
    if (!f || !draft.trim()) return;
    sendDirectMessage(
      { freelanceId: f.id, name: f.name, initials: f.initials, role: f.title, subject: "Prise de contact" },
      draft.trim(),
    );
    setSentTo((s) => [...s, id]);
    setDraft("");
    setContactId(null);
  }

  return (
    <AppShell
      kicker="Sélection"
      title="Shortlist et comparaison"
      actions={
        profiles.length > 0 ? (
          <button
            onClick={clear}
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Vider la shortlist
          </button>
        ) : undefined
      }
    >
      {profiles.length === 0 ? (
        <Panel>
          <Label>Shortlist vide</Label>
          <p className="mt-3 text-sm text-ink-soft max-w-[54ch]">
            Ajoutez des développeurs depuis la recommandation IA ou l'annuaire pour les comparer côte à côte.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/recommandations"
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
            >
              Lancer une recommandation
            </Link>
            <Link
              to="/freelances"
              className="rounded-xl glass text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
            >
              Parcourir les développeurs
            </Link>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((f) => (
            <Panel key={f.id}>
              <div className="flex items-start gap-3">
                <Avatar initials={f.initials} />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/freelances/$freelanceId"
                    params={{ freelanceId: f.id }}
                    className="font-display font-semibold tracking-tight hover:text-accent transition-colors"
                  >
                    {f.name}
                  </Link>
                  <div className="text-xs text-ink-soft">{f.title} · {f.city}</div>
                </div>
                <button onClick={() => remove(f.id)} className="text-xs text-ink-faint hover:text-destructive">
                  Retirer
                </button>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm">
                <Row label="TJM" value={`${f.rate} €`} highlight={f.rate === bestRate} />
                <Row
                  label="Disponibilité"
                  value={f.available ? "Disponible" : "Indisponible"}
                  highlight={f.available}
                />
                <Row label="Expérience" value={`${f.missions} missions`} highlight={f.missions === bestMissions} />
                <Row label="Note" value={`${f.rating} ★ (${f.reviews} avis)`} highlight={f.rating === bestRating} />
              </dl>

              <div className="mt-4">
                <Label>Satisfaction</Label>
                <div className="mt-2">
                  <Meter value={Math.round((f.rating / 5) * 100)} tone="ok" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {f.skills.map((s) => (
                  <SkillTag key={s}>{s}</SkillTag>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-4">
                {sentTo.includes(f.id) ? (
                  <Link to="/messagerie" className="text-sm text-ok">
                    Message envoyé · ouvrir la conversation
                  </Link>
                ) : contactId === f.id ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={`Bonjour ${f.name.split(" ")[0]}, votre profil correspond à notre besoin…`}
                      className="w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => send(f.id)}
                        disabled={!draft.trim()}
                        className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2 px-3.5 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
                      >
                        Envoyer
                      </button>
                      <button
                        onClick={() => setContactId(null)}
                        className="rounded-xl glass text-sm py-2 px-3.5 ring-1 ring-border hover:bg-card transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setContactId(f.id);
                      setDraft("");
                    }}
                    className="w-full rounded-xl glass text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
                  >
                    Contacter {f.name.split(" ")[0]}
                  </button>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="label-mono">{label}</dt>
      <dd className={`font-mono text-xs tabular-nums ${highlight ? "text-ok" : "text-ink-soft"}`}>{value}</dd>
    </div>
  );
}
