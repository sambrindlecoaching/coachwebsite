import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shell } from "@/components/admin/AdminApp";

export const Route = createFileRoute("/admin_/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set a new password | Sam Brindle Coaching" },
      { name: "description", content: "Set a new password for the private dashboard." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Set a new password | Sam Brindle Coaching" },
      { property: "og:description", content: "Set a new password for the private dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg("That link has expired. Ask for a new one from the sign-in page.");
    setDone(true);
  };

  return (
    <Shell>
      {done ? (
        <div className="grid gap-4">
          <h1 className="text-3xl">Password updated</h1>
          <Button asChild size="lg"><Link to="/admin">Go to the dashboard</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4">
          <h1 className="text-3xl">Set a new password</h1>
          <div className="grid gap-1.5">
            <Label htmlFor="r-pass">New password</Label>
            <Input id="r-pass" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-full px-4" />
          </div>
          {msg && <p role="alert" className="text-sm font-semibold">{msg}</p>}
          <Button type="submit" size="lg" disabled={busy}>{busy ? "…" : "Save password"}</Button>
        </form>
      )}
    </Shell>
  );
}
