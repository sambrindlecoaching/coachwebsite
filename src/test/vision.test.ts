import { describe, expect, it } from "vitest";
import { bucket } from "@/components/admin/Tasks";
import { demoParse, demoTranscript } from "@/components/admin/VoiceCapture";

describe("tasks grouping", () => {
  const today = new Date("2026-10-27T12:00:00Z");
  it("overdue and today go in Today", () => {
    expect(bucket("2026-10-20", today)).toBe("today");
    expect(bucket("2026-10-27", today)).toBe("today");
  });
  it("within seven days is This week, beyond or undated is Later", () => {
    expect(bucket("2026-11-03", today)).toBe("week");
    expect(bucket("2026-11-04", today)).toBe("later");
    expect(bucket(null, today)).toBe("later");
  });
});

describe("demo voice capture", () => {
  it("turns the school-gate note into a divorce lead wanting a Reset Session", () => {
    const p = demoParse(demoTranscript);
    expect(p.first_name).toBe("Laura");
    expect(p.phone).toBe("[demo number]");
    expect(p.door).toBe("divorce");
    expect(p.interest).toBe("Reset Session");
    expect(p.task_title).toBe("Send Laura the voice notes link");
  });
});
