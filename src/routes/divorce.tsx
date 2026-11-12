import { useSiteSettings } from "@/lib/site-settings";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingCta, LoveLetter, PhotoPlaceholder, SectionHeading, Testimonials } from "@/components/site/bits";
import { VoiceNoteCard } from "@/components/site/VoiceNoteCard";
import { WhereAreYou } from "@/components/site/WhereAreYou";
import { publishedNotesQuery } from "@/lib/voice-notes";
import { seo } from "@/lib/seo";
import { site } from "@/config/site";
import samHero from "@/assets/sam-home-hero.webp.asset.json";

export const Route = createFileRoute("/divorce")({
  head: () =>
    seo(
      "Divorce coaching for parents | Sam Brindle Coaching",
      "Divorce is hard. Your mind doesn't have to make it harder. Free voice notes and 1:1 coaching for parents going through separation, from Sam Brindle.",
    ),
  component: DivorcePage,
});

const moments = [
  "Your stomach drops when your ex's name appears on your phone.",
  "The house goes silent when the kids leave, and you don't know what to do with yourself.",
  "It's 2am and you're replaying everything. Again.",
  "The guilt about how the kids are coping sits on your chest.",
  "You're not sure who you are anymore, now you're not half of something.",
  "You're busy every single second, so you don't have to feel any of it.",
];

const love = [
  { l: "L", name: "Look inwards", text: "Spot the patterns that have been running the show." },
  { l: "O", name: "Own your reality", text: "Separate what happened from the story you tell about it." },
  { l: "V", name: "Visualise the future", text: "Not a vision board. Your actual Tuesday evenings." },
  { l: "E", name: "Embodiment", text: "React differently in the moment, so old patterns stop repeating." },
];

function DivorcePage() {
  const heroSettings = useSiteSettings();
  const { data: notes } = useQuery(publishedNotesQuery);
  const free = (notes ?? []).filter((n) => n.is_free && n.door === "divorce").slice(0, 2);

  return (
    <>
      {/* Hero */}
      <section className="container-page grid gap-10 pt-12 pb-16 md:grid-cols-[1.35fr_1fr] md:items-end md:pt-24 md:pb-24">
        <div>
          <p className="eyebrow mb-6">Divorce and separation</p>
          <h1 className="display-xl">Divorce is hard. Your mind doesn't have to make it harder.</h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Short voice notes for the moments that floor you, and 1:1 coaching when you're ready to stop just getting through it. From someone who's been there, with four kids in tow.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="marigold" size="lg"><Link to="/voice-notes">Listen free</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/book">Book a free call</Link></Button>
          </div>
        </div>
        <img src={heroSettings.heroDivorce || samHero.url} alt={heroSettings.heroDivorce ? heroSettings.heroDivorceAlt || "Sam Brindle" : "Sam Brindle outdoors among sunlit green foliage"} width={1400} height={934} fetchPriority="high" className="aspect-[4/5] w-full rounded-[28px] object-cover" />
      </section>

      {/* Sound familiar */}
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
        <p className="pull mt-10 max-w-xl text-2xl text-muted-foreground">None of that means you're doing it wrong. It means you're in it.</p>
      </section>


      {/* Both sides */}
      <section className="section container-page" aria-labelledby="both-sides">
        <SectionHeading eyebrow="Whichever side you're on" title={<span id="both-sides">Leaving and being left hurt differently.</span>} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] bg-card p-7 md:p-9">
            <p className="eyebrow">If you were the one who left</p>
            <p className="mt-5 text-2xl font-bold leading-snug tracking-tight">The guilt arrives on schedule. Usually at bedtime, usually when the kids ask why.</p>
            <p className="mt-4 text-lg text-muted-foreground">Leaving doesn't make you the villain. It makes you someone who made a hard call and now has to live with it kindly. We work on the guilt, so it stops making your decisions for you.</p>
          </div>
          <div className="rounded-[24px] bg-card p-7 md:p-9">
            <p className="eyebrow">If you were the one who was left</p>
            <p className="mt-5 text-2xl font-bold leading-snug tracking-tight">Shock first. Then anger. Then the bits of the story you keep rewriting.</p>
            <p className="mt-4 text-lg text-muted-foreground">You didn't choose this, and you're allowed to be furious. The work is making sure the anger doesn't get to run the next ten years. You get to choose what happens now.</p>
          </div>
        </div>
      </section>

      <WhereAreYou door="divorce" />

      {/* Voice notes teaser */}
      <section className="section container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Voice notes" title="Press play when it hits.">
            Five-minute notes for specific moments. Like a friend who knows what to say, and doesn't take sides.
          </SectionHeading>
          <Button asChild variant="link" className="px-0 text-base">
            <Link to="/voice-notes">See the whole library <ArrowRight /></Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {free.map((n) => <VoiceNoteCard key={n.id} note={n} locked={false} />)}
          {!notes && [0, 1].map((i) => <div key={i} className="h-64 animate-pulse rounded-[24px] bg-card" />)}
        </div>
      </section>

      {/* LOVE dark band */}
      <section className="bg-ink text-ink-foreground" aria-labelledby="love">
        <div className="section container-page">
          <p className="eyebrow mb-4 text-ink-muted">The method</p>
          <h2 id="love" className="display-lg max-w-2xl">Four letters. One way out of the loop.</h2>
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

      {/* Story teaser */}
      <section className="section container-page grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center md:gap-16">
        <PhotoPlaceholder label="Photo of Sam walking on the beach in Maresme" className="aspect-[5/6] w-full" />
        <div>
          <p className="eyebrow mb-5">Hello, I'm Sam</p>
          <h2 className="display-lg">I'm not a guru. I'm a parent who got stuck, and found a way out.</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            In 2021 I ended a ten-year marriage with four young children, a long way from home. Then I spent a year very busy and very distracted. The real work started on a Monday evening walk.
          </p>
          <Button asChild variant="link" className="mt-6 px-0 text-base"><Link to="/about">Read my story <ArrowRight /></Link></Button>
        </div>
      </section>

      {/* Before / after */}
      <section className="section border-t border-border container-page">
        <SectionHeading eyebrow="What changes" title="Same situation. Different you in it." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[24px] border border-border p-7 md:p-9">
            <p className="eyebrow">Now</p>
            <ul className="mt-6 space-y-4 text-lg text-muted-foreground">
              <li>You draft the reply to your ex four times, then send the angry one.</li>
              <li>Weekends without the kids feel like a hole.</li>
              <li>You second-guess every decision, then the one after.</li>
              <li>Everything feels like a threat.</li>
            </ul>
          </div>
          <div className="rounded-[24px] bg-card p-7 md:p-9">
            <p className="eyebrow">After</p>
            <ul className="mt-6 space-y-4 text-lg font-medium">
              <li>You reply once, calmly, when you're ready.</li>
              <li>You're present with the kids, and actually enjoy your time alone.</li>
              <li>You trust your own decisions again.</li>
              <li>You start to see possibilities. Annoyingly, there are quite a few.</li>
            </ul>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Programme teaser */}
      <section className="container-page pb-16 md:pb-24">
        <div className="grid gap-8 border-t border-border pt-14 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <p className="eyebrow mb-4">Work with me</p>
            <h2 className="display-lg">{site.programme.name}</h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Six months, one to one. Twelve private 90-minute sessions, WhatsApp support in between, and the full voice note library. You can start the day you decide to leave. You don't need to wait for the paperwork.
            </p>
            <Button asChild variant="default" size="lg" className="mt-7"><Link to="/work-with-me">See how it works</Link></Button>
          </div>
        </div>
      </section>

      <BookingCta />
    </>
  );
}
