# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Site structure (2026 vision build)
- `/` hub with door cards · `/divorce` · `/reinvention` · Abroad and Midlife are "Coming soon" waitlists.
- `/method` includes the trigger loop and Fact or story exercise · `/voice-notes?door=` filter · `/journal` and `/journal/:slug`.
- `/work-with-me` ("With me" and "On your own"; `/shop` redirects to its On your own block), `/checkout/:slug` ([Connect Stripe] placeholder) · `/poll` records newsletter poll clicks.
- Admin adds Tasks, Content Studio (ideas, calendar, book), Newsletter preview (desktop/mobile toggle, past issues), client pages opened via "Open" (header with monthly payments, LOVE progress, timeline, milestones, tasks, consent-gated session summaries with delete-recording), and a "Record a note" button at the top of every section.
- The deferred email plan is kept in `docs/email-plan.md`.

## Kitchen Table template
- `src/emails/kitchen-table.ts` contains the designer’s exact newsletter master, typed issue/link/settings fields, and `renderBaseEmail` for future automatic emails.
- Admin Newsletter edits all issue copy and links beside the desktop/mobile preview; edits are temporary, and past issues are fictional. Settings supplies the postal address (blank displays `[Postal address]`).
- All user text is escaped; links allow HTTPS or same-origin paths only. Unconnected online/unsubscribe/preferences links remain inert. No emails are sent, and `docs/email-plan.md` remains deferred and untouched.

## Admin: clients, content and photos

- **Record a note** matches names against clients and leads. Existing client: the note (with transcript) goes on their timeline, implied tasks are created and the working document updates. New person: lead + task. Sam can change the destination before saving.
- **Working document** (client page): private sections (stage and why, patterns, triggers, improving, open threads, next session, questions). Updates after session summaries, voice notes, email summaries and pasted WhatsApp excerpts; Sam's edits are kept.
- **To the client**: optional 3-line session recap (off by default per client) and an end-of-stage progress letter shown on the LOVE track. Both need approval; nothing is sent until email sending is connected.
- **Content Studio** formats: voice note prompt, Instagram reel, Instagram carousel, LinkedIn post, Journal article, podcast, book chapter outline. Ideas come from trends [demo], Sam's own pieces and anonymised session themes.
- **Photos**: tagged library with alt text and "used in". Pick from it in Content Studio, the newsletter and Settings (Home/Divorce page photo). Upload works now; Google Drive import ("Web Sam" folder) is a [Connect Google Drive] placeholder.
