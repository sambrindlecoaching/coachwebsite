import { SAMPLE_VOICE_URL } from '@/content/sample-audio';
/** Designer's master: retain the supplied email layout and inline styles verbatim. */
export type NewsletterIssue = {
  number: string; date: string; preheader: string; contents: string; heroQuote: string;
  leadKicker: string; leadTitle: string; leadParagraphs: string[];
  listenTitle: string; listenDuration: string; listenLine: string;
  journalCards: [{ door: string; title: string; line: string }, { door: string; title: string; line: string }];
  questions: [string, string, string]; replyPrompt: string; signOff: string;
  psBefore: string; psLinkLabel: string; psAfter: string;
};
export type EmailLinks = {
  viewInBrowser: string; journal: string; journal1: string; journal2: string; voiceNote: string;
  poll: string; book: string; unsubscribe: string; preferences: string;
};
export type EmailSettings = { postalAddress?: string; instagram?: string; portraitUrl?: string };
/** Sign-off portrait must be an absolute public URL so it loads in email clients. */
export const DEFAULT_PORTRAIT_URL = 'https://love-through-change.lovable.app/__l5e/assets-v1/fae0f333-b7fc-4ce2-a276-998870b2aabb/sam-about-portrait.webp';
export function absolutePortraitUrl(url?: string): string {
  const u = url?.trim();
  if (!u) return DEFAULT_PORTRAIT_URL;
  return u.startsWith('/') ? `https://love-through-change.lovable.app${u}` : u;
}
const signatureHTML = (signOff: string) => `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;"><tr>
      <td width="56" valign="top" style="width:56px; padding:0 16px 0 0;"><img src="{{portrait}}" width="56" height="56" alt="Sam Brindle" style="display:block; width:56px; height:56px; border-radius:50%; border:0; background:#D5DAD3; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; line-height:14px; color:#4F5A54;"></td>
      <td valign="middle" style="font-family:'Source Serif 4',Georgia,serif; color:#1E2723;"><div style="font-style:italic; font-size:30px; line-height:36px;">Sam</div><div style="font-size:16px; line-height:24px; color:#3A4540;">${signOff}</div></td>
    </tr></table>`;
export const demoIssue: NewsletterIssue = {
  number: '04', date: '27 October 2026',
  preheader: "The house goes quiet at six. Here's what to do with the next ten minutes.",
  contents: "The Sunday the kids go back · A voice note for six o'clock · Two from the Journal · One question",
  heroQuote: 'They left at six. That\'s a fact. “They\'re happier there” is a story.',
  leadKicker: 'Divorce · 3-minute read', leadTitle: 'The Sunday the kids go back',
  leadParagraphs: [
    "The bags are by the door by half five. You've checked the PE kit twice. Then the car pulls away, and the house does that thing it does: it goes very, very quiet.",
    "For a long time I filled that quiet. Netflix, wine, emails I didn't need to answer. Anything but sit with it. What I didn't realise was that the quiet wasn't the problem. The commentary was.",
    "This week, try this. When they leave, don't plan the whole weekend. Just choose the next ten minutes. A walk. A bath. Ringing someone who makes you laugh. Small, deliberate, yours.",
  ],
  listenDuration: '3 min', listenTitle: 'The kids just left for the weekend', listenLine: "For six o'clock on a Sunday. Put the kettle on first.",
  journalCards: [
    { door: 'Divorce', title: 'Fact or story: the two sentences that run your divorce', line: 'One is true. The other just feels it.' },
    { door: 'Reinvention', title: 'The Monday with nowhere to be', line: 'On losing the job and keeping yourself.' },
  ],
  questions: ["What's the story you tell yourself when they leave?", 'Which part of it is actually a fact?', "What would you do with the next ten minutes if you didn't believe the rest?"],
  replyPrompt: 'Hit reply and send me your answer to number two. I read every one.',
  signOff: "Go gently this fortnight. The quiet's not out to get you.",
  psBefore: "If it's all a bit much right now, a single 90-minute Reset Session is a good place to start.",
  psLinkLabel: 'Book a free call first', psAfter: "and we'll see.",
};
export const demoLinks: EmailLinks = {
  viewInBrowser: '[view-in-browser]', journal: '/journal/the-sunday-the-kids-go-back',
  journal1: '/journal/fact-or-story', journal2: '/journal/the-monday-with-nowhere-to-be',
  voiceNote: SAMPLE_VOICE_URL, poll: '/poll', book: '/book',
  unsubscribe: '[unsubscribe-link]', preferences: '[preferences-link]',
};
export const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/** Only explicit HTTPS or same-origin paths may become clickable email links. */
export function safeEmailUrl(value: string): string {
  if (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u0020]/.test(value)) return value;
  try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password) return url.href; } catch { /* Unconnected placeholders stay inert. */ }
  return '#';
}
export function pollUrl(base: string, answer: 'calm' | 'coping' | 'rough'): string {
  const safe = safeEmailUrl(base);
  if (safe === '#') return '#';
  const url = new URL(safe, 'https://email.invalid');
  url.searchParams.set('a', answer);
  return safe.startsWith('/') ? `${url.pathname}${url.search}${url.hash}` : url.href;
}

