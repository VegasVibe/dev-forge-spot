import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Avatar, Label } from "@/components/ui-kit";
import { conversations as mockConversations } from "@/lib/mock-data";
import { useDirectThreads } from "@/lib/direct-messages";

export const Route = createFileRoute("/messagerie")({
  head: () => ({
    meta: [
      { title: "Messagerie — Nodale" },
      { name: "description", content: "Échangez avec vos développeurs et vos clients, chaque conversation rattachée à sa mission." },
      { property: "og:title", content: "Messagerie — Nodale" },
      { property: "og:description", content: "Conversations rattachées aux missions, sans e-mails perdus." },
    ],
  }),
  component: Messagerie,
});

function Messagerie() {
  const [activeId, setActiveId] = useState(mockConversations[0]!.id);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<Record<string, { from: "me"; text: string; time: string }[]>>({});
  const direct = useDirectThreads();

  const conversations = [
    ...direct.map((t) => ({
      id: `direct-${t.freelanceId}`,
      name: t.name,
      initials: t.initials,
      role: t.role,
      mission: t.subject,
      unread: 0,
      messages: t.messages,
    })),
    ...mockConversations,
  ];

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0]!;
  const thread = [...active.messages, ...(sent[active.id] ?? [])];

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSent((s) => ({ ...s, [active.id]: [...(s[active.id] ?? []), { from: "me", text: draft, time: "à l'instant" }] }));
    setDraft("");
  }

  return (
    <AppShell kicker="Communication" title="Messagerie">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">
        <div className="glass rounded-2xl ring-1 ring-border p-3">
          <div className="px-2 py-2">
            <Label>Conversations</Label>
          </div>
          <div className="space-y-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                  c.id === active.id ? "bg-accent-soft ring-1 ring-accent/20" : "hover:bg-card"
                }`}
              >
                <Avatar initials={c.initials} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-xs text-ink-soft truncate">{c.mission}</div>
                </div>
                {c.unread > 0 && (
                  <span className="ml-auto grid place-items-center size-5 rounded-full bg-accent text-accent-foreground text-[10px] font-medium">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border flex flex-col min-h-[520px]">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
            <Avatar initials={active.initials} size="sm" />
            <div>
              <div className="text-sm font-medium">{active.name}</div>
              <div className="text-xs text-ink-soft">{active.role} · {active.mission}</div>
            </div>
          </div>

          <div className="flex-1 p-5 space-y-3 overflow-y-auto">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ring-1 ${
                    m.from === "me" ? "bg-accent text-accent-foreground ring-accent/30" : "bg-card ring-border"
                  }`}
                >
                  {m.text}
                  <div className={`mt-1 text-[10px] font-mono ${m.from === "me" ? "text-accent-foreground/70" : "text-ink-faint"}`}>
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 p-4 border-t border-border">
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
        </div>
      </div>
    </AppShell>
  );
}
