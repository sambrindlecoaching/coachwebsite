import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro, SectionHeading } from "@/components/site/bits";
import { Quiz } from "@/components/site/Quiz";
import { createLead, isValidEmail } from "@/lib/leads";
import { seo } from "@/lib/seo";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resources")({
  head: () =>
    seo(
      "Free resources for separating parents | Sam Brindle Coaching",
      "Message templates for replying to your ex, a printable LOVE journal, a 15-day email series and a short quiz: is coaching right for me?",
    ),
  component: ResourcesPage,
});

const resources = [
  { id: "reply-templates", source: "resource" as const, kind: "Templates", title: "How to reply to your ex", body: "Calm, short, copy-and-paste replies for the messages that make your thumbs itch.", cta: "Send me the templates" },
  { id: "love-journal", source: "resource" as const, kind: "Printable", title: "The LOVE journal", body: "Prompts for each stage. Ten minutes, a pen, and a cup of tea you'll forget to drink.", cta: "Send me the journal" },
  { id: "15-day-series", source: "email_series" as const, kind: "Email series", title: "15 days, 15 small shifts", body: "One short email a day for fifteen days. Each one takes less time to read than to make toast.", cta: "Start the series" },
];

function ResourceCard({ r }: { r: (typeof resources)[number] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidEmail(email)) return setErr("That email doesn't look quite right.");
    if (!consent) return setErr("Please tick the box first.");
    setState("busy");
    try {
      await createLead({ first_name: name, email, source: r.source, consent, resource: r.id });
      setState("done");
    } catch {
      setErr("Something went wrong. Try again?");
      setState("idle");
    }
  };

  return (
    <article className="flex flex-col rounded-[24px] bg-card p-7">
      <p className="eyebrow">{r.kind}</p>
      <h3 className="mt-3 text-2xl">{r.title}</h3>
      <p className="mt-3 text-muted-foreground">{r.body}</p>
      <div className="mt-auto pt-7">
        {state === "done" ? (
          <p role="status" className="font-semibold">On its way. Check your inbox (and the spam folder, just in case). [Delivery email to set up]</p>
        ) : !open ? (
          <Button variant="default" onClick={() => setOpen(true)}>{r.cta}</Button>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor={`${r.id}-name`}>First name</Label>
              <Input id={`${r.id}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="h-11 rounded-full px-4" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={`${r.id}-email`}>Email</Label>
              <Input id={`${r.id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-11 rounded-full px-4" />
            </div>
            <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--ink)]" />
              <span>Yes, send me this and occasional emails. I've read the <Link to="/privacy" className="font-semibold text-foreground underline">privacy policy</Link>.</span>
            </label>
            {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
            <Button type="submit" variant="marigold" disabled={state === "busy"} className="justify-self-start">{state === "busy" ? "Sending…" : r.cta}</Button>
          </form>
        )}
      </div>
    </article>
  );
}

function ResourcesPage() {
  return (
    <>
      <PageIntro eyebrow="Free resources" title="Useful things. No strings, a few emails.">
        Take what helps. Ignore the rest.
      </PageIntro>
      <section className="container-page grid gap-5 pb-16 md:grid-cols-3">
        {resources.map((r) => <ResourceCard key={r.id} r={r} />)}
      </section>
      <section className="section border-t border-border container-page grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeading eyebrow="Two minutes" title="Is this coaching right for me?">
          Seven questions, no wrong answers. You'll get an honest suggestion, even if it's “not yet”.
        </SectionHeading>
        <Quiz />
      </section>
    </>
  );
}
