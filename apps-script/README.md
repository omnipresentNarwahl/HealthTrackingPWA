# Google Sheet + Apps Script setup

This wires up the "backend": a Google Sheet that collects every survey
response, and a small Apps Script Web App that the PWA calls to append rows.

## 1. Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it something like **Dad's Daily Tracker**.
2. You don't need to create any tabs or headers by hand — the script below
   creates a `Responses_v2` tab and header row automatically on first submit.

## 2. Add the script

1. In the sheet, go to **Extensions > Apps Script**.
2. Delete any starter code in `Code.gs` and paste in the contents of
   [`Code.gs`](./Code.gs) from this repo.
3. Click the disk icon (or Ctrl/Cmd+S) to save the project. Give it a name
   like "Daily Tracker Webhook".

## 3. Deploy as a Web App

1. Click **Deploy > New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: anything, e.g. "Daily Tracker v1"
   - **Execute as**: **Me**
   - **Who has access**: **Anyone**
     (This does *not* mean anyone can read the sheet — it only means anyone
     with the secret webhook URL can submit a new row. Keep the URL private,
     same as a password. The Sheet itself is shared separately, see the
     sharing note in the main README.)
4. Click **Deploy**.
5. The first time, Google will ask you to authorize the script — click
   through the "Advanced" / "Go to Daily Tracker Webhook (unsafe)" prompts.
   This warning is expected for personal scripts you wrote yourself.
6. Copy the **Web app URL** it gives you. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Wire it into the PWA

1. Open `js/config.js` in this repo.
2. Replace `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE` with the URL you copied.
3. Commit and redeploy the PWA (or just push — if hosted on Vercel it
   redeploys automatically).

## 5. Test it

Open the app, fill out any survey, and hit Submit. Within a couple of
seconds you should see a new `Responses_v2` tab appear in the Sheet with a
header row and your test row underneath.

## Note on the `Responses` vs `Responses_v2` tabs

The schema grew (new seizure/ictal rating, per-activity columns, device
info, expanded morning survey) in a way that doesn't fit the original
`Responses` tab's header row. Rather than rewrite history, new submissions
go to a new `Responses_v2` tab with the new header, and the original
`Responses` tab is left untouched as read-only history from before the
change. If you want everything in one place for analysis, copy/paste the
old rows into `Responses_v2` manually and leave the new columns blank for
them — there's no automatic migration.

## Updating the script later

If you ever edit `Code.gs`, you need to create a **new deployment version**
for the change to take effect:

- **Deploy > Manage deployments > (pencil/edit icon) > Version: New version > Deploy**

Editing the file alone does *not* update the live URL's behavior until you
do this.
