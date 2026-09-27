# iPhone Shortcuts setup (the reminder banners)

This sets up three "Personal Automations" on the iPhone that will use so
he gets a tappable notification banner at each check-in time, which opens
straight to the right survey.

You'll do this **on the phone that should get the reminders** (his phone).

## One-time: install the app to the home screen first

1. Open Safari and go to the app's URL (the one you get after deploying to
   Vercel — see the main `README.md`).
2. Tap the **Share** button (square with an arrow) at the bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**. You now have an app icon that opens full-screen, no
   browser bar.

## Set up the three automations

Repeat this once for each survey (morning / afternoon / evening). Example
times below — adjust to whatever fits his day.

1. Open the **Shortcuts** app.
2. Tap the **Automation** tab at the bottom.
3. Tap **+** (top right) > **Create Personal Automation**.
4. Choose **Time of Day**.
   - Set the time (e.g. 8:00 AM for morning).
   - Set **Repeat** to **Daily**.
   - Tap **Next**.
5. Tap **Add Action**, search for **Open URL**, and add it.
6. Tap the URL field and paste the app link with the right survey, e.g.:
   - Morning: `https://YOUR-APP-URL.vercel.app/?survey=morning`
   - Afternoon: `https://YOUR-APP-URL.vercel.app/?survey=afternoon`
   - Evening: `https://YOUR-APP-URL.vercel.app/?survey=evening`
7. Tap **Next**.
8. **This is the important part**: on the "Ask Before Running" toggle,
   leave it **ON** (don't switch to "Run Immediately").
   - With "Ask Before Running" on, iOS shows a real notification banner
     at that time. Tapping the banner runs the automation (opens the
     survey). Ignoring the banner just... does nothing, same as any
     notification you swipe away.
   - "Run Immediately" would silently open the app in the background with
     no banner at all, which defeats the point of a reminder.
9. Tap **Done**.

Repeat for the other two times.

## Result

At 8:00 AM (or whatever times you picked), his phone will show a
notification banner from Shortcuts. Tapping it opens the Daily Tracker
app straight to that check-in.

## Changing the times later

Shortcuts app > Automation tab > tap the automation > tap the time > adjust
> Done. No app update needed.

## Known limitation (by design for v1)

If he swipes away the notification without tapping it, it won't come back
or re-alert him — this is standard behavior for Shortcuts automations. If
that turns out to be a problem in practice, the fix is moving to real web
push notifications (Option B in the project plan), which needs a small
backend + scheduler. The survey and data-saving code doesn't change either
way, so this upgrade can happen later without redoing anything.
