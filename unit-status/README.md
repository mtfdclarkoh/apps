# Unit Status kiosk slide

Read-only, unbranded slide for the dashboard. Shows unit name, status, location, comments, and last update from the existing Firebase unitStatus collection. No login, forms, or write operations. All edits remain in the existing department admin.

The slide fills its frame and receives live changes automatically. It uses a single fixed grid of 2 rows and 3 columns for the six units. There is no rotation or pagination. No interaction is required. Units without a saved status record are not listed. Long comments are limited to three lines for kiosk readability.

## GitHub Pages

Upload the contents of this folder to a repository, retaining assets/. In Settings > Pages, deploy from main and / (root). Use the resulting HTTPS URL as a dashboard slide. No build step is required. Nothing has been uploaded or deployed yet.

Reads use the project's existing public Firestore read rules. No Firebase sign-in or authentication domain setup is needed for this slide. Connection failures are shown on the slide, with previously received records retained when available.

For local preview, serve this directory with a static HTTP server. The included assets/firebase-client.js is the SDK bundle from the parent dashboard.



