import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FreelanceShell } from "@/components/console-shell";
import { Chip, SkillTag, StatusBadge } from "@/components/ui-kit";
import { formatEuro, statusLabels, useMissions, type MissionStatus } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/missions/")({
  head: () => ({
    meta: [
      { title: "Missions disponibles — Nodale" },
      { name: "description", content: "Parcourez les missions ouvertes par les entreprises et postulez en quelques clics." },
      { property: "og:title", content: "Missions disponibles — Nodale" },
      { property: "og:description", content: "Filtrez par catégorie, budget et compétences pour trouver votre prochaine mission." },
    ],
  }),
  component: FreelanceMissions,
});

const categories = ["Toutes", "Backend", "Frontend", "Data", "Mobile", "Automatisation", "Maintenance"] as const;

const field =
  "rounded-xl bg-card ring-1 ring-border px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function FreelanceMissions() {
  const { data: missions = [] } = useMissions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Toutes");
  const [minBudget, setMinBudget] = useState(0);
  const [skill, setSkill] = useState("Toutes");

  const open = useMemo(() => missions.filter((m) => !m.paused && (m.status === "todo" || m.status === "active")), [missions]);

  const allSkills = useMemo(() => Array.from(new Set(open.flatMap((m) => m.skills))).sort(), [open]);

  const results = useMemo(
    () =>
      open.filter(
        (m) =>
          (category === "Toutes" || m.category === category) &&
          m.budget >= minBudget &&
          (skill === "Toutes" || m.skills.includes(skill)) &&
          (query === "" || `${m.title} ${m.company} ${m.skills.join(" ")}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [open, query, category, minBudget, skill],
  );

  return (
    <FreelanceShell kicker="Marketplace" title="Missions disponibles">
      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une mission, une entreprise, une techno…"
            className={`${field} flex-1`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select value={skill} onChange={(e) => setSkill(e.target.value)} className={field}>
              <option value="Toutes">Toutes compétences</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
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
              to="/freelance/missions/$missionId"
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
    </FreelanceShell>
  );
}
