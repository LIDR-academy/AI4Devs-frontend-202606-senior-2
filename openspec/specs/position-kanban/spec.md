# position-kanban Specification

## Purpose

Contrato del ejercicio original de LTI: contenido interno del detalle de una posición, con candidatos organizados por fase y arrastre persistente. Documentado a partir del enunciado facilitado y adaptado a las rutas reales del repositorio. El menú global y footer se asumen existentes; la búsqueda nueva no forma parte de este contrato.

## Requirements

### Requirement: OR-01 Navegación con identidad de posición
La aplicación SHALL abrir el detalle de la posición seleccionada por su ID real, mostrar su título y permitir volver al listado mediante una flecha a la izquierda del título.

#### Scenario: Abrir y regresar
- **WHEN** el usuario pulsa Ver proceso en una posición del listado
- **THEN** se abre /position/:id con el ID de esa posición y su título
- **AND** la flecha Volver a posiciones navega a /positions

### Requirement: OR-02 Fases del proceso
El tablero SHALL mostrar una columna por fase del proceso de la posición, ordenadas por orderIndex, incluidas las fases sin candidatos.

#### Scenario: Proceso cargado
- **WHEN** la API devuelve las fases del proceso
- **THEN** aparecen todas sus columnas con sus nombres en orden ascendente de orderIndex
- **AND** una columna vacía sigue disponible como destino de arrastre

### Requirement: OR-03 Tarjetas y puntuación
Cada tarjeta SHALL mostrar nombre completo y puntuación media del candidato y situarse en la fase de su candidatura para la posición seleccionada.

#### Scenario: Candidatos cargados
- **WHEN** la API devuelve candidatos con fullName, currentInterviewStep y averageScore
- **THEN** cada candidatura aparece en su fase con esos datos, incluida puntuación cero
- **AND** se conserva applicationId como identidad de la candidatura

### Requirement: OR-04 Cambio de fase persistente
El usuario SHALL poder mover una candidatura entre fases arrastrando su tarjeta, y la aplicación SHALL guardar la fase destino mediante la API.

#### Scenario: Movimiento guardado
- **WHEN** se suelta una tarjeta en otra fase y la API confirma el guardado
- **THEN** la tarjeta queda en la columna destino
- **AND** al recargar la aplicación conserva la fase guardada

#### Scenario: Cancelación
- **WHEN** se cancela el arrastre o se suelta en la misma fase
- **THEN** no se envía un cambio de fase a la API

### Requirement: OR-05 Adaptación móvil
En móvil el tablero SHALL disponer las fases verticalmente, ocupando el ancho disponible y sin desbordamiento horizontal del documento.

#### Scenario: Ancho de 375 píxeles
- **WHEN** se visualiza el tablero a 375 píxeles con un nombre largo
- **THEN** las fases se apilan verticalmente y el nombre se ajusta sin desbordar el documento

### Requirement: OR-06 Entrega revisable
La entrega SHALL identificar cambios de frontend, prompts utilizados y evidencia en una rama y PR revisables.

#### Scenario: Revisar el ejemplo docente
- **WHEN** se consulta la rama kanban-solved y el PR de referencia
- **THEN** se encuentra el código frontend y los prompts públicos en docs/sesion/prompts.md
- **AND** se explicita la adaptación docente de nombres de rama y ruta de prompts respecto de frontend-iniciales y prompts/prompts-iniciales.md del enunciado

## Adaptaciones y evidencia

El enunciado menciona GET /positions/:id/interviewFlow y PUT /candidates/:id/stage. El repositorio usa GET /position/:id/interviewflow (respuesta envuelta en interviewFlow), GET /position/:id/candidates y PUT /candidates/:id. Los candidatos reales incluyen id y applicationId, imprescindibles para actualizar correctamente una candidatura. No confundir los ejemplos de rutas con las rutas implementadas.

La página de posiciones presupuesta por el enunciado tenía datos fijos y controles sin lógica en esta base. La preparación docente conecta un listado real con IDs de API; filtros de posiciones quedan fuera de este ejercicio. La búsqueda de candidatos será el incremento nuevo.

OR-01/02/03/04: frontend/src/components/PositionKanbanDetail.test.tsx, Positions.test.tsx y frontend/e2e-app/kanban.spec.ts. OR-05: frontend/e2e/kanban.spec.ts y CSS. OR-06: PR #12 y docs/sesion/prompts.md. La prueba de aplicación demostró persistencia real local el 9 de septiembre; no equivale a revisión visual humana ni validación de producción.
