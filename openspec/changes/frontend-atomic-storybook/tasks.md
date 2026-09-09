## 1. Diseño y preparación
- [x] 1.1 Capturar las cuatro pantallas actuales a 375/1280 y registrar estados observados; entregar referencias visuales para comparar sin declarar aceptación anticipada.
- [x] 1.2 Revisar el mapa Atomic Design y contratos de design.md con el equipo; registrar decisiones y verificar que cada extracción corresponde a una responsabilidad existente.
- [x] 1.3 Preparar una rama de implementación y checkpoints por etapa con nombres libres; registrar comandos de recuperación y verificar que no se sobrescriben ramas de búsqueda.

## 2. TDD: contratos y regresiones
- [x] 2.1 Caracterizar dashboard y posiciones: destinos correctos, ID real, carga/vacío/error; ejecutar pruebas y registrar baseline.
- [x] 2.2 Añadir pruebas de callbacks de PositionCard y DashboardActionCard antes de extraer; demostrar fallo esperado y conservar navegación actual.
- [x] 2.3 Caracterizar payload, secciones y fechas de AddCandidateForm; añadir casos de selección cancelada y error de upload antes de separar presentación, registrando el fallo relevante.
- [x] 2.4 Ejecutar test:session y test:app antes de cambiar el kanban; registrar resultados como baseline de comportamiento.

## 3. Implementación por pantalla
- [x] 3.1 Extraer tarjetas de dashboard y posiciones con los contratos definidos; comprobar tests verdes y navegación en aplicación.
- [x] 3.2 Separar PositionsList e inyectar servicios en la página con defaults reales; comprobar carga/vacío/error y que la app sigue consultando la API.
- [x] 3.3 Reutilizar KanbanBoard, CandidateSummary y MoveStatus sin duplicarlos; comprobar que test:session y test:app mantienen identidad y persistencia.
- [x] 3.4 Separar FileUploadField de servicios/estado de subida; hacer visibles errores y manejar cancelación; comprobar los casos rojos y que no se altera el contrato de upload.
- [x] 3.5 Separar CandidateFormView manteniendo los handlers y servicios en la página; verificar que payload, fechas, educación y experiencia conservan semántica con las pruebas de caracterización.

## 4. Storybook
- [x] 4.1 Ajustar discovery para las stories elegidas y decoradores de rutas/estilos; verificar npm run storybook:build sin cambiar dependencias.
- [x] 4.2 Añadir stories de dashboard, tarjetas y posiciones con Controls/Actions; verificar SB-01, SB-02 y estados de listado.
- [x] 4.3 Añadir story directa del organismo kanban y reutilizar sus stories actuales; comprobar que los IDs históricos se mantienen.
- [x] 4.4 Añadir matriz de formulario y archivo definida en design.md con fixtures locales; verificar los estados uno por uno sin subir archivos reales.
- [x] 4.5 Documentar props, eventos, responsabilidad Atomic Design y límites en autodocs; comprobar que cada componente nuevo tiene documentación navegable.
- [x] 4.6 Añadir pruebas de navegador sobre stories con API bloqueada, reinicio entre stories, teclado y 375/1280; demostrar que no se intenta acceder al backend.

## 5. Chromatic
- [x] 5.1 Generar build del commit del incremento en proyecto autorizado; registrar enlace, commit, stories y viewports, o bloqueo explícito si no se puede publicar.
- [ ] 5.2 Comparar capturas con referencias del paso 1, revisar cambios humanos y registrar aceptación o defectos; no aceptar baselines automáticamente.

## 6. PR y cierre
- [x] 6.1 Ejecutar validación OpenSpec, typecheck, tests afectados, build de Storybook y smoke de aplicación; enlazar evidencia y separar simulación de persistencia real.
- [ ] 6.2 Crear PR con matriz SB-01 a SB-07, componentes extraídos, enlaces y pendientes; verificar que no incluye backend, búsqueda nueva ni guion docente.
- [ ] 6.3 Actualizar tareas solo con evidencia y sincronizar/archivar tras aceptación; comprobar que no quedan tareas visuales pendientes antes del cierre.

Evidencia y bloqueo de publicación: docs/evidence/frontend-storybook/README.md. La tarea 5.1 permite documentar el bloqueo; no se ha publicado ni aprobado un build actual.
