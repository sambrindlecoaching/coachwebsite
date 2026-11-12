import { createFileRoute, Link } from "@tanstack/react-router";
import { articles } from "@/content/journal";
import { doors, openDoors } from "@/content/doors";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/journal/")({
  head: () =>
    seo(
      "The Blog | Sam Brindle Coaching",
      "Short, honest pieces from Sam Brindle on separation and divorce. Read them, try the questions, listen to Sam read them aloud.",
    ),
  component: JournalIndex,
});

function JournalIndex() {
  const [lead, ...rest] = articles.filter((a) => openDoors.some((d) => d.key === a.door));
  return (
    <>
      <header className="container-page border-b border-border pt-12 pb-8 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(3.5rem,11vw,9rem)] font-bold leading-[0.85] tracking-tighter">The Blog</h1>
          <p className="text-sm font-semibold text-soft">Issue 01 · Autumn 2026 · [Drafts for review]</p>
        </div>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">Things I've learnt the hard way, written down so you don't have to. Mostly short. Occasionally useful at 2am.</p>
      </header>

      {lead && (
        <section className="container-page py-12 md:py-16" aria-label="Featured">
          <Link to="/journal/$slug" params={{ slug: lead.slug }} className="group grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div className="rounded-[28px] bg-ink p-8 text-ink-foreground md:p-14">
              <p className="eyebrow text-ink-muted">Lead piece · {doors[lead.door].name}</p>
              <h2 className="mt-6 text-4xl font-bold leading-[1.02] tracking-tight group-hover:underline md:text-6xl">{lead.title}</h2>
            </div>
            <div>
              <p className="font-serif text-2xl leading-snug">{lead.standfirst}</p>
              <p className="mt-5 text-sm font-semibold text-soft">{lead.minutes} min read{lead.draft && " · Draft"}</p>
            </div>
          </Link>
        </section>
      )}

      {openDoors.map((d) => {
        const list = rest.filter((a) => a.door === d.key);
        if (!list.length) return null;
        return (
          <section key={d.key} className="container-page border-t border-border py-12" aria-labelledby={`sec-${d.key}`}>
            <div className="grid gap-8 md:grid-cols-[220px_1fr]">
              <h2 id={`sec-${d.key}`} className="text-sm font-bold uppercase tracking-[0.18em]">{d.name}</h2>
              <ol className="divide-y divide-border">
                {list.map((a, i) => (
                  <li key={a.slug} className="py-6 first:pt-0">
                    <Link to="/journal/$slug" params={{ slug: a.slug }} className="group grid gap-3 md:grid-cols-[3rem_1fr_auto] md:items-baseline">
                      <span className="text-sm font-semibold tabular-nums text-soft">0{i + 1}</span>
                      <span>
                        <span className="block text-2xl font-bold tracking-tight group-hover:underline md:text-3xl">{a.title}</span>
                        <span className="mt-2 block font-serif text-lg text-muted-foreground">{a.standfirst}</span>
                      </span>
                      <span className="text-sm text-soft">{a.minutes} min{a.draft && " · Draft"}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        );
      })}
    </>
  );
}
