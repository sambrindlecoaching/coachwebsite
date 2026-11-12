import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { BookingCta, LoveLetter, PageIntro, SectionHeading } from "@/components/site/bits";
import { seo } from "@/lib/seo";
import { TriggerLoop } from "@/components/site/TriggerLoop";
import { FactOrStory } from "@/components/site/FactOrStory";

export const Route = createFileRoute("/method")({
  head: () =>
    seo(
      "The LOVE method | Sam Brindle Coaching",
      "Look inwards, Own your reality, Visualise the future, Embodiment. A practical, forward-looking method for parents going through separation and divorce.",
    ),
  component: MethodPage,
});

const stages = [
  { l: "L", name: "Look inwards", body: "Understand the patterns that have been running the show. Most of them have been there since childhood, quietly making decisions on your behalf. We find them, name them, and stop letting them drive." },
  { l: "O", name: "Own your reality", body: "It is what it is. We separate fact from story, because the fact is usually survivable and the story usually isn't. Acceptance isn't approval. It just means you stop arguing with what's already happened." },
  { l: "V", name: "Visualise the future", body: "Not a vision board. What do you want your Tuesday evenings to look like? Your weekends without the kids? Small, specific, real. That's what we build towards." },
  { l: "E", name: "Embodiment", body: "Change how you react in the moment, in your body, not just your head. So when the message lands or the door closes, old patterns stop repeating themselves." },
];

const steps = [
  { n: "1", t: "Find the belief", d: "The quiet rule underneath: “I have to keep everyone happy.”" },
  { n: "2", t: "Spot the trigger", d: "The email, the handover, the silence. Notice what sets it off." },
  { n: "3", t: "Make space", d: "A breath, a walk, a pause before the reply. Space is where choice lives." },
  { n: "4", t: "Choose differently", d: "One small, different response. Then another. That's the whole trick." },
];

const compare = [
  {
    who: "A therapist",
    good: "Deep, valuable work on the past and your mental health. If you need it, please have it.",
    gap: "Often slower and past-focused. Coaching sits alongside: practical, about what you do this week.",
  },
  {
    who: "A lawyer",
    good: "Handles the legal side properly. You need one.",
    gap: "Expensive by the hour, and not there for the 2am bit. My lawyer is not my therapist, and neither is yours.",
  },
  {
    who: "A friend",
    good: "Loves you, turns up with wine, says your ex is awful.",
    gap: "Takes sides, which feels lovely and keeps you stuck. Also, they're tired.",
  },
  {
    who: "Doing it alone",
    good: "Free. Private. Nobody to explain yourself to.",
    gap: "You go round in circles. The same thoughts, the same reactions, the same Sunday nights.",
  },
];

const sam = [
  "Forward-looking and practical, not just talking it through",
  "Someone who has been through it, with four kids",
  "Neutral. Firmly on your side, never against your ex",
  "Support between sessions, when the moment actually happens",
  "A method you keep, long after we finish",
];

const gains = [
  "Reply to your ex from a calm place, not a hurt one.",
  "Be present with your kids, and enjoy your time alone when they're away.",
  "Trust your own decisions again.",
  "Stop judging yourself for every wobble.",
  "See possibilities instead of threats.",
];

function MethodPage() {
  return (
    <>
      <PageIntro eyebrow="The LOVE method" title="A way of noticing your thoughts, instead of obeying them.">
        I built LOVE by reverse-engineering my own messy year. It isn't magic. It's four stages, practised until they're habit.
      </PageIntro>

      <section className="bg-ink text-ink-foreground">
        <div className="section container-page">
          <ol className="grid gap-px overflow-hidden rounded-[28px] bg-ink-line md:grid-cols-2">
            {stages.map((s) => (
              <li key={s.l} className="bg-ink p-8 md:p-12">
                <LoveLetter letter={s.l} />
                <h2 className="mt-4 text-3xl">{s.name}</h2>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section container-page">
        <SectionHeading eyebrow="Every day" title="Four small steps, in real life.">
          The stages are the map. These are the footsteps, for the moment something sets you off.
        </SectionHeading>
        <ol className="mt-14 grid gap-5 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.n} className="relative rounded-[24px] bg-card p-7">
              <span className="flex size-10 items-center justify-center rounded-full bg-marigold font-bold">{s.n}</span>
              <h3 className="mt-6 text-xl">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
              {i < 3 && <span aria-hidden className="absolute -right-4 top-1/2 hidden text-2xl text-soft md:block">→</span>}
            </li>
          ))}
        </ol>
      </section>

      <section className="section border-t border-border container-page">
        <SectionHeading eyebrow="Honestly" title="Why a coach, and not…">
          Everyone below is useful. Some of them you'll need anyway. Here's where I fit.
        </SectionHeading>
        <div className="mt-14 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
          <ul className="grid gap-4">
            {compare.map((c) => (
              <li key={c.who} className="rounded-[24px] border border-border p-6 md:p-7">
                <h3 className="text-2xl">{c.who}</h3>
                <p className="mt-4 flex gap-3"><Check aria-hidden className="mt-1 size-4 shrink-0" /><span><span className="sr-only">Good: </span>{c.good}</span></p>
                <p className="mt-2 flex gap-3 text-muted-foreground"><Minus aria-hidden className="mt-1 size-4 shrink-0" /><span><span className="sr-only">Limit: </span>{c.gap}</span></p>
              </li>
            ))}
          </ul>
          <div className="self-start rounded-[28px] bg-ink p-8 text-ink-foreground md:sticky md:top-24 md:p-10">
            <p className="eyebrow text-ink-muted">With Sam</p>
            <h3 className="mt-3 text-3xl">Complementary, not instead of.</h3>
            <ul className="mt-8 space-y-4">
              {sam.map((x) => (
                <li key={x} className="flex gap-3 text-lg"><span aria-hidden className="mt-2 size-2.5 shrink-0 rounded-full bg-marigold" />{x}</li>
              ))}
            </ul>
            <p className="pull mt-8 text-xl text-ink-muted">If you need therapy, I'll tell you. Plenty of my clients have both.</p>
          </div>
        </div>
      </section>

      <section className="section border-t border-border container-page">
        <SectionHeading eyebrow="Outcomes" title="What you actually gain." />
        <ul className="mt-12 divide-y divide-border border-y border-border">
          {gains.map((g, i) => (
            <li key={g} className="flex items-baseline gap-6 py-6">
              <span className="w-8 text-sm font-semibold tabular-nums text-soft">0{i + 1}</span>
              <span className="text-2xl font-semibold tracking-tight md:text-3xl">{g}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="section border-t border-border container-page" aria-labelledby="loop-h">
        <SectionHeading eyebrow="The trigger loop" title={<span id="loop-h">Same trigger. Different ending.</span>}>
          Most of us run the same loop for years. The trigger never changes much. What changes is the bit in the middle.
        </SectionHeading>
        <div className="mt-12"><TriggerLoop /></div>
      </section>

      <section className="section border-t border-border container-page" aria-labelledby="fos-h">
        <SectionHeading eyebrow="Try it" title={<span id="fos-h">Fact or story?</span>}>
          Sort each thought. No marks, no prizes. Just practice at telling the two apart.
        </SectionHeading>
        <div className="mt-12 max-w-3xl"><FactOrStory /></div>
      </section>

      <BookingCta title="Want to try it on your own situation?" />
    </>
  );
}
