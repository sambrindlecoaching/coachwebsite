import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLead, isValidEmail, unlockStore } from "@/lib/leads";

export function EmailGate({ unlocked, onUnlock }: { unlocked: boolean; onUnlock: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (unlocked) {
    return (
      <div id="unlock" className="rounded-[28px] bg-ink p-8 text-ink-foreground md:p-12" role="status">
        <h2 className="display-lg">You're in.</h2>
        <p className="mt-4 max-w-md text-lg text-ink-muted">
          Every voice note is unlocked on this device. Listen whenever it hits. Rather just talk?
        </p>
        <Button asChild variant="marigold" size="lg" className="mt-7"><Link to="/book">Book a call</Link></Button>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError("Just your first name, please.");
    if (!isValidEmail(email)) return setError("That email doesn't look quite right.");
    if (!consent) return setError("Please tick the box so I'm allowed to send them.");
    setBusy(true);
    try {
      await createLead({ first_name: name, email, source: "voice_notes", consent });
      unlockStore.set();
      onUnlock();
    } catch {
      setError("Something went wrong on my end. Try again in a minute?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form id="unlock" onSubmit={submit} noValidate className="grid gap-8 rounded-[28px] bg-ink p-8 text-ink-foreground md:grid-cols-[1fr_1.2fr] md:p-12">
      <div>
        <h2 className="display-lg">Unlock the whole library</h2>
        <p className="mt-4 text-lg text-ink-muted">Free. Pop in your name and email and every note opens up, on this phone, right now.</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="gate-name" className="text-ink-foreground">First name</Label>
          <Input id="gate-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="h-12 rounded-full border-ink-line bg-ink px-5 text-ink-foreground" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gate-email" className="text-ink-foreground">Email</Label>
          <Input id="gate-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-12 rounded-full border-ink-line bg-ink px-5 text-ink-foreground" />
        </div>
        <label className="flex items-start gap-3 text-sm text-ink-muted">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--marigold)]" />
          <span>
            Yes, send me the voice notes and occasional emails. I've read the{" "}
            <Link to="/privacy" className="font-semibold text-ink-foreground underline underline-offset-4">privacy policy</Link>.
          </span>
        </label>
        {error && <p role="alert" className="text-sm font-semibold text-marigold">{error}</p>}
        <Button type="submit" variant="marigold" size="lg" disabled={busy} className="justify-self-start">
          {busy ? "Unlocking…" : "Unlock the voice notes"}
        </Button>
      </div>
    </form>
  );
}
