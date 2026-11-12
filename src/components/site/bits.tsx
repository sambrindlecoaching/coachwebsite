import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn("placeholder-photo flex items-end rounded-[28px] p-5", className)}
    >
      <span className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
        [{label}]
      </span>
    </div>
  );
}

export function PageIntro({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="container-page pt-14 pb-10 md:pt-24 md:pb-16">
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h1 className="display-xl max-w-4xl">{title}</h1>
      {children && <div className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">{children}</div>}
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children, className }: { eyebrow?: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="display-lg">{title}</h2>
      {children && <div className="mt-5 text-lg leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}

const testimonials = [
  {
    quote: "She helped guide me through one of the hardest chapters of my life here in Barcelona with such wisdom, care and clarity.",
    name: "Delia Monk",
    role: "Messaging and Positioning Strategist",
  },
  { quote: "She listens, really listens. Her practical and down to earth approach is so refreshing.", name: "Alison Green", role: "MTDCNC" },
  { quote: "I am excited about the future for the first time in a long time.", name: "Lydia Barker", role: "Filtermist" },
  { quote: "She helped me identify and challenge some deeply held beliefs that had been quietly holding me back.", name: "Sami Schneider", role: "Sands of Spain" },
];

export function Testimonials({ only }: { only?: string[] } = {}) {
  const list = only ? testimonials.filter((t) => only.includes(t.name)) : testimonials.slice(0, 3);
  return (
    <section className="section container-page" aria-labelledby="kind-words">
      <p id="kind-words" className="eyebrow mb-10">Kind words</p>
      <div className={cn("grid gap-5", list.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
        {list.map((t, i) => (
          <figure key={t.name} className={cn("flex flex-col justify-between rounded-[24px] bg-card p-7 md:p-8", i === 0 && "md:row-span-1")}>
            <blockquote className="pull text-[1.45rem] text-foreground">“{t.quote}”</blockquote>
            <figcaption className="mt-8 text-sm">
              <span className="font-semibold">{t.name}</span>
              <span className="block text-soft">{t.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function BookingCta({ title = "Fancy a chat first?", children }: { title?: string; children?: ReactNode }) {
  return (
    <section className="container-page pb-20 md:pb-28">
      <div className="grid items-end gap-8 rounded-[28px] bg-card p-8 md:grid-cols-[1.5fr_1fr] md:p-14">
        <div>
          <h2 className="display-lg">{title}</h2>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            {children ?? "A free [30]-minute call. No pitch, no pressure. We talk about where you are, and whether I can help. If I can't, I'll say so."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Button asChild variant="marigold" size="lg"><Link to="/book">Book a free call</Link></Button>
          <Button asChild variant="outline" size="lg"><Link to="/voice-notes">Listen first</Link></Button>
        </div>
      </div>
    </section>
  );
}

export function LoveLetter({ letter, className }: { letter: string; className?: string }) {
  return (
    <span aria-hidden className={cn("font-display text-[5rem] font-bold leading-none tracking-tighter text-marigold md:text-[6.5rem]", className)}>
      {letter}
    </span>
  );
}
