import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db, isDemo } from "./db";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminHeader, Panel, inputCls } from "./ui";
import { cn } from "@/lib/utils";

type Media = Tables<"media">;
export const SUGGESTED_TAGS = ["portrait", "outdoors", "kids-from-behind", "Maresme", "workspace", "beach", "detail"];
const DRIVE_FOLDER = "Web Sam";

const mediaQuery = { queryKey: ["admin", "media"], queryFn: async () => ((await db.from("media").select("*").order("created_at", { ascending: false })).data ?? []) as Media[] };

/** Records where a photo is used so the library can show it. */
export async function markUsed(url: string, usage: string) {
  const { data } = await db.from("media").select("*").eq("url", url).maybeSingle();
  if (data && !data.used_in.includes(usage)) await db.from("media").update({ used_in: [...data.used_in, usage] }).eq("id", data.id);
}

export function MediaLibrary() {
  const qc = useQueryClient();
  const { data: items = [] } = useQuery(mediaQuery);
  const [tag, setTag] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "media"] });
  const tags = [...new Set([...SUGGESTED_TAGS, ...items.flatMap((i) => i.tags)])];
  const shown = tag ? items.filter((i) => i.tags.includes(tag)) : items;

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} isn't an image.`); continue; }
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} is over 10MB.`); continue; }
      let url: string, path: string | null = null;
      if (isDemo()) url = URL.createObjectURL(file);
      else {
        path = `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "-")}`;
        const { error } = await db.storage.from("media").upload(path, file, { contentType: file.type });
        if (error) { toast.error(error.message); continue; }
        url = db.storage.from("media").getPublicUrl(path).data.publicUrl;
      }
      await db.from("media").insert({ url, storage_path: path, alt: "", tags: [], used_in: [], source: "upload" });
    }
    setBusy(false); refresh();
    toast.success(isDemo() ? "Added for this demo only." : "Uploaded. Add alt text and tags.");
  };

  return (
    <>
      <AdminHeader title="Photos" />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
            <button type="button" aria-pressed={!tag} onClick={() => setTag(null)} className={cn("rounded-full px-3 py-1 text-sm font-semibold", !tag ? "bg-ink text-ink-foreground" : "bg-card")}>All ({items.length})</button>
            {tags.map((t) => <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className={cn("rounded-full px-3 py-1 text-sm font-semibold", tag === t ? "bg-ink text-ink-foreground" : "bg-card")}>{t}</button>)}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((m) => <MediaCard key={m.id} m={m} onChange={refresh} />)}
            {!shown.length && <p className="text-soft">No photos with that tag yet.</p>}
          </div>
        </div>
        <div className="grid content-start gap-4">
          <Panel>
            <h2 className="text-xl">Upload</h2>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG or WebP, up to 10MB each.</p>
            <Label htmlFor="media-up" className="sr-only">Upload photos</Label>
            <Input id="media-up" type="file" accept="image/*" multiple disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} className="mt-3 rounded-full" />
          </Panel>
          <Panel>
            <h2 className="text-xl">Import from Google Drive</h2>
            <p className="mt-1 text-sm text-muted-foreground">The plan: drop photos into the Drive folder "{DRIVE_FOLDER}" and they appear here, ready for tags and alt text.</p>
            <Button variant="outline" className="mt-3" onClick={() => toast("[Connect Google Drive] Not connected yet. Use Upload for now.")}>[Connect Google Drive]</Button>
          </Panel>
        </div>
      </div>
    </>
  );
}

function MediaCard({ m, onChange }: { m: Media; onChange: () => void }) {
  const [alt, setAlt] = useState(m.alt);
  const [newTag, setNewTag] = useState("");
  const save = async (patch: Partial<Media>) => { await db.from("media").update(patch).eq("id", m.id); onChange(); };
  return (
    <Panel className="p-3">
      <img src={m.url} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full rounded-[16px] object-cover" />
      <div className="mt-3 grid gap-2 px-1">
        <Label htmlFor={`alt-${m.id}`} className="text-xs">Alt text</Label>
        <Input id={`alt-${m.id}`} value={alt} placeholder="Describe the photo" onChange={(e) => setAlt(e.target.value)} onBlur={() => alt !== m.alt && save({ alt })} className={inputCls} />
        {!m.alt && <p className="text-xs font-semibold">Needs alt text before it goes on the site.</p>}
        <ul className="flex flex-wrap gap-1" aria-label="Tags">
          {m.tags.map((t) => (
            <li key={t}><button type="button" title="Remove tag" onClick={() => save({ tags: m.tags.filter((x) => x !== t) })} className="rounded-full bg-background px-2 py-0.5 text-xs">{t} ×</button></li>
          ))}
        </ul>
        <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); const t = newTag.trim(); if (t && !m.tags.includes(t)) save({ tags: [...m.tags, t] }); setNewTag(""); }}>
          <Input aria-label="Add tag" list="media-tags" placeholder="Add tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} className="h-8 rounded-full text-xs" />
          <datalist id="media-tags">{SUGGESTED_TAGS.map((t) => <option key={t} value={t} />)}</datalist>
          <Button size="sm" type="submit" variant="outline">Add</Button>
        </form>
        <p className="text-xs text-soft">Used in: {m.used_in.length ? m.used_in.join(", ") : "nowhere yet"}</p>
        {m.source !== "site" && (
          <button type="button" className="justify-self-start text-xs underline" onClick={async () => {
            if (m.used_in.length && !confirm("This photo is in use. Remove it anyway?")) return;
            if (m.storage_path && !isDemo()) await db.storage.from("media").remove([m.storage_path]);
            await db.from("media").delete().eq("id", m.id); onChange();
          }}>Remove</button>
        )}
      </div>
    </Panel>
  );
}

/** Button that opens the library and returns the chosen photo. */
export function MediaPicker({ value, usage, onPick, label = "Choose from Photos" }: { value: string; usage: string; onPick: (m: { url: string; alt: string }) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useQuery({ ...mediaQuery, enabled: open });
  return (
    <>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="" className="size-14 rounded-[12px] object-cover" />}
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>{label}</Button>
        {value && <button type="button" className="text-xs underline" onClick={() => onPick({ url: "", alt: "" })}>Clear</button>}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-[24px] sm:max-w-2xl">
          <DialogHeader><DialogTitle>Choose a photo</DialogTitle><DialogDescription>From your Photos library. Add new ones in Photos.</DialogDescription></DialogHeader>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={async () => { await markUsed(m.url, usage); onPick({ url: m.url, alt: m.alt }); setOpen(false); }}
                  className={cn("block w-full rounded-[16px] text-left ring-offset-2 focus-visible:ring-2", value === m.url && "ring-2 ring-ink")}>
                  <img src={m.url} alt={m.alt} className="aspect-square w-full rounded-[16px] object-cover" />
                  <span className="mt-1 block truncate text-xs text-soft">{m.tags.join(", ") || "untagged"}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
