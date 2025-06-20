# SeñAR v1.0.0

Un prototipo mínimo (MVP) de la aplicación SeñAR. Esta aplicación web de una sola página ofrece reconocimiento de señas y transcripción de audio directamente en el navegador.

## Funcionalidades principales

* Seguimiento de manos, rostro y postura corporal (brazos, hombros) en tiempo real mediante **MediaPipe**.
* Transcripción de voz a texto usando la API Web Speech o el modelo
  **Whisper tiny** a través de **Transformers**.
* Interfaz con subtítulos arrastrables, cambio de tema y recorrido guiado.
* Las preferencias de tema y tamaño de subtítulos se guardan en el navegador.
* Herramientas para capturar imágenes y alternar cámaras durante la sesión.
* Reconocimiento de señas estáticas sin conexión: **A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, U, V, W y Y**.
  Las letras dinámicas **"J"** y **"Z"** ahora se detectan rastreando la trayectoria del meñique.
  [Ver `src/staticSigns.js`](src/staticSigns.js) y `src/dynamicSigns.js` como referencia técnica.
* Traducción automática de las letras reconocidas en pantalla mediante el módulo `lsaTranslate.js`.

## Arquitectura

La demo está organizada como una aplicación web de una sola página. Todos los scripts se cargan desde **index.html**, que inicia `src/app.js` para el reconocimiento de gestos y la transcripción de voz. Un *service worker* (`sw.js`) almacena en caché los recursos esenciales para que la página funcione como PWA. Los modelos descargados desde la pantalla de configuraciones o mediante `npm run prepare-offline` se guardan en la caché `offline-models`, lo que permite usar la aplicación sin conexión.

Para una descripción más detallada consulte [docs/architecture.md](docs/architecture.md). Las mediciones de rendimiento para inferencia con GPU y CPU se documentan en [docs/performance.md](docs/performance.md).

## Requisitos previos

* **Hospedaje HTTPS** – Las APIs de dispositivos multimedia en navegadores modernos requieren un contexto seguro. Sirva la aplicación sobre `https://` para acceder a la cámara y al micrófono.
* **Permisos de cámara y micrófono** – Conceda al navegador acceso a sus dispositivos cuando se solicite para que el reconocimiento de gestos y la transcripción funcionen correctamente.
* **Node.js 20** – Utilice `nvm use` para seleccionar la versión recomendada antes de instalar dependencias y ejecutar pruebas.

## Ejecutar la aplicación

Abra `index.html` en un navegador moderno. Para desarrollo puede usar un servidor HTTP básico como el módulo integrado de Python o el script de npm incluido:

```bash
python3 -m http.server 8000
```

```bash
npm start
```
Este comando usa `http-server` para servir el proyecto en el puerto 8000.

Luego navegue a <http://localhost:8000/> o a la dirección HTTPS correspondiente.

## Linting

Ejecute ESLint para verificar el estilo del código:

```bash
npm run lint
```

## Configuración de pruebas

Las pruebas requieren **Node.js 20** y las dependencias de desarrollo del proyecto. Active la versión indicada e instale los paquetes con `npm ci` (o `npm install`):

```bash
nvm use
npm ci # o npm install
```

Esto instala herramientas como **Jest** necesarias para la suite de tests.

## Ejecución de pruebas

Una vez instaladas las dependencias, ejecute:

```bash
npm test
```

Este comando ejecuta la suite de Jest que verifica que `index.html` cargue y que elementos clave como el video y el canvas estén presentes.


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
   ejecute `npm run prepare-offline:dry` (equivalente a
   `DRY_RUN=1 npm run prepare-offline`). Este modo genera las entradas de
   `progress.json` sin realizar descargas.
3. Reserve alrededor de **80 MB** de espacio libre para los modelos y asegúrese
   de que los archivos se sirvan también mediante **HTTPS**.
4. El script también descarga archivos `.wasm` y `.data` necesarios para las
   soluciones de MediaPipe:
   - `hands_solution_packed_assets.data` (~4&nbsp;MB)
   - `hands_solution_wasm_bin.wasm` (~5.6&nbsp;MB)
   - `hands_solution_simd_wasm_bin.wasm` (~5.7&nbsp;MB)
   - `face_mesh_solution_packed_assets.data` (~3.8&nbsp;MB)
   - `face_mesh_solution_wasm_bin.wasm` (~5.8&nbsp;MB)
   - `face_mesh_solution_simd_wasm_bin.wasm` (~5.9&nbsp;MB)
   - `pose_solution_packed_assets.data` (~2.8&nbsp;MB)
   - `pose_solution_wasm_bin.wasm` (~5.7&nbsp;MB)
   - `pose_solution_simd_wasm_bin.wasm` (~5.8&nbsp;MB)

