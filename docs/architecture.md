# Application Architecture

This document describes the main modules that compose the SeñAR prototype and how they
interact with each other.

## Core modules

- **`src/app.js`** – Main entry point executed from `index.html`. Sets up the UI,
  initializes MediaPipe trackers and the Whisper speech components, and updates
  captions. It consumes helpers from `handUtils.js` and `staticSigns.js` to
  display recognized letters.
- **`src/staticSigns.js`** – Contains the hand landmark based detection logic for
  static letters A–J. Exported function `detectStaticSign` is used both by
  `handUtils.js` and the main app.
- **`src/handUtils.js`** – Formats the output of `detectStaticSign` for display.
- **`src/sw-register.js`** – Registers the service worker on page load and shows
  an update prompt when a new worker is available.
- **`sw.js`** – Service worker that caches HTML, JS and library files so the app
  works offline. It responds to `fetch` events with cached resources when
  available.
- **`scripts/prepareOffline.js`** – Node script that downloads the MediaPipe and
  Whisper scripts into `libs/` for offline usage. The service worker then caches
  these files on install.

## Interaction overview

```mermaid
graph TD
  index["index.html"] --> app[src/app.js]
  index --> swreg[src/sw-register.js]
  swreg --> sw[sw.js]
  app --> handUtils
  handUtils --> staticSigns
  app --> libs[["libs/ models"]]
  prepareOffline[scripts/prepareOffline.js] --> libs
  sw -- caches --> libs
  sw -- offline responses --> app
```

The HTML page loads `app.js` along with MediaPipe and other scripts located in
`libs/`. The service worker pre‑caches those assets so the application can run
without network connectivity. `app.js` processes camera frames and formats
recognized hand shapes through `staticSigns.js` and `handUtils.js`. The optional
`prepareOffline.js` script downloads the required models ahead of time so they
are available for the service worker to cache.

# Architecture

This document explains how the SeñAR demo is organized.

## Components

- **index.html** – Container for the entire UI and entry point for the modules.
- **src/app.js** – Main logic that connects MediaPipe trackers, gesture
  recognition and speech transcription.
- **src/staticSigns.js** – Detects static letters of the alphabet for offline
  sign recognition.
- **sw.js** – Service worker caching core assets so the page works as a PWA.
- **scripts/prepareOffline.js** – Node script that downloads the MediaPipe
  libraries and stores a progress file to allow resumable downloads.

## Offline model storage

Models downloaded with `prepare-offline` or via the settings screen are saved in
`libs/` and cached under the `offline-models` cache. The service worker loads
these files from cache when available so the app can run without network
connectivity.


