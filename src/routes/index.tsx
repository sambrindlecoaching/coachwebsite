import { useSiteSettings } from "@/lib/site-settings";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingCta, LoveLetter, SectionHeading, Testimonials } from "@/components/site/bits";
import { VoiceNoteCard } from "@/components/site/VoiceNoteCard";
import { WhereAreYou } from "@/components/site/WhereAreYou";
import { WaitlistForm } from "@/components/site/WaitlistForm";
import { PHASE2 } from "@/config/features";
import { publishedNotesQuery } from "@/lib/voice-notes";
import { seo } from "@/lib/seo";
import { site } from "@/config/site";
import samHero from "@/assets/sam-home-hero.webp.asset.json";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Sam Brindle Coaching | The LOVE method for when life changes",
      "Life changed. Your mind hasn't caught up yet. Voice notes and 1:1 coaching with Sam Brindle for divorce, job loss and starting again.",
    ),
  component: Home,
});

const love = [
  { l: "L", name: "Look inwards", text: "Spot the patterns running the show." },
  { l: "O", name: "Own your reality", text: "Separate what happened from the story." },
  { l: "V", name: "Visualise the future", text: "Your actual Tuesday evenings." },
  { l: "E", name: "Embodiment", text: "React differently, in the moment." },
];

function Home() {
  const heroSettings = useSiteSettings();
  const { data: notes } = useQuery(publishedNotesQuery);
  const sample = (notes ?? []).filter((n) => n.is_free).slice(0, 2);

  return (
    <>
      <section className="container-page grid gap-10 pt-12 pb-16 md:grid-cols-[1.35fr_1fr] md:items-end md:pt-24 md:pb-24">
        <div>
          <p className="eyebrow mb-6">Sam Brindle · The LOVE method</p>
          <h1 className="display-xl">Life changed. Your mind hasn't caught up yet.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            For the moments when everything shifts and your head gets very loud. A divorce, a job that ended, a new start you didn't quite plan. Short voice notes, a practical method, and someone who's been there.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="marigold" size="lg"><a href="#where-now">Going through a divorce?</a></Button>
            <Button asChild variant="outline" size="lg"><Link to="/book">Book a free call</Link></Button>
          </div>
        </div>
        <img src={heroSettings.heroHome || samHero.url} alt={heroSettings.heroHome ? heroSettings.heroHomeAlt || "Sam Brindle" : "Sam Brindle outdoors among sunlit green foliage"} width={1400} height={934} fetchPriority="high" className="aspect-[4/5] w-full rounded-[28px] object-cover" />
      </section>

      <section className="bg-ink text-ink-foreground" aria-labelledby="love">
        <div className="section container-page">
          <p className="eyebrow mb-4 text-ink-muted">The method</p>
          <h2 id="love" className="display-lg max-w-2xl">Four letters. Works on most kinds of upheaval.</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {love.map((s) => (
              <li key={s.l} className="border-t border-ink-line pt-5">
                <LoveLetter letter={s.l} className="text-[4rem] md:text-[4.5rem]" />
                <h3 className="mt-2 text-lg">{s.name}</h3>
                <p className="mt-1 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <Button asChild variant="inkOutline" size="lg" className="mt-12"><Link to="/method">See how it works</Link></Button>
        </div>
      </section>

      <WhereAreYou door="divorce" />

      <section className="section border-t border-border container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Voice notes" title="Press play when it hits." />
          <Button asChild variant="link" className="px-0 text-base"><Link to="/voice-notes">The whole library <ArrowRight /></Link></Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sample.map((n) => <VoiceNoteCard key={n.id} note={n} locked={false} />)}
          {!notes && [0, 1].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-card" />)}
        </div>
      </section>

      <Testimonials />

      {PHASE2 && (
      <section className="container-page pb-16 md:pb-24">
        <div className="grid gap-8 rounded-[28px] border border-border p-8 md:grid-cols-[1.3fr_1fr] md:items-center md:p-12">
          <div>
            <p className="eyebrow mb-3">Coming 2027</p>
            <h2 className="display-lg">{site.course.name}.</h2>
            <p className="mt-2 text-xl text-muted-foreground">{site.course.subtitle}</p>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">A core module on the method, then one for each life event. For the school run, the dog walk, the bit before sleep.</p>
          </div>
          <WaitlistForm item="love-audio-course" label="Tell me when the course opens" />
        </div>
      </section>

      )}

      <BookingCta />
    </>
  );
}
