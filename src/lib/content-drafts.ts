// Draft shapes per Content Studio format. Demo stands in for AI with these templates.

export const formats = {
  voice_note: { label: "Voice note", channel: "Voice notes" },
  reel: { label: "Instagram reel", channel: "Instagram" },
  carousel: { label: "Instagram carousel", channel: "Instagram" },
  linkedin: { label: "LinkedIn post", channel: "LinkedIn" },
  article: { label: "Journal article", channel: "Journal" },
  podcast: { label: "Podcast episode", channel: "Podcast" },
  book_chapter: { label: "Book chapter", channel: "Book" },
} as const;
export type Format = keyof typeof formats;

/** What each format's draft must contain, also sent to AI as the brief. */
export const formatSpec: Record<Format, string> = {
  voice_note: "A recording prompt, not a script: SITUATION (who is listening and when), OPENING LINE, 3-4 POINTS as short notes, CLOSING LINE.",
  reel: "HOOK (first 3 seconds), BEAT 1, BEAT 2, BEAT 3, ON-SCREEN TEXT, CAPTION, CALL TO ACTION (e.g. 'Comment CALM and I'll send you the voice note').",
  carousel: "SLIDE 1 to SLIDE 7 (6-8 slides, each one or two short lines; slide 1 is the hook, last is the call to action), then CAPTION.",
  linkedin: "A full LinkedIn post: short opening line, short paragraphs, one honest observation, a question at the end. No hashtag walls.",
  article: "KICKER, TITLE, STANDFIRST, BODY (several paragraphs), PULL QUOTE.",
  podcast: "Episode outline: cold open, what's going on, through the LOVE lens, one thing to try, sign-off.",
  book_chapter: "Chapter OUTLINE as sections, and LINKED PIECES listing existing published pieces it could draw on.",
};

type Src = { title: string; brief: string | null };
const bits = (p: Src) => (p.brief ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

export function draftFor(p: Src, f: Format, published: { title: string; channel: string | null }[] = []): string {
  const b = bits(p);
  const at = (i: number, d: string) => b[i] ?? d;
  switch (f) {
    case "voice_note":
      return `RECORDING PROMPT (not a script, say it your way)\n\nSITUATION: Someone listening when ${at(0, "the day has gone sideways").replace(/\.$/, "").toLowerCase()}.\nOPENING LINE: "If you're hearing this, ${p.title.toLowerCase().replace(/\?$/, "")} is probably on your mind."\n\nPOINTS\n- ${at(0, "Name what's happening")}\n- ${at(1, "Why it feels so big")}\n- Fact or story: which bit is which?\n- ${at(2, "One small thing to do in the next hour")}\n\nCLOSING LINE: "Press play again whenever you need. I'm not going anywhere."`;
    case "reel":
      return `HOOK (0-3s): "${p.title}"\nBEAT 1: ${at(0, "What it looks like")}\nBEAT 2: ${at(1, "What's actually going on")}\nBEAT 3: ${at(2, "One thing to try")}\nON-SCREEN TEXT: "${p.title}" / "Fact or story?" / "Comment CALM"\nCAPTION: ${at(0, "")} You're not the only one. ${at(2, "")}\nCALL TO ACTION: Comment CALM and I'll send you the voice note.`;
    case "carousel": {
      const slides = [p.title, at(0, "What it looks like"), at(1, "What's underneath"), "Fact or story?", "The fact: what actually happened.", "The story: what your mind added.", at(2, "One small thing to try this week"), "Comment CALM for the voice note."];
      return `${slides.map((s, i) => `SLIDE ${i + 1}: ${s}`).join("\n")}\n\nCAPTION: ${p.title}. ${at(0, "")} Save this for the next time it happens.`;
    }
    case "linkedin":
      return `${p.title}.\n\n${at(0, "It happens more than people say.")}\n\n${at(1, "And it's rarely about the thing itself.")}\n\nIn my work I ask one question first: what's the fact, and what's the story? The fact is usually small. The story is where the 3am thinking lives.\n\n${at(2, "Start there.")}\n\nWhat would you add?`;
    case "article":
      return `KICKER: [Door] · Journal\nTITLE: ${p.title}\nSTANDFIRST: ${at(0, "")}\n\nBODY\nOpen on one specific moment, told plainly.\n\n${at(1, "")}\n\nThe fact: …\nThe story: …\n\n${at(2, "")}\n\nPULL QUOTE: "The fact is small. The story is where you live."`;
    case "podcast":
      return `EPISODE: ${p.title}\n\n1. Cold open: a listener question\n2. What's going on (${at(0, "")})\n3. Through the LOVE lens\n4. One thing to try\n5. Sign-off`;
    case "book_chapter": {
      const linked = published.length ? published.map((x) => `- ${x.title}${x.channel ? ` (${x.channel})` : ""}`).join("\n") : "- None published yet";
      return `CHAPTER OUTLINE: ${p.title}\n\n1. Scene: my own version of this\n2. What I believed then\n3. ${at(0, "What I see in clients")}\n4. ${at(1, "The turn")}\n5. What changed, and what didn't\n\nLINKED PIECES\n${linked}`;
    }
  }
}
