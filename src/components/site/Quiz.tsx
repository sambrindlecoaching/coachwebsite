import { PHASE2 } from "@/config/features";
import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doorQuestion, questionsFor, scoreQuiz, type QuizDoor } from "@/lib/quiz";
import { createLead, isValidEmail } from "@/lib/leads";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function Quiz() {
  const [door, setDoor] = useState<QuizDoor | null>(PHASE2 ? null : "divorce");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const quizQuestions = questionsFor(door ?? "divorce");
  const done = door !== null && answers.length === quizQuestions.length;
  const outcome = done ? scoreQuiz(answers) : null;

  const pick = async (i: number) => {
    const next = [...answers, i];
    setAnswers(next);
    if (next.length === quizQuestions.length) {
      const { score, result } = scoreQuiz(next);
      await supabase.from("quiz_responses").insert({ answers: { door, answers: next }, score, result: result.key });
    } else setStep(step + 1);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidEmail(email)) return setErr("That email doesn't look quite right.");
    if (!consent) return setErr("Please tick the box first.");
    try {
      await createLead({ first_name: name, email, source: "quiz", consent, resource: `quiz:${outcome?.result.key}:${door}` });
      setSaved(true);
    } catch {
      setErr("Something went wrong. Try again?");
    }
  };

  if (outcome) {
    const r = outcome.result;
    return (
      <div className="rounded-[28px] bg-ink p-8 text-ink-foreground md:p-12" role="status" aria-live="polite">
        <p className="eyebrow text-ink-muted">Your result</p>
        <h3 className="mt-3 text-3xl md:text-4xl">{r.title}</h3>
        <p className="mt-4 max-w-xl text-lg text-ink-muted">{r.body}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          {r.key === "listen" ? (
            <Button asChild variant="marigold" size="lg"><Link to="/voice-notes">Listen to a voice note</Link></Button>
          ) : (
            <Button asChild variant="marigold" size="lg"><Link to="/book">Book a free call</Link></Button>
          )}
          <Button variant="inkOutline" size="lg" onClick={() => { setAnswers([]); setStep(0); setSaved(false); setDoor(PHASE2 ? null : "divorce"); }}>Start again</Button>
        </div>
        {saved ? (
          <p className="mt-8 font-semibold text-marigold">Saved. I'll be in touch, gently.</p>
        ) : (
          <form onSubmit={save} noValidate className="mt-10 grid gap-4 border-t border-ink-line pt-8 md:grid-cols-2">
            <p className="md:col-span-2 text-ink-muted">Want this result and a few useful notes by email? Optional.</p>
            <div className="grid gap-2">
              <Label htmlFor="quiz-name" className="text-ink-foreground">First name</Label>
              <Input id="quiz-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="h-12 rounded-full border-ink-line bg-ink px-5 text-ink-foreground" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quiz-email" className="text-ink-foreground">Email</Label>
              <Input id="quiz-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className="h-12 rounded-full border-ink-line bg-ink px-5 text-ink-foreground" />
            </div>
            <label className="flex items-start gap-3 text-sm text-ink-muted md:col-span-2">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--marigold)]" />
              <span>Yes, send me my result and occasional emails. I've read the <Link to="/privacy" className="font-semibold text-ink-foreground underline">privacy policy</Link>.</span>
            </label>
            {err && <p role="alert" className="text-sm font-semibold text-marigold md:col-span-2">{err}</p>}
            <Button type="submit" variant="marigold" className="justify-self-start">Send it to me</Button>
          </form>
        )}
      </div>
    );
  }

  if (!door)
    return (
      <div className="rounded-[28px] bg-card p-8 md:p-12">
        <p className="text-sm text-soft">First things first</p>
        <fieldset className="mt-6">
          <legend className="text-2xl font-bold tracking-tight md:text-3xl">{doorQuestion.q}</legend>
          <div className="mt-6 grid gap-3">
            {doorQuestion.a.map((a) => (
              <button key={a.key} type="button" onClick={() => setDoor(a.key)} className="rounded-full border border-border px-6 py-4 text-left text-lg font-medium transition-colors hover:border-foreground hover:bg-background">
                {a.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    );

  const q = quizQuestions[step]!;
  return (
    <div className="rounded-[28px] bg-card p-8 md:p-12">
      <div className="flex items-center justify-between text-sm text-soft">
        <span>Question {step + 1} of {quizQuestions.length}</span>
        {(
          <button type="button" className="font-semibold underline underline-offset-4" onClick={() => { if (step === 0) { if (PHASE2) setDoor(null); return; } setAnswers(answers.slice(0, -1)); setStep(step - 1); }}>
            Back
          </button>
        )}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded bg-muted" aria-hidden>
        <div className="h-full bg-marigold transition-all" style={{ width: `${(step / quizQuestions.length) * 100}%` }} />
      </div>
      <fieldset className="mt-8">
        <legend className="text-2xl font-bold tracking-tight md:text-3xl">{q.q}</legend>
        <div className="mt-6 grid gap-3">
          {q.a.map((a, i) => (
            <button
              key={a}
              type="button"
              onClick={() => pick(i)}
              className={cn("rounded-full border border-border px-6 py-4 text-left text-lg font-medium transition-colors hover:border-foreground hover:bg-background")}
            >
              {a}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
