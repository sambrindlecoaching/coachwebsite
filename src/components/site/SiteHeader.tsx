import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/voice-notes", label: "Voice notes" },
  { to: "/work-with-me", label: "Work with me" },
  { to: "/about", label: "About" },
  { to: "/journal", label: "Blog" },
] as const;

const linkCls = "text-sm font-medium text-muted-foreground hover:text-foreground";
const activeCls = { className: "text-sm font-semibold text-foreground underline underline-offset-8 decoration-marigold decoration-2" };

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="text-[1.05rem] font-bold tracking-tight" onClick={() => setOpen(false)}>
          Sam Brindle<span className="text-soft font-semibold"> Coaching</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={activeCls}>Home</Link>
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={linkCls} activeProps={activeCls}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="marigold" size="sm" className="hidden sm:inline-flex">
            <Link to="/book">Book a call</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <ul className="container-page flex flex-col py-4">
            <li><Link to="/" onClick={() => setOpen(false)} className="block py-3 text-2xl font-bold tracking-tight">Home</Link></li>
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className="block py-3 text-2xl font-bold tracking-tight">{n.label}</Link>
              </li>
            ))}
            <li className="pt-4">
              <Button asChild variant="marigold" size="lg" className="w-full">
                <Link to="/book" onClick={() => setOpen(false)}>Book a call</Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
