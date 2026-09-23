import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Label } from "@/components/ui-kit";
import { useMe, type Role } from "@/lib/auth";
import {
  applicationStatusLabels,
  formatEuro,
  markAllRead,
  missionMatchesAlert,
  useAlerts,
  useApplications,
  useMessages,
  useMissions,
  useMyFreelanceProfile,
  useNotifications,
} from "@/lib/db";

type Kind = "mission" | "message" | "candidature";

type Item = {
  id: string;
  kind: Kind;
  title: string;
  detail: string;
  date: string;
  unread: boolean;
  to?: string | undefined;
};

const kindLabels: Record<Kind, string> = {
  mission: "Missions",
  message: "Messages",
  candidature: "Candidatures",
};

const kindTone: Record<Kind, string> = {
  mission: "bg-accent-soft text-accent ring-accent/20",
  message: "bg-info-soft text-info ring-info/20",
  candidature: "bg-ok-soft text-ok ring-ok/20",
};

function fullDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Regroupe missions compatibles, messages et suivi des candidatures. */
export function NotificationCenter({ role }: { role: Role }) {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const qc = useQueryClient();

  const { data: stored = [] } = useNotifications(userId);
  const { data: messages = [] } = useMessages(userId);
  const { data: missions = [] } = useMissions();
  const { data: alerts = [] } = useAlerts(userId);
  const { data: freelanceProfile } = useMyFreelanceProfile(role === "freelance" ? userId : null);
  const { data: applications = [] } = useApplications(
    role === "entreprise" ? { companyId: userId } : userId ? { freelanceUserId: userId } : undefined,
  );

  const [filter, setFilter] = useState<"tout" | Kind>("tout");

  const items = useMemo<Item[]>(() => {
    const list: Item[] = [];

    for (const n of stored) {
      const kind: Kind = n.kind === "message" ? "message" : n.kind === "candidature" ? "candidature" : "mission";
      list.push({
        id: `n-${n.id}`,
        kind,
        title: n.title,
        detail: n.detail,
        date: n.created_at,
        unread: !n.read,
        to:
          n.link ??
          (kind === "message" ? (role === "entreprise" ? "/entreprise/messagerie" : "/freelance/messagerie") : undefined),
      });
    }

    for (const m of messages.filter((msg) => msg.sender !== role).slice(-20)) {
      list.push({
        id: `m-${m.id}`,
        kind: "message",
        title: m.subject || "Nouveau message",
        detail: m.body.slice(0, 120),
        date: m.created_at,
        unread: false,
        to: role === "entreprise" ? "/entreprise/messagerie" : "/freelance/messagerie",
      });
    }

    for (const a of applications) {
      const label = applicationStatusLabels[a.status];
      list.push({
        id: `a-${a.id}`,
        kind: "candidature",
        title:
          role === "entreprise"
            ? `Candidature ${label.toLowerCase()} · ${a.mission_title}`
            : `Votre candidature : ${label.toLowerCase()}`,
        detail:
          role === "entreprise"
            ? `${a.rate} € / jour · ${a.availability || "disponibilité non précisée"}`
            : `${a.mission_title} — ${a.availability || "disponibilité non précisée"}`,
        date: a.created_at,
        unread: false,
        to: role === "entreprise" ? "/entreprise/candidatures" : "/freelance/candidatures",
      });
    }

    if (role === "freelance" && alerts.length) {
      const seen = new Set<string>();
      for (const alert of alerts.filter((al) => al.criteria?.scope === "mission")) {
        for (const m of missions.filter((mi) => missionMatchesAlert(mi, alert.criteria, freelanceProfile))) {
          if (seen.has(m.id)) continue;
          seen.add(m.id);
          list.push({
            id: `mi-${m.id}`,
            kind: "mission",
            title: `Mission compatible : ${m.title}`,
            detail: `${m.company} · ${formatEuro(m.budget)} · alerte « ${alert.label} »`,
            date: m.created_at,
            unread: false,
            to: "/freelance/missions",
          });
        }
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 80);
  }, [stored, messages, applications, alerts, missions, freelanceProfile, role]);

  const visible = filter === "tout" ? items : items.filter((i) => i.kind === filter);
  const unreadIds = stored.filter((n) => !n.read).map((n) => n.id);

  async function readAll() {
    await markAllRead(unreadIds);
    await qc.invalidateQueries({ queryKey: ["notifications", userId] });
  }

  const counts: Record<Kind, number> = {
    mission: items.filter((i) => i.kind === "mission").length,
    message: items.filter((i) => i.kind === "message").length,
    candidature: items.filter((i) => i.kind === "candidature").length,
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["tout", "mission", "message", "candidature"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                filter === f ? "bg-accent-soft text-accent ring-accent/20" : "bg-card text-ink-soft ring-border hover:bg-muted"
              }`}
            >
              {f === "tout" ? "Tout" : kindLabels[f]}
              <span className="ml-1.5 font-mono text-[10px] text-ink-faint">
                {f === "tout" ? items.length : counts[f]}
              </span>
            </button>
          ))}
          {unreadIds.length > 0 && (
            <button onClick={() => void readAll()} className="ml-auto text-xs text-accent hover:text-accent/80">
              Tout marquer comme lu
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-ink-soft">Aucune notification dans cette catégorie pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((item) => {
              const body = (
                <>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 shrink-0 ${kindTone[item.kind]}`}>
                      {kindLabels[item.kind]}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <span className="truncate">{item.title}</span>
                        {item.unread && <span className="size-1.5 rounded-full bg-accent shrink-0" />}
                      </div>
                      <div className="text-xs text-ink-soft">{item.detail}</div>
                      <div className="mt-0.5 text-[10px] font-mono text-ink-faint">{fullDate(item.date)}</div>
                    </div>
                  </div>
                </>
              );
              return (
                <li key={item.id} className="py-3 first:pt-0">
                  {item.to ? (
                    <Link to={item.to as never} className="block rounded-xl -mx-2 px-2 py-1 hover:bg-card transition-colors">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="space-y-4">
        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <Label>Résumé</Label>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-soft">Non lues</span>
              <span className="font-mono">{unreadIds.length}</span>
            </div>
            {(Object.keys(kindLabels) as Kind[]).map((k) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-ink-soft">{kindLabels[k]}</span>
                <span className="font-mono">{counts[k]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <Label>Raccourcis</Label>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link
              to={(role === "entreprise" ? "/entreprise/messagerie" : "/freelance/messagerie") as never}
              className="rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 hover:bg-muted transition-colors"
            >
              Ouvrir la messagerie
            </Link>
            <Link
              to={(role === "entreprise" ? "/entreprise/candidatures" : "/freelance/candidatures") as never}
              className="rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 hover:bg-muted transition-colors"
            >
              Voir les candidatures
            </Link>
            <Link
              to={(role === "entreprise" ? "/entreprise/missions" : "/freelance/alertes") as never}
              className="rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 hover:bg-muted transition-colors"
            >
              {role === "entreprise" ? "Gérer mes missions" : "Régler mes alertes missions"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
