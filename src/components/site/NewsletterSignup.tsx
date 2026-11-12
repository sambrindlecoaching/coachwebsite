import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createLead, isValidEmail, type LeadSource } from "@/lib/leads";

function SignupForm({ source, onDone, compact }: { source: LeadSource; onDone?: () => void; compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const id = `nl-${source}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) { setMsg("That email doesn't look quite right."); return; }
    if (!consent) { setMsg("Tick the box so I know it's OK to write to you."); return; }
    setState("saving"); setMsg("");
    try {
      await createLead({ email, source, consent: true, resource: "newsletter" });
      setState("done"); onDone?.();
    } catch {
      setState("error"); setMsg("Something went wrong. Try again in a minute.");
    }
  }

  if (state === "done") return <p className="font-semibold">Thank you. You're on the list.</p>;
  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <label htmlFor={id} className="sr-only">Email address</label>
      <div className={compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2"}>
        <input id={id} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
          className="h-12 min-w-0 flex-1 rounded-full border border-border bg-card px-5 text-base outline-none focus:border-foreground" />
        <Button type="submit" variant="marigold" size="lg" disabled={state === "saving"}>{state === "saving" ? "Saving…" : "Sign me up"}</Button>
      </div>
      <label className="flex items-start gap-2 text-sm text-muted-foreground">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        Yes, send me the occasional email. Unsubscribe any time.
      </label>
      {msg && <p role="alert" className="text-sm font-semibold">{msg}</p>}
    </form>
  );
}

export function FooterSignup() {
  return (
    <div>
      <p className="eyebrow mb-3">The newsletter</p>
      <p className="mb-4 max-w-sm text-muted-foreground">One short email now and then. A thought, a voice note, nothing to buy.</p>
      <SignupForm source="newsletter_footer" compact />
    </div>
  );
}

const SEEN_KEY = "sbc_newsletter_popup_seen";

/** Gentle pop-up: after scrolling 60% or on exit intent (desktop). Once per visitor. */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.localStorage.getItem(SEEN_KEY)) return;
    const show = () => {
      if (window.localStorage.getItem(SEEN_KEY)) return;
      window.localStorage.setItem(SEEN_KEY, "1");
      setOpen(true);
      cleanup();
    };
    const onScroll = () => {
      const h = document.documentElement;
      if ((h.scrollTop + window.innerHeight) / h.scrollHeight > 0.6) show();
    };
    const onLeave = (e: MouseEvent) => { if (e.clientY <= 0) show(); };
    const cleanup = () => { window.removeEventListener("scroll", onScroll); document.removeEventListener("mouseout", onLeave); };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return cleanup;
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="nl-pop-h"
      className="fixed inset-x-3 bottom-3 z-50 rounded-[24px] border border-border bg-background p-6 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[24rem]">
      <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute top-3 right-3 inline-flex size-9 items-center justify-center rounded-full hover:bg-muted">
        <X className="size-4" />
      </button>
      <p id="nl-pop-h" className="pr-8 text-xl font-bold tracking-tight">Before you go</p>
      <p className="mt-2 mb-4 text-muted-foreground">The odd email from me. Short, honest, useful at 2am. No pressure.</p>
      <SignupForm source="newsletter_popup" onDone={() => setTimeout(() => setOpen(false), 1800)} />
    </div>
  );
}
