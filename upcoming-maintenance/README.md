# Upcoming Maintenance

Read-only display connected to the same `maintenance` records managed in Department Admin. Shows service, vendor, location, and scheduled date, with today's services highlighted. Past dates are hidden. Uses the station's America/New_York calendar and updates automatically at midnight.

Open `index.html` through a web server. For independent hosting, copy this folder's contents to the root of its own repository. The included Firebase bundle is local; no build or login is required. Firestore rules already permit reading maintenance while limiting writes to administrators.

Four services appear per page, sorted by date. Pages rotate automatically and long descriptions scroll. Empty and connection-error states are displayed; previously received data remains visible if the connection fails.
