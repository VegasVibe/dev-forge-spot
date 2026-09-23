import { createFileRoute } from "@tanstack/react-router";
import { FreelanceShell } from "@/components/console-shell";
import { NotificationCenter } from "@/components/notification-center";

export const Route = createFileRoute("/_authenticated/freelance/notifications")({
  head: () => ({
    meta: [
      { title: "Centre de notifications — Nodale" },
      { name: "description", content: "Nouvelles missions compatibles, messages des entreprises et suivi de vos candidatures." },
      { property: "og:title", content: "Centre de notifications — Nodale" },
      { property: "og:description", content: "Vos opportunités et vos échanges, regroupés." },
    ],
  }),
  component: () => (
    <FreelanceShell kicker="Activité" title="Centre de notifications">
      <NotificationCenter role="freelance" />
    </FreelanceShell>
  ),
});
