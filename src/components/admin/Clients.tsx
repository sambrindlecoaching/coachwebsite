import { PHASE2 } from "@/config/features";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db as supabase } from "./db";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";
import { AdminHeader, Panel, fmtDate } from "./ui";
import { ClientPage } from "./ClientPage";

type Client = Tables<"clients"> & { sessions: Tables<"sessions">[]; payments: Tables<"payments">[] };

export function Clients() {
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", start_date: "", programme: site.programme.name });
  const [open, setOpen] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["admin", "clients"],
    queryFn: async () =>
      ((await supabase.from("clients").select("*, sessions(*), payments(*)").order("active", { ascending: false }).order("created_at", { ascending: false })).data ?? []) as Client[],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const add = async () => {
    if (!form.name) return;
    const { data, error } = await supabase.from("clients").insert({ ...form, start_date: form.start_date || null, email: form.email || null }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("sessions").insert(Array.from({ length: site.programme.sessions }, (_, i) => ({ client_id: data.id, session_number: i + 1 })));
    await supabase.from("payments").insert(Array.from({ length: site.programme.months }, (_, i) => ({ client_id: data.id, month_number: i + 1, amount: site.programme.pricePerMonth })));
    setForm({ name: "", email: "", start_date: "", programme: site.programme.name });
    setAdding(false);
    refresh();
  };

  if (PHASE2 && open) return <ClientPage clientId={open} onBack={() => { setOpen(null); refresh(); }} />;

  return (
    <>
      <AdminHeader title="Clients"><Button onClick={() => setAdding((a) => !a)}>Add a client</Button></AdminHeader>
      {adding && (
        <Panel className="mb-4 grid gap-3 sm:grid-cols-4">
          <Input aria-label="Name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 rounded-full" />
          <Input aria-label="Email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 rounded-full" />
          <Input aria-label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="h-10 rounded-full" />
          <Button variant="marigold" onClick={add}>Save</Button>
        </Panel>
      )}
      <ul className="grid gap-3">
        {clients.map((c) => {
          const done = c.sessions.filter((s) => s.done).length;
          const total = c.sessions.length || site.programme.sessions;
          return (
            <li key={c.id}>
              <Panel className={cn(!c.active && "opacity-60")}>
                <button type="button" className="flex w-full flex-wrap items-center gap-x-8 gap-y-3 text-left" onClick={() => PHASE2 && setOpen(c.id)} disabled={!PHASE2} aria-label={PHASE2 ? `Open ${c.name}` : c.name}>
                  <span className="min-w-40 flex-1">
                    <span className="text-lg font-semibold">{c.name}</span>
                    <span className="block text-sm text-soft">{c.programme} · started {fmtDate(c.start_date)}</span>
                  </span>
                  <span className="w-48">
                    <span className="text-sm">{done} of {total} sessions</span>
                    <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full bg-marigold" style={{ width: `${(done / total) * 100}%` }} /></span>
                  </span>
                  <span className="text-sm">Next: <strong>{fmtDate(c.next_session)}</strong></span>
                  <span className="flex gap-1" aria-label="Payments">
                    {c.payments.sort((a, b) => a.month_number - b.month_number).map((p) => (
                      <span key={p.id} title={`Month ${p.month_number}: ${p.paid ? "paid" : "due"}`} className={cn("size-3 rounded-full", p.paid ? "bg-ink" : "border border-soft")} />
                    ))}
                  </span>
                  {PHASE2 && <span className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-ink-foreground">Open</span>}
                </button>
              </Panel>
            </li>
          );
        })}
        {clients.length === 0 && <Panel><p className="text-muted-foreground">No clients yet. They'll turn up.</p></Panel>}
      </ul>
    </>
  );
}

export function ClientDetail({ c, refresh }: { c: Client; refresh: () => void }) {
  const save = async (table: "sessions" | "payments" | "clients", id: string, patch: Record<string, unknown>) => {
    const { error } = await supabase.from(table).update(patch as never).eq("id", id);
    if (error) toast.error(error.message);
    refresh();
  };
  return (
    <div className="mt-6 grid gap-6 border-t border-border pt-6 lg:grid-cols-[1fr_280px]">
      <div>
        <p className="mb-3 font-semibold">Sessions</p>
        <ol className="grid gap-2">
          {c.sessions.sort((a, b) => a.session_number - b.session_number).map((s) => (
            <li key={s.id} className="grid gap-2 rounded-2xl bg-background p-3 sm:grid-cols-[auto_150px_1fr] sm:items-start">
              <label className="flex items-center gap-2 pt-2 text-sm font-semibold">
                <input type="checkbox" checked={s.done} onChange={(e) => save("sessions", s.id, { done: e.target.checked })} className="size-5 accent-[var(--ink)]" />
                #{s.session_number}
              </label>
              <Input type="date" aria-label={`Session ${s.session_number} date`} defaultValue={s.session_date ?? ""} onBlur={(e) => e.target.value !== (s.session_date ?? "") && save("sessions", s.id, { session_date: e.target.value || null })} className="h-9 rounded-full bg-card" />
              <Textarea rows={1} aria-label={`Session ${s.session_number} notes`} placeholder="Private notes" defaultValue={s.notes ?? ""} onBlur={(e) => e.target.value !== (s.notes ?? "") && save("sessions", s.id, { notes: e.target.value })} className="min-h-9 rounded-2xl bg-card" />
            </li>
          ))}
        </ol>
      </div>
      <div className="grid content-start gap-5">
        <div>
          <p className="mb-3 font-semibold">Payments</p>
          <ul className="grid gap-2">
            {c.payments.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => save("payments", p.id, { paid: !p.paid })} className={cn("flex w-full justify-between rounded-full px-4 py-2 text-sm font-medium", p.paid ? "bg-ink text-ink-foreground" : "border border-border")}>
                  <span>Month {p.month_number} · €{p.amount}</span><span>{p.paid ? "Paid" : "Due"}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor={`next-${c.id}`}>Next session</Label>
          <Input id={`next-${c.id}`} type="date" defaultValue={c.next_session ?? ""} onBlur={(e) => save("clients", c.id, { next_session: e.target.value || null })} className="h-10 rounded-full" />
        </div>
        <Button variant="outline" onClick={() => save("clients", c.id, { active: !c.active })}>{c.active ? "Mark as finished" : "Mark as active"}</Button>
      </div>
    </div>
  );
}
