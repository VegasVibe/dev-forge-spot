import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CompanyShell } from "@/components/console-shell";
import { Avatar, Chip, SkillTag } from "@/components/ui-kit";
import { useFreelances } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/entreprise/freelances/")({
  head: () => ({
    meta: [
      { title: "Développeurs freelances vérifiés — Nodale" },
      { name: "description", content: "Parcourez des développeurs freelances vérifiés : stack, tarif journalier, disponibilité et évaluations." },
      { property: "og:title", content: "Développeurs freelances vérifiés — Nodale" },
      { property: "og:description", content: "Stack, tarif, disponibilité et évaluations en un coup d'œil." },
    ],
  }),
  component: FreelancesPage,
});

const field =
  "rounded-xl bg-card ring-1 ring-border px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-shadow";

function FreelancesPage() {
  const { data: freelances = [], isLoading } = useFreelances();
  const [query, setQuery] = useState("");
  const [stack, setStack] = useState("Tous");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [maxRate, setMaxRate] = useState(2000);

  const stacks = useMemo(
    () => ["Tous", ...Array.from(new Set(freelances.flatMap((f) => f.skills))).slice(0, 6)],
    [freelances],
  );

  const results = useMemo(
    () =>
      freelances.filter(
        (f) =>
          (stack === "Tous" || f.skills.some((s) => s.toLowerCase().includes(stack.toLowerCase()))) &&
          (!onlyAvailable || f.available) &&
          f.rate <= maxRate &&
          (query === "" || `${f.name} ${f.title} ${f.skills.join(" ")} ${f.city}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [freelances, query, stack, onlyAvailable, maxRate],
  );

  return (
    <CompanyShell kicker="Marketplace" title="Développeurs freelances">
      <div className="glass rounded-2xl ring-1 ring-border p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un profil, une techno, une ville…"
            className={`${field} flex-1`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <select value={maxRate} onChange={(e) => setMaxRate(Number(e.target.value))} className={field}>
              <option value={2000}>Tous tarifs</option>
              <option value={500}>≤ 500 €/j</option>
              <option value={650}>≤ 650 €/j</option>
              <option value={800}>≤ 800 €/j</option>
            </select>
            <button
              onClick={() => setOnlyAvailable((v) => !v)}
              className={`rounded-xl px-3.5 py-2 text-sm ring-1 transition-colors ${
                onlyAvailable ? "bg-accent-soft text-accent ring-accent/25" : "bg-card ring-border text-ink-soft"
              }`}
            >
              Disponibles
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center rounded-full glass ring-1 ring-border p-0.5 w-fit">
          {stacks.map((s) => (
            <button key={s} onClick={() => setStack(s)}>
              <Chip active={stack === s}>{s}</Chip>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && <p className="text-sm text-ink-soft">Chargement des profils…</p>}
        {results.map((f) => (
          <Link
            key={f.id}
            to={"/entreprise/freelances/$freelanceId" as never}
            params={{ freelanceId: f.id } as never}
            className="glass rounded-2xl ring-1 ring-border p-5 hover:ring-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar initials={f.initials} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{f.name}</div>
                <div className="text-xs text-ink-soft truncate">{f.title}</div>
              </div>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                  f.available ? "bg-ok-soft text-ok ring-ok/20" : "bg-muted text-muted-foreground ring-border"
                }`}
              >
                <span className={`size-1.5 rounded-full ${f.available ? "bg-ok" : "bg-muted-foreground"}`} />
                {f.available ? "Disponible" : "Occupé"}
              </span>
            </div>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed line-clamp-2">{f.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {f.skills.slice(0, 3).map((s) => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 text-center">
              <div>
                <div className="font-display font-semibold">{f.rate} €</div>
                <div className="label-mono">/ jour</div>
              </div>
              <div>
                <div className="font-display font-semibold">{f.rating}</div>
                <div className="label-mono">Note</div>
              </div>
              <div>
                <div className="font-display font-semibold">{f.missions_count}</div>
                <div className="label-mono">Missions</div>
              </div>
            </div>
          </Link>
        ))}
        {!isLoading && results.length === 0 && (
          <p className="py-10 text-sm text-ink-soft">Aucun profil ne correspond à ces filtres.</p>
        )}
      </div>
    </CompanyShell>
  );
}
