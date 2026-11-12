import { SAMPLE_VOICE_LABEL } from "@/content/sample-audio";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "./db";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminHeader, Panel } from "./ui";
import { MediaPicker } from "./MediaLibrary";
import { demoIssue, demoLinks, renderKitchenTable, type NewsletterIssue, type EmailLinks } from "@/emails/kitchen-table";

const pastIssues = [
  { n: 3, title: "When the quiet gets loud", date: "13 Oct 2026", sent: 182, opened: "54%" },
  { n: 2, title: "Fact or story, at the school gate", date: "29 Sep 2026", sent: 171, opened: "51%" },
  { n: 1, title: "Hello from the kitchen table", date: "15 Sep 2026", sent: 160, opened: "58%" },
];
const textFields = [
  ["number", "Issue number"], ["date", "Date"], ["preheader", "Preheader"], ["contents", "In this issue"],
  ["heroQuote", "Hero quote"], ["leadKicker", "Essay kicker"], ["leadTitle", "Essay title"],
  ["listenTitle", "Listen title"], ["listenDuration", "Listen duration"], ["listenLine", "Listen one-line"],
  ["replyPrompt", "Reply prompt"], ["signOff", "Sign-off line"],
  ["psBefore", "P.S. before link"], ["psLinkLabel", "P.S. link text"], ["psAfter", "P.S. after link"],
] as const;
const linkFields: [keyof EmailLinks, string][] = [
  ["viewInBrowser", "Read online link"], ["journal", "Full essay link"], ["journal1", "First Journal link"],
  ["journal2", "Second Journal link"], ["voiceNote", "Voice note link"], ["book", "Booking link"],
  ["unsubscribe", "Unsubscribe link"], ["preferences", "Preferences link"],
];

