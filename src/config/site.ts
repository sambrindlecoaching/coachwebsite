/**
 * Single source of truth for site-wide config.
 * Values here are defaults; the admin Settings page can override booking and
 * social links (stored in the site_settings table). Anything in [square
 * brackets] is unconfirmed and still needs a real value.
 */
export const site = {
  name: "Sam Brindle Coaching",
  shortName: "Sam Brindle",
  location: "Maresme, Barcelona",
  tagline: "Divorce is hard. Your mind doesn't have to make it harder.",
  description:
    "Short voice notes and 1:1 coaching for parents going through separation and divorce. From someone who's been there, with four kids in tow.",
  email: "[hello@sambrindlecoaching.com]",
  /** Cal.com or Calendly embed URL. Leave empty to show the placeholder. */
  bookingUrl: "",
  social: {
    instagram: "https://www.instagram.com/sambrindlecoaching/",
    linkedin: "https://www.linkedin.com/in/samantha-brindle-0841a932/",
    podcast: "#[podcast-link]",
    spotify: "#[spotify-link]",
    applePodcasts: "#[apple-podcasts-link]",
    youtube: "#[youtube-link]",
  },
  /** Change the course name here (and in admin → Products data). [name TBC] */
  course: { name: "LOVE on Your Own", subtitle: "the self-guided audio course", nameStatus: "[name TBC]" },
  programme: {
    name: "LOVE RE-Coded",
    pricePerMonth: 400,
    totalPrice: 2400,
    months: 6,
    sessions: 12,
    sessionMinutes: 90,
  },
  resetSession: { name: "Wake Up Call", minutes: 90, price: "€129" },
} as const;

export type SettingKey =
  | "booking_url"
  | "instagram"
  | "linkedin"
  | "podcast"
  | "spotify"
  | "apple_podcasts"
  | "youtube";

export const STAGES = {
  L: { letter: "L", name: "Look inwards" },
  O: { letter: "O", name: "Own your reality" },
  V: { letter: "V", name: "Visualise the future" },
  E: { letter: "E", name: "Embodiment" },
} as const;

export type StageKey = keyof typeof STAGES;
