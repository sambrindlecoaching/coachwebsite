import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceNoteCard } from "./VoiceNoteCard";
import { doors, openDoors, type DoorKey } from "@/content/doors";
import { articleBySlug } from "@/content/journal";
import { pickNotes, publishedNotesQuery } from "@/lib/voice-notes";
import { cn } from "@/lib/utils";

/** "Where are you right now?" Pass a door to fix it; leave empty on Home to choose. */
export function WhereAreYou({ door: fixed }: { door?: DoorKey }) {
  const [door, setDoor] = useState<DoorKey>(fixed ?? "divorce");
  const [sid, setSid] = useState<string | null>(null);
  const { data: notes = [] } = useQuery(publishedNotesQuery);
  const d = doors[door];
  const s = d.situations.find((x) => x.id === sid);
  const article = s ? articleBySlug(s.articleSlug) : undefined;

  return (
    <section className="section container-page" aria-labelledby="where-now">
      <p className="eyebrow mb-4">A quick check-in</p>
      <h2 id="where-now" className="display-lg">Where are you right now?</h2>
      {!fixed && (
        <div role="group" aria-label="What's changed?" className="mt-8 flex flex-wrap gap-2">
          {openDoors.map((o) => (
            <button key={o.key} type="button" aria-pressed={door === o.key} onClick={() => { setDoor(o.key); setSid(null); }}
              className={cn("rounded-full border px-5 py-2.5 font-semibold", door === o.key ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-foreground")}>
              {o.name}
            </button>
          ))}
        </div>
      )}
      <div role="group" aria-label="Pick the one closest to you" className="mt-6 grid gap-3 sm:grid-cols-3">
        {d.situations.map((x) => (
          <button key={x.id} type="button" aria-pressed={sid === x.id} onClick={() => setSid(x.id)}
            className={cn("rounded-[22px] border p-5 text-left text-lg font-bold tracking-tight transition-colors", sid === x.id ? "border-marigold bg-card" : "border-border hover:bg-card")}>
            {x.label}
          </button>
        ))}
      </div>
      {s && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]" aria-live="polite">
          <div className="rounded-[24px] bg-ink p-7 text-ink-foreground md:p-9">
            <p className="pull text-2xl leading-snug">{s.reassurance}</p>
            <Button asChild variant="marigold" size="lg" className="mt-8"><Link to={s.next.to}>{s.next.label}</Link></Button>
            {article && (
              <Link to="/journal/$slug" params={{ slug: article.slug }} className="mt-6 flex items-center gap-2 font-semibold text-ink-foreground underline underline-offset-4">
                Read: {article.title} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {pickNotes(notes, door, s.stages).map((n) => <VoiceNoteCard key={n.id} note={n} locked={false} />)}
          </div>
        </div>
      )}
    </section>
  );
}
