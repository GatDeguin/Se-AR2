# SeñAR v 0.9

A minimal prototype (MVP) of the SeñAR app. This single page web
application provides sign language recognition features and audio
transcription directly in the browser.

## Funcionalidades principales

* Seguimiento de manos, rostro y postura corporal (brazos, hombros) en tiempo real mediante **MediaPipe**.
* Transcripción de voz a texto usando la API Web Speech o el modelo
  **Whisper tiny** a través de **Transformers**.
* Interfaz con subtítulos arrastrables, cambio de tema y recorrido guiado.
* Las preferencias de tema y tamaño de subtítulos se guardan en el navegador.
* Herramientas para capturar imágenes y alternar cámaras durante la sesión.
* Reconocimiento de señas estáticas **A–J** sin conexión.

## Architecture

The demo is organized as a single page web application. All scripts are loaded from **index.html** which boots `src/app.js` for gesture recognition and speech transcription. A service worker (`sw.js`) caches core assets so the page works as a PWA. Models downloaded via the settings screen or `npm run prepare-offline` are stored in the `offline-models` cache allowing the app to operate without a network connection.

For a more detailed overview see [docs/architecture.md](docs/architecture.md).

## Prerequisites

* **HTTPS hosting** – Media device APIs in modern browsers require a secure
  context. Serve the app over `https://` for camera and microphone access.
* **Camera and microphone permissions** – Grant the browser access to your
  camera and microphone when prompted so gesture recognition and speech
  features work correctly.
* **Node.js 20** – Use `nvm use` to select the recommended runtime before installing dependencies and running tests.

## Running the App

Simply open `index.html` in a modern browser. For development you can use a
basic HTTP server such as Python's built‑in module or the included npm script:

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

Testing requires **Node.js 20** and the project's devDependencies. Activate the
runtime and install packages with `npm ci` (or `npm install`):

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

This runs the Jest test suite which verifies that `index.html` loads and key
elements such as the video and canvas are present.

## Dependencias e instalación

La página hace uso de varias bibliotecas externas que se cargan desde
CDN:

* **MediaPipe Hands** y **FaceMesh** para el seguimiento de gestos y
  expresiones faciales.
* **Transformers** de HuggingFace para ejecutar el modelo Whisper en el
  navegador.

No se requiere una instalación compleja; basta con servir los archivos
estáticos a través de un servidor local como se muestra arriba.

### Offline Models

Para ejecutar la demo sin conexión:

1. Ejecute `npm run prepare-offline` para descargar los modelos y crear
   la carpeta `libs/` automáticamente. El script mantiene un archivo
   `libs/progress.json` que registra cuántos bytes se han descargado de
   cada archivo. Si la descarga se interrumpe, al volver a ejecutar el
   comando la operación se reanuda a partir del progreso guardado.
   Un ejemplo simplificado del archivo es:

   ```json
   {
     "hands.js": { "downloaded": 3145728, "total": 7340032 },
     "pose.js": { "downloaded": 7340032, "total": 7340032 }
   }
   ```

2. Si solo desea verificar el proceso sin descargar los archivos reales,
  ejecute `DRY_RUN=1 npm run prepare-offline`, lo que genera las entradas de
  `progress.json` sin realizar descargas.
3. Reserve alrededor de **80 MB** de espacio libre para los modelos y asegúrese
   de que los archivos se sirvan también mediante **HTTPS**.

Dentro de la pantalla de configuraciones se incluye un botón para descargar el
modelo de transcripción de audio directamente al caché del navegador. El
progreso se muestra sobre el botón y, una vez completado, la aplicación puede
funcionar sin conexión.

### PWA Installation

Al abrir la aplicación en navegadores compatibles se mostrará un aviso para
instalarla como **PWA**. Tras la primera carga los archivos esenciales se
almacenan con un *service worker* y la página funciona sin conexión.

### Accessibility

En la sección de configuraciones se incluye la opción **Alto contraste**. Al
activarla la interfaz usa un esquema de colores con mayor contraste apto para
lectores de pantalla. La preferencia se guarda en `localStorage`.

También es posible personalizar el tamaño, fuente y color de los subtítulos,
así como habilitar o deshabilitar la vibración del dispositivo.

### Dialects

Desde la pantalla de configuraciones ahora es posible elegir el dialecto de
LSA a utilizar. Las opciones iniciales son **Noroeste**, **Cuyo** y
**Noreste**. La selección se guarda en `localStorage` y se aplica al iniciar
la aplicación.

También se pueden seleccionar la cámara y el micrófono preferidos desde la
sección **Devices** y reiniciar el recorrido guiado o restaurar todas las
preferencias desde **Advanced**.

## Recommended Browsers

The app is tested with recent versions of **Chrome** and **Firefox**. Other
browsers supporting WebGL and MediaStream APIs should also work, but may have
minor differences.

## Known Limitations

* Requires a fast network connection to load external model scripts.
* Mobile Safari has limited support for some APIs and may behave unexpectedly.

