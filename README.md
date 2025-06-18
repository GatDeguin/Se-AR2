# Se-AR2

A minimal prototype (MVP) of the SeñAR app. This single page web
application provides sign language recognition features and audio
transcription directly in the browser.

## Funcionalidades principales

* Seguimiento de manos y rostro en tiempo real mediante **MediaPipe**.
* Transcripción de voz a texto usando la API Web Speech o el modelo
  **Whisper tiny** a través de **Transformers**.
* Interfaz con subtítulos arrastrables, cambio de tema y recorrido guiado.
* Herramientas para capturar imágenes y alternar cámaras durante la sesión.

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

## Dependencias e instalación

La página hace uso de varias bibliotecas externas que se cargan desde
CDN:

* **MediaPipe Hands** y **FaceMesh** para el seguimiento de gestos y
  expresiones faciales.
* **Transformers** de HuggingFace para ejecutar el modelo Whisper en el
  navegador.

No se requiere una instalación compleja; basta con servir los archivos
estáticos a través de un servidor local como se muestra arriba. Si se
desea utilizar las funcionalidades sin conexión, los modelos de la
sección *Offline Models* pueden descargarse previamente y modificarse
las rutas de las librerías para que apunten a ficheros locales.

## Recommended Browsers

The app is tested with recent versions of **Chrome** and **Firefox**. Other
browsers supporting WebGL and MediaStream APIs should also work, but may have
minor differences.

## Known Limitations

* Requires a fast network connection to load external model scripts.
* Mobile Safari has limited support for some APIs and may behave unexpectedly.

