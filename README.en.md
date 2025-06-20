# SeñAR v1.0.0

A minimal prototype (MVP) of the SeñAR application. This single page web app provides sign language recognition and audio transcription directly in the browser.

## Key Features

* Tracks hands, face and body pose (arms and shoulders) in real time using **MediaPipe**.
* Speech-to-text transcription via the Web Speech API or the **Whisper tiny** model through **Transformers**.
* Interface with draggable captions, theme switching and a guided tour.
* Theme and caption size preferences are stored in the browser.
* Tools for capturing images and switching cameras during the session.
* Offline static sign recognition: **A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, U, V, W and Y**. Dynamic letters **"J"** and **"Z"** are detected by tracking the pinky trajectory.
  See [`src/staticSigns.js`](src/staticSigns.js) and `src/dynamicSigns.js` for technical reference.
* Automatic translation of recognized letters on screen using the `lsaTranslate.js` module.

## Architecture

The demo is organized as a single page web application. All scripts are loaded from **index.html**, which boots `src/app.js` for gesture recognition and speech transcription. A *service worker* (`sw.js`) caches the core assets so the page works as a PWA. Models downloaded from the settings screen or via `npm run prepare-offline` are stored in the `offline-models` cache so the app can run without a network connection.

For a more detailed overview see [docs/architecture.md](docs/architecture.md). Performance measurements for GPU versus CPU inference are documented in [docs/performance.md](docs/performance.md).

## Prerequisites

* **HTTPS hosting** – Media device APIs in modern browsers require a secure context. Serve the app over `https://` for camera and microphone access.
* **Camera and microphone permissions** – Grant the browser access to your devices when requested so gesture recognition and transcription work correctly.
* **Node.js 20** – Use `nvm use` to select the recommended version before installing dependencies and running tests.

## Running the App

Open `index.html` in a modern browser. For development you can use a basic HTTP server such as Python's built-in module or the included npm script:

```bash
python3 -m http.server 8000
```

```bash
npm start
```
This command uses `http-server` to serve the project on port 8000.

Then navigate to <http://localhost:8000/> or the appropriate HTTPS address.

## Linting

Run ESLint to verify code style:

```bash
npm run lint
```

## Test Setup

Testing requires **Node.js 20** and the project's devDependencies. Activate the recommended version and install packages with `npm ci` (or `npm install`):

```bash
nvm use
npm ci # or npm install
```

This installs tools like **Jest** needed by the test suite.

## Running Tests

After the dependencies are installed, execute:

```bash
npm test
```

This runs the Jest test suite which verifies that `index.html` loads and key elements such as the video and canvas are present.


## Dependencies and Installation

This page uses several external libraries loaded from a CDN:

* **MediaPipe Hands** and **FaceMesh** for gesture and facial expression tracking.
* **Transformers** from HuggingFace to run the Whisper model in the browser.

No complex installation is required; simply serve the static files through a local server as shown above.

### Offline Models

To run the demo offline:

1. Run `npm run prepare-offline` to download the models and automatically create the `libs/` folder. The script keeps a `libs/progress.json` file that records how many bytes of each file have been downloaded. If the download is interrupted, running the command again resumes from the saved progress. A simplified example of the file is:

   ```json
   {
     "hands.js": { "downloaded": 3145728, "total": 7340032 },
     "pose.js": { "downloaded": 7340032, "total": 7340032 }
   }
   ```

2. If you only want to verify the process without downloading the real files, run `npm run prepare-offline:dry` (equivalent to `DRY_RUN=1 npm run prepare-offline`). This mode generates the `progress.json` entries without downloading.
3. Reserve about **80 MB** of free space for the models and make sure the files are also served over **HTTPS**.
4. The script also downloads `.wasm` and `.data` files required by the MediaPipe solutions:
   - `hands_solution_packed_assets.data` (~4&nbsp;MB)
   - `hands_solution_wasm_bin.wasm` (~5.6&nbsp;MB)
   - `hands_solution_simd_wasm_bin.wasm` (~5.7&nbsp;MB)
   - `face_mesh_solution_packed_assets.data` (~3.8&nbsp;MB)
   - `face_mesh_solution_wasm_bin.wasm` (~5.8&nbsp;MB)
   - `face_mesh_solution_simd_wasm_bin.wasm` (~5.9&nbsp;MB)
   - `pose_solution_packed_assets.data` (~2.8&nbsp;MB)
   - `pose_solution_wasm_bin.wasm` (~5.7&nbsp;MB)
   - `pose_solution_simd_wasm_bin.wasm` (~5.8&nbsp;MB)

The settings screen includes a button to download the transcription model directly to the browser cache. Progress is displayed on the button and, once complete, the app can work offline. Use the **Delete** button to free space by removing these models from the cache.

### PWA Installation

When the app is opened in supported browsers, a prompt will appear to install it as a **PWA**. After the first load the essential files are stored by a *service worker* and the page works offline.

### Accessibility

In the settings screen there is an **High Contrast** option. When enabled the interface uses a higher contrast color scheme suitable for screen readers. The preference is stored in `localStorage`.

You can also customize the subtitle size, font and color, as well as enable or disable device vibration.

### Dialects

From the settings screen you can now choose the LSA dialect to use. Initial options are **Noroeste**, **Cuyo** and **Noreste**. The selection is stored in `localStorage` and applied when the app starts.

Preferred camera and microphone can also be selected under **Devices**, and you can restart the guided tour or reset all preferences from **Advanced**.

## Recommended Browsers

The app is tested with recent versions of **Chrome** and **Firefox**. Other browsers supporting WebGL and the MediaStream APIs should also work, though minor differences may appear.

## Known Limitations

* Requires a fast network connection to load external model scripts.
* Mobile Safari has limited support for some APIs and may behave unexpectedly.

## Deployment

For a production environment it's recommended to serve the app over **HTTPS**. Any static server is enough; for instructions on packaging the PWA for mobile stores see [docs/deployment.md](docs/deployment.md).

```bash
npx http-server . -p 443 --ssl --cert path/to/cert.pem --key path/to/key.pem
```

You can also containerize the project. A very basic `Dockerfile` could use **Nginx** to serve the files:

```Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

Then run:

```bash
docker build -t senar .
docker run -p 80:80 -p 443:443 senar
```

### Updating the service worker

When `sw.js` or the static assets change, increase the `CACHE_VERSION` constant and redeploy. When the page loads, the log in `src/sw-register.js` will prompt to reload and activate the new version.

### Refresh offline models

If any library in `libs/` is updated, run:

```bash
npm run prepare-offline
```

This will download the updated models and overwrite the `libs/` folder. After deployment you can clear the `offline-models` cache from the developer tools or wait for the new service worker to refresh it. You can also manually remove the downloaded models from the settings screen using the **Delete** button.

### Automatic updates with Dependabot

This repository uses **GitHub Dependabot** to keep the `package.json` dependencies up to date. Automatic PRs are opened each week with new versions.

To review and merge them:
1. Review the PR description and the linked changelogs.
2. Run `npm ci` and `npm test` locally to ensure the update does not break the application.
3. If everything works correctly, use **Squash and merge** and delete the Dependabot branch.

## Next Sprint

Plans for the next iteration are described in [docs/next-sprint.md](docs/next-sprint.md). This ambitious goal seeks to expand the sign vocabulary and improve the offline experience.

## Licenses

For information on external libraries such as **MediaPipe** and **HuggingFace Transformers**, see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Privacy Policy

The application processes video and audio locally in your browser. No camera or microphone data is sent to external servers. For more details see [docs/privacy.md](docs/privacy.md).

