import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="text-4xl">{title}</h1>
      {children}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[22px] bg-card p-6", className)}>{children}</div>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Panel>
      <p className="text-sm text-soft">{label}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">{value}</p>
    </Panel>
  );
}

/** Tiny bar chart, no library. */
export function Bars({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-2" role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs tabular-nums text-soft">{d.value || ""}</span>
          <div className="w-full rounded-t-lg bg-marigold" style={{ height: `${(d.value / max) * 100}%`, minHeight: 3 }} />
          <span className="text-xs text-soft">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export const selectCls = "h-10 rounded-full border border-input bg-card px-4 text-sm";
export const inputCls = "h-10 rounded-full px-4";

export function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
