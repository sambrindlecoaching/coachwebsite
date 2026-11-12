import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro } from "@/components/site/bits";
import { createLead, isValidEmail } from "@/lib/leads";
import { useSiteSettings } from "@/lib/site-settings";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/book")({
  head: () =>
    seo(
      "Book a free call | Sam Brindle Coaching",
      "A free, no-pressure discovery call with Sam Brindle. Talk through where you are with your separation and whether coaching could help.",
    ),
  component: BookPage,
});

function BookPage() {
  const { bookingUrl } = useSiteSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim()) return setErr("Your name, please.");
    if (!isValidEmail(email)) return setErr("That email doesn't look quite right.");
    if (!message.trim()) return setErr("A line or two is plenty.");
    if (!consent) return setErr("Please tick the box so I can reply.");
    setState("busy");
    try {
      await createLead({ first_name: name, email, message, source: "contact_form", consent });
      setState("done");
    } catch {
      setErr("Something went wrong. Try again?");
      setState("idle");
    }
  };

  return (
    <>
      <PageIntro eyebrow="Free discovery call" title="Let's have a chat.">
        [30] minutes on video. You talk, I listen, we work out whether I can help. No pitch, no pressure, no homework.
      </PageIntro>

      <section className="container-page grid gap-6 pb-24 lg:grid-cols-[1.4fr_1fr]">
        <div className="min-h-[560px] overflow-hidden rounded-[28px] bg-card">
          {bookingUrl ? (
            <iframe src={bookingUrl} title="Book a free call with Sam" className="h-[680px] w-full border-0" loading="lazy" />
          ) : (
            <div className="placeholder-photo flex h-full min-h-[560px] flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-xl font-semibold">[Booking calendar goes here]</p>
              <p className="max-w-sm text-muted-foreground">Add the Cal.com or Calendly link in Admin → Settings and the calendar appears here.</p>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-border p-7 md:p-9">
          <h2 className="text-2xl">Rather write?</h2>
          <p className="mt-2 text-muted-foreground">Send a note. I reply myself, usually within two working days.</p>
          {state === "done" ? (
            <p role="status" className="mt-8 text-lg font-semibold">Thank you. It's landed. I'll be in touch soon.</p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-7 grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="c-name">Name</Label>
                <Input id="c-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="h-11 rounded-full bg-card px-4" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-email">Email</Label>
                <Input id="c-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-11 rounded-full bg-card px-4" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="c-msg">What's going on?</Label>
                <Textarea id="c-msg" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} className="rounded-[18px] bg-card px-4 py-3" />
              </div>
              <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--ink)]" />
                <span>I'm happy for Sam to reply by email. I've read the <Link to="/privacy" className="font-semibold text-foreground underline">privacy policy</Link>.</span>
              </label>
              {err && <p role="alert" className="text-sm font-semibold text-destructive">{err}</p>}
              <Button type="submit" variant="marigold" size="lg" disabled={state === "busy"} className="justify-self-start">
                {state === "busy" ? "Sending…" : "Send"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
