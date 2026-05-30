import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, tr, minutesAgo, type OrderStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ChefHat, Maximize2, Volume2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/kitchen")({
  head: () => ({ meta: [{ title: "Kitchen — MasaQR" }] }),
  component: () => {
    const { orders, items, tables, setOrderStatus, toggleOrderItemDone, toggleSoldOut, eta } = useStore();
    const [sound, setSound] = useState(true);
    const queue = orders.filter(o => !["served", "closed"].includes(o.status))
      .sort((a, b) => a.createdAt - b.createdAt);

    return (
      <div className="min-h-screen bg-sidebar text-sidebar-foreground">
        <header className="flex items-center gap-4 p-4 border-b border-sidebar-border">
          <Link to="/app" className="flex items-center gap-2 text-xs opacity-70 hover:opacity-100"><ArrowLeft className="h-3 w-3" /> Back</Link>
          <ChefHat className="h-5 w-5 text-ember" />
          <div className="font-display text-xl">Kitchen Display</div>
          <span className="text-xs text-sidebar-foreground/60">{queue.length} active</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setSound(!sound)} className={`p-2 rounded ${sound ? "bg-ember/20 text-ember" : "opacity-50"}`}><Volume2 className="h-4 w-4" /></button>
            <button onClick={() => document.documentElement.requestFullscreen?.()} className="p-2 rounded hover:bg-sidebar-accent"><Maximize2 className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {queue.map(o => {
            const table = tables.find(t => t.id === o.tableId);
            const age = minutesAgo(o.createdAt);
            const late = age > eta.lateThreshold;
            const tone = o.status === "ready" ? "border-sage bg-sage/20" : o.status === "new" ? "border-ember bg-ember/20" : "border-sidebar-border bg-sidebar-accent";
            return (
              <div key={o.id} className={`rounded-xl border-2 p-4 ${tone}`}>
                <div className="flex items-baseline justify-between">
                  <div className="font-display text-2xl">{o.shortCode}</div>
                  <div className="text-xs">{table?.label} · <span className={late ? "text-warning font-bold" : ""}>{age}m</span></div>
                </div>
                <div className="text-xs uppercase mt-1 opacity-70">{o.status}</div>
                <div className="mt-3 space-y-2">
                  {o.items.map(it => {
                    const mi = items.find(x => x.id === it.menuItemId);
                    if (!mi) return null;
                    return (
                      <button key={it.id} onClick={() => toggleOrderItemDone(o.id, it.id)} className={`w-full text-left p-2 rounded ${it.done ? "line-through opacity-50 bg-sidebar-accent" : "bg-sidebar"}`}>
                        <div className="flex justify-between text-sm"><span><b>{it.qty}×</b> {tr(mi.name, o.language)}</span><span className="text-xs opacity-60">{mi.station}</span></div>
                        {mi.allergens.length > 0 && <div className="text-[10px] mt-0.5 text-warning uppercase">⚠ {mi.allergens.join(" · ")}</div>}
                        {it.modifiers.map(m => <div key={m.groupId} className="text-[11px] opacity-70">+ {m.optionIds.join(", ")}</div>)}
                        {it.note && <div className="text-[11px] italic opacity-70">"{it.note}"</div>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-1.5">
                  {o.status === "new" && <Button size="sm" className="col-span-2 bg-ember text-ember-foreground" onClick={() => setOrderStatus(o.id, "accepted")}>Accept</Button>}
                  {o.status === "accepted" && <Button size="sm" className="col-span-2" onClick={() => setOrderStatus(o.id, "preparing")}>Start cooking</Button>}
                  {o.status === "preparing" && <Button size="sm" className="col-span-2 bg-sage text-white" onClick={() => { setOrderStatus(o.id, "ready"); toast.success("Waiter alerted"); }}>Ready ✓</Button>}
                  {o.status === "ready" && <Button size="sm" className="col-span-2" variant="outline" onClick={() => setOrderStatus(o.id, "served")}>Mark served</Button>}
                </div>
              </div>
            );
          })}
          {queue.length === 0 && <div className="col-span-full text-center py-20 opacity-60">No orders in queue.</div>}
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="text-xs uppercase opacity-60 mb-2">Quick sold-out toggles</div>
          <div className="flex flex-wrap gap-1.5">
            {items.map(i => (
              <button key={i.id} onClick={() => { toggleSoldOut(i.id); toast.success(`${tr(i.name, "en")} ${i.soldOut ? "back in stock" : "sold out"}`); }}
                className={`text-xs px-2 py-1 rounded border ${i.soldOut ? "bg-destructive/30 border-destructive" : "border-sidebar-border"}`}>
                {tr(i.name, "en")} {i.soldOut && "✕"}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
