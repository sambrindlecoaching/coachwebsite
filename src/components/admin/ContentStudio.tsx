import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminHeader, Panel, fmtDate, inputCls, selectCls } from "./ui";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { draftContentPiece } from "@/lib/ai.functions";
import { draftFor, formatSpec, formats, type Format } from "@/lib/content-drafts";
import { anonymise } from "@/lib/working-doc";
import { db, isDemo } from "./db";
import { MediaPicker } from "./MediaLibrary";

type Piece = {
  id: string; title: string; brief: string | null; door: string; signal: string | null; sources: { label: string; url: string }[];
  suggested_format: string | null; format: string | null; draft: string | null; my_take: string | null; photo_url: string | null;
  status: string; channel: string | null; scheduled_for: string | null; chapter_id: string | null; origin: string;
};
type Chapter = { id: string; number: number; title: string; status: string };
const ORIGINS = { trend: "Trend sources", own: "Your voice notes and articles", session_theme: "Session themes" } as const;

export function ContentStudio() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"inbox" | "calendar" | "book">("inbox");
  const [editing, setEditing] = useState<string | null>(null);
  const { data: pieces = [] } = useQuery({
    queryKey: ["admin", "content"],
    queryFn: async () => ((await db.from("content_pieces").select("*").order("created_at", { ascending: false })).data ?? []) as unknown as Piece[],
  });
  const { data: chapters = [] } = useQuery({
    queryKey: ["admin", "chapters"],
    queryFn: async () => ((await db.from("book_chapters").select("*").order("number", { ascending: true })).data ?? []) as Chapter[],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const piece = pieces.find((p) => p.id === editing);

  return (
    <>
      <AdminHeader title="Content Studio">
        <div role="tablist" className="flex gap-1 rounded-full bg-card p-1">
          {(["inbox", "calendar", "book"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => { setTab(t); setEditing(null); }}
              className={cn("rounded-full px-4 py-2 text-sm font-semibold capitalize", tab === t ? "bg-ink text-ink-foreground" : "text-muted-foreground")}>
              {t === "inbox" ? "Idea inbox" : t}
            </button>
          ))}
        </div>
      </AdminHeader>
      {piece ? (
        <Editor piece={piece} pieces={pieces} chapters={chapters} onClose={() => setEditing(null)} onSaved={refresh} />
      ) : tab === "inbox" ? (
        <Inbox pieces={pieces} onOpen={setEditing} onSaved={refresh} />
      ) : tab === "calendar" ? (
        <Calendar pieces={pieces} onOpen={setEditing} />
      ) : (
        <Book chapters={chapters} pieces={pieces} onSaved={refresh} />
      )}
    </>
  );
}

