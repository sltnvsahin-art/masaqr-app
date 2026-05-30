import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app")({
  component: () => {
    // gate: nudge to login if not authed (client-only soft gate, demo)
    return (
      <AppShell>
        <Outlet />
      </AppShell>
    );
  },
});
