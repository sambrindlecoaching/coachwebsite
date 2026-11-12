import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { BookingCta, LoveLetter, PageIntro } from "@/components/site/bits";
import { PHASE2 } from "@/config/features";
import { site } from "@/config/site";
import { seo } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { productsQuery } from "@/lib/products";

export const Route = createFileRoute("/work-with-me")({
  head: () =>
    seo(
      "Work with me: LOVE RE-Coded | Sam Brindle Coaching",
      "1:1 coaching with Sam (LOVE RE-Coded, €400/month, €2,400 total), the Wake Up Call (€129, one 90-minute session) and a free call. How the LOVE method works.",
    ),
  component: WorkPage,
});

const love = [
  { l: "L", name: "Look inwards", text: "Spot the patterns running the show." },
  { l: "O", name: "Own your reality", text: "Separate what happened from the story." },
  { l: "V", name: "Visualise the future", text: "Your actual Tuesday evenings." },
  { l: "E", name: "Embodiment", text: "React differently, in the moment." },
];

const included = [
  ["12", "private 90-minute sessions, every two weeks"],
  ["WhatsApp", "support between sessions, for when it actually happens"],
  ["Library", "every voice note and worksheet, yours to keep"],
  ["Online", "from wherever you are, in English"],
];

const forYou = [
  "You're separating, divorcing, or quietly deciding to.",
  "You're functioning fine on the outside and not so fine at 2am.",
  "You want practical tools, not just a place to vent.",
  "You're ready to look at your own part, without beating yourself up about it.",
  "You'd like your kids to remember this time as the time things got calmer.",
];

const notFor = [
  "You're in crisis or feel unsafe. Please contact local emergency services or a crisis line first.",
  "You want someone to agree your ex is a monster. (They might be. That's not the work.)",
  "You're after legal or financial advice. That's your lawyer's job.",
  "You'd like a quick fix in one session. It's a practice, not a pill.",
];

function WorkPage() {
  const p = site.programme;
  const { data: products = [] } = useQuery(productsQuery);
  return (
    <>
      <PageIntro eyebrow="Work with me" title={<>{p.name}</>}>
        Six months, one to one. For parents who are done just getting through it.
      </PageIntro>

      <section className="bg-ink text-ink-foreground mb-16" aria-labelledby="method-h">
        <div className="section container-page">
          <p className="eyebrow mb-4 text-ink-muted">The method</p>
          <h2 id="method-h" className="display-lg max-w-2xl">LOVE. Four letters, one at a time.</h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {love.map((s) => (
              <li key={s.l} className="border-t border-ink-line pt-5">
                <LoveLetter letter={s.l} className="text-[4rem] md:text-[4.5rem]" />
                <h3 className="mt-2 text-lg">{s.name}</h3>
                <p className="mt-1 text-ink-muted">{s.text}</p>
              </li>
            ))}
          </ol>
          <Button asChild variant="inkOutline" size="lg" className="mt-12"><Link to="/method">More on the method</Link></Button>
        </div>
      </section>

      <section className="container-page pb-6" aria-labelledby="with-me">
        <p className="eyebrow mb-3">One to one</p>
        <h2 id="with-me" className="display-lg">With me</h2>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">The 1:1 programme, a single Wake Up Call, or a free call to see if we fit.</p>
      </section>
      <section className="container-page pb-16">
        <div className="grid gap-px overflow-hidden rounded-[28px] bg-border md:grid-cols-4">
          {included.map(([a, b]) => (
            <div key={a} className="bg-card p-7">
              <p className="text-3xl font-bold tracking-tight">{a}</p>
              <p className="mt-2 text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-8 rounded-[28px] bg-ink p-8 text-ink-foreground md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <p className="text-5xl font-bold tracking-tight md:text-6xl">€{p.pricePerMonth}<span className="text-2xl font-semibold text-ink-muted"> / month</span></p>
            <p className="mt-3 text-ink-muted">For {p.months} months, €{p.totalPrice.toLocaleString("en-GB")} in total. [VAT and payment terms to confirm]</p>
            <p className="pull mt-6 max-w-lg text-xl">You can start the day you decide to leave. You don't need to wait for the paperwork.</p>
          </div>
          <Button asChild variant="marigold" size="lg"><Link to="/book">Book a free call first</Link></Button>
        </div>
      </section>

      <section className="section border-t border-border container-page grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-3xl">This is for you if…</h2>
          <ul className="mt-8 space-y-4 text-lg">
            {forYou.map((x) => (
              <li key={x} className="flex gap-3"><span aria-hidden className="mt-2.5 size-2.5 shrink-0 rounded-full bg-marigold" />{x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl">Probably not, if…</h2>
          <ul className="mt-8 space-y-4 text-lg text-muted-foreground">
            {notFor.map((x) => (
              <li key={x} className="flex gap-3"><span aria-hidden className="mt-2.5 size-2.5 shrink-0 rounded-full border border-soft" />{x}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-6 rounded-[28px] border border-border p-8 md:grid-cols-[1.4fr_1fr] md:items-center md:p-12">
          <div>
            <p className="eyebrow mb-3">Smaller step · one {site.resetSession.minutes}-minute session</p>
            <h2 className="text-3xl md:text-4xl">{site.resetSession.name}</h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              {site.resetSession.minutes} minutes, one specific thing. A big conversation coming up, a decision you keep circling, a week that's gone sideways. You leave with a plan.
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-3xl font-bold">{site.resetSession.price}</p>
            <Button asChild variant="outline" size="lg" className="mt-4"><Link to="/book">Book a Wake Up Call</Link></Button>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-6 rounded-[28px] bg-card p-8 md:grid-cols-[1.4fr_auto] md:items-center md:p-12">
          <div>
            <p className="eyebrow mb-3">Start here</p>
            <h2 className="text-3xl md:text-4xl">A free call</h2>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">A free [30]-minute call. No pitch. We see whether this is the right thing, right now.</p>
          </div>
          <Button asChild variant="marigold" size="lg"><Link to="/book">Book a free call</Link></Button>
        </div>
      </section>

      {PHASE2 && <section id="on-your-own" className="section scroll-mt-24 border-t border-border container-page" aria-labelledby="on-your-own-title">
        <p className="eyebrow mb-3">Self-guided</p>
        <h2 id="on-your-own-title" className="display-lg">On your own</h2>
        <p className="mt-3 max-w-xl text-lg text-muted-foreground">{site.course.name}, {site.course.subtitle}, plus audio packs and templates. Prices in [square brackets] aren't set yet.</p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.filter((x) => x.kind !== "service").map((x) => <ProductCard key={x.id} p={x} />)}
        </div>
      </section>}

      <BookingCta />
    </>
  );
}
