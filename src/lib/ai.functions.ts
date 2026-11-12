import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Admin-only AI helpers. Demo mode never calls these; it uses local examples. */

async function assertAdmin(supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: boolean | null }> }, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden");
}

async function askJson(system: string, user: string): Promise<Record<string, unknown>> {
  const { generateResponse } = await import("@lovable.dev/ai-gateway");
  const res = await generateResponse({
    model: "openai/gpt-6-astra",
    instructions: system,
    input: [{ role: "user", content: `${user}\n\nReturn JSON.` }],
    text: { format: { type: "json_object" } },
  });
  let text = "";
  for (const item of res.output ?? []) {
    if (item.type === "message") for (const c of item.content) if (c.type === "output_text") text += c.text;
  }
  return JSON.parse(text || "{}") as Record<string, unknown>;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

const VOICE = "Write in British English, warm, dry and plain. Short sentences. Never use: transformational, container, journey, empower, unlock your potential, best self, abundance.";

export const transcribeRecording = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { base64: string; mime: string; name: string }) => {
    if (d.base64.length > 14_000_000) throw new Error("Recording too large (max about 10MB).");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { transcribeAudio } = await import("@lovable.dev/ai-gateway");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const file = new File([bytes], data.name || "recording.webm", { type: data.mime || "audio/webm" });
    const res = await transcribeAudio({ model: "openai/gpt-transcribe", file });
    return { text: str((res as { text?: unknown }).text) };
  });

export const summariseSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { clientName: string; transcript: string }) => ({ clientName: d.clientName.slice(0, 120), transcript: d.transcript.slice(0, 60_000) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You help Sam Brindle, a coach using the LOVE method (Look inwards, Own your reality, Visualise the future, Embodiment), summarise a client session for her own notes. ${VOICE}`,
      `Client first name: ${data.clientName}\nTranscript:\n${data.transcript}\n\nReturn an object with keys: themes (3-5 short bullet lines joined by newlines), breakthroughs (1-3 lines), work_on (2-4 lines), email_draft (an optional recap for the client, at most 3 short lines: what we looked at, and one thing to try this fortnight; no greeting or sign-off).`,
    );
    return { themes: str(j["themes"]), breakthroughs: str(j["breakthroughs"]), work_on: str(j["work_on"]), email_draft: str(j["email_draft"]) };
  });

export const parseVoiceCapture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transcript: string; today: string }) => ({ transcript: d.transcript.slice(0, 8000), today: d.today.slice(0, 10) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You turn a coach's quick spoken note about someone she met into a lead and a follow-up task. ${VOICE}`,
      `Today is ${data.today}. Note:\n${data.transcript}\n\nReturn keys: first_name, email (or ""), phone (or ""), door ("divorce" | "reinvention" | "other"), interest (short), task_title (short imperative), task_due (YYYY-MM-DD, default tomorrow), note (one or two sentences).`,
    );
    return {
      first_name: str(j["first_name"]), email: str(j["email"]), phone: str(j["phone"]), door: str(j["door"]) || "other",
      interest: str(j["interest"]), task_title: str(j["task_title"]), task_due: str(j["task_due"]), note: str(j["note"]),
    };
  });

const DOC_KEYS_TEXT = "stage_why, patterns, triggers, improving, open_threads, next_session, questions";

export const updateWorkingDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { clientName: string; stage: string; doc: Record<string, string>; source: string; input: string }) => ({
    clientName: d.clientName.slice(0, 120), stage: d.stage.slice(0, 60), source: d.source.slice(0, 40), input: d.input.slice(0, 30_000),
    doc: Object.fromEntries(Object.entries(d.doc ?? {}).slice(0, 10).map(([k, v]) => [k.slice(0, 30), String(v).slice(0, 6000)])),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You keep a coach's private working document about one client, using the LOVE method. Update it with the new input. Keep existing useful lines, add new observations as short lines, remove nothing that is still true. ${VOICE}`,
      `Client: ${data.clientName}. Current LOVE stage: ${data.stage}.\nCurrent document (JSON): ${JSON.stringify(data.doc)}\nNew input (${data.source}):\n${data.input}\n\nReturn an object with keys ${DOC_KEYS_TEXT}; each value is the full updated text for that section, one point per line.`,
    );
    return Object.fromEntries(DOC_KEYS_TEXT.split(", ").map((k) => [k, str(j[k])])) as Record<string, string>;
  });

export const draftProgressLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { clientName: string; stage: string; nextStage: string; doc: Record<string, string> }) => ({
    clientName: d.clientName.slice(0, 120), stage: d.stage.slice(0, 60), nextStage: d.nextStage.slice(0, 60),
    doc: Object.fromEntries(Object.entries(d.doc ?? {}).slice(0, 10).map(([k, v]) => [k.slice(0, 30), String(v).slice(0, 6000)])),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You draft a short progress letter from Sam Brindle, a coach, to a client finishing a stage of the LOVE method. ${VOICE}`,
      `Client first name: ${data.clientName}. Stage just finished: ${data.stage}. Next stage: ${data.nextStage || "the end of the programme"}.\nSam's working notes: ${JSON.stringify(data.doc)}\n\nReturn {"letter": "..."}: under 200 words, three short parts (where you started, what's changed, what's next), signed "Sam". No private detail she wouldn't say to the client's face.`,
    );
    return { letter: str(j["letter"]) };
  });

export const draftContentPiece = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { format: string; spec: string; title: string; brief: string; published: string[] }) => ({
    format: d.format.slice(0, 30), spec: d.spec.slice(0, 600), title: d.title.slice(0, 200), brief: d.brief.slice(0, 2000), published: d.published.slice(0, 30).map((x) => x.slice(0, 200)),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You draft content for Sam Brindle, a British coach in Barcelona who helps people through divorce and other life changes with her LOVE method. Never name or identify clients. ${VOICE}`,
      `Format: ${data.format}. Required shape: ${data.spec}\nIdea: ${data.title}\nBrief: ${data.brief}\nExisting published pieces: ${data.published.join("; ") || "none"}\n\nReturn {"draft": "..."} as plain text with the labelled parts on their own lines.`,
    );
    return { draft: str(j["draft"]) };
  });

export const parseClientNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { transcript: string; clientName: string }) => ({ transcript: d.transcript.slice(0, 8000), clientName: d.clientName.slice(0, 120) }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const j = await askJson(
      `You turn a coach's quick spoken note about an existing client into a timeline note and follow-up tasks. ${VOICE}`,
      `Client: ${data.clientName}. Note:\n${data.transcript}\n\nReturn {"note": "one or two sentences", "tasks": ["short imperative", ...]}.`,
    );
    const tasks = Array.isArray(j["tasks"]) ? (j["tasks"] as unknown[]).map(str).filter(Boolean).slice(0, 5) : [];
    return { note: str(j["note"]), tasks };
  });
