import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { site } from "@/config/site";

export type ResolvedSettings = {
  bookingUrl: string;
  instagram: string;
  linkedin: string;
  podcast: string;
  spotify: string;
  applePodcasts: string;
  youtube: string;
  heroHome: string;
  heroHomeAlt: string;
  heroDivorce: string;
  heroDivorceAlt: string;
};

export const defaultSettings: ResolvedSettings = {
  bookingUrl: site.bookingUrl,
  instagram: site.social.instagram,
  linkedin: site.social.linkedin,
  podcast: site.social.podcast,
  spotify: site.social.spotify,
  applePodcasts: site.social.applePodcasts,
  youtube: site.social.youtube,
  heroHome: "",
  heroHomeAlt: "",
  heroDivorce: "",
  heroDivorceAlt: "",
};

const map: Record<string, keyof ResolvedSettings> = {
  booking_url: "bookingUrl",
  instagram: "instagram",
  linkedin: "linkedin",
  podcast: "podcast",
  spotify: "spotify",
  apple_podcasts: "applePodcasts",
  youtube: "youtube",
  hero_home: "heroHome",
  hero_home_alt: "heroHomeAlt",
  hero_divorce: "heroDivorce",
  hero_divorce_alt: "heroDivorceAlt",
};

export function useSiteSettings(): ResolvedSettings {
  const { data } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("key,value");
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });
  const out = { ...defaultSettings };
  for (const row of data ?? []) {
    const k = map[row.key];
    if (k && row.value) out[k] = row.value;
  }
  return out;
}
