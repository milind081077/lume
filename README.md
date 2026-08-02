# LUME — Critical Tracker · PWA Package

## What's in this package

```
lume_pwa/
├── index.html          ← Main app (open this in browser)
├── manifest.json       ← PWA manifest (app name, icons, theme)
├── sw.js               ← Service worker (offline support, caching)
├── icons/
│   ├── icon.svg        ← Scalable icon (all browsers)
│   ├── icon-192.png    ← Android home screen icon
│   └── icon-512.png    ← Splash screen / high-res icon
└── README.md           ← This file
```

---

## Installing on your phone (first time)

### Android (Chrome)
1. Copy the **entire `lume_pwa` folder** to your phone, or host it (see below)
2. Open Chrome → navigate to `index.html`
3. Tap the **⋮ menu** → **Add to Home screen** → **Install**
4. Lume appears as a standalone app icon on your home screen

### iPhone / iPad (Safari)
1. Open Safari → navigate to `index.html`
2. Tap the **Share** button (box with arrow) → **Add to Home Screen**
3. Name it **Lume** → tap **Add**

### Best experience: host it locally on your network
Run a tiny local server so both desktop and mobile share the same data via your router:

**Using Python (Mac/Linux/Windows with Python):**
```bash
cd /path/to/lume_pwa
python3 -m http.server 8080
```
Then on your phone, open: `http://YOUR_COMPUTER_IP:8080`

---

## Updating the app (when you receive a new version)

1. **Export your data first** — open Lume → topbar → **Export JSON** → Download the `.json` file. Keep it safe.
2. Replace `index.html` with the new version (keep `manifest.json`, `sw.js`, and `icons/` unchanged — they rarely change)
3. Open the app in your browser → the service worker auto-refreshes on next load
4. If data didn't carry over: topbar → **Import JSON** → select your backup file

### If the service worker serves a stale version after update:
- Chrome: `chrome://serviceworker-internals` → find Lume → **Unregister**
- Or: Open DevTools → Application → Service Workers → **Update** / **Unregister**
- The new `sw.js` version number is bumped automatically on each release

---

## How data is stored

- **All data lives in `localStorage`** in your browser — it never leaves your device
- Data persists across app restarts (including when installed as a PWA)
- Use **Export JSON** regularly as a backup
- To transfer data to a new device: Export JSON → copy the file → Import JSON on new device

---

## Offline support

The service worker caches `index.html`, `manifest.json`, and icons on first load.
After that, Lume works **fully offline** — all data is local, no internet needed.
Google Fonts are cached on first load too, so typography works offline after that.

---

## Notion Sync

The Notion Sync tab lets you push/pull each tracker to your own Notion databases.
See the setup instructions inside the app (Notion Sync tab → Setup Steps).
Note: Direct browser → Notion API calls may be blocked by CORS when running from a local file.
For full sync, host Lume on Netlify / GitHub Pages / Vercel (free plans work fine).

---

*Built with the Imperium dark design system · Syne + Inter + JetBrains Mono*
