import { isSampleVoice, SAMPLE_VOICE_LABEL } from "@/content/sample-audio";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db as supabase } from "./db";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { STAGES } from "@/config/site";
import { formatDuration } from "@/lib/voice-notes";
import { AdminHeader, Panel, selectCls } from "./ui";

type Note = Tables<"voice_notes">;

async function uploadAudio(file: File): Promise<{ url: string; duration: number }> {
  const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-").toLowerCase()}`;
  const { error } = await supabase.storage.from("voice-notes").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const url = supabase.storage.from("voice-notes").getPublicUrl(path).data.publicUrl;
  const duration = await new Promise<number>((res) => {
    const a = new Audio(URL.createObjectURL(file));
    a.onloadedmetadata = () => res(Math.round(a.duration) || 0);
    a.onerror = () => res(0);
  });
  return { url, duration };
}

export function VoiceNotesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const { data: notes = [] } = useQuery({
    queryKey: ["admin", "voice_notes"],
    queryFn: async () => (await supabase.from("voice_notes").select("*").order("sort_order")).data ?? [],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "voice_notes"] }).then(() => qc.invalidateQueries({ queryKey: ["voice_notes"] }));

  const patch = async (id: string, p: Partial<Note>) => {
    const { error } = await supabase.from("voice_notes").update(p).eq("id", id);
    if (error) toast.error(error.message);
    refresh();
  };

  const move = async (i: number, dir: -1 | 1) => {
    const a = notes[i], b = notes[i + dir];
    if (!a || !b) return;
    await Promise.all([patch(a.id, { sort_order: b.sort_order }), patch(b.id, { sort_order: a.sort_order })]);
  };

  return (
    <>
      <AdminHeader title="Voice notes">
        <Button onClick={() => setEditing({ stage: "L", is_free: false, published: false, sort_order: (notes.at(-1)?.sort_order ?? 0) + 1 })}>New voice note</Button>
      </AdminHeader>
      {editing && <Editor note={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
      <ul className="grid gap-2">
        {notes.map((n, i) => (
          <li key={n.id}>
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
              <div className="flex flex-col">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="px-2 text-soft disabled:opacity-30">▲</button>
                <button type="button" aria-label="Move down" disabled={i === notes.length - 1} onClick={() => move(i, 1)} className="px-2 text-soft disabled:opacity-30">▼</button>
              </div>
              <span className="flex size-8 items-center justify-center rounded-full bg-ink text-sm font-bold text-marigold">{n.stage}</span>
              <span className="min-w-48 flex-1">
                <span className="font-semibold">{n.title}</span>
                <span className="block text-sm text-soft">{formatDuration(n.duration_seconds)}{n.audio_url ? "" : " · no audio"}</span>
                {isSampleVoice(n.audio_url) && <span className="block text-xs text-soft">{SAMPLE_VOICE_LABEL}</span>}
              </span>
              <label className="flex items-center gap-2 text-sm">Free <Switch checked={n.is_free} onCheckedChange={(v) => patch(n.id, { is_free: v })} /></label>
              <label className="flex items-center gap-2 text-sm">Published <Switch checked={n.published} onCheckedChange={(v) => patch(n.id, { published: v })} /></label>
              <Button variant="outline" size="sm" onClick={() => setEditing(n)}>Edit</Button>
            </Panel>
          </li>
        ))}
      </ul>
    </>
  );
}

function Editor({ note, onClose, onSaved }: { note: Partial<Note>; onClose: () => void; onSaved: () => void }) {
  const [n, setN] = useState(note);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!n.title) { toast.error("Needs a title"); return; }
    setBusy(true);
    try {
      const data = { ...n } as Partial<Note>;
      if (file) {
        const up = await uploadAudio(file);
        data.audio_url = up.url;
        data.duration_seconds = up.duration;
      }
      const row = {
        title: data.title!, situation: data.situation ?? null, stage: data.stage ?? "L",
        audio_url: data.audio_url ?? null, duration_seconds: data.duration_seconds ?? 0,
        is_free: !!data.is_free, published: !!data.published, sort_order: data.sort_order ?? 0,
      };
      const { error } = n.id ? await supabase.from("voice_notes").update(row).eq("id", n.id) : await supabase.from("voice_notes").insert(row);
      if (error) throw error;
      toast.success("Saved");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="mb-4 grid gap-4 md:grid-cols-2">
      <div className="grid gap-1.5 md:col-span-2">
        <Label htmlFor="vn-title">Title</Label>
        <Input id="vn-title" value={n.title ?? ""} onChange={(e) => setN({ ...n, title: e.target.value })} className="h-10 rounded-full" />
      </div>
      <div className="grid gap-1.5 md:col-span-2">
        <Label htmlFor="vn-sit">Situation</Label>
        <Textarea id="vn-sit" value={n.situation ?? ""} onChange={(e) => setN({ ...n, situation: e.target.value })} className="rounded-2xl" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="vn-stage">LOVE stage</Label>
        <select id="vn-stage" className={selectCls} value={n.stage} onChange={(e) => setN({ ...n, stage: e.target.value })}>
          {Object.values(STAGES).map((s) => <option key={s.letter} value={s.letter}>{s.letter} · {s.name}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="vn-file">Audio file {n.audio_url && <span className="font-normal text-soft">(replaces current)</span>}</Label>
        <input id="vn-file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm">Free <Switch checked={!!n.is_free} onCheckedChange={(v) => setN({ ...n, is_free: v })} /></label>
        <label className="flex items-center gap-2 text-sm">Published <Switch checked={!!n.published} onCheckedChange={(v) => setN({ ...n, published: v })} /></label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="marigold" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
      </div>
    </Panel>
  );
}
