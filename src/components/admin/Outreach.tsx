import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { db as supabase } from "./db";
import { Input } from "@/components/ui/input";
import { AdminHeader, Panel, Stat, fmtDate, selectCls } from "./ui";

const KINDS = [
  { k: "dm_sent", label: "DM sent" },
  { k: "reply", label: "Reply" },
  { k: "call_booked", label: "Call booked" },
] as const;

export function Outreach() {
  const qc = useQueryClient();
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const { data: rows = [] } = useQuery({
    queryKey: ["admin", "outreach"],
    queryFn: async () => (await supabase.from("outreach").select("*").order("created_at", { ascending: false }).limit(300)).data ?? [],
  });
  const wk = new Date(Date.now() - 7 * 864e5).toISOString();
  const count = (k: string) => rows.filter((r) => r.kind === k && r.created_at >= wk).length;

  const log = async (kind: string) => {
    const { error } = await supabase.from("outreach").insert({ kind, handle: handle || null, platform });
    if (error) { toast.error(error.message); return; }
    toast.success("Logged");
    setHandle("");
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
  const remove = async (id: string) => {
    await supabase.from("outreach").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  return (
    <>
      <AdminHeader title="Outreach" />
      <div className="grid gap-4 sm:grid-cols-3">
        {KINDS.map((k) => <Stat key={k.k} label={`${k.label}, this week`} value={count(k.k)} />)}
      </div>
      <Panel className="mt-4">
        <p className="mb-4 font-semibold">One-click log</p>
        <div className="flex flex-wrap gap-3">
          <Input aria-label="Handle (optional)" placeholder="@handle (optional)" value={handle} onChange={(e) => setHandle(e.target.value)} className="h-12 w-56 rounded-full" />
          <select aria-label="Platform" className={selectCls + " h-12"} value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Instagram</option><option>LinkedIn</option><option>Facebook</option><option>Other</option>
          </select>
          {KINDS.map((k) => (
            <button key={k.k} type="button" onClick={() => log(k.k)} className="h-12 rounded-full bg-marigold px-6 font-semibold text-marigold-foreground hover:bg-marigold/85">
              + {k.label}
            </button>
          ))}
        </div>
      </Panel>
      <ul className="mt-4 divide-y divide-border rounded-[22px] bg-card">
        {rows.slice(0, 50).map((r) => (
          <li key={r.id} className="flex items-center gap-4 px-5 py-3 text-sm">
            <span className="w-28 font-semibold">{KINDS.find((k) => k.k === r.kind)?.label}</span>
            <span className="flex-1">{r.handle || "—"} <span className="text-soft">· {r.platform}</span></span>
            <span className="text-soft">{fmtDate(r.created_at)}</span>
            <button type="button" aria-label="Delete entry" onClick={() => remove(r.id)} className="rounded-full p-2 hover:bg-muted"><Trash2 className="size-4" /></button>
          </li>
        ))}
        {rows.length === 0 && <li className="p-5 text-muted-foreground">Nothing logged yet.</li>}
      </ul>
    </>
  );
}
