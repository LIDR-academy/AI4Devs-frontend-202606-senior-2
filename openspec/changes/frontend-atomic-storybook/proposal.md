## Why

El catálogo actual cubre el kanban, pero no permite revisar de forma aislada el dashboard, el listado de posiciones ni el alta de candidatos. Queremos un catálogo del frontend real, organizado por responsabilidades Atomic Design, con estados reproducibles sin backend.

## What Changes

- Incorporar las cuatro rutas existentes al catálogo por etapas: dashboard/posiciones, kanban y alta/upload.
- Reutilizar primitivas Bootstrap y moléculas existentes; extraer piezas solo cuando tengan un contrato de presentación comprobable.
- Separar llamadas HTTP de piezas visuales mediante servicios inyectables y callbacks conservando los servicios reales por defecto.
- Documentar props, estados, eventos y limitaciones en Storybook con fixtures ficticios deterministas.
- Mantener navegación, identidad de candidaturas, persistencia y diseño LTI; verificar la aplicación además del catálogo.
- Preparar evidencia visual para Chromatic y PR, con aceptación humana explícita.

## Capabilities

### New Capabilities
- `frontend-component-catalog`: catálogo navegable de los componentes y estados del frontend existente, aislado de servicios reales.

### Modified Capabilities

Ninguna. Se conserva el contrato de position-kanban. Este cambio no implementa búsqueda, nuevos filtros ni reglas de contratación.

## Impact

Frontend: RecruiterDashboard.js, Positions.tsx, PositionKanbanDetail.tsx, AddCandidateForm.js, FileUploader.js, sus componentes extraídos y stories, .storybook y pruebas. No modifica backend ni contratos HTTP. No cambia versiones de React, Bootstrap, Storybook ni framework de pruebas. El alcance completo se realiza por incrementos; no se pretende terminar todas las pantallas en el bloque de búsqueda de la clase.
