import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const replies = {
  calm: "Calm. Lovely. Notice what helped, so you can do more of it.",
  coping: "Coping counts. Getting through a week is not nothing.",
  rough: "Rough weeks happen. Be kind to yourself tonight. A voice note might help.",
} as const;
type Answer = keyof typeof replies;

export const Route = createFileRoute("/poll")({
  validateSearch: (s: Record<string, unknown>): { i?: string | undefined; a?: Answer | undefined } => ({
    i: typeof s["i"] === "string" ? s["i"].slice(0, 40) : undefined,
    a: s["a"] === "calm" || s["a"] === "coping" || s["a"] === "rough" ? s["a"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thanks for answering | The Kitchen Table" },
      { name: "description", content: "Your one-click answer from The Kitchen Table newsletter." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Thanks for answering | The Kitchen Table" },
      { property: "og:description", content: "Your one-click answer from The Kitchen Table newsletter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Poll,
});

/** Landing page for the newsletter's one-click "How's this week been?" poll. */
function Poll() {
  const { i, a } = Route.useSearch();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!a || !i || i.startsWith("preview")) return;
    void supabase.from("poll_responses").insert({ issue: i, answer: a }).then(() => setSaved(true));
  }, [a, i]);
  return (
    <section className="container-page py-20 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow">The Kitchen Table [TBC]</p>
        <h1 className="display-lg mt-4">{a ? "Thanks. Noted." : "No answer came through."}</h1>
        <p className="pull mt-6 text-2xl text-muted-foreground">{a ? replies[a] : "Try the link in the email again."}</p>
        {saved && <p className="mt-4 text-sm text-soft">Your answer is anonymous.</p>}
        <Link to="/voice-notes" className="mt-10 inline-block font-semibold underline underline-offset-4">Listen to a voice note</Link>
      </div>
    </section>
  );
}
