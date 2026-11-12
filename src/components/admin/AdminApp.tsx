import { useEffect, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PHASE2 } from "@/config/features";
import { Overview } from "./Overview";
import { Leads } from "./Leads";
import { Clients } from "./Clients";
import { Outreach } from "./Outreach";
import { VoiceNotesAdmin } from "./VoiceNotesAdmin";
import { Partners } from "./Partners";
import { SettingsAdmin } from "./SettingsAdmin";
import { setDemo } from "./db";
import { Tasks } from "./Tasks";
import { ContentStudio } from "./ContentStudio";
import { NewsletterPreview } from "./NewsletterPreview";
import { VoiceCapture } from "./VoiceCapture";
import { MediaLibrary } from "./MediaLibrary";

const allSections = [
  { id: "leads", label: "Leads", C: Leads, phase1: true },
  { id: "clients", label: "Clients", C: Clients, phase1: true },
  { id: "outreach", label: "Outreach", C: Outreach, phase1: true },
  { id: "newsletter", label: "Subscribers & emails", C: NewsletterPreview, phase1: true },
  { id: "studio", label: "Content Studio", C: ContentStudio, phase1: true },
  { id: "overview", label: "Overview", C: Overview, phase1: false },
  { id: "tasks", label: "Tasks", C: Tasks, phase1: false },
  { id: "photos", label: "Photos", C: MediaLibrary, phase1: false },
  { id: "voice-notes", label: "Voice notes", C: VoiceNotesAdmin, phase1: false },
  { id: "partners", label: "Referral partners", C: Partners, phase1: false },
  { id: "settings", label: "Settings", C: SettingsAdmin, phase1: false },
] as const;
/** Phase 1 shows only the core sections; the rest return with the PHASE2 flag. */
const sections = allSections.filter((s) => PHASE2 || s.phase1);

export function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [active, setActive] = useState<SectionId>("leads");
  const [demo, setDemoState] = useState(false);
  const qc = useQueryClient();
  const toggleDemo = (on: boolean) => { setDemo(on); qc.clear(); setActive("leads"); setDemoState(on); };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") qc.clear();
    });
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  useEffect(() => {
    if (!session) return setIsAdmin(null);
    // Grants or revokes the admin role based on the allowlist, server-side.
    supabase.rpc("sync_admin_role").then(({ data }) => setIsAdmin(data === true));
  }, [session?.user.id]);

  if (demo) return <Dashboard active={active} setActive={setActive} label="Demo mode" onExit={() => toggleDemo(false)} demo />;
  if (session === undefined) return <Shell><p className="text-muted-foreground">Loading…</p></Shell>;
  if (!session)
    return (
      <Shell>
        <Login />
        <div className="mt-6 border-t border-border pt-6 text-center">
          <Button type="button" variant="outline" className="w-full" onClick={() => toggleDemo(true)}>Explore the demo</Button>
          <p className="mt-2 text-xs text-soft">Fictional sample data. No sign-in, nothing saved.</p>
        </div>
      </Shell>
    );
  if (isAdmin === null) return <Shell><p className="text-muted-foreground">Checking access…</p></Shell>;
  if (!isAdmin)
    return (
      <Shell>
        <h1 className="text-3xl">This area is private</h1>
        <p className="mt-3 text-muted-foreground">Sorry, this account doesn't have access.</p>
        <Button className="mt-6" variant="outline" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </Shell>
    );

  return <Dashboard active={active} setActive={setActive} label={session.user.email ?? ""} onExit={() => supabase.auth.signOut()} />;
}

type SectionId = (typeof allSections)[number]["id"];
function Dashboard({ active, setActive, label, onExit, demo = false }: { active: SectionId; setActive: (s: SectionId) => void; label: string; onExit: () => void; demo?: boolean }) {
  const exitText = demo ? "Exit demo" : "Sign out";
  const Current = (sections.find((s) => s.id === active) ?? sections[0]!).C;
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="flex items-center justify-between p-5 md:block">
          <Link to="/" className="font-bold tracking-tight">Sam Brindle<span className="block text-xs font-medium text-soft">Dashboard</span></Link>
          <button type="button" className="text-sm font-semibold underline md:hidden" onClick={onExit}>{exitText}</button>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? "page" : undefined}
              className={cn("shrink-0 rounded-full px-4 py-2 text-left text-sm font-medium hover:bg-muted", active === s.id && "bg-ink text-ink-foreground hover:bg-ink")}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="hidden p-5 md:absolute md:bottom-0 md:block">
          <p className="truncate text-xs text-soft">{label}</p>
          <button type="button" className="mt-1 text-sm font-semibold underline" onClick={onExit}>{exitText}</button>
        </div>
      </aside>
      <main className="p-5 md:p-10">
        <div className="mb-6 flex justify-end"><VoiceCapture /></div>
        {demo && (
          <div role="status" className="mb-6 rounded-[20px] bg-ink px-5 py-4 text-sm text-ink-foreground">
            <strong className="font-bold">Demo mode.</strong> Everything here is fictional sample data. Changes vanish when you leave. Real leads and clients stay locked behind sign-in.
          </div>
        )}
        <Current />
      </main>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md rounded-[28px] bg-card p-8 md:p-10">{children}</div>
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const go = (m: typeof mode) => { setMode(m); setMsg(null); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "forgot") {
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/reset-password` });
      setBusy(false);
      return setMsg("If that email has an account, a reset link is on its way.");
    }
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) setMsg("That email and password don't match.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setBusy(false);
    if (error) return setMsg("This area is private.");
    if (!data.session) setMsg("If this email is allowed, check your inbox to confirm, then sign in.");
  };

  const title = mode === "in" ? "Sign in" : mode === "up" ? "Create account" : "Reset password";
  return (
    <form onSubmit={submit} className="grid gap-4">
      <h1 className="text-3xl">{title}</h1>
      <p className="text-sm text-muted-foreground">Private dashboard for Sam Brindle Coaching.</p>
      <div className="grid gap-1.5">
        <Label htmlFor="a-email">Email</Label>
        <Input id="a-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-full px-4" />
      </div>
      {mode !== "forgot" && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="a-pass">Password</Label>
            {mode === "in" && <button type="button" className="text-xs underline" onClick={() => go("forgot")}>Forgot password?</button>}
          </div>
          <Input id="a-pass" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-full px-4" />
        </div>
      )}
      {msg && <p role="alert" className="text-sm font-semibold">{msg}</p>}
      <Button type="submit" size="lg" disabled={busy}>{busy ? "…" : mode === "forgot" ? "Send reset link" : title}</Button>
      <button type="button" className="text-sm underline" onClick={() => go(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Been given access? Create your account" : "Back to sign in"}
      </button>
    </form>
  );
}
