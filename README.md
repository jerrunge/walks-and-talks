# Walks and Talks with Dad

The public site at walks.jeremyrunge.com. Coaching walks and pep talks with Jeremy Runge in the San Francisco Bay Area.

- `copy.json` is the copy. It mirrors the copy of record, which is edited elsewhere; edits land here and the page is rebuilt.
- `img/` holds the photographs, sized for the page.
- `build.mjs` renders `index.html` from the copy and the photos. Run `node build.mjs`.
- The form posts to a Supabase edge function that files the request and sends a notification. No data is stored in this repo.

Hosted on GitHub Pages. Static, no build step on deploy.
