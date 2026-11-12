import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const deck = [
  { text: "The marriage ended.", answer: "fact", reply: "Hard, true, and survivable. Leave it on its own for a minute." },
  { text: "I've ruined my kids.", answer: "story", reply: "That's a forecast, not a fact. Kids cope with change. What they struggle with is a parent stuck in the story." },
  { text: "I lost my job.", answer: "fact", reply: "Yes. A job ended. You're still here, with every skill you had on Friday." },
  { text: "Nobody will hire me at 50.", answer: "story", reply: "\"Nobody\" is doing a lot of work there. Some places won't. That's not the same thing." },
  { text: "My ex sent a message at 11pm.", answer: "fact", reply: "Fact. What you do with it, and when, is up to you. Morning is a fine time to reply." },
  { text: "I'll be alone forever.", answer: "story", reply: "Nobody can see forever. Not even you, at 2am, though it feels like it." },
  { text: "Everyone thinks I've failed.", answer: "story", reply: "Have you asked everyone? Most people are far too busy worrying about themselves." },
] as const;

export function FactOrStory() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<"fact" | "story" | null>(null);
  const [right, setRight] = useState(0);
  const done = i >= deck.length;
  const card = deck[i];

  const pick = (p: "fact" | "story") => {
    if (picked || !card) return;
    setPicked(p);
    if (p === card.answer) setRight((r) => r + 1);
  };

  if (done)
    return (
      <div className="rounded-[28px] bg-ink p-8 text-ink-foreground md:p-12" role="status">
        <p className="eyebrow text-ink-muted">That's the deck</p>
        <h3 className="mt-3 text-3xl md:text-4xl">You sorted {right} of {deck.length} the way I would.</h3>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">Doesn't matter if you didn't. The point is the pause before you decide. Try it on your own thoughts this week. A voice note helps.</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild variant="marigold" size="lg"><Link to="/voice-notes">Listen to a voice note</Link></Button>
          <Button variant="inkOutline" size="lg" onClick={() => { setI(0); setPicked(null); setRight(0); }}>Shuffle again</Button>
        </div>
      </div>
    );

  return (
    <div className="rounded-[28px] bg-card p-6 md:p-12">
      <p className="text-sm text-soft">Thought {i + 1} of {deck.length}</p>
      <p className="mt-6 min-h-24 font-serif text-3xl italic leading-snug md:text-4xl">“{card!.text}”</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {(["fact", "story"] as const).map((p) => (
          <Button key={p} size="lg" variant={picked === p ? "default" : "outline"} disabled={!!picked && picked !== p} onClick={() => pick(p)} className="min-w-32 capitalize">
            {p}
          </Button>
        ))}
      </div>
      {picked && (
        <div className="mt-8 border-t border-border pt-6" aria-live="polite">
          <p className="font-semibold">{picked === card!.answer ? "Agreed." : `I'd call that a ${card!.answer}.`}</p>
          <p className="mt-2 text-lg text-muted-foreground">{card!.reply}</p>
          <Button className="mt-6" onClick={() => { setI(i + 1); setPicked(null); }}>Next thought</Button>
        </div>
      )}
    </div>
  );
}
