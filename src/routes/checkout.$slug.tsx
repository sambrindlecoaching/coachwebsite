import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { PHASE2 } from "@/config/features";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { productsQuery, priceText } from "@/lib/products";

export const Route = createFileRoute("/checkout/$slug")({
  beforeLoad: () => { if (!PHASE2) throw redirect({ to: "/work-with-me" }); },
  head: () => ({
    meta: [
      { title: "Checkout | Sam Brindle Coaching" },
      { name: "description", content: "Checkout for Sam Brindle Coaching." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Checkout | Sam Brindle Coaching" },
      { property: "og:description", content: "Checkout for Sam Brindle Coaching." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Checkout,
});

/** Placeholder until Stripe is connected. Nothing is charged here. */
function Checkout() {
  const { slug } = Route.useParams();
  const { data = [], isLoading } = useQuery(productsQuery);
  const p = data.find((x) => x.slug === slug);

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-xl rounded-[28px] bg-card p-8 md:p-12">
        <p className="eyebrow">Checkout</p>
        {isLoading ? <p className="mt-4">Loading…</p> : !p ? (
          <p className="mt-4">That item isn't available. <Link to="/work-with-me" hash="on-your-own" className="underline">Back to Work with me</Link></p>
        ) : (
          <>
            <h1 className="mt-3 text-4xl">{p.name}</h1>
            <p className="mt-3 text-2xl font-bold">{priceText(p)}</p>
            <div role="status" className="mt-8 rounded-[20px] border border-dashed border-foreground/30 p-6">
              <p className="font-bold">[Connect Stripe]</p>
              <p className="mt-2 text-muted-foreground">Payments aren't switched on yet, so nothing will be charged. When they are, this button takes you to a secure card payment page.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="marigold" disabled>Pay securely</Button>
              <Button asChild size="lg" variant="outline"><Link to="/book">Talk to Sam instead</Link></Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