function Inbox({ pieces, onOpen, onSaved }: { pieces: Piece[]; onOpen: (id: string) => void; onSaved: () => void }) {
  const [origin, setOrigin] = useState<keyof typeof ORIGINS | "all">("all");
  const ideas = pieces.filter((p) => p.status === "idea" && (origin === "all" || p.origin === origin));
  const working = pieces.filter((p) => p.status === "drafting" || p.status === "approved");
  const fromSessions = async () => {
    const [{ data: sums }, { data: cls }] = await Promise.all([db.from("session_summaries").select("themes"), db.from("clients").select("name")]);
    const names = (cls ?? []).map((c) => c.name);
    const count = new Map<string, number>();
    for (const s of sums ?? []) for (const l of (s.themes ?? "").split("\n").map((x) => x.trim()).filter(Boolean)) { const k = anonymise(l, names); count.set(k, (count.get(k) ?? 0) + 1); }
    const existing = new Set(pieces.map((p) => p.title.toLowerCase()));
    const fresh = [...count.entries()].sort((x, y) => y[1] - x[1]).filter(([t]) => !existing.has(t.toLowerCase())).slice(0, 3);
    if (!fresh.length) { toast("No new recurring themes yet."); return; }
    await db.from("content_pieces").insert(fresh.map(([t, n]) => ({ title: t, brief: `A theme that keeps coming up in sessions.\nAnonymised: no names or identifying details.\nWorth a piece if it rings true more widely.`, door: "divorce", signal: `Recurring session theme · ${n} session${n > 1 ? "s" : ""}`, origin: "session_theme", suggested_format: "voice_note", status: "idea" })));
    toast.success(`${fresh.length} theme${fresh.length > 1 ? "s" : ""} added as ideas.`); onSaved();
  };
  return (
    <>
      <p className="mb-3 max-w-2xl text-muted-foreground">Ideas come from trend sources (psychology articles, news, podcasts, search trends, community questions), your own voice notes and articles, and recurring themes from sessions. [Demo signals until a trend feed is connected.] Nothing publishes without your approval.</p>
      <p className="mb-6 max-w-2xl rounded-[16px] bg-card p-4 text-sm"><span className="font-semibold">Session themes are always anonymised.</span> Themes only: never a client's name or anything that could identify them. Check before you approve.</p>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(["all", ...Object.keys(ORIGINS)] as const).map((o) => (
          <button key={o} type="button" aria-pressed={origin === o} onClick={() => setOrigin(o as typeof origin)} className={cn("rounded-full px-3 py-1 text-sm font-semibold", origin === o ? "bg-ink text-ink-foreground" : "bg-card")}>
            {o === "all" ? "All sources" : ORIGINS[o as keyof typeof ORIGINS]}
          </button>
        ))}
        <Button size="sm" variant="outline" onClick={fromSessions}>Find recurring session themes</Button>
      </div>
      {working.length > 0 && (
        <>
          <h2 className="mb-3 text-xl">In progress</h2>
          <div className="mb-8 grid gap-3 md:grid-cols-2">{working.map((p) => <IdeaCard key={p.id} p={p} onOpen={onOpen} />)}</div>
        </>
      )}
      <h2 className="mb-3 text-xl">New ideas</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ideas.map((p) => <IdeaCard key={p.id} p={p} onOpen={onOpen} />)}</div>
    </>
  );
}

function IdeaCard({ p, onOpen }: { p: Piece; onOpen: (id: string) => void }) {
  const sf = formats[(p.format ?? p.suggested_format) as Format];
  return (
    <Panel className="flex flex-col">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-background px-3 py-1 capitalize">{p.door}</span>
        {p.origin !== "trend" && <span className="rounded-full bg-background px-3 py-1">{ORIGINS[p.origin as keyof typeof ORIGINS] ?? p.origin}</span>}
        {sf && <span className="rounded-full border border-border px-3 py-1">{p.format ? sf.label : `Suggested: ${sf.label}`}</span>}
        {p.status !== "idea" && <span className="rounded-full bg-marigold px-3 py-1 text-marigold-foreground capitalize">{p.status}</span>}
      </div>
      <h3 className="mt-4 text-xl font-bold leading-snug">{p.title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">{(p.brief ?? "").split("\n").map((l) => <li key={l}>{l}</li>)}</ul>
      {p.signal && <p className="mt-4 text-xs font-semibold text-soft">{p.signal}</p>}
      {p.sources.length > 0 && (
        <p className="mt-1 text-xs">{p.sources.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="mr-3 underline">{s.label}</a>)}</p>
      )}
      <Button className="mt-5 self-start" size="sm" onClick={() => onOpen(p.id)}>{p.status === "idea" ? "Work on this" : "Open"}</Button>
    </Panel>
  );
}

