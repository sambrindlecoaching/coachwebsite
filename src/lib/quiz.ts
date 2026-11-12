/** "Is this coaching right for me?" quiz. Each answer scores 0-2; max 14. */
export const quizQuestions = [
  { q: "Where are you with the separation?", a: ["Thinking about it", "Just happened, or happening now", "A while ago, but I'm still stuck"] },
  { q: "When a message from your ex lands, you…", a: ["Feel fine, mostly", "Feel a jolt, but cope", "Feel it in your whole body for hours"] },
  { q: "When the kids are away, the house feels…", a: ["Peaceful, honestly", "Odd, a bit empty", "Unbearable, so I fill every minute"] },
  { q: "How often are you awake replaying things?", a: ["Rarely", "Some nights", "Most nights"] },
  { q: "How much do you trust your own decisions right now?", a: ["Quite a lot", "On a good day", "Not much at all"] },
  { q: "What would help most?", a: ["Something to listen to, now and then", "A few practical tools", "Someone in my corner, regularly"] },
  { q: "Are you ready to look at your own patterns, not just theirs?", a: ["Not really, not yet", "Maybe, with some help", "Yes, I'm tired of the loop"] },
] as const;

/** First question: which life event. Each door then has its own 7 questions. */
export const doorQuestion = { q: "What's changed?", a: [{ key: "divorce", label: "A separation or divorce" }, { key: "reinvention", label: "A job loss or career change" }] } as const;
export type QuizDoor = (typeof doorQuestion.a)[number]["key"];

export const reinventionQuestions = [
  { q: "Where are you with the change?", a: ["Still in the job, but it's wobbling", "It's just happened", "It happened a while ago and I'm stuck"] },
  { q: "When someone asks what you do, you…", a: ["Answer easily", "Feel a jolt, but manage", "Change the subject, or dread it for days"] },
  { q: "Weekday mornings feel…", a: ["Fine, a nice change", "Odd and shapeless", "Long and heavy"] },
  { q: "How often does money worry wake you?", a: ["Rarely", "Some nights", "Most nights"] },
  { q: "How much do you trust your own judgement about what's next?", a: ["Quite a lot", "On a good day", "Not much at all"] },
  { q: "What would help most?", a: ["Something to listen to, now and then", "A few practical tools", "Someone in my corner, regularly"] },
  { q: "Are you ready to look at what the job meant to you, not just the next one?", a: ["Not really, not yet", "Maybe, with some help", "Yes, I'm tired of the loop"] },
] as const;

export function questionsFor(door: QuizDoor) {
  return door === "reinvention" ? reinventionQuestions : quizQuestions;
}

export type QuizResult = { key: "listen" | "reset" | "programme"; title: string; body: string };

export function scoreQuiz(answers: number[]): { score: number; result: QuizResult } {
  const score = answers.reduce((s, a) => s + a, 0);
  if (score <= 5)
    return {
      score,
      result: {
        key: "listen",
        title: "You're doing better than you think.",
        body: "You probably don't need six months of coaching right now. Start with a voice note or two and keep them for the wobbly days.",
      },
    };
  if (score <= 9)
    return {
      score,
      result: {
        key: "reset",
        title: "A bit of help would go a long way.",
        body: "You're coping, but it's costing you. A free call is a good next step: we can work out whether a single reset or the full programme makes more sense.",
      },
    };
  return {
    score,
    result: {
      key: "programme",
      title: "You don't have to keep carrying this alone.",
      body: "What you're describing is exhausting, and very common. This is exactly what LOVE RE-Coded is for. Let's have a free, no-pressure chat.",
    },
  };
}
