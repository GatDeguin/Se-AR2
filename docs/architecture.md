# Application Architecture

This document describes the main modules that compose the SeñAR prototype and how they
interact with each other.

## Core modules

- **`src/app.js`** – Main entry point executed from `index.html`. Sets up the UI,
  initializes MediaPipe trackers, the Whisper speech components and the LSA
  translator. It consumes helpers from `handUtils.js`, `staticSigns.js` and
  `dynamicSigns.js` to display recognized letters.
- **`src/staticSigns.js`** – Contains the hand landmark based detection logic for
  static letters **A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, U, V, W and Y**.
  See [`src/staticSigns.js`](../src/staticSigns.js) for details. Exported function
  `detectStaticSign` is used both by `handUtils.js` and the main app.
- **`src/dynamicSigns.js`** – Tracks the pinky trajectory to detect dynamic
  letters like **"J"** and **"Z"**.
- **`src/lsaTranslate.js`** – Buffers las letras detectadas y las muestra como
  texto continuo en pantalla.
- **`src/handUtils.js`** – Formats the output of `detectStaticSign` for display.
- **`src/sw-register.js`** – Registers the service worker on page load and shows
  an update prompt when a new worker is available.
- **`sw.js`** – Service worker that caches HTML, JS and library files so the app
  works offline. It responds to `fetch` events with cached resources when
  available.
- **`scripts/prepareOffline.js`** – Node script that downloads the MediaPipe and
  Whisper scripts into `libs/` for offline usage, storing a progress file so
  downloads can be resumed. The service worker then caches these files on
  install.

## Interaction overview

```mermaid
graph TD
  index["index.html"] --> app[src/app.js]
  index --> swreg[src/sw-register.js]
  swreg --> sw[sw.js]
  app --> handUtils
  handUtils --> staticSigns
  app --> dynamicSigns
  app --> lsa[lsaTranslate.js]
  lsa --> staticSigns
  lsa --> dynamicSigns
  app --> libs[["libs/ models"]]
  prepareOffline[scripts/prepareOffline.js] --> libs
  sw -- caches --> libs
  sw -- offline responses --> app
```

The HTML page loads `app.js` along with MediaPipe and other scripts located in
`libs/`. The service worker pre‑caches those assets so the application can run
without network connectivity. `app.js` processes camera frames and formats
recognized hand shapes through `staticSigns.js`, `dynamicSigns.js` and
`handUtils.js`. When automatic translation is enabled, `lsaTranslate.js`
buffers the detected letters to display a text string. The optional
`prepareOffline.js` script downloads the required models ahead of time so they
are available for the service worker to cache. These models are saved in
`libs/` and cached under the `offline-models` cache, allowing the service worker
to load them when offline.

