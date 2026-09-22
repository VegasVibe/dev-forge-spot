import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Chip, SkillTag, StatusBadge } from "@/components/ui-kit";
import { formatEuro, missions, statusLabels, type MissionStatus } from "@/lib/mock-data";
import { usePublishedMissions } from "@/lib/published-missions";

export const Route = createFileRoute("/missions/")({
  head: () => ({
    meta: [
      { title: "Missions freelance disponibles — Nodale" },
      { name: "description", content: "Parcourez les missions techniques ouvertes : backend, frontend, data, mobile, automatisation et maintenance." },
      { property: "og:title", content: "Missions freelance disponibles — Nodale" },
      { property: "og:description", content: "Filtrez par stack, budget et statut pour trouver la mission adaptée." },
    ],
  }),
  component: MissionsPage,
});

const categories = ["Toutes", "Backend", "Frontend", "Data", "Mobile", "Automatisation", "Maintenance"] as const;
const statuses: (MissionStatus | "tous")[] = ["tous", "todo", "active", "done", "paid", "archived"];

const field =
  "rounded-xl bg-card ring-1 ring-border px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function MissionsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Toutes");
  const [status, setStatus] = useState<MissionStatus | "tous">("tous");
  const [minBudget, setMinBudget] = useState(0);
  const published = usePublishedMissions();

  const results = useMemo(
    () =>
      [...published, ...missions].filter(
        (m) =>
          (category === "Toutes" || m.category === category) &&
          (status === "tous" || m.status === status) &&
          m.budget >= minBudget &&
          (query === "" ||
            `${m.title} ${m.company} ${m.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, category, status, minBudget],
  );

  return (
    <AppShell kicker="Marketplace" title="Missions disponibles">
      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une mission, une entreprise, une techno…"
            className={`${field} flex-1`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as MissionStatus | "tous")} className={field}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "tous" ? "Tous les statuts" : statusLabels[s]}
                </option>
              ))}
            </select>
            <select value={minBudget} onChange={(e) => setMinBudget(Number(e.target.value))} className={field}>
              <option value={0}>Tous budgets</option>
              <option value={10000}>≥ 10 000 €</option>
              <option value={20000}>≥ 20 000 €</option>
              <option value={30000}>≥ 30 000 €</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center rounded-full glass ring-1 ring-border p-0.5 w-fit">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)}>
              <Chip active={category === c}>{c}</Chip>
            </button>
          ))}
        </div>

        <div className="hidden md:grid grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr] gap-3 px-2.5 pt-6 pb-2 label-mono">
          <span>Mission</span>
          <span>Compétences</span>
          <span>Budget</span>
          <span>Durée</span>
          <span>Statut</span>
        </div>

        <div className="divide-y divide-border">
          {results.map((m) => (
            <Link
              key={m.id}
              to="/missions/$missionId"
              params={{ missionId: m.id }}
              className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_0.8fr_0.7fr_0.9fr] gap-3 items-center px-2.5 py-3.5 hover:bg-card/60 rounded-lg transition-colors"
            >
              <div>
                <div className="text-sm font-medium">{m.title}</div>
                <div className="text-xs text-ink-soft">{m.company} · {m.team}</div>
              </div>
              <div className="hidden md:flex flex-wrap gap-1">
                {m.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
              </div>
              <div className="text-sm font-mono">{formatEuro(m.budget)}</div>
              <div className="hidden md:block text-xs text-ink-soft">{m.duration}</div>
              <div className="justify-self-end md:justify-self-start"><StatusBadge status={m.status} /></div>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-soft">Aucune mission ne correspond à ces filtres.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
