import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceNoteCard } from "@/components/site/VoiceNoteCard";
import { BookingCta } from "@/components/site/bits";
import { articleBySlug, type Block } from "@/content/journal";
import { doors } from "@/content/doors";
import { publishedNotesQuery } from "@/lib/voice-notes";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const a = articleBySlug(params.slug);
    if (!a) throw notFound();
    return { article: a };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    const title = a ? `${a.title} | The Blog` : "Not found | The Blog";
    const desc = a?.standfirst ?? "This piece isn't here.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
        ...(a ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const { data: notes = [] } = useQuery(publishedNotesQuery);
  const listen = notes.find((n) => n.title === a.listenTitle);
  const related = notes.filter((n) => n.door === a.door && n.id !== listen?.id).slice(0, 2);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(1, h.scrollTop / max) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  let firstP = true;
  const render = (b: Block, i: number) => {
    switch (b.t) {
      case "p": {
        const cap = firstP;
        firstP = false;
        return <p key={i} className={cap ? "drop-cap" : undefined}>{b.text}</p>;
      }
      case "h":
        return <h2 key={i} className="pt-4 font-display text-3xl font-bold tracking-tight">{b.text}</h2>;
      case "quote":
        return (
          <blockquote key={i} className="my-10 border-y border-border py-8 text-center font-serif text-3xl italic leading-snug md:-mx-16 md:text-4xl">
            “{b.text}”
          </blockquote>
        );
      case "margin":
        return (
          <div key={i} className="md:relative">
            <p>{b.p}</p>
            <aside className="mt-4 font-sans text-sm font-semibold text-soft md:absolute md:top-1 md:-right-64 md:mt-0 md:w-52 lg:-right-72">
              <span className="mb-2 block h-px w-8 bg-marigold" aria-hidden />
              {b.text}
            </aside>
          </div>
        );
      case "try":
        return <TryThis key={i} slug={a.slug} questions={b.questions} />;
      case "listen":
        return listen ? (
          <div key={i} className="not-prose my-10 font-sans">
            <p className="eyebrow mb-3">Listen to Sam read this</p>
            <VoiceNoteCard note={listen} locked={false} />
          </div>
        ) : null;
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
        <div className="h-full bg-marigold" style={{ width: `${progress * 100}%` }} />
      </div>
      <article className="container-page pt-12 pb-16 md:pt-20">
        <header className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">
            <Link to="/journal" className="underline underline-offset-4">The Blog</Link> · {doors[a.door].name} · {a.minutes} min read
          </p>
          {a.draft && <p className="mt-3 inline-block rounded-full border border-border px-3 py-1 text-xs font-semibold text-soft">Draft · demo text for Sam to review</p>}
          <h1 className="mt-6 text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[0.95] tracking-tight">{a.title}</h1>
          <p className="mx-auto mt-7 max-w-2xl font-serif text-xl leading-relaxed text-muted-foreground md:text-2xl">{a.standfirst}</p>
          <p className="mt-6 text-sm font-semibold">By Sam Brindle</p>
        </header>
        <div className="journal-body mx-auto mt-14 max-w-[38rem] space-y-6 md:mr-auto md:ml-[max(0px,calc(50%-26rem))]">
          {a.body.map(render)}
        </div>
      </article>

      {related.length > 0 && (
        <section className="container-page border-t border-border py-14">
          <p className="eyebrow mb-8">Related voice notes</p>
          <div className="grid gap-5 md:grid-cols-2">
            {related.map((n) => <VoiceNoteCard key={n.id} note={n} locked={!n.is_free} />)}
          </div>
        </section>
      )}
      <BookingCta title="If this one landed, let's talk.">
        A free [30]-minute call. No pitch. We look at where you are, and whether I can help.
      </BookingCta>
    </>
  );
}

/** Reflection answers stay in this browser only (localStorage). */
function TryThis({ slug, questions }: { slug: string; questions: readonly string[] }) {
  const key = `sbc_try_${slug}`;
  const [ans, setAns] = useState<string[]>(["", "", ""]);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem(key) ?? "null"); if (Array.isArray(v)) setAns(v); } catch { /* ignore */ }
  }, [key]);
  const save = () => { localStorage.setItem(key, JSON.stringify(ans)); setSaved(true); };
  return (
    <section className="my-10 rounded-[24px] bg-card p-6 font-sans md:-mx-10 md:p-9" aria-labelledby={`try-${slug}`}>
      <p className="eyebrow">Try this</p>
      <h3 id={`try-${slug}`} className="mt-2 text-2xl">Three questions. Two minutes.</h3>
      <div className="mt-6 grid gap-5">
        {questions.map((q, i) => (
          <label key={q} className="grid gap-2">
            <span className="font-semibold">{q}</span>
            <Textarea rows={2} value={ans[i] ?? ""} onChange={(e) => { const n = [...ans]; n[i] = e.target.value; setAns(n); setSaved(false); }} className="rounded-[18px] bg-background text-base" />
          </label>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button onClick={save}>Keep my answers</Button>
        <p className="text-sm text-soft">{saved ? "Kept on this device." : "Your answers stay in this browser. Nobody else sees them, me included."}</p>
      </div>
    </section>
  );
}
