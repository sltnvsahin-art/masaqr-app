import { Link, useLocation } from "@tanstack/react-router";
import { ReactNode } from "react";
import {
  LayoutDashboard, ShoppingBag, BookOpen, FileText, QrCode, Users, BarChart3,
  Building2, CreditCard, LifeBuoy, Settings, ChefHat, Bell, LogOut, ExternalLink
} from "lucide-react";
import { Logo } from "./Logo";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/orders", label: "Orders", icon: ShoppingBag },
  { to: "/app/menu", label: "Menu Builder", icon: BookOpen },
  { to: "/app/pdf", label: "PDF Menu", icon: FileText },
  { to: "/app/tables", label: "QR & Tables", icon: QrCode },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/staff", label: "Staff", icon: Users },
  { to: "/app/branches", label: "Branches", icon: Building2 },
  { to: "/app/plan", label: "Plan", icon: CreditCard },
  { to: "/app/support", label: "Support", icon: LifeBuoy },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const { auth, restaurant, branches, activeBranchId, setActiveBranch, alerts, plan, logout } = useStore();
  const openAlerts = alerts.filter(a => !a.resolved).length;
  const trialDays = Math.max(0, Math.ceil((plan.trialEndsAt - Date.now()) / 86400000));

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Logo className="text-sidebar-foreground" />
          <div className="mt-4 text-xs uppercase tracking-wider text-sidebar-foreground/60">Restaurant</div>
          <div className="text-sm font-medium truncate">{restaurant.name}</div>
          <select
            className="mt-2 w-full text-xs bg-sidebar-accent border border-sidebar-border rounded-md px-2 py-1.5 text-sidebar-accent-foreground"
            value={activeBranchId}
            onChange={e => setActiveBranch(e.target.value)}
          >
            {branches.filter(b => b.active).map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {nav.map(n => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-ember text-ember-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{n.label}</span>
                {n.to === "/app/orders" && openAlerts > 0 && (
                  <span className="ml-auto text-[10px] bg-ember-foreground text-ember rounded-full px-1.5 py-0.5 font-semibold">{openAlerts}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Link to="/kitchen" className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <ChefHat className="h-3.5 w-3.5" /> Kitchen display <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
          <Link to="/waiter" className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <Bell className="h-3.5 w-3.5" /> Waiter view <ExternalLink className="h-3 w-3 ml-auto" />
          </Link>
          <div className="pt-2 mt-2 border-t border-sidebar-border">
            <div className="text-[10px] uppercase text-sidebar-foreground/50">Plan</div>
            <div className="text-xs">{plan.tier === "trial" ? `Trial · ${trialDays}d left` : plan.tier}</div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out · {auth.email}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground">
          <Logo className="text-sidebar-foreground" />
          <Button asChild size="sm" variant="secondary"><Link to="/app">Menu</Link></Button>
        </div>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
