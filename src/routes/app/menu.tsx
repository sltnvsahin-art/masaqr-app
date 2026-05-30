import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, tr, fmtPrice, type MenuItem, type Lang } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, Edit2, Image as ImageIcon, Search, GripVertical, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/menu")({
  head: () => ({ meta: [{ title: "Menu Builder — MasaQR" }] }),
  component: MenuBuilder,
});

const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
  "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600",
  "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600",
  "https://images.unsplash.com/photo-1611329857570-f02f340e7378?w=600",
  "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600",
  "https://images.unsplash.com/photo-1432139509613-5c4255815697?w=600",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600",
  "https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=600",
];

function MenuBuilder() {
  const { categories, items, modifiers, restaurant, toggleSoldOut, upsertItem, deleteItem, upsertCategory } = useStore();
  const [activeCat, setActiveCat] = useState(categories[0]?.id);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [newCatOpen, setNewCatOpen] = useState(false);

  const visibleItems = items
    .filter(i => i.categoryId === activeCat)
    .filter(i => !q || tr(i.name, "en").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="Menu builder"
        subtitle="Edit once. Updates everywhere — guest menu, kitchen, and PDF."
        actions={
          <Button onClick={() => setEditing(blankItem(activeCat))} className="bg-ember hover:bg-ember/90 text-ember-foreground">
            <Plus className="mr-1.5 h-4 w-4" /> Add item
          </Button>
        }
      />

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <Card className="p-3 h-fit">
          <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1.5">Categories</div>
          {categories.sort((a, b) => a.order - b.order).map(c => {
            const count = items.filter(i => i.categoryId === c.id).length;
            return (
              <button key={c.id} onClick={() => setActiveCat(c.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-left hover:bg-muted ${activeCat === c.id ? "bg-ember/10 text-ember font-medium" : ""}`}>
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1 truncate">{tr(c.name, "en")}</span>
                <span className="text-xs text-muted-foreground">{count}</span>
              </button>
            );
          })}
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={() => setNewCatOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> New category
          </Button>
        </Card>

        <div>
          <div className="relative mb-3 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search items…" className="pl-9" />
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleItems.map(item => (
              <Card key={item.id} className="overflow-hidden group">
                <div className="aspect-[4/3] relative bg-muted">
                  <img src={item.image} alt={tr(item.name, "en")} className="w-full h-full object-cover" />
                  {item.soldOut && <div className="absolute inset-0 bg-foreground/60 grid place-items-center"><span className="text-background text-sm font-medium uppercase tracking-wider">Sold out</span></div>}
                  {item.hidden && <span className="absolute top-2 left-2 text-[10px] uppercase bg-foreground text-background px-2 py-0.5 rounded-full flex items-center gap-1"><EyeOff className="h-2.5 w-2.5" /> Hidden</span>}
                  {item.featured && <span className="absolute top-2 right-2 text-[10px] uppercase bg-ember text-ember-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles className="h-2.5 w-2.5" /> Featured</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-tight">{tr(item.name, "en")}</h3>
                    <span className="text-ember font-semibold whitespace-nowrap">{fmtPrice(item.price, restaurant.currency)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tr(item.description, "en")}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.badges.map(b => <span key={b} className="text-[10px] uppercase bg-muted px-1.5 py-0.5 rounded">{b}</span>)}
                    {item.allergens.map(a => <span key={a} className="text-[10px] uppercase bg-warning/10 text-warning px-1.5 py-0.5 rounded">{a}</span>)}
                  </div>
                  <div className="mt-3 flex items-center gap-2 pt-3 border-t">
                    <label className="flex items-center gap-1.5 text-xs">
                      <Switch checked={!item.soldOut} onCheckedChange={() => toggleSoldOut(item.id)} />
                      {item.soldOut ? "Sold out" : "Available"}
                    </label>
                    <Button size="sm" variant="ghost" className="ml-auto h-7" onClick={() => setEditing(item)}><Edit2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="border-dashed grid place-items-center p-8 cursor-pointer hover:border-ember/40" onClick={() => setEditing(blankItem(activeCat))}>
              <div className="text-center text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Add item</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {editing && <ItemEditor item={editing} onClose={() => setEditing(null)} />}
      <NewCategoryDialog open={newCatOpen} onClose={() => setNewCatOpen(false)} />
    </div>
  );
}

function blankItem(catId: string): MenuItem {
  return {
    id: "i" + Math.random().toString(36).slice(2, 8),
    categoryId: catId,
    name: { az: "", en: "", ru: "" },
    description: { az: "", en: "", ru: "" },
    price: 0,
    image: STOCK_IMAGES[0],
    allergens: [],
    station: "grill",
    prepTime: 10,
    available: true, soldOut: false, hidden: false,
    badges: [], featured: false, showOnQr: true, showOnPdf: true,
    modifierGroupIds: [],
  };
}

function ItemEditor({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { upsertItem, deleteItem, modifiers } = useStore();
  const [draft, setDraft] = useState<MenuItem>(item);
  const [lang, setLang] = useState<Lang>("en");
  const [pickerOpen, setPickerOpen] = useState(false);
  const isNew = !useStore.getState().items.find(i => i.id === item.id);

  const setName = (v: string) => setDraft(d => ({ ...d, name: { ...d.name, [lang]: v } }));
  const setDesc = (v: string) => setDraft(d => ({ ...d, description: { ...d.description, [lang]: v } }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isNew ? "New menu item" : "Edit item"}</DialogTitle></DialogHeader>

        <div className="grid md:grid-cols-[200px_1fr] gap-5">
          <div>
            <button onClick={() => setPickerOpen(true)} className="aspect-square w-full rounded-lg border-2 border-dashed overflow-hidden bg-muted relative group">
              {draft.image ? <img src={draft.image} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="m-auto text-muted-foreground" />}
              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition grid place-items-center text-background text-xs">Change image</div>
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-2">Updates guest menu & PDF</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-1">
              {(["az", "en", "ru"] as Lang[]).map(l => (
                <button key={l} onClick={() => setLang(l)} className={`text-xs px-2 py-1 rounded ${lang === l ? "bg-foreground text-background" : "bg-muted"}`}>{l.toUpperCase()}</button>
              ))}
            </div>
            <div><Label>Name ({lang.toUpperCase()})</Label><Input value={draft.name[lang]} onChange={e => setName(e.target.value)} /></div>
            <div><Label>Description ({lang.toUpperCase()})</Label><Textarea rows={2} value={draft.description[lang]} onChange={e => setDesc(e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Price</Label><Input type="number" step="0.5" value={draft.price} onChange={e => setDraft({ ...draft, price: +e.target.value })} /></div>
              <div><Label>Prep (min)</Label><Input type="number" value={draft.prepTime} onChange={e => setDraft({ ...draft, prepTime: +e.target.value })} /></div>
              <div><Label>Station</Label>
                <select value={draft.station} onChange={e => setDraft({ ...draft, station: e.target.value as any })} className="w-full h-10 border rounded-md px-2 text-sm bg-card">
                  <option value="grill">Grill</option><option value="cold">Cold</option><option value="bar">Bar</option><option value="pastry">Pastry</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Allergens</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["gluten", "dairy", "egg", "nuts", "fish", "shellfish", "soy"].map(a => (
                  <button key={a} type="button" onClick={() => setDraft(d => ({ ...d, allergens: d.allergens.includes(a) ? d.allergens.filter(x => x !== a) : [...d.allergens, a] }))}
                    className={`text-xs px-2 py-1 rounded border ${draft.allergens.includes(a) ? "bg-warning/15 border-warning/40 text-warning" : "bg-card"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Badges</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {["new", "spicy", "vegan", "chef", "popular"].map(b => (
                  <button key={b} type="button" onClick={() => setDraft(d => ({ ...d, badges: d.badges.includes(b as any) ? d.badges.filter(x => x !== b) : [...d.badges, b as any] }))}
                    className={`text-xs px-2 py-1 rounded border ${draft.badges.includes(b as any) ? "bg-ember/15 border-ember/40 text-ember" : "bg-card"}`}>{b}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Modifier groups</Label>
              <div className="space-y-1 mt-1">
                {modifiers.map(m => (
                  <label key={m.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={draft.modifierGroupIds.includes(m.id)}
                      onChange={e => setDraft(d => ({ ...d, modifierGroupIds: e.target.checked ? [...d.modifierGroupIds, m.id] : d.modifierGroupIds.filter(x => x !== m.id) }))} />
                    <span>{tr(m.name, "en")}</span>
                    <span className="text-xs text-muted-foreground">({m.required ? "required" : "optional"}, {m.options.length} options)</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <label className="flex items-center gap-2 text-sm"><Switch checked={draft.showOnQr} onCheckedChange={v => setDraft({ ...draft, showOnQr: v })} /> Show on QR menu</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={draft.showOnPdf} onCheckedChange={v => setDraft({ ...draft, showOnPdf: v })} /> Show on PDF</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={draft.featured} onCheckedChange={v => setDraft({ ...draft, featured: v })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={!draft.hidden} onCheckedChange={v => setDraft({ ...draft, hidden: !v })} /> Visible</label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {!isNew && <Button variant="ghost" className="text-destructive" onClick={() => { deleteItem(item.id); toast.success("Item deleted"); onClose(); }}>Delete</Button>}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => { upsertItem(draft); toast.success("Saved · guest menu & PDF updated"); onClose(); }}>Save</Button>
          </div>
        </DialogFooter>

        <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Choose image</DialogTitle></DialogHeader>
            <div className="grid grid-cols-4 gap-2">
              {STOCK_IMAGES.map(u => (
                <button key={u} onClick={() => { setDraft({ ...draft, image: u }); setPickerOpen(false); toast.success("Image selected"); }}
                  className="aspect-square rounded-md overflow-hidden border-2 hover:border-ember transition">
                  <img src={u} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground text-center pt-2 border-t">Or upload from your device (demo)</div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

function NewCategoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories, upsertCategory } = useStore();
  const [name, setName] = useState("");
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>New category</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name (English)</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <p className="text-xs text-muted-foreground">You can add AZ/RU translations after creating it.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => {
            upsertCategory({
              id: "c" + Math.random().toString(36).slice(2, 6),
              order: categories.length + 1,
              name: { az: name, en: name, ru: name },
              description: { az: "", en: "", ru: "" },
            });
            toast.success("Category added");
            setName(""); onClose();
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
