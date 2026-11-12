import { createFileRoute, Link } from "@tanstack/react-router";
import { openDoors, type DoorKey } from "@/content/doors";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageIntro } from "@/components/site/bits";
import { VoiceNoteCard } from "@/components/site/VoiceNoteCard";
import { EmailGate } from "@/components/site/EmailGate";
import { publishedNotesQuery } from "@/lib/voice-notes";
import { unlockStore } from "@/lib/leads";
import { useSiteSettings } from "@/lib/site-settings";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/voice-notes")({
  head: () =>
    seo(
      "Voice notes for separating parents | Sam Brindle Coaching",
      "Short voice notes for the moments that floor you: a message from your ex, the kids leaving for the weekend, 2am thoughts. Two are free to start.",
    ),
  validateSearch: (s: Record<string, unknown>): { door?: DoorKey } =>
    s["door"] === "divorce" || s["door"] === "reinvention" ? { door: s["door"] } : {},
  component: VoiceNotesPage,
});

function VoiceNotesPage() {
  const { data: notes, isLoading, error } = useQuery(publishedNotesQuery);
  const [unlocked, setUnlocked] = useState(false);
  const s = useSiteSettings();
  const { door } = Route.useSearch();
  const shown = (notes ?? []).filter((n) => (!door || n.door === door) && openDoors.some((d) => d.key === n.door));
  useEffect(() => setUnlocked(unlockStore.get()), []);

  return (
    <>
      <PageIntro eyebrow="Voice notes" title="For the moments that floor you.">
        Five minutes, give or take. Find the one that matches what's happening right now and press play. Headphones help. So does sitting down.
      </PageIntro>

      <section className="container-page pb-16" aria-label="Voice note library">
        {openDoors.length > 1 && <nav aria-label="Filter by life event" className="mb-8 flex flex-wrap gap-2">
          {[{ key: undefined, name: "All" }, ...openDoors.map((d) => ({ key: d.key, name: d.name }))].map((f) => (
            <Link key={f.name} to="/voice-notes" search={f.key ? { door: f.key } : {}} aria-current={door === f.key ? "page" : undefined}
              className={cn("rounded-full border px-5 py-2 text-sm font-semibold", door === f.key ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-foreground")}>
              {f.name}
            </Link>
          ))}
        </nav>}
        {error && <p role="alert">The notes didn't load. Try refreshing.</p>}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-[24px] bg-card" />)}
          {shown.map((n) => <VoiceNoteCard key={n.id} note={n} locked={!n.is_free && !unlocked} />)}
        </div>
      </section>

      <section className="container-page pb-16">
        <EmailGate unlocked={unlocked} onUnlock={() => setUnlocked(true)} />
      </section>

      <section className="container-page pb-24">
        <p className="text-lg text-muted-foreground">
          Also on{" "}
          <a href={s.spotify} className="font-semibold text-foreground underline underline-offset-4">Spotify</a>,{" "}
          <a href={s.applePodcasts} className="font-semibold text-foreground underline underline-offset-4">Apple Podcasts</a> and{" "}
          <a href={s.youtube} className="font-semibold text-foreground underline underline-offset-4">YouTube</a>.
          {" "}On a phone? Add this page to your home screen and they're one tap away.
        </p>
      </section>
    </>
  );
}