Dentro de la pantalla de configuraciones se incluye un botón para descargar el
modelo de transcripción de audio directamente al caché del navegador. El
progreso se muestra sobre el botón y, una vez completado, la aplicación puede
funcionar sin conexión. Si desea liberar espacio, utilice el botón **Eliminar**
para borrar estos modelos del caché.

### Instalación PWA

Al abrir la aplicación en navegadores compatibles se mostrará un aviso para
instalarla como **PWA**. Tras la primera carga los archivos esenciales se
almacenan con un *service worker* y la página funciona sin conexión.

### Accesibilidad

En la sección de configuraciones se incluye la opción **Alto contraste**. Al
activarla la interfaz usa un esquema de colores con mayor contraste apto para
lectores de pantalla. La preferencia se guarda en `localStorage`.

También es posible personalizar el tamaño, fuente y color de los subtítulos,
así como habilitar o deshabilitar la vibración del dispositivo.

### Dialectos

Desde la pantalla de configuraciones ahora es posible elegir el dialecto de
LSA a utilizar. Las opciones iniciales son **Noroeste**, **Cuyo** y
**Noreste**. La selección se guarda en `localStorage` y se aplica al iniciar
la aplicación.

También se pueden seleccionar la cámara y el micrófono preferidos desde la
sección **Devices** y reiniciar el recorrido guiado o restaurar todas las
preferencias desde **Advanced**.

## Navegadores recomendados

La aplicación se prueba con versiones recientes de **Chrome** y **Firefox**. Otros navegadores que soporten WebGL y las APIs de MediaStream deberían funcionar también, aunque pueden presentar pequeñas diferencias.

## Limitaciones conocidas

* Se requiere una conexión rápida para cargar los scripts de modelos externos.
* Mobile Safari tiene soporte limitado para algunas APIs y puede comportarse de forma inesperada.

## Despliegue

Para un entorno de producción se recomienda servir la aplicación a través de **HTTPS**. Cualquier servidor estático es suficiente; por ejemplo:
Para instrucciones sobre empaquetar la PWA para las tiendas móviles consulte [docs/deployment.md](docs/deployment.md).

```bash
npx http-server . -p 443 --ssl --cert path/to/cert.pem --key path/to/key.pem
```

También es posible contenerizar el proyecto. Un `Dockerfile` muy básico podría usar **Nginx** para servir los archivos:

```Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

Luego ejecute:

```bash
docker build -t senar .
docker run -p 80:80 -p 443:443 senar
```

### Actualizar el service worker

Cuando se modifique `sw.js` o cambien los archivos estáticos, incremente la constante `CACHE_VERSION` y despliegue nuevamente. Al cargar la página, el registro en `src/sw-register.js` mostrará un aviso para recargar y activar la versión nueva.

### Renovar los modelos offline

Si alguna biblioteca de `libs/` se actualiza, vuelva a ejecutar:

```bash
npm run prepare-offline
```

Esto descargará los modelos actualizados y sobrescribirá la carpeta `libs/`. Tras el despliegue, puede limpiar la caché `offline-models` desde las herramientas de desarrollo o esperar a que el nuevo service worker la renueve.
También es posible eliminar manualmente los modelos descargados desde la pantalla de configuraciones usando el botón **Eliminar**.

### Actualizaciones automáticas con Dependabot

Este repositorio usa **GitHub Dependabot** para mantener al día las dependencias de `package.json`. Cada semana se abrirán PR automáticas con las nuevas versiones.

Para revisarlas y fusionarlas:
1. Revisar la descripción de la PR y los *changelogs* enlazados.
2. Ejecutar localmente `npm ci` y `npm test` para asegurarse de que la actualización no rompe la aplicación.
3. Si todo funciona correctamente, usar **Squash and merge** y eliminar la rama de Dependabot.

## Próximo Sprint

Los planes para la siguiente iteración se describen en [docs/next-sprint.md](docs/next-sprint.md). Este objetivo ambicioso busca ampliar el vocabulario de señas y mejorar la experiencia sin conexión.

## Licencias

Para información sobre bibliotecas externas como **MediaPipe** y **HuggingFace Transformers**, consulte [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Política de Privacidad

La aplicación procesa video y audio localmente en su navegador. No se envían datos de cámara ni micrófono a servidores externos. Para más detalles consulte [docs/privacy.md](docs/privacy.md).

