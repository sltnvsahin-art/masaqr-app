import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/AppShell";
import { useStore, tr, fmtPrice, type PdfTemplate, type Lang } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Printer, Link as LinkIcon, RefreshCw, FileCheck2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/pdf")({
  head: () => ({ meta: [{ title: "PDF Menu — MasaQR" }] }),
  component: PdfStudio,
});

const TEMPLATES: { id: PdfTemplate; name: string; vibe: string }[] = [
  { id: "classic", name: "Classic", vibe: "Serif headlines · centered layout" },
  { id: "modern", name: "Modern", vibe: "Sans · two columns · clean grid" },
  { id: "editorial", name: "Editorial", vibe: "Magazine cover · hero image" },
  { id: "minimal", name: "Minimal", vibe: "Pure type · no images" },
];

function PdfStudio() {
  const { pdf, setPdf, restaurant, categories, items } = useStore();

  return (
    <div className="p-6 md:p-10">
      <PageHeader
        title="PDF menu studio"
        subtitle="Auto-generated from your live menu. Switch templates to redesign your booklet instantly."
        actions={
          <>
            <Button variant="outline" onClick={() => toast.success("Public PDF link copied")}><LinkIcon className="mr-2 h-4 w-4" />Copy link</Button>
            <Button variant="outline" onClick={() => toast.success("Sent to printer")}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button className="bg-ember hover:bg-ember/90 text-ember-foreground" onClick={() => toast.success("PDF generated")}><Download className="mr-2 h-4 w-4" />Export PDF</Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Template</h3>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => { setPdf({ template: t.id }); toast.success(`Template: ${t.name}`); }}
                  className={`w-full text-left p-3 rounded-lg border transition ${pdf.template === t.id ? "border-ember bg-ember/5 ring-1 ring-ember" : "hover:border-foreground/30"}`}>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.vibe}</div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-display text-lg mb-3">Language</h3>
            <div className="grid grid-cols-2 gap-1">
              {(["az", "en", "ru", "multi"] as const).map(l => (
                <button key={l} onClick={() => setPdf({ language: l })}
                  className={`text-xs uppercase py-2 rounded border ${pdf.language === l ? "bg-foreground text-background border-foreground" : "bg-card"}`}>
                  {l === "multi" ? "Multilingual" : l}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-display text-lg">Content</h3>
            <Toggle label="Item images" v={pdf.showImages} on={v => setPdf({ showImages: v })} />
            <Toggle label="Allergens" v={pdf.showAllergens} on={v => setPdf({ showAllergens: v })} />
            <Toggle label="Prices" v={pdf.showPrices} on={v => setPdf({ showPrices: v })} />
            <Toggle label="Include sold-out items" v={pdf.showSoldOut} on={v => setPdf({ showSoldOut: v })} />
          </Card>

          <Card className="p-5 bg-sage/5 border-sage/30">
            <FileCheck2 className="h-5 w-5 text-sage" />
            <div className="mt-2 text-sm font-medium">PDF is in sync</div>
            <div className="text-xs text-muted-foreground mt-1">{categories.length} categories · {items.length} items</div>
            <Button variant="ghost" size="sm" className="mt-2 -ml-2 h-7"><RefreshCw className="h-3 w-3 mr-1" />Regenerate</Button>
          </Card>
        </div>

        <Card className="p-6 bg-foreground/[0.03]">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Live preview · {TEMPLATES.find(t => t.id === pdf.template)?.name}</div>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            <PdfCover />
            {categories.sort((a, b) => a.order - b.order).map(c => <PdfPage key={c.id} categoryId={c.id} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </label>
  );
}

function PdfCover() {
  const { pdf, restaurant } = useStore();
  const langLabel = pdf.language === "multi" ? "AZ · EN · RU" : pdf.language.toUpperCase();

  if (pdf.template === "editorial") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl relative overflow-hidden">
        <img src={restaurant.cover} className="w-full h-3/5 object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <div className="text-xs uppercase tracking-[0.3em]">The menu · {langLabel}</div>
          <div className="font-display text-6xl mt-2 italic">{restaurant.name}</div>
          <div className="text-sm mt-3 opacity-80">Seasonal · {new Date().getFullYear()}</div>
        </div>
      </div>
    );
  }
  if (pdf.template === "minimal") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl grid place-items-center text-center">
        <div>
          <div className="font-display text-7xl tracking-tighter">{restaurant.name}</div>
          <div className="mt-6 h-px w-16 bg-foreground mx-auto" />
          <div className="mt-6 text-xs uppercase tracking-[0.4em]">Menu · {langLabel}</div>
        </div>
      </div>
    );
  }
  if (pdf.template === "modern") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-10 flex flex-col">
        <div className="flex items-center justify-between text-xs uppercase tracking-wider"><span>{restaurant.name}</span><span>{langLabel}</span></div>
        <div className="flex-1 grid grid-cols-2 gap-6 mt-12">
          <div>
            <div className="font-sans text-6xl font-black leading-none tracking-tight">The<br/>menu</div>
            <div className="mt-6 text-sm text-neutral-600">Edition {new Date().getFullYear()}</div>
          </div>
          <div className="bg-neutral-100" />
        </div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-500">masaqr.app/{restaurant.slug}</div>
      </div>
    );
  }
  // classic
  return (
    <div className="aspect-[1/1.414] bg-white shadow-xl p-12 grid place-items-center text-center border-double border-8 border-neutral-300">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-neutral-500">est. {new Date().getFullYear()}</div>
        <div className="font-display italic text-5xl mt-4">{restaurant.name}</div>
        <div className="mt-8 h-px w-24 bg-neutral-400 mx-auto" />
        <div className="mt-8 font-display text-2xl">Menu</div>
        <div className="text-xs mt-1 text-neutral-500 tracking-widest">{langLabel}</div>
      </div>
    </div>
  );
}