export function NewsletterPreview() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [issue, setIssue] = useState<NewsletterIssue>(() => structuredClone(demoIssue));
  const [links, setLinks] = useState<EmailLinks>({ ...demoLinks });
  const [photo, setPhoto] = useState({ url: "", alt: "" });
  const { data: settings = [] } = useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => (await db.from("site_settings").select("key,value")).data ?? [],
  });
  const { data: polls = [] } = useQuery({
    queryKey: ["admin", "polls"],
    queryFn: async () => ((await db.from("poll_responses").select("*")).data ?? []) as { answer: string }[],
  });
  const postalAddress = settings.find((s) => s.key === "postal_address")?.value ?? "";
  const instagram = settings.find((s) => s.key === "instagram")?.value ?? "";
  const booking = settings.find((s) => s.key === "booking_url")?.value;
  const html = useMemo(() => renderKitchenTable(issue, { ...links, book: links.book === demoLinks.book && booking ? booking : links.book }, { postalAddress, instagram, portraitUrl: photo.url }), [issue, links, booking, postalAddress, instagram, photo.url]);
  const field = (id: string, label: string, value: string, change: (value: string) => void, multiline = false) => (
    <div key={id} className="grid gap-2">
      <Label htmlFor={`nl-${id}`}>{label}</Label>
      {multiline ? <Textarea id={`nl-${id}`} value={value} rows={4} onChange={(e) => change(e.target.value)} /> : <Input id={`nl-${id}`} value={value} onChange={(e) => change(e.target.value)} />}
    </div>
  );
  return <>
    <AdminHeader title="Newsletter" />
    <p className="mb-6 text-muted-foreground">The Kitchen Table [name TBC] · Draft preview. Nothing is sent. Edits last until you leave this section.</p>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="min-w-0 space-y-5">
        <details open className="rounded-[22px] bg-card p-5">
          <summary className="cursor-pointer font-semibold">Edit issue</summary>
          <div className="mt-5 grid gap-4">
            {textFields.map(([key, label]) => field(key, label, issue[key], (value) => setIssue((i) => ({ ...i, [key]: value })), ["heroQuote", "preheader", "contents", "psBefore", "signOff"].includes(key)))}
            {field("paragraphs", "Essay paragraphs (blank line between each)", issue.leadParagraphs.join("\n\n"), (value) => setIssue((i) => ({ ...i, leadParagraphs: value.split("\n\n") })), true)}
            {issue.journalCards.map((card, index) => <fieldset key={index} className="grid gap-4"><legend className="mb-2 font-semibold">Journal card {index + 1}</legend>
              {(["door", "title", "line"] as const).map((key) => field(`card-${index}-${key}`, key === "line" ? "One-line" : key === "door" ? "Door label" : "Title", card[key], (value) => setIssue((i) => {
                const cards: NewsletterIssue["journalCards"] = [{ ...i.journalCards[0] }, { ...i.journalCards[1] }];
                const selected = cards[index]; if (selected) selected[key] = value;
                return { ...i, journalCards: cards };
              })))}
            </fieldset>)}
            {issue.questions.map((question, index) => field(`question-${index}`, `Try this question ${index + 1}`, question, (value) => setIssue((i) => {
              const questions: NewsletterIssue["questions"] = [...i.questions]; questions[index] = value; return { ...i, questions };
            }), true))}
          </div>
        </details>
        <details className="rounded-[22px] bg-card p-5"><summary className="cursor-pointer font-semibold">Issue links</summary><div className="mt-5 grid gap-4">
          {linkFields.map(([key, label]) => field(`link-${key}`, label, links[key], (value) => setLinks((l) => ({ ...l, [key]: value }))))}
          <p className="text-sm text-muted-foreground">Postal address: {postalAddress.trim() || "[Postal address]"} · Set in Settings.</p>
        </div></details>
        <Panel>
          <p className="font-semibold">Sign-off portrait</p>
          <p className="mb-3 mt-1 text-sm text-muted-foreground">The small round photo next to "Sam". Defaults to the About portrait. It's the only image in the email.</p>
          <MediaPicker value={photo.url || "/__l5e/assets-v1/fae0f333-b7fc-4ce2-a276-998870b2aabb/sam-about-portrait.webp"} usage={`Newsletter #${issue.number}`} onPick={setPhoto} />
        </Panel>
        <Panel><p className="font-semibold">Past issues <span className="font-normal text-soft">[demo]</span></p><ul className="mt-3 divide-y divide-border text-sm">
          {pastIssues.map((i) => <li key={i.n} className="py-2"><span className="font-semibold">#{i.n} {i.title}</span><span className="block text-soft">{i.date} · {i.sent} recipients · {i.opened} opened</span></li>)}
        </ul></Panel>
        <Panel><p className="font-semibold">"How's this week been?" answers</p><ul className="mt-3 grid grid-cols-3 gap-2 text-center">
          {["calm", "coping", "rough"].map((a) => <li key={a} className="rounded-[14px] bg-background p-3"><span className="block text-2xl font-bold">{polls.filter((p) => p.answer === a).length}</span><span className="text-xs capitalize text-soft">{a}</span></li>)}
        </ul></Panel>
      </div>
      <div className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <div role="group" aria-label="Preview size" className="mb-3 inline-flex rounded-full bg-card p-1">
          {(["desktop", "mobile"] as const).map((d) => <Button key={d} type="button" size="sm" variant={device === d ? "default" : "ghost"} aria-pressed={device === d} onClick={() => setDevice(d)} className="capitalize">{d}</Button>)}
        </div>
        <p className="mb-3 text-xs text-soft">Listen links to: {SAMPLE_VOICE_LABEL}.</p>
        <iframe title="Newsletter preview" srcDoc={html} sandbox="allow-popups" className={`mx-auto block h-[1400px] max-w-full rounded-[22px] border border-border bg-background ${device === "mobile" ? "w-[375px]" : "w-full"}`} />
      </div>
    </div>
  </>;
}
