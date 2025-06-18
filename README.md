# Se-AR2

A minimal prototype (MVP) of the SeñAR app. This single page web
application provides sign language recognition features and audio
transcription directly in the browser.

## Prerequisites

* **HTTPS hosting** – Media device APIs in modern browsers require a secure
  context. Serve the app over `https://` for camera and microphone access.
* **Camera and microphone permissions** – Grant the browser access to your
  camera and microphone when prompted so gesture recognition and speech
  features work correctly.

## Running the App

Simply open `index.html` in a modern browser. For development you can use a
basic HTTP server such as Python's built‑in module:

```bash
python3 -m http.server 8000
```

Then navigate to <http://localhost:8000/> or the appropriate HTTPS address.

## Recommended Browsers

The app is tested with recent versions of **Chrome** and **Firefox**. Other
browsers supporting WebGL and MediaStream APIs should also work, but may have
minor differences.

## Known Limitations

* Requires a fast network connection to load external model scripts.
* Mobile Safari has limited support for some APIs and may behave unexpectedly.

