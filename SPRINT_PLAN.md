# Sprint 12 - Plan

A continuación se detallan los objetivos propuestos para el próximo sprint de SeñAR.

## Objetivos generales
- Consolidar el modo offline con modelos de reconocimiento descargables desde la aplicación.
- Ampliar la cobertura de dialectos e incluir más variaciones regionales.
- Mejorar la experiencia de usuario en dispositivos móviles.

## Historias de usuario

1. **Como usuario quiero descargar los modelos de reconocimiento directamente desde la app para poder utilizarla sin conexión.**
   - Implementar un gestor de descargas que muestre el progreso.
   - Guardar los modelos en `libs/` y detectar si están presentes al iniciar.

2. **Como usuario quiero seleccionar mi dialecto de LSA para obtener resultados más precisos.**
   - Habilitar menú de dialectos en la pantalla de configuraciones.
   - Cargar el modelo correspondiente según la selección.

3. **Como usuario móvil quiero una interfaz que se adapte mejor a pantallas pequeñas para acceder fácilmente a los controles.**
   - Rediseñar la distribución de los botones y el tamaño de fuente.
   - Ajustar el recorrido guiado para vistas móviles.

4. **Como desarrollador quiero pruebas que cubran la descarga de modelos y la persistencia de configuraciones.**
   - Añadir tests en Jest para verificar la presencia de archivos locales y cambios en `localStorage`.

## Tareas
- [ ] Integrar en `scripts/prepareOffline.js` una barra de progreso utilizable desde la UI.
- [ ] Crear selector de dialectos con opciones iniciales (Noroeste, Cuyo, Noreste).
- [ ] Revisar estilos responsive y optimizar reglas de `styles.css`.
- [ ] Escribir nuevas pruebas en `__tests__/` para las funcionalidades anteriores.
- [ ] Actualizar `README.md` con instrucciones del modo offline y dialectos.

