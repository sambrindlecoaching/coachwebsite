import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { db as supabase } from "./db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "./ui";

export function AdminAccess() {
  const [rows, setRows] = useState<{ email: string }[]>([]);
  const [me, setMe] = useState("");
  const [email, setEmail] = useState("");

  const load = () =>
    supabase.from("admin_allowlist").select("email").order("added_at").then(({ data }) => setRows(data ?? []));

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.email?.toLowerCase() ?? ""));
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!v) return;
    const { error } = await supabase.from("admin_allowlist").insert({ email: v });
    if (error) { toast.error(error.code === "23505" ? "Already on the list." : error.message); return; }
    setEmail("");
    load();
  };

  const remove = async (v: string) => {
    if (v === me) return;
    const { error } = await supabase.from("admin_allowlist").delete().eq("email", v);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <Panel className="mt-6 grid max-w-2xl gap-4">
      <div>
        <h2 className="text-xl">Admin access</h2>
        <p className="mt-1 text-sm text-muted-foreground">Only these emails can create an account and see the dashboard.</p>
      </div>
      <ul className="grid gap-2">
        {rows.map((r) => (
          <li key={r.email} className="flex items-center justify-between gap-3 rounded-full border border-border px-4 py-2 text-sm">
            <span className="truncate">{r.email}</span>
            {r.email === me ? (
              <span className="text-xs text-soft">You</span>
            ) : (
              <button type="button" className="text-xs font-semibold underline" onClick={() => remove(r.email)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="flex flex-wrap items-end gap-3">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="al-email">Add an email</Label>
          <Input id="al-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 rounded-full" />
        </div>
        <Button type="submit" variant="outline">Add</Button>
      </form>
    </Panel>
  );
}