function PdfPage({ categoryId }: { categoryId: string }) {
  const { pdf, items, categories, restaurant } = useStore();
  const cat = categories.find(c => c.id === categoryId)!;
  const langs: Lang[] = pdf.language === "multi" ? ["az", "en", "ru"] : [pdf.language as Lang];
  const primary = langs[0];

  const visible = items
    .filter(i => i.categoryId === categoryId && i.showOnPdf && !i.hidden && (pdf.showSoldOut || !i.soldOut));

  const renderItem = (i: typeof items[0]) => (
    <div key={i.id} className="py-2.5 border-b border-dashed border-neutral-200 flex gap-3">
      {pdf.showImages && (
        <img src={i.image} alt="" className="h-14 w-14 rounded object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{tr(i.name, primary)}</span>
          {i.soldOut && <span className="text-[9px] uppercase bg-neutral-200 text-neutral-600 px-1 rounded">Sold out</span>}
          <span className="flex-1 border-b border-dotted border-neutral-300 mx-1" />
          {pdf.showPrices && <span className="text-neutral-700 text-sm">{fmtPrice(i.price, restaurant.currency)}</span>}
        </div>
        {langs.slice(1).map(l => (
          <div key={l} className="text-xs italic text-neutral-500">{tr(i.name, l)}</div>
        ))}
        <div className="text-xs text-neutral-600 mt-0.5">{tr(i.description, primary)}</div>
        {pdf.showAllergens && i.allergens.length > 0 && (
          <div className="text-[10px] uppercase text-neutral-400 mt-1">⚠ {i.allergens.join(" · ")}</div>
        )}
      </div>
    </div>
  );

  // Template variants
  if (pdf.template === "editorial") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-10 flex flex-col font-sans">
        <div className="border-b-4 border-black pb-3">
          <div className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Chapter</div>
          <div className="font-display italic text-5xl">{tr(cat.name, primary)}</div>
          <div className="text-sm text-neutral-600 mt-1">{tr(cat.description, primary)}</div>
        </div>
        <div className="flex-1 mt-4 columns-2 gap-8">
          {visible.map(renderItem)}
        </div>
        <div className="text-[10px] text-neutral-400 text-center mt-3">{restaurant.name} · {cat.order}</div>
      </div>
    );
  }
  if (pdf.template === "minimal") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-14 flex flex-col font-sans">
        <div className="font-display text-3xl">{tr(cat.name, primary)}</div>
        <div className="mt-1 text-xs text-neutral-500 uppercase tracking-widest">{tr(cat.description, primary)}</div>
        <div className="mt-8 flex-1 space-y-3">
          {visible.map(i => (
            <div key={i.id} className="flex items-baseline gap-2 border-b border-neutral-100 pb-2">
              <span>{tr(i.name, primary)}</span>
              <span className="flex-1 border-b border-dotted border-neutral-300" />
              {pdf.showPrices && <span>{fmtPrice(i.price, restaurant.currency)}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (pdf.template === "modern") {
    return (
      <div className="aspect-[1/1.414] bg-white shadow-xl p-10 flex flex-col font-sans">
        <div className="flex items-end justify-between border-b-2 border-black pb-2">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500">0{cat.order}</div>
            <div className="text-3xl font-black tracking-tight">{tr(cat.name, primary).toUpperCase()}</div>
          </div>
          <div className="text-xs text-neutral-500">{visible.length} items</div>
        </div>
        <div className="mt-5 flex-1">{visible.map(renderItem)}</div>
        <div className="text-[10px] uppercase tracking-widest text-neutral-400">{restaurant.name}</div>
      </div>
    );
  }
  // classic
  return (
    <div className="aspect-[1/1.414] bg-[#fdfbf5] shadow-xl p-12 flex flex-col">
      <div className="text-center border-b border-neutral-300 pb-3">
        <div className="font-display italic text-4xl">{tr(cat.name, primary)}</div>
        <div className="text-xs italic text-neutral-500 mt-1">{tr(cat.description, primary)}</div>
      </div>
      <div className="mt-5 flex-1 space-y-1">{visible.map(renderItem)}</div>
      <div className="text-[10px] text-center text-neutral-400 italic">— {restaurant.name} —</div>
    </div>
  );
}
