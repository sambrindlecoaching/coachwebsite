import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLead, isValidEmail } from "@/lib/leads";

/** Email-only waitlist. Saves a lead with source "waitlist" and the thing waited for. */
export function WaitlistForm({ item, label = "Tell me when it opens" }: { item: string; label?: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);
  const id = `wl-${item}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidEmail(email)) return setErr("That email doesn't look quite right.");
    if (!consent) return setErr("Please tick the box first.");
    setState("busy");
    try {
      await createLead({ email, source: "waitlist", consent, resource: `waitlist:${item}` });
      setState("done");
    } catch {
      setState("idle");
      setErr("Something went wrong. Try again?");
    }
  };

  if (state === "done") return <p role="status" className="font-semibold">You're on the list. One email when it opens, no more.</p>;
  return (
    <form onSubmit={submit} noValidate className="grid gap-3">
      <label htmlFor={id} className="sr-only">Email</label>
      <div className="flex gap-2">
        <Input id={id} type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-11 flex-1 rounded-full px-4" />
        <Button type="submit" disabled={state === "busy"}>{label === "Tell me when it opens" ? "Join" : label}</Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--ink)]" />
        <span>{label}. Email me about this only.</span>
      </label>
      {err && <p role="alert" className="text-sm font-semibold">{err}</p>}
    </form>
  );
}
