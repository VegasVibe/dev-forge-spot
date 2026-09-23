import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Role = "entreprise" | "freelance";

export type Profile = {
  id: string;
  role: Role;
  full_name: string;
  company_name: string | null;
  email: string | null;
};

export function homeFor(role: Role) {
  return role === "entreprise" ? "/entreprise/dashboard" : "/freelance/dashboard";
}

async function fetchMe(): Promise<{ userId: string; email: string | null; profile: Profile | null } | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, company_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const meta = (user.user_metadata ?? {}) as Record<string, string>;
    const inserted = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        role: (meta['role'] as Role) ?? "entreprise",
        full_name: meta['full_name'] ?? user.email?.split("@")[0] ?? "",
        company_name: meta['company_name'] ?? null,
        email: user.email ?? null,
      })
      .select("id, role, full_name, company_name, email")
      .maybeSingle();
    profile = inserted.data;
  }

  return { userId: user.id, email: user.email ?? null, profile: (profile as Profile | null) ?? null };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 30_000 });
}

/** Redirige vers l'autre espace si le rôle du compte ne correspond pas. */
export function useRoleGuard(expected: Role) {
  const { data, isLoading } = useMe();
  const navigate = useNavigate();
  const role = data?.profile?.role;

  useEffect(() => {
    if (isLoading || !role) return;
    if (role !== expected) navigate({ to: homeFor(role), replace: true });
  }, [role, expected, isLoading, navigate]);

  return { profile: data?.profile ?? null, userId: data?.userId ?? null, loading: isLoading };
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}
