import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

/** Products are structured for Stripe: set stripe_price_id when Stripe is connected. */
export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").eq("active", true).order("sort_order");
    if (error) throw error;
    return data;
  },
});

export function priceText(p: Pick<Product, "price_cents" | "price_label">) {
  if (p.price_label) return p.price_label;
  if (p.price_cents == null) return "[TBC]";
  return `€${(p.price_cents / 100).toFixed(0)}`;
}

export const kindLabel: Record<string, string> = {
  service: "1:1 coaching",
  course: "Self-guided audio course",
  audio_pack: "Audio pack",
  template: "Templates",
};
