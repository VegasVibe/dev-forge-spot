import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Meter, Panel, SkillTag } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { sendMessage, useFreelances, useShortlist, useToggleShortlist } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/shortlist")({
  head: () => ({
    meta: [
      { title: "Shortlist et comparaison — Nodale" },
      {
        name: "description",
        content: "Comparez les développeurs retenus : tarif, disponibilité, expérience, note et compétences.",
      },
      { property: "og:title", content: "Shortlist et comparaison — Nodale" },
      { property: "og:description", content: "Tarif, disponibilité, expérience et compétences côte à côte." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShortlistPage,
});

function ShortlistPage() {
  const me = useMe();
  const userId = me.data?.userId;
  const { data: ids = [] } = useShortlist(userId);
  const { data: freelances = [] } = useFreelances();
  const toggle = useToggleShortlist(userId);

  const [contactId, setContactId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sentTo, setSentTo] = useState<string[]>([]);

  const profiles = freelances.filter((f) => ids.includes(f.id));
  const bestRate = Math.min(...profiles.map((f) => f.rate));
  const bestRating = Math.max(...profiles.map((f) => f.rating));
  const bestMissions = Math.max(...profiles.map((f) => f.missions_count));

  async function send(id: string) {
    const f = profiles.find((p) => p.id === id);
    if (!f || !draft.trim() || !userId) return;
    await sendMessage({
      companyId: userId,
      freelanceId: f.id,
      freelanceUserId: f.user_id,
      sender: "entreprise",
      subject: "Prise de contact",
      body: draft.trim(),
    });
    setSentTo((s) => [...s, id]);
    setDraft("");
    setContactId(null);
  }

  return (
    <CompanyShell
      kicker="Sélection"
      title="Shortlist et comparaison"
      actions={
        profiles.length > 0 ? (
          <button
            onClick={() => profiles.forEach((f) => toggle.mutate({ freelanceId: f.id, on: false }))}
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
              to={"/entreprise/recommandations" as never}
              className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
            >
              Lancer une recommandation
            </Link>
            <Link
              to={"/entreprise/freelances" as never}
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
                    to={"/entreprise/freelances/$freelanceId" as never}
                    params={{ freelanceId: f.id }}
                    className="font-display font-semibold tracking-tight hover:text-accent transition-colors"
                  >
                    {f.name}
                  </Link>
                  <div className="text-xs text-ink-soft">{f.title} · {f.city}</div>
                </div>
                <button
                  onClick={() => toggle.mutate({ freelanceId: f.id, on: false })}
                  className="text-xs text-ink-faint hover:text-destructive"
                >
                  Retirer
                </button>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm">
                <Row label="TJM" value={`${f.rate} €`} highlight={f.rate === bestRate} />
                <Row label="Disponibilité" value={f.available ? "Disponible" : "Indisponible"} highlight={f.available} />
                <Row label="Expérience" value={`${f.missions_count} missions`} highlight={f.missions_count === bestMissions} />
                <Row label="Note" value={`${f.rating} / 5 (${f.reviews} avis)`} highlight={f.rating === bestRating} />
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
                  <Link to={"/entreprise/messagerie" as never} className="text-sm text-ok">
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
                        onClick={() => void send(f.id)}
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
    </CompanyShell>
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
