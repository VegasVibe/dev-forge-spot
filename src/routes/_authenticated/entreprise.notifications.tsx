import { createFileRoute } from "@tanstack/react-router";
import { CompanyShell } from "@/components/console-shell";
import { NotificationCenter } from "@/components/notification-center";

export const Route = createFileRoute("/_authenticated/entreprise/notifications")({
  head: () => ({
    meta: [
      { title: "Centre de notifications — Nodale" },
      { name: "description", content: "Missions, messages reçus et évolutions de vos candidatures regroupés en un seul endroit." },
      { property: "og:title", content: "Centre de notifications — Nodale" },
      { property: "og:description", content: "Tout ce qui bouge sur vos missions, en un écran." },
    ],
  }),
  component: () => (
    <CompanyShell kicker="Activité" title="Centre de notifications">
      <NotificationCenter role="entreprise" />
    </CompanyShell>
  ),
});
