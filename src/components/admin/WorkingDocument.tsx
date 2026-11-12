import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { db, isDemo } from "./db";
import type { Json } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STAGES, type StageKey } from "@/config/site";
import { updateWorkingDocument } from "@/lib/ai.functions";
import { DOC_SECTIONS, demoDocProposal, mergeDoc, toDoc, type DocKey, type DocSource, type Edited } from "@/lib/working-doc";
import { Panel, fmtDate, selectCls } from "./ui";
import { cn } from "@/lib/utils";

type DocClient = { id: string; name: string; love_stage: string };

async function readDoc(clientId: string) {
  const { data } = await db.from("client_documents").select("*").eq("client_id", clientId).maybeSingle();
  return { doc: toDoc(data?.sections), edited: ((data?.edited ?? {}) as Edited), source: data?.last_source ?? null, at: data?.updated_at ?? null };
}

/** Updates a client's working document from new input. Sam's own edits are always kept. */
export function useDocUpdater() {
  const upd = useServerFn(updateWorkingDocument);
  const qc = useQueryClient();
  return async (c: DocClient, source: DocSource, input: string) => {
    const cur = await readDoc(c.id);
    const stage = STAGES[c.love_stage as StageKey]?.name ?? c.love_stage;
    let proposed;
    try {
      proposed = isDemo() ? demoDocProposal(cur.doc, input) : await upd({ data: { clientName: c.name, stage, doc: cur.doc, source, input } });
    } catch { toast.error("Couldn't update the working document this time. The note is saved."); return; }
    const next = mergeDoc(cur.doc, cur.edited, proposed);
    await db.from("client_documents").upsert({ client_id: c.id, sections: next as unknown as Json, edited: cur.edited as unknown as Json, last_source: source, updated_at: new Date().toISOString() });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
}

export function WorkingDocument({ client }: { client: DocClient }) {
  const qc = useQueryClient();
  const apply = useDocUpdater();
  const { data } = useQuery({ queryKey: ["admin", "doc", client.id], queryFn: () => readDoc(client.id) });
  const [editing, setEditing] = useState<Partial<Record<DocKey, string>>>({});
  const [paste, setPaste] = useState("");
  const [pasteKind, setPasteKind] = useState<"WhatsApp excerpt" | "email summary">("WhatsApp excerpt");
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const saveSection = async (k: DocKey) => {
    const doc = { ...data.doc, [k]: editing[k] ?? "" };
    const edited = { ...data.edited, [k]: true };
    await db.from("client_documents").upsert({ client_id: client.id, sections: doc as unknown as Json, edited: edited as unknown as Json, last_source: "Sam's edit", updated_at: new Date().toISOString() });
    setEditing((e) => { const n = { ...e }; delete n[k]; return n; });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const addPaste = async () => {
    if (!paste.trim()) return;
    setBusy(true);
    await db.from("client_events").insert({ client_id: client.id, kind: pasteKind === "WhatsApp excerpt" ? "whatsapp" : "email_in", summary: pasteKind === "WhatsApp excerpt" ? "WhatsApp excerpt added to the working document." : "Email summary added to the working document.", detail: paste.trim() });
    await apply(client, pasteKind, paste.trim());
    setPaste(""); setBusy(false);
    toast.success("Added. The working document is updated.");
  };

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl">Working document</h2>
        <p className="text-sm text-soft">Private to you. {data.source ? <>Last updated from <span className="font-semibold">{data.source}</span>, {fmtDate(data.at)}.</> : "Nothing yet."}</p>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Updates itself after each session summary, voice note, email summary or WhatsApp excerpt. Anything you edit stays; new points are added underneath.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {DOC_SECTIONS.map(([k, label]) => {
          const isEditing = editing[k] !== undefined;
          return (
            <div key={k} className={cn("rounded-[18px] bg-background p-4", k === "stage_why" && "md:col-span-2")}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold">{label}{data.edited[k] && <span className="ml-2 text-xs font-normal text-soft">edited by you</span>}</p>
                {!isEditing && <button type="button" className="text-sm underline" onClick={() => setEditing({ ...editing, [k]: data.doc[k] })}>Edit</button>}
              </div>
              {isEditing ? (
                <>
                  <Label htmlFor={`wd-${k}`} className="sr-only">{label}</Label>
                  <Textarea id={`wd-${k}`} rows={4} value={editing[k]} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} className="mt-2 rounded-[14px] bg-card" />
                  <div className="mt-2 flex gap-2"><Button size="sm" onClick={() => saveSection(k)}>Save</Button><Button size="sm" variant="outline" onClick={() => setEditing((e) => { const n = { ...e }; delete n[k]; return n; })}>Cancel</Button></div>
                </>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {data.doc[k].split("\n").filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}
                  {!data.doc[k].trim() && <li className="text-soft">Nothing yet.</li>}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-[18px] border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="wd-paste" className="font-bold">Paste a WhatsApp excerpt</Label>
          <select aria-label="What are you pasting?" value={pasteKind} onChange={(e) => setPasteKind(e.target.value as typeof pasteKind)} className={selectCls}>
            <option value="WhatsApp excerpt">WhatsApp excerpt</option>
            <option value="email summary">Email summary</option>
          </select>
        </div>
        <p className="mt-1 text-sm text-soft">WhatsApp can't be connected automatically, so copy and paste. Only paste what {client.name.split(" ")[0]} has agreed to share with you.</p>
        <Textarea id="wd-paste" rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} className="mt-3 rounded-[14px]" placeholder="Paste here" />
        <Button size="sm" className="mt-2" disabled={busy || !paste.trim()} onClick={addPaste}>{busy ? "Updating…" : "Add to timeline and document"}</Button>
      </div>
    </Panel>
  );
}
