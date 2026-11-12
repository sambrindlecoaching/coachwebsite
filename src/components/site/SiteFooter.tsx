import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { useSiteSettings } from "@/lib/site-settings";
import { FooterSignup } from "./NewsletterSignup";

export function SiteFooter() {
  const s = useSiteSettings();
  const links = [
    { href: s.instagram, label: "Instagram" },
    { href: s.linkedin, label: "LinkedIn" },
    { href: s.podcast, label: "Podcast" },
    { href: s.youtube, label: "YouTube" },
  ];
  return (
    <footer className="border-t border-border">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-xl font-bold tracking-tight">{site.name}</p>
          <p className="mt-2 text-muted-foreground">{site.location} · Online worldwide</p>
          <p className="pull mt-6 max-w-xs text-lg text-muted-foreground">
            You don't need to have it all figured out. Just a bit less of it on your own.
          </p>
        </div>
        <nav aria-label="Social">
          <p className="eyebrow mb-4">Elsewhere</p>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noreferrer" className="font-medium hover:underline underline-offset-4">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Site</p>
          <ul className="space-y-2 font-medium">
            <li><Link to="/divorce" className="hover:underline underline-offset-4">Divorce</Link></li>
            <li><Link to="/voice-notes" className="hover:underline underline-offset-4">Voice notes</Link></li>
            <li><Link to="/journal" className="hover:underline underline-offset-4">Blog</Link></li>
            <li><Link to="/about" className="hover:underline underline-offset-4">About</Link></li>
            <li><Link to="/work-with-me" className="hover:underline underline-offset-4">Work with me</Link></li>
            <li><Link to="/book" className="hover:underline underline-offset-4">Book a call</Link></li>
            <li><Link to="/privacy" className="hover:underline underline-offset-4">Privacy</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container-page border-t border-border py-10"><FooterSignup /></div>
      <div className="container-page flex flex-wrap justify-between gap-2 border-t border-border py-6 text-sm text-soft">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <p>Coaching is not therapy, legal advice or a substitute for either.</p>
      </div>
    </footer>
  );
}
