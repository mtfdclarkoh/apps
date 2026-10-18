# Hospital tracker

Both pages use `firebase-config.js` for the `hospital-tracker-a6216` project. Serve this folder over HTTP(S), such as Live Server or GitHub Pages.

## Browser access setup

Publish this folder's `firestore.rules` to the hospital tracker project's default Firestore database. These rules allow authenticated kiosk sessions to read hospitals and recent hospital logs. Only the verified Google account `mtfdclarkoh@gmail.com` may write records or read system logs and keyword mappings. All other paths remain denied. Anonymous authentication is sufficient for kiosk reads and grants no write access.

Enable Google as a sign-in provider in Firebase Authentication. Use `mtfdclarkoh@gmail.com` as the project support email. Keep Anonymous enabled for the kiosk. Add the actual website hostname to Authentication > Settings > Authorized domains if needed; newer projects may require localhost or 127.0.0.1 to be added explicitly for local testing.

Open `admin.html` and sign in with `mtfdclarkoh@gmail.com`. The admin page no longer uses anonymous sign-in. Its account check is a UI convenience; Firestore rules enforce access. The kiosk (`index.html`) continues signing in anonymously.

The admin utilities are compiled into `admin-utilities.css`; the Tailwind CDN is no longer used. To rebuild after changing utility classes, run the Tailwind CLI from the parent dashboard project with this page as its content source.

## Email integration

`apps-script/Code.gs` and `apps-script/appsscript.json` back up the MTFD Hospital App script. It polls unread messages from `no-reply@appmail.juvare.com` as `mtfdclarkoh@gmail.com`, retaining second-line hospital-name parsing and keyword mappings. It uses Google OAuth and IAM rather than a private key. Firestore paths are under `artifacts/default-app-id/public/data`.

The mailbox owner needs Firestore IAM access. Browser Firestore rules do not control the script's IAM-authorized requests. The trigger runs `checkEmails` every five minutes with daily failure notifications. The manual run on October 18, 2026 at 11:43 AM Eastern completed with no matching unread emails; a real email-to-hospital update has not yet been verified.

## Validation and remaining deployment

Page JavaScript syntax checks passed. Mocked authentication checks verified that anonymous and other Google accounts cannot start admin subscriptions, the administrator starts all four subscriptions, and sign-out releases them. All subscription listeners handle errors. The production stylesheet built successfully.

The Firestore rules were published on October 18, 2026, and Google sign-in was enabled with support email mtfdclarkoh@gmail.com. Anonymous sign-in remains enabled. Console verification confirmed both changes. The browser connection could not reach the local preview server, so a full browser sign-in and kiosk read still need verification from the local Live Server pages.

