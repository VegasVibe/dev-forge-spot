import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Avatar, Label, SkillTag, StatusBadge } from "@/components/ui-kit";
import { formatEuro, getFreelance, missions } from "@/lib/mock-data";

export const Route = createFileRoute("/freelances/$freelanceId")({
  loader: ({ params }) => {
    const freelance = getFreelance(params.freelanceId);
    if (!freelance) throw notFound();
    return { freelance };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Profil introuvable — Nodale" }, { name: "robots", content: "noindex" }] };
    }
    const { freelance } = loaderData;
    const description = `${freelance.title} à ${freelance.city}. ${freelance.rate} €/jour, note ${freelance.rating}/5 sur ${freelance.reviews} évaluations.`;
    return {
      meta: [
        { title: `${freelance.name} — ${freelance.title} freelance` },
        { name: "description", content: description },
        { property: "og:title", content: `${freelance.name} — ${freelance.title}` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: FreelanceDetail,
});

function FreelanceDetail() {
  const { freelance } = Route.useLoaderData();
  const history = missions.filter((m) => m.freelanceId === freelance.id);

  return (
    <AppShell
      kicker={`${freelance.title} · ${freelance.city}`}
      title={freelance.name}
      actions={
        <>
          <Link
            to="/messagerie"
            className="rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 hover:bg-accent/90 transition-colors"
          >
            Envoyer un message
          </Link>
          <Link
            to="/missions"
            className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors"
          >
            Proposer une mission
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex items-center gap-4">
              <Avatar initials={freelance.initials} size="lg" />
              <div>
                <div className="font-display font-semibold text-lg">{freelance.name}</div>
                <div className="text-sm text-ink-soft">{freelance.title}</div>
              </div>
              <span
                className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ring-1 ${
                  freelance.available ? "bg-ok-soft text-ok ring-ok/20" : "bg-muted text-muted-foreground ring-border"
                }`}
              >
                <span className={`size-1.5 rounded-full ${freelance.available ? "bg-ok" : "bg-muted-foreground"}`} />
                {freelance.available ? "Disponible" : "Occupé"}
              </span>
            </div>
            <p className="mt-4 text-ink-soft leading-relaxed">{freelance.bio}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {freelance.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <h2 className="font-display font-semibold text-base tracking-tight mb-4">Portfolio</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {freelance.portfolio.map((p) => (
                <div key={p.title} className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="mt-1 text-xs text-ink-soft">{p.client} · {p.year}</div>
                  <div className="mt-3 text-xs font-mono text-accent">{p.result}</div>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="glass rounded-2xl ring-1 ring-border p-5">
              <h2 className="font-display font-semibold text-base tracking-tight mb-4">Missions sur Nodale</h2>
              <div className="divide-y divide-border">
                {history.map((m) => (
                  <Link
                    key={m.id}
                    to="/missions/$missionId"
                    params={{ missionId: m.id }}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 group"
                  >
                    <div>
                      <div className="text-sm font-medium group-hover:text-accent transition-colors">{m.title}</div>
                      <div className="text-xs text-ink-soft">{m.company}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono">{formatEuro(m.budget)}</span>
                      <StatusBadge status={m.status} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <Label>Conditions</Label>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                <div className="font-display font-semibold text-lg">{freelance.rate} €</div>
                <div className="label-mono">/ jour</div>
              </div>
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                <div className="font-display font-semibold text-lg">{freelance.rating}</div>
                <div className="label-mono">Note</div>
              </div>
              <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
                <div className="font-display font-semibold text-lg">{freelance.missions}</div>
                <div className="label-mono">Missions</div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <Label>Évaluations ({freelance.reviews})</Label>
            <div className="mt-4 space-y-4">
              {freelance.testimonials.map((t) => (
                <figure key={t.author}>
                  <blockquote className="text-sm leading-relaxed">« {t.text} »</blockquote>
                  <figcaption className="mt-2 text-xs text-ink-soft">
                    {t.author} · {t.company} · {t.rating}/5
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
