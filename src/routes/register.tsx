import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Start free trial — MasaQR" },
      { name: "description", content: "Create your MasaQR account. 1 month free, no card." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const register = useStore(s => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [restaurant, setRestaurant] = useState("");
  const [slug, setSlug] = useState("");

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-[1.1fr_1fr] gap-12 items-start">
        <div>
          <span className="text-xs uppercase tracking-widest text-ember">Free for 30 days</span>
          <h1 className="font-display text-4xl mt-2">Get your restaurant online in minutes.</h1>
          <p className="mt-3 text-muted-foreground">No credit card. Full features. Cancel anytime.</p>
          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Full QR menu with 3 languages",
              "Unlimited PDF exports",
              "Kitchen display + waiter alerts",
              "Up to 3 branches during trial",
              "Drop us an email anytime",
            ].map(x => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-sage" />{x}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-7 shadow-sm">
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              register(email, name, restaurant, slug || restaurant.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
              toast.success("Trial started! Let's set things up.");
              nav({ to: "/setup" });
            }}
          >
            <div className="space-y-1.5"><Label>Your name</Label><Input required value={name} onChange={e => setName(e.target.value)} placeholder="Aysel Mammadova" /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@restaurant.com" /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input required type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Min 8 characters" /></div>
            <div className="space-y-1.5"><Label>Restaurant name</Label><Input required value={restaurant} onChange={e => { setRestaurant(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }} placeholder="Olive & Ember" /></div>
            <div className="space-y-1.5">
              <Label>Your URL slug</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-xs text-muted-foreground">masaqr.app/m/</span>
                <Input className="rounded-l-none" required value={slug} onChange={e => setSlug(e.target.value)} placeholder="olive-ember" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">Start free trial</Button>
            <p className="text-xs text-muted-foreground text-center">Already have an account? <Link to="/login" className="text-ember">Sign in</Link></p>
          </form>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
