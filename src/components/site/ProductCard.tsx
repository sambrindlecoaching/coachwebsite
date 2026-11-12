import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WaitlistForm } from "./WaitlistForm";
import { kindLabel, priceText, type Product } from "@/lib/products";

export function ProductCard({ p }: { p: Product }) {
  return (
    <article className="flex flex-col rounded-[24px] bg-card p-7 md:p-8">
      <p className="eyebrow">{kindLabel[p.kind] ?? p.kind}</p>
      <h3 className="mt-3 text-2xl">{p.name}</h3>
      {p.description && <p className="mt-3 text-muted-foreground">{p.description}</p>}
      <p className="mt-6 text-2xl font-bold tracking-tight">{priceText(p)}</p>
      <div className="mt-auto pt-6">
        {p.status === "waitlist" ? (
          <WaitlistForm item={p.slug} label="Tell me when it's ready" />
        ) : (
          <Button asChild variant={p.kind === "service" ? "marigold" : "default"}>
            <Link to="/checkout/$slug" params={{ slug: p.slug }}>{p.kind === "service" ? "Choose this" : "Buy"}</Link>
          </Button>
        )}
      </div>
    </article>
  );
}
