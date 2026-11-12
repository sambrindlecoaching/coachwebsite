import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "./db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminHeader, Panel, fmtDate, inputCls } from "./ui";
import { cn } from "@/lib/utils";

type Task = { id: string; title: string; due_date: string | null; done: boolean; source: string; client_id: string | null };
type Milestone = { id: string; title: string; phase: number | null; due_date: string | null; done: boolean; client_id: string | null };

const phaseRange: Record<number, string> = { 1: "Now → Jan 2027", 2: "Feb → Jun 2027", 3: "Jul 2027 →" };

export function bucket(due: string | null, today = new Date()): "today" | "week" | "later" {
  if (!due) return "later";
  const t = today.toISOString().slice(0, 10);
  if (due <= t) return "today";
  const week = new Date(today.getTime() + 7 * 864e5).toISOString().slice(0, 10);
  return due <= week ? "week" : "later";
}

export function Tasks() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState("");
  const { data: tasks = [] } = useQuery({
    queryKey: ["admin", "tasks"],
    queryFn: async () => ((await db.from("tasks").select("*").order("due_date", { ascending: true })).data ?? []) as Task[],
  });
  const { data: ms = [] } = useQuery({
    queryKey: ["admin", "milestones"],
    queryFn: async () => ((await db.from("milestones").select("*").order("sort_order", { ascending: true })).data ?? []) as Milestone[],
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const add = async () => {
    if (!title.trim()) return;
    await db.from("tasks").insert({ title: title.trim(), due_date: due || null, source: "manual" });
    setTitle(""); setDue(""); refresh();
  };
  const toggle = async (t: { id: string; done: boolean }, table: "tasks" | "milestones") => {
    await db.from(table).update({ done: !t.done }).eq("id", t.id); refresh();
  };
  const open = tasks.filter((t) => !t.done);
  const groups = [["today", "Today"], ["week", "This week"], ["later", "Later"]] as const;
  const business = ms.filter((m) => m.client_id === null);

  return (
    <>
      <AdminHeader title="Tasks" />
      <Panel className="mb-6 flex flex-wrap gap-2">
        <Input aria-label="New task" placeholder="Add a task…" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className={cn(inputCls, "min-w-56 flex-1")} />
        <Input aria-label="Due date" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={cn(inputCls, "w-44")} />
        <Button onClick={add}>Add</Button>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-3">
        {groups.map(([k, label]) => {
          const list = open.filter((t) => bucket(t.due_date) === k);
          return (
            <Panel key={k}>
              <h2 className="text-xl">{label} <span className="text-soft">{list.length}</span></h2>
              <ul className="mt-4 grid gap-2">
                {list.map((t) => (
                  <li key={t.id} className="flex items-start gap-3 rounded-[16px] bg-background p-3">
                    <input type="checkbox" aria-label={`Done: ${t.title}`} checked={t.done} onChange={() => toggle(t, "tasks")} className="mt-1 size-4 accent-[var(--ink)]" />
                    <span className="flex-1">
                      <span className="font-medium">{t.title}</span>
                      <span className="block text-xs text-soft">{t.due_date ? fmtDate(t.due_date) : "No date"}{t.source !== "manual" && ` · from ${t.source.replace("_", " ")}`}</span>
                    </span>
                  </li>
                ))}
                {!list.length && <li className="text-sm text-soft">Nothing here.</li>}
              </ul>
            </Panel>
          );
        })}
      </div>

      <h2 className="mt-12 text-3xl">Business milestones</h2>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {business.map((m) => (
          <li key={m.id}>
            <Panel className={cn(m.done && "opacity-60")}>
              <p className="text-sm font-semibold text-soft">Phase {m.phase} · {phaseRange[m.phase ?? 0] ?? ""}</p>
              <p className="mt-2 text-xl font-bold">{m.title.replace(/^Phase \d: /, "")}</p>
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={m.done} onChange={() => toggle(m, "milestones")} className="size-4 accent-[var(--ink)]" /> Reached
              </label>
            </Panel>
          </li>
        ))}
      </ol>
    </>
  );
}
