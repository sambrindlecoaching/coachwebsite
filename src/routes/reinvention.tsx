import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PHASE2 } from "@/config/features";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingCta, LoveLetter, SectionHeading, Testimonials } from "@/components/site/bits";
import { VoiceNoteCard } from "@/components/site/VoiceNoteCard";
import { WhereAreYou } from "@/components/site/WhereAreYou";
import { publishedNotesQuery } from "@/lib/voice-notes";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reinvention")({
  beforeLoad: () => { if (!PHASE2) throw redirect({ to: "/" }); },
  head: () =>
    seo(
      "Coaching after job loss and career change | Sam Brindle Coaching",
      "Lost your job, changing career, starting again at 45? Short voice notes and 1:1 coaching with the LOVE method, for when the title goes and your mind gets loud.",
    ),
  component: ReinventionPage,
});

const moments = [
  "The Monday with nowhere to be.",
  "Telling people you lost your job, and watching their face do the sympathetic thing.",
  "Who am I without the title?",
  "Money fear at 3am, doing sums that never add up.",
  "Starting again at 45, next to people who were born after your first job.",
  "Refreshing your inbox for an answer to an application you sent a fortnight ago.",
];

const love = [
  { l: "L", name: "Look inwards", text: "What did the job actually give you? It's rarely just the salary." },
  { l: "O", name: "Own your reality", text: "A role ended. You didn't. Separate the fact from the verdict." },
  { l: "V", name: "Visualise the future", text: "Not a five-year plan. What you'd like a normal Wednesday to look like." },
  { l: "E", name: "Embodiment", text: "Walk into the interview as yourself, not as someone apologising." },
];

function ReinventionPage() {
  const { data: notes } = useQuery(publishedNotesQuery);
  const mine = (notes ?? []).filter((n) => n.door === "reinvention").slice(0, 3);

  return (
    <>
      <section className="container-page pt-12 pb-16 md:pt-24 md:pb-24">
        <p className="eyebrow mb-6">Job loss, career change, starting again</p>
        <h1 className="display-xl max-w-5xl">You lost a job. Not the person who was good at it.</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          When work ends, it takes the routine, the people and a fair slice of who you thought you were. Short voice notes for the wobbly bits, and 1:1 coaching for building what comes next.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild variant="marigold" size="lg"><Link to="/voice-notes" search={{ door: "reinvention" }}>Listen free</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/book">Book a free call</Link></Button>
        </div>
      </section>

      <section className="section border-t border-border container-page" aria-labelledby="familiar">
        <h2 id="familiar" className="display-lg">Sound familiar?</h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[24px] bg-border sm:grid-cols-2 lg:grid-cols-3">
          {moments.map((m, i) => (
            <li key={m} className="bg-card p-7">
              <span className="text-sm font-semibold tabular-nums text-soft">0{i + 1}</span>
              <p className="mt-4 text-xl font-semibold leading-snug tracking-tight">{m}</p>
            </li>
          ))}
        </ul>
        <p className="pull mt-10 max-w-xl text-2xl text-muted-foreground">You're not on holiday and you're not in crisis. You're in between. That's allowed.</p>
      </section>

      <WhereAreYou door="reinvention" />

      <section className="section container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Voice notes" title="For the in-between days." />
          <Button asChild variant="link" className="px-0 text-base">
            <Link to="/voice-notes" search={{ door: "reinvention" }}>All reinvention notes <ArrowRight /></Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {mine.map((n) => <VoiceNoteCard key={n.id} note={n} locked={!n.is_free} />)}
          {!notes && [0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-card" />)}
        </div>
      </section>

      <section className="bg-ink text-ink-foreground" aria-labelledby="love">
        <div className="section container-page">
          <p className="eyebrow mb-4 text-ink-muted">The method</p>
          <h2 id="love" className="display-lg max-w-2xl">Same four letters. Different Monday.</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            {love.map((s) => (
              <li key={s.l} className="border-t border-ink-line pt-6">
                <LoveLetter letter={s.l} />
                <h3 className="mt-3 text-xl">{s.name}</h3>
                <p className="mt-2 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <Button asChild variant="inkOutline" size="lg" className="mt-14"><Link to="/method">How the LOVE method works</Link></Button>
        </div>
      </section>

      <Testimonials only={["Sami Schneider", "Lydia Barker"]} />
      <BookingCta title="Starting again? Start with a chat." />
    </>
  );
}
