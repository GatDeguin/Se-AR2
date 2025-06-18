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

## Prerequisites

* **HTTPS hosting** – Media device APIs in modern browsers require a secure
  context. Serve the app over `https://` for camera and microphone access.
* **Camera and microphone permissions** – Grant the browser access to your
  camera and microphone when prompted so gesture recognition and speech
  features work correctly.

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

## Running Tests

Install Node.js dependencies once using `npm install` and then execute:

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
   la carpeta `libs/` automáticamente. El script genera un archivo
   `libs/progress.json` que actualiza el avance de cada descarga y
   puede consultarse desde la interfaz.
2. Modifique las etiquetas `<script>` de `index.html` para que apunten a los
   archivos locales, por ejemplo:
   ```html
   <script src="libs/hands.js"></script>
   <script src="libs/face_mesh.js"></script>
   <script src="libs/drawing_utils.js"></script>
   <script src="libs/pose.js"></script>
   ```
3. En `src/app.js` cambie la importación de Transformers a
   ```javascript
   import { pipeline } from './libs/transformers.min.js';
   ```
   y actualice las opciones `locateFile` de MediaPipe para que devuelvan
   `'libs/' + f`.
  4. Reserve alrededor de **80 MB** de espacio libre para los modelos y
     asegúrese de que los archivos se sirvan también mediante **HTTPS**.

### PWA Installation

Al abrir la aplicación en navegadores compatibles se mostrará un aviso para
instalarla como **PWA**. Tras la primera carga los archivos esenciales se
almacenan con un *service worker* y la página funciona sin conexión.

### Accessibility

En la sección de configuraciones se incluye la opción **Alto contraste**. Al
activarla la interfaz usa un esquema de colores con mayor contraste apto para
lectores de pantalla. La preferencia se guarda en `localStorage`.

### Dialects

Desde la pantalla de configuraciones ahora es posible elegir el dialecto de
LSA a utilizar. Las opciones iniciales son **Noroeste**, **Cuyo** y
**Noreste**. La selección se guarda en `localStorage` y se aplica al iniciar
la aplicación.

## Recommended Browsers

The app is tested with recent versions of **Chrome** and **Firefox**. Other
browsers supporting WebGL and MediaStream APIs should also work, but may have
minor differences.

## Known Limitations

* Requires a fast network connection to load external model scripts.
* Mobile Safari has limited support for some APIs and may behave unexpectedly.

