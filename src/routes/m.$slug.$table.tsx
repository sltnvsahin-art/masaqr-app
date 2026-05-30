import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useStore, tr, fmtPrice, type Lang, type MenuItem, type OrderItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useMemo, useEffect } from "react";
import { ShoppingBag, Search, Bell, Receipt, ArrowLeft, Plus, Minus, Check, Clock, Hand, Droplet, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/m/$slug/$table")({
  head: () => ({ meta: [{ title: "Menu — MasaQR" }] }),
  component: CustomerMenu,
});

type CartLine = { id: string; item: MenuItem; qty: number; note?: string; mods: Record<string, string[]> };

function CustomerMenu() {
  const { slug, table } = useParams({ from: "/m/$slug/$table" });
  const { restaurant, categories, items, modifiers, customerLang, setCustomerLang, trackScan, placeOrder, callWaiter, requestBill, orders, tables } = useStore();
  const lang = customerLang;
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => { trackScan(); /* eslint-disable-next-line */ }, []);

  const tableObj = tables.find(t => t.id === table);
  const order = orderId ? orders.find(o => o.id === orderId) : null;

  const visible = useMemo(() =>
    items.filter(i => i.showOnQr && !i.hidden && i.categoryId === activeCat && (!q || tr(i.name, lang).toLowerCase().includes(q.toLowerCase()))),
    [items, activeCat, q, lang]
  );

  const cartTotal = cart.reduce((s, c) => s + c.qty * (c.item.price + Object.values(c.mods).flat().reduce((sum, oid) => sum + (modifiers.flatMap(g => g.options).find(o => o.id === oid)?.priceDelta ?? 0), 0)), 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const addToCart = (item: MenuItem, mods: Record<string, string[]>, qty: number, note?: string) => {
    setCart(c => [...c, { id: Math.random().toString(36).slice(2, 8), item, qty, note, mods }]);
    toast.success(`${tr(item.name, lang)} added`);
    setActiveItem(null);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* HEADER */}
      <header className="relative h-44 overflow-hidden">
        <img src={restaurant.cover} className="absolute inset-0 w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/95 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end text-background">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70">{tableObj?.label} · Welcome</div>
              <h1 className="font-display text-3xl">{restaurant.name}</h1>
            </div>
            <div className="flex gap-1">
              {(["az", "en", "ru"] as Lang[]).map(l => (
                <button key={l} onClick={() => setCustomerLang(l)}
                  className={`text-[10px] uppercase px-2 py-1 rounded-full ${lang === l ? "bg-ember text-ember-foreground" : "bg-background/20 text-background"}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH + CATEGORIES */}
      <div className="sticky top-0 z-30 glass border-b">
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search the menu…" className="w-full pl-9 pr-3 py-2 rounded-full border bg-card text-sm" />
          </div>
        </div>
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto">
          {categories.sort((a, b) => a.order - b.order).map(c => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`text-xs whitespace-nowrap px-3 py-1.5 rounded-full border ${activeCat === c.id ? "bg-foreground text-background border-foreground" : "bg-card"}`}>
              {tr(c.name, lang)}
            </button>
          ))}
        </div>
      </div>

      {/* ITEMS */}
      <div className="p-3 space-y-3">
        {visible.map(item => (
          <button key={item.id} onClick={() => !item.soldOut && setActiveItem(item)} disabled={item.soldOut}
            className="w-full bg-card border rounded-2xl overflow-hidden flex text-left disabled:opacity-50">
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.badges.map(b => <span key={b} className="text-[9px] uppercase bg-ember/15 text-ember px-1.5 py-0.5 rounded-full font-medium">{b}</span>)}
              </div>
              <h3 className="font-medium mt-1">{tr(item.name, lang)}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{tr(item.description, lang)}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-ember font-semibold">{fmtPrice(item.price, restaurant.currency)}</span>
                {item.soldOut && <span className="text-[10px] uppercase bg-muted px-2 py-0.5 rounded">Sold out</span>}
                {item.modifierGroupIds.length > 0 && <span className="text-[10px] text-muted-foreground">+ options</span>}
              </div>
            </div>
            {item.image && <img src={item.image} alt="" className="h-28 w-28 object-cover flex-shrink-0" />}
          </button>
        ))}
        {visible.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">Nothing here.</div>}
      </div>

      {/* FLOATING ACTIONS */}
      <div className="fixed bottom-4 left-4 right-4 flex gap-2 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="bg-card shadow-lg flex-1"><Bell className="h-4 w-4 mr-1.5" />Service</Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader><SheetTitle>How can we help?</SheetTitle></SheetHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" onClick={() => { callWaiter(table, "help"); toast.success("Waiter on the way"); }}><Hand className="h-4 w-4 mr-2" />Call waiter</Button>
              <Button variant="outline" onClick={() => { callWaiter(table, "water"); toast.success("Request sent"); }}><Droplet className="h-4 w-4 mr-2" />Water / napkins</Button>
              <Button variant="outline" className="col-span-2" onClick={() => { requestBill(table); toast.success("Bill requested. Pay at your table."); }}><Receipt className="h-4 w-4 mr-2" />Ask for the bill</Button>
              <p className="text-xs text-muted-foreground col-span-2 text-center">Payment is handled outside the app — your server will bring the terminal.</p>
            </div>
          </SheetContent>
        </Sheet>

        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground flex-1 shadow-xl"><ShoppingBag className="h-4 w-4 mr-1.5" />
              Cart {cartCount > 0 && <span className="ml-1.5 bg-background text-ember rounded-full px-1.5 text-xs">{cartCount}</span>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>Your cart · {tableObj?.label}</SheetTitle></SheetHeader>
            {order ? (
              <OrderTracking order={order} restaurant={restaurant} items={items} />
            ) : cart.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Cart is empty. Add something delicious.</div>
            ) : (
              <>
                <div className="space-y-2 mt-4">
                  {cart.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <img src={c.item.image} className="h-12 w-12 rounded object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tr(c.item.name, lang)}</div>
                        <div className="text-xs text-muted-foreground">{fmtPrice(c.item.price, restaurant.currency)}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Minus className="h-3 w-3" /></button>
                        <span className="w-6 text-center text-sm">{c.qty}</span>
                        <button onClick={() => setCart(cs => cs.map(x => x.id === c.id ? { ...x, qty: x.qty + 1 } : x))} className="h-7 w-7 rounded-full border grid place-items-center"><Plus className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-lg font-display">
                  <span>Total</span><span>{fmtPrice(cartTotal, restaurant.currency)}</span>
                </div>
                <Button className="w-full mt-4 bg-ember hover:bg-ember/90 text-ember-foreground" size="lg"
                  onClick={() => {
                    const orderItems: OrderItem[] = cart.map(c => ({
                      id: Math.random().toString(36).slice(2, 8),
                      menuItemId: c.item.id, qty: c.qty, note: c.note,
                      modifiers: Object.entries(c.mods).map(([groupId, optionIds]) => ({ groupId, optionIds })),
                    }));
                    const o = placeOrder(table, orderItems, lang);
                    setOrderId(o.id);
                    setCart([]);
                    toast.success("Order sent to kitchen");
                  }}>Send order to kitchen</Button>
                <p className="text-xs text-muted-foreground text-center mt-2">No payment now — settle with your server.</p>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {activeItem && <ItemSheet item={activeItem} onClose={() => setActiveItem(null)} onAdd={addToCart} lang={lang} />}
    </div>
  );
}

function ItemSheet({ item, onClose, onAdd, lang }: { item: MenuItem; onClose: () => void; onAdd: any; lang: Lang }) {
  const { modifiers, restaurant } = useStore();
  const groups = modifiers.filter(m => item.modifierGroupIds.includes(m.id));
  const [mods, setMods] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const valid = groups.every(g => !g.required || (mods[g.id]?.length ?? 0) >= g.min);
  const extraPrice = Object.values(mods).flat().reduce((s, oid) => s + (modifiers.flatMap(g => g.options).find(o => o.id === oid)?.priceDelta ?? 0), 0);

  const toggle = (g: typeof groups[0], oid: string) => {
    setMods(m => {
      const cur = m[g.id] ?? [];
      if (g.max === 1) return { ...m, [g.id]: [oid] };
      if (cur.includes(oid)) return { ...m, [g.id]: cur.filter(x => x !== oid) };
      if (cur.length >= g.max) return m;
      return { ...m, [g.id]: [...cur, oid] };
    });
  };

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto p-0">
        <img src={item.image} className="w-full h-48 object-cover" alt="" />
        <div className="p-5">
          <SheetHeader><SheetTitle className="font-display text-2xl">{tr(item.name, lang)}</SheetTitle></SheetHeader>
          <p className="text-sm text-muted-foreground mt-1">{tr(item.description, lang)}</p>
          {item.allergens.length > 0 && <div className="text-[10px] uppercase text-warning mt-2">⚠ {item.allergens.join(" · ")}</div>}

          {groups.map(g => (
            <div key={g.id} className="mt-5">
              <div className="flex items-baseline justify-between">
                <div className="font-medium">{tr(g.name, lang)}</div>
                <div className="text-xs text-muted-foreground">{g.required ? "Required" : "Optional"} · pick {g.min === g.max ? g.min : `${g.min}–${g.max}`}</div>
              </div>
              <div className="mt-2 space-y-1.5">
                {g.options.map(o => (
                  <button key={o.id} disabled={!o.available} onClick={() => toggle(g, o.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-sm text-left disabled:opacity-40 ${mods[g.id]?.includes(o.id) ? "border-ember bg-ember/5" : ""}`}>
                    <div className={`h-4 w-4 rounded-full border-2 ${mods[g.id]?.includes(o.id) ? "bg-ember border-ember" : ""}`}>
                      {mods[g.id]?.includes(o.id) && <Check className="h-3 w-3 text-ember-foreground" />}
                    </div>
                    <span className="flex-1">{tr(o.name, lang)}</span>
                    {o.priceDelta > 0 && <span className="text-xs text-muted-foreground">+{fmtPrice(o.priceDelta, restaurant.currency)}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-5">
            <div className="font-medium text-sm">Note for the kitchen</div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. no onions" className="mt-1 w-full p-2 rounded border bg-card text-sm" />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center gap-2 border rounded-full p-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-full grid place-items-center"><Minus className="h-3 w-3" /></button>
              <span className="w-6 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="h-8 w-8 rounded-full grid place-items-center"><Plus className="h-3 w-3" /></button>
            </div>
            <Button disabled={!valid} className="flex-1 bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => onAdd(item, mods, qty, note)}>
              Add to cart · {fmtPrice((item.price + extraPrice) * qty, restaurant.currency)}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function OrderTracking({ order, restaurant, items }: any) {
  const steps = [
    { k: "new", label: "Order received" },
    { k: "accepted", label: "Kitchen accepted" },
    { k: "preparing", label: "Preparing" },
    { k: "ready", label: "Ready" },
    { k: "served", label: "Served" },
  ];
  const idx = steps.findIndex(s => s.k === order.status);
  return (
    <div className="mt-5 space-y-4">
      <div className="rounded-lg bg-ember/5 border border-ember/20 p-4">
        <div className="text-xs uppercase tracking-wider text-ember">Your order</div>
        <div className="font-display text-2xl mt-1">#{order.shortCode}</div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" /> Approx. 15–25 min</div>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s.k} className={`flex items-center gap-3 ${i > idx ? "opacity-40" : ""}`}>
            <div className={`h-6 w-6 rounded-full grid place-items-center ${i < idx ? "bg-sage text-white" : i === idx ? "bg-ember text-ember-foreground animate-pulse" : "bg-muted"}`}>
              {i < idx ? <Check className="h-3 w-3" /> : <span className="text-[10px]">{i + 1}</span>}
            </div>
            <span className="text-sm">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t">
        <div className="text-xs uppercase text-muted-foreground mb-1">Items</div>
        {order.items.map((it: any) => {
          const mi = items.find((x: any) => x.id === it.menuItemId);
          return <div key={it.id} className="text-sm">{it.qty}× {tr(mi?.name ?? { az: "?", en: "?", ru: "?" }, "en")}</div>;
        })}
      </div>
    </div>
  );
}
