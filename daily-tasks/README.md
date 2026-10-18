# Daily Tasks kiosk slide

Display-only page connected to the department admin's existing `dailyTasks` collection. No login, forms, completion buttons, or writes. Edit assignments and schedules in Dept Admin > Daily Tasks.

Shows tasks scheduled Daily or for today's weekday in America/New_York, including assignees. The date and schedule roll over automatically at midnight. Four tasks appear per page; additional pages rotate every 20 seconds. Long descriptions scroll automatically and extend the page duration to allow reading. Live changes appear automatically. Empty schedules and connection failures have explicit messages; previously received records remain visible during interruptions.

Copy this folder's contents, including assets/, into a GitHub Pages repository root and enable Pages. Add the resulting HTTPS URL as a slide in the dashboard's master admin. No build or sign-in is needed. Nothing has been deployed or added to the live dashboard.

For local preview, serve this folder through a static HTTP server. The bundled assets/firebase-client.js matches the other department kiosk applications.