const master = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>The Kitchen Table · No. {{number}}</title>
<link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;600;700&amp;family=Source+Serif+4:ital,wght@0,400;1,400&amp;display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: #E4E7E1; }
  a { color: #1E2723; }
  @media only screen and (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad { padding-left: 24px !important; padding-right: 24px !important; }
    .stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
    .stack-gap { padding: 0 0 16px 0 !important; }
    .mast { font-size: 44px !important; line-height: 44px !important; }
    .hero-quote { font-size: 26px !important; line-height: 34px !important; }
    .h2 { font-size: 26px !important; line-height: 30px !important; }
    .poll a { display: block !important; margin: 0 0 8px 0 !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background:#E4E7E1;">
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#E4E7E1;">{{preheader}}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#E4E7E1;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px; background:#EEF0EB; border-radius:24px; overflow:hidden;">
  <tr><td class="pad" style="padding:22px 40px 0 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
      <td style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;">No. {{number}} &middot; {{date}}</td>
      <td align="right" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;"><a href="{{viewInBrowser}}" style="color:#4F5A54; text-decoration:underline;">Read online</a></td>
    </tr></table>
  </td></tr>
  <tr><td class="pad" style="padding:28px 40px 6px 40px;">
    <div class="mast" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:58px; line-height:56px; font-weight:700; letter-spacing:-2px; color:#1E2723;">The Kitchen Table</div>
  </td></tr>
  <tr><td class="pad" style="padding:6px 40px 24px 40px; font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:17px; line-height:24px; color:#3A4540;">Notes from Sam Brindle, for when life changes and your mind gets loud.</td></tr>
  <tr><td class="pad" style="padding:0 40px;"><div style="height:2px; background:#1E2723; line-height:2px; font-size:2px;">&nbsp;</div></td></tr>
  <tr><td class="pad" style="padding:14px 40px 32px 40px; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; line-height:20px; color:#4F5A54;">
    <strong style="color:#1E2723;">In this issue</strong> &nbsp;&middot;&nbsp; {{contents}}
  </td></tr>
  <tr><td style="padding:0 16px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#1E2723; border-radius:20px;">
      <tr><td class="pad" style="padding:44px 40px 40px 40px;">
        <div style="font-family:'Source Serif 4',Georgia,serif; font-size:72px; line-height:40px; color:#E9B23A;">&ldquo;</div>
        <div class="hero-quote" style="font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:30px; line-height:40px; color:#EEF0EB; padding-top:4px;">{{heroQuote}}</div>
        <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; letter-spacing:1.2px; text-transform:uppercase; color:#C3CCC6; padding-top:22px;">This fortnight's idea</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td class="pad" style="padding:40px 40px 8px 40px;">
    <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54; padding-bottom:10px;">{{leadKicker}}</div>
    <div class="h2" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:32px; line-height:36px; font-weight:700; letter-spacing:-0.8px; color:#1E2723;">{{leadTitle}}</div>
  </td></tr>
  <tr><td class="pad" style="padding:14px 40px 0 40px; font-family:'Source Serif 4',Georgia,serif; font-size:18px; line-height:30px; color:#1E2723;">
    {{paragraphs}}
    <p style="margin:0 0 6px 0;"><a href="{{journal}}" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:600; color:#1E2723; text-decoration:underline;">Read the full piece in the Journal &rarr;</a></p>
  </td></tr>
  <tr><td class="pad" style="padding:32px 40px 0 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF; border:1px solid #D5DAD3; border-radius:20px;">
      <tr>
        <td width="96" valign="middle" style="padding:22px 0 22px 22px;">
          <a href="{{voiceNote}}" style="display:block; width:64px; height:64px; border-radius:32px; background:#E9B23A; text-align:center; text-decoration:none;"><span style="display:inline-block; font-family:Arial,sans-serif; font-size:22px; line-height:64px; color:#1E2723; padding-left:4px;">&#9654;</span></a>
        </td>
        <td valign="middle" style="padding:22px 22px 22px 6px;">
          <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;">Listen &middot; voice note &middot; {{listenDuration}}</div>
          <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:21px; line-height:26px; font-weight:700; color:#1E2723; padding-top:4px;">{{listenTitle}}</div>
          <div style="font-family:'Source Serif 4',Georgia,serif; font-style:italic; font-size:15px; line-height:22px; color:#3A4540; padding-top:4px;">{{listenLine}}</div>
        </td>
      </tr>
    </table>
  </td></tr>
  <tr><td class="pad" style="padding:40px 40px 14px 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
      <td style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:13px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:#1E2723; border-bottom:1px solid #1E2723; padding-bottom:8px;">From the Journal</td>
    </tr></table>
  </td></tr>
  <tr><td class="pad" style="padding:0 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr>
      <td class="stack stack-gap" width="50%" valign="top" style="padding-right:10px;">
        <a href="{{journal1}}" style="text-decoration:none; display:block;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF; border-radius:16px;"><tr><td style="padding:20px;">
            <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;">{{card1Door}}</div>
            <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:18px; line-height:23px; font-weight:700; color:#1E2723; padding-top:6px;">{{card1Title}}</div>
            <div style="font-family:'Source Serif 4',Georgia,serif; font-size:15px; line-height:22px; color:#3A4540; padding-top:8px;">{{card1Line}}</div>
          </td></tr></table>
        </a>
      </td>
      <td class="stack" width="50%" valign="top" style="padding-left:10px;">
        <a href="{{journal2}}" style="text-decoration:none; display:block;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF; border-radius:16px;"><tr><td style="padding:20px;">
            <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:11px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;">{{card2Door}}</div>
            <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:18px; line-height:23px; font-weight:700; color:#1E2723; padding-top:6px;">{{card2Title}}</div>
            <div style="font-family:'Source Serif 4',Georgia,serif; font-size:15px; line-height:22px; color:#3A4540; padding-top:8px;">{{card2Line}}</div>
          </td></tr></table>
        </a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td class="pad" style="padding:36px 40px 0 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1.5px solid #1E2723; border-radius:20px;">
      <tr><td style="padding:26px 28px;">
        <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; letter-spacing:1.4px; text-transform:uppercase; color:#4F5A54;">Try this at the kitchen table</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:12px;">
          <tr><td width="28" valign="top" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:#E9B23A; padding:6px 0;">1</td><td style="font-family:'Source Serif 4',Georgia,serif; font-size:17px; line-height:26px; color:#1E2723; padding:4px 0;">{{question1}}</td></tr>
          <tr><td width="28" valign="top" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:#E9B23A; padding:6px 0;">2</td><td style="font-family:'Source Serif 4',Georgia,serif; font-size:17px; line-height:26px; color:#1E2723; padding:4px 0;">{{question2}}</td></tr>
          <tr><td width="28" valign="top" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:700; color:#E9B23A; padding:6px 0;">3</td><td style="font-family:'Source Serif 4',Georgia,serif; font-size:17px; line-height:26px; color:#1E2723; padding:4px 0;">{{question3}}</td></tr>
        </table>
        <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:15px; line-height:22px; color:#3A4540; padding-top:12px;">{{replyPrompt}}</div>
      </td></tr>
    </table>
  </td></tr>
  <tr><td class="pad" style="padding:36px 40px 0 40px;" align="center">
    <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:20px; line-height:26px; font-weight:700; color:#1E2723;">How's this week been?</div>
    <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; color:#4F5A54; padding:4px 0 16px 0;">One tap. No one else sees it.</div>
    <div class="poll">
      <a href="{{pollCalm}}" style="display:inline-block; margin:0 4px; padding:12px 26px; border-radius:999px; background:#FFFFFF; border:1px solid #D5DAD3; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:600; color:#1E2723; text-decoration:none;">Calm</a>
      <a href="{{pollCoping}}" style="display:inline-block; margin:0 4px; padding:12px 26px; border-radius:999px; background:#FFFFFF; border:1px solid #D5DAD3; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:600; color:#1E2723; text-decoration:none;">Coping</a>
      <a href="{{pollRough}}" style="display:inline-block; margin:0 4px; padding:12px 26px; border-radius:999px; background:#FFFFFF; border:1px solid #D5DAD3; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:16px; font-weight:600; color:#1E2723; text-decoration:none;">Rough</a>
    </div>
  </td></tr>
  <tr><td class="pad" style="padding:44px 40px 0 40px;">
    <div style="height:1px; background:#D5DAD3; line-height:1px; font-size:1px;">&nbsp;</div>
    <div style="padding-top:14px;">{{signature}}</div>
    <div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:15px; line-height:23px; color:#3A4540; padding-top:20px;"><strong style="color:#1E2723;">P.S.</strong> {{psBefore}} <a href="{{book}}" style="color:#1E2723; font-weight:600;">{{psLinkLabel}}</a> {{psAfter}}</div>
  </td></tr>
  <tr><td class="pad" style="padding:40px 40px 34px 40px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:2px solid #1E2723;"><tr>
      <td style="padding-top:16px; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:12px; line-height:19px; color:#4F5A54;">
        <strong style="color:#1E2723;">Sam Brindle Coaching</strong> &middot; Maresme, Barcelona &middot; {{postalAddress}}<br>
        You're getting this because you unlocked the voice notes at sambrindlecoaching.com.<br>
        <a href="{{unsubscribe}}" style="color:#4F5A54;">Unsubscribe</a> &nbsp;&middot;&nbsp; <a href="{{preferences}}" style="color:#4F5A54;">Fewer emails</a> &nbsp;&middot;&nbsp; <a href="{{instagram}}" style="color:#4F5A54;">Instagram</a>
      </td>
    </tr></table>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

function paragraphsHTML(paragraphs: string[], dropCap: boolean): string {
  return paragraphs.map((p, index) => {
    const [letter = '', ...rest] = Array.from(p);
    const text = dropCap && index === 0 && letter
      ? `<span style="float:left; font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:58px; line-height:50px; font-weight:700; color:#1E2723; padding:4px 10px 0 0;">${escapeText(letter)}</span>${escapeText(rest.join(''))}`
      : escapeText(p);
    return `<p style="margin:0 0 18px 0;">${text}</p>`;
  }).join('\n    ');
}
function values(issue: NewsletterIssue, links: EmailLinks, settings: EmailSettings): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(issue)) if (typeof value === 'string') fields[key] = escapeText(value);
  for (const [key, value] of Object.entries(links)) fields[key] = escapeText(safeEmailUrl(value));
  issue.journalCards.forEach((card, index) => {
    fields[`card${index + 1}Door`] = escapeText(card.door);
    fields[`card${index + 1}Title`] = escapeText(card.title);
    fields[`card${index + 1}Line`] = escapeText(card.line);
  });
  issue.questions.forEach((question, index) => { fields[`question${index + 1}`] = escapeText(question); });
  fields['paragraphs'] = paragraphsHTML(issue.leadParagraphs, true);
  fields['portrait'] = escapeText(safeEmailUrl(absolutePortraitUrl(settings.portraitUrl)));
  fields['postalAddress'] = escapeText(settings.postalAddress?.trim() || '[Postal address]');
  fields['instagram'] = escapeText(safeEmailUrl(settings.instagram || 'https://www.instagram.com/sambrindlecoaching/'));
  for (const answer of ['calm', 'coping', 'rough'] as const) fields[`poll${answer[0]?.toUpperCase()}${answer.slice(1)}`] = escapeText(pollUrl(links.poll, answer));
  return fields;
}
const fill = (template: string, fields: Record<string, string>) => template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => fields[key] ?? '');
export function renderKitchenTable(issue: NewsletterIssue, links: EmailLinks, settings: EmailSettings = {}): string {
  const fields = values(issue, links, settings);
  return fill(master, { ...fields, signature: fill(signatureHTML(fields['signOff'] ?? ''), fields) });
}

