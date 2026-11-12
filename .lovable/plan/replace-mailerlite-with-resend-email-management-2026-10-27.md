# Replace MailerLite with Resend email management

## What Sam gets

Keep the existing website and calm admin design. Add **Emails**, **Newsletters** and **Subscribers** inside `/admin`, plus an email history in each lead and client record. The only new public page is **Unsubscribe**; existing forms keep their appearance.

### 1. Sender settings and safe setup
- One editable sender record: **Sam Brindle**, **hello@sambrindlecoaching.com**, **sambrindlecoaching@gmail.com** as Reply-To.
- Settings shows **[Pending: verify sambrindlecoaching.com in Resend]** until Resend confirms verification, not until someone ticks a box.
- Show the DNS records supplied by Resend for adding at GoDaddy. Do not change existing Gmail/mailbox records blindly.
- Before the connection or domain is ready, retain messages with a clear **Waiting for connection / Waiting for domain verification** reason. Nothing falsely appears sent.
- Connect through Resend's secure Lovable connection screen; never paste credentials into chat or code.

### 2. Subscribers and consent
- Keep Leads as the capture point; link normalised, unique subscriber email addresses to leads and clients.
- Retain consent timestamp, capture/import source and consent evidence. Existing `consent: true` records can retain their original capture date as legacy evidence, explicitly labelled; do not invent a fresh consent event.
- No newsletter or reflection series goes to a person without recorded marketing consent. Being a client alone is not consent. Existing contact-form consent permits a reply only, not newsletter enrolment; preserve that distinction.
- Unsubscribed, bounced or complained addresses are suppressed. Imports and new form submissions cannot silently remove suppression.
- A resource confirmation follows its specific request; Sam's notifications are operational. Reflection sequences and newsletters are marketing.

### 3. Automatic emails
Admin can edit each subject and body, preview it and switch it on/off. All newly drafted automations start **off / Draft for Sam's review**.

| Trigger | Email |
|---|---|
| Voice-note unlock | Welcome, library link and a short invitation to reply |
| 15-day series signup | Eight letters on days **1, 3, 5, 7, 9, 11, 13, 15** |
| Quiz with email | Follow-up matching listen / reset / programme result |
| Resource request | The specific resource's download link |
| New lead, contact message or quiz with email | A notification to Sam's Gmail |

The eight series drafts cover: fact versus story; inherited beliefs; triggers; acceptance without approval; ordinary future evenings; making space; choosing differently; and what comes next. Each contains **three LOVE reflection questions**; the final letter invites a free call. Use Sam's British, dry, warm voice and “parent”.

The current quiz saves an anonymous result first, then an optional lead carrying `quiz:<result>`; use that email-bearing lead for the matched follow-up and notification. Add correlation only where needed without changing the visible quiz. Prevent duplicate notifications when a quiz creates both records. Use event identifiers so retries cannot repeat accepted sends. Disabling a template pauses its outstanding messages; editing does not rewrite previously sent history.

Resource links and booking links come from editable settings. A missing real download link is marked **[Resource link needed]** and holds the relevant email, rather than sending a broken or invented link. Creating resource files is not included in this request.

### 4. Branded letters and newsletters
- A shared, light email layout: ink text, sage accents, marigold links/buttons, Familjen Grotesk with reliable system fallbacks. Mostly text, no heavy graphics.
- Footer: Sam Brindle, Maresme Barcelona, unsubscribe link. **[Postal address needed]** remains visible in Settings until Sam supplies the address required for marketing emails.
- Simple newsletter editor with headings, bold, links and one uploaded image; safe rich-text rendering and plain-text alternative.
- Preview desktop/mobile, send a test **only to Sam**, select all subscribers / leads / clients / source, and display the eligible recipient count before confirming.
- Save drafts, send now, schedule in **Europe/Madrid** local time, and cancel unsent scheduled newsletters.
- Sent history retains the content snapshot and separate counts for targeted, accepted, failed and suppressed recipients. “Sent” means Resend accepted it, not proof it reached an inbox.

### 5. Unsubscribe, delivery history and imports
- Branded public unsubscribe page using a secure recipient-specific link; no email address exposed in the URL.
- RFC-compatible one-click POST unsubscribe plus **List-Unsubscribe** and **List-Unsubscribe-Post** headers for marketing. A GET opens the confirmation page without accidental removal by link scanners.
- Every send re-checks suppression immediately before contacting Resend, including test and automatic sends.
- Verified Resend webhooks record bounced/failed delivery and complaints; retries are safe and complaint suppression cannot be bypassed.
- Per-lead/client history: queued, waiting, sent, failed, bounced, suppressed; timestamp, subject and clear reason.
- MailerLite CSV upload with mapping/preview for email, name, subscribed date and consent. Handle quoted CSV fields, invalid rows, duplicates, existing suppression and absent consent. Show imported / skipped / invalid totals; no automatic campaign starts after import.

### 6. Background sending and demo safety
- Durable queued messages, bounded batches, safe concurrent claims, provider idempotency and controlled retry/backoff. Failed messages remain inspectable rather than disappearing.
- Wake sending when a campaign or event is queued. Keep scheduled processing active only while future or retry messages remain, and stop when drained.
- Default scheduled delivery window: **within one hour** of the chosen time. Show that window beside scheduling; immediate sends begin immediately once verification is complete. This avoids frequent idle checks. Hourly scheduled callbacks may have an additional approximately 30-second platform spread.
- Existing demo mode gets fictional subscribers, draft letters, newsletters and email logs. Test/send/import actions simulate locally and never call Resend or read real subscriber records.

## Connection needed

No accessible Resend connection is configured yet. Create one securely here:

https://lovable.dev/connectors/resend/connect?workspace=f68t3MPcTgzs6V2CseoM

Then it can be linked to this app. Domain verification and signed webhooks require that connection; real delivery stays blocked until these are ready. Do not request an API key in chat.

## Technical approach
- Add application tables for subscribers/consent evidence, sender settings, editable automation templates, series enrolments, newsletters, queue/history and suppression. Include explicit grants and admin-only RLS in every schema change; public readers cannot inspect subscribers or logs.
- Preserve allowlist-only admin access. Server functions check the current admin role before imports, tests, campaign sends and sender changes; the login page alone is not a security boundary.
- Use database events for existing capture paths, retaining current public-page presentation and narrow insert permissions. Snapshot validated event data and resolve quiz/resource context before enqueueing.
- Use authenticated TanStack server functions for app actions and Worker-compatible fetch calls through the linked Resend connection. No browser secrets and no new Edge Functions.
- Use authenticated managed HTTP callbacks under `/api/public/` for processing. This project has the required generated authentication helper and no current schedules. Use the schedule tools rather than hand-authored HTTP cron SQL.
- Use signature-checked public endpoints for Resend delivery events and narrowly scoped token-verified unsubscribe writes. Save unsubscribe credentials securely; never expose subscriber lists through these endpoints.
- Keep email modules focused and extend the existing admin demo data boundary. Document architecture and handover in AGENTS/README.

## Verification
- Concrete tests for eight messages at two-day intervals; consent and audience filters; case-insensitive deduplication; suppression preservation on import; one-click unsubscribe; role enforcement; replay safety and queue retry behaviour.
- Check the complete admin workflow using a real authorised session: save a sender/template, import a small labelled test CSV, preview a newsletter, schedule/cancel, and inspect per-record history.
- Check desktop/mobile demo behaviour and confirm no real provider requests occur there.
- With Resend connected and verified, send one explicitly authorised test to Sam, read its provider result and verify the log through the dashboard. Until then, report live sending/webhook delivery as unverified.