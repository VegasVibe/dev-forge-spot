import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MissionStatus = "todo" | "active" | "done" | "paid" | "archived";

export const statusLabels: Record<MissionStatus, string> = {
  todo: "À faire",
  active: "En cours",
  done: "Terminé",
  paid: "Payé",
  archived: "Archivé",
};

export type FreelanceRow = {
  id: string;
  user_id: string | null;
  name: string;
  initials: string;
  title: string;
  city: string;
  available: boolean;
  rate: number;
  rating: number;
  reviews: number;
  missions_count: number;
  experience_years: number;
  onboarded: boolean;
  visible: boolean;
  skills: string[];
  bio: string;
  portfolio: { title: string; client: string; year: string; result: string }[];
  testimonials: { author: string; company: string; text: string; rating: number }[];
};

export type MissionRow = {
  id: string;
  owner_id: string | null;
  title: string;
  company: string;
  team: string;
  category: string;
  summary: string;
  description: string;
  deliverables: string[];
  skills: string[];
  budget: number;
  duration: string;
  status: MissionStatus;
  progress: number;
  freelance_id: string | null;
  applicants: number;
  posted_at: string;
  paused: boolean;
  recommended: string[];
  created_at: string;
};

export type ApplicationStatus = "recue" | "entretien" | "acceptee" | "refusee";

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  recue: "Reçue",
  entretien: "Entretien",
  acceptee: "Acceptée",
  refusee: "Écartée",
};

export type ApplicationRow = {
  id: string;
  mission_id: string;
  mission_title: string;
  freelance_id: string;
  freelance_user_id: string | null;
  company_id: string | null;
  status: ApplicationStatus;
  pitch: string;
  rate: number;
  availability: string;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  mission_id: string | null;
  freelance_id: string | null;
  label: string;
  counterpart: string;
  amount: number;
  due_label: string;
  state: "pending" | "paid" | "scheduled";
};

export type MessageRow = {
  id: string;
  company_id: string | null;
  freelance_id: string;
  freelance_user_id: string | null;
  sender: "entreprise" | "freelance";
  subject: string;
  body: string;
  created_at: string;
};

export type InterviewRow = {
  id: string;
  company_id: string;
  freelance_id: string;
  day: string;
  time: string;
  duration: string;
  subject: string;
  channel: string;
};

export type NotificationRow = {
  id: string;
  title: string;
  detail: string;
  kind: string;
  read: boolean;
  created_at: string;
  entity_type: string | null;
  entity_id: string | null;
  link: string | null;
};

export type NotificationCategory = "mission" | "message" | "candidature";

export type DigestFrequency = "instant" | "daily" | "weekly" | "never";

export type NotificationPreferences = {
  user_id: string;
  mission_in_app: boolean;
  mission_email: boolean;
  message_in_app: boolean;
  message_email: boolean;
  candidature_in_app: boolean;
  candidature_email: boolean;
  digest_frequency: DigestFrequency;
};

export const defaultNotificationPreferences: Omit<NotificationPreferences, "user_id"> = {
  mission_in_app: true,
  mission_email: true,
  message_in_app: true,
  message_email: true,
  candidature_in_app: true,
  candidature_email: true,
  digest_frequency: "instant",
};

export const digestLabels: Record<DigestFrequency, string> = {
  instant: "Immédiat",
  daily: "Résumé quotidien",
  weekly: "Résumé hebdomadaire",
  never: "Jamais",
};

export type AlertCriteria = {
  /** Alertes entreprise (profils) */
  maxRate?: number;
  availableOnly?: boolean;
  minMissions?: number;
  techs?: string[];
  /** Alertes développeur (missions) */
  scope?: "mission" | "freelance";
  minBudget?: number;
  categories?: string[];
  onlyIfAvailable?: boolean;
};

export type AlertRow = {
  id: string;
  label: string;
  criteria: AlertCriteria;
  known_ids: string[];
};

/** Une mission correspond-elle aux critères d'alerte d'un développeur ? */
export function missionMatchesAlert(
  mission: MissionRow,
  criteria: AlertCriteria,
  profile?: { skills?: string[]; rate?: number; available?: boolean } | null,
) {
  if (mission.paused || mission.status === "archived" || mission.status === "paid") return false;
  if (criteria.onlyIfAvailable && profile && profile.available === false) return false;
  if (criteria.minBudget && mission.budget < criteria.minBudget) return false;
  if (criteria.categories?.length && !criteria.categories.includes(mission.category)) return false;

  const techs = (criteria.techs ?? []).map((t) => t.toLowerCase());
  if (techs.length) {
    const haystack = [...(mission.skills ?? []), mission.title, mission.summary].join(" ").toLowerCase();
    if (!techs.some((t) => haystack.includes(t))) return false;
  }
  return true;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "profil"
  );
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "ND";
}

const categoryMap: Record<string, string> = {
  "Micro-logiciel sur mesure": "Backend",
  "Site web": "Frontend",
  "Application mobile": "Mobile",
  Automatisation: "Automatisation",
  "Correction de bugs": "Maintenance",
  Maintenance: "Maintenance",
  "Intégration API": "Backend",
  "Amélioration d'outils internes": "Backend",
};

export function toMissionCategory(label: string) {
  return categoryMap[label] ?? "Backend";
}

