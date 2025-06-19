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
- [x] Desarrollar service worker con estrategias de caché y pantalla de actualización.
- [x] Persistir progreso de descargas en `libs/progress.json` y reanudar en `prepareOffline.js`.
- [x] Implementar selector "Alto contraste" y ajustar `styles.css`.
- [x] Crear módulo simple de reconocimiento de señas A-E.
- [x] Escribir pruebas Jest para service worker y descargas.
- [x] Revisar labels ARIA y secuencia de tabulación en `index.html`.
- [x] Documentar instalación PWA y opciones de accesibilidad en `README.md`.

# Sprint 14 - Plan

En este sprint se refuerzan las funcionalidades introducidas y se optimiza el rendimiento general de la aplicación. Se ampliará el vocabulario de gestos, se mejorará la experiencia offline y se documentará la arquitectura.

## Objetivos generales
- Gestionar actualizaciones de la PWA mostrando un mensaje cuando haya nueva versión.
- Reducir el tiempo de carga y consumo de CPU durante la detección de señas.
- Aumentar el vocabulario soportado con nuevas letras y gestos dinámicos simples.
- Robustecer el manejo de errores durante las descargas y en el flujo principal de la app.
- Consolidar la documentación técnica para desarrolladores.

## Historias de usuario
1. **Como usuario quiero recibir una notificación cuando exista una actualización de la aplicación.**
   - Mostrar un diálogo para recargar cuando el service worker detecte nueva versión.

2. **Como persona usuaria deseo que la detección de señas funcione con mejor rendimiento en dispositivos móviles.**
   - Optimizar ciclos de renderizado y el uso de WebGL para subir los fps.

3. **Como usuaria quiero utilizar más letras del alfabeto sin conexión.**
   - Añadir detección de las letras F–J (completado) y dos gestos dinámicos básicos pendientes.

4. **Como usuaria quiero que la aplicación maneje mejor los cortes de red.**
   - Implementar una página offline y reintentos automáticos en descargas interrumpidas.

5. **Como desarrolladora necesito documentación clara sobre la arquitectura y cómo extender los módulos.**
   - Elaborar una guía técnica en `docs/architecture.md` con diagramas básicos.

## Tareas
- [x] Mejorar el service worker para detectar actualizaciones y mostrar aviso de recarga.
- [ ] Refactorizar `src/app.js` para reducir cálculos redundantes y usar `requestAnimationFrame` de forma más eficiente.
- [x] Extender `staticSigns.js` con las letras F–J; queda pendiente el gesto dinámico.
- [ ] Añadir manejo de errores y reintentos en `prepareOffline.js`.
- [x] Crear `docs/architecture.md` documentando los principales módulos y flujos.
- [x] Escribir pruebas Jest para la nueva detección y para el flujo de actualización del service worker.

# Sprint 15 - Plan

En este sprint se completarán los pendientes arrastrados y se seguirá
expandiendo la experiencia sin conexión.

## Objetivos generales
- Incorporar gestos dinámicos básicos para ampliar la comunicación.
- Mejorar la resiliencia ante fallas de red y la experiencia offline.
- Optimizar el ciclo principal de renderizado para reducir consumo de CPU.

## Historias de usuario
1. **Como usuaria quiero que la app reconozca gestos en movimiento además de las letras.**
   - Implementar dos gestos dinámicos simples y documentarlos.
2. **Como usuaria quiero seguir utilizando la aplicación aun cuando la conexión se interrumpe.**
   - Añadir una página offline y reintentos automáticos de descarga.
3. **Como persona usuaria deseo que la aplicación sea más fluida en dispositivos móviles.**
   - Refactorizar `src/app.js` para evitar cálculos redundantes y coordinar `requestAnimationFrame`.

## Tareas
- [ ] Implementar detección de dos gestos dinámicos en un nuevo módulo.
- [ ] Crear `offline.html` e integrar su entrega desde `sw.js`.
- [ ] Añadir reintentos con espera exponencial en `prepareOffline.js`.
- [ ] Reorganizar el bucle principal de `src/app.js` optimizando `requestAnimationFrame`.
- [ ] Actualizar la documentación y las pruebas de acuerdo con los cambios.
