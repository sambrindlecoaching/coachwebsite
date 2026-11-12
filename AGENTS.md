<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Site-wide config (booking URL, socials, prices) lives in `src/config/site.ts`; admin Settings overrides booking/social links via the `site_settings` table, so read them through `useSiteSettings()`.
- Public pages write only via RLS-limited inserts (leads, quiz_responses); everything else is admin-only, checked with `has_role(auth.uid(),'admin')`.
- Admin access comes only from the `admin_allowlist` table: a trigger blocks sign-ups for other emails and `sync_admin_role()` grants or revokes the role on sign-in. Why: nobody can claim the dashboard by signing up first.
- `/admin` is a single client-only route with inline login; the public header/footer are hidden for paths starting `/admin` in `__root.tsx`.
- Voice note unlock is a soft gate stored in localStorage; locked audio isn't secret.
- Unconfirmed content is marked with [square brackets]; search for `[` before launch.
- Admin sections read/write through `src/components/admin/db.ts`, which swaps to an in-memory fictional store in demo mode. Why: the /admin demo never touches or exposes real data.
- Downloaded site photos use optimised WebP assets imported through Lovable asset pointers, not original-site links. Why: photos must remain available after the original website closes.
- Keep locked package download URLs on the official HTTPS npm registry while preserving versions and integrity hashes. Why: the legacy internal cache hostname is unreachable and prevents preview installation.
- Life-event "doors" are defined in `src/content/doors.ts` (each open door has its own route, e.g. `/divorce`, `/reinvention`); voice notes carry a `door` column. Why: new doors are added as data plus one page, keeping the site method-led.
- Journal articles live as structured blocks in `src/content/journal.ts`, not the database. Why: editorial layout (drop cap, pull quotes, margin notes, Try this, Listen) needs typed blocks.
- Products sit in the `products` table with a nullable `stripe_price_id`; checkout is a placeholder route until payments are connected. Why: Stripe can be added without restructuring.
- Admin AI (transcription, session summaries, voice-capture parsing) runs only in `src/lib/ai.functions.ts` behind admin auth; demo mode uses local examples and never calls AI.
- Email HTML is rendered by the typed master and base shell in `src/emails/kitchen-table.ts`; the admin issue editor uses those functions, and postal_address is a site_settings key. Why: one designer-owned email family with escaped text and validated links, no sending.
- Client detail lives in `src/components/admin/ClientPage.tsx` (opened from Clients via "Open"); "Record a note" (`VoiceCapture.tsx`) sits at the top of every admin section. Why: one calm page per client and one-tap capture on a phone.
- Each client's private working document lives in `client_documents` (one row per client) and is updated only through `useDocUpdater()` in `src/components/admin/WorkingDocument.tsx`, which merges via `mergeDoc` in `src/lib/working-doc.ts`. Why: Sam's edited sections are never overwritten, only added to.
- Client-facing drafts (optional 3-line session recap in `session_summaries.email_draft`, end-of-stage `progress_letters`) always need Sam's approval and are never sent until email sending is connected. Why: nothing reaches a client without her say-so.
- Content Studio draft shapes per format live in `src/lib/content-drafts.ts` (template in demo, same spec sent to AI); session-theme ideas pass through `anonymise()`. Why: one definition per format and no client names in content.
- Photos live in the `media` table plus the public `media` storage bucket; pick them anywhere with `MediaPicker` from `src/components/admin/MediaLibrary.tsx`, which records usage. Page hero overrides are `hero_*` site_settings keys.
- Phase 2 features (shop/course, checkout, Photos, Tasks, client pages and progress letters, non-divorce doors, extra admin sections) are hidden, not deleted, behind `PHASE2` in `src/config/features.ts` (default off). Why: Phase 1 launches small without losing work.
