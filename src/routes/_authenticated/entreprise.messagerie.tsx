import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { CompanyShell } from "@/components/console-shell";
import { Avatar, Label, Panel } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { sendMessage, useFreelances, useMessages, type MessageRow } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/messagerie")({
  head: () => ({
    meta: [
      { title: "Messagerie entreprise — Nodale" },
      { name: "description", content: "Échangez directement avec les développeurs freelances de vos missions." },
      { property: "og:title", content: "Messagerie entreprise — Nodale" },
      { property: "og:description", content: "Toutes vos conversations avec les développeurs au même endroit." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessageriePage,
});

function MessageriePage() {
  const me = useMe();
  const userId = me.data?.userId;
  const qc = useQueryClient();
  const { data: messages = [] } = useMessages(userId);
  const { data: freelances = [] } = useFreelances();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const threads = new Map<string, MessageRow[]>();
  messages.forEach((m) => threads.set(m.freelance_id, [...(threads.get(m.freelance_id) ?? []), m]));
  const ids = Array.from(threads.keys());
  const current = activeId ?? ids[0] ?? null;
  const thread = current ? (threads.get(current) ?? []) : [];
  const partner = freelances.find((f) => f.id === current);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!current || !draft.trim() || !userId) return;
    await sendMessage({
      companyId: userId,
      freelanceId: current,
      freelanceUserId: partner?.user_id ?? null,
      sender: "entreprise",
      subject: "Conversation",
      body: draft.trim(),
    });
    setDraft("");
    void qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <CompanyShell kicker="Échanges" title="Messagerie">
      {ids.length === 0 ? (
        <Panel>
          <Label>Aucune conversation</Label>
          <p className="mt-3 text-sm text-ink-soft max-w-[54ch]">
            Contactez un développeur depuis sa fiche, la shortlist ou la recommandation IA pour démarrer un échange.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Panel>
            <Label>Conversations</Label>
            <ul className="mt-3 space-y-1">
              {ids.map((id) => {
                const f = freelances.find((fr) => fr.id === id);
                const last = threads.get(id)?.at(-1);
                return (
                  <li key={id}>
                    <button
                      onClick={() => setActiveId(id)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 ring-1 transition-colors ${
                        current === id ? "bg-accent-soft ring-accent/30" : "bg-card/60 ring-border hover:bg-card"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar initials={f?.initials ?? "ND"} size="sm" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{f?.name ?? id}</div>
                          <div className="text-xs text-ink-soft truncate">{last?.body}</div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel>
            <div className="flex items-center gap-3">
              <Avatar initials={partner?.initials ?? "ND"} />
              <div>
                <div className="font-display font-semibold tracking-tight">{partner?.name ?? current}</div>
                <div className="text-xs text-ink-soft">{partner?.title}</div>
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {thread.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ring-1 ${
                    m.sender === "entreprise"
                      ? "ml-auto bg-accent-soft ring-accent/20"
                      : "bg-card/70 ring-border"
                  }`}
                >
                  <div>{m.body}</div>
                  <div className="mt-1 text-[10px] font-mono text-ink-faint">
                    {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={submit} className="mt-4 flex gap-2 border-t border-border pt-4">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Écrire un message…"
                className="flex-1 rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors disabled:opacity-40"
              >
                Envoyer
              </button>
            </form>
          </Panel>
        </div>
      )}
    </CompanyShell>
  );
}
