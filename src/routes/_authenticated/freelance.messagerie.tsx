import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FreelanceShell } from "@/components/console-shell";
import { Avatar, Label } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import { sendMessage, useMessages, useMyFreelanceProfile } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/messagerie")({
  head: () => ({
    meta: [
      { title: "Messagerie — Nodale" },
      { name: "description", content: "Échangez avec les entreprises pour lesquelles vous travaillez ou avez postulé." },
      { property: "og:title", content: "Messagerie — Nodale" },
      { property: "og:description", content: "Chaque conversation est rattachée à une entreprise." },
    ],
  }),
  component: FreelanceMessagerie,
});

function FreelanceMessagerie() {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const { data: profile } = useMyFreelanceProfile(userId);
  const { data: messages = [] } = useMessages(userId);
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [activeCompany, setActiveCompany] = useState<string | null>(null);

  const mine = useMemo(
    () => messages.filter((m) => profile && m.freelance_id === profile.id),
    [messages, profile],
  );

  const conversations = useMemo(() => {
    const map = new Map<string, { companyId: string | null; subject: string; messages: typeof mine }>();
    for (const m of mine) {
      const key = m.company_id ?? "sans-entreprise";
      if (!map.has(key)) map.set(key, { companyId: m.company_id, subject: m.subject, messages: [] });
      map.get(key)!.messages.push(m);
    }
    return Array.from(map.entries()).map(([key, v]) => ({ id: key, ...v }));
  }, [mine]);

  const active = conversations.find((c) => c.id === activeCompany) ?? conversations[0] ?? null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !profile || !active) return;
    await sendMessage({
      companyId: active.companyId,
      freelanceId: profile.id,
      freelanceUserId: userId,
      sender: "freelance",
      subject: active.subject,
      body: draft,
    });
    setDraft("");
    qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <FreelanceShell kicker="Communication" title="Messagerie">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-3">
          <div className="px-2 py-2">
            <Label>Conversations</Label>
          </div>
          <div className="space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCompany(c.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                  active?.id === c.id ? "bg-accent-soft ring-1 ring-accent/20" : "hover:bg-card"
                }`}
              >
                <Avatar initials={c.subject.slice(0, 2).toUpperCase()} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.subject}</div>
                  <div className="text-xs text-ink-soft truncate">{c.messages.length} message(s)</div>
                </div>
              </button>
            ))}
            {conversations.length === 0 && <p className="px-2 py-3 text-xs text-ink-soft">Aucune conversation pour le moment.</p>}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border flex flex-col min-h-[520px]">
          {active ? (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
                <Avatar initials={active.subject.slice(0, 2).toUpperCase()} size="sm" />
                <div>
                  <div className="text-sm font-medium">{active.subject}</div>
                  <div className="text-xs text-ink-soft">Conversation avec l'entreprise</div>
                </div>
              </div>

              <div className="flex-1 p-5 space-y-3 overflow-y-auto">
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === "freelance" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ring-1 ${
                        m.sender === "freelance" ? "bg-accent text-accent-foreground ring-accent/30" : "bg-card ring-border"
                      }`}
                    >
                      {m.body}
                      <div className={`mt-1 text-[10px] font-mono ${m.sender === "freelance" ? "text-accent-foreground/70" : "text-ink-faint"}`}>
                        {new Date(m.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-border">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Écrire un message…"
                  className="flex-1 rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors">
                  Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 grid place-items-center p-5">
              <p className="text-sm text-ink-soft text-center">
                Vous n'avez pas encore de conversation. Contactez une entreprise depuis une mission pour démarrer.
              </p>
            </div>
          )}
        </div>
      </div>
    </FreelanceShell>
  );
}
