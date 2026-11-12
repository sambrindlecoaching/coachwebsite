import { describe, expect, it } from "vitest";
import { anonymise, clampRecap, emptyDoc, impliedTasks, matchPerson, mergeDoc } from "@/lib/working-doc";
import { draftFor } from "@/lib/content-drafts";
import { demoClientTranscript, demoTranscript } from "@/components/admin/VoiceCapture";

const people = [
  { id: "c1", name: "Demo Client One", kind: "client" as const },
  { id: "c2", name: "Demo Client Two", kind: "client" as const },
  { id: "l1", name: "Demo Parent A", kind: "lead" as const },
];

describe("record a note: matching", () => {
  it("recognises an existing client by full name", () => {
    expect(matchPerson(demoClientTranscript, people)?.id).toBe("c1");
  });
  it("treats Laura as someone new", () => {
    expect(matchPerson(demoTranscript, people)).toBeNull();
  });
  it("pulls the reminder out as a task", () => {
    expect(impliedTasks(demoClientTranscript)).toEqual(["Send her the 2am voice note"]);
  });
});

describe("working document", () => {
  it("keeps Sam's edited lines and only adds new ones beneath", () => {
    const cur = { ...emptyDoc(), improving: "My own line" };
    const out = mergeDoc(cur, { improving: true }, { improving: "Rewritten by AI\nMy own line" });
    expect(out.improving).toBe("My own line\nRewritten by AI");
  });
  it("replaces sections Sam hasn't touched", () => {
    const out = mergeDoc({ ...emptyDoc(), triggers: "Old" }, {}, { triggers: "New" });
    expect(out.triggers).toBe("New");
  });
});

describe("client-facing rules", () => {
  it("recaps are capped at three lines", () => {
    expect(clampRecap("a\nb\nc\nd").split("\n")).toHaveLength(3);
  });
  it("session themes never carry a client's name", () => {
    expect(anonymise("Demo Client One feels guilty at bedtime", ["Demo Client One"])).not.toMatch(/Demo|Client|One/);
  });
});

describe("content drafts by format", () => {
  const idea = { title: "Telling people", brief: "a\nb\nc" };
  it("voice note is a recording prompt, not a script", () => {
    const d = draftFor(idea, "voice_note");
    for (const k of ["SITUATION", "OPENING LINE", "POINTS", "CLOSING LINE"]) expect(d).toContain(k);
  });
  it("reel ends with comment CALM", () => expect(draftFor(idea, "reel")).toContain("Comment CALM"));
  it("carousel has 6 to 8 slides", () => {
    const n = (draftFor(idea, "carousel").match(/^SLIDE \d+:/gm) ?? []).length;
    expect(n).toBeGreaterThanOrEqual(6); expect(n).toBeLessThanOrEqual(8);
  });
  it("book chapter links published pieces", () => {
    expect(draftFor(idea, "book_chapter", [{ title: "The Sunday the kids go back", channel: "Journal" }])).toContain("The Sunday the kids go back");
  });
});
