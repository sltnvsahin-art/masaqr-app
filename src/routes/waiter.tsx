import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, minutesAgo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Bell, Check, ArrowLeft, Receipt, Hand, Droplet, ChefHat } from "lucide-react";
import { toast } from "sonner";

const ICONS: Record<string, any> = { ready: ChefHat, bill: Receipt, help: Hand, water: Droplet, longwait: Bell };
const COLORS: Record<string, string> = {
  ready: "bg-sage/10 border-sage text-sage",
  bill: "bg-warning/10 border-warning text-warning",
  help: "bg-ember/10 border-ember text-ember",
  water: "bg-sky-100 border-sky-300 text-sky-900",
  longwait: "bg-destructive/10 border-destructive text-destructive",
};
const LABELS: Record<string, string> = { ready: "Food ready", bill: "Bill requested", help: "Help needed", water: "Water / napkins", longwait: "Long wait" };

export const Route = createFileRoute("/waiter")({
  head: () => ({ meta: [{ title: "Waiter — MasaQR" }] }),
  component: () => {
    const { alerts, tables, resolveAlert, setOrderStatus, orders } = useStore();
    const open = alerts.filter(a => !a.resolved).sort((a, b) => a.createdAt - b.createdAt);
    const handled = alerts.filter(a => a.resolved).slice(0, 6);

    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-foreground text-background flex items-center gap-3 p-4">
          <Link to="/app" className="text-xs opacity-70"><ArrowLeft className="h-4 w-4" /></Link>
          <Bell className="h-5 w-5 text-ember" />
          <div className="font-display text-xl">Floor Alerts</div>
          <span className="ml-auto text-xs bg-ember text-ember-foreground rounded-full px-2 py-0.5">{open.length}</span>
        </header>

        <div className="max-w-2xl mx-auto p-4 space-y-3">
          {open.map(a => {
            const t = tables.find(x => x.id === a.tableId);
            const Icon = ICONS[a.kind] ?? Bell;
            return (
              <div key={a.id} className={`rounded-2xl border-2 p-5 flex items-center gap-4 ${COLORS[a.kind]}`}>
                <Icon className="h-8 w-8 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-wider opacity-80">{LABELS[a.kind]}</div>
                  <div className="font-display text-2xl">{t?.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{minutesAgo(a.createdAt)}m ago</div>
                </div>
                <Button size="lg" className="bg-foreground text-background" onClick={() => {
                  resolveAlert(a.id);
                  if (a.kind === "ready" && a.orderId) setOrderStatus(a.orderId, "served");
                  toast.success("Acknowledged");
                }}><Check className="h-5 w-5 mr-1" /> Done</Button>
              </div>
            );
          })}
          {open.length === 0 && <div className="text-center py-20 text-muted-foreground"><Check className="h-12 w-12 mx-auto text-sage" /><p className="mt-3">All caught up.</p></div>}

          {handled.length > 0 && (
            <div className="pt-6 mt-6 border-t">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recently handled</div>
              {handled.map(a => (
                <div key={a.id} className="py-2 text-sm text-muted-foreground flex justify-between border-b last:border-0">
                  <span>{LABELS[a.kind]} · {tables.find(t => t.id === a.tableId)?.label}</span>
                  <span className="text-xs">{minutesAgo(a.createdAt)}m ago</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
});
