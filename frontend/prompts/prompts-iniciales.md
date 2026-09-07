# Prompts iniciales

Prompts usados para arrancar cada feature de este ejercicio (interfaz "position", vista kanban). El flujo seguido para cada uno fue: `/opsx:propose` (genera proposal + specs + design + tasks en `openspec/changes/`) → revisión/ampliación manual de la especificación → `/opsx:apply` (implementación) → `/opsx:archive` (sincroniza specs y archiva el change).

## Feature 1 — Navegación al detalle de posición

```
/opsx:propose "Conectar el botón 'Ver proceso' de cada tarjeta de posición en Positions.tsx para navegar a una nueva ruta /positions/:id (vista de detalle de posición). Todavía sin contenido de página nuevo, solo el registro de la ruta en App.js y el wiring del onClick/Link."
```

## Feature 2 — Vista kanban de la posición

```
/opsx:propose "Crear la página de detalle de Position en frontend/src/components (vista kanban), renderizada solo como el contenido interno — asumir que el header/nav global y el footer ya envuelven la página, no agregarlos. El header muestra el título de la posición (en negrita) y una flecha/link para volver a /positions. Traer con fetch GET /position/:id/interviewflow para obtener positionName e interviewFlow.interviewSteps (columnas, ordenadas por orderIndex), y GET /position/:id/candidates para obtener los candidatos (cada uno con id, applicationId, fullName, currentInterviewStep — el nombre de la fase como string — y averageScore) ubicados como tarjeta bajo la columna cuyo nombre coincide con currentInterviewStep. Seguir el mockup del equipo de diseño exactamente: columnas del tablero gris claro con el nombre de la fase como cabecera en negrita; tarjetas blancas SIN borde visible, solo una sombra suave (sin línea de borde alrededor de la tarjeta); fullName del candidato en negrita arriba de la tarjeta; averageScore renderizado como exactamente tantos puntos verdes rellenos como el score (redondeado) — ej. score 3 renderiza exactamente 3 puntos, score 0 no renderiza ninguno — NO una barra de rating de tamaño fijo (sin relleno a 5 slots, sin puntos grises vacíos de placeholder después de los rellenos). Mantener id y applicationId en el estado aunque no se muestren, se necesitan para la actualización de fase por drag-and-drop en un cambio posterior. Mobile: las columnas se apilan verticalmente, ancho completo. Todavía sin drag-and-drop, solo layout estático. Antes de dar esto por terminado, sacar una captura real de la página renderizada y compararla lado a lado contra la imagen del mockup — no confiar solo en la inspección del DOM/clases."
```


## Feature 3 — Drag & drop para actualizar la fase

```
/opsx:propose "Agregar drag-and-drop a la vista kanban de Position: al arrastrar la tarjeta de un candidato a una columna distinta se llama a PUT /candidates/:id (id = candidate.id) con body { applicationId: candidate.applicationId, currentInterviewStep: <id de la fase de la columna destino> }, mueve la tarjeta a esa columna en el estado local si tiene éxito, y si falla mantiene/revierte la tarjeta a su columna original y muestra un error inline, sin perder la tarjeta."
```