export type AutomaticEmail = { title: string; preheader: string; date: string; paragraphs: string[]; signOff: string };
/** Same outer shell, top strip and footer; small masthead and escaped plain-text body. No sending. */
export function renderBaseEmail(email: AutomaticEmail, links: EmailLinks, settings: EmailSettings = {}): string {
  const start = master.indexOf('  <tr><td class="pad" style="padding:28px 40px 6px 40px;">');
  const footer = master.indexOf('  <tr><td class="pad" style="padding:40px 40px 34px 40px;">');
  const body = `  <tr><td class="pad" style="padding:28px 40px 24px 40px;"><div style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:28px; line-height:34px; font-weight:700; color:#1E2723;">Sam Brindle</div></td></tr>
  <tr><td class="pad" style="padding:0 40px;"><div style="height:2px; background:#1E2723; line-height:2px; font-size:2px;">&nbsp;</div></td></tr>
  <tr><td class="pad" style="padding:32px 40px 8px 40px;"><div class="h2" style="font-family:'Familjen Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif; font-size:32px; line-height:36px; font-weight:700; letter-spacing:-0.8px; color:#1E2723;">${escapeText(email.title)}</div></td></tr>
  <tr><td class="pad" style="padding:14px 40px 0 40px; font-family:'Source Serif 4',Georgia,serif; font-size:18px; line-height:30px; color:#1E2723;">${paragraphsHTML(email.paragraphs, false)}</td></tr>
  <tr><td class="pad" style="padding:28px 40px 0 40px; font-family:'Source Serif 4',Georgia,serif; font-size:18px; line-height:28px; color:#1E2723;">{{signature}}</td></tr>\n`;
  const shell = (master.slice(0, start) + body + master.slice(footer)).replace('<title>The Kitchen Table · No. {{number}}</title>', '<title>{{emailTitle}}</title>').replace('No. {{number}} &middot; {{date}}', '{{date}}');
  const fields = values({ ...demoIssue, preheader: email.preheader, date: email.date }, links, settings);
  fields['emailTitle'] = escapeText(email.title);
  // Insert body after placeholder substitution, so literal {{...}} in user text remains literal.
  const signature = fill(signatureHTML(escapeText(email.signOff)), { portrait: fields['portrait'] ?? '' });
  return fill(shell.replace(body, '{{automaticBody}}'), { ...fields, automaticBody: body.replace('{{signature}}', signature) });
}
