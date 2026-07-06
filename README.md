// ---------------------------------------------------------------------------
// Odds API key config.
//
// The app reads window.ODDS_API_KEY from this file if it is set. If it is left
// blank, the app falls back to the key you type into the field in the app
// (which is saved only in your browser's localStorage).
//
// ⚠ SECURITY NOTE: anything in this file ships to the browser. If you deploy
// the site PUBLICLY, whatever key is here is readable by anyone who views the
// page source. Only put a real key here for a private/personal deployment.
//
// --- Keeping it out of the repo (recommended) ---
// 1. Add this file to .gitignore so your real key never gets committed.
// 2. In your GitHub Actions deploy workflow, generate it from a repo secret
//    before publishing, e.g.:
//
//    - name: Write Odds API key
//      run: echo "window.ODDS_API_KEY='${{ secrets.ODDS_API_KEY }}';" > config.js
//
// For a TRULY secret key, proxy the request through a serverless function
// (Cloudflare Worker / Vercel) that stores the key server-side instead.
// ---------------------------------------------------------------------------

window.ODDS_API_KEY = "";
