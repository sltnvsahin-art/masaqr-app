import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, minutesAgo, tr } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Clock, AlertTriangle, QrCode, BookOpen, FileText, ChefHat,
  Users, BellRing, ArrowUpRight, TrendingUp, CheckCircle2
} from "lucide-react";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — MasaQR" }] }),
  component: Dashboard,
});

function Stat({ icon: Icon, label, value, hint, tone = "default" }: any) {
  const tones: any = {
    default: "bg-card",
    accent: "bg-ember/5 border-ember/30",
    warn: "bg-warning/10 border-warning/40",
  };
  return (
    <Card className={`p-5 border ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
          <div className="font-display text-3xl mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <Icon className="h-5 w-5 text-ember" />
      </div>
    </Card>
  );
}

function Dashboard() {
  const { orders, tables, alerts, items, plan, scans, staff, eta, restaurant } = useStore();
  const open = orders.filter(o => o.status !== "closed" && o.status !== "served");
  const ready = orders.filter(o => o.status === "ready");
  const kitchen = orders.filter(o => ["accepted", "preparing"].includes(o.status));
  const late = open.filter(o => minutesAgo(o.createdAt) > eta.lateThreshold);
  const activeTables = tables.filter(t => t.status !== "available" && t.status !== "cleaning").length;
  const soldOut = items.filter(i => i.soldOut).length;
  const openAlerts = alerts.filter(a => !a.resolved);
  const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 86400000));
  const avgPrep = Math.round(
    orders.filter(o => o.readyAt && o.acceptedAt)
      .map(o => (o.readyAt! - o.acceptedAt!) / 60000)
      .reduce((a, b) => a + b, 0) / Math.max(1, orders.filter(o => o.readyAt).length) || eta.defaultPrep
  );

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title={`Good evening, ${restaurant.name}`}
        subtitle={plan.tier === "trial" ? `You're on the free trial · ${trialDays} days left` : `On the ${plan.tier} plan`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/kitchen">Open kitchen</Link></Button>
            <Button asChild className="bg-ember hover:bg-ember/90 text-ember-foreground"><Link to="/m/$slug/$table" params={{ slug: restaurant.slug, table: "t3" }}>View guest menu</Link></Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon={Activity} label="Open orders" value={open.length} hint={`${kitchen.length} in kitchen`} tone="accent" />
        <Stat icon={CheckCircle2} label="Ready to serve" value={ready.length} hint={`${openAlerts.length} alerts pending`} />
        <Stat icon={Clock} label="Avg prep time" value={`${avgPrep}m`} hint="Across today's orders" />
        <Stat icon={AlertTriangle} label="Late orders" value={late.length} hint={`Threshold: ${eta.lateThreshold}m`} tone={late.length ? "warn" : "default"} />
        <Stat icon={QrCode} label="QR scans (mo)" value={scans.toLocaleString()} hint="+18% vs last month" />
        <Stat icon={Users} label="Active tables" value={`${activeTables}/${tables.length}`} hint="Across this branch" />
        <Stat icon={BookOpen} label="Menu items" value={items.length} hint={`${soldOut} sold out`} />
        <Stat icon={ChefHat} label="Staff on shift" value={staff.filter(s => Date.now() - s.lastActive < 30 * 60000).length} hint={`${staff.length} total`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Live order feed</h2>
            <Link to="/app/orders" className="text-xs text-ember hover:underline flex items-center gap-1">All orders <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-2">
            {open.slice(0, 6).map(o => {
              const table = tables.find(t => t.id === o.tableId);
              const tone = o.status === "ready" ? "bg-sage/10 border-l-sage" : o.status === "preparing" ? "bg-ember/5 border-l-ember" : "bg-muted/40 border-l-foreground/40";
              return (
                <div key={o.id} className={`flex items-center gap-4 p-3 rounded-r-lg border-l-4 ${tone}`}>
                  <div className="font-mono text-sm font-bold w-12">{o.shortCode}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{o.items.map(i => `${i.qty}× ${tr(items.find(x => x.id === i.menuItemId)?.name ?? { az: "?", en: "?", ru: "?" }, "en")}`).join(", ")}</div>
                    <div className="text-xs text-muted-foreground">{table?.label} · {minutesAgo(o.createdAt)}m ago</div>
                  </div>
                  <span className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-background border">{o.status}</span>
                </div>
              );
            })}
            {open.length === 0 && <div className="text-sm text-muted-foreground text-center py-8">No open orders. ☕</div>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-xl mb-4">Quick access</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { to: "/app/menu", icon: BookOpen, label: "Edit menu" },
              { to: "/app/pdf", icon: FileText, label: "PDF menu" },
              { to: "/app/tables", icon: QrCode, label: "QR & tables" },
              { to: "/kitchen", icon: ChefHat, label: "Kitchen" },
              { to: "/waiter", icon: BellRing, label: "Waiter" },
              { to: "/app/staff", icon: Users, label: "Staff" },
            ].map(({ to, icon: Icon, label }) => (
              <Link key={to} to={to} className="rounded-lg border bg-card p-3 hover:border-ember/40 hover:bg-ember/5 transition group">
                <Icon className="h-5 w-5 text-ember mb-2" />
                <div className="text-sm font-medium">{label}</div>
              </Link>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trial</div>
            <div className="text-2xl font-display">{trialDays} days left</div>
            <Button asChild size="sm" variant="outline" className="mt-3 w-full"><Link to="/app/plan">Manage plan</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
