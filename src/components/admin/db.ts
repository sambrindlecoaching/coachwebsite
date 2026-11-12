import { SAMPLE_VOICE_URL } from "@/content/sample-audio";
import heroImg from "@/assets/sam-home-hero.webp.asset.json";
import portraitImg from "@/assets/sam-about-portrait.webp.asset.json";
import storyImg from "@/assets/sam-story.webp.asset.json";
// Data access for the admin dashboard.
// In demo mode every read and write goes to an in-memory store of fictional
// sample data, so the real database is never touched and no sign-in is needed.
import { supabase } from "@/integrations/supabase/client";

let demo = false;
export const isDemo = () => demo;
export function setDemo(on: boolean) {
  demo = on;
  if (on) store = seed();
}

type Row = Record<string, any>;
let store: Record<string, Row[]> = {};

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
const dateIn = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const uid = () => crypto.randomUUID();

function seed(): Record<string, Row[]> {
  const names = ["Demo Parent A", "Demo Parent B", "Demo Parent C", "Demo Parent D", "Demo Parent E", "Demo Parent F", "Demo Parent G", "Demo Parent H"];
  const sources = ["voice_notes", "quiz", "resource", "contact", "referral", "voice_notes", "series", "voice_notes"];
  const statuses = ["new", "contacted", "call_booked", "client", "not_now", "new", "new", "contacted"];
  const leads = names.map((n, i) => ({
    id: uid(), first_name: n, email: `demo${i + 1}@example.com`, source: sources[i], status: statuses[i],
    consent: true, message: i === 3 ? "Fictional message for the demo." : null, resource: null,
    notes: i === 1 ? "Fictional note." : null, created_at: daysAgo(i * 6 + 1), updated_at: daysAgo(i),
  }));
  const clients = [
    { id: uid(), name: "Demo Client One", email: "client1@example.com", programme: "LOVE RE-Coded", start_date: dateIn(-70), next_session: dateIn(3), active: true, notes: "Fictional client.", created_at: daysAgo(70), love_stage: "O", progress_notes: "Replies to her ex the next morning now, not at midnight.\nSleeping better on handover nights.\nStill hard on herself about the kids.", recording_consent: true, recording_consent_at: daysAgo(60), recap_enabled: true },
    { id: uid(), name: "Demo Client Two", email: "client2@example.com", programme: "LOVE RE-Coded", start_date: dateIn(-20), next_session: dateIn(8), active: true, notes: null, created_at: daysAgo(20), love_stage: "L", progress_notes: "Lost his job in September. Starting to name the 'not good enough' story.", recording_consent: false, recording_consent_at: null, recap_enabled: false },
  ];
  const sessions: Row[] = [];
  const payments: Row[] = [];
  clients.forEach((c, ci) => {
    for (let i = 1; i <= 12; i++) sessions.push({ id: uid(), client_id: c.id, session_number: i, session_date: null, done: i <= (ci === 0 ? 5 : 1), notes: null, created_at: c.created_at });
    for (let m = 1; m <= 6; m++) payments.push({ id: uid(), client_id: c.id, month_number: m, amount: 400, paid: m <= (ci === 0 ? 3 : 1), created_at: c.created_at });
  });
  const outreach = ["dm", "dm", "reply", "dm", "call", "reply", "dm"].map((kind, i) => ({ id: uid(), kind, handle: `@demo_handle_${i + 1}`, platform: "Instagram", note: null, created_at: daysAgo(i) }));
  const partners = [
    { id: uid(), name: "Demo Family Law Firm", type: "lawyer", contact: "lawyer@example.com", referrals_sent: 3, notes: null, created_at: daysAgo(40) },
    { id: uid(), name: "Demo Mediator", type: "mediator", contact: "mediator@example.com", referrals_sent: 1, notes: null, created_at: daysAgo(30) },
  ];
  const stages = ["E", "O", "L", "O", "V", "L"];
  const vdoors = ["divorce", "divorce", "reinvention"];
  const voice_notes = [{
    id: uid(), title: "The kids just left for the weekend", situation: "The house goes quiet at six.", stage: "O", duration_seconds: 191, audio_url: SAMPLE_VOICE_URL,
    is_free: true, published: true, sort_order: -1, created_at: daysAgo(50), door: "divorce",
  }, ...["Demo note one", "Demo note two", "Demo note three"].map((title, i) => ({
    id: uid(), title, situation: "Fictional situation", stage: stages[i], duration_seconds: 180 + i * 40, audio_url: null,
    is_free: i < 2, published: true, sort_order: i, created_at: daysAgo(50), door: vdoors[i],
  }))];
  const c1 = clients[0]!.id, c2 = clients[1]!.id;
  const tasks = [
    { id: uid(), title: "Send Demo Parent A the voice notes link", due_date: dateIn(0), done: false, client_id: null, lead_id: leads[0]!.id, source: "voice_capture", notes: null, created_at: daysAgo(1) },
    { id: uid(), title: "Prepare session 6 for Demo Client One", due_date: dateIn(2), done: false, client_id: c1, lead_id: null, source: "client", notes: null, created_at: daysAgo(2) },
    { id: uid(), title: "Record the 'telling people' voice note", due_date: dateIn(5), done: false, client_id: null, lead_id: null, source: "manual", notes: null, created_at: daysAgo(3) },
    { id: uid(), title: "Email two family lawyers about referrals", due_date: dateIn(12), done: false, client_id: null, lead_id: null, source: "manual", notes: null, created_at: daysAgo(3) },
    { id: uid(), title: "Book photographer for beach photos", due_date: null, done: false, client_id: null, lead_id: null, source: "manual", notes: null, created_at: daysAgo(9) },
  ];
  const milestones = [
    { id: uid(), title: "Phase 1: Fill the diary", phase: 1, due_date: "2027-01-31", done: false, client_id: null, sort_order: 1, created_at: daysAgo(30) },
    { id: uid(), title: "Phase 2: Earn beyond 1:1", phase: 2, due_date: "2027-06-30", done: false, client_id: null, sort_order: 2, created_at: daysAgo(30) },
    { id: uid(), title: "Phase 3: Build the brand", phase: 3, due_date: null, done: false, client_id: null, sort_order: 3, created_at: daysAgo(30) },
    { id: uid(), title: "First reply to her ex without a draft to a friend", phase: null, due_date: null, done: true, client_id: c1, sort_order: 1, created_at: daysAgo(40) },
    { id: uid(), title: "A Sunday evening that felt like hers", phase: null, due_date: null, done: false, client_id: c1, sort_order: 2, created_at: daysAgo(40) },
  ];
  const book_chapters = [
    { id: uid(), number: 1, title: "The Monday evening walk", status: "drafting", notes: null, created_at: daysAgo(30) },
    { id: uid(), number: 2, title: "Fact or story", status: "outline", notes: null, created_at: daysAgo(30) },
    { id: uid(), number: 3, title: "The quiet house", status: "idea", notes: null, created_at: daysAgo(30) },
    { id: uid(), number: 4, title: "Who am I without the title?", status: "idea", notes: null, created_at: daysAgo(30) },
  ];
  const idea = (title: string, brief: string, door: string, signal: string, src: [string, string][], suggested: string, extra: Row = {}) => ({
    id: uid(), title, brief, door, signal, sources: src.map(([label, url]) => ({ label, url })), suggested_format: suggested,
    origin: "trend", format: null, draft: null, my_take: null, photo_url: null, status: "idea", channel: null, scheduled_for: null, chapter_id: null, created_at: daysAgo(1), ...extra,
  });
  const content_pieces = [
    idea("Why handovers feel like a hangover", "Research on cortisol spikes around custody handovers.\nParents describe a 'crash' the evening after.\nPractical: plan the hour after, not the handover.", "divorce", "Psychology article · rising shares", [["[Demo] Psychology Today: co-parenting stress", "https://example.com/demo-1"]], "voice_note"),
    idea("Telling people you were made redundant", "Search interest in 'how to tell people you lost your job' up this month.\nShame, not money, is the common thread.\nScripts for the school gate.", "reinvention", "Search trend · +40% [demo figure]", [["[Demo] Google Trends", "https://example.com/demo-2"]], "article"),
    idea("Grey divorce is rising", "News coverage of divorce over 50 rising in the UK and Spain.\nDifferent fears: pensions, adult kids, identity.\nA possible future door.", "divorce", "News · three outlets this week", [["[Demo] The Guardian", "https://example.com/demo-3"], ["[Demo] El País", "https://example.com/demo-4"]], "podcast"),
    idea("'Am I a bad parent for enjoying the weekends off?'", "Recurring question in parenting forums.\nGuilt about relief.\nPermission, plus the fact or story test.", "divorce", "Community questions · 120+ replies [demo]", [["[Demo] Mumsnet thread", "https://example.com/demo-5"]], "reel"),
    idea("Starting again at 45", "Popular podcast episode on midlife career changes.\nListeners asking for the emotional side, not CV tips.\nCould become a book chapter.", "reinvention", "Podcast · top 20 business [demo]", [["[Demo] Diary of a CEO episode", "https://example.com/demo-6"]], "book_chapter"),
    idea("Bedtime guilt on handover nights", "Came up in several sessions this month.\nThe 'keep everyone happy' rule is loudest at bedtime.\nPermission to do bedtime differently in each house.", "divorce", "Recurring session theme · 3 sessions", [], "voice_note", { origin: "session_theme" }),
    idea("The CV that doesn't say who you are", "Recurring theme for people after redundancy.\nThe job title was doing a lot of quiet work.\nWho you are on a Tuesday with no meetings.", "reinvention", "Recurring session theme · 2 sessions", [], "linkedin", { origin: "session_theme" }),
    idea("From your voice note: the quiet house", "You recorded this in September.\nThe silence after the car pulls away.\nCould be a carousel for Instagram.", "divorce", "Your voice note · 'The kids just left for the weekend'", [], "carousel", { origin: "own" }),
    idea("The Sunday the kids go back", "Already a Journal draft.", "divorce", "Your own idea", [], "article", { format: "article", status: "scheduled", channel: "Journal", scheduled_for: dateIn(4), draft: "See the Journal draft." }),
    idea("2am thoughts reel", "Short reel script.", "divorce", "Your own idea", [], "reel", { format: "reel", status: "scheduled", channel: "Instagram", scheduled_for: dateIn(9), draft: "Hook: It's 2am..." }),
  ];
  const session_summaries = [{
    id: uid(), client_id: c1, session_number: 5, transcript: "[Fictional transcript excerpt] We talked about the message from her ex on Tuesday...",
    themes: "Guilt about the children's bedtime routine\nThe 'I have to keep everyone happy' belief\nHandover evenings", breakthroughs: "Noticed the old belief before replying, and waited until morning.",
    work_on: "Plan the first hour after handover\nOne kind sentence to herself when the guilt arrives", recording_path: null, created_at: daysAgo(4),
    email_draft: "We looked at why bedtime brings the guilt in.\nThe 'keep everyone happy' rule is doing a lot of shouting.\nThis fortnight: plan the first hour after Sunday's handover. Something small and yours.", email_status: "draft",
  }];
  const client_events = [
    { id: uid(), client_id: c1, kind: "email_in", summary: "Asked whether to tell the kids' school about the separation.", link: "https://mail.google.com/", occurred_at: daysAgo(6) },
    { id: uid(), client_id: c1, kind: "email_out", summary: "Sent session 4 notes and the handover voice note.", link: "https://mail.google.com/", occurred_at: daysAgo(12) },
    { id: uid(), client_id: c1, kind: "resource", summary: "Shared voice note: The kids just left for the weekend.", link: null, occurred_at: daysAgo(12) },
    { id: uid(), client_id: c2, kind: "email_out", summary: "Welcome email and first worksheet.", link: "https://mail.google.com/", occurred_at: daysAgo(19) },
  ];
  const client_documents = [{
    client_id: c1, updated_at: daysAgo(4), last_source: "session summary",
    edited: { improving: true },
    sections: {
      stage_why: "Own your reality. She can see the old 'keep everyone happy' rule now, and is starting to choose differently.",
      patterns: "Keep everyone happy, especially the kids\nIf she rests, something will go wrong",
      triggers: "Messages from her ex late at night\nSunday handovers",
      improving: "Replies to her ex the next morning now, not at midnight\nSleeping better on handover nights",
      open_threads: "Whether to tell the school\nGuilt about enjoying time alone",
      next_session: "Plan the first hour after handover\nOne kind sentence for when the guilt arrives",
      questions: "What would 'good enough' look like at bedtime?\nWho told you rest has to be earned?",
    },
  }];
  const progress_letters = [{ id: uid(), client_id: c1, stage: "L", status: "approved", created_at: daysAgo(35),
    draft: "Hi,\n\nWe've reached the end of Look inwards, so here's where I think we are.\n\nWhere you started: replying to every message the minute it landed.\n\nWhat's changed: you notice the old rule before you act on it.\n\nWhat's next: Own your reality.\n\nSam" }];
  const media = [
    { id: uid(), url: heroImg.url, storage_path: null, alt: "Sam Brindle outdoors among sunlit green foliage", tags: ["portrait", "outdoors", "Maresme"], used_in: ["Home hero", "Divorce hero"], source: "site", created_at: daysAgo(20) },
    { id: uid(), url: portraitImg.url, storage_path: null, alt: "Sam Brindle smiling outdoors", tags: ["portrait", "outdoors"], used_in: ["About portrait"], source: "site", created_at: daysAgo(20) },
    { id: uid(), url: storyImg.url, storage_path: null, alt: "Sam Brindle in a lilac top beside a stone wall", tags: ["portrait", "outdoors", "Maresme"], used_in: ["About story"], source: "site", created_at: daysAgo(20) },
  ];
  return {
    client_documents, progress_letters, media,
    tasks, milestones, book_chapters, content_pieces, session_summaries, client_events, poll_responses: [{ id: uid(), issue: "demo-03", answer: "coping", created_at: daysAgo(2) }, { id: uid(), issue: "demo-03", answer: "calm", created_at: daysAgo(2) }],
    leads, clients, sessions, payments, outreach, partners, voice_notes,
    quiz_responses: [], site_settings: [], admin_allowlist: [{ email: "demo@example.com", added_at: daysAgo(10) }],
  };
}

