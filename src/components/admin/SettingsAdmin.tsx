import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { db as supabase } from "./db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultSettings } from "@/lib/site-settings";
import { AdminHeader, Panel } from "./ui";
import { AdminAccess } from "./AdminAccess";
import { MediaPicker } from "./MediaLibrary";

const FIELDS = [
  { key: "postal_address", label: "Postal address (email footer)", def: "" },
  { key: "booking_url", label: "Booking link (Cal.com or Calendly embed URL)", def: defaultSettings.bookingUrl },
  { key: "instagram", label: "Instagram", def: defaultSettings.instagram },
  { key: "linkedin", label: "LinkedIn", def: defaultSettings.linkedin },
  { key: "podcast", label: "Podcast", def: defaultSettings.podcast },
  { key: "spotify", label: "Spotify", def: defaultSettings.spotify },
  { key: "apple_podcasts", label: "Apple Podcasts", def: defaultSettings.applePodcasts },
  { key: "youtube", label: "YouTube", def: defaultSettings.youtube },
];
const HEROES = [{ key: "hero_home", label: "Home page photo" }, { key: "hero_divorce", label: "Divorce page photo" }];
const ALL_KEYS = [...FIELDS.map((f) => f.key), ...HEROES.flatMap((h) => [h.key, `${h.key}_alt`])];

export function SettingsAdmin() {
  const qc = useQueryClient();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      const v: Record<string, string> = {};
      for (const f of FIELDS) v[f.key] = data?.find((d) => d.key === f.key)?.value ?? f.def;
      for (const k of ALL_KEYS) if (v[k] === undefined) v[k] = data?.find((d) => d.key === k)?.value ?? "";
      setVals(v);
    });
  }, []);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase.from("site_settings").upsert(ALL_KEYS.map((key) => ({ key, value: vals[key]?.trim() ?? "", updated_at: new Date().toISOString() })));
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Saved. The site updates straight away.");
    qc.invalidateQueries({ queryKey: ["site_settings"] });
  };

  return (
    <>
      <AdminHeader title="Settings" />
      <Panel className="mb-5 max-w-2xl">
        <p className="font-semibold">Course name <span className="font-normal text-soft">[name TBC]</span></p>
        <p className="mt-1 text-sm text-muted-foreground">"LOVE on Your Own", the self-guided audio course. Ask your developer to change it in one place if you settle on another name.</p>
      </Panel>
      <Panel className="grid max-w-2xl gap-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={`s-${f.key}`}>{f.label}</Label>
            <Input id={`s-${f.key}`} type={f.key === "postal_address" ? "text" : "url"} value={vals[f.key] ?? ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} className="h-10 rounded-full" />
          </div>
        ))}
        <div className="grid gap-4 border-t border-border pt-5">
          <p className="font-semibold">Page photos <span className="font-normal text-soft">(leave empty to keep the current photo)</span></p>
          {HEROES.map((h) => (
            <div key={h.key} className="grid gap-1.5">
              <p className="text-sm">{h.label}</p>
              <MediaPicker value={vals[h.key] ?? ""} usage={h.label} onPick={(m) => setVals({ ...vals, [h.key]: m.url, [`${h.key}_alt`]: m.alt })} />
            </div>
          ))}
        </div>
        <Button variant="marigold" onClick={save} disabled={busy} className="justify-self-start">{busy ? "Saving…" : "Save settings"}</Button>
      </Panel>
      <AdminAccess />
    </>
  );
}
