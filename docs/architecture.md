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

