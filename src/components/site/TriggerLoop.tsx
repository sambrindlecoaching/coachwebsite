import { useState } from "react";
import { cn } from "@/lib/utils";

const loops = {
  old: {
    label: "The old loop",
    steps: ["Trigger", "Old belief", "Reaction", "Regret"],
    captions: [
      "A message lands. A door closes. Somebody asks what you do now.",
      "The quiet rule underneath kicks in: \"I'm not good enough\", \"I have to fix this\".",
      "You fire off the reply, the sharp word, the third glass. Fast and familiar.",
      "Then the 2am replay. Which, handily, sets up the next trigger.",
    ],
  },
  new: {
    label: "The new loop",
    steps: ["Trigger", "Notice", "Pause", "Choose"],
    captions: [
      "Same message, same door. The trigger doesn't go anywhere. That's fine.",
      "\"Ah. There it is.\" You spot the old belief before it drives.",
      "A breath, a walk, a draft you don't send yet. Space is where choice lives.",
      "One small, different response. Then another. That's the whole trick.",
    ],
  },
} as const;

// Four points on a circle (top, right, bottom, left).
const pts = [
  [200, 60],
  [340, 200],
  [200, 340],
  [60, 200],
] as const;

export function TriggerLoop() {
  const [mode, setMode] = useState<"old" | "new">("old");
  const [focus, setFocus] = useState(0);
  const loop = loops[mode];

  return (
    <div className="grid gap-10 rounded-[28px] bg-card p-6 md:grid-cols-[1fr_1fr] md:items-center md:p-12">
      <div>
        <div role="group" aria-label="Choose a loop" className="inline-flex rounded-full bg-background p-1">
          {(["old", "new"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => { setMode(m); setFocus(0); }}
              className={cn("rounded-full px-5 py-2 text-sm font-semibold", mode === m ? "bg-ink text-ink-foreground" : "text-muted-foreground")}
            >
              {loops[m].label}
            </button>
          ))}
        </div>
        <ol className="mt-8 space-y-3">
          {loop.steps.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setFocus(i)}
                aria-current={focus === i ? "step" : undefined}
                className={cn("w-full rounded-[20px] p-4 text-left transition-colors", focus === i ? "bg-background" : "hover:bg-background/60")}
              >
                <span className="text-sm font-semibold tabular-nums text-soft">0{i + 1}</span>
                <span className="ml-3 text-lg font-bold">{s}</span>
                {focus === i && <p className="mt-2 text-muted-foreground" aria-live="polite">{loop.captions[i]}</p>}
              </button>
            </li>
          ))}
        </ol>
      </div>
      <svg viewBox="0 0 400 400" role="img" aria-label={`${loop.label}: ${loop.steps.join(", then ")}, and round again.`} className="mx-auto w-full max-w-sm">
        <circle cx="200" cy="200" r="140" fill="none" className="stroke-border" strokeWidth="2" />
        <circle
          cx="200" cy="200" r="140" fill="none"
          className={cn("loop-dash", mode === "new" ? "stroke-marigold" : "stroke-ink")}
          strokeWidth="3" strokeDasharray="10 14" strokeLinecap="round"
        />
        {pts.map(([x, y], i) => (
          <g key={i} onClick={() => setFocus(i)} className="cursor-pointer">
            <circle cx={x} cy={y} r={focus === i ? 34 : 28} className={cn("transition-all", focus === i ? (mode === "new" ? "fill-marigold" : "fill-ink") : "fill-background")} />
            <text x={x} y={y + 5} textAnchor="middle" className={cn("text-[13px] font-bold", focus === i && mode === "old" ? "fill-ink-foreground" : "fill-foreground")}>
              {loop.steps[i]}
            </text>
          </g>
        ))}
        <text x="200" y="206" textAnchor="middle" className="fill-soft text-[14px] font-semibold">
          {mode === "old" ? "round and round" : "a way out"}
        </text>
      </svg>
    </div>
  );
}