export function parseBudget(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/* ============ QUERIES ============ */

export function useFreelances() {
  return useQuery({
    queryKey: ["freelances"],
    queryFn: async () => {
      const { data, error } = await supabase.from("freelance_profiles").select("*").order("rating", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as FreelanceRow[];
    },
  });
}

export function useFreelance(id: string) {
  return useQuery({
    queryKey: ["freelance", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("freelance_profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as FreelanceRow | null) ?? null;
    },
  });
}

export function useMyFreelanceProfile(userId?: string | null) {
  return useQuery({
    queryKey: ["my-freelance", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("freelance_profiles").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return (data as unknown as FreelanceRow | null) ?? null;
    },
  });
}

/** Crée la fiche publique d'un freelance à sa première connexion. */
export async function ensureFreelanceProfile(userId: string, fullName: string) {
  const { data: existing } = await supabase.from("freelance_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return existing as unknown as FreelanceRow;

  const base = slugify(fullName || "freelance");
  const id = `${base}-${userId.slice(0, 6)}`;
  const { data, error } = await supabase
    .from("freelance_profiles")
    .insert({
      id,
      user_id: userId,
      name: fullName || "Nouveau profil",
      initials: initialsOf(fullName || "Nouveau profil"),
      title: "Développeur freelance",
      city: "",
      available: true,
      rate: 500,
      rating: 5,
      reviews: 0,
      missions_count: 0,
      experience_years: 0,
      onboarded: false,
      skills: [],
      bio: "",
    })
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data as unknown as FreelanceRow;
}

export function useMissions() {
  return useQuery({
    queryKey: ["missions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as MissionRow[];
    },
  });
}

export function useMission(id: string) {
  return useQuery({
    queryKey: ["mission", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("missions").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return (data as unknown as MissionRow | null) ?? null;
    },
  });
}

export function useApplications(filter?: {
  missionId?: string | null;
  companyId?: string | null;
  freelanceUserId?: string | null;
}) {

  return useQuery({
    queryKey: ["applications", filter],
    queryFn: async () => {
      let q = supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (filter?.missionId) q = q.eq("mission_id", filter.missionId);
      if (filter?.companyId) q = q.eq("company_id", filter.companyId);
      if (filter?.freelanceUserId) q = q.eq("freelance_user_id", filter.freelanceUserId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as ApplicationRow[];
    },
  });
}

export function usePayments(filter?: { companyId?: string; freelanceId?: string }) {
  return useQuery({
    queryKey: ["payments", filter],
    queryFn: async () => {
      let q = supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (filter?.freelanceId) q = q.eq("freelance_id", filter.freelanceId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as PaymentRow[];
    },
  });
}

export function useMessages(userId?: string | null) {
  return useQuery({
    queryKey: ["messages", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MessageRow[];
    },
  });
}

export async function sendMessage(input: {
  companyId: string | null;
  freelanceId: string;
  freelanceUserId: string | null;
  sender: "entreprise" | "freelance";
  subject: string;
  body: string;
}) {
  const { error } = await supabase.from("messages").insert({
    company_id: input.companyId,
    freelance_id: input.freelanceId,
    freelance_user_id: input.freelanceUserId,
    sender: input.sender,
    subject: input.subject,
    body: input.body,
  });
  if (error) throw error;
}

export function useInterviews(companyId?: string | null) {
  return useQuery({
    queryKey: ["interviews", companyId],
    enabled: Boolean(companyId),
    queryFn: async () => {
      const { data, error } = await supabase.from("interviews").select("*").order("day", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as InterviewRow[];
    },
  });
}

export function useShortlist(userId?: string | null) {
  return useQuery({
    queryKey: ["shortlist", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("shortlist").select("freelance_id").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.freelance_id as string);
    },
  });
}

export function useToggleShortlist(userId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ freelanceId, on }: { freelanceId: string; on: boolean }) => {
      if (!userId) return;
      if (on) {
        await supabase.from("shortlist").insert({ user_id: userId, freelance_id: freelanceId });
      } else {
        await supabase.from("shortlist").delete().eq("user_id", userId).eq("freelance_id", freelanceId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shortlist"] }),
  });
}

export function useNotifications(userId?: string | null) {
  return useQuery({
    queryKey: ["notifications", userId],
    enabled: Boolean(userId),
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, detail, kind, read, created_at, entity_type, entity_id, link")
        .order("created_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as unknown as NotificationRow[];
    },
  });
}

export async function pushNotification(input: {
  userId?: string | null;
  freelanceId?: string | null;
  title: string;
  detail: string;
  kind: string;
  entityType?: "mission" | "message" | "candidature" | null;
  entityId?: string | null;
  link?: string | null;
}) {
  await supabase.from("notifications").insert({
    user_id: input.userId ?? null,
    freelance_id: input.freelanceId ?? null,
    title: input.title,
    detail: input.detail,
    kind: input.kind,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    link: input.link ?? null,
  });
}

/* ============ PRÉFÉRENCES DE NOTIFICATION ============ */

export function useNotificationPreferences(userId?: string | null) {
  return useQuery({
    queryKey: ["notification-preferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return {
        user_id: userId!,
        ...defaultNotificationPreferences,
        ...((data ?? {}) as Partial<NotificationPreferences>),
      } as NotificationPreferences;
    },
  });
}

export function useSaveNotificationPreferences(userId?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Omit<NotificationPreferences, "user_id">>) => {
      if (!userId) return;
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-preferences", userId] }),
  });
}

export async function markAllRead(ids: string[]) {
  if (!ids.length) return;
  await supabase.from("notifications").update({ read: true }).in("id", ids);
}

export function useAlerts(userId?: string | null) {
  return useQuery({
    queryKey: ["alerts", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_alerts").select("*").eq("user_id", userId!);
      if (error) throw error;
      return (data ?? []) as unknown as AlertRow[];
    },
  });
}

export const monthlySpend = [
  { month: "Jan", value: 38 },
  { month: "Fév", value: 52 },
  { month: "Mar", value: 64 },
  { month: "Avr", value: 78 },
  { month: "Mai", value: 90 },
  { month: "Juin", value: 100 },
];
