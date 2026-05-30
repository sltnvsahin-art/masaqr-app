import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PublicNav, PublicFooter } from "@/components/PublicNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MasaQR" },
      { name: "description", content: "Sign in to your MasaQR restaurant account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const login = useStore(s => s.login);
  const [email, setEmail] = useState("owner@oliveember.az");
  const [pass, setPass] = useState("demo1234");

  return (
    <div>
      <PublicNav />
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage your restaurant.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={e => {
            e.preventDefault();
            login(email, "owner");
            toast.success("Signed in");
            nav({ to: "/app" });
          }}
        >
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between"><Label>Password</Label><Link to="/forgot-password" className="text-xs text-ember">Forgot?</Link></div>
            <Input type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full bg-ember hover:bg-ember/90 text-ember-foreground">Sign in</Button>
          <p className="text-xs text-muted-foreground text-center">Demo: any email signs you in as the owner.</p>
        </form>
        <div className="mt-6 text-center text-sm">
          New to MasaQR? <Link to="/register" className="text-ember font-medium">Start your free trial</Link>
        </div>
        <div className="mt-2 text-center text-xs text-muted-foreground">
          Joining a team? <Link to="/join" className="underline">Use your invite code</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
