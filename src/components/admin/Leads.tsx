import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db as supabase } from "./db";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader, Panel, fmtDate, selectCls } from "./ui";

const STATUSES = ["new", "contacted", "call_booked", "client", "not_now"] as const;
const SOURCES = ["voice_notes", "quiz", "resource", "email_series", "contact_form", "referral"] as const;
const label = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export function Leads() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [nl, setNl] = useState({ first_name: "", email: "", source: "referral" });

  const { data: leads = [] } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: async () => (await supabase.from("leads").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Tables<"leads">> }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: () => toast.error("Didn't save"),
  });

  const add = async () => {
    if (!nl.email) return;
    const { error } = await supabase.from("leads").insert({ ...nl, consent: false });
    if (error) { toast.error(error.message); return; }
    setNl({ first_name: "", email: "", source: "referral" });
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const filtered = leads.filter(
    (l) => (!status || l.status === status) && (!source || l.source === source) && (!q || `${l.first_name} ${l.email}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <AdminHeader title="Leads"><Button onClick={() => setAdding((a) => !a)}>Add a lead</Button></AdminHeader>
      {adding && (
        <Panel className="mb-4 flex flex-wrap gap-3">
          <Input aria-label="First name" placeholder="First name" value={nl.first_name} onChange={(e) => setNl({ ...nl, first_name: e.target.value })} className="h-10 w-40 rounded-full" />
          <Input aria-label="Email" placeholder="Email" value={nl.email} onChange={(e) => setNl({ ...nl, email: e.target.value })} className="h-10 w-64 rounded-full" />
          <select aria-label="Source" className={selectCls} value={nl.source} onChange={(e) => setNl({ ...nl, source: e.target.value })}>
            {SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          <Button variant="marigold" onClick={add}>Save</Button>
        </Panel>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <Input aria-label="Search" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="h-10 w-64 rounded-full bg-card" />
        <select aria-label="Filter by status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <select aria-label="Filter by source" className={selectCls} value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        <span className="self-center text-sm text-soft">{filtered.length} people</span>
      </div>
      <ul className="grid gap-2">
        {filtered.map((l) => (
          <li key={l.id}>
            <Panel className="p-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <button type="button" className="min-w-48 flex-1 text-left" onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
                  <span className="font-semibold">{l.first_name || "—"}</span>
                  <span className="block text-sm text-soft">{l.email}</span>
                </button>
                <span className="text-sm text-muted-foreground">{label(l.source)}{l.resource ? ` · ${l.resource}` : ""}</span>
                <span className="text-sm text-soft">{fmtDate(l.created_at)}</span>
                <select aria-label={`Status for ${l.email}`} className={selectCls} value={l.status} onChange={(e) => update.mutate({ id: l.id, patch: { status: e.target.value } })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                </select>
              </div>
              {open === l.id && (
                <div className="mt-4 grid gap-3 border-t border-border pt-4">
                  {l.message && <p className="whitespace-pre-wrap rounded-2xl bg-background p-4 text-sm">{l.message}</p>}
                  <Textarea aria-label="Notes" placeholder="Notes…" defaultValue={l.notes ?? ""} onBlur={(e) => e.target.value !== (l.notes ?? "") && update.mutate({ id: l.id, patch: { notes: e.target.value } })} className="rounded-2xl" />
                  <p className="text-xs text-soft">Consent to email: {l.consent ? "yes" : "no"}. Notes save when you click away.</p>
                </div>
              )}
            </Panel>
          </li>
        ))}
        {filtered.length === 0 && <Panel><p className="text-muted-foreground">Nobody here yet.</p></Panel>}
      </ul>
    </>
  );
}
