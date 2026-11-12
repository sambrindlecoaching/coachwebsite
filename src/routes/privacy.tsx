import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/site/bits";
import { site } from "@/config/site";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy policy | Sam Brindle Coaching", "How Sam Brindle Coaching collects, uses and protects your personal data under the GDPR."),
  component: PrivacyPage,
});

const sections: [string, string][] = [
  ["Who I am", `${site.name} is run by Samantha Brindle, based in ${site.location}, Spain. I am the data controller for the personal data described here. Contact: ${site.email}. [Legal name, NIF/NIE and postal address to confirm]`],
  ["What I collect", "Your first name and email address when you unlock the voice notes, download a resource, join the email series or take the quiz. Anything you choose to write in the contact form. Quiz answers, stored anonymously unless you choose to add your email."],
  ["Why, and on what legal basis", "To send you what you asked for and occasional emails, based on your consent (Article 6(1)(a) GDPR). To reply to your messages and arrange calls, based on steps prior to a contract (Article 6(1)(b)). You can withdraw consent at any time via the unsubscribe link or by emailing me."],
  ["Where it's stored", "On secure, EU-compliant cloud infrastructure. [Hosting provider, email provider and any transfers outside the EEA, with safeguards, to confirm]"],
  ["How long I keep it", "Until you unsubscribe or ask me to delete it, and in any case no longer than [24 months] of inactivity. Client records are kept as required by Spanish law. [Retention periods to confirm]"],
  ["Your rights", "You can ask to access, correct, delete, restrict or move your data, or object to its use. You also have the right to complain to the Agencia Española de Protección de Datos (aepd.es)."],
  ["Cookies and this device", "The site stores a small note in your browser so the voice notes stay unlocked. No advertising cookies. [Analytics tool, if any, to confirm]"],
];

function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Privacy" title="Privacy policy">
        Plain English, as far as the law allows. [Placeholder text: have this reviewed before launch.] Last updated [date].
      </PageIntro>
      <section className="container-page max-w-3xl pb-24">
        {sections.map(([h, b]) => (
          <div key={h} className="border-t border-border py-8">
            <h2 className="text-2xl">{h}</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted-foreground">{b}</p>
          </div>
        ))}
      </section>
    </>
  );
}
