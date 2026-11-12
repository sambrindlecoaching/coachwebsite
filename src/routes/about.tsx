import { createFileRoute } from "@tanstack/react-router";
import { BookingCta, PageIntro } from "@/components/site/bits";
import { seo } from "@/lib/seo";
import samPortrait from "@/assets/sam-about-portrait.webp.asset.json";
import samStory from "@/assets/sam-story.webp.asset.json";

export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About Sam Brindle | Divorce coach in Barcelona",
      "British, twenty years in Barcelona, four kids, one ten-year marriage ended in 2021. How Sam got stuck, found a way out, and built the LOVE method.",
    ),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About Sam" title="I'm not a guru. I'm a parent who got stuck, and found a way out." />

      <section className="container-page grid gap-10 pb-16 md:grid-cols-[1fr_1.3fr] md:gap-16">
        <div className="space-y-6">
          <img src={samPortrait.url} alt="Sam Brindle smiling outdoors" width={1400} height={934} fetchPriority="high" className="aspect-[4/5] w-full rounded-[28px] object-cover" />
          <img src={samStory.url} alt="Sam Brindle in a lilac top beside a stone wall" width={1274} height={849} loading="lazy" className="aspect-[3/2] w-full rounded-[28px] object-cover" />
        </div>
        <div className="max-w-xl space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p className="text-2xl font-semibold leading-snug tracking-tight text-foreground">
            In 2021 I ended a ten-year marriage. I had four young children and I was a long way from home.
          </p>
          <p>I'm British. I've lived in Barcelona for twenty years, which is long enough to feel at home and short enough to feel very foreign when everything falls apart.</p>
          <p>
            The first year, I was in survival mode. Busy, distracted, organised to within an inch of my life. Most evenings, when the house went quiet, I opened a can of beer. Then sometimes another. Nothing dramatic. Just enough not to feel it.
          </p>
          <p>
            One Monday, after the kids had gone to their dad's, I went for a walk instead of opening the first can. That was it. No epiphany, no sunset. Just a walk.
          </p>
          <p>
            That's where the real work started: noticing my thoughts instead of obeying them. Seeing which ones were facts, and which ones were stories I'd been telling myself since I was about seven.
          </p>
          <p>
            Later, I trained as a coach [qualification and year to confirm] and reverse-engineered my own messy journey into something other people could actually use. That became the LOVE method.
          </p>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="section container-page">
          <figure className="max-w-4xl">
            <blockquote className="pull text-[2rem] leading-tight md:text-[3.2rem]">
              “The marriage ending is a fact. ‘I've ruined everything’ is a story. Most of my work is helping you tell the two apart.”
            </blockquote>
            <figcaption className="mt-8 font-semibold text-marigold">Sam Brindle</figcaption>
          </figure>
        </div>
      </section>

      <section className="section container-page grid gap-6 md:grid-cols-3">
        {[
          ["Four", "children, now thriving, mostly. They're teenagers [ages to confirm]."],
          ["Twenty", "years in Barcelona. Currently in the Maresme, near the sea."],
          ["One", "rule: no coaching-speak. If I say “transformational”, you can leave."],
        ].map(([n, t]) => (
          <div key={n} className="rounded-[24px] bg-card p-7">
            <p className="text-4xl font-bold tracking-tight">{n}</p>
            <p className="mt-3 text-muted-foreground">{t}</p>
          </div>
        ))}
      </section>

      <BookingCta title="Sound like someone you could talk to?" />
    </>
  );
}
