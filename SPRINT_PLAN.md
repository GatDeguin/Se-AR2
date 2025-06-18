# Sprint 13 - Plan

A continuación se detalla la planificación exhaustiva para el próximo sprint del proyecto SeñAR.

## Objetivos generales
- Convertir la demo en una **PWA** instalable que funcione sin conexión.
- Permitir la reanudación de descargas de modelos offline.
- Incorporar un vocabulario inicial de señas estáticas para traducción a texto.
- Mejorar la accesibilidad con un tema de alto contraste y soporte para lectores de pantalla.

## Historias de usuario

1. **Como usuario quiero instalar la aplicación en mi dispositivo y utilizarla sin conexión.**
   - Registrar un service worker que almacene en caché los recursos esenciales.
   - Mostrar un aviso de instalación cuando el navegador lo permita.

2. **Como usuario quiero reanudar la descarga de modelos si se interrumpe para evitar empezar de cero.**
   - Guardar el progreso de cada archivo y continuar automáticamente al reiniciar.
   - Indicar en pantalla el estado de cada descarga.

3. **Como persona con baja visión quiero un tema de alto contraste y etiquetas accesibles para manejar la app cómodamente.**
   - Agregar opción "Alto contraste" en la configuración.
   - Revisar labels ARIA y orden de tabulación.

4. **Como usuario quiero traducir un conjunto básico de señas estáticas a texto sin conexión.**
   - Implementar detección offline de gestos simples (A-E) como prueba.
   - Mostrar el texto detectado en el contenedor de subtítulos.

5. **Como desarrollador quiero pruebas automáticas para el service worker y la persistencia de descargas.**
   - Crear tests en Jest que verifiquen el registro del service worker y la recuperación de archivos parciales.

6. **Como responsable del proyecto quiero documentación actualizada sobre la configuración de la PWA y el nuevo modo accesible.**
   - Actualizar `README.md` con pasos para instalación y accesibilidad.

## Tareas
- [ ] Desarrollar service worker con estrategias de caché y pantalla de actualización.
- [ ] Persistir progreso de descargas en `libs/progress.json` y reanudar en `prepareOffline.js`.
- [ ] Implementar selector "Alto contraste" y ajustar `styles.css`.
- [ ] Crear módulo simple de reconocimiento de señas A-E.
- [ ] Escribir pruebas Jest para service worker y descargas.
- [ ] Revisar labels ARIA y secuencia de tabulación en `index.html`.
- [ ] Documentar instalación PWA y opciones de accesibilidad en `README.md`.