class Q {
  private filters: ((r: Row) => boolean)[] = [];
  private orders: [string, boolean][] = [];
  private lim?: number;
  private op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any;
  private embeds: string[] = [];
  private single_ = false;
  constructor(private table: string) {}
  select(cols = "*") { if (this.op === "select") this.embeds = [...cols.matchAll(/(\w+)\(\*\)/g)].map((m) => m[1]!); return this; }
  insert(p: any) { this.op = "insert"; this.payload = p; return this; }
  upsert(p: any) { this.op = "upsert"; this.payload = p; return this; }
  update(p: any) { this.op = "update"; this.payload = p; return this; }
  delete() { this.op = "delete"; return this; }
  eq(c: string, v: any) { this.filters.push((r) => r[c] === v); return this; }
  gte(c: string, v: any) { this.filters.push((r) => r[c] >= v); return this; }
  order(c: string, o?: { ascending?: boolean }) { this.orders.push([c, o?.ascending !== false]); return this; }
  limit(n: number) { this.lim = n; return this; }
  single() { this.single_ = true; return this; }
  maybeSingle() { this.single_ = true; return this; }
  private run(): { data: any; error: null } {
    const t = (store[this.table] ??= []);
    const match = (r: Row) => this.filters.every((f) => f(r));
    if (this.op === "insert" || this.op === "upsert") {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((p: Row): Row => ({ id: uid(), created_at: new Date().toISOString(), ...p }));
      for (const r of rows) {
        const pk = r["key"] ? "key" : this.table === "client_documents" ? "client_id" : null;
        const i = this.op === "upsert" && pk ? t.findIndex((x) => x[pk] === r[pk]) : -1;
        if (i >= 0) t[i] = { ...t[i], ...r }; else t.push(r);
      }
      return { data: this.single_ ? rows[0] : rows, error: null };
    }
    if (this.op === "update") { t.filter(match).forEach((r) => Object.assign(r, this.payload)); return { data: null, error: null }; }
    if (this.op === "delete") { store[this.table] = t.filter((r) => !match(r)); return { data: null, error: null }; }
    let rows = t.filter(match).map((r) => {
      const out = { ...r };
      for (const e of this.embeds) out[e] = (store[e] ?? []).filter((x) => x["client_id"] === r["id"]);
      return out;
    });
    for (const [c, asc] of [...this.orders].reverse()) rows = [...rows].sort((a, b) => (a[c] > b[c] ? 1 : a[c] < b[c] ? -1 : 0) * (asc ? 1 : -1));
    if (this.lim) rows = rows.slice(0, this.lim);
    return { data: this.single_ ? rows[0] ?? null : rows, error: null };
  }
  then<T>(res: (v: { data: any; error: null }) => T, rej?: (e: unknown) => T) { return Promise.resolve().then(() => this.run()).then(res, rej); }
}

const demoClient = {
  from: (t: string) => new Q(t),
  storage: { from: () => ({
    upload: async () => ({ data: null, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: "" } }),
  }) },
  auth: { getUser: async () => ({ data: { user: { email: "demo@example.com" } } }) },
};

// Proxy so each call picks the real or demo client at call time.
export const db: typeof supabase = new Proxy({} as typeof supabase, {
  get: (_t, k) => {
    const target: any = demo ? demoClient : supabase;
    const v = target[k];
    return typeof v === "function" ? v.bind(target) : v;
  },
});
