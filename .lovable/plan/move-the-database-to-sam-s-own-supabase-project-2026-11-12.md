# Move the database to Sam's own Supabase project

## Important first: the safe route
Once Lovable Cloud is on, it cannot be switched off or swapped inside this same project. So the move works like this: we make a copy of the project, connect the copy to Sam's Supabase, test it, then point the live address at the copy. The current project stays untouched as the fallback. (Whether a copy starts without Cloud is not yet confirmed; checking that is step 1.)

## 1. What we need from you (and nothing else)
- Sam creates a Supabase project in her own organisation (EU region, e.g. Frankfurt), on a paid plan so it never pauses.
- She invites the builder's email as a member of that organisation (Developer or Admin).
- From the new project's settings: the Project URL, the publishable (anon) key, and the database connection string. Paste these through the secure secrets form, never in chat.
- A short agreed quiet window (about 30 minutes) for the final switch.

## 2. Connecting Lovable to the external project
- In the copied project, connect Supabase through Lovable's Supabase integration and choose Sam's project.
- What changes: the site's three settings (project address, publishable key, project ID) point to Sam's project. The generated database connection files are refreshed. No page or admin code needs rewriting.
- Server-side jobs that need the private service key get it as a secret in the copy.

## 3. Recreating the structure
- Run migrations 0000 to 0008 in order against the empty database.
- Before touching Sam's project, test them on a scratch empty database and record that all nine apply cleanly. Any that fails gets fixed and re-tested before going further.
- Recreate the photo storage space ("media") and its access rules (migration 0006 covers the rules).

## 4. Copying the data
- Export every table with rows: leads, clients, outreach, content pieces, site settings, products, voice notes, admin allowlist, sessions, payments, tasks, milestones, client documents, events, session summaries, progress letters, polls, quiz answers, partners, book chapters, media.
- Import in parent-first order (clients before sessions, payments, etc.).
- Copy the photo and audio files in storage and update their stored web addresses.
- Login accounts: Sam re-creates her account by signing up on the new site (her email is on the allowlist); passwords cannot be copied.
- Check: a table-by-table row count on both sides must match exactly; we share the comparison.

## 5. Keeping security and the admin allowlist
- The migrations bring the access rules, the allowlist, the sign-up block and the sign-in role check.
- Tests on the new database: (a) an account not on the allowlist cannot sign up; (b) a signed-in non-allowlisted account reads zero leads; (c) a visitor can submit a lead but not read any; (d) Sam can read everything. Run the security scan too.

## 6. Switching over without losing leads
- Rehearse the full copy once, then do it for real in the quiet window.
- Final step: briefly pause new sign-ups on the old site, copy only rows added since the rehearsal, compare counts, publish the copy and move the domain to it.
- Afterwards, check the old database for any lead that arrived late and copy it across.
- Rollback: the old project and data are untouched; point the address back to it and copy back any leads taken on the new one.

## 7. Handover: what Sam owns, and what stays with Lovable
Sam owns: the Supabase project (database, logins, storage files, access rules, backups and billing).
Still provided by Lovable after the switch:
- The website hosting and the code project itself (code can be exported to GitHub for her).
- The AI used in admin (transcription, summaries) via Lovable's AI service. Could be replaced with her own AI key later.
- Email sending: none built yet; when added (Resend, per the saved plan) it will be her own Resend account.
- Payments: Stripe not connected yet; will be her own account.
- The old Lovable Cloud database remains on the original project as an archive until you decide to remove it.

## Technical notes
- Verify the copy has no Cloud attached before connecting Supabase.
- Data copy via CSV export per table or pg_dump of public data, with sequences/defaults untouched (all ids are uuids).
- Rewrite media URLs in `media.url`, `voice_notes.audio_url`, `content_pieces.photo_url` and `hero_*` site settings to the new storage address.
- Update the admin cron secret if scheduled jobs exist.
