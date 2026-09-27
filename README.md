# Dad's Daily Tracker

A small installable web app (PWA) with three quick daily check-in surveys
(morning / afternoon / evening). Every submission is timestamped
automatically and saved as a new row in a Google Sheet.

## What's here

- `index.html`, `css/style.css`, `js/app.js`, `js/config.js` — the app itself
- `manifest.json`, `sw.js`, `icons/` — makes it installable on the home screen
- `apps-script/Code.gs` + `apps-script/README.md` — the Google Sheet backend
  and how to deploy it
- `SHORTCUTS_SETUP.md` — how to set up the iPhone notification banners

## Surveys

**Morning** — sleep quality (1–5).

**Afternoon** (about the morning) — mood, physical feeling, seizure activity
(scale + optional note), activities with duration, how hard the morning was,
free text.

**Evening** (about the afternoon) — same question set as afternoon, reframed
around the afternoon.

## Setup order

1. **Deploy the Sheet backend first** — follow
   [`apps-script/README.md`](./apps-script/README.md). You'll end up with a
   webhook URL.
2. **Paste that URL** into `js/config.js` (`SHEET_WEBHOOK_URL`).
3. **Deploy the app to Vercel** (see below).
4. **Set up the phone reminders** — follow
   [`SHORTCUTS_SETUP.md`](./SHORTCUTS_SETUP.md).

## Deploying to Vercel

This is a static site — no build step needed.

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. Go to [vercel.com](https://vercel.com), **Add New > Project**, and import
   this GitHub repo.
3. Framework preset: **Other** (no build command, no output directory
   override needed — it serves the repo root as-is).
4. Deploy. Vercel gives you a URL like `https://your-project.vercel.app`.
5. Use that URL (with `?survey=morning` etc.) in the Shortcuts setup.

## Local testing

Since this is just static files, any local static server works, e.g.:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/?survey=morning` (note: service worker
registration and "Add to Home Screen" require HTTPS in production, but you
can test the forms and submission logic over plain HTTP locally).

## Data / sharing note

The Apps Script webhook URL only allows *writing* new rows — it doesn't let
anyone read the sheet. Sharing/viewing access to the actual Google Sheet is
controlled separately in Google Sheets' own **Share** settings. Since this
includes health information (seizure data), share the sheet only with the
specific people who need it — not "anyone with the link."

## Later upgrades (not needed for v1)

- Real push notifications instead of Shortcuts banners (needs a small
  backend + scheduler — see the project plan for tradeoffs)
- In-app settings page for changing reminder times
- "Already submitted today" state
- In-app trend dashboard
