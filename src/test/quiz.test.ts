import { describe, expect, it } from "vitest";
import { scoreQuiz } from "@/lib/quiz";
import { isValidEmail } from "@/lib/leads";

describe("quiz scoring", () => {
  it("low scores suggest a voice note", () => {
    expect(scoreQuiz([0, 0, 0, 1, 1, 1, 2]).result.key).toBe("listen");
  });
  it("middle scores suggest a call about a reset", () => {
    expect(scoreQuiz([1, 1, 1, 1, 1, 1, 1]).result.key).toBe("reset");
  });
  it("high scores suggest the programme", () => {
    expect(scoreQuiz([2, 2, 2, 2, 1, 1, 0]).result.key).toBe("programme");
  });
});

describe("email validation", () => {
  it("rejects malformed emails", () => {
    expect(isValidEmail("sam@")).toBe(false);
    expect(isValidEmail("sam@example.com")).toBe(true);
  });
});

describe("quiz branching", () => {
  it("each life event has seven questions so scoring stays comparable", async () => {
    const { questionsFor } = await import("@/lib/quiz");
    expect(questionsFor("divorce")).toHaveLength(7);
    expect(questionsFor("reinvention")).toHaveLength(7);
    expect(questionsFor("reinvention")[0]!.q).toBe("Where are you with the change?");
  });
});
