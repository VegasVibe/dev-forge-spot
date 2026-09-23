import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FreelanceShell } from "@/components/console-shell";
import { BarChart, GhostButton, Label, Meter, PrimaryButton, SkillTag, StatCard, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import {
  ensureFreelanceProfile,
  formatEuro,
  monthlySpend,
  useApplications,
  useMissions,
  useMyFreelanceProfile,
  usePayments,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord freelance — Nodale" },
      { name: "description", content: "Vos missions en cours, vos candidatures, vos revenus et la complétude de votre profil freelance." },
      { property: "og:title", content: "Tableau de bord freelance — Nodale" },
      { property: "og:description", content: "Un aperçu complet de votre activité de développeur freelance sur Nodale." },
    ],
  }),
  component: FreelanceDashboard,
});

function FreelanceDashboard() {
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const fullName = me?.profile?.full_name ?? "";
  const qc = useQueryClient();
  const { data: profile } = useMyFreelanceProfile(userId);
  const { data: missions = [] } = useMissions();
  const { data: applications = [] } = useApplications({ freelanceUserId: userId ?? undefined });
  const { data: payments = [] } = usePayments({ freelanceId: profile?.id });

  useEffect(() => {
    if (!userId || profile) return;
    void ensureFreelanceProfile(userId, fullName).then(() => {
      qc.invalidateQueries({ queryKey: ["my-freelance", userId] });
    });
  }, [userId, profile, fullName, qc]);

  const activeMissions = useMemo(
    () => missions.filter((m) => profile && m.freelance_id === profile.id && (m.status === "active" || m.status === "todo")),
    [missions, profile],
  );
  const pendingApplications = applications.filter((a) => a.status === "recue" || a.status === "entretien");
  const paid = payments.filter((p) => p.state === "paid").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.state !== "paid").reduce((s, p) => s + p.amount, 0);

  const completeness = useMemo(() => {
    if (!profile) return 0;
    const fields = [profile.title, profile.city, profile.bio, profile.skills?.length, profile.rate];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  return (
    <FreelanceShell
      kicker={`Espace développeur · ${profile?.title ?? "Profil"}`}
      title={`Bonjour, ${(fullName || "vous").split(" ")[0]}`}
      actions={
        <>
          <PrimaryButton to="/freelance/missions">Trouver une mission</PrimaryButton>
          <GhostButton to="/freelance/profil">Mon profil public</GhostButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Missions en cours" value={String(activeMissions.length)} hint={`${pendingApplications.length} candidature(s) en attente`} tone="info" />
        <StatCard label="Revenus encaissés" value={formatEuro(paid)} tone="ok" />
        <StatCard label="Paiements en attente" value={formatEuro(pending)} tone="warn" />
        <StatCard label="Complétude du profil" value={`${completeness}%`} meter={completeness} />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Mes missions en cours</h2>
          </div>
          {activeMissions.length === 0 ? (
            <p className="text-sm text-ink-soft">Aucune mission en cours pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {activeMissions.map((m) => (
                <div key={m.id} className="rounded-xl bg-card/70 ring-1 ring-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{m.title}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="mt-2 text-xs text-ink-soft">{m.company} · {m.duration}</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="font-mono">{formatEuro(m.budget)}</span>
                    <span className="text-ink-faint">{m.progress}%</span>
                  </div>
                  <div className="mt-2">
                    <Meter value={m.progress} tone={m.status === "paid" ? "ok" : "accent"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl ring-1 ring-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-base tracking-tight">Revenus</h2>
            <span className="text-[10px] font-mono text-ink-faint">6 mois</span>
          </div>
          <BarChart data={monthlySpend} unit="Tendance indicative" />
        </div>
      </div>

      {profile && (
        <div className="mt-4 glass rounded-2xl ring-1 ring-border p-5">
          <Label>Mon profil</Label>
          <h2 className="mt-2 font-display font-semibold text-lg">{profile.title}</h2>
          <p className="mt-2 text-sm text-ink-soft leading-relaxed">{profile.bio || "Complétez votre bio pour attirer plus d'entreprises."}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(profile.skills ?? []).map((s) => <SkillTag key={s}>{s}</SkillTag>)}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{profile.rate} €</div>
              <div className="label-mono">/ jour</div>
            </div>
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{profile.missions_count}</div>
              <div className="label-mono">Missions</div>
            </div>
            <div className="rounded-xl bg-card/70 ring-1 ring-border p-3">
              <div className="font-display font-semibold">{profile.rating}</div>
              <div className="label-mono">Note</div>
            </div>
          </div>
        </div>
      )}
    </FreelanceShell>
  );
}
