# Cricfy Web

A dark, cinematic web streaming interface for Cricfy — built with Next.js, Geist Mono, and HLS.js.

## Stack

- **Next.js 15** — App Router, server-side API routes for decryption
- **HLS.js** — In-browser HLS playback
- **next-themes** — Dark/light toggle
- **Geist Mono** — UI font throughout
- **Vercel** — Deployment target

## Architecture

```
Browser  →  /api/providers  →  Firebase Remote Config  →  AES decrypt cats.txt  →  Provider list
Browser  →  /api/channels?url=...  →  Fetch M3U  →  AES decrypt  →  Channel list
Browser  →  HLS.js  →  Direct stream URL
```

All decryption happens server-side in API routes. Keys never reach the browser.

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd cricfy-web
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

You need:

| Variable | Where to get it |
|---|---|
| `SECRET1` | Contents of `secret1.txt` from the Kodi plugin's `resources/` folder |
| `SECRET2` | Contents of `secret2.txt` from the Kodi plugin's `resources/` folder |
| `CRICFY_PACKAGE_NAME` | From `cricfy_properties.json` in the plugin resources |
| `CRICFY_FIREBASE_API_KEY` | From `cricfy_properties.json` |
| `CRICFY_FIREBASE_APP_ID` | From `cricfy_properties.json` |

> **Note:** `cricfy_properties.json`, `secret1.txt`, and `secret2.txt` are not included in the open-source plugin repo — they are bundled inside the Cricfy APK. You'll need to extract them from the APK using `apktool` or similar.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel
```

Add all env vars from `.env.example` in Vercel's project settings under **Settings → Environment Variables**.

## DRM Streams

Channels with DRM (ClearKey) will show a warning badge. Browser-based DRM decryption is not supported — these streams work in Kodi with `inputstream.adaptive` but not in HLS.js. Non-DRM HLS/DASH streams play fine.

## License

GPL-3.0 — same as the original Kodi plugin.