function Editor({ piece, pieces, chapters, onClose, onSaved }: { piece: Piece; pieces: Piece[]; chapters: Chapter[]; onClose: () => void; onSaved: () => void }) {
  const aiDraft = useServerFn(draftContentPiece);
  const [drafting, setDrafting] = useState(false);
  const published = pieces.filter((p) => p.status === "published" || p.status === "scheduled").filter((p) => p.id !== piece.id).map((p) => ({ title: p.title, channel: p.channel }));
  const [f, setF] = useState({
    format: (piece.format ?? piece.suggested_format ?? "voice_note") as Format,
    title: piece.title, draft: piece.draft ?? "", my_take: piece.my_take ?? "", photo_url: piece.photo_url ?? "",
    scheduled_for: piece.scheduled_for ?? "", chapter_id: piece.chapter_id ?? "",
  });
  const draft = f.draft || draftFor(piece, f.format, published);
  const generate = async () => {
    if (isDemo()) { setF({ ...f, draft: draftFor(piece, f.format, published) }); toast("Demo: a template draft, not AI."); return; }
    setDrafting(true);
    try { const r = await aiDraft({ data: { format: formats[f.format].label, spec: formatSpec[f.format], title: f.title, brief: piece.brief ?? "", published: published.map((p) => p.title) } }); setF({ ...f, draft: r.draft }); }
    catch { toast.error("Couldn't draft that. The template is still there to edit."); }
    setDrafting(false);
  };
  const save = async (status: string) => {
    if ((status === "scheduled" || status === "published") && !["approved", "scheduled"].includes(piece.status)) {
      toast.error("Approve it first. Nothing goes out without your say-so."); return;
    }
    if (status === "scheduled" && !f.scheduled_for) { toast.error("Pick a date to schedule it."); return; }
    await db.from("content_pieces").update({
      format: f.format, title: f.title, draft, my_take: f.my_take || null, photo_url: f.photo_url || null,
      scheduled_for: f.scheduled_for || null, chapter_id: f.chapter_id || null, channel: formats[f.format].channel, status,
    }).eq("id", piece.id);
    toast.success(status === "published" ? "Marked as published. [Connect the channel to publish automatically.]" : `Saved as ${status}.`);
    onSaved();
    if (status !== "drafting" && status !== "approved") onClose();
  };
  const approved = piece.status === "approved" || piece.status === "scheduled";
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Panel>
        <button type="button" onClick={onClose} className="text-sm font-semibold underline">Back</button>
        <div role="radiogroup" aria-label="Format" className="mt-5 flex flex-wrap gap-2">
          {(Object.keys(formats) as Format[]).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={f.format === k} onClick={() => setF({ ...f, format: k, draft: "" })}
              className={cn("rounded-full border px-4 py-2 text-sm font-semibold", f.format === k ? "border-ink bg-ink text-ink-foreground" : "border-border")}>
              {formats[k].label}
            </button>
          ))}
        </div>
        <Label htmlFor="cs-title" className="mt-6 block">Title</Label>
        <Input id="cs-title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={cn(inputCls, "mt-2")} />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor="cs-draft">Draft · {formats[f.format].label}</Label>
          <Button size="sm" variant="outline" onClick={generate} disabled={drafting}>{drafting ? "Drafting…" : "Draft this format for me"}</Button>
        </div>
        <p className="mt-1 text-xs text-soft">{formatSpec[f.format]}</p>
        <Textarea id="cs-draft" rows={14} value={draft} onChange={(e) => setF({ ...f, draft: e.target.value })} className="mt-2 rounded-[18px] font-mono text-sm" />
        <Label htmlFor="cs-take" className="mt-5 block">My take</Label>
        <Textarea id="cs-take" rows={3} placeholder="What do you actually think about this?" value={f.my_take} onChange={(e) => setF({ ...f, my_take: e.target.value })} className="mt-2 rounded-[18px]" />
      </Panel>
      <div className="grid content-start gap-4">
        <Panel>
          <p className="mb-2 text-sm font-semibold">Photo</p>
          <MediaPicker value={f.photo_url} usage={`Content: ${f.title}`} onPick={(m) => setF({ ...f, photo_url: m.url })} />
          {f.photo_url && <img src={f.photo_url} alt="" className="mt-3 aspect-video w-full rounded-[16px] object-cover" />}
          {f.format === "book_chapter" && (
            <>
              <Label htmlFor="cs-ch" className="mt-4 block">Link to chapter</Label>
              <select id="cs-ch" value={f.chapter_id} onChange={(e) => setF({ ...f, chapter_id: e.target.value })} className={cn(selectCls, "mt-2 w-full")}>
                <option value="">None</option>
                {chapters.map((c) => <option key={c.id} value={c.id}>{c.number}. {c.title}</option>)}
              </select>
            </>
          )}
        </Panel>
        <Panel>
          <p className="text-sm font-semibold">Status: <span className="capitalize">{piece.status}</span></p>
          <div className="mt-4 grid gap-2">
            <Button variant="outline" onClick={() => save("drafting")}>Save draft</Button>
            <Button onClick={() => save("approved")}>Approve</Button>
            <Label htmlFor="cs-date" className="mt-2">Schedule for</Label>
            <Input id="cs-date" type="date" value={f.scheduled_for} onChange={(e) => setF({ ...f, scheduled_for: e.target.value })} className={inputCls} />
            <Button variant="marigold" disabled={!approved} onClick={() => save("scheduled")}>Schedule</Button>
            <Button variant="outline" disabled={!approved} onClick={() => save("published")}>Mark published</Button>
            {!approved && <p className="text-xs text-soft">Approve first to schedule or publish.</p>}
            <button type="button" className="mt-2 text-sm underline" onClick={() => save("dismissed")}>Not for me</button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Calendar({ pieces, onOpen }: { pieces: Piece[]; onOpen: (id: string) => void }) {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const key = (d: number) => `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const scheduled = pieces.filter((p) => p.scheduled_for && (p.status === "scheduled" || p.status === "published"));
  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">{first.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setOffset(offset - 1)}>Previous</Button>
          <Button size="sm" variant="outline" onClick={() => setOffset(offset + 1)}>Next</Button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-[16px] bg-border text-sm">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="bg-card p-2 text-xs font-semibold text-soft">{d}</div>)}
        {Array.from({ length: lead }).map((_, i) => <div key={`x${i}`} className="bg-background" />)}
        {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
          <div key={d} className="min-h-24 bg-card p-2">
            <span className="text-xs tabular-nums text-soft">{d}</span>
            {scheduled.filter((p) => p.scheduled_for === key(d)).map((p) => (
              <button key={p.id} type="button" onClick={() => onOpen(p.id)} className="mt-1 block w-full truncate rounded-[8px] bg-ink px-2 py-1 text-left text-xs font-semibold text-ink-foreground">
                {p.channel}: {p.title}
              </button>
            ))}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-soft">Scheduled pieces, by channel. Nothing publishes itself yet. [Connect channels]</p>
    </Panel>
  );
}

function Book({ chapters, pieces, onSaved }: { chapters: Chapter[]; pieces: Piece[]; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const statuses = ["idea", "outline", "drafting", "done"];
  const add = async () => {
    if (!title.trim()) return;
    await db.from("book_chapters").insert({ title: title.trim(), number: chapters.length + 1, status: "idea" });
    setTitle(""); onSaved();
  };
  const candidates = pieces.filter((p) => p.suggested_format === "book_chapter" || p.format === "book_chapter");
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <Panel>
        <h2 className="text-2xl">The book <span className="text-soft">[working title TBC]</span></h2>
        <ol className="mt-5 divide-y divide-border">
          {chapters.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 py-3">
              <span className="w-6 text-sm tabular-nums text-soft">{c.number}</span>
              <span className="flex-1 font-semibold">{c.title}
                <span className="block text-xs font-normal text-soft">{pieces.filter((p) => p.chapter_id === c.id).length} linked pieces</span>
              </span>
              <select aria-label={`Status of ${c.title}`} value={c.status} onChange={async (e) => { await db.from("book_chapters").update({ status: e.target.value }).eq("id", c.id); onSaved(); }} className={selectCls}>
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex gap-2">
          <Input aria-label="New chapter" placeholder="New chapter title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          <Button onClick={add}>Add</Button>
        </div>
      </Panel>
      <Panel>
        <h3 className="text-lg">Could become chapters</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {candidates.map((p) => <li key={p.id}>{p.title}{p.scheduled_for && <span className="text-soft"> · {fmtDate(p.scheduled_for)}</span>}</li>)}
          {!candidates.length && <li className="text-soft">None yet.</li>}
        </ul>
      </Panel>
    </div>
  );
}
