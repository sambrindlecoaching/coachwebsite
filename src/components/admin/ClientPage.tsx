import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { db, isDemo } from "./db";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { STAGES, site, type StageKey } from "@/config/site";
import { draftProgressLetter, summariseSession, transcribeRecording } from "@/lib/ai.functions";
import { WorkingDocument, useDocUpdater } from "./WorkingDocument";
import { clampRecap, demoProgressLetter, toDoc } from "@/lib/working-doc";
import { Panel, fmtDate, inputCls } from "./ui";
import { ClientDetail } from "./Clients";
import { cn } from "@/lib/utils";

type Client = Tables<"clients"> & { sessions: Tables<"sessions">[]; payments: Tables<"payments">[] };
type Summary = Tables<"session_summaries">;
const stageKeys = Object.keys(STAGES) as StageKey[];

export function ClientPage({ clientId, onBack }: { clientId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const { data: c } = useQuery({
    queryKey: ["admin", "client", clientId],
    queryFn: async () => (await db.from("clients").select("*, sessions(*), payments(*)").eq("id", clientId).single()).data as Client | null,
  });
  const q = <T,>(table: "client_events" | "session_summaries" | "tasks" | "milestones" | "progress_letters", order: string) => ({
    queryKey: ["admin", table, clientId],
    queryFn: async () => ((await db.from(table).select("*").eq("client_id", clientId).order(order, { ascending: false })).data ?? []) as T[],
  });
  const { data: events = [] } = useQuery(q<Tables<"client_events">>("client_events", "occurred_at"));
  const { data: summaries = [] } = useQuery(q<Summary>("session_summaries", "created_at"));
  const { data: tasks = [] } = useQuery(q<Tables<"tasks">>("tasks", "created_at"));
  const { data: ms = [] } = useQuery(q<Tables<"milestones">>("milestones", "created_at"));
  const { data: letters = [] } = useQuery(q<Tables<"progress_letters">>("progress_letters", "created_at"));
  const draftLetter = useServerFn(draftProgressLetter);
  const [lettering, setLettering] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [newTask, setNewTask] = useState("");
  const [newMs, setNewMs] = useState("");

  if (!c) return <p className="text-muted-foreground">Loading…</p>;
  const done = c.sessions.filter((s) => s.done).length;
  const paid = c.payments.filter((p) => p.paid).length;
  const stageIdx = stageKeys.indexOf(c.love_stage as StageKey);

  const update = async (patch: Partial<Tables<"clients">>) => { await db.from("clients").update(patch).eq("id", c.id); refresh(); };

  const timeline = [
    ...c.sessions.filter((s) => s.done).map((s) => ({ at: s.session_date ?? c.start_date ?? c.created_at, kind: "Session", text: `Session ${s.session_number} done`, link: null as string | null })),
    ...c.payments.filter((p) => p.paid).map((p) => ({ at: p.created_at, kind: "Payment", text: `Month ${p.month_number} paid, €${p.amount}`, link: null })),
    ...events.map((e) => ({ at: e.occurred_at, kind: ({ email_in: "Email in", email_out: "Email out", resource: "Shared", voice_note: "Your voice note", whatsapp: "WhatsApp" } as Record<string, string>)[e.kind] ?? e.kind, text: e.summary, link: e.kind.startsWith("email") ? e.link : null, detail: e.detail })),
    ...summaries.map((s) => ({ at: s.created_at, kind: "Summary", text: `Session ${s.session_number ?? ""} summary written`, link: null })),
    ...letters.map((l) => ({ at: l.created_at, kind: "Progress letter", text: `End of ${STAGES[l.stage as StageKey]?.name ?? l.stage} (${l.status})`, link: null })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="grid gap-5">
      <button type="button" onClick={onBack} className="justify-self-start text-sm font-semibold underline">All clients</button>
      <Panel className="grid gap-6 md:grid-cols-[1.4fr_repeat(4,1fr)] md:items-end">
        <div>
          <h1 className="text-4xl">{c.name}</h1>
          <p className="mt-1 text-muted-foreground">{c.programme} · started {fmtDate(c.start_date)}</p>
        </div>
        <Fact label="Sessions" value={`${done} of ${site.programme.sessions}`} />
        <Fact label="Next session" value={fmtDate(c.next_session)} />
        <Fact label="Payments" value={`${paid} of ${c.payments.length || site.programme.months} paid`} />
        <Fact label="Status" value={paid >= Math.min(c.payments.length, Math.ceil((done + 1) / 2)) ? "Up to date" : "Payment due"} />
        <ul className="flex flex-wrap gap-2 md:col-span-5" aria-label="Payments by month">
          {[...c.payments].sort((a, b) => a.month_number - b.month_number).map((p) => (
            <li key={p.id}>
              <button type="button" onClick={async () => { await db.from("payments").update({ paid: !p.paid }).eq("id", p.id); refresh(); }}
                className={cn("rounded-full px-3 py-1 text-xs font-semibold", p.paid ? "bg-ink text-ink-foreground" : "border border-border text-soft")}>
                Month {p.month_number} · {p.paid ? "paid" : "due"}
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <h2 className="text-2xl">LOVE progress</h2>
        <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="LOVE stage">
          {stageKeys.map((k, i) => (
            <li key={k}>
              <button type="button" onClick={() => update({ love_stage: k })} aria-current={i === stageIdx ? "step" : undefined} className="w-full text-left">
                <span className={cn("block h-2 rounded-full", i <= stageIdx ? "bg-ink" : "bg-muted", i === stageIdx && "bg-marigold")} />
                <span className={cn("mt-3 block text-sm", i === stageIdx ? "font-bold" : "text-soft")}>{STAGES[k].letter} · {STAGES[k].name}</span>
              </button>
              {letters.filter((l) => l.stage === k).map((l) => (
                <span key={l.id} className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold", l.status === "approved" ? "bg-ink text-ink-foreground" : "border border-border")}>Letter · {l.status}</span>
              ))}
            </li>
          ))}
        </ol>
        <Label htmlFor="cp-notes" className="mt-6 block">What's improving</Label>
        <Textarea id="cp-notes" rows={3} value={notes ?? c.progress_notes ?? ""} onChange={(e) => setNotes(e.target.value)} className="mt-2 rounded-[18px]" />
        {notes !== null && <Button size="sm" className="mt-2" onClick={async () => { await update({ progress_notes: notes }); setNotes(null); }}>Save notes</Button>}
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-lg">Progress letters</h3>
          <p className="text-sm text-muted-foreground">At the end of each stage: where you started, what's changed, what's next. Drafted from the working document; you edit and approve.</p>
          {stageIdx >= 0 && !letters.some((l) => l.stage === c.love_stage) && (
            <Button size="sm" variant="outline" className="mt-3" disabled={lettering} onClick={async () => {
              setLettering(true);
              try {
                const { data: d } = await db.from("client_documents").select("sections").eq("client_id", c.id).maybeSingle();
                const doc = toDoc(d?.sections);
                const first = c.name.split(" ")[0] ?? c.name;
                const stage = STAGES[c.love_stage as StageKey].name;
                const nextKey = stageKeys[stageIdx + 1];
                const next = nextKey ? STAGES[nextKey].name : "";
                const draft = isDemo() ? demoProgressLetter(first, stage, next || null, doc) : (await draftLetter({ data: { clientName: first, stage, nextStage: next, doc } })).letter;
                await db.from("progress_letters").insert({ client_id: c.id, stage: c.love_stage, draft, status: "draft" });
                refresh();
              } catch { toast.error("Couldn't draft the letter. Try again in a moment."); }
              setLettering(false);
            }}>{lettering ? "Drafting…" : `Draft the end-of-stage letter for ${STAGES[c.love_stage as StageKey].name}`}</Button>
          )}
          <div className="mt-4 grid gap-4">{letters.map((l) => <LetterCard key={l.id} l={l} email={c.email} onChange={refresh} />)}</div>
        </div>
      </Panel>

      <WorkingDocument client={c} />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Panel>
          <h2 className="text-2xl">Timeline</h2>
          <ol className="mt-5 grid gap-3">
            {timeline.map((t, i) => (
              <li key={i} className="grid grid-cols-[90px_1fr] gap-3 border-t border-border pt-3 text-sm">
                <span className="text-soft">{fmtDate(t.at)}</span>
                <span><span className="font-semibold">{t.kind}.</span> {t.text}{t.link && <> · <a href={t.link} target="_blank" rel="noreferrer" className="underline">Open in Gmail</a></>}
                  {typeof (t as { detail?: unknown }).detail === "string" && <details className="mt-1"><summary className="cursor-pointer text-xs text-soft">Show transcript</summary><p className="mt-1 whitespace-pre-line text-muted-foreground">{String((t as { detail?: unknown }).detail)}</p></details>}</span>
              </li>
            ))}
            {!timeline.length && <li className="text-soft">Nothing yet.</li>}
          </ol>
        </Panel>
        <div className="grid content-start gap-5">
          <Panel>
            <h2 className="text-xl">Milestones</h2>
            <ul className="mt-3 grid gap-2">
              {ms.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={m.done} aria-label={m.title} onChange={async () => { await db.from("milestones").update({ done: !m.done }).eq("id", m.id); refresh(); }} className="size-4 accent-[var(--ink)]" />
                  <span className={cn(m.done && "line-through text-soft")}>{m.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Input aria-label="New milestone" placeholder="New milestone" value={newMs} onChange={(e) => setNewMs(e.target.value)} className={inputCls} />
              <Button size="sm" onClick={async () => { if (!newMs.trim()) return; await db.from("milestones").insert({ title: newMs.trim(), client_id: c.id }); setNewMs(""); refresh(); }}>Add</Button>
            </div>
          </Panel>
          <Panel>
            <h2 className="text-xl">Tasks</h2>
            <ul className="mt-3 grid gap-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.done} aria-label={t.title} onChange={async () => { await db.from("tasks").update({ done: !t.done }).eq("id", t.id); refresh(); }} className="size-4 accent-[var(--ink)]" />
                  <span className={cn("flex-1", t.done && "line-through text-soft")}>{t.title}</span>
                  <span className="text-xs text-soft">{t.due_date ? fmtDate(t.due_date) : ""}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Input aria-label="New task" placeholder="New task" value={newTask} onChange={(e) => setNewTask(e.target.value)} className={inputCls} />
              <Button size="sm" onClick={async () => { if (!newTask.trim()) return; await db.from("tasks").insert({ title: newTask.trim(), client_id: c.id, source: "client" }); setNewTask(""); refresh(); }}>Add</Button>
            </div>
          </Panel>
        </div>
      </div>

      <Panel><h2 className="text-2xl">Sessions and payments</h2><ClientDetail c={c} refresh={refresh} /></Panel>

      <Summaries client={c} summaries={summaries} onChange={refresh} onRecap={(v) => update({ recap_enabled: v })} onConsent={(v) => update({ recording_consent: v, recording_consent_at: v ? new Date().toISOString() : null })} />
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-soft">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></div>;
}

const toB64 = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] ?? ""); r.readAsDataURL(b); });

function LetterCard({ l, email, onChange }: { l: Tables<"progress_letters">; email: string | null; onChange: () => void }) {
  const [draft, setDraft] = useState(l.draft);
  return (
    <article className="rounded-[18px] border border-border p-4">
      <Label htmlFor={`pl-${l.id}`} className="font-bold">End of {STAGES[l.stage as StageKey]?.name ?? l.stage} <span className="font-normal text-soft">({l.status})</span></Label>
      <Textarea id={`pl-${l.id}`} rows={8} value={draft} onChange={(e) => setDraft(e.target.value)} className="mt-2 rounded-[14px]" />
      <Button size="sm" variant="marigold" className="mt-2" disabled={l.status === "approved" && draft === l.draft} onClick={async () => {
        await db.from("progress_letters").update({ draft, status: "approved" }).eq("id", l.id);
        toast.success(`Approved. [Connect email sending] to send it to ${email ?? "the client"}.`); onChange();
      }}>Approve letter</Button>
    </article>
  );
}

function Summaries({ client, summaries, onChange, onConsent, onRecap }: { client: Client; summaries: Summary[]; onChange: () => void; onConsent: (v: boolean) => void; onRecap: (v: boolean) => void }) {
  const applyDoc = useDocUpdater();
  const [transcript, setTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [keepRecording, setKeepRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const summarise = useServerFn(summariseSession);
  const transcribe = useServerFn(transcribeRecording);
  const nextNo = client.sessions.filter((s) => s.done).length;

  const run = async () => {
    if (!client.recording_consent) { toast.error("Tick recorded consent first."); return; }
    setBusy(true);
    try {
      let text = transcript;
      if (isDemo()) {
        toast("Demo: AI isn't called. A sample summary is created.");
        await db.from("session_summaries").insert({
          client_id: client.id, session_number: nextNo, transcript: text || "[Demo transcript]",
          themes: "Sample theme one\nSample theme two", breakthroughs: "A sample breakthrough.", work_on: "One sample thing to try.",
          email_draft: "We looked at [sample theme].\nOne thing we noticed: [sample].\nThis fortnight: [one small thing to try].", email_status: "draft",
        });
        await applyDoc(client, "session summary", "Sample theme one. Still finding handovers hard. A little calmer this week. Remind me to plan one thing to try.");
      } else {
        if (file) text = (await transcribe({ data: { base64: await toB64(file), mime: file.type, name: file.name } })).text;
        if (!text.trim()) throw new Error("Add a transcript or recording.");
        const s = await summarise({ data: { clientName: client.name.split(" ")[0] ?? client.name, transcript: text } });
        // Recordings are never stored unless Sam chooses to keep them; the transcript is the record.
        await db.from("session_summaries").insert({ client_id: client.id, session_number: nextNo, transcript: text, ...s, email_draft: clampRecap(s.email_draft), email_status: "draft", recording_path: keepRecording && file ? `[kept locally: ${file.name}]` : null });
        await applyDoc(client, "session summary", `Themes:\n${s.themes}\nBreakthroughs:\n${s.breakthroughs}\nWork on:\n${s.work_on}`);
      }
      setTranscript(""); setFile(null); onChange();
    } catch (e) { toast.error(e instanceof Error ? e.message : "That didn't work."); }
    setBusy(false);
  };

  return (
    <Panel>
      <h2 className="text-2xl">Session summaries</h2>
      <label className="mt-4 flex items-start gap-3 rounded-[16px] bg-background p-4 text-sm">
        <input type="checkbox" checked={client.recording_consent} onChange={(e) => onConsent(e.target.checked)} className="mt-0.5 size-4 accent-[var(--ink)]" />
        <span><span className="font-semibold">{client.name} has agreed, on record, to sessions being recorded and summarised.</span>{client.recording_consent_at && <span className="block text-soft">Consent noted {fmtDate(client.recording_consent_at)}</span>}</span>
      </label>
      <fieldset disabled={!client.recording_consent || busy} className="mt-4 grid gap-3 disabled:opacity-50">
        <Label htmlFor="ss-file">Recording (audio, max about 10MB)</Label>
        <Input id="ss-file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="rounded-full" />
        <Label htmlFor="ss-t">Or paste a transcript</Label>
        <Textarea id="ss-t" rows={4} value={transcript} onChange={(e) => setTranscript(e.target.value)} className="rounded-[18px]" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!keepRecording} onChange={(e) => setKeepRecording(!e.target.checked)} className="size-4 accent-[var(--ink)]" /> Delete the recording once the summary is made</label>
        <Button onClick={run} className="justify-self-start">{busy ? "Summarising…" : client.recap_enabled ? "Make summary and draft recap" : "Make summary"}</Button>
      </fieldset>
      <label className="mt-4 flex items-start gap-3 text-sm">
        <input type="checkbox" checked={client.recap_enabled} onChange={(e) => onRecap(e.target.checked)} className="mt-0.5 size-4 accent-[var(--ink)]" />
        <span><span className="font-semibold">Send {client.name.split(" ")[0]} a short recap after each session</span><span className="block text-soft">Optional, off by default. Three lines at most: what we looked at, one thing to try this fortnight. You approve each one.</span></span>
      </label>
      <div className="mt-8 grid gap-4">
        {summaries.map((s) => <SummaryCard key={s.id} s={s} email={client.email} recap={client.recap_enabled} onChange={onChange} />)}
      </div>
    </Panel>
  );
}

function SummaryCard({ s, email, recap, onChange }: { s: Summary; email: string | null; recap: boolean; onChange: () => void }) {
  const [draft, setDraft] = useState(s.email_draft ?? "");
  const tooLong = draft.split("\n").filter((l) => l.trim()).length > 3;
  const approve = async () => {
    if (tooLong) { toast.error("Keep the recap to three lines."); return; }
    await db.from("session_summaries").update({ email_draft: clampRecap(draft), email_status: "approved" }).eq("id", s.id);
    toast.success(`Approved. [Connect email sending] to send it to ${email ?? "the client"}.`);
    onChange();
  };
  return (
    <article className="rounded-[20px] border border-border p-5">
      <p className="text-sm font-semibold text-soft">Session {s.session_number} · {fmtDate(s.created_at)} {s.recording_path ? "· recording kept" : "· recording deleted"}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {([["Themes", s.themes], ["Breakthroughs", s.breakthroughs], ["What to work on", s.work_on]] as const).map(([h, v]) => (
          <div key={h}><p className="font-bold">{h}</p><ul className="mt-1 space-y-1 text-sm text-muted-foreground">{(v ?? "").split("\n").map((l) => <li key={l}>{l}</li>)}</ul></div>
        ))}
      </div>
      {recap && <>
        <Label htmlFor={`em-${s.id}`} className="mt-5 block">Recap for the client <span className="font-normal text-soft">(optional, max 3 lines · {s.email_status})</span></Label>
        <Textarea id={`em-${s.id}`} rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} className="mt-2 rounded-[18px]" />
        {tooLong && <p className="mt-1 text-xs font-semibold">That's more than three lines.</p>}
      </>}
      {s.recording_path && (
        <Button className="mt-3 mr-2" variant="outline" onClick={async () => { await db.from("session_summaries").update({ recording_path: null }).eq("id", s.id); toast.success("Recording deleted. The summary stays."); onChange(); }}>Delete recording</Button>
      )}
      {recap && <Button className="mt-3" variant="marigold" disabled={s.email_status === "approved" && draft === s.email_draft} onClick={approve}>Approve recap</Button>}
    </article>
  );
}
