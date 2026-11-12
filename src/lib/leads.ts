import { supabase } from "@/integrations/supabase/client";

export type LeadSource = "voice_notes" | "quiz" | "resource" | "contact_form" | "referral" | "email_series" | "waitlist" | "voice_capture" | "newsletter_popup" | "newsletter_footer";

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && email.length <= 255;
}

export async function createLead(input: {
  first_name?: string;
  email: string;
  source: LeadSource;
  consent: boolean;
  message?: string;
  resource?: string;
}) {
  const { error } = await supabase.from("leads").insert({
    first_name: input.first_name?.trim().slice(0, 100) || null,
    email: input.email.trim().toLowerCase(),
    source: input.source,
    consent: input.consent,
    consent_at: input.consent ? new Date().toISOString() : null,
    message: input.message?.trim().slice(0, 4000) || null,
    resource: input.resource ?? null,
  });
  if (error) throw error;
}

const UNLOCK_KEY = "sbc_voice_notes_unlocked";
export const unlockStore = {
  get: () => typeof window !== "undefined" && window.localStorage.getItem(UNLOCK_KEY) === "1",
  set: () => window.localStorage.setItem(UNLOCK_KEY, "1"),
};
