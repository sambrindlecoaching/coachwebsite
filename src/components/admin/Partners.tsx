import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { db as supabase } from "./db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminHeader, Panel, selectCls } from "./ui";

const TYPES = ["lawyer", "mediator", "therapist", "other"];

export function Partners() {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", type: "lawyer", contact: "" });
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "partners"],
    queryFn: async () => (await supabase.from("partners").select("*").order("name")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "partners"] });

  const add = async () => {
    if (!f.name) return;
    const { error } = await supabase.from("partners").insert(f);
    if (error) { toast.error(error.message); return; }
    setF({ name: "", type: "lawyer", contact: "" });
    refresh();
  };
  const bump = async (id: string, n: number) => {
    await supabase.from("partners").update({ referrals_sent: Math.max(0, n) }).eq("id", id);
    refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Remove this partner?")) return;
    await supabase.from("partners").delete().eq("id", id);
    refresh();
  };

  return (
    <>
      <AdminHeader title="Referral partners" />
      <Panel className="mb-4 flex flex-wrap gap-3">
        <Input aria-label="Name" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="h-10 w-52 rounded-full" />
        <select aria-label="Type" className={selectCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>
          {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <Input aria-label="Contact" placeholder="Email, phone or website" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} className="h-10 w-64 rounded-full" />
        <Button variant="marigold" onClick={add}>Add partner</Button>
      </Panel>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((p) => (
          <li key={p.id}>
            <Panel className="flex h-full flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{p.name}</p>
                  <p className="text-sm capitalize text-soft">{p.type}</p>
                </div>
                <button type="button" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)} className="rounded-full p-2 hover:bg-muted"><Trash2 className="size-4" /></button>
              </div>
              <p className="text-sm break-all">{p.contact || "—"}</p>
              <div className="mt-auto flex items-center gap-3">
                <span className="text-sm">Referrals sent</span>
                <button type="button" aria-label="One fewer" onClick={() => bump(p.id, p.referrals_sent - 1)} className="size-8 rounded-full border border-border">−</button>
                <span className="w-6 text-center text-xl font-bold tabular-nums">{p.referrals_sent}</span>
                <button type="button" aria-label="One more" onClick={() => bump(p.id, p.referrals_sent + 1)} className="size-8 rounded-full bg-marigold font-bold">+</button>
              </div>
            </Panel>
          </li>
        ))}
      </ul>
    </>
  );
}
