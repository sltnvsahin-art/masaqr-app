import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, tr, minutesAgo, fmtPrice } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { OrderStatus } from "@/lib/store";
import { Printer, Search, Filter, Download, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/orders")({
  head: () => ({ meta: [{ title: "Orders — MasaQR" }] }),
  component: Orders,
});

const STATUSES: OrderStatus[] = ["new", "accepted", "preparing", "ready", "served", "closed"];

function Orders() {
  const { orders, items, tables, restaurant, setOrderStatus } = useStore();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(orders[0]?.id ?? null);

  const filtered = orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (q && !o.shortCode.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const order = orders.find(o => o.id === selected);

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="Orders"
        subtitle="Everything happening across your floor"
        actions={<Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>}
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search order code…" className="pl-9" />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(["all", ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`text-xs px-2.5 py-1 rounded-md border ${filter === s ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-4">
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_100px_120px_100px] gap-3 px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
            <div>Code</div><div>Items</div><div>Table</div><div>Status</div><div>Age</div>
          </div>
          <div>
            {filtered.map(o => {
              const table = tables.find(t => t.id === o.tableId);
              return (
                <button key={o.id} onClick={() => setSelected(o.id)}
                  className={`w-full grid grid-cols-[80px_1fr_100px_120px_100px] gap-3 px-4 py-3 text-sm text-left border-b hover:bg-muted/40 ${selected === o.id ? "bg-ember/5" : ""}`}>
                  <div className="font-mono font-bold">{o.shortCode}</div>
                  <div className="truncate">{o.items.map(i => `${i.qty}× ${tr(items.find(x => x.id === i.menuItemId)?.name ?? { az: "?", en: "?", ru: "?" }, "en")}`).join(", ")}</div>
                  <div>{table?.label}</div>
                  <div><span className="text-xs uppercase px-2 py-0.5 rounded bg-background border">{o.status}</span></div>
                  <div className="text-muted-foreground">{minutesAgo(o.createdAt)}m</div>
                </button>
              );
            })}
            {filtered.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No orders.</div>}
          </div>
        </Card>

        {order && (
          <Card className="p-5 h-fit sticky top-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Order</div>
                <div className="font-display text-2xl">{order.shortCode}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => toast.success("Ticket sent to printer")}><Printer className="h-4 w-4 mr-1.5" />Print</Button>
            </div>
            <div className="mt-3 text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" /> {minutesAgo(order.createdAt)}m ago · {tables.find(t => t.id === order.tableId)?.label}
            </div>

            <div className="mt-5 space-y-2">
              {order.items.map(it => {
                const mi = items.find(x => x.id === it.menuItemId);
                if (!mi) return null;
                return (
                  <div key={it.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span><b>{it.qty}×</b> {tr(mi.name, "en")}</span>
                      <span className="text-muted-foreground">{fmtPrice(mi.price * it.qty, restaurant.currency)}</span>
                    </div>
                    {mi.allergens.length > 0 && (
                      <div className="text-[10px] mt-1 text-warning uppercase tracking-wider">⚠ {mi.allergens.join(" · ")}</div>
                    )}
                    {it.note && <div className="text-xs italic text-muted-foreground mt-1">"{it.note}"</div>}
                  </div>
                );
              })}
            </div>

            <div className="mt-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Timeline</div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span>Created</span><span className="text-muted-foreground">{minutesAgo(order.createdAt)}m ago</span></div>
                {order.acceptedAt && <div className="flex justify-between"><span>Accepted</span><span className="text-muted-foreground">{minutesAgo(order.acceptedAt)}m ago</span></div>}
                {order.readyAt && <div className="flex justify-between text-sage"><span>Ready</span><span>{minutesAgo(order.readyAt)}m ago</span></div>}
                {order.servedAt && <div className="flex justify-between"><span>Served</span><span className="text-muted-foreground">{minutesAgo(order.servedAt)}m ago</span></div>}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {order.status === "new" && <Button onClick={() => setOrderStatus(order.id, "accepted")} className="col-span-2 bg-ember text-ember-foreground hover:bg-ember/90">Accept order</Button>}
              {order.status === "accepted" && <Button onClick={() => setOrderStatus(order.id, "preparing")} className="col-span-2">Start preparing</Button>}
              {order.status === "preparing" && <Button onClick={() => { setOrderStatus(order.id, "ready"); toast.success("Waiter notified"); }} className="col-span-2 bg-sage text-white hover:bg-sage/90">Mark ready</Button>}
              {order.status === "ready" && <Button onClick={() => setOrderStatus(order.id, "served")} className="col-span-2">Mark served</Button>}
              {order.status === "served" && <Button onClick={() => setOrderStatus(order.id, "closed")} variant="outline" className="col-span-2">Close order</Button>}
              {order.billRequested && <div className="col-span-2 text-xs rounded-md bg-warning/10 text-warning border border-warning/30 px-3 py-2">Bill requested · handle outside platform</div>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
