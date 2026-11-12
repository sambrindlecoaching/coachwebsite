// Pure helpers for Sam's private per-client working document and voice-capture matching.

export const DOC_SECTIONS = [
  ["stage_why", "Current LOVE stage and why"],
  ["patterns", "Patterns and beliefs noticed"],
  ["triggers", "Triggers"],
  ["improving", "What's improving"],
  ["open_threads", "Open threads"],
  ["next_session", "What to work on next session"],
  ["questions", "Questions to ask"],
] as const;
export type DocKey = (typeof DOC_SECTIONS)[number][0];
export type Doc = Record<DocKey, string>;
export type Edited = Partial<Record<DocKey, boolean>>;
export const DOC_KEYS = DOC_SECTIONS.map(([k]) => k) as DocKey[];
export const DOC_SOURCES = ["session summary", "voice note", "email summary", "WhatsApp excerpt", "Sam's edit"] as const;
export type DocSource = (typeof DOC_SOURCES)[number];

export const emptyDoc = (): Doc => Object.fromEntries(DOC_KEYS.map((k) => [k, ""])) as Doc;

export function toDoc(v: unknown): Doc {
  const d = emptyDoc();
  if (v && typeof v === "object") for (const k of DOC_KEYS) { const x = (v as Record<string, unknown>)[k]; if (typeof x === "string") d[k] = x; }
  return d;
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/**
 * Merge an automatic update into the document.
 * Sections Sam has edited keep every line she wrote; new lines are only added beneath.
 * Untouched sections take the proposed text.
 */
export function mergeDoc(current: Doc, edited: Edited, proposed: Partial<Doc>): Doc {
  const out = { ...current };
  for (const k of DOC_KEYS) {
    const p = proposed[k];
    if (typeof p !== "string" || !p.trim()) continue;
    if (edited[k]) {
      const have = new Set(lines(current[k]).map((l) => l.toLowerCase()));
      const extra = lines(p).filter((l) => !have.has(l.toLowerCase()));
      if (extra.length) out[k] = [current[k].trim(), ...extra].filter(Boolean).join("\n");
    } else out[k] = p.trim();
  }
  return out;
}

/** Demo stand-in for AI: sorts sentences of the new input into sections by simple cues. */
export function demoDocProposal(current: Doc, input: string): Partial<Doc> {
  const add: Partial<Record<DocKey, string[]>> = {};
  const push = (k: DocKey, l: string) => (add[k] ??= []).push(l);
  for (const raw of input.split(/(?<=[.!?])\s+|\n+/)) {
    const s = raw.trim().replace(/^(just (spoke|talked) to [^.]*?\.\s*)/i, "");
    if (s.length < 6 || /^just (spoke|talked|met)/i.test(s)) continue;
    if (/remind me|send (her|him|them)/i.test(s)) push("next_session", s.replace(/^remind me to /i, "").replace(/^./, (c) => c.toUpperCase()));
    else if (/calmer|better|easier|managed|first time|proud/i.test(s)) push("improving", s);
    else if (/still|not sleeping|worried|stuck|can't|cannot/i.test(s)) push("open_threads", s);
    else if (/\bex\b|handover|message|text|school|money/i.test(s)) push("triggers", s);
    else if (/always|never|should|must|have to|not good enough/i.test(s)) push("patterns", s);
    else if (/\?$/.test(s)) push("questions", s);
    else push("open_threads", s);
  }
  const out: Partial<Doc> = {};
  for (const k of Object.keys(add) as DocKey[]) out[k] = [...lines(current[k]), ...add[k]!].join("\n");
  return out;
}

export type Person = { id: string; name: string; kind: "client" | "lead" };

/** Find the client or lead a note is about: full name first, then a unique first name. */
export function matchPerson(text: string, people: Person[]): Person | null {
  const t = ` ${text.replace(/\[[^\]]*\]/g, " ").toLowerCase().replace(/[^\p{L}\s'-]/gu, " ")} `;
  const full = people.filter((p) => p.name.trim().split(/\s+/).length > 1 && t.includes(` ${p.name.toLowerCase().trim()} `));
  if (full.length) return full.sort((a, b) => (a.kind === "client" ? -1 : 1) - (b.kind === "client" ? -1 : 1) || b.name.length - a.name.length)[0]!;
  const first = (p: Person) => p.name.trim().split(/\s+/)[0]!.toLowerCase();
  const hits = people.filter((p) => first(p).length > 2 && t.includes(` ${first(p)} `));
  // Only a first name that belongs to exactly one person counts; shared first names are ambiguous.
  return hits.length === 1 ? hits[0]! : null;
}

/** Tasks implied by a note: every "remind me to …" / "send her …" sentence. */
export function impliedTasks(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((s) => s.trim().replace(/[.!]$/, ""))
    .filter((s) => /^(remind me to|send|call|book|email|follow up)/i.test(s))
    .map((s) => s.replace(/^remind me to /i, "").replace(/^./, (c) => c.toUpperCase()));
}

/** Recaps to clients stay short: at most three lines. */
export function clampRecap(text: string, max = 3): string {
  return lines(text).slice(0, max).join("\n");
}

/** Replace any client name (full or first) with "a client" so session themes stay anonymous. */
export function anonymise(text: string, names: string[]): string {
  let out = text;
  const parts = new Set<string>();
  for (const n of names) { const s = n.trim(); if (!s) continue; parts.add(s); for (const w of s.split(/\s+/)) if (w.length > 2) parts.add(w); }
  for (const p of [...parts].sort((a, b) => b.length - a.length)) out = out.replace(new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi"), "a client");
  return out.replace(/(a client\s*){2,}/gi, "a client ").trim();
}

export function demoProgressLetter(firstName: string, stageName: string, nextStage: string | null, doc: Doc): string {
  const first = (s: string) => lines(s)[0]?.replace(/\.$/, "").toLowerCase();
  return [
    `Hi ${firstName},`,
    `We've reached the end of ${stageName}, so here's where I think we are.`,
    `Where you started: ${first(doc.stage_why) ?? first(doc.open_threads) ?? "a lot of noise, not much room to think"}.`,
    `What's changed: ${first(doc.improving) ?? "more than you'd give yourself credit for"}.`,
    nextStage ? `What's next: ${nextStage}. ${first(doc.next_session) ? `We'll start with ${first(doc.next_session)}.` : ""}`.trim() : "What's next: keeping it going without me in the room.",
    "Sam",
  ].join("\n\n");
}
