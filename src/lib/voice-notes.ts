import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type VoiceNote = Tables<"voice_notes">;

export const publishedNotesQuery = queryOptions({
  queryKey: ["voice_notes", "published"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("voice_notes")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
  },
});

/** Pick up to `n` notes for a door, preferring the given stages in order. */
export function pickNotes(notes: VoiceNote[], door: string, stages: string[], n = 2) {
  const mine = notes.filter((x) => x.door === door);
  const rank = (x: VoiceNote) => {
    const i = stages.indexOf(x.stage);
    return i === -1 ? 99 : i;
  };
  return [...mine].sort((a, b) => rank(a) - rank(b) || Number(b.is_free) - Number(a.is_free)).slice(0, n);
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
