import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mic, Square } from "lucide-react";
import { toast } from "sonner";
import { db, isDemo } from "./db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { parseClientNote, parseVoiceCapture, transcribeRecording } from "@/lib/ai.functions";
import { impliedTasks, matchPerson, type Person } from "@/lib/working-doc";
import { useDocUpdater } from "./WorkingDocument";
import { inputCls, selectCls } from "./ui";

export const demoClientTranscript = "Just spoke to Demo Client One. Much calmer with her ex this week, but still not sleeping. Remind me to send her the 2am voice note.";
export const demoTranscript = "Just met Laura at the school gate. She's separating, two kids, wants to know about the Reset Session. Her number is [demo number]. Send her the voice notes.";

const tomorrow = () => new Date(Date.now() + 864e5).toISOString().slice(0, 10);
type Parsed = { first_name: string; email: string; phone: string; door: string; interest: string; task_title: string; task_due: string; note: string };

/** Simple local parser used in demo mode instead of AI. */
export function demoParse(t: string): Parsed {
  const name = /met (\w+)/i.exec(t)?.[1] ?? "";
  return {
    first_name: name, email: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/.exec(t)?.[0] ?? "", phone: /(\d[\d ]{7,}\d|\[demo number\])/.exec(t)?.[1] ?? "",
    door: /job|redundan|career/i.test(t) ? "reinvention" : /separat|divorc/i.test(t) ? "divorce" : "other",
    interest: /reset/i.test(t) ? "Reset Session" : /programme|re-coded/i.test(t) ? "LOVE RE-Coded" : "",
    task_title: name ? `Send ${name} the voice notes link` : "Follow up", task_due: tomorrow(),
    note: t.split(". ").slice(0, 2).join(". "),
  };
}

/** Demo stand-in for AI on a note about someone already known. */
export function demoParseClientNote(t: string) {
  const sentences = t.split(/(?<=[.!?])\s+/).filter((x) => !/^(just (spoke|talked) to|remind me)/i.test(x));
  return { note: sentences.join(" "), tasks: impliedTasks(t) };
}
type Known = { note: string; tasks: { title: string; due: string }[] };

const toB64 = (b: Blob) => new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1] ?? ""); r.readAsDataURL(b); });

