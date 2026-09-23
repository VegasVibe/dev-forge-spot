import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { redirectFor } from "@/lib/access";
import type { Role } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    const role = (profile?.role as Role | undefined) ?? null;
    const target = redirectFor(role, location.pathname);
    if (target) throw redirect({ to: target as never, replace: true });

    return { user: data.user, role };
  },
  component: () => <Outlet />,
});
