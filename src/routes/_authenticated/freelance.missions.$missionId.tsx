import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FreelanceShell } from "@/components/console-shell";
import { GhostButton, Label, PrimaryButton, SkillTag, StatusBadge } from "@/components/ui-kit";
import { useMe } from "@/lib/auth";
import {
  ensureFreelanceProfile,
  formatEuro,
  pushNotification,
  sendMessage,
  useApplications,
  useMission,
  useMyFreelanceProfile,
} from "@/lib/db";

export const Route = createFileRoute("/_authenticated/freelance/missions/$missionId")({
  head: () => ({
    meta: [
      { title: "Détail de la mission — Nodale" },
      { name: "description", content: "Consultez le détail d'une mission et postulez directement auprès de l'entreprise." },
      { property: "og:title", content: "Détail de la mission — Nodale" },
      { property: "og:description", content: "Description, livrables, compétences requises et candidature en un seul endroit." },
    ],
  }),
  component: FreelanceMissionDetail,
});

function FreelanceMissionDetail() {
  const { missionId } = Route.useParams();
  const { data: mission, isLoading } = useMission(missionId);
  const { data: me } = useMe();
  const userId = me?.userId ?? null;
  const { data: profile } = useMyFreelanceProfile(userId);
  const { data: applications = [] } = useApplications({ missionId });
  const qc = useQueryClient();

  const [pitch, setPitch] = useState("");
  const [rate, setRate] = useState(profile?.rate ?? 500);
  const [availability, setAvailability] = useState("Immédiate");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (isLoading) {
    return (
      <FreelanceShell kicker="Marketplace" title="Chargement…">
        <p className="text-sm text-ink-soft">Chargement de la mission…</p>
      </FreelanceShell>
    );
  }

  if (!mission) throw notFound();

  const myApplication = applications.find((a) => a.freelance_user_id === userId);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || myApplication) return;
    setSending(true);
    setFeedback(null);
    try {
      let myProfile = profile;
      if (!myProfile) {
        myProfile = await ensureFreelanceProfile(userId, me?.profile?.full_name ?? "");
      }
      const { error } = await supabase.from("applications").insert({
        mission_id: mission.id,
        mission_title: mission.title,
        freelance_id: myProfile.id,
        freelance_user_id: userId,
        company_id: mission.owner_id,
        status: "recue",
        pitch,
        rate,
        availability,
      });
      if (error) throw error;
      if (mission.owner_id) {
        await pushNotification({
          userId: mission.owner_id,
          title: "Nouvelle candidature",
          detail: `${myProfile.name} a postulé à « ${mission.title} »`,
          kind: "candidature",
        });
      }
      await qc.invalidateQueries({ queryKey: ["applications"] });
      setFeedback("Votre candidature a été envoyée.");
      setPitch("");
    } catch (err) {
      setFeedback("Une erreur est survenue, réessayez.");
    } finally {
      setSending(false);
    }
  }

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !messageBody.trim()) return;
    let myProfile = profile;
    if (!myProfile) {
      myProfile = await ensureFreelanceProfile(userId, me?.profile?.full_name ?? "");
      qc.invalidateQueries({ queryKey: ["my-freelance", userId] });
    }
    await sendMessage({
      companyId: mission.owner_id,
      freelanceId: myProfile.id,
      freelanceUserId: userId,
      sender: "freelance",
      subject: mission.title,
      body: messageBody,
    });
    setMessageBody("");
    qc.invalidateQueries({ queryKey: ["messages"] });
    setFeedback("Message envoyé à l'entreprise.");
  }

  return (
    <FreelanceShell
      kicker={`${mission.category} · ${mission.company}`}
      title={mission.title}
      actions={<GhostButton to="/freelance/missions">Retour aux missions</GhostButton>}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <div className="flex items-center justify-between">
              <StatusBadge status={mission.status} />
              <span className="text-sm font-mono">{formatEuro(mission.budget)}</span>
            </div>
            <p className="mt-4 text-ink-soft leading-relaxed">{mission.description || mission.summary}</p>
            {mission.deliverables?.length > 0 && (
              <div className="mt-4">
                <Label>Livrables</Label>
                <ul className="mt-2 list-disc list-inside text-sm text-ink-soft space-y-1">
                  {mission.deliverables.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {mission.skills.map((s) => <SkillTag key={s}>{s}</SkillTag>)}
            </div>
          </div>

          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <h2 className="font-display font-semibold text-base tracking-tight mb-4">Postuler</h2>
            {myApplication ? (
              <p className="text-sm text-ink-soft">
                Vous avez déjà postulé à cette mission. Statut : <span className="font-medium">{myApplication.status}</span>
              </p>
            ) : (
              <form onSubmit={handleApply} className="space-y-3">
                <div>
                  <label className="label-mono">Message de motivation</label>
                  <textarea
                    required
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Expliquez pourquoi vous êtes le bon profil pour cette mission…"
                    className="mt-1.5 w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-mono">TJM proposé (€)</label>
                    <input
                      type="number"
                      min={0}
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="label-mono">Disponibilité</label>
                    <input
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-accent/40 transition-colors hover:bg-accent/90 disabled:opacity-60 w-fit"
                >
                  {sending ? "Envoi…" : "Envoyer ma candidature"}
                </button>
              </form>
            )}
            {feedback && <p className="mt-3 text-xs text-accent">{feedback}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl ring-1 ring-border p-5">
            <Label>Entreprise</Label>
            <div className="mt-2 font-display font-semibold">{mission.company}</div>
            <div className="text-xs text-ink-soft">{mission.team}</div>
            <form onSubmit={handleContact} className="mt-4 space-y-2">
              <textarea
                rows={3}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder="Poser une question à l'entreprise…"
                className="w-full rounded-xl bg-card ring-1 ring-border px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <button
                type="submit"
                className="rounded-xl glass text-foreground text-sm font-medium py-2.5 px-4 ring-1 ring-border hover:bg-card transition-colors w-full"
              >
                Contacter l'entreprise
              </button>
            </form>
          </div>
        </div>
      </div>
    </FreelanceShell>
  );
}