export function VoiceCapture() {
  const [open, setOpen] = useState(false);
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [p, setP] = useState<Parsed | null>(null);
  const mr = useRef<MediaRecorder | null>(null);
  const qc = useQueryClient();
  const transcribe = useServerFn(transcribeRecording);
  const parse = useServerFn(parseVoiceCapture);
  const parseKnown = useServerFn(parseClientNote);
  const applyDoc = useDocUpdater();
  const [people, setPeople] = useState<(Person & { love_stage?: string })[]>([]);
  const [dest, setDest] = useState<string>("new");
  const [known, setKnown] = useState<Known | null>(null);

  const start = () => { setOpen(true); setP(null); setKnown(null); setDest("new"); setTranscript(isDemo() ? demoTranscript : ""); };
  const person = people.find((x) => `${x.kind}:${x.id}` === dest) ?? null;

  const loadKnown = async (t: string, who: Person) => {
    if (isDemo()) { const r = demoParseClientNote(t); return setKnown({ note: r.note, tasks: r.tasks.map((title) => ({ title, due: tomorrow() })) }); }
    const r = await parseKnown({ data: { transcript: t, clientName: who.name } });
    setKnown({ note: r.note, tasks: r.tasks.map((title) => ({ title, due: tomorrow() })) });
  };

  const record = async () => {
    if (isDemo()) { toast("Demo: using the example transcript instead of your microphone."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const m = new MediaRecorder(stream);
      m.ondataavailable = (e) => chunks.push(e.data);
      m.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setBusy(true);
        try {
          const blob = new Blob(chunks, { type: m.mimeType });
          const r = await transcribe({ data: { base64: await toB64(blob), mime: m.mimeType, name: "note.webm" } });
          setTranscript(r.text);
        } catch { toast.error("Couldn't transcribe that. Type it instead?"); }
        setBusy(false);
      };
      m.start(); mr.current = m; setRec(true);
    } catch { toast.error("No microphone access. You can type the note instead."); }
  };
  const stop = () => { mr.current?.stop(); setRec(false); };

  const understand = async () => {
    if (!transcript.trim()) return;
    setBusy(true);
    try {
      const [{ data: cs }, { data: ls }] = await Promise.all([db.from("clients").select("id,name,love_stage"), db.from("leads").select("id,first_name")]);
      const list = [
        ...(cs ?? []).map((c) => ({ id: c.id, name: c.name, kind: "client" as const, love_stage: c.love_stage })),
        ...(ls ?? []).filter((l) => l.first_name).map((l) => ({ id: l.id, name: l.first_name!, kind: "lead" as const })),
      ];
      setPeople(list);
      const m = matchPerson(transcript, list);
      setDest(m ? `${m.kind}:${m.id}` : "new");
      setP(isDemo() ? demoParse(transcript) : await parse({ data: { transcript, today: new Date().toISOString().slice(0, 10) } }));
      if (m) await loadKnown(transcript, m);
    } catch { toast.error("That didn't work. Try again in a moment."); }
    setBusy(false);
  };

  const switchDest = async (v: string) => {
    setDest(v);
    const who = people.find((x) => `${x.kind}:${x.id}` === v);
    if (who && !known) { setBusy(true); try { await loadKnown(transcript, who); } catch { toast.error("That didn't work."); } setBusy(false); }
  };

  const confirmKnown = async () => {
    if (!person || !known) return;
    const tasks = known.tasks.filter((t) => t.title.trim());
    if (person.kind === "client") {
      await db.from("client_events").insert({ client_id: person.id, kind: "voice_note", summary: known.note || "Voice note", detail: transcript });
      if (tasks.length) await db.from("tasks").insert(tasks.map((t) => ({ title: t.title, due_date: t.due || null, source: "voice_capture", client_id: person.id })));
      await applyDoc({ id: person.id, name: person.name, love_stage: person.love_stage ?? "L" }, "voice note", transcript);
    } else {
      const { data: lead } = await db.from("leads").select("notes").eq("id", person.id).single();
      await db.from("leads").update({ notes: [lead?.notes, `${new Date().toLocaleDateString("en-GB")}: ${known.note}`].filter(Boolean).join("\n") }).eq("id", person.id);
      if (tasks.length) await db.from("tasks").insert(tasks.map((t) => ({ title: t.title, due_date: t.due || null, source: "voice_capture", lead_id: person.id })));
    }
    toast.success(`Saved to ${person.name}'s ${person.kind === "client" ? "page" : "lead"}.`);
    qc.invalidateQueries({ queryKey: ["admin"] });
    setOpen(false);
  };

  const confirm = async () => {
    if (!p) return;
    const notes = [p.note, p.phone && `Phone: ${p.phone}`, p.interest && `Interested in: ${p.interest}`].filter(Boolean).join("\n");
    const { data: lead, error } = await db.from("leads").insert({
      first_name: p.first_name || null, email: p.email || `no-email-${Date.now()}@pending.local`, source: "voice_capture", consent: false,
      resource: `door:${p.door}`, notes,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    await db.from("tasks").insert({ title: p.task_title || "Follow up", due_date: p.task_due || tomorrow(), source: "voice_capture", lead_id: lead?.id ?? null, notes: p.note });
    toast.success("Lead and task saved.");
    qc.invalidateQueries({ queryKey: ["admin"] });
    setOpen(false);
  };

  const f = (k: keyof Parsed, label: string) => (
    <div className="grid gap-1">
      <Label htmlFor={`vc-${k}`} className="text-xs">{label}</Label>
      <Input id={`vc-${k}`} value={p![k]} onChange={(e) => setP({ ...p!, [k]: e.target.value })} className={inputCls} />
    </div>
  );

  return (
    <>
      <Button variant="marigold" size="lg" onClick={start} className="h-14 w-full px-8 text-lg sm:w-auto"><Mic className="!size-5" /> Record a note</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[24px]">
          <DialogHeader>
            <DialogTitle>Record a note</DialogTitle>
            <DialogDescription>Say who you met and what they need. You'll check everything before it's saved.{isDemo() && " Demo: an example transcript is filled in."}</DialogDescription>
          </DialogHeader>
          {!p ? (
            <div className="grid gap-4">
              <Button size="lg" variant={rec ? "destructive" : "default"} onClick={rec ? stop : record} disabled={busy}>
                {rec ? <><Square /> Stop</> : <><Mic /> Start recording</>}
              </Button>
              <Label htmlFor="vc-up" className="text-sm">Or upload a recording</Label>
              <Input id="vc-up" type="file" accept="audio/*" disabled={busy} className="rounded-full" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (isDemo()) { toast("Demo: using the example transcript instead."); return; }
                setBusy(true);
                try { setTranscript((await transcribe({ data: { base64: await toB64(file), mime: file.type, name: file.name } })).text); }
                catch { toast.error("Couldn't transcribe that. Type it instead?"); }
                setBusy(false);
              }} />
              <Label htmlFor="vc-t">Transcript</Label>
              <Textarea id="vc-t" rows={5} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Or type it here" className="rounded-[18px]" />
              {isDemo() && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-soft">Demo examples:</span>
                  <button type="button" className="underline" onClick={() => setTranscript(demoTranscript)}>Someone new</button>
                  <button type="button" className="underline" onClick={() => setTranscript(demoClientTranscript)}>An existing client</button>
                </div>
              )}
              <Button onClick={understand} disabled={busy || !transcript.trim()}>{busy ? "Working…" : "Next: check before saving"}</Button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor="vc-dest" className="text-xs">Where should this go?</Label>
                <select id="vc-dest" value={dest} onChange={(e) => switchDest(e.target.value)} className={selectCls}>
                  <option value="new">Someone new: create a lead</option>
                  <optgroup label="Clients">{people.filter((x) => x.kind === "client").map((x) => <option key={x.id} value={`client:${x.id}`}>{x.name}</option>)}</optgroup>
                  <optgroup label="Leads">{people.filter((x) => x.kind === "lead").map((x) => <option key={x.id} value={`lead:${x.id}`}>{x.name}</option>)}</optgroup>
                </select>
              </div>
              {person && known ? (
                <>
                  <p className="text-sm font-semibold">Add this to {person.name}'s {person.kind === "client" ? "page" : "lead"}?</p>
                  <div className="grid gap-1">
                    <Label htmlFor="vc-knote" className="text-xs">Note for the timeline (the transcript is saved with it)</Label>
                    <Textarea id="vc-knote" rows={3} value={known.note} onChange={(e) => setKnown({ ...known, note: e.target.value })} className="rounded-[18px]" />
                  </div>
                  {known.tasks.map((t, i) => (
                    <div key={i} className="grid grid-cols-[1fr_140px] gap-2">
                      <Input aria-label={`Task ${i + 1}`} value={t.title} onChange={(e) => setKnown({ ...known, tasks: known.tasks.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} className={inputCls} />
                      <Input aria-label={`Task ${i + 1} due`} type="date" value={t.due} onChange={(e) => setKnown({ ...known, tasks: known.tasks.map((x, j) => (j === i ? { ...x, due: e.target.value } : x)) })} className={inputCls} />
                    </div>
                  ))}
                  <button type="button" className="justify-self-start text-sm underline" onClick={() => setKnown({ ...known, tasks: [...known.tasks, { title: "", due: tomorrow() }] })}>Add a task</button>
                  {person.kind === "client" && <p className="text-xs text-soft">Their working document will be updated too. Anything you've edited there stays.</p>}
                  <div className="flex gap-2"><Button variant="outline" onClick={() => setP(null)}>Back</Button><Button variant="marigold" onClick={confirmKnown}>Save to {person.name.split(" ")[0]}{person.kind === "client" ? "'s page" : ""}</Button></div>
                </>
              ) : person ? <p className="text-sm text-soft">Working…</p> : (
                <>
                  <p className="text-sm font-semibold">Someone new. Check this, then save.</p>
                  <div className="grid gap-3 sm:grid-cols-2">{f("first_name", "Name")}{f("email", "Email")}{f("phone", "Phone")}{f("door", "Life event")}{f("interest", "Interested in")}{f("task_due", "Task due")}</div>
                  {f("task_title", "Task")}
                  {f("note", "Note")}
                  <p className="text-xs text-soft">Saved as a lead without marketing consent. Ask before adding them to emails.</p>
                  <div className="flex gap-2"><Button variant="outline" onClick={() => setP(null)}>Back</Button><Button variant="marigold" onClick={confirm}>Save lead and task</Button></div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
