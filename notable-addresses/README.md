# Notable Addresses kiosk slide

Read-only, unbranded dashboard slide. Displays address, priority, and the full note from the existing Firebase addressNotes collection. Changes made through the department admin appear live. No login, forms, controls, rotation, or write operations.

Matches the dark unit status slide. Uses two columns on kiosk displays, with Red priorities first, then Yellow and Green, and addresses sorted within each priority. Priority is identified with text and color. All records are rendered; the page grows vertically if the records exceed the available slide height. Verify the actual address list at your kiosk dimensions before deployment. Notes are never truncated.

## GitHub Pages

Upload this folder's contents to a separate repository, keeping assets/ intact. In Settings > Pages, deploy from main and / (root). Use the resulting HTTPS URL as a dashboard slide. No build or authentication setup is required. This application has not been uploaded or deployed.

The existing Firebase rules allow public reads. This page makes no database changes. Connection failures retain previously received records where available. Empty collections show an explicit empty state.

For local preview, serve this folder with a static HTTP server. assets/firebase-client.js is the bundled SDK from the parent dashboard.
